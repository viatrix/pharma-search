import {S3Event, S3Handler} from 'aws-lambda';
import 'source-map-support/register';

export const importFile: S3Handler = async (event, _context) => {
  if (!validateEvent(event)) {
    return;
  }
  console.info(`File import is triggered for the file ${event.Records[0].s3.object.key}`);

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
