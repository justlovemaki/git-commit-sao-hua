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

## 🚀 快速开始

### 方式一：CLI 命令行（v1.18.0 新增 🎉）

```bash
# 全局安装
npm install -g git-sao-hua

# 随机生成骚话
git-sao-hua

# 指定类型和风格
git-sao-hua -t feat -s love

# 交互模式
git-sao-hua -i

# 生成并直接 git commit
git-sao-hua -g
```

详细文档见 [cli/README.md](cli/README.md)

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

## 🎯 版本历史

### v1.17.0
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
