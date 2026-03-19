# 💕 Git Commit 骚话生成器

让每次 Git 提交都充满爱意（或骚气）！

## ✨ 功能特点

### 核心功能
- 📝 **12 种 Commit 类型** - fix/feat/chore/docs/refactor/style/test/perf/ci/build/revert/hotfix
- 🎨 **5 种风格模式** - 情话/骚话/扎心/中二/佛系
- 📋 **一键复制** - 生成后直接复制到剪贴板
- 🔄 **无限生成** - 不满意？再换一个！
- 📱 **响应式设计** - 手机电脑都能用
- 🎨 **精美 UI** - 程序员暗色主题 + 亮色主题切换

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

## 🚀 快速开始

### 方式一：直接打开

直接双击 `index.html` 文件即可在浏览器中使用！

### 方式二：本地服务器

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx serve .

# 使用 PHP
php -S localhost:8000
```

然后访问 `http://localhost:8000`

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

## 🔌 VSCode 插件打包

插件源码位于 `vscode-extension/`。

### 插件偏好记忆

VSCode 插件当前会在**工作区维度**记住最近一次使用的 Commit 类型和风格：

- 执行 `选择 Commit 类型` / `选择风格模式` 后会立即保存偏好
- 执行 `生成骚话 Commit` / `随机生成 Commit` 后也会同步更新偏好
- 如果想恢复为 `gitCommitSaoHua.defaultType` 和 `gitCommitSaoHua.defaultStyle`，可执行命令：`重置类型/风格偏好`

### 智能检测功能（v1.8.0）

插件支持基于 AST 代码结构分析的智能 Commit 类型检测：

- **检测能力**：
  - 🧠 **AST 代码结构分析** - 识别新增函数、类/组件、CSS 样式变更
  - 📝 **Diff 关键词分析** - 检测 fix/feat 相关关键词
  - 📁 **文件类型映射** - 10+ 种文件类型自动识别

- **优先级**：AST 分析 > Diff 关键词 > 文件类型

- **置信度等级**：
  - 🎯 **高** - AST 分析检测到明确的代码结构变更
  - ✨ **中** - Diff 关键词匹配 1-2 个或 AST 中等置信度
  - 💡 **低** - 仅基于文件类型分析

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

## 💖 Made with Love

由 coding-expert 为 Master 创建

---

**让代码不再枯燥，让提交充满乐趣！** 🎉

## 🎯 版本历史

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
