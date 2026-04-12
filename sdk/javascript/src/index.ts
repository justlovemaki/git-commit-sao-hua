export type HttpMethod = 'GET' | 'POST' | 'DELETE';

export interface RequestMeta {
  timestamp?: string;
  message?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: RequestMeta;
}

export interface MemoryUsage {
  rss?: number;
  heapTotal?: number;
  heapUsed?: number;
  external?: number;
  arrayBuffers?: number;
  [key: string]: number | undefined;
}

export interface HealthData {
  status: string;
  uptime: number;
  memory: MemoryUsage;
  version: string;
}

export interface SaohuaData {
  type: string;
  style: string;
  message: string;
  fullMessage: string;
  language: string;
}

export interface TypeInfo {
  value: string;
  label: string;
  emoji?: string;
  description?: string;
}

export interface TypesData {
  types: TypeInfo[];
  count: number;
}

export interface StyleInfo {
  value: string;
  label: string;
  emoji?: string;
  description?: string;
}

export interface StylesData {
  styles: StyleInfo[];
  count: number;
}

export interface StatsData {
  totalTypes: number;
  totalStyles: number;
  totalMessages: number;
  typeStats: Record<string, unknown>;
  language: string;
  supportedLanguages: string[];
  defaultLanguage: string;
}

export interface PluginInfo {
  name: string;
  version?: string;
  description?: string;
  author?: string;
  installedAt?: string;
  sourceUrl?: string;
  checksum?: string | null;
  fromIndex?: string | null;
  messages?: Record<string, unknown>;
}

export interface PluginsData {
  plugins: PluginInfo[];
  count: number;
}

export interface PluginResult {
  name?: string;
  path?: string;
  reloaded?: boolean;
  content?: Record<string, unknown>;
  version?: string;
  sourceUrl?: string;
  checksum?: string | null;
  fromIndex?: string | null;
}

export interface PluginRegistryResult {
  plugins: PluginInfo[];
  total: number;
  query: string;
  indexUrl?: string;
}

export interface PluginMessages {
  [commitType: string]: {
    [style: string]: string[];
  };
}

export interface PluginInstallPayload {
  name: string;
  version?: string;
  author?: string;
  description?: string;
  messages: PluginMessages;
}

export interface CreatePluginTemplatePayload {
  name: string;
  version?: string;
  author?: string;
  description?: string;
}

export interface AiSaohuaOptions {
  lang?: string;
  style?: string;
  type?: string;
}

export interface ClientOptions {
  baseUrl?: string;
  apiKey?: string;
  bearerToken?: string;
  timeout?: number;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
}

export class SaohuaApiError extends Error {
  statusCode: number;
  responseData?: unknown;

  constructor(message: string, statusCode: number, responseData?: unknown) {
    super(message);
    this.name = 'SaohuaApiError';
    this.statusCode = statusCode;
    this.responseData = responseData;
  }
}

export class SaohuaTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SaohuaTimeoutError';
  }
}

export class SaohuaNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SaohuaNetworkError';
  }
}

export class SaohuaClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly fetchImpl: typeof fetch;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: ClientOptions = {}) {
    const globalFetch = options.fetch ?? globalThis.fetch;
    if (!globalFetch) {
      throw new Error('Fetch API 不可用，请在 Node.js 18+ 运行或自行传入 fetch 实现');
    }

    this.baseUrl = (options.baseUrl ?? 'http://localhost:3000').replace(/\/$/, '');
    this.timeout = options.timeout ?? 10000;
    this.fetchImpl = globalFetch;
    this.defaultHeaders = {
      Accept: 'application/json',
      ...(options.headers ?? {}),
    };

    if (options.apiKey) {
      this.defaultHeaders['X-API-Key'] = options.apiKey;
    }

    if (options.bearerToken) {
      this.defaultHeaders.Authorization = `Bearer ${options.bearerToken}`;
    }
  }

  async health(): Promise<HealthData> {
    return this.request('GET', '/api/health');
  }

  async randomSaohua(lang?: string, style?: string): Promise<SaohuaData> {
    return this.request('GET', '/api/saohua', undefined, withQuery({ lang, style }));
  }

  async saohuaByType(type: string, options: { lang?: string; style?: string } = {}): Promise<SaohuaData> {
    return this.request('GET', `/api/saohua/${encodeURIComponent(type)}`, undefined, withQuery(options));
  }

  async saohuaByTypeAndStyle(type: string, style: string, lang?: string): Promise<SaohuaData> {
    return this.request(
      'GET',
      `/api/saohua/${encodeURIComponent(type)}/${encodeURIComponent(style)}`,
      undefined,
      withQuery({ lang }),
    );
  }

  async aiSaohua(diff: string, options: AiSaohuaOptions = {}): Promise<SaohuaData> {
    return this.request('POST', '/api/saohua/ai', {
      diff,
      ...options,
    });
  }

  async listTypes(lang?: string): Promise<TypesData> {
    return this.request('GET', '/api/types', undefined, withQuery({ lang }));
  }

  async listStyles(lang?: string): Promise<StylesData> {
    return this.request('GET', '/api/styles', undefined, withQuery({ lang }));
  }

  async stats(lang?: string): Promise<StatsData> {
    return this.request('GET', '/api/stats', undefined, withQuery({ lang }));
  }

  async listPlugins(): Promise<PluginsData> {
    return this.request('GET', '/api/plugins');
  }

  async installPlugin(payload: PluginInstallPayload | { sourceUrl: string; checksum?: string }): Promise<PluginResult> {
    return this.request('POST', '/api/plugins/install', payload);
  }

  async removePlugin(name: string): Promise<PluginResult> {
    return this.request('DELETE', `/api/plugins/${encodeURIComponent(name)}`);
  }

  async createPluginTemplate(payload: CreatePluginTemplatePayload): Promise<PluginResult> {
    return this.request('POST', '/api/plugins/create', payload);
  }

  async reloadPlugins(): Promise<PluginResult> {
    return this.request('POST', '/api/plugins/reload');
  }

  async searchPluginRegistry(query = '', indexUrl?: string): Promise<PluginRegistryResult> {
    return this.request('GET', '/api/plugin-registry', undefined, withQuery({ q: query, indexUrl }));
  }

  async installFromIndex(name: string, indexUrl?: string): Promise<PluginResult> {
    return this.request('POST', '/api/plugins/install-from-index', { name, indexUrl });
  }

  private async request<T>(method: HttpMethod, path: string, body?: unknown, query?: URLSearchParams): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await this.fetchImpl(this.buildUrl(path, query), {
        method,
        headers: {
          ...this.defaultHeaders,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const text = await response.text();
      let payload: ApiEnvelope<T> | undefined;

      try {
        payload = text ? (JSON.parse(text) as ApiEnvelope<T>) : undefined;
      } catch {
        throw new SaohuaApiError('无法解析响应 JSON', response.status, { raw: text });
      }

      if (!response.ok || !payload?.success) {
        throw new SaohuaApiError(payload?.error ?? `HTTP ${response.status}`, response.status, payload ?? text);
      }

      return (payload.data ?? {}) as T;
    } catch (error) {
      if (error instanceof SaohuaApiError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new SaohuaTimeoutError(`请求超时 (${this.timeout}ms): ${method} ${path}`);
      }
      throw new SaohuaNetworkError(error instanceof Error ? error.message : '未知网络错误');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildUrl(path: string, query?: URLSearchParams): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      url.search = query.toString();
    }
    return url.toString();
  }
}

function withQuery(params: Record<string, string | undefined>): URLSearchParams | undefined {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, value);
    }
  }
  return Array.from(search.keys()).length > 0 ? search : undefined;
}
