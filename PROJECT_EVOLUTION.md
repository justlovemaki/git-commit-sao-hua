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

**Stage 4: 产品化期 → Stage 5: 平台期（AI 增强）**

原因：
- 核心功能（骚话生成 + 智能检测）已稳定
- 五端（Web / VSCode / CLI / GitHub Action / **GitHub App**）均已实现
- ✅ 核心库已抽取完成，多端共享 lib/，代码复用问题已解决
- ✅ 智能检测模块已共享至 lib/，CLI 支持 --auto 智能检测
- ✅ CI/CD 工作流已配置，npm 发布准备就绪
- ✅ GitHub Action 已实现，可在 CI/CD 中自动生成骚话 commit message
- ✅ GitHub App 已实现，可在 PR/Issue 创建时自动评论骚话
- ✅ **AI 智能生成模块已实现**，从「模板生成」跃迁到「AI 个性化生成」
- 项目已从「工具集」进化为「GitHub 生态参与者」，正在向「AI 驱动平台」演进
- 下一步应聚焦：AI 模型优化、实际应用验证、生态建设

---

## 3. 能力矩阵

| 能力维度 | 状态 | 说明 |
|---------|------|------|
| **Web 体验页** | ✅ 完成 | 单 HTML 文件，可直接打开使用 |
| **VSCode 插件** | ✅ 完成 | 骚话生成 + 智能检测 + 日志分析 + 统计 |
| **VSCode Marketplace 发布** | ✅ 发布准备完成 | 添加 galleryBanner/badges、CHANGELOG、发布工作流、发布指南 |
| **CLI 命令行** | ✅ 完成 | 随机生成、类型/风格指定、剪贴板、git commit、**智能检测 --auto**、**AI 生成** |
| **GitHub Action** | ✅ 完成 | 在 CI/CD 中自动生成骚话 commit message，支持类型/风格/语言参数（v1.22.0 新增，版本号已统一）|
| **GitHub App** | ✅ 完成 | 自动监听 PR/Issue 创建事件，智能分析标题内容并自动评论骚话（v2.0.0 新增） |
| **智能检测（VSCode）** | ✅ 完成 | AST 分析 + Diff 关键词 + 代码模式识别 + 置信度 |
| **共享核心库 (lib/)** | ✅ 完成 | 骚话数据 + 生成逻辑 + **智能检测模块** + **AI 生成模块**统一抽取，多端共用，64 个测试用例 |
| **自动化测试** | ✅ 完善 | lib/test.js 64 个用例，覆盖数据完整性、生成逻辑、AI 生成、智能检测验证 |
| **AI 智能生成** | ✅ 完成 | 基于 diff 分析 + AI API 调用 + fallback 机制，从「模板生成」到「AI 个性化生成」的维度跃迁（v1.23.0 新增） |
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
│   ├── smart-detector.js       — 智能检测模块
│   ├── ai-generator.js         — AI 生成模块（v1.23.0 新增）
│   ├── index.js                — 统一导出入口
│   ├── test.js                 — 基础测试（64 用例）
│   └── package.json            — 包名 git-sao-hua-core v1.23.0
├── index.html                  — Web 体验页（独立单文件）
├── cli/                        — CLI 命令行工具（引用 lib/）
│   ├── index.js                — CLI 入口
│   └── package.json            — 包名 git-sao-hua v1.23.0
├── vscode-extension/           — VSCode 插件（引用 lib/）
│   ├── extension.js            — 插件主逻辑
│   └── package.json            — 插件配置 v1.23.0
└── action/                     — GitHub Action（引用 lib/）
    ├── action.yml              — Action 入口配置
    ├── index.js                — Action 执行逻辑
    └── package.json            — 依赖配置 v1.23.0
```

架构已从「三端各自为战」升级为「统一核心 + 多端适配」模式，现已扩展至五端（Web / VSCode / CLI / GitHub Action / GitHub App），并新增 AI 智能生成能力。

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
| 最新 | 2026-04-02 | 🔧 中迭代 | CLI AI 集成 — 新增 --ai 参数和 generateAIMessage 函数，CLI 可调用 AI 生成个性化骚话，fallback 机制保证稳定性 | 不变（Stage 5 内能力完善） |
| -1 | 2026-04-01 | 🚀 大演进 | AI 智能生成模块 — 新增 ai-generator.js，实现基于 diff 分析的 AI 骚话生成 + fallback 机制，从「模板生成」到「AI 个性化生成」 | Stage 4 → Stage 5（平台期） |
| -2 | 2026-04-01 | 🔧 中迭代 | GitHub App CI 测试自动化 — 修复 package.json 测试脚本 + 添加 github-app-test.yml 工作流，从「本地测试」到「CI 自动化」 | 不变（Stage 4 内质量提升） |
| -3 | 2026-03-31 | 🔧 中迭代 | GitHub App Docker 部署完善 — 添加 Dockerfile/docker-compose/Makefile/CI 工作流，从「本地开发」到「生产部署」 | 不变（Stage 4 内部署能力提升） |
| -4 | 2026-03-30 | 🔧 中迭代 | GitHub App 测试与文档完善 — 添加 17 个单元测试 + 简化启动逻辑 + README 徽章 | 不变（Stage 4 内质量提升） |
| -5 | 2026-03-30 | 🚀 大演进 | GitHub App — 创建 github-app 目录，实现自动评论 PR/Issue 的 GitHub App，从「本地工具」跃迁到「GitHub 生态参与者」 | Stage 3 → Stage 4（产品化期） |

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

---

## 12. 本次进化详情（2026-04-01）— GitHub App CI 测试自动化

**进化类型：** 🔧 中迭代（质量提升）

**改动内容：**
- 修复 `github-app/package.json` — 将测试脚本从 `echo "No tests yet"` 改为实际运行 `node test.js`
- 新增 `.github/workflows/github-app-test.yml` — GitHub App 专用 CI 测试工作流
  - 支持 Node.js 18.x/20.x 多版本测试
  - 包含依赖安装、测试执行、语法检查三步
  - 添加 Docker 构建验证步骤（仅 main 分支推送时触发）
  - 路径过滤：仅当 github-app/ 目录变更时触发
- 运行测试验证：17 个测试用例全部通过 ✅
  - 类型检测测试：6 个用例（fix/feat/docs/refactor/test 等）
  - 风格检测测试：6 个用例（love/sao/zha/chu/fo 等）
  - 评论生成测试：3 个用例（PR/Issue 评论、空内容处理）
  - 集成测试：2 个用例（完整工作流验证）
- 核心改进：
  - 从「本地手动测试」到「CI 自动化测试」的质量提升
  - 每次推送/PR 自动验证代码质量
  - 多 Node.js 版本覆盖，确保兼容性
  - Docker 构建验证，提前发现部署问题

**提交信息：**
```
test: 添加 GitHub App CI 测试工作流，修复 package.json 测试脚本 ✅

- 修复 github-app/package.json 测试脚本，从 'echo' 改为实际运行 test.js
- 新增 .github/workflows/github-app-test.yml CI 工作流
  - 支持 Node.js 18.x/20.x 多版本测试
  - 包含依赖安装、测试执行、语法检查
  - 添加 Docker 构建验证步骤（仅 main 分支）
- 运行测试验证：17 个测试用例全部通过 ✅

这是 GitHub App 从「有测试」到「CI 自动化测试」的质量提升。
```

**关闭的 Issues：** 
- 无开放 Issues（主动完善 CI/CD 质量保障）

**测试覆盖：**
- lib/ 核心库：49 个测试用例 ✅
- github-app/：17 个测试用例 ✅
- 总计：66 个测试用例，全部通过

**CI/CD 工作流矩阵：**
| 工作流 | 触发条件 | 测试内容 |
|--------|---------|---------|
| ci.yml | 全项目推送/PR | lib/ + cli/ 测试 + npm 发布 |
| github-app-test.yml | github-app/ 变更 | GitHub App 测试 + Docker 构建验证 |
| github-app-docker.yml | main 推送/Release | Docker 镜像构建推送 ghcr.io |
| action-test.yml | action/ 变更 | GitHub Action 测试 |
| vscode-*.yml | vscode-extension/ 变更 | VSCode 插件打包/发布 |

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

---

## 13. 本次进化详情（2026-04-01）— AI 智能生成模块

**进化类型：** 🚀 大演进（维度跃迁）

**改动内容：**
- 新增 `lib/ai-generator.js` — AI 驱动的骚话生成模块
  - `analyzeDiff(diffText)` — 分析 diff 内容，提取关键信息（修改文件、变更规模、关键标识符、功能特征）
  - `generateWithAI(diffText, options)` — 调用 AI API 生成个性化骚话
  - `generateFallback(diffText, analysis, language, style)` — Fallback 机制，AI 失败时降级到模板生成
  - 支持配置：API 地址、密钥、模型、温度、超时等
- 更新 `lib/index.js` — 导出 AI 生成相关函数
- 更新 `lib/package.json` — 版本号 v1.22.0 → v1.23.0，添加 ai-generator.js 到 files
- 更新 `lib/test.js` — 新增 15 个 AI 生成相关测试用例，总计 64 个用例全部通过
- 同步其他端版本号：
  - cli/package.json: v1.22.0 → v1.23.0
  - vscode-extension/package.json: v1.22.0 → v1.23.0
  - action/package.json: v1.22.0 → v1.23.0
  - github-app/package.json: v1.0.0 → v1.23.0
- 更新 `vscode-extension/CHANGELOG.md` — 添加 v1.23.0 更新日志
- 更新 `PROJECT_EVOLUTION.md` — 记录本轮进化，更新能力矩阵和架构概述

**核心能力：**
- **Diff 分析**：自动识别修改文件列表、文件类型、变更规模（small/medium/large）、新增/删除行数、关键函数/类名、功能特征
- **AI 生成**：调用 AI API（如 OpenAI）基于 diff 分析结果生成个性化骚话 commit message
- **Fallback 机制**：AI 失败或无 API key 时自动降级到传统模板生成，保证稳定性
- **多语言支持**：支持中文/英文，5 种骚话风格（love/sao/zha/chu/fo）
- **测试覆盖**：15 个新测试用例，覆盖 diff 分析、fallback 生成、AI 错误处理等场景

**提交信息：**
```
feat: AI 智能生成模块 — 基于 diff 分析的 AI 骚话生成器 🧠

- 新增 lib/ai-generator.js，实现 analyzeDiff 和 generateWithAI 函数
- 支持 AI API 调用生成个性化骚话，fallback 机制保证稳定性
- 新增 15 个测试用例，总计 64 个用例全部通过
- 同步所有端版本号至 v1.23.0

这是从「模板生成」到「AI 个性化生成」的维度跃迁。
```

**关闭的 Issues：** 
- 无开放 Issues（主动进化，开辟 AI 新能力维度）

**测试覆盖：**
- lib/ 核心库：64 个测试用例 ✅
- github-app/：17 个测试用例 ✅
- 总计：81 个测试用例，全部通过

**项目地址：** https://github.com/justlovemaki/git-commit-sao-hua

**下一步建议：**
- **大演进方向**：
  1. 骚话社区/市场 — 用户可以分享和下载自定义骚话包，形成生态
  2. AI 模型微调 — 使用项目历史数据微调 AI 模型，生成更符合项目风格的骚话
- **中迭代方向**：
  1. 配置 AI_API_KEY 到 GitHub Secrets，测试 AI 生成功能
  2. 在 CLI 中添加 --ai 参数，支持 AI 生成模式 ✅ 已完成 (v1.24.0)
  3. 在 VSCode 插件中添加 AI 生成开关和配置
  4. 部署 GitHub App 到 Railway/服务器，实际测试自动评论功能
  5. 配置 NPM_TOKEN 到 GitHub Secrets，触发首次 npm 自动发布
  6. 配置 VSCE_PAT 到 GitHub Secrets，触发首次 VSCode Marketplace 发布

---

## 14. 本次进化详情（2026-04-02）— CLI AI 集成

**进化类型：** 🔧 中迭代（能力完善）

**改动内容：**
- 更新 `cli/index.js` — 新增 AI 生成功能集成
  - 引入 `../lib/ai-generator.js` 模块
  - 新增 `generateAIMessage(type, style, language)` 异步函数
  - 自动获取 git diff --cached 或 git diff HEAD 作为 AI 输入
  - 调用 `aiGenerator.generateWithAI()` 生成个性化骚话
  - Fallback 机制：AI 失败时自动降级到传统模板生成
  - 更新 `printMessage()` 显示 AI 生成标识
- 更新 `parseArgs()` — 新增 `--ai` 选项解析
- 更新 `showHelp()` — 添加 `--ai` 参数说明和使用示例
- 更新 `main()` — 处理 `--ai` 逻辑，调用 AI 生成或传统生成
- 同步所有端版本号至 v1.24.0：
  - cli/package.json: v1.23.0 → v1.24.0
  - lib/package.json: v1.23.0 → v1.24.0
  - vscode-extension/package.json: v1.23.0 → v1.24.0
  - action/package.json: v1.23.0 → v1.24.0
  - github-app/package.json: v1.23.0 → v1.24.0
- 更新 `vscode-extension/CHANGELOG.md` — 添加 v1.24.0 更新日志
- 更新 `PROJECT_EVOLUTION.md` — 记录本轮进化

**核心能力：**
- **CLI AI 生成**：`git-sao-hua --ai` 一键调用 AI 生成个性化骚话
- **智能 diff 获取**：自动检测 staged changes 或工作区变更
- **Fallback 保障**：AI API 失败/超时无 key 时自动降级到模板生成
- **风格可选**：支持 `--ai -s <style>` 指定骚话风格
- **无缝集成**：与现有 `-g`、`-c` 等参数完全兼容

**提交信息：**
```
feat: CLI 集成 AI 生成模式 — 新增 --ai 参数支持 AI 骚话生成 🧠

- 新增 generateAIMessage 函数，调用 lib/ai-generator.js
- 自动获取 git diff 作为 AI 输入，fallback 机制保证稳定性
- 更新 parseArgs 添加 --ai 选项，showHelp 添加说明
- 同步所有端版本号至 v1.24.0

这是 AI 模块从「已实现」到「可用」的关键一步。
```

**关闭的 Issues：** 
- 无开放 Issues（主动完善 AI 能力落地）

**使用示例：**
```bash
# 使用 AI 生成个性化骚话
git-sao-hua --ai

# AI 生成并指定风格
git-sao-hua --ai -s love

# AI 生成并直接提交
git-sao-hua --ai -g

# AI 生成并复制到剪贴板
git-sao-hua --ai -c
```

**测试验证：**
- CLI 语法检查通过
- `--ai` 参数解析正确
- Fallback 机制正常工作（无 AI_API_KEY 时降级到模板生成）
- 与现有参数（-t/-s/-g/-c 等）兼容

**项目地址：** https://github.com/justlovemaki/git-commit-sao-hua

**下一步建议：**
- **大演进方向**：
  1. 骚话社区/市场 — 用户可以分享和下载自定义骚话包，形成生态
  2. AI 模型微调 — 使用项目历史数据微调 AI 模型，生成更符合项目风格的骚话
- **中迭代方向**：
  1. 在 VSCode 插件中添加 AI 生成开关和配置
  2. 配置 AI_API_KEY 到 GitHub Secrets，测试 AI 生成功能
  3. 部署 GitHub App 到 Railway/服务器，实际测试自动评论功能
  4. 配置 NPM_TOKEN 到 GitHub Secrets，触发首次 npm 自动发布
  5. 配置 VSCE_PAT 到 GitHub Secrets，触发首次 VSCode Marketplace 发布

