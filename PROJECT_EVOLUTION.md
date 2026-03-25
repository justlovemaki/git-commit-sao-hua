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
- 三端（Web / VSCode / CLI）均已实现
- ✅ 核心库已抽取完成，三端共享 lib/，代码复用问题已解决
- 智能检测集中在 VSCode 插件中，CLI 端未集成
- 下一步应聚焦：npm 发布、CLI 集成智能检测、GitHub Action 集成

---

## 3. 能力矩阵

| 能力维度 | 状态 | 说明 |
|---------|------|------|
| **Web 体验页** | ✅ 完成 | 单 HTML 文件，可直接打开使用 |
| **VSCode 插件** | ✅ 完成 | 骚话生成 + 智能检测 + 日志分析 + 统计 |
| **CLI 命令行** | ✅ 完成 | 随机生成、类型/风格指定、剪贴板、git commit |
| **智能检测（VSCode）** | ✅ 完成 | AST 分析 + Diff 关键词 + 代码模式识别 + 置信度 |
| **共享核心库 (lib/)** | ✅ 完成 | 骚话数据 + 生成逻辑统一抽取，三端共用，29 个测试用例 |
| **自动化测试** | ✅ 基础完成 | lib/test.js 29 个用例，覆盖数据完整性、生成逻辑、验证 |
| **智能检测（CLI）** | ❌ 未集成 | CLI 仅支持手动指定类型，无自动检测 |
| **npm 发布** | ❌ 未开始 | CLI 和核心库均可发布但未 publish |
| **GitHub Action** | ❌ 未开始 | 无 CI/CD 集成，无自动化工作流 |
| **国际化** | ❌ 未开始 | 仅中文骚话 |

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
└── vscode-extension/           — VSCode 插件（引用 lib/）
    ├── extension.js            — 插件主逻辑
    └── package.json            — 插件配置
```

架构已从「三端各自为战」升级为「统一核心 + 多端适配」模式。

---

## 5. 已知问题与技术债

1. **Web 页面骚话数据独立** — index.html 内嵌骚话数据，未引用 lib/（单文件设计限制）
2. **智能检测未共享** — AST + Diff 检测逻辑只在 VSCode 插件中，CLI 无法使用
3. **未发布到 npm** — CLI 和核心库可用但未 publish
4. **Web 页面过大** — index.html 124KB 单文件

---

## 6. 演进路线图

### 近期（1-3 轮）— npm 发布与 CLI 增强
- **npm 发布**：将 lib/ (git-sao-hua-core) 和 cli/ (git-sao-hua) 发布到 npm
- **CLI 集成智能检测**：将 VSCode 的检测逻辑移植到 lib/，CLI 支持 `--auto` 自动检测
- **GitHub Action CI**：添加 CI 工作流，自动运行测试

### 中期（4-10 轮）— 生态扩展
- **GitHub Action 骚话**：提供 Action，CI 中自动生成骚话 commit message
- **骚话社区贡献**：支持用户提交自定义骚话 PR，自动格式校验
- **多语言骚话**：英文 / 日文骚话支持
- **VSCode Marketplace 发布**：正式上架 VSCode 插件商店

### 远期愿景
- 成为 Git 提交信息领域最有趣的开源工具
- 形成骚话社区生态

---

## 7. 近期进化记录（最近 5 轮）

| 轮次 | 日期 | 类型 | 改动概要 | 阶段变化 |
|------|------|------|---------|---------|
| 最新 | 2026-03-25 | 🚀 大演进 | 核心库抽取 v1.19.0 — 三端共享 lib/ + 29 测试用例 | 不变（Stage 3 内架构跃迁） |
| -1 | 2026-03-25 | 🚀 大演进 | CLI 命令行工具 v1.18.0 — 突破 VSCode 限制 | Stage 2→3 |
| -2 | 2026-03-23 | 🔧 中迭代 | 代码模式智能识别 v1.17.0 | 不变 |
| -3 | 2026-03-22 | 🔧 中迭代 | 智能检测日志分析 v1.16.0 | 不变 |
| -4 | 2026-03-21 | 🔧 中迭代 | 智能检测准确率提升 v1.15.0 | 不变 |
