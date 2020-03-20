import {S3Event, S3Handler} from 'aws-lambda';
import {S3} from "aws-sdk";
import 'source-map-support/register';
import * as config from "../../config.json";
import * as aws_config from "../../aws_config.json";
import {ImportFileService} from "../services/importFileService";

export const importFile: S3Handler = async (event, _context) => {
  if (!validateEvent(event)) {
    return;
  }
  const key = event.Records[0].s3.object.key;
  console.info(`File import is triggered for the file ${key}`);

  const data = await getFileContents(key);
  console.info("Retrieved file from S3");
  const importFileService = new ImportFileService();
  await importFileService.init();
  console.info("Connected to DB");
  await importFileService.clearDb();
  console.info("Cleared DB");
  await importFileService.parseFile(data);
};

export const validateEvent = (event: S3Event): boolean => {
  if (!event.Records || event.Records.length === 0) {
    console.error(`Error! No files are uploaded`);
    return false;
  }
  if (event.Records.length > 1) {
    console.error(`Error! More than one file is uploaded`);
    return false;
  }
  return true;
};

export const getFileContents = async (key: string): Promise<string> => {
  const s3 = new S3({
    region: aws_config.region,
    accessKeyId: aws_config.accessKeyId,
    secretAccessKey: aws_config.secretAccessKey
  });
  const result = await s3.getObject({
    Bucket: config.s3.bucket,
    Key: key
  }).promise();
  const contents = result.Body;
  if (!contents) {
    throw new Error("File contents was not retrieved");
  }
  return contents.toString();
};
