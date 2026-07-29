import { ConnectionTestResult, QueryError, QueryResult, QueryService } from '@tooljet-plugins/common';
import got from 'got';
import { SourceOptions, QueryOptions } from './types';

const BASE_URL = 'https://api.anakin.io/v1';

/** Build a query string, dropping undefined/empty values (mirrors the API client used elsewhere in Anakin's SDKs). */
function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

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
        // ── Web scraping ──────────────────────────────────────────────────
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

        // ── Site mapping ─────────────────────────────────────────────────
        case 'map': {
          const body: Record<string, unknown> = {
            url: queryOptions.url,
            limit: queryOptions.limit ?? 100,
            depth: queryOptions.depth ?? 2,
            limitPerLevel: queryOptions.limit_per_level ?? 100,
            includeSubdomains: queryOptions.include_subdomains ?? false,
            includeExternalLinks: queryOptions.include_external_links ?? false,
            useBrowser: queryOptions.use_browser ?? false,
          };
          if (queryOptions.search !== undefined) body.search = queryOptions.search;
          const response = await got.post(`${BASE_URL}/map`, { headers, json: body, responseType: 'json' });
          data = response.body as object;
          break;
        }
        case 'get_map_result': {
          const response = await got.get(`${BASE_URL}/map/${queryOptions.job_id}`, {
            headers,
            responseType: 'json',
          });
          data = response.body as object;
          break;
        }

        // ── Site crawling ────────────────────────────────────────────────
        case 'crawl': {
          const body: Record<string, unknown> = {
            url: queryOptions.url,
            maxPages: queryOptions.max_pages ?? 10,
            depth: queryOptions.depth ?? 1,
            country: queryOptions.country ?? 'us',
            useBrowser: queryOptions.use_browser ?? false,
          };
          if (queryOptions.include_patterns) body.includePatterns = queryOptions.include_patterns;
          if (queryOptions.exclude_patterns) body.excludePatterns = queryOptions.exclude_patterns;
          if (queryOptions.session_id !== undefined) body.sessionId = queryOptions.session_id;
          if (queryOptions.session_name !== undefined) body.sessionName = queryOptions.session_name;
          const response = await got.post(`${BASE_URL}/crawl`, { headers, json: body, responseType: 'json' });
          data = response.body as object;
          break;
        }
        case 'get_crawl_result': {
          const response = await got.get(`${BASE_URL}/crawl/${queryOptions.job_id}`, {
            headers,
            responseType: 'json',
          });
          data = response.body as object;
          break;
        }

        // ── AI search ────────────────────────────────────────────────────
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

        // ── Wire: discovery ──────────────────────────────────────────────
        case 'wire_discover': {
          const qs = buildQuery({ q: queryOptions.q, limit: queryOptions.limit });
          const response = await got.get(`${BASE_URL}/wire/resolve${qs}`, { headers, responseType: 'json' });
          data = response.body as object;
          break;
        }
        case 'wire_catalog': {
          const path = queryOptions.slug ? `/wire/catalog/${encodeURIComponent(queryOptions.slug)}` : '/wire/catalog';
          const response = await got.get(`${BASE_URL}${path}`, { headers, responseType: 'json' });
          data = response.body as object;
          break;
        }

        // ── Wire: execution ──────────────────────────────────────────────
        case 'wire_read_action':
        case 'wire_write_action': {
          const body: Record<string, unknown> = { action_id: queryOptions.action_id };
          if (queryOptions.params && Object.keys(queryOptions.params).length > 0) body.params = queryOptions.params;
          if (queryOptions.credential_id !== undefined) body.credential_id = queryOptions.credential_id;
          if (queryOptions.identity_id !== undefined) body.identity_id = queryOptions.identity_id;
          const response = await got.post(`${BASE_URL}/wire/task`, { headers, json: body, responseType: 'json' });
          data = response.body as object;
          break;
        }
        case 'get_wire_job_result': {
          const response = await got.get(`${BASE_URL}/wire/jobs/${queryOptions.job_id}`, {
            headers,
            responseType: 'json',
          });
          data = response.body as object;
          break;
        }

        // ── Wire: identities & credentials ───────────────────────────────
        case 'wire_identities': {
          const qs = buildQuery({ catalog_id: queryOptions.catalog_id });
          const response = await got.get(`${BASE_URL}/wire/identities${qs}`, { headers, responseType: 'json' });
          data = response.body as object;
          break;
        }
        case 'wire_login': {
          const body: Record<string, unknown> = { catalog_slug: queryOptions.catalog_slug };
          if (queryOptions.params && Object.keys(queryOptions.params).length > 0) body.params = queryOptions.params;
          if (queryOptions.identity_name !== undefined) body.identity_name = queryOptions.identity_name;
          if (queryOptions.source_id !== undefined) body.source_id = queryOptions.source_id;
          if (queryOptions.source_ref !== undefined) body.source_ref = queryOptions.source_ref;
          const response = await got.post(`${BASE_URL}/wire/login`, { headers, json: body, responseType: 'json' });
          data = response.body as object;
          break;
        }

        // ── Wire: build ───────────────────────────────────────────────────
        case 'wire_build': {
          const body: Record<string, unknown> = {
            website_url: queryOptions.website_url,
            goal: queryOptions.goal,
          };
          if (queryOptions.catalog_id !== undefined) body.catalog_id = queryOptions.catalog_id;
          if (queryOptions.visibility !== undefined) body.visibility = queryOptions.visibility;
          if (queryOptions.force !== undefined) body.force = queryOptions.force;
          const response = await got.post(`${BASE_URL}/wire/build-request`, {
            headers,
            json: body,
            responseType: 'json',
          });
          data = response.body as object;
          break;
        }

        // ── Website monitoring ───────────────────────────────────────────
        case 'monitor_create': {
          const body: Record<string, unknown> = {
            url: queryOptions.url,
            intervalMinutes: queryOptions.interval_minutes,
          };
          if (queryOptions.scope !== undefined) body.scope = queryOptions.scope;
          if (queryOptions.watch_mode !== undefined) body.watchMode = queryOptions.watch_mode;
          if (queryOptions.watch_format !== undefined) body.watchFormat = queryOptions.watch_format;
          if (queryOptions.output_schema !== undefined) body.outputSchema = queryOptions.output_schema;
          if (queryOptions.ai_mode !== undefined) body.aiMode = queryOptions.ai_mode;
          if (queryOptions.ai_goal !== undefined) body.aiGoal = queryOptions.ai_goal;
          if (queryOptions.use_browser !== undefined) body.useBrowser = queryOptions.use_browser;
          if (queryOptions.country !== undefined) body.country = queryOptions.country;
          if (queryOptions.session_id !== undefined) body.sessionId = queryOptions.session_id;
          if (queryOptions.is_active !== undefined) body.isActive = queryOptions.is_active;
          if (queryOptions.expires_at !== undefined) body.expiresAt = queryOptions.expires_at;
          if (queryOptions.alert_webhook_url !== undefined) body.alertWebhookUrl = queryOptions.alert_webhook_url;
          if (queryOptions.alert_emails !== undefined) body.alertEmails = queryOptions.alert_emails;
          if (queryOptions.max_pages !== undefined) body.maxPages = queryOptions.max_pages;
          if (queryOptions.max_depth !== undefined) body.maxDepth = queryOptions.max_depth;
          if (queryOptions.include_patterns !== undefined) body.includePatterns = queryOptions.include_patterns;
          if (queryOptions.exclude_patterns !== undefined) body.excludePatterns = queryOptions.exclude_patterns;
          if (queryOptions.wire_action_id !== undefined) body.wireActionId = queryOptions.wire_action_id;
          if (queryOptions.wire_catalog_slug !== undefined) body.wireCatalogSlug = queryOptions.wire_catalog_slug;
          if (queryOptions.wire_credential_id !== undefined) body.wireCredentialId = queryOptions.wire_credential_id;
          if (queryOptions.wire_params !== undefined) body.wireParams = queryOptions.wire_params;
          if (queryOptions.wire_watch_paths !== undefined) body.wireWatchPaths = queryOptions.wire_watch_paths;
          const response = await got.post(`${BASE_URL}/monitors`, { headers, json: body, responseType: 'json' });
          data = response.body as object;
          break;
        }
        case 'monitor_list': {
          const path = queryOptions.id ? `/monitors/${encodeURIComponent(queryOptions.id)}` : '/monitors';
          const response = await got.get(`${BASE_URL}${path}`, { headers, responseType: 'json' });
          data = response.body as object;
          break;
        }
        case 'monitor_changes': {
          const response = await got.get(`${BASE_URL}/monitors/${encodeURIComponent(String(queryOptions.id))}/changes`, {
            headers,
            responseType: 'json',
          });
          data = response.body as object;
          break;
        }
        case 'monitor_control': {
          const base = `${BASE_URL}/monitors/${encodeURIComponent(String(queryOptions.id))}`;
          let response;
          switch (queryOptions.action) {
            case 'pause':
              response = await got.post(`${base}/pause`, { headers, responseType: 'json' });
              break;
            case 'resume':
              response = await got.post(`${base}/resume`, { headers, responseType: 'json' });
              break;
            case 'run_now':
              response = await got.post(`${base}/run`, { headers, responseType: 'json' });
              break;
            case 'delete':
              response = await got.delete(base, { headers, responseType: 'json' });
              break;
            default:
              throw new QueryError(`Unknown monitor action: ${queryOptions.action}`, 'Invalid action', {});
          }
          data = response.body as object;
          break;
        }

        // ── AI visibility ─────────────────────────────────────────────────
        case 'ai_visibility_search': {
          const body: Record<string, unknown> = { query: queryOptions.query };
          if (queryOptions.sources !== undefined) body.sources = queryOptions.sources;
          if (queryOptions.country !== undefined) body.country = queryOptions.country;
          const response = await got.post(`${BASE_URL}/ai-visibility/search`, {
            headers,
            json: body,
            responseType: 'json',
          });
          data = response.body as object;
          break;
        }
        case 'get_ai_visibility_result': {
          const response = await got.get(
            `${BASE_URL}/ai-visibility/search/${encodeURIComponent(String(queryOptions.search_id))}`,
            { headers, responseType: 'json' }
          );
          data = response.body as object;
          break;
        }
        case 'ai_visibility_sources': {
          const response = await got.get(`${BASE_URL}/ai-visibility/sources`, { headers, responseType: 'json' });
          data = response.body as object;
          break;
        }

        // ── Browser sessions ─────────────────────────────────────────────
        case 'session_list': {
          const qs = buildQuery({ domain: queryOptions.domain });
          const response = await got.get(`${BASE_URL}/sessions${qs}`, { headers, responseType: 'json' });
          data = response.body as object;
          break;
        }
        case 'session_delete': {
          const response = await got.delete(`${BASE_URL}/sessions/${encodeURIComponent(String(queryOptions.id))}`, {
            headers,
            responseType: 'json',
          });
          data = response.body as object;
          break;
        }

        // ── AI browser automation ────────────────────────────────────────
        case 'browser_task': {
          const body: Record<string, unknown> = { prompt: queryOptions.prompt, async: true };
          if (queryOptions.url !== undefined) body.url = queryOptions.url;
          if (queryOptions.session_id !== undefined) body.session_id = queryOptions.session_id;
          if (queryOptions.max_steps !== undefined) body.max_steps = queryOptions.max_steps;
          if (queryOptions.timeout_ms !== undefined) body.timeout_ms = queryOptions.timeout_ms;
          if (queryOptions.output_schema !== undefined) body.output_schema = queryOptions.output_schema;
          const response = await got.post(`${BASE_URL}/ai/evaluate`, { headers, json: body, responseType: 'json' });
          data = response.body as object;
          break;
        }
        case 'get_browser_task_result': {
          const response = await got.get(`${BASE_URL}/ai/jobs/${encodeURIComponent(String(queryOptions.job_id))}`, {
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

  async testConnection(sourceOptions: SourceOptions): Promise<ConnectionTestResult> {
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
