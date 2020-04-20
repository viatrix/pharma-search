import * as ejs from 'ejs';
import * as fs from 'fs';
import * as querystring from 'querystring';
import { APIGatewayEvent } from 'aws-lambda';
import { SearchService } from '../services/searchService';
import * as path from 'path';
import { connectToDb } from '../services/connectToDb';

export const search = async (event: APIGatewayEvent) => {
  console.log(event);
  let drugList = null;
  if (event.httpMethod === 'POST' && event.body !== null) {
    const parsedBody = querystring.parse(event.body as string);
    const connection = await connectToDb();
    console.info('Created a DB connection');
    const searchService = new SearchService(connection);
    drugList = await searchService.search(parsedBody);
    await connection.close();
  }
  const htmlContent = fs.readFileSync(
    path.join(__dirname, '/../../client/searchPage.ejs'),
    'utf8'
  );
  const response = {
    statusCode: 200,
    headers: {
      'Content-type': 'text/html'
    },
    body: ejs.render(htmlContent, { drugList })
  };
  return response;
};
