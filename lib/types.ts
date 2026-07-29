export type SourceOptions = {
  api_key: string;
};

export type QueryOptions = {
  operation: string;

  // Extract Website Data / Get Scrape Result
  url?: string;
  generate_json?: boolean;
  country?: string;
  use_browser?: boolean;
  force_fresh?: boolean;
  job_id?: string;
  session_id?: string;
  session_name?: string;

  // Perform AI Search / Start Agentic Search / Get Agentic Search Result
  prompt?: string;
  limit?: number;
  schema?: Record<string, unknown>;

  // Map a Site / Get Map Result
  depth?: number;
  limit_per_level?: number;
  include_subdomains?: boolean;
  include_external_links?: boolean;
  search?: string;

  // Crawl a Site / Get Crawl Result
  max_pages?: number;
  include_patterns?: string[];
  exclude_patterns?: string[];

  // Wire: discovery
  q?: string;
  slug?: string;

  // Wire: execution (Run Wire Read/Write Action, Get Wire Job Result)
  action_id?: string;
  params?: Record<string, unknown>;
  credential_id?: string;
  identity_id?: string;

  // Wire: identities & login
  catalog_id?: string;
  catalog_slug?: string;
  identity_name?: string;
  source_id?: string;
  source_ref?: Record<string, unknown>;

  // Wire: build
  website_url?: string;
  goal?: string;
  visibility?: 'private' | 'public';
  force?: boolean;

  // Website Monitoring
  interval_minutes?: number;
  scope?: 'page' | 'site' | 'wire';
  watch_mode?: 'full_page' | 'specific_data';
  watch_format?: 'markdown' | 'html' | 'cleaned_html';
  output_schema?: Record<string, unknown>;
  ai_mode?: boolean;
  ai_goal?: string;
  is_active?: boolean;
  expires_at?: string;
  alert_webhook_url?: string;
  alert_emails?: string;
  max_depth?: number;
  wire_action_id?: string;
  wire_catalog_slug?: string;
  wire_credential_id?: string;
  wire_params?: Record<string, unknown>;
  wire_watch_paths?: string[];
  id?: string;
  action?: 'pause' | 'resume' | 'run_now' | 'delete';

  // AI Visibility
  query?: string;
  sources?: string[];
  search_id?: string;

  // Browser sessions
  domain?: string;

  // AI browser automation
  max_steps?: number;
  timeout_ms?: number;
};
