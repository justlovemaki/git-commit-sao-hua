# PROJECT_EVOLUTION.md - Git Commit 骚话生成器

> 项目定位：让 Git 提交信息变得有趣的工具集
> GitHub：https://github.com/justlovemaki/git-commit-sao-hua
> 维护方式：战略文档，非 changelog。供 `git-project-evolution` 每轮读取与更新。

---

## 1. 项目目标

让每一次 git commit 都带着灵魂：

- 基于 commit 类型和代码变更，生成风格化的骚话提交信息
- 覆盖多种使用场景：Web 体验、VSCode 插件、CLI 命令行、REST API、Git Hook 自动集成
- 智能检测代码变更类型，自动推荐最合适的 commit 类型
- 让提交信息从「无聊」变成「有趣」，从「手动调用」变成「无感集成」
- 提供开放 API、插件系统和多语言 SDK，让第三方工具和用户可以扩展骚话生成能力

---

## 2. 当前成熟度阶段

**Stage 5: 平台期（跨语言 SDK + 插件生态 + API 全能力开放）**

原因：
- 核心功能（骚话生成 + 智能检测 + AI 生成）已稳定
- 七端（Web / VSCode / CLI / GitHub Action / GitHub App / REST API / Git Hook）均已实现
- 插件系统 + REST API 插件管理端点已完成
- ✅ **Python SDK** 已发布，从「JS 单一生态」到「跨语言平台」，Python 开发者可通过 `pip install git-saohua` 直接使用全部 API 能力，并已补齐 SSE / WebSocket 实时流式消费接口
- ✅ **Go SDK** 已发布，从「Python 单跨语言」到「Go+Python 双跨语言生态」，Go 开发者可通过 `go get github.com/justlovemaki/git-saohua-go` 直接使用全部 API 能力，并已补齐 SSE / WebSocket 实时流式消费接口
- ✅ **JavaScript / TypeScript SDK** 已补齐，从「API 已开放」到「Node.js / TS 生态可直接接入」，支持 API Key / Bearer Token / timeout / 自定义 headers，并覆盖插件索引、插件管理与批量骚话生成能力
- ✅ **批量生成能力** 已完成，REST API、新增 CLI `batch --file <json> [--format text|json]` 与 JavaScript / Python / Go SDK 已统一接入共享批量生成核心，平台从“单次请求式集成”继续前进到“CLI / API / SDK 可共用的批处理消费能力”
- ✅ **插件远程安装** 已完成，CLI 与 REST API 均可通过 URL 分发和安装插件，平台开始具备轻量生态分发能力
- ✅ **插件官方索引入口** 已完成，CLI 与 REST API 均支持从远程插件索引搜索、发现并安装插件，平台开始具备可发现生态能力
- ✅ **版本治理 / Release Doctor** 已完成，新增 `RELEASE.json` 作为主版本单一来源，CLI/API/core 改为动态读取版本，并通过 `bin/release-doctor.js` 做一致性校验，平台开始具备基础发布治理能力
- ✅ **插件来源锁定 / Provenance 审计** 已完成，插件安装会写入 `plugins.lock.json`，并在 CLI/API 侧可查询 `sourceType/sourceUrl/checksum/fromIndex/githubSpec/installedAt`，平台从“可发现、可安装”继续前进到“可审计、可追踪、可复盘”的生态治理阶段
- ✅ **API 可观测性 / 运维治理** 已完成，新增 request ID、请求聚合指标、`/api/health/live`、`/api/health/ready` 与 `/api/metrics`，REST API 从“功能开放”继续前进到“可部署、可探测、可观测”的平台运行能力
- ✅ **Prometheus 指标导出** 已完成，在 `/api/metrics` JSON 快照基础上新增 `/api/metrics/prometheus` 标准文本导出，补齐按方法+路由聚合的请求数与平均耗时、进程 uptime、内存使用等指标，API 从“可观测”继续前进到“可被主流监控系统直接抓取”的平台接入能力
- ✅ **插件作者发布工具链** 已完成，CLI 新增 `plugin validate` 与 `plugin pack`，核心库补齐本地插件校验、SHA-256 计算、建议索引条目与 metadata 生成能力，平台从“插件可发现、可安装、可审计”继续前进到“插件作者可自助发布、可生成索引元数据、可降低接入摩擦”的生态生产力阶段
- ✅ **Release Notes 自动生成** 已完成，CLI 新增 `release-notes` 子命令，核心库补齐 conventional commit 解析、Git 历史聚���与 Markdown 发布说明生成能力，平台从“能生成单条 commit 骚话”继续前进到“能沉淀版本叙事、可直接产出发布说明”的发布运营能力
- ✅ **Release Notes 结构化输出** 已完成，CLI `--format json` 输出 machine-readable JSON，含 title/version/range/repo/baseUrl/compare/summary/sections/commits 全字段，兼容自动化流水线消费
- ✅ **GitHub Release Payload 输出** 已完成，CLI `release-notes --format github-release-json` 与核心库 `buildGitHubReleasePayload` 可直接产出 GitHub Releases API 兼容 payload（含 `tag_name/name/body/draft/prerelease/target_commitish`），发布链路从“能写发布说明”继续前进到“可直接驱动 GitHub Release 自动化”
- ✅ **CHANGELOG 回写联动** 已完成，核心库新增 `syncReleaseNotesToChangelog()`，CLI `release-notes` 新增 `--sync-changelog` / `--changelog <path>`，可在生成 release notes 后自动创建或更新 CHANGELOG 版本章节，并对已存在版本执行替换去重，发布治理链路从“能生成 release notes / GitHub payload”继续前进到“能把版本叙事稳定沉淀回 changelog 资产”
- ✅ **GitHub Release Asset Manifest** 已完成，核心库新增本地资产元数据采集与 `buildGitHubReleaseManifest()`，CLI `release-notes` 新增 `--format github-release-manifest-json` 与可重复 `--asset <path>`，可直接输出 `githubRelease + assets(name/path/size/sha256/contentType)` 的发布清单，发布治理链路从“能生成 release 文案与 changelog”继续前进到“能把本地产物接入 CI/CD 发布上传链路”
- ✅ **GitHub Release 直连发布** 已完成，核心库新增 `createGitHubRelease()` / `uploadReleaseAsset()` / `deleteExistingAsset()`，CLI 新增 `github-release` 子命令，支持 dry-run、创建或更新 Release、上传本地资产，以及可选同步 `CHANGELOG`，发布治理链路从“只能输出 manifest 交给外部流水线处理”继续前进到“CLI 可直接驱动 GitHub Release 发布执行”
- ✅ **Release 治理能力 API / SDK 下沉** 已完成，REST API 新增 `POST /api/release-notes/generate` 与 `POST /api/release-notes/manifest`，JavaScript / Python / Go SDK 同步开放 release notes / GitHub release manifest 客户端方法，平台从“CLI / core 才能消费发布治理能力”继续前进到“服务端与多语言集成可直接编排版本叙事和发布清单”的开放发布能力
- ✅ **自然语言提交能力 API / SDK 下沉** 已完成，原本主要停留在 CLI 的自然语言提交分析/生成功能已下沉到 REST API，并同步开放给 JavaScript / Python / Go SDK，平台从“CLI 独享的自然语言入口”继续前进到“服务端与多语言集成可直接消费的 NL commit 能力”
- ✅ **SSE 实时流式骚话推送** 已完成，REST API 新增 `GET /api/saohua/stream`，支持 `type/style/lang/count/intervalMs` 参数并以 `meta/item/done/error` 事件持续输出候选；JavaScript / TypeScript SDK 同步新增 `streamSaohua()` 消费入口，平台从“单次请求式返回结果”继续前进到“可被终端、机器人、前端实时消费的流式集成能力”
- ✅ **WebSocket 实时流式骚话推送** 已完成，REST API 新增 `ws://.../api/saohua/ws`，消息结构与 SSE 对齐为 `{ event, data }`，支持 `meta/item/done/error` 事件；JavaScript / TypeScript SDK 同步新增 `streamSaohuaWs()`，平台从“仅能单向 SSE 推送”继续前进到“可被机器人、终端 UI、浏览器长连接更稳定消费的双协议实时集成能力”
- ✅ **插件发布交付包 / Submission Kit** 已完成，CLI 新增 `plugin release-kit`，核心库可一次性生成 `metadata.json`、`index-entry.json` 与 `submission.md`，插件生态从“作者能本地校验和打包”继续前进到“作者可直接产出上架交付物、降低提交官方/自建索引的操作摩擦”
- ✅ **MCP Server / Agent 集成入口** 已完成，新增 `mcp-server/` 轻量子系统，通过 stdio + JSON-RPC 暴露 `generate_saohua`、`batch_generate_saohua`、`generate_from_natural_language`、`list_taxonomy` 等工具，并补齐 MCP `resources/list` / `resources/read` / `prompts/list` / `prompts/get`，平台从“人和 SDK 调用 API/CLI”继续前进到“AI Agent 可通过 Model Context Protocol 直接把骚话能力接进工作流，并可自助发现知识与提示模板”
- ✅ **MCP HTTP 远程传输** 已完成，在保留 stdio MCP 入口的基础上，新增基于 Node 内置 `http` 的远程 JSON-RPC 入口、`GET /health` 健康检查，以及 Bearer Token 保护能力，平台从“只能本地进程内接入 MCP”继续前进到“可被远程 Agent 网关、安全代理和自建服务稳定接入”的网络化集成阶段
- ✅ **插件作者能力 API / SDK 下沉** 已完成，原本主要停留在 CLI / core 的插件作者工作流（校验、打包预览、release kit 预览）已下沉到 REST API `POST /api/plugin-author/validate|pack|release-kit`，并同步开放给 JavaScript / Python / Go SDK，平台从“作者需在本地 CLI 中手工走流程”继续前进到“CI、Web 控制台、远程服务与多语言集成可直接编排插件发布准备”的生态接入阶段
- ✅ **ChatOps Payload 集成能力** 已完成，新增共享 `lib/chatops.js` 渲染层，可把单条骚话或自然语言生成结果直接输出为 `plain / slack / discord / lark / github-comment` 五类结构化 payload；REST API 新增 `POST /api/integrations/chatops/saohua` 与 `POST /api/integrations/chatops/natural`，JavaScript / Python / Go SDK 同步开放客户端方法与测试，平台从“能产出 commit 文案”继续前进到“能把 commit 文案直接接进聊天机器人、通知系统与工作流编排”的 ChatOps 集成阶段
- ✅ **ChatOps Webhook 直投能力** 已完成，在既有 payload 渲染层之上新增 webhook 直投链路，支持 Slack / Discord / 飞书 / GitHub Comment 目标、可选自定义 headers、超时控制与 HMAC-SHA256 签名头；REST API 新增 `/api/integrations/chatops/saohua/deliver` 与 `/api/integrations/chatops/natural/deliver`，JavaScript / Python SDK 同步开放直投方法，平台从“只能导出结构化 payload 交给外部系统发送”继续前进到“可直接把骚话安全送入机器人和通知 webhook”的执行型 ChatOps 集成阶段

---

## 3. 能力矩阵

| 能力维度 | 状态 | 说明 |
|---------|------|------|
| **Web 体验页** | ✅ 完成 | 单 HTML 文件，可直接打开使用 |
| **VSCode 插件** | ✅ 完成 | 骚话生成 + 智能检测 + 日志分析 + 统计 |
| **CLI 命令行** | ✅ 完成 | 随机生成、类型/风格指定、智能检测、AI 生成、批量生成、Hook 管理、配置初始化、插件管理、交互式提交向导、全屏 TUI 提交流程、自然语言提交 (v1.35.0) |
| **GitHub Action** | ✅ 完成 | CI/CD 中自动生成骚话 commit message |
| **GitHub App** | ✅ 完成 | 自动监听 PR/Issue 并评论骚话 |
| **REST API** | ✅ 完成 | Express.js HTTP 服务，支持全部生成能力 + AI + 批量生成 + 自然语言分析/生成 + 统计 + 插件 CRUD，并补齐健康探针、请求追踪、运行时指标快照与 Prometheus 标准导出 |
| **ChatOps Payload 集成** | ✅ 完成 | 可把骚话与自然语言生成结果直接渲染为 `plain / slack / discord / lark / github-comment` 五类结构化消息 payload，API 与 JavaScript / Python / Go SDK 已同步开放，适合机器人通知、CI 工作流和评论系统复用 |
| **ChatOps Webhook 直投** | ✅ 完成 | 在 payload 渲染基础上支持 webhook 直投、响应状态回传、可选 HMAC-SHA256 签名、自定义 headers 与超时控制，REST API 与 JavaScript / Python SDK 已开放 |
| **SSE 实时流式生成** | ✅ 完成 | `GET /api/saohua/stream` 支持按类型/风格/语言持续推送骚话候选，输出 `meta/item/done/error` 事件，适合终端预览、机器人和前端实时消费 |
| **WebSocket 实时流式生成** | ✅ 完成 | `ws://.../api/saohua/ws` 支持与 SSE 同构的 `{ event, data }` 消息，适合机器人、终端 UI 与浏览器长连接消费 |
| **API 可观测性 / 运维治理** | ✅ 完成 | 新增 request ID、中间件级请求聚合、`/api/health/live`、`/api/health/ready`、`/api/metrics` 与 `/api/metrics/prometheus`，API 已具备部署探针、运行态观察与 Prometheus 直接抓取能力 |
| **API 文档 (Swagger)** | ✅ 完成 | OpenAPI 3.0 规范 + Swagger UI，含插件管理与可观测性端点文档 |
| **Git Hook 集成** | ✅ 完成 | prepare-commit-msg hook，每次 commit 自动追加骚话 |
| **项目配置系统** | ✅ 完成 | `.saohuarc.json` 支持风格/语言/格式/AI/emoji/插件等配置 |
| **插件系统** | ✅ 完成 | 自定义骚话包，支持创建/安装/删除/列表，自动合并数据 |
| **插件来源审计 / 锁文件治理** | ✅ 完成 | 自动维护 `plugins.lock.json`，记录来源类型、来源地址、索引来源、GitHub 简写、SHA-256 与安装时间，CLI/API 可查询单插件 provenance |
| **插件远程安装 / GitHub 简写分发** | ✅ 完成 | 支持从 HTTP/HTTPS URL、GitHub 仓库简写 `owner/repo[:path][@ref]` 安装插件，CLI/API/文档/测试已打通 |
| **插件索引 / 市场入口** | ✅ 完成 | 支持从远程索引搜索插件并按名称安装，CLI/API/Swagger/README/测试已打通 |
| **插件作者发布工具链** | ✅ 完成 | CLI 支持 `plugin validate` / `plugin pack`，核心库可生成 SHA-256、建议索引条目与 metadata JSON，降低第三方插件接入与发布成本 |
| **插件发布交付包 / Submission Kit** | ✅ 完成 | CLI `plugin release-kit` 与核心库 `generateReleaseKit()` 可一次性生成 metadata、独立索引条目和提交模板 Markdown，覆盖插件上架前的交付物准备 |
| **插件作者 API / 多语言 SDK** | ✅ 完成 | REST API 已开放 `POST /api/plugin-author/validate|pack|release-kit`，JavaScript / Python / Go SDK 同步支持直接提交插件对象或 JSON 字符串，返回 checksum、index entry、submission markdown 等作者侧产物 |
| **Release Notes / 发布说明生成** | ✅ 完成 | CLI `release-notes` 可基于 git log 直接输出 Markdown/JSON 发布说明，核心库可解析 conventional commit、按章节聚合并生成结构化产物 |
| **Release Notes GitHub 元数据富化** | ✅ 完成 | CLI `release-notes --enrich-github` 可基于 PR 编号补充 labels / author / PR 汇总信息，也支持 `--github-metadata-file` 离线注入 metadata，核心库已补齐富化能力与结构化输出 |
| **GitHub Release 自动化 Payload** | ✅ 完成 | CLI `release-notes --format github-release-json` 与核心库 `buildGitHubReleasePayload` 可直接输出 GitHub Releases API 兼容 JSON，支持 tag/target/draft/prerelease/附加说明 |
| **GitHub Release Asset Manifest** | ✅ 完成 | CLI `release-notes --format github-release-manifest-json --asset <path>` 与核心库 `collectAssetMetadataBatch()` / `buildGitHubReleaseManifest()` 可直接输出 GitHub Release payload + 本地资产清单，覆盖 `name/path/size/sha256/contentType`，方便 CI/CD 后续上传 release assets |
| **GitHub Release 直连发布** | ✅ 完成 | CLI `github-release [range] --repo owner/repo [--tag <tag>] [--update] [--asset <path>] [--dry-run]` 可直接创建或更新 GitHub Release 并上传本地资产；核心库同步开放 `createGitHubRelease()` / `uploadReleaseAsset()` / `deleteExistingAsset()` 供外部流水线复用 |
| **Release 治理 API / 多语言 SDK** | ✅ 完成 | REST API 已开放 release notes / manifest 生成端点，JavaScript / Python / Go SDK 同步可直接生成 Markdown release notes、GitHub release payload 与资产 manifest，发布治理从“CLI 内部能力”继续前进到“远程服务与多语言集成可直接复用” |
| **CHANGELOG 回写 / 发布资产沉淀** | ✅ 完成 | CLI `release-notes --sync-changelog [--changelog <path>]` 与核心库 `syncReleaseNotesToChangelog()` 可自动创建 CHANGELOG、前置插入新版本章节，并在版本已存在时执行替换去重 |
| **共享核心库 (lib/)** | ✅ 完成 | 骚话数据 + 生成逻辑 + 智能检测 + AI + Hook + Config + Plugin + Release Notes，多端共用 |
| **AI 智能生成** | ✅ 完成 | 基于 diff 分析 + AI API + fallback 机制 |
| **Python SDK** | ✅ 完成 | 类型化客户端，覆盖全部 API 端点，并补齐批量骚话、自然语言分析/生成、release notes / manifest 生成，以及 SSE / WebSocket 实时流式消费模型 |
| **Go SDK** | ✅ 完成 | 类型化客户端（resty），覆盖全部 API 端点，并补齐批量骚话、自然语言分析/生成、release notes / manifest 生成，以及 SSE / WebSocket 实时流式消费接口（handler + channel） |
| **JavaScript / TypeScript SDK** | ✅ 完成 | 原生 TS 客户端，覆盖主要 REST API 端点，支持 API Key / Bearer Token / timeout / 自定义 headers，并补齐 `batchSaohua(items[])`、自然语言分析/生成与 release notes / manifest 方法 |
| **JavaScript / TypeScript SDK 流式消费** | ✅ 完成 | 新增 `streamSaohua()`，可直接消费 API SSE 流并通过回调接收 `meta/item/done/error` 事件 |
| **SDK 发布流水线** | ✅ 完成 | Python SDK 多版本 CI + PyPI/TestPyPI 发布骨架，Go SDK 多版本 CI + tag 驱动 Draft Release，JS SDK Node 多版本 CI + npm 发布骨架 |
| **MCP Server / Agent 工具入口** | ✅ 完成 | 新增 `mcp-server/server.js`，通过 stdio + JSON-RPC 实现 `initialize`、`tools/list`、`tools/call`，并补齐 `resources/list` / `resources/read` / `prompts/list` / `prompts/get`，让 Claude Desktop / Cursor / OpenAI Agents 等 MCP 客户端不仅能调用骚话生成、批量生成、自然语言生成与类型/风格查询，也能读取 taxonomy / usage 资源并复用 prompt 模板 |
| **MCP HTTP 远程传输** | ✅ 完成 | 新增 `GET /health` 与 `POST /mcp` 远程入口，支持 Bearer Token 鉴权（`MCP_AUTH_TOKEN`），适合自建 Agent 网关、远程代理和服务化部署 |
| **自动化测试** | ✅ 完善 | lib/ 140+ 用例 + API 自然语言/Release 端点覆盖 + Python / JS SDK 自然语言与 Release 客户端测试 + CLI 测试 + MCP server stdio/HTTP 端到端协议测试，工作流已覆盖全端 |
| **CI/CD** | ✅ 完成 | 多工作流覆盖全端自动测试 + Docker 构建 + SDK 发布流程 |
| **国际化** | ✅ 完成 | 多语言支持（中/英/日） |
| **API 认证机制** | ✅ 完成 | 支持 API Key + Bearer Token 双认证，保护插件管理写入端点 |

---

## 4. 架构概述

```
项目结构：
├── lib/                        — 共享核心库 (git-sao-hua-core)
│   ├── sao-hua-data.js         — 唯一的骚话数据源（12类型 × 5风格）
│   ├── generator.js            — 共享生成逻辑（自动加载插件数据）
│   ├── smart-detector.js       — 智能检测模块
│   ├── ai-generator.js        — AI 生成模块
│   ├── config.js              — 项目配置系统 (.saohuarc.json)
│   ├── hook-manager.js        — Git Hook 管理器 (prepare-commit-msg)
│   ├── plugin-manager.js      — 插件管理器（加载/验证/合并/安装/删除）
│   ├── release-notes.js       — Release Notes 生成器（含 buildReleaseNotesData 结构化输出）
│   ├── plugins.lock.json    — 已安装插件来源锁文件（运行时生成）
│   ├── index.js              — 统一导出入口
│   └── test.js               — 基础测试（140+ 用例）
├── api/                        — REST API 服务
│   ├── server.js             — Express 服务（含骚话生成 + 自然语言分析/生成 + release notes / manifest + 插件 CRUD + health/metrics 端点）
│   ├── metrics.js            — API 请求追踪与运行时指标聚合
│   ├── swagger.js            — OpenAPI 3.0 文档（含自然语言、Release、插件与可观测性端点）
│   └── test.js               — API 测试（含自然语言与 Release 端点覆盖）
├── sdk/                        — 多语言 SDK
│   ├── python/               — Python SDK (pip install git-saohua)
│   │   ├── git_saohua/       — 包代码（client + models + exceptions）
│   │   ├── tests/            — 单元测试（21 用例）
│   │   ├── examples/         — 使用示例
│   │   ├── pyproject.toml   — 包配置
│   │   └── README.md        — SDK 文档
│   ├── go/                   — Go SDK (go get github.com/justlovemaki/git-saohua-go)
│   │   ├── git_saohua/       — 包代码（client.go + models.go）
│   │   ├── tests/            — 单元测试（18 用例）
│   │   ├── examples/        — 使用示例
│   │   ├── go.mod / go.sum   — 模块配置
│   │   └── README.md        — SDK 文档
│   └── javascript/          — JavaScript / TypeScript SDK (npm install git-saohua)
│       ├── src/index.ts     — 类型化客户端入口
│       ├── test.js        — 单元测试（8 用例）
│       ├── examples/     — Node.js 示例
│       ├── package.json  — npm 包配置
│       └── README.md    — SDK 文档
├── index.html                  — Web 体验页（独立单文件）
├── cli/                        — 命令行工具（引用 lib/）
│   ├── index.js              — CLI 主程序
│   ├── tui.js              — TUI 组件
│   └── test.js              — CLI 测试
├── vscode-extension/          — VSCode 插件（引用 lib/）
├── action/                     — GitHub Action（引用 lib/）
└── github-app/               — GitHub App（引用 lib/）
```

架构为「统一核心 + 多端适配 + 插件扩展 + API 全能力开放 + 跨语言 SDK」模式。

---

## 5. 已知问题与技术债

1. **Web 页面骚话数据独立** — index.html 内嵌骚话数据，未引用 lib/（单文件设计限制）
2. **NPM_TOKEN / VSCE_PAT / PyPI Secrets 配置** — 需在 GitHub Secrets 中补齐发布凭据，自动发布链路才能真正启用
3. **API 服务需实际部署** — 需部署到 Railway / Vercel / 云服务器验证生产环境表现
4. **Python SDK 尚未正式发布到 PyPI** — 已具���自���发布工作流，仍需配置凭据并跑通首个正式版本
5. **Go SDK 缺少版本标签发布实践** — 已补齐 tag 驱动 release 工作流，仍需跑通首个 `sdk/go/v*` 标签发布验证
6. **API metrics 仍未覆盖分布式观测** — 当前已具备 `/api/metrics` JSON 快照与 `/api/metrics/prometheus` 标准抓取接口，但尚未接入 OpenTelemetry tracing，也没有跨实例聚合能力
7. **插件发布者身份链仍不完整** — 已补齐插件签名、索引签名校验与本地锁文件记录，但仍缺少官方信任根、公钥轮换策略、发布者身份绑定与撤销机制
8. **供应链防护仍不完整** — 已补齐 SHA-256 摘要校验、来源白名单、安装来源审计与 Ed25519 签名验签，但仍缺少公钥信任链、签名策略治理与发布者身份验证
9. **多语言 SDK 版本治理尚未完全统一** — 当前主项目版本已纳入 `RELEASE.json`，但 Python / JavaScript SDK 仍保留各自包版本节奏，后续需要补齐更细粒度的发布矩阵与自动化校验
10. **插件发布仍缺少真正自动上架** — 当前已补齐插件作者本地校验、摘要、签名、索引元数据与 submission kit 生成，但尚未覆盖官方索引自动提交、Release 资产自动上传与公钥托管治理
11. **Release 资产外部索引联动仍缺失** — 当前已支持 GitHub PR labels/author 富化、GitHub Release payload、CHANGELOG 自动回写、release asset manifest，以及直接执行 GitHub Release 创建/更新与本地资产上传，但尚未打通 release asset / changelog / 外部索引的全链路联动，也缺少自动覆盖同名资产的发布策略治理
12. **多语言 SDK 长连接能力刚完成对齐，仍缺生产级验收** — 当前 Python / Go SDK 已补齐 SSE 与 WebSocket 实时流式消费接口，但仍需在真实部署环境中验证断线重连、代理/负载均衡、超时配置与发布链路表现
13. **MCP Server 的协议覆盖仍未完全产品化** — 当前已支持 stdio + JSON-RPC 的 tools/resources/prompts，以及 HTTP JSON-RPC 远程入口、健康检查与 Bearer Token 保护，但尚未覆盖 OAuth/API 认证透传、SSE transport、resources 订阅能力与更细粒度的工具输出 schema
14. **插件作者 API 当前仍偏“预览态编排”** — 现已能远程返回校验结果、metadata、index entry 与 submission markdown，但尚未直接打通“提交官方索引 PR / 上传 release 资产 / 管理发布者公钥”的闭环自动上架流程
15. **ChatOps 直投仍缺少生产级队列与模板治理** — 现已能直接投递 Slack/Discord/飞书/GitHub Comment webhook，并支持签名头、headers 与超时控制，但仍缺少重试队列、目的地模板库、签名校验回执与批量路由策略

---

## 6. 演进路线图

### 近期（1-3 轮）
- ✅ **CLI 交互式提交向导** — 交互模式已支持语言选择、模板/AI/智能检测三种生成模式、结果预览，以及重新生成 / 切换风格 / 复制 / 一键提交，CLI 从“只会一次性出结果”进化到“可对话式完成 commit 生成与提交”
- ✅ **插件索引 / 市场入口** — CLI `plugin search` 与 `plugin install --from-index`、API `GET /api/plugin-registry` 与 `POST /api/plugins/install-from-index` 打通，插件开始具备可发现能力
- ✅ **插件远程安装** — CLI `plugin install --url` 与 API `sourceUrl` 打通，支持远程分发骚话包
- ✅ **GitHub 简写插件安装** — CLI `plugin install --github` 与 API `githubSpec` 打通，支持通过 `owner/repo[:path][@ref]` 直接从 GitHub 仓库分发插件，并在默认路径缺失时自动回退查找 `plugin.json`
- ✅ **插件来源锁定 / Inspect** — 新增 `plugins.lock.json` 记录插件来源、摘要与安装时间，CLI `plugin inspect <name>` 与 API `GET /api/plugins/:name` 可直接查看 provenance，平台从“能装插件”前进到“能审计插件”
- ✅ **API 认证机制** — 支持 API Key / Bearer Token 双认证，保护插件管理写入端点
- ✅ **版本治理 / Release Doctor** — 新增 `RELEASE.json` 作为主版本单一来源，CLI/API/core/OpenAPI 改为动态读取版本，`bin/release-doctor.js` 可检查 README、关键运行时入口与 package.json 一致性；平台开始从“功能多端齐全”前进到“多包发布可治理、版本漂移可发现”
- ✅ **插件 SHA-256 摘要校验** — 远程 URL 安装与索引安装支持完整性校验，开始从“可分发”进化到“可校验分发”
- ✅ **CLI 全屏 TUI 模式** — 新增 `git-sao-hua --tui` / `git-sao-hua tui`，通过 ANSI 全屏刷新提供语言、模式、类型、风格、预览、复制与一键提交流程，CLI 从“交互向导可用”继续前进到“终端内具备更沉浸、更专注的提交编排体验”
- ✅ **API 可观测性 / 运维治理** — 已补齐 request ID、请求聚合指标、`/api/health/live`、`/api/health/ready` 与 `/api/metrics`，REST API 从“功能开放”继续前进到“可部署、可探测、可观测”的平台运维能力
- ✅ **Prometheus 指标导出层** — 已在 `/api/metrics` JSON 快照基础上补齐 `/api/metrics/prometheus`，支持 Prometheus 文本协议抓取，暴露请求总量、状态码分布、按方法+路由聚合请求统计与进程资源指标
- ✅ **插件作者发布工具链** — 已补齐 `plugin validate` / `plugin pack`、本地 SHA-256 计算、建议索引条目与 metadata JSON 生成，插件生态从“可安装、可审计”继续前进到“作者可自助发布、索引维护成本更低”
- ✅ **插件签名 / 验签链路** — 已补齐 `plugin pack --sign-private-key`、`plugin verify <path|name>`、索引签名验签、锁文件签名状态记录与 CLI inspect/validate 安全反馈，插件生态从“可校验摘要”继续前进到“可验证发布者签名、具备更强供应链治理”的平台安全能力
- ✅ **Release Notes 自动生成** — 已补齐 `git-sao-hua release-notes [range] [--from ref --to ref --title text --output file]`，核心库新增 conventional commit 解析、章节聚合与 Markdown 发布说明生成能力，项目从“会说单条骚话”前进到“会总结一整个版本的演进叙事”
- ✅ **Release Notes 结构化输出** — 已补齐 `--format json` 输出 machine-readable JSON，含 title/version/range/repo/compare/summary/sections/commits 全字段，兼容自动化流水线消费
- ✅ **GitHub Release payload 输出** — 已补齐 `--format github-release-json`、`--tag`、`--target`、`--draft`、`--prerelease`、`--body`，核心库新增 `buildGitHubReleasePayload`，项目从“只能生成发布说明文案”继续前进到“可直接喂给 GitHub Releases API 的发布自动化产物”
- ✅ **Release Notes GitHub 元数据富化** — 已补齐 `--enrich-github`、`--github-token` 与 `--github-metadata-file`，核心库新增 GitHub PR 元数据抓取与结构化富化能力，Markdown/JSON/GitHub Release payload 现可补充 PR labels、作者与顶部汇总信息，发布运营链路从“静态 git log 汇总”继续前进到“带 PR 语义上下文的版本叙事”
- ✅ **CHANGELOG 自动回写** — 已补齐 `git-sao-hua release-notes --sync-changelog [--changelog <path>]` 与核心库 `syncReleaseNotesToChangelog()`，可自动创建 changelog、把新版本章节前置写入，并在版本已存在时执行替换去重，让发布说明从“生成后仍需人工搬运”继续前进到“发布资产可直接沉淀回仓库文档”
- ✅ **GitHub Release Asset Manifest** — 已补齐 `git-sao-hua release-notes --format github-release-manifest-json --asset <path>`，核心库新增本地资产元数据收集、sha256 摘要计算与 manifest 组装能力，CLI / README / lib/cli tests 已同步打通，让发布链路从“只有 release payload 文案”继续前进到“能把本地构建产物交给 CI/CD 做稳定上传”的状态
- ✅ **GitHub Release 直连发布** — 已补齐 `git-sao-hua github-release [range] --repo <owner/repo> [--tag <tag>] [--update] [--asset <path>] [--dry-run] [--sync-changelog]`，核心库同步新增 `createGitHubRelease()` / `uploadReleaseAsset()` / `deleteExistingAsset()`，CLI 可直接创建或更新 GitHub Release 并上传本地构建产物，也能在无 token 时自动退化为 dry-run 预览，让发布治理从“只会产出 manifest 供外部流水线消费”继续前进到“工具本身即可执行 GitHub Release 发布”
- ✅ **Release 治理能力 API / SDK 下沉** — 已补齐 `POST /api/release-notes/generate` 与 `POST /api/release-notes/manifest`，并为 JavaScript / Python / Go SDK 同步新增 release notes / manifest 客户端方法、测试与 README 示例，让发布治理从“CLI / core 内部可用”继续前进到“多语言服务端集成也能直接生成版本叙事与发布清单”
- ✅ **自然语言提交 API / SDK 下沉** — 已补齐 `POST /api/saohua/natural/analyze` 与 `POST /api/saohua/natural/generate`，JavaScript / Python / Go SDK 同步开放分析与生成方法，CLI / API / SDK 开始共享统一自然语言提交能力
- ✅ **Python / Go SDK 实时流式对齐** — 已为 Python SDK 补齐 `iter_stream_saohua()` / `stream_saohua()` / `iter_stream_saohua_ws()` / `stream_saohua_ws()`，为 Go SDK 补齐 `StreamSaohua()` / `StreamSaohuaChan()` / `StreamSaohuaWs()` / `StreamSaohuaWsChan()`，并同步补齐事件模型、单元测试与 README 示例，让多语言 SDK 从“只有 JS 可直接消费实时流”前进到“Python / Go / JS 三语言生态都能直接接入 SSE + WebSocket 实时骚话流”
- ✅ **SSE 实时流式骚话推送** — 已补齐 `GET /api/saohua/stream`，支持按类型/风格/语言/数量/间隔流式输出骚话候选，并在 JavaScript / TypeScript SDK 中同步开放 `streamSaohua()`，让前端、终端和机器人可直接消费实时候选流
- ✅ **WebSocket 实时流式骚话推送** — 已补齐 `ws://.../api/saohua/ws`，输出与 SSE 对齐的 `meta/item/done/error` JSON 消息，并在 JavaScript / TypeScript SDK 中同步开放 `streamSaohuaWs()`，让机器人、终端 UI 与浏览器长连接场景可用统一实时协议消费骚话候选
- ✅ **插件发布交付包 / Submission Kit** — 已补齐 `git-sao-hua plugin release-kit <path> --output-dir <dir>`，可一次性输出 `*.metadata.json`、`*.index-entry.json` 与 `*.submission.md`，并内置校验和、签名字段、索引条目与提交清单，插件生态从“作者只能手工拼装上架材料”继续前进到“作者可直接产出标准交付包、显著降低上架索引的摩擦”
- ✅ **MCP Server prompts/resources 能力补齐** — 已补齐 `resources/list` / `resources/read` / `prompts/list` / `prompts/get`，新增 server info、commit/style taxonomy、usage guide 资源与自然语言 / diff 两类 prompt 模板，并同步补齐端到端测试与 README 文档，让 MCP 接入从“只会调工具”前进到“Agent 能自助发现能力、读取知识、复用提示模板”
- ✅ **MCP HTTP 远程传输入口** — 已补齐 `MCP_HTTP_MODE=1` 下的 `GET /health` 与 `POST /mcp`，支持远程 JSON-RPC 调用 `initialize`、`tools/*`、`resources/*`、`prompts/*`，并可通过 `MCP_AUTH_TOKEN` 启用 Bearer Token 保护；项目从“只能通过 stdio 本地挂载 MCP”继续前进到“可被远程 Agent 网关、安全代理和服务化部署接入”的网络化集成状态
- ✅ **插件作者能力 API / SDK 下沉** — 已补齐 `POST /api/plugin-author/validate`、`POST /api/plugin-author/pack` 与 `POST /api/plugin-author/release-kit`，核心库新增纯内存 `validatePluginInput()`、`packPluginData()` 与 `generateReleaseKitData()`，JavaScript / Python / Go SDK 同步开放作者侧方法、测试与 README 示例；本轮刻意避开继续细化 MCP / release 子系统，转而把插件生态生产力能力从 CLI 扩展到远程服务与多语言集成
- ✅ **ChatOps Payload 集成能力** — 已补齐共享 `lib/chatops.js` 渲染层，可把随机骚话或自然语言生成结果统一导出为 `plain / slack / discord / lark / github-comment` 五类 payload；REST API 新增 `/api/integrations/chatops/saohua|natural`，JavaScript / Python / Go SDK 同步开放客户端方法、模型、测试与 README 示例，让项目从“能生成 commit 文案”继续前进到“能直接接入 ChatOps 机器人、通知系统和评论工作流”的新集成维度

### 中期（4-10 轮）
- 骚话社区/市场 — 在线分享和下载自定义骚话包
- 插件签名 / 校验链路 — 在来源白名单、摘要校验基础上，继续增加签名校验、公钥信任链等供应链能力
- 插件远程安装增强 — 支持 npm / GitHub Release / Git 仓库快捷安装与来源校验
- Release API 继续向真正发布执行编排延伸 — 增加 changelog 回写、dry-run 发布预演、同名资产覆盖策略与外部索引联动
- SDK 示例站点 / 多语言文档门户 — 统一 Python / Go / JS 文档、示例与认证接入说明，降低第三方接入门槛
- 插件作者自动上架闭环 — 在现有 validate / pack / release-kit API 基础上，继续向“官方索引 PR 自动提交、Release 资产上传、公钥托管与信任根治理”延伸
- 批量生成能力继续向 CLI / GitHub Action 渗透 — 让流水线可直接消费成批 commit 候选与 diff 列表
- Prometheus / OpenTelemetry 导出层 — 在现有 JSON 指标快照基础上补齐标准监控协议与分布式链路观测
- ChatOps webhook / 模板治理 — 在现有 payload 渲染层基础上继续补齐 webhook 投递、签名、重试与模板定制能力
- ChatOps webhook / 模板治理 — 在现有 webhook 直投基础上继续补齐失败重试队列、模板变量系统、目的地预设与批量路由策略

### 远期愿景
- 成为 Git 提交信息领域最有趣的开源工具
- 形成骚话社区生态：用户创建、分享、下载骚话包
- 从「平台」进化为「生态」

---

## 7. 近期进化记录（最近 5 轮）

| 轮次 | 日期 | 类型 | 改动概要 | 阶段变化 |
|------|------|------|---------|---------|
| 最新 | 2026-04-29 🚀 大演进 | ChatOps Webhook 直投能力 — 在 `lib/chatops.js` 上新增 webhook 直投、响应状态回传、可选 HMAC-SHA256 签名头、自定义 headers 与超时控制；REST API 新增 `/api/integrations/chatops/saohua/deliver` 与 `/api/integrations/chatops/natural/deliver`，JavaScript / Python SDK 同步开放直投方法与测试。项目从“能输出 ChatOps payload”继续前进到“能直接把骚话安全投递到机器人与通知 webhook”的执行型集成阶段 | Stage 5 不变（平台集成从渲染层走向执行层） |
| -1 | 2026-04-28 🚀 大演进 | ChatOps Payload 集成能力 — 新增 `lib/chatops.js` 统一渲染层，把骚话与自然语言生成结果直接导出为 `plain / slack / discord / lark / github-comment` 五类结构化 payload；REST API 新增 `/api/integrations/chatops/saohua` 与 `/api/integrations/chatops/natural`，JavaScript / Python / Go SDK 同步补齐客户端方法、模型、测试与 README 示例。项目从“能生成 commit 文案”继续前进到“能直接接入聊天机器人、通知系统与评论工作流”的新集成维度 | Stage 5 不变（平台集成生态扩展） |
| -2 | 2026-04-27 🚀 大演进 | Release 治理能力 API / SDK 下沉 — 在 `api/server.js` 与 `api/swagger.js` 新增 `POST /api/release-notes/generate`、`POST /api/release-notes/manifest` 两个发布治理端点，复用 `lib/release-notes.js` 完成 release notes、GitHub release payload 与资产 manifest 组装；同步为 JavaScript / Python / Go SDK 补齐客户端方法、模型、测试与 README 示例。项目从“CLI / core 才能消费发布治理能力”继续前进到“服务端与多语言集成也能直接编排发布叙事与资产清单”的开放发布能力状态 | Stage 5 不变（平台发布治理能力扩展） |
| -3 | 2026-04-26 🚀 大演进 | MCP HTTP 远程入口 — 在 `mcp-server/server.js` 新增 `createHttpServer()`，基于 Node 内置 `http` 模块提供最小依赖 HTTP 服务，新增 `GET /health` 健康检查与 `POST /mcp` JSON-RPC 入口，支持 Bearer Token 鉴权（`MCP_AUTH_TOKEN`）与可配置端口（`MCP_HTTP_PORT`）；同步补齐 `test.js` HTTP 测试、README 文档。项目从“仅 stdio 模式”继续前进到“可远程 HTTP 调用、适合 Agent 跨进程集成”的 MCP 远程入口状态 | Stage 5 不变（MCP 平台远程协议能力增强） |
| -4 | 2026-04-26 🚀 大演进 | MCP prompts/resources 能力补齐 — 在 `mcp-server/server.js` 中为 `initialize` 补齐 `resources` / `prompts` capabilities，新增 `resources/list` / `resources/read` / `prompts/list` / `prompts/get`，提供 `git-sao-hua://info/server`、commit/style taxonomy、usage guide 资源，以及自然语言 / diff 两类 prompt 模板；同步补齐 `mcp-server/test.js` 端到端测试与根 README 文档。项目从“Agent 只能调用工具”继续前进到“Agent 可自助发现能力、读取知识、复用提示模板”的更完整 MCP 平台接入状态 | Stage 5 不变（平台生态协议能力增强） |
