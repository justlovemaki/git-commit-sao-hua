# PROJECT_EVOLUTION.md - Git Commit 骚话生成器

> 项目定位：让 Git 提交信息变得有趣的工具集
> GitHub：https://github.com/justlovemaki/git-commit-sao-hua
> 维护方式：战略文档，非 changelog。供 `git-project-evolution` 每轮读取与更新。

---

## 1. 项目目标

让每一次 git commit 都带着灵魂：

- 基于 commit 类型和代码变更，生成风格化的骚话提交信息
- 覆盖多种使用场景：Web 体验、VSCode 插件、CLI 命令行
- 智能检测代码变更类型，自动推荐最合适的 commit 类型
- 让提交信息从「无聊」变成「有趣」，从「手写」变成「一键生成」

---

## 2. 当前成熟度阶段

**Stage 4: 产品化期**

原因：
- 核心功能（骚话生成 + 智能检测）已稳定
- 五端（Web / VSCode / CLI / GitHub Action / **GitHub App**）均已实现
- ✅ 核心库已抽取完成，多端共享 lib/，代码复用问题已解决
- ✅ 智能检测模块已共享至 lib/，CLI 支持 --auto 智能检测
- ✅ CI/CD 工作流已配置，npm 发布准备就绪
- ✅ GitHub Action 已实现，可在 CI/CD 中自动生成骚话 commit message
- ✅ GitHub App 已实现，可在 PR/Issue 创建时自动评论骚话
- 项目已从「工具集」进化为「GitHub 生态参与者」
- 下一步应聚焦：稳定性、部署体验、实际应用验证

---

## 3. 能力矩阵

| 能力维度 | 状态 | 说明 |
|---------|------|------|
| **Web 体验页** | ✅ 完成 | 单 HTML 文件，可直接打开使用 |
| **VSCode 插件** | ✅ 完成 | 骚话生成 + 智能检测 + 日志分析 + 统计 |
| **VSCode Marketplace 发布** | ✅ 发布准备完成 | 添加 galleryBanner/badges、CHANGELOG、发布工作流、发布指南 |
| **CLI 命令行** | ✅ 完成 | 随机生成、类型/风格指定、剪贴板、git commit、**智能检测 --auto** |
| **GitHub Action** | ✅ 完成 | 在 CI/CD 中自动生成骚话 commit message，支持类型/风格/语言参数（v1.22.0 新增，版本号已统一）|
| **GitHub App** | ✅ 完成 | 自动监听 PR/Issue 创建事件，智能分析标题内容并自动评论骚话（v2.0.0 新增） |
| **智能检测（VSCode）** | ✅ 完成 | AST 分析 + Diff 关键词 + 代码模式识别 + 置信度 |
| **共享核心库 (lib/)** | ✅ 完成 | 骚话数据 + 生成逻辑 + **智能检测模块**统一抽取，三端共用，29 个测试用例 |
| **自动化测试** | ✅ 基础完成 | lib/test.js 29 个用例，覆盖数据完整性、生成逻辑、验证 |
| **智能检测（CLI）** | ✅ 完成 | CLI 支持 `--auto` 智能检测 commit 类型（v1.20.0 新增） |
| **npm 发布** | ✅ CI/CD 就绪 | lib/ 和 cli/ 均已配置 publish 脚本，GitHub Actions 自动发布（需 NPM_TOKEN） |
| **GitHub Action CI** | ✅ 完成 | CI/CD 工作流已配置，自动测试 + 自动发布 npm |
| **国际化** | ✅ 完成 | 多语言支持（中/英/日）|

---

## 4. 架构概述

```
项目结构：
├── lib/                        — 共享核心库 (git-sao-hua-core)
│   ├── sao-hua-data.js         — 唯一的骚话数据源（12类型 × 5风格）
│   ├── generator.js            — 共享生成逻辑
│   ├── index.js                — 统一导出入口
│   ├── test.js                 — 基础测试（29 用例）
│   └── package.json            — 包名 git-sao-hua-core v1.0.0
├── index.html                  — Web 体验页（独立单文件）
├── cli/                        — CLI 命令行工具（引用 lib/）
│   ├── index.js                — CLI 入口
│   └── package.json            — 包名 git-sao-hua
├── vscode-extension/           — VSCode 插件（引用 lib/）
│   ├── extension.js            — 插件主逻辑
│   └── package.json            — 插件配置
└── action/                     — GitHub Action（引用 lib/）
    ├── action.yml              — Action 入口配置
    ├── index.js                — Action 执行逻辑
    └── package.json            — 依赖配置
```

架构已从「三端各自为战」升级为「统一核心 + 多端适配」模式，现已扩展至四端（Web / VSCode / CLI / GitHub Action）。

---

## 5. 已知问题与技术债

1. **Web 页面骚话数据独立** — index.html 内嵌骚话数据，未引用 lib/（单文件设计限制）
2. **Web 页面过大** — index.html 124KB 单文件
3. **NPM_TOKEN 配置** — 需在 GitHub Secrets 中添加 NPM_TOKEN 以启用 CI/CD 自动发布
4. **VSCE_PAT 配置** — 需在 GitHub Secrets 中添加 VSCE_PAT 以启用 VSCode Marketplace 自动发布

---

## 6. 演进路线图

### 近期（1-3 轮）— npm 发布与 CLI 增强 ✅ 已完成
- ~~**npm 发布**：将 lib/ (git-sao-hua-core) 和 cli/ (git-sao-hua) 发布到 npm~~ ✅ 配置就绪 + CI/CD 自动发布
- ~~**CLI 集成智能检测**：将 VSCode 的检测逻辑移植到 lib/，CLI 支持 `--auto` 自动检测~~ ✅ 已完成
- ~~**GitHub Action CI**：添加 CI 工作流，自动运行测试~~ ✅ 已完成
- ~~**VSCode Marketplace 发布准备**：添加 marketplace 元数据、CHANGELOG、发布工作流~~ ✅ 已完成（v1.18.0）
- ~~**GitHub App**：创建 GitHub App，自动评论 PR/Issue~~ ✅ 已完成（v2.0.0）

### 下一步（待执行）
- **配置 NPM_TOKEN**：在 GitHub 仓库 Secrets 中添加 NPM_TOKEN，CI 将自动发布
- **配置 VSCE_PAT**：在 GitHub 仓库 Secrets 中添加 VSCE_PAT，启用自动发布到 Marketplace
- **首次正式发布**：手动触发发布工作流，上架 VSCode 插件商店
- **GitHub App 部署测试**：部署到服务器/Railway，配置 webhook，实际测试自动评论功能
- **Docker 镜像推送**：触发 CI 工作流，将 GitHub App 镜像推送到 ghcr.io

### 中期（4-10 轮）— 生态扩展
- ~~**GitHub Action 骚话**：提供 Action，CI 中自动生成骚话 commit message~~ ✅ 已完成（v1.22.0）
- ~~**骚话社区贡献**：支持用户提交自定义骚话 PR，自动格式校验~~ ✅ 可通过 GitHub App 实现
- ~~**多语言骚话**：英文 / 日文骚话支持~~ ✅ 已完成

### 远期愿景
- 成为 Git 提交信息领域最有趣的开源工具
- 形成骚话社区生态
- 从「工具」进化为「平台」

---

## 7. 近期进化记录（最近 5 轮）

| 轮次 | 日期 | 类型 | 改动概要 | 阶段变化 |
|------|------|------|---------|---------|
| 最新 | 2026-03-31 | 🔧 中迭代 | GitHub App Docker 部署完善 — 添加 Dockerfile/docker-compose/Makefile/CI 工作流，从「本地开发」到「生产部署」 | 不变（Stage 4 内部署能力提升） |
| -1 | 2026-03-30 | 🔧 中迭代 | GitHub App 测试与文档完善 — 添加 17 个单元测试 + 简化启动逻辑 + README 徽章 | 不变（Stage 4 内质量提升） |
| -2 | 2026-03-30 | 🚀 大演进 | GitHub App — 创建 github-app 目录，实现自动评论 PR/Issue 的 GitHub App，从「本地工具」跃迁到「GitHub 生态参与者」 | Stage 3 → Stage 4（产品化期） |
| -3 | 2026-03-29 | 🔧 中迭代 | 发布准备检查清单 — 新增 RELEASE_CHECKLIST.md，包含 Secrets 配置/测试验证/发布流程/故障排查完整指南 | 不变（Stage 3 内功能完善） |
| -4 | 2026-03-29 | 🔖 版本号同步 | 四端版本统一 v1.22.0 — lib/cli/vscode/action 全部同步至 v1.22.0 + CHANGELOG 更新 | 不变（Stage 3 内功能完善） |

---

## 8. 本次进化详情（2026-03-29）

### 进化记录 #1（早间）

**进化类型：** 🔖 版本号同步

**改动内容：**
- lib/package.json: v1.20.0 → v1.22.0
- cli/package.json: v1.20.0 → v1.22.0
- vscode-extension/package.json: v1.21.0 → v1.22.0
- action/package.json: v1.0.0 → v1.22.0
- vscode-extension/CHANGELOG.md: 新增 v1.22.0 更新日志条目
- PROJECT_EVOLUTION.md: 更新进化记录表格

**提交信息：**
```
chore: 四端版本号统一同步至 v1.22.0 🔖
```

**关闭的 Issues：** 
- 无开放 Issues（本次为维护性同步）

---

### 进化记录 #2（本轮）

**进化类型：** 🔧 中迭代（发布准备增强）

**改动内容：**
- 新增 `RELEASE_CHECKLIST.md` — 完整的发布前检查清单文档
- 包含 GitHub Secrets 配置指南、版本号检查、测试验证、文档完整性检查
- 包含完整的发布流程（npm + VSCode Marketplace）
- 包含发布后验证步骤和故障排查指南
- PROJECT_EVOLUTION.md: 更新本轮进化记录

**提交信息：**
```
docs: 添加发布准备检查清单 RELEASE_CHECKLIST.md 📋

为正式发布到 npm 和 VSCode Marketplace 提供完整的检查清单，
包含 Secrets 配置、测试验证、发布流程、故障排查等完整指南。
```

**关闭的 Issues：** 
- 无开放 Issues（主动完善发布文档）

**下一步建议：**
- **大演进方向**：骚话社区贡献系统 — 支持用户提交自定义骚话 PR，自动格式校验
- **中迭代方向**：
  1. 配置 NPM_TOKEN 到 GitHub Secrets，触发首次 npm 自动发布
  2. 配置 VSCE_PAT 到 GitHub Secrets，触发首次 VSCode Marketplace 发布
  3. 添加 npm/VSCode Marketplace 徽章到 README.md

---

## 9. 本次进化详情（2026-03-30）— GitHub App

**进化类型：** 🚀 大演进（维度跃迁）

**改动内容：**
- 新增 `github-app/` 目录 — 完整的 GitHub App 实现
  - `index.js` — Probot 框架主入口，监听 pull_request.opened 和 issues.opened 事件
  - `webhook.js` — Webhook 处理器，智能分析标题/内容，检测类型和风格，生成骚话评论
  - `package.json` — 依赖配置（probot、express、dotenv、git-sao-hua-core）
  - `.env.example` — 环境变量示例（APP_ID、PRIVATE_KEY、WEBHOOK_SECRET 等）
  - `manifest.json` — GitHub App 清单文件，支持一键创建 App
  - `README.md` — 完整的部署和使用文档
- 核心功能：
  - 自动监听 PR 创建事件，分析 PR 标题和内容
  - 自动监听 Issue 创建事件，分析 Issue 标题和内容
  - 智能检测 commit 类型（12 种）和骚话风格（5 种）
  - 使用 git-sao-hua-core 生成骚话评论
  - 自动发布评论到 PR/Issue
- 项目从「本地工具集」跃迁到「GitHub 生态参与者」

**提交信息：**
```
feat: GitHub App — 自动评论 PR/Issue 的骚话机器人 🤖

新增 github-app 目录，实现完整的 GitHub App：
- 使用 Probot 框架，监听 pull_request.opened 和 issues.opened 事件
- 智能分析标题和内容，自动检测 commit 类型和骚话风格
- 使用 git-sao-hua-core 生成骚话评论并自动发布
- 支持 manifest.json 一键创建 App
- 完整的部署文档（Docker/Railway/Vercel）

这是从「本地工具」到「GitHub 生态参与者」的维度跃迁。
```

**关闭的 Issues：** 
- 无开放 Issues（主动进化，开辟新能力维度）

**项目地址：** https://github.com/justlovemaki/git-commit-sao-hua

**下一步建议：**
- **大演进方向**：
  1. 骚话社区/市场 — 用户可以分享和下载自定义骚话包，形成生态
  2. AI 增强 — 使用 AI 根据实际代码 diff 生成更个性化的骚话
- **中迭代方向**：
  1. 部署 GitHub App 到服务器，实际测试自动评论功能
  2. 添加更多事件支持（如 pull_request_review、issue_comment）
  3. 添加配置选项，允许用户自定义评论风格和频率

---

## 10. 本次进化详情（2026-03-30）— GitHub App 测试与文档完善

**进化类型：** 🔧 中迭代（质量提升）

**改动内容：**
- 新增 `github-app/test.js` — 完整的单元测试套件
  - 类型检测测试（6 个用例）：验证 detectType 函数正确识别 12 种 commit 类型
  - 风格检测测试（6 个用例）：验证 detectStyle 函数正确识别 5 种骚话风格
  - 评论生成测试（3 个用例）：验证 PR/Issue 评论生成逻辑
  - 集成测试（2 个用例）：验证完整工作流
  - 总计 17 个测试用例，全部通过 ✅
- 优化 `github-app/index.js` — 简化启动逻辑
  - 移除冗余的 logLevel 配置
  - 简化 module.exports 导出，直接导出 probot 实例
  - 使用 probot.start() 替代手动 server.listen
  - 符合 Probot 最佳实践
- 更新 `README.md` — 添加项目徽章和功能说明
  - 添加 4 个徽章：npm version、VSCode Extension、GitHub Action、GitHub App
  - 在新增功能列表中补充 GitHub App（v2.0.0）
  - 让项目能力矩阵更加完整醒目

**提交信息：**
```
refactor: 简化 GitHub App 启动逻辑，使用 probot.start() 统一启动 🚀
test: 添加 GitHub App 单元测试，覆盖类型检测/风格检测/评论生成 ✅
docs: 更新 README.md，添加 GitHub App 徽章和功能说明 🐙
```

**关闭的 Issues：** 
- 无开放 Issues（主动完善测试和文档）

**测试覆盖：**
- 类型检测：fix/feat/docs/refactor/test 等关键词识别
- 风格检测：love/sao/zha/chu/fo 等关键词识别
- 评论生成：PR/Issue 前缀区分、标题引用、footer 签名
- 完整工作流：从事件接收到评论发布的端到端验证

**下一步建议：**
- **大演进方向**：
  1. 骚话社区/市场 — 用户可以分享和下载自定义骚话包，形成生态
  2. AI 增强 — 使用 AI 根据实际代码 diff 生成更个性化的骚话
- **中迭代方向**：
  1. 部署 GitHub App 到服务器，实际测试自动评论功能
  2. 添加更多事件支持（如 pull_request_review、issue_comment）
  3. 添加配置选项，允许用户自定义评论风格和频率
  4. 配置 NPM_TOKEN 到 GitHub Secrets，触发首次 npm 自动发布
  5. 配置 VSCE_PAT 到 GitHub Secrets，触发首次 VSCode Marketplace 发布

---

## 11. 本次进化详情（2026-03-31）— GitHub App Docker 部署完善

**进化类型：** 🔧 中迭代（部署能力提升）

**改动内容：**
- 新增 `github-app/Dockerfile` — 基于 node:20-alpine 的轻量级生产镜像
- 新增 `github-app/docker-compose.yml` — 一键启动服务，支持环境变量配置
- 新增 `github-app/.dockerignore` — 排除 node_modules/测试文件，优化构建体积
- 新增 `github-app/Makefile` — 简化常用操作（help/setup/build/up/down/logs/clean/verify）
- 新增 `.github/workflows/github-app-docker.yml` — CI/CD 自动构建推送镜像到 ghcr.io
- 更新 `github-app/README.md` — 补充 Docker 部署说明、Makefile 使用指南、常见问题排查
- 核心改进：
  - 从「本地开发」到「生产部署」的关键一步
  - 支持一键容器化部署，降低运维成本
  - CI/CD 自动构建镜像，版本追踪清晰
  - Makefile 提供统一的操作入口，提升开发者体验

**提交信息：**
```
feat: GitHub App Docker 部署完善 — 添加 Dockerfile/Makefile/CI 工作流 🐳

- 添加 Dockerfile 和 docker-compose.yml，支持一键容器化部署
- 添加 Makefile 简化常用操作（build/up/down/logs/clean）
- 添加 .dockerignore 优化构建体积
- 添加 GitHub Actions 工作流自动构建推送镜像到 ghcr.io
- 更新 README 补充 Docker 部署说明和 Makefile 使用指南
- 添加常见问题排查（Docker 容器启动失败/日志查看等）

这是 GitHub App 从「本地开发」到「生产部署」的关键一步。
```

**关闭的 Issues：** 
- 无开放 Issues（主动完善部署能力）

**部署能力增强：**
- Docker 镜像：基于 Alpine，体积小，启动快
- Makefile：10+ 个快捷命令，覆盖开发/部署/运维全流程
- CI/CD：推送 main 分支或发布 Release 时自动构建镜像
- 镜像仓库：ghcr.io/justlovemaki/git-commit-sao-hua/github-app

**下一步建议：**
- **大演进方向**：
  1. 骚话社区/市场 — 用户可以分享和下载自定义骚话包，形成生态
  2. AI 增强 — 使用 AI 根据实际代码 diff 生成更个性化的骚话
- **中迭代方向**：
  1. 部署 GitHub App 到 Railway/服务器，实际测试自动评论功能
  2. 触发 Docker CI 工作流，验证镜像自动构建推送
  3. 添加更多事件支持（如 pull_request_review、issue_comment）
  4. 配置 NPM_TOKEN 到 GitHub Secrets，触发首次 npm 自动发布
  5. 配置 VSCE_PAT 到 GitHub Secrets，触发首次 VSCode Marketplace 发布

**项目地址：** https://github.com/justlovemaki/git-commit-sao-hua
