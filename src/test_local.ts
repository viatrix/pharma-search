import "reflect-metadata";
import {createConnection} from "typeorm";
import {Product} from "./server/db/entity/products";

console.log('init');
createConnection()
  .then(async (connection) => {
    console.log('connected to db');
      // const query = {
      //     relations: ["route", "applicant", "dosageForm"],
      //     where: {
      //         tradeName: "ADVAIR HFA"
      //     }
      // };
      // const productsRepository = connection.getRepository(Product);
      // const result = await productsRepository.find(query);
      const result = await connection
          .getRepository(Product)
          .createQueryBuilder('product')
          // .leftJoinAndSelect("product.route", "route")
          // .leftJoinAndSelect("product.applicant", "applicant")
          // .leftJoinAndSelect("product.dosageForm", "dosageForm")
          .innerJoinAndSelect("product.productIngredients", "productIngredient")
          .innerJoinAndSelect("productIngredient.ingredient", "ingredient")
          .where("product.tradeName ILIKE '%' || :tradeName || '%'", { tradeName: "ADVAIR" })
          // .andWhere("ingred.ingredient ILIKE '%' || :ingredient || '%'", { ingredient: "" })
          .getMany();
      console.log(result);
      console.log(result[0].productIngredients);
      await connection.close();
  }).catch(error => console.log(error));