import { importFile } from '../importFile';
import { SaveToDbService } from '../../services/saveToDbService';
import { S3Event } from 'aws-lambda';
import * as S3EventRecord from './mock/S3EventRecord.json';
import { PassThrough } from 'stream';
import { RetrieveFileContentsS3Service } from '../../services/retrieveFileContentsS3Service';
jest.mock('../../services/saveToDbService');
jest.mock('../../services/connectToDb', () => ({
  connectToDb: jest.fn(() => ({ close: jest.fn()}))
}));

describe('ImportFile', () => {
  it('should import file if there is 1 file in the event', async () => {
    // connectToDb.mockResolvedValue({close: jest.fn()});
    SaveToDbService.prototype.clearDb = jest.fn();
    const passThrough = new PassThrough();
    SaveToDbService.prototype.saveToDbStream = jest.fn(() => {
      return passThrough;
    });
    RetrieveFileContentsS3Service.prototype.createStream = jest.fn(() => {
      return Promise.resolve(new PassThrough());
    });
    const testEvent: S3Event = {
      Records: [S3EventRecord]
    };
    setTimeout(() => {
      console.log('finish');
      passThrough.emit('finish');
    }, 1);
    await importFile(testEvent as S3Event);
    expect(SaveToDbService.prototype.clearDb).toBeCalled();
    expect(SaveToDbService.prototype.saveToDbStream).toBeCalled();
  });

  it('should NOT import file if no files are in the event', async () => {
    SaveToDbService.prototype.clearDb = jest.fn();
    const testEvent: S3Event = {
      Records: []
    };
    await importFile(testEvent);
    expect(SaveToDbService.prototype.clearDb).not.toBeCalled();
  });

  it('should NOT import file if there is more than one file in the event', async () => {
    SaveToDbService.prototype.clearDb = jest.fn();
    const testEvent: S3Event = {
      Records: [S3EventRecord, S3EventRecord]
    };
    await importFile(testEvent);
    expect(SaveToDbService.prototype.clearDb).not.toBeCalled();
  });
});
