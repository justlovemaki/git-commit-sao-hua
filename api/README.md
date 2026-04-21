# Git Saohua API

> 骚话生成器 REST API 服务 - 从「工具集」到「可调用平台服务」的维度跃迁 🚀

## 概述

Git Saohua API 是一个基于 Express.js 的 REST API 服务，提供骚话生成功能。支持多种语言、类型和风格的骚话生成。

## 功能特性

- 🎲 随机骚话生成
- 📝 按类型生成骚话
- 🎨 按类型+风格生成骚话
- 🤖 AI 智能生成（基于 diff 内容）
- 📊 数据统计
- 🛡️ CORS 支持
- ⚡ Rate Limiting 防滥用
- 📝 请求日志

## 快速开始

### 安装

```bash
cd api
npm install
```

### 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:3000` 启动

### Docker 部署

```bash
docker build -t git-sao-hua-api .
docker run -p 3000:3000 git-sao-hua-api
```

## API 端点

### 健康检查

```
GET /api/health
```

响应字段说明:
- `status` - 服务器状态
- `requestId` - 请求追踪 ID
- `uptime` - 运行时长（秒）
- `memory` - 内存使用情况
- `runtime` - 运行时信息（nodeVersion, platform, arch, cpuUsage）
- `service` - 服务信息（name, version）

响应示例:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "requestId": "a1b2c3d4e5f6",
    "uptime": 3600.5,
    "memory": { "rss": 123456, "heapTotal": 67890, "heapUsed": 54321, "external": 1234 },
    "runtime": {
      "nodeVersion": "v20.0.0",
      "platform": "linux",
      "arch": "x64",
      "cpuUsage": { "user": 1000, "system": 500 }
    },
    "service": { "name": "git-sao-hua-api", "version": "1.31.0" }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "message": "服务器运行中~"
  }
}
```

### 存活探针

```
GET /api/health/live
```

用于 Kubernetes liveness probe，检查进程是否存活。

响应示例:
```json
{ "status": "ok" }
```

### 就绪探针

```
GET /api/health/ready
```

用于 Kubernetes readiness probe，检查服务是否准备好接受请求。

响应示例:
```json
{ "status": "ok", "reason": "service ready" }
```

### 指标快照

```
GET /api/metrics
```

返回可观测性指标快照，包括：
- `requestId` - 请求追踪配置
- `totalRequests` - 总请求数
- `statusCodes` - 各状态码段统计
- `routes` - 各路由聚合统计
- `recentErrors` - 最近错误（最多 50 条）
- `runtime` - 运行时信息

响应示例:
```json
{
  "success": true,
  "data": {
    "requestId": { "enabled": true, "header": "X-Request-Id" },
    "totalRequests": 1000,
    "uptime": 3600,
    "statusCodes": { "2xx": 900, "3xx": 50, "4xx": 40, "5xx": 10 },
    "routes": {
      "/api/saohua": { "count": 500, "avgTime": 15 }
    },
    "recentErrors": [],
    "runtime": {
      "memory": { "rss": 123456, "heapTotal": 67890 },
      "cpu": { "user": 1000, "system": 500 }
    }
  }
}
```

### Prometheus 指标导出

```
GET /api/metrics/prometheus
```

返回 Prometheus 文本格式的指标数据，支持标准 Prometheus 抓取协议。

Content-Type: `text/plain; version=0.0.4; charset=utf-8`

导出指标说明：
- `http_requests_total` - 总请求数（counter）
- `http_requests_by_status{status="2xx|3xx|4xx|5xx"}` - 按状态码分组请求数（counter）
- `http_request_duration_average_ms{method="...",route="..."}` - 按方法 + 路由聚合平均耗时（gauge）
- `http_request_count_total{method="...",route="..."}` - 按方法 + 路由聚合请求数（counter）
- `process_uptime_seconds` - 进程运行时长（gauge）
- `process_memory_rss_bytes` - 进程 RSS 内存（gauge）
- `process_memory_heap_used_bytes` - 进程堆内存已使用（gauge）
- `process_memory_heap_total_bytes` - 进程堆内存总量（gauge）
- `process_memory_external_bytes` - 进程外部内存（gauge）

输出示例:
```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total 1000
# HELP http_requests_by_status HTTP requests grouped by status code
# TYPE http_requests_by_status counter
http_requests_by_status{status="2xx"} 900
http_requests_by_status{status="4xx"} 100
# HELP http_request_duration_average_ms Average request duration in milliseconds by method and route
# TYPE http_request_duration_average_ms gauge
http_request_duration_average_ms{method="GET",route="/api/saohua"} 15
# HELP http_request_count_total Total requests by method and route
# TYPE http_request_count_total counter
http_request_count_total{method="GET",route="/api/saohua"} 42
# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds 3600
# HELP process_memory_heap_used_bytes Process heap used memory in bytes
# TYPE process_memory_heap_used_bytes gauge
process_memory_heap_used_bytes 12345678
```

### 随机骚话

```
GET /api/saohua
```

查询参数:
- `lang` - 语言 (zh-CN, en)，默认 zh-CN
- `style` - 风格 (love, sao, zha, chu, fo)

响应示例:
```json
{
  "success": true,
  "data": {
    "type": "fix",
    "style": "sao",
    "message": "修 bug 和撩你，我都在行",
    "fullMessage": "fix: 修 bug 和撩你，我都在行",
    "language": "zh-CN"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "message": "随机骚话生成成功~"
  }
}
```

### 按类型生成

```
GET /api/saohua/:type
```

路径参数:
- `type` - commit 类型 (fix, feat, chore, docs, refactor, style, test, perf, ci, build, revert, hotfix)

查询参数:
- `lang` - 语言
- `style` - 风格

示例:
```
GET /api/saohua/feat?lang=en&style=love
```

### 按类型+风格生成

```
GET /api/saohua/:type/:style
```

路径参数:
- `type` - commit 类型
- `style` - 风格

示例:
```
GET /api/saohua/fix/love
```

### AI 生成

```
POST /api/saohua/ai
```

请求体:
```json
{
  "diff": "diff --git a/test.js b/test.js\n+console.log('test');",
  "type": "feat",
  "style": "sao",
  "lang": "zh-CN"
}
```

字段说明:
- `diff` - **必需** git diff 内容
- `type` - 可选 commit 类型
- `style` - 可选 风格
- `lang` - 可选 语言

### 批量生成

```
POST /api/saohua/batch
```

一次请求生成多条骚话，支持最多 50 条。

请求体:
```json
{
  "items": [
    { "mode": "random" },
    { "mode": "typed", "type": "fix" },
    { "mode": "typed_style", "type": "feat", "style": "love" },
    { "mode": "ai", "diff": "diff --git a/test.js b/test.js\n+console.log('test');", "type": "feat" }
  ]
}
```

字段说明:
- `items` - **必需** 生成请求数组
- `items[].mode` - 生成模式：`random` | `typed` | `typed_style` | `ai`，默认 `random`
- `items[].type` - commit 类型（typed/typed_style/ai 模式需要）
- `items[].style` - 风格（typed/typed_style/ai 模式可选）
- `items[].lang` - 语言，可选，默认为 `zh-CN`
- `items[].diff` - git diff 内容（ai 模式需要）

响应示例:
```json
{
  "success": true,
  "data": {
    "items": [
      { "success": true, "type": "fix", "style": "sao", "message": "修 bug 和撩你，我都在行", "fullMessage": "fix: 修 bug 和撩你，我都在行", "language": "zh-CN" },
      { "success": true, "type": "fix", "style": "love", "message": "修复 bug 也是爱你的表现", "fullMessage": "fix: 修复 bug 也是爱你的表现", "language": "zh-CN" },
      { "success": true, "type": "feat", "style": "love", "message": "新功能也想和你贴贴", "fullMessage": "feat: 新功能也想和你贴贴", "language": "zh-CN" },
      { "success": true, "type": "feat", "style": "sao", "message": "新功能get√，撩妹技能up↑", "fullMessage": "feat: 新功能get√，撩妹技能up↑", "language": "zh-CN" }
    ],
    "count": 4,
    "successCount": 4,
    "failedCount": 0
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "message": "批量生成完成，成功 4/4~"
  }
}
```

错误响应（无效请求）:
```json
{
  "success": false,
  "error": "请提供有效的生成请求数组~",
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 流式生成（SSE）

```
GET /api/saohua/stream
```

通过 `text/event-stream` 连续推送骚话候选，适合终端、机器人、前端实时预览场景。

查询参数:
- `type` - 可选 commit 类型
- `style` - 可选风格
- `lang` - 可选语言，默认 `zh-CN`
- `count` - 可选生成条数，范围 `1-100`，默认 `10`
- `intervalMs` - 可选推送间隔毫秒数，范围 `100-10000`，默认 `100`

示例:
```
GET /api/saohua/stream?type=fix&count=3&intervalMs=100
```

响应事件顺序:
- `meta` - 首包，返回本次流的元信息
- `item` - 每条骚话候选
- `done` - 全部发送完成
- `error` - 生成过程中的错误

SSE 响应示例:
```text
event: meta
data: {"count":3,"interval":100,"language":"zh-CN","type":"fix"}

event: item
data: {"type":"fix","style":"sao","message":"修 bug 和撩你，我都在行","fullMessage":"fix: 修 bug 和撩你，我都在行","language":"zh-CN","index":1}

event: done
data: {"total":3}
```

### 获取类型列表

```
GET /api/types
```

查询参数:
- `lang` - 语言

### 获取风格列表

```
GET /api/styles
```

查询参数:
- `lang` - 语言

### 获取统计数据

```
GET /api/stats
```

查询参数:
- `lang` - 语言

响应示例:
```json
{
  "success": true,
  "data": {
    "totalTypes": 12,
    "totalStyles": 5,
    "totalMessages": 600,
    "typeStats": {
      "fix": { "love": 5, "sao": 5, "zha": 5, "chu": 5, "fo": 5 },
      ...
    },
    "language": "zh-CN",
    "supportedLanguages": ["zh-CN", "en"],
    "defaultLanguage": "zh-CN"
  }
}
```

## 响应格式

所有响应遵循以下结构:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "message": "操作成功~"
  }
}
```

错误响应:

```json
{
  "success": false,
  "error": "错误信息",
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 端点不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 支持的参数值

### Commit 类型

- `fix` - 修复 bug
- `feat` - 新功能
- `chore` - 日常维护
- `docs` - 文档更新
- `refactor` - 代码重构
- `style` - 代码格式
- `test` - 测试相关
- `perf` - 性能优化
- `ci` - CI 配置
- `build` - 构建系统
- `revert` - 回滚
- `hotfix` - 紧急修复

### 风格

- `love` - 情话模式 💕
- `sao` - 骚话模式 😏
- `zha` - 扎心模式 💔
- `chu` - 中二模式 😤
- `fo` - 佛系模式 🙏

### 语言

- `zh-CN` - 中文
- `en` - English

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务端口 | 3000 |
| NODE_ENV | 运行环境 | development |
| SAOHUA_API_KEYS | API 认证密钥（逗号分隔的多个密钥） | 无（不启用认证） |

## 🔐 API 认证

为了保护插件管理等写入端点，API 支持两种认证方式：

### 认证方式

1. **API Key 认证** - 通过 `X-API-Key` header
2. **Bearer Token 认证** - 通过 `Authorization: Bearer <token>` header

### 配置密钥

在启动服务前，设置环境变量 `SAOHUA_API_KEYS`：

```bash
# 单个密钥
export SAOHUA_API_KEYS="my-secret-api-key"

# 多个密钥（逗号分隔）
export SAOHUA_API_KEYS="key1,key2,key3"
```

### 使用示例

```bash
# 使用 API Key 安装本地插件
curl -X POST http://localhost:3000/api/plugins/install \
  -H "Content-Type: application/json" \
  -H "X-API-Key: my-secret-api-key" \
  -d '{"name": "my-plugin", "version": "1.0.0", "data": {...}}'

# 使用 Bearer Token
curl -X POST http://localhost:3000/api/plugins/install \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer my-secret-api-key" \
  -d '{"name": "my-plugin", ...}'
```

### 从 URL 安装插件（v1.28.0 新增）

支持通过 `sourceUrl` 字段从远程 URL 安装插件：

```bash
# 从 URL 安装插件
curl -X POST http://localhost:3000/api/plugins/install \
  -H "Content-Type: application/json" \
  -H "X-API-Key: my-secret-api-key" \
  -d '{"sourceUrl": "https://example.com/my-plugin.json"}'
```

字段说明:
- `sourceUrl` - **可选** 插件 JSON 的 HTTP/HTTPS URL
- 当提供 `sourceUrl` 时，将从 URL 下载插件并自动验证
- 当不提供 `sourceUrl` 时，使用请求体中的插件 JSON 数据

### 受保护的端点

以下端点需要认证：

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | /api/plugins/install | 安装插件 |
| DELETE | /api/plugins/:name | 删除插件 |
| POST | /api/plugins/create | 创建插件模板 |
| POST | /api/plugins/reload | 重新加载插件数据 |

### 无需认证的端点

所有读取端点（GET 请求）无需认证，包括：

- GET /api/health
- GET /api/saohua
- GET /api/types
- GET /api/styles
- GET /api/stats
- GET /api/plugins

### 开发模式

如果未设置 `SAOHUA_API_KEYS` 环境变量，认证将自动跳过，方便本地开发。

## 测试

```bash
npm test
```

## Swagger API 文档

本服务集成了 Swagger UI，提供交互式 API 文档和 Playground。

### 访问方式

- **Swagger UI**: http://localhost:3000/docs
- **OpenAPI JSON**: http://localhost:3000/api/openapi.json

### Swagger UI 功能

- 📖 可视化 API 文档
- 🧪 在线 API 测试 (Playground)
- 📋 请求/响应示例查看
- 📥 OpenAPI 规范下载

### OpenAPI 规范

完整的 OpenAPI 3.0 规范包含以下端点:

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/health | 健康检查 |
| GET | /api/health/live | 存活探针 |
| GET | /api/health/ready | 就绪探针 |
| GET | /api/metrics | 指标快照（JSON） |
| GET | /api/metrics/prometheus | Prometheus 指标导出 |
| GET | /api/saohua | 随机骚话生成 |
| GET | /api/saohua/:type | 按类型生成 |
| GET | /api/saohua/:type/:style | 按类型+风格生成 |
| POST | /api/saohua/ai | AI 智能生成 |
| GET | /api/types | 获取所有类型 |
| GET | /api/styles | 获取所有风格 |
| GET | /api/stats | 获取统计数据 |

## 许可证

MIT
