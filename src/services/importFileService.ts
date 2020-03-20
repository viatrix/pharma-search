import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnection,
  DatabaseType,
  Repository
} from "typeorm";
import "reflect-metadata";
import {Access_types, Appl_types} from "../db/entity/products";
import {Applicant} from "../db/entity/applicants";
import {DosageForm} from "../db/entity/dosageForms";
import {Ingredient} from "../db/entity/ingredients";
import {ProductIngredient} from "../db/entity/productIngredients";
import {Product} from "../db/entity/products";
import {Route} from "../db/entity/routes";
import * as config from "../../config.json";
import "pg";

export type ProductType = {
  ingredients: string[];
  dosageForm: string;
  route: string;
  tradeName: string;
  applicant: string;
  strength: string[];
  appl_type: Appl_types;
  appl_no: number;
  product_no: number;
  te_code: string;
  approval_date: Date;
  rld: boolean;
  rs: boolean;
  access_type: Access_types;
  applicant_full_name: string;
};

export class ImportFileService {
  private connection: Connection;
  private applicantsRepository: Repository<Applicant>;
  private dosageFormsRepository: Repository<DosageForm>;
  private ingredientsRepository: Repository<Ingredient>;
  private productIngredientsRepository: Repository<ProductIngredient>;
  private productsRepository: Repository<Product>;
  private routesRepository: Repository<Route>;

  public async init() {
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
    if (!this.connection) {
      try {
        this.connection = getConnection();
      } catch(err) {
        console.info(err);
        if (err.name !== "ConnectionNotFoundError") {
          throw err;
        }
      }
    }
    if (!this.connection) {
      this.connection = await createConnection(connectionOptions as ConnectionOptions);
    }
    this.applicantsRepository = this.connection.getRepository(Applicant);
    this.dosageFormsRepository = this.connection.getRepository(DosageForm);
    this.ingredientsRepository = this.connection.getRepository(Ingredient);
    this.productIngredientsRepository = this.connection.getRepository(ProductIngredient);
    this.productsRepository = this.connection.getRepository(Product);
    this.routesRepository = this.connection.getRepository(Route);
  }

  public async clearDb() {
    await this.productIngredientsRepository.delete({});
    await this.productsRepository.delete({});
    await this.applicantsRepository.delete({});
    await this.dosageFormsRepository.delete({});
    await this.ingredientsRepository.delete({});
    await this.routesRepository.delete({});
  }

  public async parseFile(data: string) {
    const dataWithoutHeaders = data.slice(data.indexOf("\n") + 1);
    const lines = dataWithoutHeaders.split("\n");
    for (const line of lines) {
      const trimmedLine = line.replace("\n", "");
      if (trimmedLine.length) {
        const product = this.parseLine(trimmedLine);
        await this.saveToDb(product);
      }
    }
  };

  public parseLine(line: string): ProductType {
    const lineParts = line.split("~");
    if (lineParts.length !== 14) {
      throw new Error(`Line doesn't contain 14 columns separated by ~: ${line}`);
    }
    const ingredients = lineParts[0].split("; ");
    const dosageForm = lineParts[1].slice(0, lineParts[1].indexOf(";"));
    const route = lineParts[1].slice(lineParts[1].indexOf(";") + 1);
    const tradeName = lineParts[2];
    const applicant = lineParts[3];
    const strength = lineParts[4].split(";");
    const appl_type_string = lineParts[5];
    let appl_type: Appl_types;
    switch (appl_type_string) {
      case "N":
        appl_type = Appl_types.ORIGINAL;
        break;
      case "A":
        appl_type = Appl_types.GENERIC;
        break;
      default:
        throw new Error(`Invalid appl_type ${appl_type_string}`);
    }
    const appl_no = +lineParts[6];
    const product_no = +lineParts[7];
    const te_code = lineParts[8];
    const approval_date = new Date(lineParts[9]);
    const rld = lineParts[10] === "Yes";
    const rs = lineParts[11] === "Yes";
    const access_type_string = lineParts[12];
    let access_type: Access_types;
    switch (access_type_string) {
      case "RX":
        access_type = Access_types.RX;
        break;
      case "OTC":
        access_type = Access_types.OTC;
        break;
      case "DISCN":
        access_type = Access_types.DISCN;
        break;
      default:
        throw new Error(`Invalid access_type ${access_type_string}`);
    }
    const applicant_full_name = lineParts[13];
    const product = {
      ingredients,
      dosageForm,
      route,
      tradeName,
      applicant,
      strength,
      appl_type,
      appl_no,
      product_no,
      te_code,
      approval_date,
      rld,
      rs,
      access_type,
      applicant_full_name
    };
    return product;
  }

  public async saveToDb(product: ProductType) {
    console.info(product);
    if (product.ingredients.length !== product.strength.length) {
      throw new Error(`Incorrect list of ingredients and strength for ${product.tradeName}`);
    }
    let applicantEntry = await this.applicantsRepository.findOne(product.applicant);
    if (!applicantEntry) {
      applicantEntry = await this.applicantsRepository.save({
        applicant_short_name: product.applicant,
        applicant_full_name: product.applicant_full_name
      });
    }
    let dosageFormEntry = await this.dosageFormsRepository.findOne({where: {dosage_form: product.dosageForm}});
    if (!dosageFormEntry) {
      dosageFormEntry = await this.dosageFormsRepository.save({
        dosage_form: product.dosageForm
      });
    }
    let routeEntry = await this.routesRepository.findOne({where: {route: product.route}});
    if (!routeEntry) {
      routeEntry = await this.routesRepository.save({
        route: product.route
      });
    }
    const productEntry = await this.productsRepository.save({
      trade_name: product.tradeName,
      dosage_form: dosageFormEntry,
      route: routeEntry,
      applicant: applicantEntry,
      appl_type: product.appl_type,
      appl_no: product.appl_no,
      product_no: product.product_no,
      te_code: product.te_code,
      approval_date: product.approval_date,
      rld: product.rld,
      rs: product.rs,
      access_type: product.access_type,
    });
    for (let i = 0; i < product.ingredients.length; i++) {
      let ingredientEntry = await this.ingredientsRepository.findOne({where: {ingredient: product.ingredients[i]}});
      if (!ingredientEntry) {
        ingredientEntry = await this.ingredientsRepository.save({ingredient: product.ingredients[i]});
      }
      await this.productIngredientsRepository.save({
        product: productEntry,
        ingredient: ingredientEntry,
        strength: product.strength[i]
      })
    }
  }
}