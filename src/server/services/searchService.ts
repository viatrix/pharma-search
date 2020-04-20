import {
  Connection,
  Repository
} from 'typeorm';
import 'reflect-metadata';
import { Product } from '../db/entity/products';
import 'pg';
import { ParsedUrlQuery } from 'querystring';

export class SearchService {
  private connection: Connection
  private productsRepository: Repository<Product>

  constructor (connection: Connection) {
    this.connection = connection;
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
      .andWhere("ingredient.ingredient ILIKE :ingredient || '%'", {
        ingredient
      })
      .getMany();
    return result;
  }
}
