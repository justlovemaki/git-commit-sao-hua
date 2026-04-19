# Git Saohua JavaScript / TypeScript SDK

JavaScript / TypeScript 客户端，覆盖 Git Commit 骚话 REST API 的主要端点，适合 Node.js 服务、脚本工具、CLI 扩展和前后端集成。

## 特性

- 覆盖骚话生成、AI 生成、类型/风格、统计、插件管理、插件索引
- 支持 API Key / Bearer Token 双认证
- 支持请求超时、自定义 headers、自定义 fetch 实现
- TypeScript 原生类型导出
- 内置单元测试与 examples

## 安装

```bash
cd sdk/javascript
npm install
npm run build
```

发布后可直接安装：

```bash
npm install git-saohua
```

## 快速开始

```ts
import { SaohuaClient } from 'git-saohua';

const client = new SaohuaClient({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.SAOHUA_API_KEY,
  timeout: 8000,
  headers: {
    'X-Request-From': 'my-tool',
  },
});

const result = await client.randomSaohua('zh-CN', 'love');
console.log(result.fullMessage);
```

## API

### 创建客户端

```ts
const client = new SaohuaClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'xxx',
  bearerToken: 'xxx',
  timeout: 10000,
  headers: { 'X-Custom': 'demo' },
});
```

### 方法列表

- `health()`
- `randomSaohua(lang?, style?)`
- `saohuaByType(type, { lang?, style? })`
- `saohuaByTypeAndStyle(type, style, lang?)`
- `aiSaohua(diff, { lang?, style?, type? })`
- `batchSaohua(items[])`
- `listTypes(lang?)`
- `listStyles(lang?)`
- `stats(lang?)`
- `listPlugins()`
- `installPlugin(payload)`
- `removePlugin(name)`
- `createPluginTemplate(payload)`
- `reloadPlugins()`
- `searchPluginRegistry(query?, indexUrl?)`
- `installFromIndex(name, indexUrl?)`

### 批量生成示例

```ts
const batch = await client.batchSaohua([
  { mode: 'random' },
  { mode: 'typed', type: 'fix' },
  { mode: 'typed_style', type: 'feat', style: 'love' },
  {
    mode: 'ai',
    type: 'feat',
    diff: 'diff --git a/app.js b/app.js\n+export function hello() {}',
  },
]);

console.log(batch.successCount, batch.items.map((item) => item.fullMessage ?? item.error));
```

## 开发

```bash
npm install
npm run build
npm test
npm run lint
```

## 测试覆盖

测试重点覆盖：

- 参数拼接
- 认证头注入
- JSON 响应解析
- API 错误处理
- 网络异常
- 超时中断

## 目录结构

```text
sdk/javascript/
├── src/index.ts
├── examples/basic-usage.mjs
├── test.js
├── package.json
└── tsconfig.json
```
