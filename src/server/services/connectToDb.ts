import {
  Connection, ConnectionOptions, createConnection, DatabaseType,
} from 'typeorm';
import 'reflect-metadata';
import * as config from '../../../config.json';
export async function connectToDb(): Promise<Connection> {
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
  return createConnection(
    connectionOptions as ConnectionOptions
  );
};
