import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnection,
  DatabaseType,
  Repository
} from 'typeorm';
import 'reflect-metadata';
import { AccessTypes, ApplTypes, Product } from '../db/entity/products';
import { Applicant } from '../db/entity/applicants';
import { DosageForm } from '../db/entity/dosageForms';
import { Ingredient } from '../db/entity/ingredients';
import { ProductIngredient } from '../db/entity/productIngredients';

import { Route } from '../db/entity/routes';
import * as config from '../../config.json';
import 'pg';

export type ProductType = {
  ingredients: string[];
  dosageForm: string;
  route: string;
  tradeName: string;
  applicant: string;
  strength: string[];
  applType: ApplTypes;
  applNo: number;
  productNo: number;
  teCode: string;
  approvalDate: Date;
  rld: boolean;
  rs: boolean;
  accessType: AccessTypes;
  applicantFullName: string;
};

export class ImportFileService {
  private connection: Connection;

  private applicantsRepository: Repository<Applicant>;

  private dosageFormsRepository: Repository<DosageForm>;

  private ingredientsRepository: Repository<Ingredient>;

  private productIngredientsRepository: Repository<ProductIngredient>;

  private productsRepository: Repository<Product>;

  private routesRepository: Repository<Route>;

  public async init () {
    const connectionOptions = {
      type: config.typeorm.type as DatabaseType,
      port: config.typeorm.port,
      host: process.env.TYPEORM_HOST,
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      synchronize: config.typeorm.synchronize,
      logging: config.typeorm.logging,
      entities: config.typeorm.entities,
      migrations: config.typeorm.migrations,
      subscribers: config.typeorm.subscribers
    };
    console.log(connectionOptions);
    if (!this.connection) {
      try {
        this.connection = getConnection();
      } catch (err) {
        if (err.name === 'ConnectionNotFoundError') {
          console.info('Connection did not exist');
        } else {
          throw err;
        }
      }
    }
    if (!this.connection) {
      this.connection = await createConnection(connectionOptions as ConnectionOptions);
      console.info('Created a DB connection');
    }
    this.applicantsRepository = this.connection.getRepository(Applicant);
    this.dosageFormsRepository = this.connection.getRepository(DosageForm);
    this.ingredientsRepository = this.connection.getRepository(Ingredient);
    this.productIngredientsRepository = this.connection.getRepository(ProductIngredient);
    this.productsRepository = this.connection.getRepository(Product);
    this.routesRepository = this.connection.getRepository(Route);
  }

  public async clearDb () {
    await this.productIngredientsRepository.delete({});
    await this.productsRepository.delete({});
    await this.applicantsRepository.delete({});
    await this.dosageFormsRepository.delete({});
    await this.ingredientsRepository.delete({});
    await this.routesRepository.delete({});
  }

  public async parseFile (data: string) {
    const dataWithoutHeaders = data.slice(data.indexOf('\n') + 1);
    const lines = dataWithoutHeaders.split('\n');
    for (const line of lines) {
      const trimmedLine = line.replace('\n', '');
      if (trimmedLine.length) {
        try {
          const product = this.parseLine(trimmedLine);
          await this.saveToDb(product);
        } catch (error) {
          if (error.name === 'InconsistentIngredientsStrength') {
            console.error(`Incorrect list of ingredients and strength in line ${trimmedLine}`);
          } else {
            throw error;
          }
        }
      }
    }
  }

  public parseLine (line: string): ProductType {
    const FEDERAL_NOTE = ' **Federal Register determination that product was not discontinued or withdrawn for safety or efficacy reasons**';
    const lineParts = line.split('~');
    if (lineParts.length !== 14) {
      throw new Error(`Line doesn't contain 14 columns separated by ~: ${line}`);
    }
    const rawIngredients = lineParts[0];
    let ingredients: string[];
    if (rawIngredients.includes(' (')) {
      const basicIngredients = rawIngredients.slice(rawIngredients.indexOf(' (') + 2, rawIngredients.indexOf(')'));
      ingredients = basicIngredients.split(';');
    } else {
      ingredients = rawIngredients.split('; ');
    }
    const dosageForm = lineParts[1].slice(0, lineParts[1].indexOf(';'));
    const route = lineParts[1].slice(lineParts[1].indexOf(';') + 1);
    const tradeName = lineParts[2];
    const applicant = lineParts[3];
    let rawStrength = lineParts[4];
    if (rawStrength.includes(FEDERAL_NOTE)) {
      rawStrength = rawStrength.slice(0, rawStrength.indexOf(FEDERAL_NOTE));
    }
    let strength = rawStrength.split(';');
    let balanced = true;
    for (let i = 0; i < strength.length; i++) {
      if (!this.bracketsBalanced(strength[i])) {
        balanced = false;
      }
    }
    if (!balanced) {
      rawStrength = rawStrength.slice(rawStrength.indexOf(' (') + 2, rawStrength.indexOf(')'));
      strength = rawStrength.split(';');
    }
    if (strength.length !== ingredients.length) {
      const err = new Error(`Incorrect list of ingredients and strength for ${tradeName}`);
      err.name = 'InconsistentIngredientsStrength';
      throw err;
    }
    const applTypeString = lineParts[5];
    let applType: ApplTypes;
    switch (applTypeString) {
      case 'N':
        applType = ApplTypes.ORIGINAL;
        break;
      case 'A':
        applType = ApplTypes.GENERIC;
        break;
      default:
        throw new Error(`Invalid appl_type ${applTypeString}`);
    }
    const applNo = +lineParts[6];
    const productNo = +lineParts[7];
    const teCode = lineParts[8];
    const approvalDate = new Date(lineParts[9]);
    const rld = lineParts[10] === 'Yes';
    const rs = lineParts[11] === 'Yes';
    const accessTypeString = lineParts[12];
    let accessType: AccessTypes;
    switch (accessTypeString) {
      case 'RX':
        accessType = AccessTypes.RX;
        break;
      case 'OTC':
        accessType = AccessTypes.OTC;
        break;
      case 'DISCN':
        accessType = AccessTypes.DISCN;
        break;
      default:
        throw new Error(`Invalid access_type ${accessTypeString}`);
    }
    const applicantFullName = lineParts[13];
    return {
      ingredients,
      dosageForm,
      route,
      tradeName,
      applicant,
      strength,
      applType,
      applNo,
      productNo,
      teCode,
      approvalDate,
      rld,
      rs,
      accessType,
      applicantFullName
    };
  }

  public bracketsBalanced (line: string): boolean {
    let balanced = 0;
    for (let i = 0; i < line.length; i++) {
      switch (line[i]) {
        case '(':
          balanced += 1;
          break;
        case ')':
          balanced -= 1;
      }
    }
    return balanced === 0;
  }

  public async saveToDb (product: ProductType) {
    if (product.ingredients.length !== product.strength.length) {
      throw new Error(`Incorrect list of ingredients and strength for ${product.tradeName}`);
    }
    let applicantEntry = await this.applicantsRepository.findOne(product.applicant);
    if (!applicantEntry) {
      applicantEntry = await this.applicantsRepository.save({
        applicantShortName: product.applicant,
        applicantFullName: product.applicantFullName
      });
    }
    let dosageFormEntry = await this.dosageFormsRepository.findOne({ where: { dosageForm: product.dosageForm } });
    if (!dosageFormEntry) {
      dosageFormEntry = await this.dosageFormsRepository.save({
        dosageForm: product.dosageForm
      });
    }
    let routeEntry = await this.routesRepository.findOne({ where: { route: product.route } });
    if (!routeEntry) {
      routeEntry = await this.routesRepository.save({
        route: product.route
      });
    }
    const productEntry = await this.productsRepository.save({
      tradeName: product.tradeName,
      dosageForm: dosageFormEntry,
      route: routeEntry,
      applicant: applicantEntry,
      applType: product.applType,
      applNo: product.applNo,
      productNo: product.productNo,
      teCode: product.teCode,
      approvalDate: product.approvalDate,
      rld: product.rld,
      rs: product.rs,
      accessType: product.accessType
    });
    for (let i = 0; i < product.ingredients.length; i++) {
      let ingredientEntry = await this.ingredientsRepository.findOne({ where: { ingredient: product.ingredients[i] } });
      if (!ingredientEntry) {
        ingredientEntry = await this.ingredientsRepository.save({ ingredient: product.ingredients[i] });
      }
      await this.productIngredientsRepository.save({
        product: productEntry,
        ingredient: ingredientEntry,
        strength: product.strength[i]
      });
    }
  }
}
