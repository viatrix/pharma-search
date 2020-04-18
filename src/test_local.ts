import "reflect-metadata";
// import {createConnection} from "typeorm";
// import {Product} from "./server/db/entity/products";
import {RetrieveFileContentsS3Service} from "./server/services/retrieveFileContentsS3Service";
import { ParseLineStream } from './server/services/parseLineStream';
// import { SaveToDbService } from './server/services/saveToDbService';

console.log('init');

// createConnection()
//   .then(async (connection) => {
//     console.log('connected to db');
      // // const query = {
      // //     relations: ["route", "applicant", "dosageForm"],
      // //     where: {
      // //         tradeName: "ADVAIR HFA"
      // //     }
      // // };
      // // const productsRepository = connection.getRepository(Product);
      // // const result = await productsRepository.find(query);
      // await connection
      //     .getRepository(Product)
      //     .createQueryBuilder('product')
      //     // .leftJoinAndSelect("product.route", "route")
      //     // .leftJoinAndSelect("product.applicant", "applicant")
      //     // .leftJoinAndSelect("product.dosageForm", "dosageForm")
      //     .innerJoinAndSelect("product.productIngredients", "productIngredient")
      //     .innerJoinAndSelect("productIngredient.ingredient", "ingredient")
      //     .where("product.tradeName ILIKE '%' || :tradeName || '%'", { tradeName: "ADVAIR" })
      //     // .andWhere("ingred.ingredient ILIKE '%' || :ingredient || '%'", { ingredient: "" })
      //     .getMany();
      // console.log(result);
      // console.log(result[0].productIngredients);
    const retrieveFileContentsS3Service = new RetrieveFileContentsS3Service();
    const parseLineStream = new ParseLineStream();
    retrieveFileContentsS3Service.createStream('products.txt')
      .then((readCsvStream) => {
        console.info('Connected to the file from S3');
        readCsvStream
          .pipe(parseLineStream);
      });
    // const saveToDbService = new SaveToDbService();
    // await saveToDbService.init();
    // console.info('Connected to DB');
    // await saveToDbService.clearDb();
    // console.info('Cleared DB');

      // .pipe(saveToDbService.saveToDbStream());
    // console.info('Import was finished successfully');
  // }).catch(error => console.log(error));