# Git Commit 骚话生成器 - VSCode 插件

让每次 Git 提交都充满爱意（或骚气）！

> **当前版本**: v1.13.0

## 功能特点

- **12 种 Commit 类型**: fix/feat/chore/docs/refactor/style/test/perf/ci/build/revert/hotfix
- **5 种风格模式**: 情话/骚话/扎心/中二/佛系
- **一键生成**: 通过命令面板快速生成
- **自动插入**: 自动插入到 Git 输入框
- **描述历史**: 记住最近使用的描述，最多 10 条
- **快捷键支持**: `Ctrl+Shift+G` (Mac: `Cmd+Shift+G`)
- **智能检测**: 基于文件和 diff 内容智能分析推荐 Commit 类型
- **自定义骚话**: 添加、管理个人专属骚话，生成时有 30% 概率使用

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

- `Ctrl+Shift+P` → "选择 Commit 类型" - 单独选择类型（会记住到当前工作区）
- `Ctrl+Shift+P` → "选择风格模式" - 单独选择风格（会记住到当前工作区）
- `Ctrl+Shift+P` → "重置类型/风格偏好" - 清空工作区记忆并恢复为配置默认值
- `Ctrl+Shift+P` → "清空描述历史" - 清空最近使用的描述历史

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

## 智能检测功能

插件支持基于文件和 diff 内容的智能分析，自动推荐合适的 Commit 类型。

### 检测逻辑

1. **文件类型分析**: 根据变更文件的扩展名和名称判断类型
   - `.css/.scss/.less/.sass` → `style`
   - `.test.js/.spec.js/test_*.js` → `test`
   - `.md/.txt` → `docs`
   - `package.json/package-lock.json` → `build`
   - `.github/`、`.gitlab-ci.yml` → `ci`
   - `.scala` → `Scala` / `.ex/.exs` → `Elixir` / `.elm` → `Elm`
   - `.erl` → `Erlang` / `.hs` → `Haskell` / `.clj/.cljs` → `Clojure`
   - `.fs/.fsx` → `F#` / `.ml/.mli` → `OCaml` / `.r/.R` → `R`
   - `.m/.mm` → `Objective-C` / `.dart` → `Dart` / `.lua` → `Lua`

2. **Diff 内容分析**: 分析 git diff 中的关键词
   - **fix 关键词**: fix, bug, issue, error, crash, resolve, patch
   - **feat 关键词**: add, new, create, implement, feature, support

3. **综合判断**: AST 分析和 Diff 分析的优先级可通过配置项控制（默认 AST 优先于 Diff，Diff 优先于文件类型分析）

### 置信度等级

| 等级 | 说明 |
|------|------|
| 🎯 high | 高置信度，diff 中检测到 >= highConfidenceThreshold 个相关关键词（默认 3 个） |
| ✨ medium | 中等置信度，diff 中检测到 >= mediumConfidenceThreshold 个相关关键词（默认 1 个） |
| 💡 low | 低置信度，检测到的关键词数量低于阈值或仅基于文件类型判断 |

### 可配置阈值

智能检测功能支持自定义置信度阈值：

```json
{
    "gitCommitSaoHua.smartDetection.highConfidenceThreshold": 3,
    "gitCommitSaoHua.smartDetection.mediumConfidenceThreshold": 1,
    "gitCommitSaoHua.smartDetection.astPriorityEnabled": true,
    "gitCommitSaoHua.smartDetection.diffPriorityEnabled": true
}
```

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `highConfidenceThreshold` | 3 | 高置信度所需的关键词数量阈值（范围 1-10） |
| `mediumConfidenceThreshold` | 1 | 中等置信度所需的关键词数量阈值（范围 1-5） |
| `astPriorityEnabled` | true | AST 分析优先策略：启用时，高置信度 AST 结果优先于其他分析 |
| `diffPriorityEnabled` | true | Diff 分析优先策略：启用时，当 AST 置信度不足时，优先采用 diff 结果 |

### 使用智能检测

选择"智能检测"模式时，插件会自动分析并显示：
- 推荐的 Commit 类型
- 置信度等级
- 分析依据（检测到的关键词）

## 自定义骚话功能

插件支持添加和管理个人专属的自定义骚话，生成时有 **30% 概率**使用自定义骚话（如果存在）。

### 数据结构

每条自定义骚话包含：
- `type`: Commit 类型 (fix/feat/chore 等)
- `style`: 风格模式 (love/sao/zha/chu/fo)
- `content`: 骚话内容
- `addedAt`: 添加时间

数据存储在 VSCode workspaceState 中，保存在当前工作区。

### 使用方法

通过命令面板管理自定义骚话：

1. 按 `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`)
2. 输入 "管理自定义骚话" 或相关命令

#### 可用命令

| 命令 | 说明 |
|------|------|
| `gitCommitSaoHua.manageCustomSaoHua` | 打开自定义骚话管理界面（添加/查看/导入/导出/清空） |
| `gitCommitSaoHua.addCustomSaoHua` | 添加单条自定义骚话 |
| `gitCommitSaoHua.clearCustomSaoHua` | 清空所有自定义骚话 |

### 管理界面功能

- **添加自定义骚话**: 选择 Commit 类型、风格模式，输入骚话内容
- **查看自定义骚话**: 列表显示所有已添加的骚话，支持删除
- **导入自定义骚话**: 从 JSON 文件批量导入
- **导出自定义骚话**: 导出为 JSON 文件
- **清空所有**: 删除所有自定义骚话

### 导入格式

导入的 JSON 文件格式如下：

```json
[
    {
        "type": "fix",
        "style": "love",
        "content": "这是我为你修复的专属 bug"
    },
    {
        "type": "feat",
        "style": "sao",
        "content": "新功能来了，想你想得睡不着"
    }
]
```

### 使用概率说明

- 有自定义骚话时，每次生成有 30% 概率使用自定义骚话
- 70% 概率使用内置预设骚话
- 如果没有自定义骚话，则 100% 使用内置预设

当使用自定义骚话时，成功提示会显示 `✨` 标记和 "(自定义)" 标签。

## 配置

可在 VSCode 设置中配置：

```json
{
    "gitCommitSaoHua.defaultStyle": "sao",
    "gitCommitSaoHua.defaultType": "feat",
    "gitCommitSaoHua.autoInsert": true,
    "gitCommitSaoHua.enableDescriptionPrompt": true
}
```

### 配置项说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `defaultStyle` | string | `sao` | 默认风格 (love/sao/zha/chu/fo)，也是重置偏好后的回退值 |
| `defaultType` | string | `feat` | 默认 Commit 类型，也是重置偏好后的回退值 |
| `autoInsert` | boolean | `true` | 是否自动插入到 Git 输入框 |
| `customSaoHuaProbability` | number | `0.3` | 使用自定义骚话的概率（0-1 之间） |
| `maxHistoryCount` | number | `10` | 描述历史记录最大保存数量（1-50） |
| `enableSmartDetection` | boolean | `true` | 启用智能检测功能 |
| `astAnalysisEnabled` | boolean | `true` | 启用 AST 代码结构分析 |
| `showConfidenceDetail` | boolean | `true` | 显示智能检测的置信度详情信息 |
| `smartDetection.highConfidenceThreshold` | number | `3` | 高置信度所需的关键词数量阈值（1-10） |
| `smartDetection.mediumConfidenceThreshold` | number | `1` | 中等置信度所需的关键词数量阈值（1-5） |
| `smartDetection.astPriorityEnabled` | boolean | `true` | 是否启用 AST 分析优先策略 |
| `smartDetection.diffPriorityEnabled` | boolean | `true` | 是否启用 Diff 分析优先策略 |
| `enableDescriptionPrompt` | boolean | `true` | 生成骚话后是否显示描述输入提示 |

### 描述历史记录

在生成 Commit 时，输入描述会先显示历史记录供选择：

1. **选择历史**: 点击"选择最近使用的描述..."可以从最多 10 条历史记录中选择
2. **输入新描述**: 点击"输入新描述..."可以输入新描述，输入后会自动保存到历史记录
3. **自动记忆**: 使用过的描述会自动保存，最多保留 10 条（最新优先）
4. **清空历史**: 使用"清空描述历史"命令可以清空所有历史记录

### Commit 描述智能生成

在 `生成骚话 Commit`、`随机生成 Commit`、`智能检测生成 Commit` 三个入口中，生成骚话后会自动询问是否添加详细描述：

1. **生成骚话后询问**: 插件会弹出 QuickPick 询问"是否添加详细描述？"
2. **添加描述**: 选择后可通过 InputBox 输入详细描述
3. **自动保存**: 输入的描述会自动保存到描述历史，供下次快速选择
4. **格式组合**: 最终 commit message 格式为 `<type>: <骚话>\n\n<详细描述>`

示例：
```
feat: 你是我的北极星，指引我前行的方向

实现用户登录模块，包含表单验证、错误处理和记住登录状态功能
```

可通过配置项 `gitCommitSaoHua.enableDescriptionPrompt`（默认 `true`）控制是否显示描述输入提示。

### 偏好记忆说明

- 插件会把最近一次使用/选择的 Commit 类型和风格保存到 **当前工作区**。
- `选择 Commit 类型`、`选择风格模式`、`生成骚话 Commit`、`随机生成 Commit` 都会同步更新这份偏好。
- 如果想回到配置中的默认值，可执行 `重置类型/风格偏好` 命令。

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
| `gitCommitSaoHua.resetPreferences` | 重置类型/风格偏好 |
| `gitCommitSaoHua.clearDescriptionHistory` | 清空描述历史 |
| `gitCommitSaoHua.openKeybindings` | 打开快捷键设置 |
| `gitCommitSaoHua.manageCustomSaoHua` | 管理自定义骚话 |
| `gitCommitSaoHua.addCustomSaoHua` | 添加单条自定义骚话 |
| `gitCommitSaoHua.clearCustomSaoHua` | 清空所有自定义骚话 |

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
node -e "const { generateCommitMessage } = require('../lib'); console.log(generateCommitMessage('feat','sao','登录功能'));"

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
