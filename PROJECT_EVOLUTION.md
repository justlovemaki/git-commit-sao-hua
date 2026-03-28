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

**Stage 3: 功能扩展期**

原因：
- 核心功能（骚话生成 + 智能检测）已稳定
- 四端（Web / VSCode / CLI / GitHub Action）均已实现
- ✅ 核心库已抽取完成，三端共享 lib/，代码复用问题已解决
- ✅ 智能检测模块已共享至 lib/，CLI 支持 --auto 智能检测
- ✅ CI/CD 工作流已配置，npm 发布准备就绪
- ✅ GitHub Action 已实现，可在 CI/CD 中自动生成骚话 commit message
- 下一步应聚焦：执行 npm publish、VSCode Marketplace 发布

---

## 3. 能力矩阵

| 能力维度 | 状态 | 说明 |
|---------|------|------|
| **Web 体验页** | ✅ 完成 | 单 HTML 文件，可直接打开使用 |
| **VSCode 插件** | ✅ 完成 | 骚话生成 + 智能检测 + 日志分析 + 统计 |
| **VSCode Marketplace 发布** | ✅ 发布准备完成 | 添加 galleryBanner/badges、CHANGELOG、发布工作流、发布指南 |
| **CLI 命令行** | ✅ 完成 | 随机生成、类型/风格指定、剪贴板、git commit、**智能检测 --auto** |
| **GitHub Action** | ✅ 完成 | 在 CI/CD 中自动生成骚话 commit message，支持类型/风格/语言参数（v1.22.0 新增）|
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

### 下一步（待执行）
- **配置 NPM_TOKEN**：在 GitHub 仓库 Secrets 中添加 NPM_TOKEN，CI 将自动发布
- **配置 VSCE_PAT**：在 GitHub 仓库 Secrets 中添加 VSCE_PAT，启用自动发布到 Marketplace
- **首次正式发布**：手动触发发布工作流，上架 VSCode 插件商店

### 中期（4-10 轮）— 生态扩展
- ~~**GitHub Action 骚话**：提供 Action，CI 中自动生成骚话 commit message~~ ✅ 已完成（v1.22.0）
- **骚话社区贡献**：支持用户提交自定义骚话 PR，自动格式校验
- ~~**多语言骚话**：英文 / 日文骚话支持~~ ✅ 已完成

### 远期愿景
- 成为 Git 提交信息领域最有趣的开源工具
- 形成骚话社区生态

---

## 7. 近期进化记录（最近 5 轮）

| 轮次 | 日期 | 类型 | 改动概要 | 阶段变化 |
|------|------|------|---------|---------|
| 最新 | 2026-03-28 | 🚀 大演进 | GitHub Action v1.22.0 — 在 CI/CD 中自动生成骚话 commit message | 不变（Stage 3 内功能完善） |
| -1 | 2026-03-28 | 🚀 大演进 | 国际化支持 v1.21.0 — 多语言（中/英/日）骚话支持 | 不变（Stage 3 内功能完善） |
| -2 | 2026-03-27 | 🔖 版本号同步 | VSCode 插件版本号同步 v1.20.0 — 统一 lib/cli/vscode 三端版本号 + 完善 CHANGELOG | 不变（Stage 3 内功能完善） |
| -3 | 2026-03-27 | 🚀 大演进 | VSCode Marketplace 发布准备 v1.18.0 — 添加 galleryBanner/badges、CHANGELOG、发布工作流、发布指南 | 不变（Stage 3 内功能完善） |
| -4 | 2026-03-26 | 🚀 大演进 | CI/CD + 测试修复 v1.20.0 — GitHub Actions 自动发布配置 + 测试用例版本号断言修复 | 不变（Stage 3 内功能完善） |
