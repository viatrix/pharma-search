import { search } from '../searchPage';
import { APIGatewayEvent } from 'aws-lambda';
import { SearchService } from '../../services/searchService';
import { Product } from '../../db/entity/products';
import { plainToClass } from 'class-transformer';
import * as drugListJson from './mock/drugList.json';

describe('SearchPage', () => {
  const event = {
    httpMethod: 'POST',
    body: 'tradename=&ingredient=venla'
  };

  beforeAll(() => {
    SearchService.prototype.init = jest.fn();
    SearchService.prototype.search = jest.fn(async () => {
      const drugList = plainToClass(Product, drugListJson);
      return Promise.resolve(drugList as Product[]);
    });
  });

  it('should render a page with data', async () => {
    expect(await search(event as APIGatewayEvent)).toMatchSnapshot();
  });
});
