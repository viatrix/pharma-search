import "reflect-metadata";
import {createConnection} from "typeorm";

console.log('init');
createConnection()
  .then(async (connection) => {
    console.log('connected to db');
    await connection.runMigrations();
    console.log('executed migrations');
    await connection.close();
  }).catch(error => console.log(error));