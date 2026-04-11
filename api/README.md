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

响应示例:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 3600.5,
    "memory": { "rss": 123456, "heapTotal": 67890 },
    "version": "1.0.0"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "message": "服务器运行中~"
  }
}
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
| GET | /api/saohua | 随机骚话生成 |
| GET | /api/saohua/:type | 按类型生成 |
| GET | /api/saohua/:type/:style | 按类型+风格生成 |
| POST | /api/saohua/ai | AI 智能生成 |
| GET | /api/types | 获取所有类型 |
| GET | /api/styles | 获取所有风格 |
| GET | /api/stats | 获取统计数据 |

## 许可证

MIT