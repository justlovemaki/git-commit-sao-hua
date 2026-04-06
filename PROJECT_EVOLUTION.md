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
- 提供开放 API，让第三方工具和服务可以调用骚话生成能力

---

## 2. 当前成熟度阶段

**Stage 5: 平台期（开发者工作流深度集成）**

原因：
- 核心功能（骚话生成 + 智能检测 + AI 生成）已稳定
- 七端（Web / VSCode / CLI / GitHub Action / GitHub App / REST API / **Git Hook**）均已实现
- ✅ Git Hook 集成已实现，从「主动调用工具」跃迁到「无感嵌入开发者工作流」
- ✅ 项目配置系统（`.saohuarc.json`）支持团队级自定义
- ✅ Hook 安全机制：自动备份、链式调用、静默降级、跳过机制
- ✅ 完善的工程化：全端 113+ 测试、CI 覆盖、Docker 部署
- 项目已从「可调用平台」进化为「可嵌入的开发者基础设施」

---

## 3. 能力矩阵

| 能力维度 | 状态 | 说明 |
|---------|------|------|
| **Web 体验页** | ✅ 完成 | 单 HTML 文件，可直接打开使用 |
| **VSCode 插件** | ✅ 完成 | 骚话生成 + 智能检测 + 日志分析 + 统计 |
| **CLI 命令行** | ✅ 完成 | 随机生成、类型/风格指定、智能检测、AI 生成、Hook 管理、配置初始化 |
| **GitHub Action** | ✅ 完成 | CI/CD 中自动生成骚话 commit message |
| **GitHub App** | ✅ 完成 | 自动监听 PR/Issue 并评论骚话 |
| **REST API** | ✅ 完成 | Express.js HTTP 服务，支持全部生成能力 + AI + 统计 |
| **API 文档 (Swagger)** | ✅ 完成 | OpenAPI 3.0 规范 + Swagger UI 交互式 Playground |
| **Git Hook 集成** | ✅ 完成 | prepare-commit-msg hook，每次 commit 自动追加骚话（v1.26.0 新增） |
| **项目配置系统** | ✅ 完成 | `.saohuarc.json` 支持风格/语言/格式/AI/emoji 等团队配置（v1.26.0 新增） |
| **共享核心库 (lib/)** | ✅ 完成 | 骚话数据 + 生成逻辑 + 智能检测 + AI + Hook + Config，多端共用 |
| **AI 智能生成** | ✅ 完成 | 基于 diff 分析 + AI API + fallback 机制 |
| **自动化测试** | ✅ 完善 | lib/ 88 用例 + api/ 25 用例 + github-app/ 17 用例 = 130 个测试 |
| **CI/CD** | ✅ 完成 | 多工作流覆盖全端自动测试 + Docker 构建 |
| **国际化** | ✅ 完成 | 多语言支持（中/英/日） |

---

## 4. 架构概述

```
项目结构：
├── lib/                        — 共享核心库 (git-sao-hua-core)
│   ├── sao-hua-data.js         — 唯一的骚话数据源（12类型 × 5风格）
│   ├── generator.js            — 共享生成逻辑
│   ├── smart-detector.js       — 智能检测模块
│   ├── ai-generator.js         — AI 生成模块
│   ├── config.js               — 项目配置系统 (.saohuarc.json)
│   ├── hook-manager.js         — Git Hook 管理器 (prepare-commit-msg)
│   ├── index.js                — 统一导出入口
│   └── test.js                 — 基础测试（88 用例）
├── api/                        — REST API 服务
│   ├── server.js               — Express.js 主入口（8 个端点）
│   ├── test.js                 — API 测试（25 用例）
│   └── Dockerfile              — Docker 部署配置
├── index.html                  — Web 体验页（独立单文件）
├── cli/                        — CLI 命令行工具（引用 lib/）
├── vscode-extension/           — VSCode 插件（引用 lib/）
├── action/                     — GitHub Action（引用 lib/）
└── github-app/                 — GitHub App（引用 lib/）
```

架构为「统一核心 + 多端适配」模式，七端共享 lib/ 核心库。v1.26.0 新增 config.js（配置系统）和 hook-manager.js（Hook 管理），实现从「工具调用」到「工作流嵌入」的跃迁。

---

## 5. 已知问题与技术债

1. **Web 页面骚话数据独立** — index.html 内嵌骚话数据，未引用 lib/（单文件设计限制）
2. **NPM_TOKEN / VSCE_PAT 配置** — 需在 GitHub Secrets 中添加以启用自动发布
3. **API 服务需实际部署** — 需部署到 Railway / Vercel / 云服务器验证生产环境表现

---

## 6. 演进路线图

### 近期（1-3 轮）
- 部署 REST API 到 Railway/Vercel，验证生产环境
- SDK 封装（Python/Go 客户端），从「HTTP API」到「语言原生调用」
- API 添加认证机制（API Key / OAuth）

### 中期（4-10 轮）
- 骚话社区/市场 — 用户分享和下载自定义骚话包
- 插件化架构 — 支持自定义骚话生成器插件
- WebSocket 实时推送骚话

### 远期愿景
- 成为 Git 提交信息领域最有趣的开源工具
- 形成骚话社区生态
- 从「平台」进化为「生态」

---

## 7. 近期进化记录（最近 5 轮）

| 轮次 | 日期 | 类型 | 改动概要 | 阶段变化 |
|------|------|------|---------|---------|
| 最新 | 2026-04-06 | 🚀 大演进 | Git Hook 集成 + 配置系统 — 新增 config.js/hook-manager.js/CLI 子命令(hook/init)，从「手动调用」到「无感嵌入工作流」，88 测试全通过 | Stage 5 内维度跃迁（工作流嵌入） |
| -1 | 2026-04-05 | 🔧 中迭代 | OpenAPI/Swagger 文档 — 新增 swagger.js + Swagger UI Playground + OpenAPI JSON 端点 | 不变 |
| -2 | 2026-04-05 | 🚀 大演进 | REST API 服务 — 新增 api/ 目录，Express.js 8 端点 + 23 测试 + Docker + CI | Stage 5 内维度跃迁（服务化） |
| -3 | 2026-04-02 | 🔧 中迭代 | CLI AI 集成 — 新增 --ai 参数，CLI 可调用 AI 生成骚话 | 不变 |
| -4 | 2026-04-01 | 🚀 大演进 | AI 智能生成模块 — 新增 ai-generator.js，从「模板生成」到「AI 个性化生成」 | Stage 4 → Stage 5 |
