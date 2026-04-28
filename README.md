# 💕 Git Commit 骚话生成器

让每次 Git 提交都充满爱意（或骚气）！

[![npm version](https://badge.fury.io/js/git-sao-hua-core.svg)](https://www.npmjs.com/package/git-sao-hua-core)
[![VSCode Extension](https://img.shields.io/badge/VSCode-Extension-blue?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=coding-expert.git-sao-hua)
[![GitHub Action](https://img.shields.io/badge/GitHub-Action-2088FF?logo=github-actions)](https://github.com/justlovemaki/git-commit-sao-hua/actions)
[![GitHub App](https://img.shields.io/badge/GitHub-App-black?logo=github)](https://github.com/apps/git-sao-hua)
[![REST API](https://img.shields.io/badge/REST-API-green?logo=express)](https://github.com/justlovemaki/git-commit-sao-hua/tree/main/api)

## ✨ 功能特点

### 核心功能
- 📝 **12 种 Commit 类型** - fix/feat/chore/docs/refactor/style/test/perf/ci/build/revert/hotfix
- 🎨 **5 种风格模式** - 情话/骚话/扎心/中二/佛系
- 📋 **一键复制** - 生成后直接复制到剪贴板
- 🔄 **无限生成** - 不满意？再换一个！
- 📱 **响应式设计** - 手机电脑都能用
- 🎨 **精美 UI** - 程序员暗色主题 + 亮色主题切换
- 🌍 **国际化支持 (i18n)** - 支持中文/英文/日文/韩文等多种语言

### 🆕 新增功能
- 🌓 **主题切换** - 暗色/亮色主题自由切换
- ⭐ **收藏系统** - 收藏你最喜欢的骚话（最多 50 条）
- 📜 **历史记录** - 自动保存最近 20 条生成记录
- 🏆 **成就系统** - 12 个隐藏成就等你解锁
- 💡 **每日一句** - 每天打开都有新惊喜
- ⌨️ **键盘快捷键** - 高效操作，程序员最爱
- 📊 **统计面板** - 实时查看生成次数、收藏数、成就进度
- 🔗 **分享功能** - 一键分享到微信、微博
- 🎨 **自定义骚话** - 添加/删除/导入/导出你的专属骚话（v2.1.0）
- 🧠 **智能检测** - 根据 Git 变更自动识别 Commit 类型（v1.3.0）
- 📊 **使用统计** - 查看生成次数、常用类型和风格（v1.6.0）
- 🎹 **快捷键** - Ctrl+Shift+G 随机生成，Ctrl+Shift+S 查看统计（v1.7.0）
- 🔍 **AST 分析** - 代码结构分析增强智能检测准确率（v1.8.0）
- 🚀 **增强的 AST 检测** - 支持 import/export 语句和测试文件变更识别（v1.9.0）
- 🌍 **多语言支持** - Diff 分析支持 Python/Java/TypeScript 特定关键词（v1.9.0）
- 🐍 **Go/Rust/PHP/Ruby/Swift 支持** - 新增多语言关键词检测（v1.15.0）
- ⚡ **代码模式检测** - Promise/async、错误处理、React Hooks 检测（v1.15.0）
- ⚖️ **加权评分系统** - AST 0.4 + Diff 0.4 + FileType 0.2（v1.15.0）
- 📋 **智能检测日志** - 记录每次检测结果和用户反馈（v1.16.0）
- 📊 **准确率分析** - 统计用户采纳率，优化检测策略（v1.16.0）
- 👍 **用户反馈机制** - 采纳/跳过/手动修改三种反馈（v1.16.0）
- 🗂️ **代码模式识别** - 数据库/API/路由/组件/样式 5 种模式检测（v1.17.0）
- 💻 **CLI 命令行工具** - 终端直接生成骚话 commit message，支持交互模式和一键提交（v1.18.0）
- 🤖 **GitHub Action** - 在 CI/CD 中自动生成骚话 commit message（v1.22.0）
- 🐙 **GitHub App** - 自动监听 PR/Issue 创建，智能分析并自动评论骚话（v2.0.0）
- 🌐 **REST API** - 独立 HTTP 服务，支持随机/类型/风格/AI 骚话生成，带速率限制、健康探针、请求追踪与指标快照，兼容 Prometheus 抓取协议（v1.25.0 起持续增强）
- 💬 **自然语言提交** - 用中文/英文描述自动生成 commit message，无需指定类型和风格（v1.35.0 新增）

## 🔗 Git Hook 自动集成（v1.26.0 新增 🎉）

安装 Git Hook 后，每次 `git commit` 自动在 commit message 末尾追加骚话注释！

### 快速开始

```bash
# 1. 在当前 Git 仓库安装 Hook
git-sao-hua hook install

# 2. (可选) 创建配置文件自定义行为
git-sao-hua init

# 3. 正常提交即可
git add . && git commit -m "feat: 新功能"
# commit message 末尾会自动追加: # 🎉 骚话: xxx
```

### Hook 命令

```bash
git-sao-hua hook install     # 安装 prepare-commit-msg hook
git-sao-hua hook uninstall   # 卸载 hook
git-sao-hua hook status      # 查看 hook 安装状态
git-sao-hua init             # 交互式创建 .saohuarc.json 配置文件
```

## 🔌 插件系统（v1.27.0 新增 🎉）

支持通过插件扩展骚话内容，可以从本地文件或远程 URL 安装插件。

### 插件命令

```bash
git-sao-hua plugin list                 # 列出已安装的插件
git-sao-hua plugin inspect <name>       # 查看插件来源、校验和、锁定信息 (v1.33.0)
git-sao-hua plugin create [name]        # 创建插件模板
git-sao-hua plugin install <path>        # 从本地路径安装插件
git-sao-hua plugin install --url <url>     # 从 URL 安装插件 (v1.28.0)
git-sao-hua plugin install --url <url> --checksum <sha256> # 从 URL 安装并校验摘要 (v1.30.0)
git-sao-hua plugin install --url <url> --allow-host <host> # 允许额外远程源 host (v1.31.0)
git-sao-hua plugin search [query]         # 搜索插件市场 (v1.29.0)
git-sao-hua plugin search [query] --allow-host <host> # 搜索时允许额外索引 host (v1.31.0)
git-sao-hua plugin install --from-index <name> # 从索引安装插件 (v1.29.0)
git-sao-hua plugin install --from-index <name> --allow-host <host> # 从索引安装时允许额外 host (v1.31.0)
git-sao-hua plugin validate <path>       # 校验插件 JSON 并输出 SHA-256 (v1.34.0)
git-sao-hua plugin verify <path|name>    # 校验插件签名 (v1.36.0)
git-sao-hua plugin pack <path>           # 生成插件发布摘要与建议索引条目 (v1.34.0)
git-sao-hua plugin pack <path> --output <file> # 输出 metadata JSON (v1.34.0)
git-sao-hua plugin pack <path> --sign-private-key <pem> --public-key <pem> --key-id <id> # 生成签名 metadata (v1.36.0)
git-sao-hua plugin release-kit <path> --output-dir <dir> # 生成插件发布交付包 (v1.39.0)
git-sao-hua plugin remove <name>             # 删除插件
git-sao-hua batch --file <json>              # 批量生成骚话 (v1.37.0)
git-sao-hua release-notes [<range>]          # 基于 git log 生成 Release Notes
git-sao-hua release-notes [<range>] --format github-release-json # 输出 GitHub Release API payload (v1.38.0)
git-sao-hua release-notes [<range>] --format github-release-manifest-json --asset ./dist/app.zip # 输出 GitHub Release payload + asset manifest (v1.40.0)
```

### 批量生成（v1.37.0）

除了 REST API 和多语言 SDK，现在 CLI 也能直接消费批量输入文件，方便脚本、流水线和人工预览共用同一份 `items` 定义：

```bash
# 文本模式，输出汇总统计和逐条结果
git-sao-hua batch --file ./items.json

# JSON 模式，输出纯 JSON，便于脚本直接消费
git-sao-hua batch --file ./items.json --format json
```

`items.json` 支持两种结构：

```json
{
  "items": [
    { "mode": "random" },
    { "mode": "typed", "type": "fix" },
    { "mode": "typed_style", "type": "feat", "style": "love" },
    { "mode": "ai", "type": "feat", "diff": "diff --git a/a.js b/a.js\n+console.log('hi')" }
  ]
}
```

或直接传数组：

```json
[
  { "mode": "random" },
  { "mode": "typed", "type": "docs" }
]
```

支持模式：
- `random`
- `typed`
- `typed_style`
- `ai`

单次最多 50 条，CLI / API / SDK 共用同一套核心批量生成逻辑。

### Release Notes 生成（新增）

除了生成单条 commit message，现在 CLI 也可以直接从 Git 历史生成 Markdown 版或 JSON 版发布说明，适合在发版、写 changelog、整理 PR merge 结果时使用：

```bash
 # 基于明确 range 生成 Markdown
  git-sao-hua release-notes v1.34.0..HEAD

 # 用 from/to 参数生成并自定义标题
  git-sao-hua release-notes --from v1.34.0 --to HEAD --title "v1.35.0 Release Notes"

 # 输出到文件
  git-sao-hua release-notes HEAD --output ./RELEASE_NOTES.md

 # 指定 GitHub 仓库，生成完整链接（commit 链接 + PR 链接 + compare 链接）
  git-sao-hua release-notes v1.34.0..HEAD --repo owner/repo

 # 未指定 repo 时自动从 git remote origin 推断
  git-sao-hua release-notes HEAD

 # 输出 JSON 格式（适合自动化流水线消费）
  git-sao-hua release-notes HEAD --format json

 # JSON 输出到文件
  git-sao-hua release-notes v1.34.0..HEAD --format json --output ./release.json

 # 输出 GitHub Releases API 可直接消费的 JSON payload
  git-sao-hua release-notes v1.34.0..HEAD --format github-release-json --tag v1.38.0 --target main --repo owner/repo

 # 开启 GitHub 元数据富化，自动补充 PR labels / authors
  git-sao-hua release-notes v1.34.0..HEAD --repo owner/repo --enrich-github --github-token "$GITHUB_TOKEN"

 # 离线注入预抓取 metadata，适合 CI 缓存或测试
  git-sao-hua release-notes v1.34.0..HEAD --repo owner/repo --github-metadata-file ./github-metadata.json

 # 将 GitHub Release payload 写入文件，供 CI / GitHub API 直接 POST
  git-sao-hua release-notes v1.34.0..HEAD --format github-release-json --output ./github-release.json

 # 输出 GitHub Release manifest，附带本地构建产物的 name/path/size/sha256/contentType
  git-sao-hua release-notes v1.39.0..HEAD --format github-release-manifest-json --tag v1.40.0 --asset ./dist/app.zip --asset ./dist/checksums.txt --output ./github-release-manifest.json

 # 直接把本次 Release Notes 同步进 CHANGELOG
  git-sao-hua release-notes HEAD~10..HEAD --title "v1.40.0" --sync-changelog

 # 指定自定义 changelog 文件路径，适合 HISTORY.md 等命名
  git-sao-hua release-notes HEAD --title "v1.40.0" --sync-changelog --changelog HISTORY.md
```

生成结果会按 conventional commit 类型聚合为 Features、Fixes、Docs、Chores 等章节，并自动附带 commit short hash，方便直接贴到 GitHub Release、CHANGELOG 或飞书发布说明里。开启 `--sync-changelog` 后，会自动创建 changelog 文件，并在已有版本章节存在时执行替换，避免重复追加同一版本。

当指定 `--repo owner/repo` 时，会自动生成：
- 每个 commit 行的 `[hash](commit link)` 链接
- subject 中包含 `(#123)` 时自动生成 `[#123](pull link)` 链接
- range 为 `from..to` 格式时生成 `[compare link]` 可比链接
- 开启 `--enrich-github` 或提供 `--github-metadata-file` 时，额外补充 PR labels、PR author、顶层 PR/label/author 汇总信息

#### GitHub Release JSON 输出

`--format github-release-json` 会输出可直接提交给 GitHub Releases API 的 payload，适合 CI/CD 或发布脚本：

```json
{
  "tag_name": "v1.38.0",
  "name": "v1.38.0 Release Notes",
  "body": "### Features\n- **cli:** ...",
  "draft": false,
  "prerelease": false,
  "target_commitish": "main"
}
```

可配合这些参数使用：
- `--tag <tag>`: 指定 `tag_name`
- `--target <ref>`: 指定 `target_commitish`
- `--draft`: 生成草稿 release payload
- `--prerelease`: 标记为预发布
- `--body <text>`: 在自动生成的章节后追加自定义说明
- `--enrich-github`: 基于 `--repo` 和 commit subject 中的 PR 编号拉取 GitHub PR 元数据
- `--github-token <token>`: 为 GitHub API 请求提供 token，也可用环境变量 `GIT_SAO_HUA_GITHUB_TOKEN`
- `--github-metadata-file <file>`: 从本地 JSON 文件注入 GitHub metadata，适合离线流程、缓存或测试

#### GitHub Release Manifest JSON 输出

`--format github-release-manifest-json` 会在 `github-release-json` 的基础上，继续收集本地发布资产元数据，适合作为 CI/CD 上传 GitHub Release assets 的中间产物：

```json
{
  "success": true,
  "githubRelease": {
    "tag_name": "v1.40.0",
    "name": "v1.40.0",
    "body": "### Features\n- **cli:** ...",
    "draft": false,
    "prerelease": false,
    "target_commitish": "main"
  },
  "assets": [
    {
      "name": "app.zip",
      "path": "/workspace/dist/app.zip",
      "size": 102400,
      "sha256": "...",
      "contentType": "application/zip"
    }
  ]
}
```

可配合这些参数使用：
- `--asset <path>`: 可重复传入多个本地构建产物，自动收集 `name/path/size/sha256/contentType`
- `--output <file>`: 将 manifest 写入文件，供后续发布脚本直接消费
- `--tag <tag>` / `--target <ref>` / `--draft` / `--prerelease` / `--body <text>`: 与 `github-release-json` 保持一致

如果任一 `--asset` 文件不存在，CLI 会直接报错退出，避免生成不完整的发布清单。

#### JSON 输出格式

`--format json` 输出机器可读的结构化数据，适合自动化流水线、消费和 CI/CD 集成：

```json
{
  "title": "v1.35.0 Release Notes",
  "version": "v1.35.0 Release Notes",
  "range": "v1.34.0..HEAD",
  "repo": "owner/repo",
  "baseUrl": "https://github.com/owner/repo",
  "compare": {
    "from": "v1.34.0",
    "to": "HEAD",
    "url": "https://github.com/owner/repo/compare/v1.34.0...HEAD"
  },
  "generatedAt": "2026-04-18T10:00:00.000Z",
  "totalCommits": 15,
  "summary": {
    "Features": 5,
    "Fixes": 3,
    "Docs": 2
  },
  "sections": {
    "Features": [...],
    "Fixes": [...]
  },
  "commits": [
    {
      "hash": "abc123def456...",
      "shortHash": "abc123d",
      "type": "feat",
      "scope": "cli",
      "description": "add release notes",
      "breaking": false,
      "body": null,
      "authorName": "Developer",
      "authorEmail": "dev@example.com"
    }
  ]
}
```

JSON 字段说明：
- `title` / `version`: Release 标题
- `range`: Git range 范围
- `repo` / `baseUrl`: GitHub 仓库信息
- `compare`: Compare 链接信息（含 `from`、`to`、`url`）
- `generatedAt`: 生成时间（ISO 8601）
- `totalCommits`: 提交总数
- `summary`: 各类型提交数量统计
- `sections`: 按类型分组的提交列表
- `commits`: 完整提交列表（含 hash、type、scope、description、breaking、body、authorName、authorEmail）

### 插件作者发布工具链（v1.34.0）

现在除了“安装侧”能力，CLI 也补上了“发布侧”能力，方便第三方作者在发布前自检插件并生成索引元数据：

```bash
# 校验插件结构并输出 SHA-256
 git-sao-hua plugin validate ./my-plugin.json

# 强制校验插件签名（适合发布前或拉取后验货）
 git-sao-hua plugin verify ./my-plugin.json

# 生成打包摘要 + 建议索引条目
 git-sao-hua plugin pack ./my-plugin.json

# 生成 metadata JSON，便于提交到插件索引仓库或发布页
 git-sao-hua plugin pack ./my-plugin.json --output ./dist/plugin-metadata.json

# 同时带上预期分发地址或 GitHub 简写
 git-sao-hua plugin pack ./my-plugin.json --source-url https://example.com/plugins/my-plugin.json
 git-sao-hua plugin pack ./my-plugin.json --github owner/repo:path/to/plugin.json@main

# 生成带 Ed25519 签名的 metadata/indexEntry
 git-sao-hua plugin pack ./my-plugin.json --output ./dist/plugin-metadata.json --sign-private-key ./keys/ed25519-private.pem --public-key ./keys/ed25519-public.pem --key-id release-key

# 一次性生成发布交付包（metadata + index entry + submission markdown）
 git-sao-hua plugin release-kit ./my-plugin.json --output-dir ./dist --github owner/repo:path/to/plugin.json@main
```

`plugin pack` 会输出：
- 插件名称、版本、语言、风格、文件大小
- 当前文件的 `SHA-256`
- 可选的 `Ed25519` 签名信息（`signature`、`publicKey`、`keyId`、`algorithm`）
- 建议写入插件索引的 JSON 条目
- 可选的 `metadata.json`（包含 `indexEntry`）

`plugin release-kit` 会额外生成：
- `*.metadata.json`，用于归档或附加到 release 资产
- `*.index-entry.json`，可直接复制到插件索引仓库
- `*.submission.md`，内含插件信息、校验和、签名字段、索引条目和提交流程清单

### 插件作者 API / SDK 下沉（v1.40.0）

现在插件作者侧工作流不再局限于本地 CLI。REST API 与 JavaScript / Python / Go SDK 已同步支持“校验 / 打包预览 / release kit 预览”，适合接入 CI、远程服务和 Web 控制台。

```bash
POST /api/plugin-author/validate
POST /api/plugin-author/pack
POST /api/plugin-author/release-kit
```

JavaScript / TypeScript：

```ts
await client.validatePluginAuthorPayload({ plugin })
await client.packPluginAuthorPayload({ pluginJson })
await client.generatePluginReleaseKit({ plugin, github: 'owner/repo:plugin.json@main' })
```

Python：

```python
client.validate_plugin_author_payload(plugin=plugin)
client.pack_plugin_author_payload(plugin_json=plugin_json)
client.generate_plugin_release_kit(plugin=plugin, github='owner/repo:plugin.json@main')
```

Go：

```go
client.ValidatePluginAuthorPayload(&git_saohua.PluginAuthorPayload{Plugin: plugin})
client.PackPluginAuthorPayload(&git_saohua.PluginAuthorPayload{PluginJSON: pluginJSON})
client.GeneratePluginReleaseKit(&git_saohua.PluginAuthorPayload{Plugin: plugin})
```

### 插件安装治理与锁文件（v1.33.0）

- 每次安装插件后，都会在插件目录生成或更新 `plugins.lock.json`
- 锁文件会记录 `sourceType`、`sourceUrl`、`checksum`、`fromIndex`、`githubSpec`、`installedAt` 等元数据
- 当插件或索引提供签名信息时，会额外记录 `signature`、`publicKey`、`keyId`、`algorithm`、`signatureVerified`
- 可通过 `git-sao-hua plugin inspect <name>` 或 `GET /api/plugins/:name` 查看单个插件的来源审计信息
- 这样在平台期可以更清楚地回答“这个插件从哪来、何时装的、是否带摘要校验”

### 插件签名与验签（v1.36.0）

平台期开始补插件供应链安全：

- `plugin pack` 支持使用 `Ed25519` 私钥对插件 `SHA-256` 做签名
- 生成的 `metadata.json` 和建议 `indexEntry` 会带上 `signature / publicKey / keyId / algorithm`
- `plugin verify <path|name>` 可对本地插件或已安装插件执行强制验签
- `plugin validate <path>` 在有签名信息时会顺带展示签名状态
- 从插件索引安装时，如果索引条目带签名信息，会自动验签并把结果写入 `plugins.lock.json`

建议做法：

1. 发布前执行 `plugin pack --output ... --sign-private-key ... --public-key ...`
2. 把生成的 `indexEntry` 或 `metadata.json` 提交到插件索引仓库
3. 安装侧通过 `plugin inspect` / `plugin verify` 查看签名状态

### 插件格式

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "我的自定义插件",
  "author": "developer",
  "data": {
    "zh-CN": {
      "feat": {
        "love": ["自定义骚话"]
      }
    }
  }
}
```

### 从 URL 安装插件（v1.28.0 新增）

支持从 HTTP/HTTPS URL 直接安装插件：

```bash
git-sao-hua plugin install --url https://example.com/my-plugin.json
```

如果你拿到了插件发布方提供的 SHA-256 摘要，可以在安装时一并校验完整性：

```bash
git-sao-hua plugin install --url https://example.com/my-plugin.json --checksum <sha256>
```

从 v1.31.0 起，远程插件与索引默认只信任官方 GitHub 源（`raw.githubusercontent.com`、`githubusercontent.com`、`github.com`）。如果你要接入自建源，可以显式追加允许的 host：

```bash
git-sao-hua plugin install --url https://plugins.example.com/my-plugin.json --allow-host plugins.example.com
```

也可以在项目级 `.saohuarc.json` 中持久化配置，或通过环境变量 `PLUGIN_ALLOWED_HOSTS` 统一设置：

```json
{
  "plugins": {
    "allowedHosts": ["plugins.example.com", "mirror.example.net"]
  }
}
```

### 插件市场（v1.29.0 新增）

支持从远程插件索引搜索和安装插件：

```bash
# 搜索插件市场（支持搜索 name/description/tags）
git-sao-hua plugin search love

# 指定自定义索引 URL
git-sao-hua plugin search love --index https://example.com/index.json

# 为自定义索引显式放行 host
git-sao-hua plugin search love --index https://plugins.example.com/index.json --allow-host plugins.example.com

# 从索引安装插件
git-sao-hua plugin install --from-index my-plugin

# 从自定义索引安装插件
git-sao-hua plugin install --from-index my-plugin --index https://example.com/index.json

# 从自定义索引安装并同时放行索引 / 插件源 host
git-sao-hua plugin install --from-index my-plugin --index https://plugins.example.com/index.json --allow-host plugins.example.com
```

API 使用方式：

```bash
# 搜索插件市场
curl "http://localhost:3000/api/plugin-registry?q=love"

# 搜索自定义插件索引并放行 host
curl "http://localhost:3000/api/plugin-registry?q=love&indexUrl=https://plugins.example.com/index.json&allowedHosts=plugins.example.com"

# 从索引安装插件（需要认证）
curl -X POST http://localhost:3000/api/plugins/install-from-index \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"name": "my-plugin", "indexUrl": "https://plugins.example.com/index.json", "allowedHosts": ["plugins.example.com"]}'
```

默认使用环境变量 `PLUGIN_INDEX_URL` 或内置默认索引 URL。可以通过 `--index` 参数覆盖。远程访问 host 会按以下优先级决定是否放行：CLI/API 显式传参 > `.saohuarc.json` 的 `plugins.allowedHosts` > `PLUGIN_ALLOWED_HOSTS` 环境变量 > 内置官方源白名单。

#### 索引格式

插件索引 JSON 文件格式：

```json
{
  "plugins": [
    {
      "name": "love-pack",
      "version": "1.0.0",
      "description": "甜甜的情话插件包",
      "author": "developer",
      "tags": ["love", "chinese"],
      "homepage": "https://github.com/example/love-pack",
      "sourceUrl": "https://example.com/plugins/love-pack.json",
      "checksum": "3d7d3a6b6d6b8c3e2d0d3d6f0a9c5f96a4a6a1b3d2c4e5f60718293a4b5c6d7e"
    }
  ]
}
```

必需字段：`name`, `version`, `sourceUrl`
可选字段：`description`, `author`, `tags`, `homepage`, `checksum`

如果你在维护插件索引，可以直接用 `git-sao-hua plugin pack <path>` 生成建议索引条目，再根据实际托管地址补齐 `sourceUrl` 或 `github`。

API 安装方式：

```bash
curl -X POST http://localhost:3000/api/plugins/install \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"sourceUrl": "https://example.com/plugin.json"}'

curl -X POST http://localhost:3000/api/plugins/install \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"sourceUrl": "https://example.com/plugin.json", "checksum": "<sha256>"}'
```

### 配置文件 `.saohuarc.json`

在仓库根目录创建 `.saohuarc.json` 可以自定义骚话行为：

```json
{
  "style": "sao",        // 默认风格: love/sao/zha/chu/fo
  "language": "zh-CN",   // 默认语言: zh-CN/en
  "auto": true,          // 是否启用智能检测 commit 类型
  "ai": false,           // 是否使用 AI 生成
  "format": "suffix",    // 骚话位置: suffix(末尾注释)/prefix(前缀)/replace(替换)
  "emoji": true          // 是否包含 emoji
}
```

| 配置项 | 说明 | 可选值 | 默认值 |
|--------|------|--------|--------|
| `style` | 骚话风格 | `love`/`sao`/`zha`/`chu`/`fo` | `sao` |
| `language` | 语言 | `zh-CN`/`en` | `zh-CN` |
| `auto` | 智能检测 | `true`/`false` | `true` |
| `ai` | AI 生成 | `true`/`false` | `false` |
| `format` | 骚话位置 | `suffix`/`prefix`/`replace` | `suffix` |
| `emoji` | 包含 emoji | `true`/`false` | `true` |

### 跳过骚话

```bash
# 单次跳过
GIT_SAO_HUA_SKIP=true git commit -m "serious commit"
```

### Hook 安全机制

- ✅ 安装前自动备份已有 hook（保存为 `.bak`）
- ✅ 链式调用原有 hook，不会破坏已有工作流
- ✅ 卸载时自动恢复备份的 hook
- ✅ CLI 不可用时静默退出，不影响正常提交
- ✅ 仅处理 message/template 来源的 commit，merge/squash/amend 不干扰

## 🚀 快速开始

### 方式一：CLI 命令行（v1.18.0 新增 🎉）

```bash
# 全局安装
npm install -g git-sao-hua

# 随机生成骚话
git-sao-hua

# 指定类型和风格
git-sao-hua -t feat -s love

# 交互式提交向导（语言 / 生成模式 / 预览 / 一键提交）
git-sao-hua -i

# 全屏 TUI 提交向导（更专注的终端流程）
git-sao-hua --tui

# 生成并直接 git commit
git-sao-hua -g

# 指定输出语言
git-sao-hua --lang en
git-sao-hua -t feat -s love --lang zh-CN

# 用自然语言描述生成 commit message（v1.35.0 新增）
git-sao-hua -m "修复登录页面闪退 bug"
git-sao-hua -m "新增用户注册功能"
git-sao-hua -m "add new feature" --lang en
git-sao-hua -m "更新依赖版本" -s love

# 生成 Release Notes（新增）
git-sao-hua release-notes HEAD~20..HEAD
git-sao-hua release-notes --from v1.34.0 --to HEAD --title "v1.35.0 Release Notes"
git-sao-hua release-notes HEAD --output ./RELEASE_NOTES.md

# 同步 Release Notes 到 CHANGELOG（v1.40.0 新增）
git-sao-hua release-notes HEAD~10..HEAD --sync-changelog
git-sao-hua release-notes HEAD~10..HEAD --title "v1.40.0" --sync-changelog
git-sao-hua release-notes HEAD --title "v1.40.0" --sync-changelog --changelog HISTORY.md
```

详细文档见 [cli/README.md](cli/README.md)

### 方式四：GitHub Action（v1.22.0 新增 🎉）

在你的 CI/CD 工作流中自动生成骚话 commit message：

```yaml
steps:
  - uses: actions/checkout@v4
  
  - name: Generate Saohua Commit Message
    uses: ./action
    id: saohua
    with:
      type: feat          # 可选：commit 类型，默认自动检测
      style: casual       # 可选：骚话风格 (normal/professional/casual/poetic/meme)
      language: zh        # 可选：语言 (zh/en/ja)
      commit-message: "feat: add new feature"  # 可选：用于智能检测
  
  - name: Show Result
    run: echo "${{ steps.saohua.outputs.commit-message }}"
```

详细文档见 [action/README.md](action/README.md)

### 方式二：直接打开

直接双击 `index.html` 文件即可在浏览器中使用！

### 方式三：本地服务器

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx serve .

# 使用 PHP
php -S localhost:8000
```

然后访问 `http://localhost:8000`

## 🧩 多语言 SDK

项目现在已经补齐 Python、Go、JavaScript / TypeScript 三套 SDK，方便在不同运行时里直接接入骚话 API。

### JavaScript / TypeScript SDK（v1.31.0 新增 🎉）

```bash
cd sdk/javascript
npm install
npm test
```

```ts
import { SaohuaClient } from 'git-saohua';

const client = new SaohuaClient({
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.SAOHUA_API_KEY,
  timeout: 8000,
  headers: {
    'X-Request-From': 'my-script',
  },
});

const result = await client.randomSaohua('zh-CN', 'love');
console.log(result.fullMessage);
```

支持能力：

- 健康检查、随机骚话、按类型 / 风格生成
- SSE 流式骚话生成（实时推送 meta/item/done/error 事件）
- AI 骚话生成
- 自然语言提交分析 / 直接生成 commit 骚话
- 批量骚话生成（最多 50 条/请求）
- Release Notes 生成、GitHub Release payload / manifest 生成
- 类型 / 风格 / 统计查询
- 插件列表、安装、删除、模板创建、重载
- 插件索引搜索、按索引安装
- API Key / Bearer Token / timeout / 自定义 headers

JavaScript / TypeScript SDK 批量生成示例：

```ts
const batch = await client.batchSaohua([
  { mode: 'random' },
  { mode: 'typed', type: 'fix' },
  { mode: 'typed_style', type: 'feat', style: 'love' },
  {
    mode: 'ai',
    diff: 'diff --git a/api.js b/api.js\n+app.post("/demo")',
    type: 'feat',
  },
]);

console.log(batch.count, batch.successCount);

const analysis = await client.analyzeNaturalLanguage('修复登录按钮点击无效');
console.log(analysis.detectedType, analysis.topic);

const naturalCommit = await client.generateFromNaturalLanguage('新增分享海报下载功能', {
  type: 'feat',
  style: 'love',
});
console.log(naturalCommit.fullMessage);

const releaseNotes = await client.generateReleaseNotes({
  range: 'v1.0.0..HEAD',
  tagName: 'v1.1.0',
});
console.log(releaseNotes.githubRelease);

const manifest = await client.generateReleaseManifest(['README.md'], {
  tagName: 'v1.1.0',
});
console.log(manifest.assets);

const stream = client.streamSaohua(
  { type: 'fix', count: 3, intervalMs: 100 },
  {
    onMeta(meta) {
      console.log('stream meta', meta);
    },
    onItem(item) {
      console.log('candidate', item.fullMessage);
    },
    onDone(done) {
      console.log('stream done', done.total);
    },
    onError(error) {
      console.error('stream error', error.message);
    },
  },
);

// 需要时可手动中止
// stream.abort();

const wsStream = client.streamSaohuaWs(
  { type: 'fix', count: 3, intervalMs: 100 },
  {
    onItem(item) {
      console.log('ws candidate', item.fullMessage);
    },
  },
);

// 需要时可手动关闭
// wsStream.close();
```

Python SDK 流式生成示例：

```python
from git_saohua import SaohuaClient

with SaohuaClient("http://localhost:3000") as client:
    for event in client.iter_stream_saohua(commit_type="fix", count=3, interval_ms=100):
        if event.type == "item":
            print(event.data.full_message)

    client.stream_saohua_ws(
        commit_type="feat",
        count=2,
        on_item=lambda item: print(item.full_message),
    )

    notes = client.generate_release_notes(range="v1.0.0..HEAD", tag_name="v1.1.0")
    print(notes.total_commits)

    manifest = client.generate_release_manifest(["README.md"], tag_name="v1.1.0")
    print(manifest.assets[0].name)
```

Go SDK 流式生成示例：

```go
streamOptions := git_saohua.StreamOptions{Type: "fix", Count: 3, IntervalMs: 100}

_ = client.StreamSaohua(streamOptions, func(event git_saohua.StreamEvent) error {
  if event.Item != nil {
    fmt.Println(event.Item.FullMessage)
  }
  return nil
})

events, errs := client.StreamSaohuaWsChan(git_saohua.StreamOptions{Type: "feat", Count: 2})
for event := range events {
  if event.Item != nil {
    fmt.Println(event.Item.FullMessage)
  }
}
if err := <-errs; err != nil {
  panic(err)
}

notes, _ := client.GenerateReleaseNotes("v1.0.0..HEAD", "v1.1.0", "justlovemaki/git-commit-sao-hua", "v1.1.0")
fmt.Println(notes.TotalCommits)

manifest, _ := client.GenerateReleaseManifest([]string{"README.md"}, "", "v1.1.0", "", "v1.1.0")
fmt.Println(manifest.Assets[0].Name)
```

REST API 自然语言端点：

```bash
curl -X POST http://localhost:3000/api/saohua/natural/analyze \
  -H 'Content-Type: application/json' \
  -d '{"text":"修复登录按钮点击无效"}'

curl -X POST http://localhost:3000/api/saohua/natural/generate \
  -H 'Content-Type: application/json' \
  -d '{"text":"新增分享海报下载功能","type":"feat","style":"love"}'

# SSE 流式生成 3 条 fix 候选
curl -N 'http://localhost:3000/api/saohua/stream?type=fix&count=3&intervalMs=100'

# WebSocket 流式生成（可配合 wscat 等客户端）
# wscat -c 'ws://localhost:3000/api/saohua/ws?type=fix&count=3&intervalMs=100'

# 生成 Release Notes
curl -X POST http://localhost:3000/api/release-notes/generate \
  -H 'Content-Type: application/json' \
  -d '{"range":"v1.0.0..HEAD","tagName":"v1.1.0","title":"v1.1.0"}'

# 生成 GitHub Release manifest
curl -X POST http://localhost:3000/api/release-notes/manifest \
  -H 'Content-Type: application/json' \
  -d '{"tagName":"v1.1.0","assetPaths":["README.md"]}'
```

更多说明见：

- `sdk/javascript/README.md`
- `sdk/python/README.md`
- `sdk/go/README.md`

## 🤖 MCP Server（v1.40.0 新增 🚀）

项目现已新增轻量 MCP Server，可让 Claude Desktop、Cursor、Cherry Studio、OpenAI Agents 等支持 Model Context Protocol 的 AI Agent 直接调用骚话生成能力。

### 启动方式

默认是 stdio 传输，适合 Claude Desktop、Cursor 等本地 MCP 客户端：

```bash
cd mcp-server
node server.js
```

如需远程 HTTP 传输，可开启 `MCP_HTTP_MODE`：

```bash
cd mcp-server
MCP_HTTP_MODE=1 MCP_HTTP_PORT=3100 node server.js
```

如果需要保护远程入口，可额外设置 Bearer Token：

```bash
cd mcp-server
MCP_HTTP_MODE=1 MCP_HTTP_PORT=3100 MCP_AUTH_TOKEN=your-secret node server.js
```

或通过包脚本测试：

```bash
cd mcp-server
npm test
```

### 已开放工具

- `generate_saohua` - 生成单条骚话提交信息，支持 `type/style/language/description`
- `batch_generate_saohua` - 批量生成骚话，复用核心库批量能力
- `generate_from_natural_language` - 根据自然语言描述直接生成 commit message
- `list_taxonomy` - 列出支持的 commit types 与 styles

### 已开放资源（Resources）

- `git-sao-hua://info/server` - 返回 MCP Server 元信息、能力清单与支持语言
- `git-sao-hua://taxonomy/commits` - 返回中英双语 commit type taxonomy
- `git-sao-hua://taxonomy/styles` - 返回中英双语骚话风格 taxonomy
- `git-sao-hua://info/usage` - 返回 MCP 使用说明，方便 Agent 在会话内自助发现能力

### 已开放提示模板（Prompts）

- `generate_from_natural_language` - 把自然语言需求整理成一条可直接使用的 commit message 建议
- `generate_from_diff` - 根据 git diff 生成 commit message 候选，并附带变更分析摘要

### Claude Desktop 配置示例

```json
{
  "mcpServers": {
    "git-sao-hua": {
      "command": "node",
      "args": [
        "/absolute/path/to/git-commit-sao-hua/mcp-server/server.js"
      ]
    }
  }
}
```

这个 MCP Server 不依赖额外第三方 MCP SDK，默认通过 stdio + JSON-RPC 处理 `initialize`、`tools/list`、`tools/call`、`resources/list`、`resources/read`、`prompts/list`、`prompts/get`，方便在受限环境里集成。

### HTTP 远程 MCP 入口（v1.40.0 新增增强）

除了 stdio 模式，现还支持 HTTP 远程调用，适合无法建立 stdio 管道的场景：

```bash
# 启动 HTTP 模式（默认端口 3100）
MCP_HTTP_MODE=1 node mcp-server/server.js

# 自定义端口
MCP_HTTP_PORT=8080 MCP_HTTP_MODE=1 node mcp-server/server.js

# 启用 Bearer Token 鉴权（推荐统一使用 MCP_AUTH_TOKEN，兼容旧变量 MCP_HTTP_AUTH_TOKEN）
MCP_AUTH_TOKEN=your-secret MCP_HTTP_MODE=1 node mcp-server/server.js
```

#### 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查，返回 `{ ok, transport, serverInfo }` |
| `/mcp` | POST | MCP JSON-RPC 入口，支持 initialize/tools/resources/prompts 调用 |

#### HTTP 请求示例

```bash
# 健康检查
curl http://localhost:3100/health

# 初始化
curl -X POST http://localhost:3100/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","clientInfo":{"name":"test","version":"1.0"},"capabilities":{}}}'

# 调用工具（带鉴权）
curl -X POST http://localhost:3100/mcp \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-secret' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_saohua","arguments":{"type":"fix","style":"love","language":"zh-CN"}}}'
```

#### 测试

```bash
# stdio 测试
node mcp-server/test.js

# HTTP 测试
MCP_HTTP_MODE=1 node mcp-server/test.js --http
```

## 🌐 部署

### GitHub Pages

1. Fork 或克隆此仓库
2. 启用 GitHub Pages（Settings → Pages → Source: main branch）
3. 访问 `https://yourusername.github.io/git-commit-sao-hua`

### Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### Netlify

1. 访问 [Netlify Drop](https://app.netlify.com/drop)
2. 拖拽整个项目文件夹
3. 完成！获得一个可分享的链接

## 📖 使用示例

### 情话模式
```
fix: 用户登录功能

我为你修复了整个世界
```

### 骚话模式
```
feat: 支付模块

这个 feature，比我还会撩
```

### 扎心模式
```
chore: 更新依赖

更新依赖，更新不了生活
```

### 中二模式
```
refactor: 核心模块

破而后立，晓喻新生！
```

### 佛系模式
```
docs: API 文档

写与不写，都是缘分
```

## ⌨️ 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Enter` | 生成骚话 Commit |
| `Ctrl+C` | 复制结果 |
| `R` | 随机生成 |
| `D` | 切换主题 |

## 🎯 Commit 类型说明

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| `fix` | 修复 bug | 修复问题 |
| `feat` | 新功能 | 添加功能 |
| `chore` | 日常维护 | 更新依赖、配置 |
| `docs` | 文档 | 文档更新 |
| `refactor` | 重构 | 代码重构 |
| `style` | 格式 | 代码格式化 |
| `test` | 测试 | 添加/修改测试 |
| `perf` | 性能 | 性能优化 |
| `ci` | CI 配置 | CI/CD 配置 |
| `build` | 构建 | 构建系统 |
| `revert` | 回滚 | 回滚提交 |
| `hotfix` | 紧急修复 | 生产环境紧急修复 |

## 🏆 成就系统

解锁 12 个隐藏成就，成为真正的骚话大师！

| 成就 | 描述 | 图标 |
|------|------|------|
| 初次尝试 | 第一次生成骚话 | 🎉 |
| 渐入佳境 | 累计生成 10 次 | 🔥 |
| 骚话大师 | 累计生成 50 次 | ✨ |
| 传说级骚话王 | 累计生成 100 次 | 👑 |
| 收藏家 | 收藏 5 条骚话 | ⭐ |
| 全能选手 | 使用所有 Commit 类型 | 🎯 |
| 风格大师 | 使用所有风格 | 🎨 |
| 深夜 coder | 在 23:00-06:00 生成 | 🌙 |
| 分享达人 | 分享 1 次 | 📢 |
| 键盘侠 | 使用快捷键生成 | ⌨️ |
| 变脸大师 | 切换主题 | 🌓 |
| 复制粘贴 | 复制 10 次 | 📋 |

## 🛠️ 技术栈

- 纯 HTML + CSS + JavaScript
- 无需后端，静态部署
- 无外部依赖（除二维码生成库）
- localStorage 本地存储
- 响应式设计

## 📝 扩展

想添加更多骚话？编辑 `index.html` 中的 `saoHuaDB` 对象即可！

```javascript
const saoHuaDB = {
    fix: {
        love: ["你的骚话 here"],
        sao: ["你的骚话 here"],
        // ...
    },
    // ...
};
```

## 📊 数据统计

所有统计数据均保存在本地（localStorage），包括：
- 生成次数
- 复制次数
- 分享次数
- 收藏数量
- 使用的 Commit 类型分布
- 使用的风格分布
- 深夜生成次数
- 主题切换次数

## 🔒 隐私说明

- 所有数据存储在本地（localStorage）
- 不会上传任何数据到服务器
- 不会收集任何个人信息
- 开源透明，代码可审查

## 🔌 VSCode 插件

在 VSCode 中享受最便捷的骚话生成体验！

### 📦 安装方式

#### 方式一：VSCode Marketplace（推荐）⭐

1. 打开 VSCode
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 **"Git Commit 骚话生成器"** 或 **"git-commit-sao-hua"**
4. 点击安装

或直接访问：[VSCode Marketplace 页面](https://marketplace.visualstudio.com/items?itemName=coding-expert.git-commit-sao-hua)

#### 方式二：手动安装 VSIX

1. 从 [GitHub Releases](https://github.com/justlovemaki/git-commit-sao-hua/releases) 下载最新版的 `.vsix` 文件
2. 在 VSCode 中按 `Ctrl+Shift+P` 打开命令面板
3. 输入 `Extensions: Install from VSIX...`
4. 选择下载的 `.vsix` 文件

#### 方式三：命令行安装

```bash
# 下载 VSIX
wget https://github.com/justlovemaki/git-commit-sao-hua/releases/latest/download/git-commit-sao-hua.vsix

# 安装
code --install-extension git-commit-sao-hua.vsix
```

### 🚀 快速开始

安装完成后：

1. 打开任意 Git 仓库
2. 按 `Ctrl+Shift+P` 打开命令面板
3. 输入 `Git Commit 骚话` 查看可用命令
4. 选择 `生成骚话 Commit` 开始使用

**快捷键**：
- `Ctrl+Shift+G` - 随机生成骚话
- `Ctrl+Shift+S` - 查看使用统计

### 语言设置 / Language Settings

支持多语言界面 / Supports multiple languages:

| Language | Code | 说明 |
|----------|------|------|
| English | `en` | English interface |
| 中文 | `zh` | 中文界面 |
| 日本語 | `ja` | 日本語インターフェース |
| 한국어 | `ko` | 한국어 인터페이스 |
| Español | `es` | Interfaz en español |
| Français | `fr` | Interface française |
| Deutsch | `de` | Deutsche Oberfläche |
| Русский | `ru` | Русский интерфейс |

**VSCode 插件设置方式 / VSCode Extension Settings:**

1. 打开 VSCode 设置 / Open VSCode Settings: `Ctrl+,`
2. 搜索 / Search: `gitCommitSaoHua.language`
3. 选择语言代码 / Select language code: `en`, `zh`, `ja`, `ko`, `es`, `fr`, `de`, `ru`
4. 重启 VSCode 生效 / Restart VSCode to apply

**CLI 设置方式 / CLI Settings:**

```bash
# 通过 --lang 参数指定语言 / Specify language via --lang flag
git-sao-hua --lang en
git-sao-hua -t feat -s love --lang zh
git-sao-hua --lang ja
```

---

插件源码位于 `vscode-extension/`。

### 插件偏好记忆

VSCode 插件当前会在**工作区维度**记住最近一次使用的 Commit 类型和风格：

- 执行 `选择 Commit 类型` / `选择风格模式` 后会立即保存偏好
- 执行 `生成骚话 Commit` / `随机生成 Commit` 后也会同步更新偏好
- 如果想恢复为 `gitCommitSaoHua.defaultType` 和 `gitCommitSaoHua.defaultStyle`，可执行命令：`重置类型/风格偏好`

### 智能检测功能（v1.15.0）

插件支持基于 AST 代码结构分析的智能 Commit 类型检测：

- **检测能力**：
  - 🧠 **AST 代码结构分析** - 识别新增函数、类/组件、CSS 样式变更
  - 📦 **Import/Export 检测** - 检测 import 语句和 export 语句变更
  - 🧪 **测试文件识别** - 检测 .test.js, .spec.js 等测试文件变更
  - ⚡ **Promise/async 检测** - 检测 .then(), await, async function, Promise 相关
  - 🔴 **错误处理检测** - 检测 try-catch, throw new Error, .catch() 等
  - ⚛️ **React Hooks 检测** - 检测 useState, useEffect, useContext, useReducer 等
  - 📝 **Diff 关键词分析** - 检测 fix/feat 相关关键词
  - 🌍 **多语言关键词** - 支持 Python/Java/TypeScript/Go/Rust/PHP/Ruby/Swift 特定关键词
  - 📁 **文件类型映射** - 20+ 种文件类型自动识别

- **加权评分系统**：
  - AST 分析权重：0.4
  - Diff 关键词权重：0.4
  - 文件类型权重：0.2

- **置信度提升**：多个分析来源指向同一类型时自动提升置信度等级

- **优先级**：AST 分析 > Diff 关键词 > 文件类型

- **置信度等级**：
  - 🎯 **高** - AST 分析检测到明确的代码结构变更，或多个来源一致
  - ✨ **中** - Diff 关键词匹配 1-2 个或 AST 中等置信度
  - 💡 **低** - 仅基于文件类型分析

- **使用方式**：执行命令 `智能检测生成 Commit` 或在命令面板中输入 `gitCommitSaoHua.generateSmart`

### 智能检测日志与用户反馈（v1.16.0）

插件支持智能检测日志记录和用户反馈收集，帮助分析和优化检测准确率：

- **日志记录内容**：
  - ⏰ 检测时间戳
  - 📁 文件类型分析结果
  - 🧠 AST 分析结果（检测到的代码结构变更）
  - 📝 Diff 关键词分析结果
  - 🎯 最终决策类型
  - 📊 置信度等级
  - 👤 用户选择（采纳/跳过/手动修改）

- **用户反馈选项**：
  - ✓ **采纳推荐** - 使用智能检测推荐的类型
  - 🔄 **手动修改** - 选择其他 Commit 类型
  - → **跳过检测** - 使用手动选择模式

- **日志查看**：执行命令 `查看检测日志` 或在命令面板中输入 `gitCommitSaoHua.showDetectionLogs`
  - 查看最近检测记录
  - 查看准确率分析
  - 清空日志

- **准确率分析**：执行命令 `分析检测准确率` 或在命令面板中输入 `gitCommitSaoHua.analyzeDetectionAccuracy`
  - 总检测次数
  - 采纳/跳过/修改次数
  - 用户采纳率百分比

- **配置项**：
  - `gitCommitSaoHua.enableDetectionLogging` - 启用检测日志记录（默认 true）

- **存储限制**：最多保留 50 条检测日志

### 代码模式识别（v1.17.0）

插件新增 5 种代码模式智能识别，进一步提升智能检测准确率：

| 模式类型 | 检测内容 | 适用场景 |
|----------|----------|----------|
| 🗄️ **数据库操作模式** | SQL 查询、ORM 操作、MongoDB、Redis | 数据层变更 |
| 🌐 **API/HTTP 请求模式** | fetch、axios、XMLHttpRequest、GraphQL、REST API | 接口变更 |
| 🛤️ **路由变更模式** | React Router、Vue Router、Angular Router、Next.js 路由 | 路由配置 |
| 🎨 **组件/模板模式** | React 组件、Vue 组件、Web 组件、模板引擎 | UI 组件 |
| 📐 **样式布局模式** | CSS 布局、Flexbox、Grid、Sass/Less 样式 | 样式调整 |

- **检测方式**：基于 AST 分析和 Diff 关键词双重检测
- **优先级**：高于文件类型分析，低于 AST 代码结构分析
- **置信度影响**：检测到特定代码模式时，对应 Commit 类型置信度提升一级

- **使用方式**：执行命令 `智能检测生成 Commit` 或在命令面板中输入 `gitCommitSaoHua.generateSmart`

### 使用统计功能

插件支持记录和查看骚话生成统计：

- **统计内容**：
  - 总生成次数
  - 每种 Commit 类型的使用次数
  - 每种风格的使用次数
  - 最近生成时间

- **查看统计**：执行命令 `查看使用统计` 或在命令面板中输入 `gitCommitSaoHua.showStatistics`

- **统计数据面板展示**：
  - 总生成次数
  - 最常用的 Commit 类型 (Top 3)
  - 最常用的风格 (Top 3)
  - 最近生成时间
  - 重置统计选项

- **重置统计**：在统计面板中选择"重置统计"可清空所有统计数据

### 快捷设置面板（v1.14.0）

插件提供快捷设置面板，无需打开 VSCode 设置即可快速调整智能检测参数：

- **可调节设置**：
  - ⚙️ **高置信度阈值** - 高置信度所需的关键词数量（范围 1-10，默认 3）
  - ⚙️ **中等置信度阈值** - 中等置信度所需的关键词数量（范围 1-5，默认 1）
  - ⚙️ **AST 分析优先** - 高置信度 AST 结果优先于其他分析（默认启用）
  - ⚙️ **Diff 分析优先** - 当 AST 置信度不足时，优先采用 diff 结果（默认启用）
  - ⚙️ **描述提示** - 生成骚话后询问是否添加详细描述（默认启用）

- **打开方式**：执行命令 `快捷设置面板` 或在命令面板中输入 `gitCommitSaoHua.quickSettings`

- **操作方式**：
  - 数值设置：选择后输入新值，会自动验证范围
  - 开关设置：选择后在启用/禁用之间切换
  - 保存后立即生效，并显示确认消息


### 本地打包

```bash
cd vscode-extension
npm ci
npm run check
npm run package
```

打包成功后会在 `vscode-extension/` 目录生成：

- `git-commit-sao-hua.vsix`

可本地安装测试：

```bash
code --install-extension vscode-extension/git-commit-sao-hua.vsix
```

### GitHub Actions 自动打包

仓库内置工作流：`.github/workflows/vscode-extension-package.yml`

触发方式：

- push 到 `main` / `master`
- 创建或推送 tag：`v*`（例如 `v1.0.0`）
- 发起 / 更新 Pull Request（当改动包含 `vscode-extension/**` 或该 workflow 本身时）
- 手动触发 `workflow_dispatch`

CI 会执行：

1. 安装 `vscode-extension` 依赖
2. 运行 `npm run check`
3. 运行 `npm run package` 生成 `.vsix`
4. 上传 artifact：`git-commit-sao-hua-vsix`
5. 根据触发来源发布到不同的 GitHub Release

#### Release 策略

- **普通 push 到 `main` / `master`**
  - 继续上传 Actions artifact
  - 同时自动创建或更新一个固定的 **`dev` 预发布 Release**
  - Release 会始终保留最新一次主干构建产物，并替换旧的 `.vsix`
- **推送 `v*` tag（如 `v1.0.0`）**
  - 继续上传 Actions artifact
  - 同时沿用正式发布逻辑，把 `.vsix` 附加到对应版本号的 GitHub Release

#### 去哪里下载插件包

- **主干最新开发版（dev release）**：GitHub 仓库的 Releases 页面中 `dev` / `Development Build`
- **正式版**：对应 `v*` tag 的 GitHub Release
- **临时构建产物**：对应 workflow run 的 Actions artifact `git-commit-sao-hua-vsix`

安装方式相同：下载 `git-commit-sao-hua.vsix` 后，在 VSCode 中选择“Extensions: Install from VSIX...”即可。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

- 提供更多骚话/情话
- 改进 UI 设计
- 添加新功能
- 报告 Bug

### 贡献骚话

请在 Issue 中提供：
1. Commit 类型（fix/feat/chore 等）
2. 风格（情话/骚话/扎心/中二/佛系）
3. 你的骚话内容

## 📄 License

MIT License - 想怎么用就怎么用

## 🏗️ 项目架构

```
git-commit-sao-hua/
├── lib/                      # 核心库 (git-sao-hua-core)
│   ├── sao-hua-data.js       # 唯一的骚话数据源
│   ├── generator.js          # 共享生成逻辑
│   ├── hook-manager.js     # Git Hook 管理器 (v1.26.0)
│   ├── config.js            # 项目配置系统 (v1.26.0)
│   ├── index.js              # 统一导出入口
│   ├── package.json          # 包定义 (name: git-sao-hua-core)
│   └── test.js               # 基础测试
│
├── index.html                # Web 版本
│
├── cli/                      # 命令行工具
│   └── index.js              # CLI 主程序 (引用 lib/)
│
└── vscode-extension/         # VSCode 插件
    └── extension.js           # 插件主程序 (引用 lib/)
```

### 核心库 (lib/)

`lib/` 目录是项目的共享核心模块，提供：

- **sao-hua-data.js** - 唯一的骚话数据源，包含 12 种 Commit 类型 × 5 种风格的全部文案
- **generator.js** - 共享的生成逻辑，支持随机生成、按类型生成、按风格生成等
- **index.js** - 统一导出入口，方便各端引用

#### 核心库使用示例

```javascript
const { generateRandom, generateByType, generateFullCommitMessage } = require('./lib');

// 随机生成
const result = generateRandom();
// { type: 'feat', style: 'love', message: 'xxx', fullMessage: 'feat: xxx' }

// 按类型生成（随机风格）
const result = generateByType('fix');
// { type: 'fix', style: 'sao', message: 'xxx', fullMessage: 'fix: xxx' }

// 按类型和风格生成
const result = generateByType('feat', 'love');
// { type: 'feat', style: 'love', message: 'xxx', fullMessage: 'feat: xxx' }

// 生成完整 commit message
const msg = generateFullCommitMessage('fix', 'sao', '登录功能');
// fix: 登录功能
// 
// bug 修好了，要不要奖励我一个 star？
```

#### 运行核心库测试

```bash
cd lib
npm test
```

## 💖 Made with Love

由 coding-expert 为 Master 创建

---

**让代码不再枯燥，让提交充满乐趣！** 🎉

## 📋 版本治理

项目使用集中式版本管理方案，确保各包版本一致性。

### 发布元数据

`RELEASE.json` 是唯一的版本来源，包含：
- `version`: 主版本号
- `packages`: 各子包版本信息
- `checks`: 版本一致性检查规则

### 版本检查

运行 Release Doctor 检查版本一致性：

```bash
node bin/release-doctor.js
```

### 手动更新版本

1. 更新 `RELEASE.json` 中的 `version` 和 `packages[x].version`
2. 更新各 `package.json` 的 `version`
3. 运行 `node bin/release-doctor.js` 验证

### 动态版本

以下文件从 `RELEASE.json` 动态读取版本：
- `cli/index.js` - CLI 版本
- `api/server.js` - API health endpoint
- `api/swagger.js` - OpenAPI spec
- `lib/index.js` - 核心库版本

## 🎯 版本历史

### v1.31.0
- 🟨 **JavaScript / TypeScript SDK** - 新增 `sdk/javascript/`，覆盖健康检查、骚话生成、AI、统计、插件管理、插件索引
- 🔑 **认证与请求控制** - 支持 API Key / Bearer Token / timeout / 自定义 headers / 自定义 fetch
- 🧪 **Node 多版本验证** - 补齐 8 个单元测试、Node 18/20/22 CI 与 npm 发布骨架
- 📚 **多语言文档同步** - 根 README、SDK README、PROJECT_EVOLUTION 同步纳入 JS / TS 生态说明

### v1.29.0
- 🔌 **插件市场** - 支持从远程索引搜索和安装插件
- 🔍 **搜索插件** - 支持按 name/description/tags 搜索
- 📦 **索引安装** - `plugin install --from-index <name>` 从索引安装
- 🌐 **自定义索引** - 支持通过 `--index` 或环境变量覆盖默认索引
- 🔗 **API 新端点** - `GET /api/plugin-registry` 搜索，`POST /api/plugins/install-from-index` 安装

### v1.30.0
- 🔐 **插件摘要校验** - 远程 URL 安装支持 `--checksum` / API `checksum` 参数，安装前校验 SHA-256
- 🛡️ **索引完整性保护** - 插件索引条目支持 `checksum` 字段，按名称安装时自动校验插件内容
- 🧪 **测试补强** - lib 与 API 层补充摘要校验成功/失败用例

### v1.28.0
- 🔗 **URL 安装插件** - 支持从 HTTP/HTTPS URL 直接安装插件
- 📦 **CLI 新命令** - `plugin install --url <url>` 从 URL 安装

### v1.26.0
- 🗂️ **代码模式识别** - 新增 5 种智能模式检测
- 🗄️ **数据库操作模式** - SQL/ORM/MongoDB/Redis 操作检测
- 🌐 **API/HTTP 请求模式** - fetch/axios/GraphQL/REST API 检测
- 🛤️ **路由变更模式** - React/Vue/Angular/Next.js 路由检测
- 🎨 **组件/模板模式** - React/Vue/Web 组件检测
- 📐 **样式布局模式** - CSS/Flexbox/Grid 布局检测

### v1.16.0
- 📋 **智能检测日志** - 记录每次智能检测的时间戳、AST 分析结果、Diff 分析结果、最终决策、置信度
- 👤 **用户反馈收集** - 采纳/跳过/手动修改三种反馈选项
- 📊 **准确率分析** - 统计用户采纳率，帮助优化检测策略
- 🗂️ **日志管理** - 查看最近检测日志、清空日志
- ⚙️ **配置控制** - `enableDetectionLogging` 配置项控制日志记录开关
- 💾 **存储优化** - 使用 workspaceState 存储，最多保留 50 条记录

### v1.15.0
- 🧠 智能检测准确率再提升
- 🌍 新增多语言关键词支持：Go, Rust, PHP, Ruby, Swift
- 📝 新增代码模式检测：Promise/async, 错误处理, React Hooks
- ⚖️ 加权评分系统：AST 分析权重 0.4，Diff 关键词权重 0.4，文件类型权重 0.2
- 🔗 多来源一致时置信度提升：多个分析来源指向同一类型时自动提升置信度等级
- 🐍 Go: `func`, `package`, `import`, `var`, `const`, `type`, `struct`, `interface`
- 🦀 Rust: `fn`, `mod`, `pub`, `impl`, `trait`, `struct`, `enum`, `let`, `mut`
- 🔶 PHP: `function`, `class`, `public`, `private`, `protected`, `use`, `namespace`, `trait`
- 💎 Ruby: `def`, `class`, `module`, `include`, `extend`, `attr_reader`, `attr_writer`, `attr_accessor`
- 🍎 Swift: `func`, `class`, `struct`, `enum`, `protocol`, `extension`, `var`, `let`, `import`

### v1.14.0
- ⚙️ 快捷设置面板 - UI 调节智能检测参数（高/中置信度阈值、AST/Diff 优先级、描述提示开关）

### v1.9.0
- 🚀 增强 AST 分析 - 新增 import/export 语句检测
- 🔍 检测模式：`import xxx from`, `export default`, `export const/let/var`, `export { xxx }`
- 📝 新增测试文件变更识别（.test.js, .spec.js 等）
- 🌍 Diff 分析扩展支持多语言特定关键词
- 🐍 Python: `def`, `class`, `import`, `from`
- ☕ Java/Kotlin: `public`, `private`, `protected`, `class`, `interface`, `fun`
- 📘 TypeScript: `interface`, `type`, `enum`, `namespace`

### v2.0.0 (当前版本)
- ✨ 新增主题切换功能（暗色/亮色）
- ⭐ 新增收藏系统（最多 50 条）
- 📜 新增历史记录（最近 20 条）
- 🏆 新增成就系统（12 个成就）
- 💡 新增每日一句功能
- ⌨️ 新增键盘快捷键
- 📊 新增统计面板
- 🔗 优化分享功能
- 🎨 全面优化 UI/UX
- 📱 优化移动端体验

### v1.0.0
- 🎉 初始版本发布
- 📝 12 种 Commit 类型
- 🎨 5 种风格模式
- 📋 一键复制功能
- 🔄 随机生成功能
