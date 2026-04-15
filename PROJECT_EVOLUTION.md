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
- ✅ **Python SDK** 已发布，从「JS 单一生态」到「跨语言平台」，Python 开发者可通过 `pip install git-saohua` 直接使用全部 API 能力
- ✅ **Go SDK** 已发布，从「Python 单跨语言」到「Go+Python 双跨语言生态」，Go 开发者可通过 `go get github.com/justlovemaki/git-saohua-go` 直接使用全部 API 能力
- ✅ **JavaScript / TypeScript SDK** 已补齐，从「API 已开放」到「Node.js / TS 生态可直接接入」，支持 API Key / Bearer Token / timeout / 自定义 headers，并覆盖插件索引与插件管理能力
- ✅ **插件远程安装** 已完成，CLI 与 REST API 均可通过 URL 分发和安装插件，平台开始具备轻量生态分发能力
- ✅ **插件官方索引入口** 已完成，CLI 与 REST API 均支持从远程插件索引搜索、发现并安装插件，平台开始具备可发现生态能力
- ✅ **版本治理 / Release Doctor** 已完成，新增 `RELEASE.json` 作为主版本单一来源，CLI/API/core 改为动态读取版本，并通过 `bin/release-doctor.js` 做一致性校验，平台开始具备基础发布治理能力
- ✅ **插件来源锁定 / Provenance 审计** 已完成，插件安装会写入 `plugins.lock.json`，并在 CLI/API 侧可查询 `sourceType/sourceUrl/checksum/fromIndex/githubSpec/installedAt`，平台从“可发现、可安装”继续前进到“可审计、可追踪、可复盘”的生态治理阶段

---

## 3. 能力矩阵

| 能力维度 | 状态 | 说明 |
|---------|------|------|
| **Web 体验页** | ✅ 完成 | 单 HTML 文件，可直接打开使用 |
| **VSCode 插件** | ✅ 完成 | 骚话生成 + 智能检测 + 日志分析 + 统计 |
| **CLI 命令行** | ✅ 完成 | 随机生成、类型/风格指定、智能检测、AI 生成、Hook 管理、配置初始化、插件管理、交互式提交向导、全屏 TUI 提交流程 |
| **GitHub Action** | ✅ 完成 | CI/CD 中自动生成骚话 commit message |
| **GitHub App** | ✅ 完成 | 自动监听 PR/Issue 并评论骚话 |
| **REST API** | ✅ 完成 | Express.js HTTP 服务，支持全部生成能力 + AI + 统计 + 插件 CRUD |
| **API 文档 (Swagger)** | ✅ 完成 | OpenAPI 3.0 规范 + Swagger UI，含插件管理端点文档 |
| **Git Hook 集成** | ✅ 完成 | prepare-commit-msg hook，每次 commit 自动追加骚话 |
| **项目配置系统** | ✅ 完成 | `.saohuarc.json` 支持风格/语言/格式/AI/emoji/插件等配置 |
| **插件系统** | ✅ 完成 | 自定义骚话包，支持创建/安装/删除/列表，自动合并数据 |
| **插件来源审计 / 锁文件治理** | ✅ 完成 | 自动维护 `plugins.lock.json`，记录来源类型、来源地址、索引来源、GitHub 简写、SHA-256 与安装时间，CLI/API 可查询单插件 provenance |
| **插件远程安装 / GitHub 简写分发** | ✅ 完成 | 支持从 HTTP/HTTPS URL、GitHub 仓库简写 `owner/repo[:path][@ref]` 安装插件，CLI/API/文档/测试已打通 |
| **插件索引 / 市场入口** | ✅ 完成 | 支持从远程索引搜索插件并按名称安装，CLI/API/Swagger/README/测试已打通 |
| **共享核心库 (lib/)** | ✅ 完成 | 骚话数据 + 生成逻辑 + 智能检测 + AI + Hook + Config + Plugin，多端共用 |
| **AI 智能生成** | ✅ 完成 | 基于 diff 分析 + AI API + fallback 机制 |
| **Python SDK** | ✅ 完成 | 类型化客户端，覆盖全部 API 端点，21 个测试全通过 |
| **Go SDK** | ✅ 完成 | 类型化客户端（resty），覆盖全部 API 端点，18 个测试用例，支持上下文 |
| **JavaScript / TypeScript SDK** | ✅ 完成 | 原生 TS 客户端，覆盖主要 REST API 端点，支持 API Key / Bearer Token / timeout / 自定义 headers，内置 8 个单元测试 |
| **SDK 发布流水线** | ✅ 完成 | Python SDK 多版本 CI + PyPI/TestPyPI 发布骨架，Go SDK 多版本 CI + tag 驱动 Draft Release，JS SDK Node 多版本 CI + npm 发布骨架 |
| **自动化测试** | ✅ 完善 | lib/ 140 用例 + api/ 46 用例 + Python SDK 21 用例 + Go SDK 18 用例，工作流已覆盖跨语言 SDK |
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
│   ├── ai-generator.js         — AI 生成模块
│   ├── config.js               — 项目配置系统 (.saohuarc.json)
│   ├── hook-manager.js         — Git Hook 管理器 (prepare-commit-msg)
│   ├── plugin-manager.js       — 插件管理器（加载/验证/合并/安装/删除）
│   ├── plugins.lock.json       — 已安装插件来源锁文件（运行时生成）
│   ├── index.js                — 统一导出入口
│   └── test.js                 — 基础测试（116 用例）
├── api/                        — REST API 服务
│   ├── server.js               — Express 服务（含骚话生成 + 插件 CRUD 端点）
│   ├── swagger.js              — OpenAPI 3.0 文档（含插件端点）
│   └── test.js                 — API 测试（36 用例）
├── sdk/                        — 多语言 SDK
│   ├── python/                 — Python SDK (pip install git-saohua)
│   │   ├── git_saohua/         — 包代码（client + models + exceptions）
│   │   ├── tests/              — 单元测试（21 用例）
│   │   ├── examples/           — 使用示例
│   │   ├── pyproject.toml      — 包配置
│   │   └── README.md           — SDK 文档
│   ├── go/                     — Go SDK (go get github.com/justlovemaki/git-saohua-go)
│   │   ├── git_saohua/         — 包代码（client.go + models.go）
│   │   ├── tests/              — 单元测试（18 用例）
│   │   ├── examples/           — 使用示例
│   │   ├── go.mod / go.sum     — 模块配置
│   │   └── README.md           — SDK 文档
│   └── javascript/             — JavaScript / TypeScript SDK (npm install git-saohua)
│       ├── src/index.ts        — 类型化客户端入口
│       ├── test.js             — 单元测试（8 用例）
│       ├── examples/           — Node.js 示例
│       ├── package.json        — npm 包配置
│       └── README.md           — SDK 文档
├── index.html                  — Web 体验页（独立单文件）
├── cli/                        — CLI 命令行工具（引用 lib/）
├── vscode-extension/           — VSCode 插件（引用 lib/）
├── action/                     — GitHub Action（引用 lib/）
└── github-app/                 — GitHub App（引用 lib/）
```

架构为「统一核心 + 多端适配 + 插件扩展 + API 全能力开放 + 跨语言 SDK」模式。

---

## 5. 已知问题与技术债

1. **Web 页面骚话数据独立** — index.html 内嵌骚话数据，未引用 lib/（单文件设计限制）
2. **NPM_TOKEN / VSCE_PAT / PyPI Secrets 配置** — 需在 GitHub Secrets 中补齐发布凭据，自动发布链路才能真正启用（现已覆盖 CLI / core / JS SDK，Python/Go 也已有发布骨架）
3. **API 服务需实际部署** — 需部署到 Railway / Vercel / 云服务器验证生产环境表现
4. **Python SDK 尚未正式发布到 PyPI** — 已具备自动发布工作流，仍需配置凭据并跑通首个正式版本
5. **Go SDK 缺少版本标签发布实践** — 已补齐 tag 驱动 release 工作流，仍需跑通首个 `sdk/go/v*` 标签发布验证
6. **插件索引可信度仍不足** — 已补齐官方索引入口、摘要校验、来源白名单与本地 provenance 锁定，但仍缺少插件签名、公钥信任链与发布者身份验证
7. **供应链防护仍不完整** — 已补齐 SHA-256 摘要校验、来源白名单与安装来源审计，但仍缺少签名、公钥信任链与发布者身份验证
8. **多语言 SDK 版本治理尚未完全统一** — 当前主项目版本已纳入 `RELEASE.json`，但 Python / JavaScript SDK 仍保留各自包版本节奏，后续需要补齐更细粒度的发布矩阵与自动化校验

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

### 中期（4-10 轮）
- 骚话社区/市场 — 在线分享和下载自定义骚话包
- 插件签名 / 校验链路 — 在来源白名单、摘要校验基础上，继续增加签名校验、公钥信任链等供应链能力
- 插件远程安装增强 — 支持 npm / GitHub Release / Git 仓库快捷安装与来源校验
- WebSocket 实时推送骚话
- CLI 全屏 TUI 模式 — 从 readline 向导继续升级为全屏终端交互体验
- SDK 示例站点 / 多语言文档门户 — 统一 Python / Go / JS 文档、示例与认证接入说明，降低第三方接入门槛

### 远期愿景
- 成为 Git 提交信息领域最有趣的开源工具
- 形成骚话社区生态：用户创建、分享、下载骚话包
- 从「平台」进化为「生态」

---

## 7. 近期进化记录（最近 5 轮）

| 轮次 | 日期 | 类型 | 改动概要 | 阶段变化 |
|------|------|------|---------|---------|
| 最新 | 2026-04-15 | 🚀 大演进 | 插件来源锁定 / Inspect — 在 `lib/plugin-manager` 为插件安装补齐 provenance 元数据与 `plugins.lock.json` 锁文件，CLI 新增 `plugin inspect <name>`，REST API 新增 `GET /api/plugins/:name`，并同步 README / Swagger / lib+cli+api 测试；项目从“插件可发现、可安装”继续前进到“插件可审计、可追踪、可复盘”的平台治理能力 | Stage 5 不变（生态治理能力增强） |
| -1 | 2026-04-15 | 🔧 中迭代 | GitHub 简写插件安装 — 在 `lib/plugin-manager` 新增 GitHub shorthand 解析与默认路径回退，CLI 增加 `plugin install --github`，REST API `/api/plugins/install` 支持 `githubSpec`，插件索引项支持 `github` 字段，并补齐 Swagger、CLI 文档、lib/API 测试；平台从“插件可远程分发”继续前进到“插件可直接由 GitHub 仓库名分发”的更低摩擦生态入口 | Stage 5 不变（插件生态分发体验增强） |
| -2 | 2026-04-14 | 🚀 大演进 | CLI 全屏 TUI 模式 — 新增 `git-sao-hua --tui` / `git-sao-hua tui`，通过 ANSI 全屏刷新串起语言、生成模式、类型、风格、结果预览、复制与一键提交流程，并抽出 `cli/tui.js` + CLI 测试；项目从“已有行式交互向导”继续前进到“终端内具备更沉浸、更专注的提交编排体验” | Stage 5 内维度跃迁（CLI 终端体验） |
| -3 | 2026-04-14 | 🚀 大演进 | 版本治理 / Release Doctor — 新增根级 `RELEASE.json` 作为主版本单一来源，CLI / API health / OpenAPI / core 改为动态读取版本，补齐 `bin/release-doctor.js` 一致性检查与版本相关测试，并同步 README；项目从“多端功能齐全”继续前进到“多包版本可治理、发布漂移可发现”的平台化发布工程能力 | Stage 5 内维度跃迁（发布治理） |
| -4 | 2026-04-13 | 🚀 大演进 | 插件来源白名单 — 在 `lib/plugin-manager` 增加远程插件 URL / 索引 URL host allowlist 校验，默认仅信任 GitHub 官方源，并支持 CLI/API 显式传参、`.saohuarc.json` 的 `plugins.allowedHosts`、环境变量 `PLUGIN_ALLOWED_HOSTS` 多层配置；同时补齐 lib + API 测试与 README，从“插件可校验”继续进化到“插件来源可控、默认更安全”的供应链防护 | Stage 5 内维度跃迁（插件供应链来源控制） |
| -5 | 2026-04-13 | 🚀 大演进 | CLI 交互式提交向导 — 升级 `git-sao-hua -i`，支持语言选择、模板/AI/智能检测三种生成模式、生成预览，以及重新生成 / 切换风格 / 复制 / 直接 git commit，并同步修正文档中的交互模式与语言示例；项目从“单次命令触发”继续前进到“终端内可迭代完成提交决策与执行”的交互体验 | Stage 5 内维度跃迁（CLI 交互体验） |
