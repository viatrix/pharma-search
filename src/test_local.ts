import "reflect-metadata";
import {createConnection} from "typeorm";
// import {Product} from "./server/db/entity/products";
// import {RetrieveFileContentsS3Service} from "./server/services/retrieveFileContentsS3Service";
// import { ParseLineStream } from './server/services/parseLineStream';
// import { SaveToDbService } from './server/services/saveToDbService';

console.log('init');

createConnection()
  .then(async (connection) => {
    console.log('connected to db');
    console.log(connection.options);
}).catch(error => console.log(error));