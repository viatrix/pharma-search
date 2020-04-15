import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnection,
  DatabaseType,
  Repository
} from 'typeorm';
import 'reflect-metadata';
import { Product } from '../db/entity/products';
import * as config from '../../config.json';
import 'pg';
import { ParsedUrlQuery } from 'querystring';

export class SearchService {
  private connection: Connection;
  private productsRepository: Repository<Product>;

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
    this.productsRepository = this.connection.getRepository(Product);
  }

  public async search (searchParams: ParsedUrlQuery): Promise<Product[]> {
    console.log(searchParams);
    const { tradename, ingredient } = searchParams;
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.route', 'route')
      .leftJoinAndSelect('product.applicant', 'applicant')
      .leftJoinAndSelect('product.dosageForm', 'dosageForm')
      .innerJoinAndSelect('product.productIngredients', 'productIngredient')
      .innerJoinAndSelect('productIngredient.ingredient', 'ingredient')
      .where("product.tradeName ILIKE :tradename || '%'", { tradename })
      .andWhere("ingredient.ingredient ILIKE :ingredient || '%'", { ingredient })
      .getMany();
    return result;
  }
}
