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

---

## 3. 能力矩阵

| 能力维度 | 状态 | 说明 |
|---------|------|------|
| **Web 体验页** | ✅ 完成 | 单 HTML 文件，可直接打开使用 |
| **VSCode 插件** | ✅ 完成 | 骚话生成 + 智能检测 + 日志分析 + 统计 |
| **CLI 命令行** | ✅ 完成 | 随机生成、类型/风格指定、智能检测、AI 生成、Hook 管理、配置初始化、插件管理 |
| **GitHub Action** | ✅ 完成 | CI/CD 中自动生成骚话 commit message |
| **GitHub App** | ✅ 完成 | 自动监听 PR/Issue 并评论骚话 |
| **REST API** | ✅ 完成 | Express.js HTTP 服务，支持全部生成能力 + AI + 统计 + 插件 CRUD |
| **API 文档 (Swagger)** | ✅ 完成 | OpenAPI 3.0 规范 + Swagger UI，含插件管理端点文档 |
| **Git Hook 集成** | ✅ 完成 | prepare-commit-msg hook，每次 commit 自动追加骚话 |
| **项目配置系统** | ✅ 完成 | `.saohuarc.json` 支持风格/语言/格式/AI/emoji/插件等配置 |
| **插件系统** | ✅ 完成 | 自定义骚话包，支持创建/安装/删除/列表，自动合并数据 |
| **共享核心库 (lib/)** | ✅ 完成 | 骚话数据 + 生成逻辑 + 智能检测 + AI + Hook + Config + Plugin，多端共用 |
| **AI 智能生成** | ✅ 完成 | 基于 diff 分析 + AI API + fallback 机制 |
| **Python SDK** | ✅ 完成 | 类型化客户端，覆盖全部 API 端点，21 个测试全通过 |
| **Go SDK** | ✅ 完成 | 类型化客户端（resty），覆盖全部 API 端点，18 个测试用例，支持上下文 |
| **SDK 发布流水线** | ✅ 完成 | Python SDK 多版本 CI + PyPI/TestPyPI 发布骨架，Go SDK 多版本 CI + tag 驱动 Draft Release |
| **自动化测试** | ✅ 完善 | lib/ 116 用例 + api/ 36 用例 + Python SDK 21 用例 + Go SDK 18 用例，工作流已覆盖跨语言 SDK |
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
│   └── go/                     — Go SDK (go get github.com/justlovemaki/git-saohua-go)
│       ├── git_saohua/         — 包代码（client.go + models.go）
│       ├── tests/              — 单元测试（18 用例）
│       ├── examples/           — 使用示例
│       ├── go.mod / go.sum     — 模块配置
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
2. **NPM_TOKEN / VSCE_PAT / PyPI Secrets 配置** — 需在 GitHub Secrets 中补齐发布凭据，自动发布链路才能真正启用
3. **API 服务需实际部署** — 需部署到 Railway / Vercel / 云服务器验证生产环境表现
4. **Python SDK 尚未正式发布到 PyPI** — 已具备自动发布工作流，仍需配置凭据并跑通首个正式版本
5. **Go SDK 缺少版本标签发布实践** — 已补齐 tag 驱动 release 工作流，仍需跑通首个 `sdk/go/v*` 标签发布验证

---

## 6. 演进路线图

### 近期（1-3 轮）
- ✅ **API 认证机制** — 支持 API Key / Bearer Token 双认证，保护插件管理写入端点
- ✅ **Go SDK 封装** — 第二个跨语言 SDK，扩展 Go 开发者生态
- ✅ **SDK 发布流水线** — Python SDK CI + PyPI/TestPyPI 发布骨架、Go SDK CI + tag release 流程已补齐

### 中期（4-10 轮）
- 骚话社区/市场 — 在线分享和下载自定义骚话包
- 插件远程安装 — 支持从 URL / npm / GitHub 安装插件
- WebSocket 实时推送骚话
- CLI 交互式模式（TUI）
- SDK 示例站点 / 多语言文档门户 — 降低第三方接入门槛

### 远期愿景
- 成为 Git 提交信息领域最有趣的开源工具
- 形成骚话社区生态：用户创建、分享、下载骚话包
- 从「平台」进化为「生态」

---

## 7. 近期进化记录（最近 5 轮）

| 轮次 | 日期 | 类型 | 改动概要 | 阶段变化 |
|------|------|------|---------|---------|
| 最新 | 2026-04-10 | 🔧 中迭代 | SDK 发布流水线 — 新增 Python SDK CI、PyPI/TestPyPI 发布工作流，以及 Go SDK CI、tag 驱动 Draft Release；补齐 RELEASE_CHECKLIST 与 SDK 文档，从「已有 SDK 代码」推进到「具备自动验证与发布骨架」 | Stage 5 内能力补全（生态交付能力） |
| -1 | 2026-04-10 | 🚀 大演进 | Go SDK — 新增 sdk/go/ 目录，完整 Go 客户端（client.go + models.go）+ 18 个测试用例 + 使用示例 + README，支持全部 API 端点（骚话生成/AI/插件管理），从「Python 单跨语言」到「Go+Python 双跨语言生态」 | Stage 5 内维度跃迁（双跨语言生态） |
| -2 | 2026-04-08 | 🚀 大演进 | Python SDK — 新增 sdk/python/ 目录，完整客户端 + 13 个 API 方法 + dataclass 模型 + 异常体系 + 21 个测试 + 使用示例 + README，从「JS 单一生态」到「跨语言平台」 | Stage 5 内维度跃迁（跨语言生态） |
| -3 | 2026-04-08 | 🔧 中迭代 | REST API 集成插件系统 — 新增 5 个插件 CRUD 端点 + Swagger 文档 + 11 个测试用例，API 测试达 36 个全通过 | Stage 5 内能力补全（API 全开放） |
| -4 | 2026-04-07 | 🚀 大演进 | 插件系统 — 新增 plugin-manager.js，支持自定义骚话包创建/安装/删除/列表，generator 自动加载插件数据，CLI 新增 plugin 子命令，116 测试全通过 | Stage 5 内维度跃迁（可扩展生态） |
