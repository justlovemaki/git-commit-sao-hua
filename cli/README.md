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
| `-i, --interactive` | 交互模式 |
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

# 交互式选择类型和风格
git-sao-hua -i
```

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
