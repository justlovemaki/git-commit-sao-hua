import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const versionModule = require('../../lib/version.js');
const EXPECTED_VERSION = versionModule.getVersion() || '1.31.0';

import {
  SaohuaClient,
  SaohuaApiError,
  SaohuaNetworkError,
  SaohuaTimeoutError,
} from './dist/index.js';

function createFetch(handler) {
  return async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.toString();
    return handler(url, init);
  };
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('health() returns parsed server status', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch(() =>
      jsonResponse({
        success: true,
        data: {
          status: 'ok',
          uptime: 12.5,
          version: EXPECTED_VERSION,
          memory: { rss: 1024 },
        },
      }),
    ),
  });

  const result = await client.health();
  assert.equal(result.status, 'ok');
  assert.equal(result.version, EXPECTED_VERSION);
});

test('randomSaohua() forwards lang and style query params', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch((url) => {
      const parsed = new URL(url);
      assert.equal(parsed.pathname, '/api/saohua');
      assert.equal(parsed.searchParams.get('lang'), 'zh-CN');
      assert.equal(parsed.searchParams.get('style'), 'love');
      return jsonResponse({
        success: true,
        data: {
          type: 'feat',
          style: 'love',
          message: '新功能也想和你贴贴',
          fullMessage: 'feat: 新功能也想和你贴贴',
          language: 'zh-CN',
        },
      });
    }),
  });

  const result = await client.randomSaohua('zh-CN', 'love');
  assert.equal(result.fullMessage, 'feat: 新功能也想和你贴贴');
});

test('aiSaohua() posts diff and type hints', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch(async (_url, init) => {
      assert.equal(init.method, 'POST');
      const body = JSON.parse(init.body);
      assert.equal(body.diff, 'diff --git a/app.js b/app.js');
      assert.equal(body.style, 'sao');
      assert.equal(body.type, 'fix');
      return jsonResponse({
        success: true,
        data: {
          type: 'fix',
          style: 'sao',
          message: '这次修复比夜色还丝滑',
          fullMessage: 'fix: 这次修复比夜色还丝滑',
          language: 'zh-CN',
        },
      });
    }),
  });

  const result = await client.aiSaohua('diff --git a/app.js b/app.js', {
    style: 'sao',
    type: 'fix',
  });
  assert.equal(result.type, 'fix');
});

test('auth headers include api key, bearer token and custom headers', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    apiKey: 'key-123',
    bearerToken: 'token-456',
    headers: { 'X-Custom': 'yes' },
    fetch: createFetch((_url, init) => {
      assert.equal(init.headers['X-API-Key'], 'key-123');
      assert.equal(init.headers.Authorization, 'Bearer token-456');
      assert.equal(init.headers['X-Custom'], 'yes');
      return jsonResponse({ success: true, data: { plugins: [], count: 0 } });
    }),
  });

  const result = await client.listPlugins();
  assert.equal(result.count, 0);
});

test('installFromIndex() sends request body', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch(async (_url, init) => {
      const body = JSON.parse(init.body);
      assert.deepEqual(body, { name: 'romantic-pack', indexUrl: 'https://example.com/index.json' });
      return jsonResponse({
        success: true,
        data: {
          name: 'romantic-pack',
          version: '1.0.0',
          path: '/plugins/romantic-pack.json',
          fromIndex: 'https://example.com/index.json',
          checksum: 'sha256:abc',
        },
      });
    }),
  });

  const result = await client.installFromIndex('romantic-pack', 'https://example.com/index.json');
  assert.equal(result.name, 'romantic-pack');
});

test('API failures raise SaohuaApiError', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch(() => jsonResponse({ success: false, error: '无效请求' }, 400)),
  });

  await assert.rejects(() => client.stats(), (error) => {
    assert.ok(error instanceof SaohuaApiError);
    assert.equal(error.statusCode, 400);
    return true;
  });
});

test('network failures raise SaohuaNetworkError', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch(() => {
      throw new Error('connect ECONNREFUSED');
    }),
  });

  await assert.rejects(() => client.health(), (error) => {
    assert.ok(error instanceof SaohuaNetworkError);
    return true;
  });
});

test('timeout failures raise SaohuaTimeoutError', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    timeout: 5,
    fetch: createFetch((_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () => {
          const abortError = new Error('aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      }),
    ),
  });

  await assert.rejects(() => client.health(), (error) => {
    assert.ok(error instanceof SaohuaTimeoutError);
    return true;
  });
});
