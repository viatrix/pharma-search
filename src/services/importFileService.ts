import {Connection, ConnectionOptions, createConnection, getConnection, DatabaseType, Repository} from "typeorm";
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
    console.log('init');
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
      } catch(err) {
        console.log(err);
        if (err.name !== "ConnectionNotFoundError") {
          throw err;
        }
      }
    }
    if (!this.connection) {
      this.connection = await createConnection(connectionOptions as ConnectionOptions);
    }
    console.log('Applicant');
    this.applicantsRepository = this.connection.getRepository(Applicant);
    console.log('DosageForm');
    this.dosageFormsRepository = this.connection.getRepository(DosageForm);
    console.log('Ingredient');
    this.ingredientsRepository = this.connection.getRepository(Ingredient);
    console.log('ProductIngredient');
    this.productIngredientsRepository = this.connection.getRepository(ProductIngredient);
    console.log('Product');
    this.productsRepository = this.connection.getRepository(Product);
    console.log('Route');
    this.routesRepository = this.connection.getRepository(Route);
  }

  public async clearDb() {
    await this.applicantsRepository.delete({});
    await this.dosageFormsRepository.delete({});
    await this.ingredientsRepository.delete({});
    await this.productIngredientsRepository.delete({});
    await this.productsRepository.delete({});
    await this.routesRepository.delete({});
  }

  public async parseFile(data: string) {
    const dataWithoutHeaders = data.slice(data.indexOf("\n") + 1);
    const lines = dataWithoutHeaders.split("\n");
    for (const line of lines) {
      const lineParts = line.split("~");
      if (lineParts.length !== 14) {
        throw new Error("File doesn't contain 14 columns separated by ~");
      }
      const ingredients = lineParts[0].split(";");
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
      const rld = lineParts[10] === "YES";
      const rs = lineParts[11] === "YES";
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
      const product: ProductType = {
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
      await this.saveToDb(product);
    }
  };

  private async saveToDb(product: ProductType) {
    console.log(product);
  }
}