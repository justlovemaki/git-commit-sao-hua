# Git Commit 骚话生成器 - VSCode 插件

让每次 Git 提交都充满爱意（或骚气）！

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

按 `Ctrl+Shift+G` (Mac: `Cmd+Shift+G`) 快速生成随机骚话

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
    "gitCommitSaoHua.autoInsert": true
}
```

### 配置项说明

- `defaultStyle`: 默认风格 (love/sao/zha/chu/fo)
- `autoInsert`: 是否自动插入到 Git 输入框

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
