# Git Commit 骚话生成器 - VSCode 插件

让每次 Git 提交都充满爱意（或骚气）！

> **当前版本**: v1.0.2

## 功能特点

- **12 种 Commit 类型**: fix/feat/chore/docs/refactor/style/test/perf/ci/build/revert/hotfix
- **5 种风格模式**: 情话/骚话/扎心/中二/佛系
- **一键生成**: 通过命令面板快速生成
- **自动插入**: 自动插入到 Git 输入框
- **快捷键支持**: `Ctrl+Shift+G` (Mac: `Cmd+Shift+G`)

## 安装

1. 打开 VSCode
2. 按 `Ctrl+P` (Mac: `Cmd+P`)
3. 输入 `ext install git-commit-sao-hua`
4. 按回车安装

## 使用方法

### 方法一：命令面板

1. 按 `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`)
2. 输入 "生成骚话 Commit"
3. 选择 Commit 类型和风格
4. 可选输入简短描述
5. 选择"插入到 Git"自动插入

### 方法二：快捷键

按 `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`) → 输入 "打开快捷键设置" → 配置您自己的快捷键

### 方法三：单独选择

- `Ctrl+Shift+P` → "选择 Commit 类型" - 单独选择类型
- `Ctrl+Shift+P` → "选择风格模式" - 单独选择风格

## 使用示例

### 情话模式
```
feat: 用户登录功能

为你，我添加了整个世界
```

### 骚话模式
```
fix: 登录 bug

这个 bug 是我故意留的，就想多见你几次
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

## Commit 类型说明

| 类型 | 说明 |
|------|------|
| `fix` | 修复 bug |
| `feat` | 新功能 |
| `chore` | 日常维护 |
| `docs` | 文档 |
| `refactor` | 重构 |
| `style` | 格式 |
| `test` | 测试 |
| `perf` | 性能 |
| `ci` | CI 配置 |
| `build` | 构建 |
| `revert` | 回滚 |
| `hotfix` | 紧急修复 |

## 配置

可在 VSCode 设置中配置：

```json
{
    "gitCommitSaoHua.defaultStyle": "sao",
    "gitCommitSaoHua.defaultType": "feat",
    "gitCommitSaoHua.autoInsert": true
}
```

### 配置项说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `defaultStyle` | string | `sao` | 默认风格 (love/sao/zha/chu/fo) |
| `defaultType` | string | `feat` | 默认 Commit 类型 |
| `autoInsert` | boolean | `true` | 是否自动插入到 Git 输入框 |

### autoInsert 配置说明

- `true` (默认): 优先尝试插入 Git input box，如果失败则复制到剪贴板
- `false`: 直接复制到剪贴板，不尝试插入 Git（适用于无法自动插入的场景）

## 多仓库支持

当 VSCode 工作区包含多个 Git 仓库时，插件会智能处理：

1. **单个仓库**: 直接插入到该仓库的 Git 输入框
2. **多个仓库 + 活动文件在某个仓库内**: 自动匹配并插入到对应仓库
3. **多个仓库 + 无法唯一匹配**: 弹出 QuickPick 让您选择要插入的仓库（显示仓库名称、父路径和当前分支）
4. **无法插入**: 自动回退到剪贴板

## 自定义快捷键

本插件不再预设默认快捷键，以避免与您现有的快捷键冲突。您可以按照以下方式自定义快捷键：

### 方法一：命令面板

1. 按 `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`)
2. 输入 "打开快捷键设置"
3. 在打开的 JSON 文件中添加配置

### 方法二：手动设置

1. 打开 `文件 > 首选项 > 快捷键`
2. 搜索 "gitCommitSaoHua"
3. 为需要的命令设置您喜欢的快捷键

### 方法三：直接编辑 keybindings.json

按 `Ctrl+K Ctrl+S` 打开快捷键设置，然后点击右上角的 "打开快捷键(JSON)" 图标，添加以下配置：

```json
[
    {
        "key": "ctrl+shift+g",
        "command": "gitCommitSaoHua.generate",
        "when": "editorTextFocus"
    },
    {
        "key": "ctrl+shift+r",
        "command": "gitCommitSaoHua.generateRandom"
    }
]
```

### 可用命令列表

| 命令 | 说明 |
|------|------|
| `gitCommitSaoHua.generate` | 生成骚话 Commit |
| `gitCommitSaoHua.generateRandom` | 随机生成 Commit |
| `gitCommitSaoHua.selectType` | 选择 Commit 类型 |
| `gitCommitSaoHua.selectStyle` | 选择风格模式 |
| `gitCommitSaoHua.openKeybindings` | 打开快捷键设置 |

## 开发

```bash
# 克隆项目
git clone https://github.com/justlovemaki/git-commit-sao-hua.git

# 进入插件目录
cd vscode-extension

# 安装依赖
npm ci

# 检查打包所需文件
npm run check

# 本地打包 VSIX
npm run package

# 打开 VSCode 开发模式
code .

# 最小验证（命令行）
node -e "const { generateCommitMessage } = require('./sao-hua-data'); console.log(generateCommitMessage('feat','sao','登录功能'));"

# 按 F5 调试
```

本地打包产物：

- `git-commit-sao-hua.vsix`

## CI 自动打包

仓库已配置 GitHub Actions 工作流：

- 文件：`.github/workflows/vscode-extension-package.yml`
- 触发：push 到 `main/master`、`v*` tag、相关 Pull Request、手动触发
- 产物：artifact `git-commit-sao-hua-vsix`
- 发布：当推送 `v*` tag 时，会尝试将 `.vsix` 附加到 GitHub Release

## License

MIT License

## 作者

Made with 💕 by coding-expert
