# git-sao-hua

Git Commit 骚话生成器 CLI - 让你的 commit message 骚起来

## 安装

```bash
# 进入 cli 目录
cd cli

# 本地安装
npm install

# 全局安装
npm install -g .

# 或者从本地链接
npm link
```

## 使用方法

### 基本用法

```bash
# 随机生成一条骚话
git-sao-hua

# 指定 commit 类型
git-sao-hua -t fix

# 指定 commit 类型和风格
git-sao-hua -t feat -s love
```

### 参数说明

| 参数 | 说明 |
|------|------|
| `-t, --type <type>` | 指定 commit 类型 |
| `-s, --style <style>` | 指定骚话风格 |
| `-l, --list` | 列出所有可用类型和风格 |
| `-c, --copy` | 生成后复制到剪贴板 |
| `-g, --git` | 直接执行 git commit |
| `-i, --interactive` | 交互式提交向导 |
| `--tui` | 全屏 TUI 提交向导 |
| `-h, --help` | 显示帮助信息 |
| `-v, --version` | 显示版本号 |

### 可用类型

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

### 可用风格

- `love` - 情话模式 💕
- `sao` - 骚话模式 😏
- `zha` - 扎心模式 💔
- `chu` - 中二模式 😤
- `fo` - 佛系模式 🙏

### 使用示例

```bash
# 查看所有可用类型和风格
git-sao-hua --list

# 生成一条 fix 类型的骚话
git-sao-hua -t fix

# 生成一条 feat 类型的骚话，使用情话风格
git-sao-hua -t feat -s love

# 生成并复制到剪贴板
git-sao-hua -c

# 生成并直接提交（需要先 git add）
git-sao-hua -g

# 交互式提交向导（语言 / 生成模式 / 预览 / 一键提交）
git-sao-hua -i

# 全屏 TUI 提交向导（更专注的终端体验）
git-sao-hua --tui
# 或
git-sao-hua tui

# 指定英文输出
git-sao-hua --lang en
```

交互式提交向导现在支持：

- 先选择输出语言（中文 / English）
- 在模板生成、AI 生成、智能检测三种模式间切换
- 生成后直接预览结果
- 预览后继续重新生成、切换风格、复制到剪贴板、直接 git commit 或退出

全屏 TUI 模式额外提供：

- 每一步自动清屏刷新，只保留当前决策上下文
- 预览页集中展示 type / style / language / mode 元数据
- 支持 `git-sao-hua tui` 子命令，适合在终端里快速走完整个提交流程

## 插件管理

```bash
# 列出已安装的插件
git-sao-hua plugin list

# 创建插件模板
git-sao-hua plugin create my-pack

# 安装本地插件
git-sao-hua plugin install ./my-plugin.json

# 从 URL 安装插件
git-sao-hua plugin install --url https://example.com/plugin.json

# 从 URL 安装插件并校验 SHA-256
git-sao-hua plugin install --url https://example.com/plugin.json --checksum abc123...

# 从 GitHub 简写安装 (默认 main 分支，默认路径 saohua-plugin.json 或 plugin.json)
git-sao-hua plugin install --github owner/repo

# 指定插件文件路径
git-sao-hua plugin install --github owner/repo:path/to/plugin.json

# 指定分支或标签
git-sao-hua plugin install --github owner/repo@v1.0.0

# 同时指定路径和分支
git-sao-hua plugin install --github owner/repo:plugins/my-plugin.json@v1.0.0

# 使用 github: 前缀
git-sao-hua plugin install --github github:owner/repo:plugin.json@main

# 搜索插件市场
git-sao-hua plugin search love

# 从索引安装插件
git-sao-hua plugin install --from-index my-plugin

# 生成插件发布交付包
git-sao-hua plugin release-kit ./my-plugin.json --output-dir ./dist --github owner/repo:path/to/plugin.json@main

# 删除插件
git-sao-hua plugin remove my-pack
```

## 批量生成

```bash
# 批量生成骚话（需要先准备 JSON 文件）
git-sao-hua batch --file items.json

# 输出 JSON 格式（适合程序处理）
git-sao-hua batch --file items.json --format json
```

## GitHub Release 发布

CLI 已支持基于 release-notes 直接发布 GitHub Release：

```bash
# Dry-run 模式预览 Release Payload（无需 Token）
git-sao-hua github-release v1.0.0..HEAD --repo owner/repo --tag v1.0.0 --dry-run

# 创建 Release 并自动生成 Release Notes
git-sao-hua github-release --repo owner/repo --tag v1.0.0 --title "Release 1.0.0"

# 创建 Release 并上传资产文件
git-sao-hua github-release --repo owner/repo --tag v1.0.0 --asset ./dist/app.zip

# 上传多个资产文件
git-sao-hua github-release --repo owner/repo --tag v1.0.0 --asset ./dist/app.zip --asset ./dist/data.tar.gz

# 更新已存在的 Release（幂等支持）
git-sao-hua github-release --repo owner/repo --tag v1.0.0 --update

# 创建 Pre-release 或 Draft
git-sao-hua github-release --repo owner/repo --tag v1.0.0-beta --prerelease
git-sao-hua github-release --repo owner/repo --tag v1.0.0-draft --draft

# 创建 Release 并同步更新 CHANGELOG
git-sao-hua github-release --repo owner/repo --tag v1.0.0 --sync-changelog

# 指定 Git Token（也可通过 GITHUB_TOKEN 环境变量）
git-sao-hua github-release --repo owner/repo --tag v1.0.0 --github-token $GITHUB_TOKEN
```

参数说明：

| 参数 | 说明 |
|------|------|
| `<range>` | Git 范围，如 `v1.0.0..HEAD`，默认为 `HEAD` |
| `--repo` | 必须，GitHub 仓库，如 `owner/repo` |
| `--tag` | Release tag，默认为 title 值 |
| `--title` | Release 标题 |
| `--github-token` | GitHub Personal Access Token（可选，环境变量 `GITHUB_TOKEN`） |
| `--draft` | 创建 Draft Release |
| `--prerelease` | 创建 Pre-release |
| `--dry-run` | Dry-run 模式，只生成 Payload 不实际请求 API |
| `--update` | 更新已存在的 Release（覆盖同名资产） |
| `--asset <path>` | 上传资产文件，可多次指定 |
| `--sync-changelog` | 创建 Release 后同步更新 CHANGELOG.md |

JSON 文件格式：

```json
{
  "items": [
    { "mode": "random" },
    { "mode": "typed", "type": "fix" },
    { "mode": "typed_style", "type": "feat", "style": "love" },
    { "mode": "ai", "type": "feat", "diff": "diff content..." }
  ]
}
```

或者直接使用数组：

```json
[
  { "mode": "random" },
  { "mode": "typed", "type": "fix" }
]
```

## 自然语言提交

CLI 已支持直接输入自然语言描述，让核心先分析类型/风格，再生成 commit 骚话：

```bash
git-sao-hua --natural-text "修复登录按钮点击无效"
git-sao-hua --natural-text "新增分享海报下载功能" --style love
```

如果你需要在服务侧复用同一能力，可调用 REST API：

```bash
curl -X POST http://localhost:3000/api/saohua/natural/analyze \
  -H 'Content-Type: application/json' \
  -d '{"text":"修复登录按钮点击无效"}'
```

支持四种生成模式：

- `random` - 随机类型和风格
- `typed` - 指定类型，随机风格
- `typed_style` - 指定类型和风格
- `ai` - AI 生成（需要 diff 参数）

## 本地开发

```bash
# 在项目目录下
cd cli

# 链接到全局
npm link

# 测试
git-sao-hua

# 取消链接
npm unlink
```

## 依赖

零依赖！纯 Node.js 实现，只使用内置模块。

- readline - 交互模式
- child_process - 执行 git 命令和剪贴板
- fs, path, process - 基础模块

## License

MIT
