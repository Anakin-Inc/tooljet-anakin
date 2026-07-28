import { QueryError, QueryResult, QueryService } from '@tooljet-plugins/common';
import got from 'got';
import { SourceOptions, QueryOptions } from './types';

const BASE_URL = 'https://api.anakin.io/v1';

export default class Anakin implements QueryService {
  async run(sourceOptions: SourceOptions, queryOptions: QueryOptions): Promise<QueryResult> {
    if (!sourceOptions.api_key) {
      throw new QueryError('Query could not be completed as API key is not set', 'Missing API key', {});
    }

    const headers = {
      'X-API-Key': sourceOptions.api_key,
      'Content-Type': 'application/json',
    };

    try {
      let data: object;

      switch (queryOptions.operation) {
        case 'scrape_url': {
          const response = await got.post(`${BASE_URL}/url-scraper`, {
            headers,
            json: {
              url: queryOptions.url,
              generateJson: queryOptions.generate_json ?? false,
              country: queryOptions.country ?? 'us',
              useBrowser: queryOptions.use_browser ?? false,
              forceFresh: queryOptions.force_fresh ?? false,
            },
            responseType: 'json',
          });
          data = response.body as object;
          break;
        }
        case 'get_scrape_result': {
          const response = await got.get(`${BASE_URL}/url-scraper/${queryOptions.job_id}`, {
            headers,
            responseType: 'json',
          });
          data = response.body as object;
          break;
        }
        case 'search': {
          const response = await got.post(`${BASE_URL}/search`, {
            headers,
            json: {
              prompt: queryOptions.prompt,
              limit: queryOptions.limit ?? 5,
            },
            responseType: 'json',
          });
          data = response.body as object;
          break;
        }
        case 'agentic_search': {
          const body: Record<string, unknown> = {
            prompt: queryOptions.prompt,
            useBrowser: queryOptions.use_browser ?? true,
          };
          if (queryOptions.schema) {
            body.schema = queryOptions.schema;
          }
          const response = await got.post(`${BASE_URL}/agentic-search`, {
            headers,
            json: body,
            responseType: 'json',
          });
          data = response.body as object;
          break;
        }
        case 'get_agentic_search_result': {
          const response = await got.get(`${BASE_URL}/agentic-search/${queryOptions.job_id}`, {
            headers,
            responseType: 'json',
          });
          data = response.body as object;
          break;
        }
        default:
          throw new QueryError(`Unknown operation: ${queryOptions.operation}`, 'Invalid operation', {});
      }

      return {
        status: 'ok',
        data,
      };
    } catch (error: any) {
      if (error instanceof QueryError) {
        throw error;
      }
      throw new QueryError('Query could not be completed', error.message, {});
    }
  }

  async testConnection(sourceOptions: SourceOptions): Promise<object> {
    if (!sourceOptions.api_key) {
      throw new QueryError('Could not connect to Anakin', 'Missing API key', {});
    }
    // No free/no-credit endpoint exists to test against without spending
    // credits — same reasoning as the Botpress and Activepieces
    // integrations elsewhere in this codebase. A minimal real call: search
    // with limit 1 (3 credits), matching Activepieces' validate() choice.
    try {
      await got.post(`${BASE_URL}/search`, {
        headers: { 'X-API-Key': sourceOptions.api_key, 'Content-Type': 'application/json' },
        json: { prompt: 'anakin api key validation', limit: 1 },
        responseType: 'json',
      });
      return { status: 'ok' };
    } catch (error: any) {
      throw new QueryError('Could not connect to Anakin', error.message, {});
    }
  }
}
