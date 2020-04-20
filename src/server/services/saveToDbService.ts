import {
  Connection,
  Repository
} from 'typeorm';
import 'reflect-metadata';
import { AccessTypes, ApplTypes, Product } from '../db/entity/products';
import { Applicant } from '../db/entity/applicants';
import { DosageForm } from '../db/entity/dosageForms';
import { Ingredient } from '../db/entity/ingredients';
import { ProductIngredient } from '../db/entity/productIngredients';

import { Route } from '../db/entity/routes';
import 'pg';
import { Writable } from 'stream';

export type ProductType = {
  ingredients: string[]
  dosageForm: string
  route: string
  tradeName: string
  applicant: string
  strength: string[]
  applType: ApplTypes
  applNo: number
  productNo: number
  teCode: string
  approvalDate: Date
  rld: boolean
  rs: boolean
  accessType: AccessTypes
  applicantFullName: string
}

export class SaveToDbService {
  private connection: Connection;

  private applicantsRepository: Repository<Applicant>;

  private dosageFormsRepository: Repository<DosageForm>;

  private ingredientsRepository: Repository<Ingredient>;

  private productIngredientsRepository: Repository<ProductIngredient>;

  private productsRepository: Repository<Product>;

  private routesRepository: Repository<Route>;

  constructor(connection: Connection) {
    this.connection = connection;
    this.applicantsRepository = this.connection.getRepository(Applicant);
    this.dosageFormsRepository = this.connection.getRepository(DosageForm);
    this.ingredientsRepository = this.connection.getRepository(Ingredient);
    this.productIngredientsRepository = this.connection.getRepository(
      ProductIngredient
    );
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

  public saveToDbStream(): Writable {
    const outStream = new Writable({objectMode: true});
    outStream._write = (chunk, _encoding, callback: (error?: Error | null) => void) => {
      this.saveToDb(chunk).then(() => callback());
    };
    return outStream;
  }

  public async saveToDb (product: ProductType) {
    if (product.ingredients.length !== product.strength.length) {
      throw new Error(
        `Incorrect list of ingredients and strength for ${product.tradeName}`
      );
    }
    let applicantEntry = await this.applicantsRepository.findOne(
      product.applicant
    );
    if (!applicantEntry) {
      applicantEntry = await this.applicantsRepository.save({
        applicantShortName: product.applicant,
        applicantFullName: product.applicantFullName
      });
    }
    let dosageFormEntry = await this.dosageFormsRepository.findOne({
      where: { dosageForm: product.dosageForm }
    });
    if (!dosageFormEntry) {
      dosageFormEntry = await this.dosageFormsRepository.save({
        dosageForm: product.dosageForm
      });
    }
    let routeEntry = await this.routesRepository.findOne({
      where: { route: product.route }
    });
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
      let ingredientEntry = await this.ingredientsRepository.findOne({
        where: { ingredient: product.ingredients[i] }
      });
      if (!ingredientEntry) {
        ingredientEntry = await this.ingredientsRepository.save({
          ingredient: product.ingredients[i]
        });
      }
      await this.productIngredientsRepository.save({
        product: productEntry,
        ingredient: ingredientEntry,
        strength: product.strength[i]
      });
    }
  }
}
