import { S3Event } from 'aws-lambda';
import 'source-map-support/register';
import { SaveToDbService } from '../services/saveToDbService';
import {RetrieveFileContentsS3Service} from "../services/retrieveFileContentsS3Service";
import {ParseLineStream} from "../services/parseLineStream";
import {connectToDb} from '../services/connectToDb';

export const importFile = async (event: S3Event) => {
  if (!validateEvent(event)) {
    return;
  }
  const { key } = event.Records[0].s3.object;
  console.info(`File import is triggered for the file ${key}`);

  const retrieveFileContentsS3Service = new RetrieveFileContentsS3Service();
  const readCsvStream = await retrieveFileContentsS3Service.createStream(key);
  console.info('Connected to the file from S3');
  const parseLineStream = new ParseLineStream();

  const connection = await connectToDb();
  console.info('Created a DB connection');

  const saveToDbService = new SaveToDbService(connection);
  console.info('Connected to DB');
  await saveToDbService.clearDb();
  console.info('Cleared DB');
  await new Promise((resolve) => {
    const writeStream = saveToDbService.saveToDbStream();
    writeStream.on('finish', () => {
      console.info('Import was finished successfully');
      resolve();
    });
    readCsvStream
      .pipe(parseLineStream)
      .pipe(writeStream);
  });
  await connection.close();
};

const validateEvent = (event: S3Event): boolean => {
  if (!event.Records || event.Records.length === 0) {
    console.error('Error! No files are uploaded');
    return false;
  }
  if (event.Records.length > 1) {
    console.error('Error! More than one file is uploaded');
    return false;
  }
  return true;
};
