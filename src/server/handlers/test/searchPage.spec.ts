import { search } from '../searchPage';
import { APIGatewayEvent } from 'aws-lambda';
import { SearchService } from '../../services/searchService';
import { Product } from '../../db/entity/products';
import { plainToClass } from 'class-transformer';
import * as drugListJson from './mock/drugList.json';
import * as connectToDb from '../../services/connectToDb';
import { Connection, createConnection } from 'typeorm';
jest.mock('../../services/searchService');
jest.mock('../../services/connectToDb', () => ({
  connectToDb: jest.fn(() => ({ close: jest.fn()}))
}));

describe('SearchPage', () => {
  const event = {
    httpMethod: 'POST',
    body: 'tradename=&ingredient=venla'
  };

  beforeAll(() => {
    SearchService.prototype.search = jest.fn(async () => {
      const drugList = plainToClass(Product, drugListJson);
      return Promise.resolve(drugList as Product[]);
    });
    beforeAll(() => {
      const spy = jest.spyOn(connectToDb, 'connectToDb');
      spy.mockImplementation(async (): Promise<Connection>  => {
        console.log('mocked connection');
        const connection = await createConnection();
        console.log(connection.options);
        return connection;
      });
    });
  });

  it('should render a page with data', async () => {
    expect(await search(event as APIGatewayEvent)).toMatchSnapshot();
  });
});
