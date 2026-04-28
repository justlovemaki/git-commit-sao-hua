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

export interface PluginAuthorPayload {
  plugin?: Record<string, unknown>;
  pluginJson?: string;
  sourceUrl?: string;
  github?: string;
  homepage?: string;
  signPrivateKey?: string;
  publicKey?: string;
  keyId?: string;
  verifySignature?: boolean;
  requireSignature?: boolean;
  algorithm?: string;
  loadTested?: boolean;
  localInstallTested?: boolean;
  skipLocalInstallTest?: boolean;
}

export interface PluginValidationResult {
  valid: boolean;
  plugin: Record<string, unknown>;
  checksum: string;
  signingChecksum: string;
  fileSize: number;
  signatureInfo?: Record<string, unknown> | null;
}

export interface PluginPackResult {
  success: boolean;
  summary: Record<string, unknown>;
  indexEntry: Record<string, unknown>;
  metadataPath?: string | null;
  signature?: Record<string, unknown> | null;
}

export interface PluginReleaseKitResult {
  success: boolean;
  plugin: Record<string, unknown>;
  summary: Record<string, unknown>;
  metadata: Record<string, unknown>;
  indexEntry: Record<string, unknown>;
  checklist: Record<string, unknown>;
  submissionMarkdown: string;
  signature?: Record<string, unknown> | null;
}

export interface AiSaohuaOptions {
  lang?: string;
  style?: string;
  type?: string;
}

export interface BatchSaohuaItem {
  mode?: 'random' | 'typed' | 'typed_style' | 'ai';
  type?: string;
  style?: string;
  lang?: string;
  diff?: string;
}

export interface BatchSaohuaResultItem {
  success: boolean;
  type?: string;
  style?: string;
  message?: string;
  fullMessage?: string;
  language?: string;
  error?: string;
}

export interface BatchSaohuaResult {
  items: BatchSaohuaResultItem[];
  count: number;
  successCount: number;
  failedCount: number;
}

export interface NaturalLanguageAnalysisData {
  naturalText: string;
  detectedType: string;
  detectedStyle: string;
  topic: string;
  confidence: string;
  reason: string;
  language: string;
}

export interface NaturalLanguageGenerateData extends NaturalLanguageAnalysisData {
  type: string;
  style: string;
  message: string;
  fullMessage: string;
}

export interface ReleaseNotesGenerateOptions {
  range?: string;
  title?: string;
  repo?: string;
  tagName?: string;
  body?: string;
  targetCommitish?: string;
  draft?: boolean;
  prerelease?: boolean;
  enrichGitHub?: boolean;
}

export interface ReleaseNotesResult {
  markdown: string;
  data: Record<string, unknown>;
  repo?: string;
  githubRelease?: Record<string, unknown> | null;
  totalCommits: number;
}

export interface ReleaseManifestResult {
  success: boolean;
  githubRelease: Record<string, unknown>;
  assets: Array<{
    name: string;
    path: string;
    size: number;
    sha256: string;
    contentType: string;
  }>;
}

export interface StreamSaohuaOptions {
  type?: string;
  style?: string;
  lang?: string;
  count?: number;
  intervalMs?: number;
}

export interface StreamSaohuaMeta {
  count: number;
  interval: number;
  language: string;
  type?: string;
  style?: string;
}

export interface StreamSaohuaItem extends SaohuaData {
  index: number;
}

export interface StreamSaohuaDone {
  total: number;
}

export interface StreamSaohuaError {
  message: string;
  index: number;
}

export type StreamEvent =
  | { type: 'meta'; data: StreamSaohuaMeta }
  | { type: 'item'; data: StreamSaohuaItem }
  | { type: 'done'; data: StreamSaohuaDone }
  | { type: 'error'; data: StreamSaohuaError };

export interface WsStreamEvent {
  event: 'meta' | 'item' | 'done' | 'error';
  data: StreamSaohuaMeta | StreamSaohuaItem | StreamSaohuaDone | StreamSaohuaError;
}

export interface WebSocketLike {
  onopen: ((event?: any) => void) | null;
  onmessage: ((event: { data: any }) => void) | null;
  onerror: ((event?: any) => void) | null;
  onclose: ((event?: any) => void) | null;
  close: () => void;
}

export interface WebSocketConstructorLike {
  new (url: string): any;
}

function parseSseChunks(buffer: string): { events: StreamEvent[]; remainder: string } {
  const blocks = buffer.split('\n\n');
  const remainder = blocks.pop() ?? '';
  const events: StreamEvent[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) {
      continue;
    }

    const eventLine = lines.find((line) => line.startsWith('event:'));
    const dataLines = lines.filter((line) => line.startsWith('data:'));
    if (!dataLines.length) {
      continue;
    }

    const eventType = (eventLine?.slice(6).trim() ?? 'message') as StreamEvent['type'] | 'message';
    const payload = dataLines.map((line) => line.slice(5).trim()).join('\n');

    if (eventType === 'message') {
      continue;
    }

    try {
      events.push({ type: eventType, data: JSON.parse(payload) } as StreamEvent);
    } catch {
      // ignore invalid event payloads
    }
  }

  return { events, remainder };
}

export interface ClientOptions {
  baseUrl?: string;
  apiKey?: string;
  bearerToken?: string;
  timeout?: number;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
  WebSocket?: WebSocketConstructorLike;
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
  private readonly WebSocketImpl?: WebSocketConstructorLike;

  constructor(options: ClientOptions = {}) {
    const globalFetch = options.fetch ?? globalThis.fetch;
    if (!globalFetch) {
      throw new Error('Fetch API 不可用，请在 Node.js 18+ 运行或自行传入 fetch 实现');
    }

    this.baseUrl = (options.baseUrl ?? 'http://localhost:3000').replace(/\/$/, '');
    this.timeout = options.timeout ?? 10000;
    this.fetchImpl = globalFetch;
    this.WebSocketImpl = options.WebSocket;
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

  async batchSaohua(items: BatchSaohuaItem[]): Promise<BatchSaohuaResult> {
    return this.request('POST', '/api/saohua/batch', { items });
  }

  streamSaohua(
    options: StreamSaohuaOptions = {},
    callbacks: {
      onMeta?: (meta: StreamSaohuaMeta) => void;
      onItem?: (item: StreamSaohuaItem) => void;
      onDone?: (done: StreamSaohuaDone) => void;
      onError?: (error: StreamSaohuaError) => void;
    } = {},
  ): { abort: () => void } {
    const { type, style, lang, count, intervalMs } = options;
    const query = new URLSearchParams();
    if (type) query.set('type', type);
    if (style) query.set('style', style);
    if (lang) query.set('lang', lang);
    if (count) query.set('count', String(count));
    if (intervalMs) query.set('intervalMs', String(intervalMs));

    const url = `${this.baseUrl}/api/saohua/stream?${query.toString()}`;
    const controller = new AbortController();

    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
      ...this.defaultHeaders,
    };

    const handleEvent = (eventName: string, data: unknown) => {
      switch (eventName) {
        case 'meta':
          callbacks.onMeta?.(data as StreamSaohuaMeta);
          break;
        case 'item':
          callbacks.onItem?.(data as StreamSaohuaItem);
          break;
        case 'done':
          callbacks.onDone?.(data as StreamSaohuaDone);
          break;
        case 'error':
          callbacks.onError?.(data as StreamSaohuaError);
          break;
      }
    };

    this.fetchImpl(url, { method: 'GET', headers, signal: controller.signal })
      .then((response) => {
        if (!response.ok || !response.body) {
          throw new SaohuaApiError(`SSE 连接失败: HTTP ${response.status}`, response.status);
        }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const read = (): void => {
          reader.read().then(({ done, value }) => {
            if (done) {
              const finalChunk = decoder.decode();
              if (finalChunk) {
                const parsed = parseSseChunks(buffer + finalChunk);
                parsed.events.forEach((event) => handleEvent(event.type, event.data));
              }
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const parsed = parseSseChunks(buffer);
            buffer = parsed.remainder;
            parsed.events.forEach((event) => handleEvent(event.type, event.data));

            read();
          });
        };

        read();
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          callbacks.onError?.({ message: err.message, index: 0 });
        }
      });

    return {
      abort: () => controller.abort(),
    };
  }

  streamSaohuaWs(
    options: StreamSaohuaOptions = {},
    callbacks: {
      onMeta?: (meta: StreamSaohuaMeta) => void;
      onItem?: (item: StreamSaohuaItem) => void;
      onDone?: (done: StreamSaohuaDone) => void;
      onError?: (error: StreamSaohuaError) => void;
    } = {},
  ): { close: () => void } {
    const WebSocketImpl = this.WebSocketImpl ?? globalThis.WebSocket;
    if (!WebSocketImpl) {
      setTimeout(() => {
        callbacks.onError?.({ message: '当前环境不支持 WebSocket，请传入 options.WebSocket', index: 0 });
      }, 0);
      return { close: () => {} };
    }

    const { type, style, lang, count, intervalMs } = options;
    const query = new URLSearchParams();
    if (type) query.set('type', type);
    if (style) query.set('style', style);
    if (lang) query.set('lang', lang);
    if (count) query.set('count', String(count));
    if (intervalMs) query.set('intervalMs', String(intervalMs));

    const protocol = this.baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${this.baseUrl.replace(/^https?:\/\//, '')}/api/saohua/ws?${query.toString()}`;

    let ws: any;
    try {
      ws = new WebSocketImpl(wsUrl);
    } catch {
      setTimeout(() => {
        callbacks.onError?.({ message: 'WebSocket 不可用', index: 0 });
      }, 0);
      return { close: () => {} };
    }

    ws.onmessage = (event: any) => {
      try {
        const raw = typeof event.data === 'string' ? event.data : String(event.data);
        const msg = JSON.parse(raw) as WsStreamEvent;
        switch (msg.event) {
          case 'meta':
            callbacks.onMeta?.(msg.data as StreamSaohuaMeta);
            break;
          case 'item':
            callbacks.onItem?.(msg.data as StreamSaohuaItem);
            break;
          case 'done':
            callbacks.onDone?.(msg.data as StreamSaohuaDone);
            break;
          case 'error':
            callbacks.onError?.(msg.data as StreamSaohuaError);
            break;
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      callbacks.onError?.({ message: 'WebSocket 连接错误', index: 0 });
    };

    return {
      close: () => ws.close(),
    };
  }

  async analyzeNaturalLanguage(text: string, lang?: string): Promise<NaturalLanguageAnalysisData> {
    return this.request('POST', '/api/saohua/natural/analyze', { text, lang });
  }

  async generateFromNaturalLanguage(
    text: string,
    options: { lang?: string; style?: string; type?: string } = {},
  ): Promise<NaturalLanguageGenerateData> {
    return this.request('POST', '/api/saohua/natural/generate', {
      text,
      ...options,
    });
  }

  async generateReleaseNotes(options: ReleaseNotesGenerateOptions = {}): Promise<ReleaseNotesResult> {
    return this.request('POST', '/api/release-notes/generate', options);
  }

  async generateReleaseManifest(
    assetPaths: string[],
    options: ReleaseNotesGenerateOptions = {},
  ): Promise<ReleaseManifestResult> {
    return this.request('POST', '/api/release-notes/manifest', {
      ...options,
      assetPaths,
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

  async validatePluginAuthorPayload(payload: PluginAuthorPayload): Promise<PluginValidationResult> {
    return this.request('POST', '/api/plugin-author/validate', payload);
  }

  async packPluginAuthorPayload(payload: PluginAuthorPayload): Promise<PluginPackResult> {
    return this.request('POST', '/api/plugin-author/pack', payload);
  }

  async generatePluginReleaseKit(payload: PluginAuthorPayload): Promise<PluginReleaseKitResult> {
    return this.request('POST', '/api/plugin-author/release-kit', payload);
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
