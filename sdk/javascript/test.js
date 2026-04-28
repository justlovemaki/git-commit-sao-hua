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

function sseResponse(events) {
  const payload = events
    .map((event) => `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`)
    .join('');

  return new Response(payload, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

class FakeWebSocket {
  static instances = [];

  constructor(url) {
    this.url = url;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
    FakeWebSocket.instances.push(this);
  }

  emitMessage(data) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }

  emitError(error = new Error('ws error')) {
    this.onerror?.(error);
  }

  emitClose() {
    this.onclose?.();
  }

  close() {
    this.closed = true;
  }
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

test('validatePluginAuthorPayload() posts plugin JSON content', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch(async (_url, init) => {
      const body = JSON.parse(init.body);
      assert.equal(body.plugin.name, 'romantic-pack');
      return jsonResponse({
        success: true,
        data: {
          valid: true,
          plugin: body.plugin,
          checksum: 'abc',
          signingChecksum: 'def',
          fileSize: 123,
        },
      });
    }),
  });

  const result = await client.validatePluginAuthorPayload({
    plugin: { name: 'romantic-pack', version: '1.0.0', data: { 'zh-CN': { feat: { love: ['hi'] } } } },
  });
  assert.equal(result.valid, true);
  assert.equal(result.fileSize, 123);
});

test('generatePluginReleaseKit() returns submission markdown', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch(async (_url, init) => {
      const body = JSON.parse(init.body);
      assert.equal(body.pluginJson.includes('release-pack'), true);
      return jsonResponse({
        success: true,
        data: {
          success: true,
          plugin: { name: 'release-pack', version: '1.0.0' },
          summary: { name: 'release-pack' },
          metadata: { name: 'release-pack' },
          indexEntry: { name: 'release-pack' },
          checklist: { passed: true },
          submissionMarkdown: '# Plugin Submission: release-pack',
        },
      });
    }),
  });

  const result = await client.generatePluginReleaseKit({
    pluginJson: JSON.stringify({ name: 'release-pack', version: '1.0.0', data: { 'zh-CN': { feat: { love: ['x'] } } } }),
  });
  assert.match(result.submissionMarkdown, /release-pack/);
});

test('generateReleaseNotes() posts release options', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch(async (_url, init) => {
      const body = JSON.parse(init.body);
      assert.equal(body.range, 'v1.0.0..HEAD');
      assert.equal(body.tagName, 'v1.1.0');
      return jsonResponse({
        success: true,
        data: {
          markdown: '# v1.1.0',
          data: { title: 'v1.1.0', totalCommits: 2 },
          repo: 'justlovemaki/git-commit-sao-hua',
          githubRelease: { tag_name: 'v1.1.0' },
          totalCommits: 2,
        },
      });
    }),
  });

  const result = await client.generateReleaseNotes({ range: 'v1.0.0..HEAD', tagName: 'v1.1.0' });
  assert.equal(result.totalCommits, 2);
  assert.equal(result.githubRelease.tag_name, 'v1.1.0');
});

test('generateReleaseManifest() sends asset paths', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch(async (_url, init) => {
      const body = JSON.parse(init.body);
      assert.deepEqual(body.assetPaths, ['README.md']);
      return jsonResponse({
        success: true,
        data: {
          success: true,
          githubRelease: { tag_name: 'v1.1.0' },
          assets: [
            { name: 'README.md', path: '/tmp/README.md', size: 1, sha256: 'abc', contentType: 'text/markdown' },
          ],
        },
      });
    }),
  });

  const result = await client.generateReleaseManifest(['README.md'], { tagName: 'v1.1.0' });
  assert.equal(result.assets[0].name, 'README.md');
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

test('batchSaohua() posts items array', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch(async (_url, init) => {
      assert.equal(init.method, 'POST');
      const body = JSON.parse(init.body);
      assert.equal(body.items.length, 3);
      assert.equal(body.items[0].mode, 'random');
      assert.equal(body.items[1].mode, 'typed');
      assert.equal(body.items[1].type, 'fix');
      assert.equal(body.items[2].mode, 'typed_style');
      assert.equal(body.items[2].type, 'feat');
      assert.equal(body.items[2].style, 'love');
      return jsonResponse({
        success: true,
        data: {
          items: [
            { success: true, type: 'fix', style: 'sao', message: 'message1', fullMessage: 'fix: message1', language: 'zh-CN' },
            { success: true, type: 'fix', style: 'love', message: 'message2', fullMessage: 'fix: message2', language: 'zh-CN' },
            { success: true, type: 'feat', style: 'love', message: 'message3', fullMessage: 'feat: message3', language: 'zh-CN' }
          ],
          count: 3,
          successCount: 3,
          failedCount: 0
        },
      });
    }),
  });

  const result = await client.batchSaohua([
    { mode: 'random' },
    { mode: 'typed', type: 'fix' },
    { mode: 'typed_style', type: 'feat', style: 'love' }
  ]);
  assert.equal(result.count, 3);
  assert.equal(result.successCount, 3);
  assert.equal(result.items[0].message, 'message1');
});

test('batchSaohua() handles mixed success/failure', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch(() =>
      jsonResponse({
        success: true,
        data: {
          items: [
            { success: true, type: 'fix', style: 'sao', message: 'ok', fullMessage: 'fix: ok', language: 'zh-CN' },
            { success: false, error: 'ai 模式需要提供 diff 参数' }
          ],
          count: 2,
          successCount: 1,
          failedCount: 1
        },
      }),
    ),
  });

  const result = await client.batchSaohua([
    { mode: 'random' },
    { mode: 'ai' }
  ]);
  assert.equal(result.successCount, 1);
  assert.equal(result.failedCount, 1);
  assert.equal(result.items[1].error, 'ai 模式需要提供 diff 参数');
});

test('streamSaohua() consumes SSE meta/item/done events', async () => {
  const seen = [];
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch((url) => {
      const parsed = new URL(url);
      assert.equal(parsed.pathname, '/api/saohua/stream');
      assert.equal(parsed.searchParams.get('type'), 'fix');
      assert.equal(parsed.searchParams.get('count'), '2');

      return sseResponse([
        { type: 'meta', data: { count: 2, interval: 100, language: 'zh-CN', type: 'fix' } },
        {
          type: 'item',
          data: { type: 'fix', style: 'sao', message: 'm1', fullMessage: 'fix: m1', language: 'zh-CN', index: 1 },
        },
        {
          type: 'item',
          data: { type: 'fix', style: 'love', message: 'm2', fullMessage: 'fix: m2', language: 'zh-CN', index: 2 },
        },
        { type: 'done', data: { total: 2 } },
      ]);
    }),
  });

  await new Promise((resolve, reject) => {
    client.streamSaohua(
      { type: 'fix', count: 2 },
      {
        onMeta(meta) {
          seen.push(['meta', meta.count]);
        },
        onItem(item) {
          seen.push(['item', item.index, item.type]);
        },
        onDone(done) {
          seen.push(['done', done.total]);
          resolve(undefined);
        },
        onError(error) {
          reject(new Error(error.message));
        },
      },
    );
  });

  assert.deepEqual(seen, [
    ['meta', 2],
    ['item', 1, 'fix'],
    ['item', 2, 'fix'],
    ['done', 2],
  ]);
});

test('streamSaohuaWs() consumes WebSocket meta/item/done events', async () => {
  FakeWebSocket.instances = [];
  const seen = [];
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    WebSocket: FakeWebSocket,
    fetch: createFetch(() => jsonResponse({ success: true, data: {} })),
  });

  const handle = client.streamSaohuaWs(
    { type: 'fix', count: 2 },
    {
      onMeta(meta) {
        seen.push(['meta', meta.count]);
      },
      onItem(item) {
        seen.push(['item', item.index, item.type]);
      },
      onDone(done) {
        seen.push(['done', done.total]);
      },
      onError(error) {
        throw new Error(error.message);
      },
    },
  );

  const ws = FakeWebSocket.instances[0];
  assert.equal(ws.url, 'ws://test.local/api/saohua/ws?type=fix&count=2');

  ws.emitMessage({ event: 'meta', data: { count: 2, interval: 100, language: 'zh-CN', type: 'fix' } });
  ws.emitMessage({ event: 'item', data: { type: 'fix', style: 'sao', message: 'm1', fullMessage: 'fix: m1', language: 'zh-CN', index: 1 } });
  ws.emitMessage({ event: 'item', data: { type: 'fix', style: 'love', message: 'm2', fullMessage: 'fix: m2', language: 'zh-CN', index: 2 } });
  ws.emitMessage({ event: 'done', data: { total: 2 } });
  handle.close();

  assert.equal(ws.closed, true);
  assert.deepEqual(seen, [
    ['meta', 2],
    ['item', 1, 'fix'],
    ['item', 2, 'fix'],
    ['done', 2],
  ]);
});

test('streamSaohuaWs() reports missing WebSocket support', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    WebSocket: undefined,
    fetch: createFetch(() => jsonResponse({ success: true, data: {} })),
  });

  const originalWebSocket = globalThis.WebSocket;
  // @ts-ignore
  delete globalThis.WebSocket;

  const error = await new Promise((resolve) => {
    client.streamSaohuaWs({}, {
      onError(err) {
        resolve(err.message);
      },
    });
  });

  globalThis.WebSocket = originalWebSocket;
  assert.match(error, /WebSocket/);
});

test('analyzeNaturalLanguage() posts text and returns detection fields', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch(async (_url, init) => {
      assert.equal(init.method, 'POST');
      const body = JSON.parse(init.body);
      assert.equal(body.text, '修复登录按钮点击无效');
      assert.equal(body.lang, 'zh-CN');
      return jsonResponse({
        success: true,
        data: {
          naturalText: body.text,
          detectedType: 'fix',
          detectedStyle: 'sao',
          topic: '登录按钮点击无效',
          confidence: 'medium',
          reason: '检测到类型关键词: fix',
          language: 'zh-CN',
        },
      });
    }),
  });

  const result = await client.analyzeNaturalLanguage('修复登录按钮点击无效', 'zh-CN');
  assert.equal(result.detectedType, 'fix');
  assert.equal(result.topic, '登录按钮点击无效');
});

test('generateFromNaturalLanguage() supports override type and style', async () => {
  const client = new SaohuaClient({
    baseUrl: 'http://test.local',
    fetch: createFetch(async (_url, init) => {
      const body = JSON.parse(init.body);
      assert.equal(body.text, '新增分享海报下载功能');
      assert.equal(body.type, 'feat');
      assert.equal(body.style, 'love');
      return jsonResponse({
        success: true,
        data: {
          naturalText: body.text,
          detectedType: 'feat',
          detectedStyle: 'sao',
          topic: '分享海报下载功能',
          confidence: 'medium',
          reason: '检测到类型关键词: feat',
          language: 'zh-CN',
          type: 'feat',
          style: 'love',
          message: '新功能也想和你贴贴',
          fullMessage: 'feat: 新功能也想和你贴贴',
        },
      });
    }),
  });

  const result = await client.generateFromNaturalLanguage('新增分享海报下载功能', {
    type: 'feat',
    style: 'love',
  });
  assert.equal(result.style, 'love');
  assert.equal(result.fullMessage, 'feat: 新功能也想和你贴贴');
});
