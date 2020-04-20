import 'reflect-metadata';
import * as config from '../../../config.json';
import {S3} from "aws-sdk";
import * as awsConfig from "../../../awsConfig.json";
import * as stream from "stream";
import * as csv from 'csv-parser';

export class RetrieveFileContentsS3Service {
  public async createStream (key: string): Promise<stream.Readable> {
    const s3 = new S3({
      region: awsConfig.region,
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey
    });
    const readStream = await s3
        .getObject({
          Bucket: config.s3.bucket,
          Key: key
        })
        .createReadStream()
        .pipe(csv({ separator: '~' }));
    return readStream;
  }
}
