import "reflect-metadata";
import {createConnection} from "typeorm";

console.log('init');
createConnection()
  .then((connection) => {
    console.log('success');

    // here you can start to work with your entities
    console.log(connection.entityMetadatas);
  }).catch(error => console.log(error));