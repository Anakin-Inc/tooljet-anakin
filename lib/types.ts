export type SourceOptions = {
  api_key: string;
};

export type QueryOptions = {
  operation: string;
  url?: string;
  generate_json?: boolean;
  country?: string;
  use_browser?: boolean;
  force_fresh?: boolean;
  job_id?: string;
  prompt?: string;
  limit?: number;
  schema?: Record<string, unknown>;
};
