import "reflect-metadata";
import {createConnection} from "typeorm";

createConnection()
    .then(() => {
    console.log('success');
    // here you can start to work with your entities
}).catch(error => console.log(error));