# Git Commit 骚话生成器 - 项目进化报告

## 📊 项目信息

- **项目名称**: Git Commit 骚话生成器
- **GitHub 仓库**: https://github.com/justlovemaki/git-commit-sao-hua
- **当前版本**: v1.9.0 (VSCode 插件)
- **技术栈**: 纯 HTML + CSS + JavaScript（无后端）

---

## 🎯 进化历程

### v1.9.0 - AST 检测增强 + 多语言关键词支持 🚀
- ✅ **Import/Export 语句检测** - 新增 `import xxx from`, `export default`, `export const/let/var`, `export { xxx }` 模式识别
- ✅ **测试文件变更识别** - 自动检测 `.test.js`, `.spec.js` 等测试文件变更，推荐 `test` 类型
- ✅ **Python 关键词支持** - `def`, `class`, `import`, `from`
- ✅ **Java/Kotlin 关键词支持** - `public`, `private`, `protected`, `class`, `interface`, `fun`
- ✅ **TypeScript 关键词支持** - `interface`, `type`, `enum`, `namespace`
- ✅ **语言特定类型映射** - 检测到语言特定关键词时自动推荐 `feat` 类型
- ✅ **版本号同步** - package.json 和 extension.js 版本更新到 1.9.0
- ✅ **文档同步更新** - README.md 补充 v1.9.0 新功能说明

### v1.8.0 - AST 代码结构分析增强 🧠
- ✅ **AST 代码结构分析** - 新增 `analyzeASTChange` 函数，通过正则匹配识别代码结构变更
- ✅ **7 种函数定义模式检测** - `function xxx(`, `const xxx = (`, `async function`, 箭头函数等
- ✅ **4 种类/组件定义模式检测** - `class xxx`, `export default function`, React Component 等
- ✅ **12 种 CSS 属性检测** - color, margin, padding, display, width, height, font-size 等
- ✅ **智能检测优先级优化** - AST 分析 > Diff 关键词 > 文件类型
- ✅ **置信度评估增强** - AST 高置信度结果优先，提升检测准确率
- ✅ **详情展示优化** - 智能检测结果显示 AST 分析依据和特征
- ✅ **返回值扩展** - `analyzeCommitType` 新增 `astFeatures` 字段
- ✅ **文档同步更新** - README.md 补充 AST 智能检测功能说明

### v1.7.0 - 快捷键绑定功能 🎹
- ✅ **查看统计快捷键** - 为 `gitCommitSaoHua.showStatistics` 命令添加 `Ctrl+Shift+S` 快捷键
- ✅ **快捷键体系完善** - 与 `Ctrl+Shift+G`（随机生成）形成一致的快捷键风格
- ✅ **when 条件** - 仅在 `editorTextFocus` 时生效，避免与其他快捷键冲突
- ✅ **用户体验提升** - 无需打开命令面板，一键查看使用统计

### v1.0.0 - 初始版本
- ✅ 12 种 Commit 类型
- ✅ 5 种风格模式（情话/骚话/扎心/中二/佛系）
- ✅ 一键复制功能
- ✅ 随机生成功能
- ✅ 响应式设计
- ✅ 精美 UI（暗色主题）

### v1.1.0 - 功能增强
- ✅ 分享功能（微信二维码、微博、复制链接）
- ✅ 随机生成（带 Shake 动画效果）
- ✅ 历史记录（localStorage）

### v2.0.0 - 重大更新 ⭐
- ✅ **主题切换系统** - 暗色/亮色主题自由切换
- ✅ **收藏系统** - 收藏最喜欢的骚话（最多 50 条）
- ✅ **历史记录增强** - 保存最近 20 条生成记录
- ✅ **成就系统** - 12 个隐藏成就等你解锁
- ✅ **每日一句** - 每天打开都有新惊喜
- ✅ **键盘快捷键** - Enter 生成、Ctrl+C 复制、R 随机、D 切换主题
- ✅ **统计面板** - 实时查看生成次数、收藏数、成就进度
- ✅ **UI/UX 全面优化** - 更好的动画、交互细节
- ✅ **骚话库扩充** - 从 60 条扩充到 180+ 条（每种类型 × 每种风格 15 条）

### v2.1.0 - 自定义骚话系统 🎨
- ✅ **自定义骚话管理** - 添加/删除/导入/导出个人骚话
- ✅ **30% 概率触发** - 生成时有 30% 概率使用自定义骚话
- ✅ **localStorage 存储** - `git_sao_hua_custom` 永久保存
- ✅ **骚话库再扩充** - 每种类型 × 每种风格 新增 6 条（共 360+ 条基础骚话）
- ✅ **弹窗 UI** - 精美的自定义骚话管理界面
- ✅ **导入导出** - 支持 JSON 格式导入导出，方便分享

### v2.2.0 - 骚话库扩充 + 移动端深度优化 📱
- ✅ **骚话库大扩充** - 从 360+ 条扩充到 1200 条（12 类型 × 5 风格 × 20 条）
- ✅ **移动端触摸优化** - 按钮触摸区域增大到最小 48px（WCAG 标准）
- ✅ **触觉反馈系统** - 添加 navigator.vibrate API 震动反馈
- ✅ **移动端字体优化** - 防止 iOS 自动缩放，优化阅读体验

### v2.3.0 - VSCode 插件版本发布 🎉 (当前版本)
- ✅ **VSCode 插件** - 完整的 VSCode 扩展，在编辑器中直接生成 commit message
- ✅ **命令面板支持** - 快速选择 Commit 类型和风格
- ✅ **快捷键生成** - Ctrl+Shift+G 随机生成骚话
- ✅ **自动插入** - 生成后自动填入 Git input box
- ✅ **360+ 条骚话** - 内嵌完整的骚话数据库
- ✅ **GitHub Issue 关闭** - 实现用户需求，关闭 Issue #1
- ✅ **触摸设备专属样式** - 针对 hover: none 设备优化交互效果
- ✅ **布局优化** - 移动端间距、字体、按钮全面优化

### v2.3.1 - 多仓库支持优化 🎯
- ✅ **多仓库智能匹配** - 根据当前活动文件自动匹配所属仓库
- ✅ **仓库选择器** - 无法唯一匹配时弹出 QuickPick 让用户选择
- ✅ **优雅降级** - 单一仓库或无法插入时自动回退到剪贴板

### v1.0.2 - 插件可靠性优化 🔧
- ✅ **activationEvents 补全** - 所有5个命令都正确注册激活事件
- ✅ **Git 扩展激活优化** - 主动等待内置 Git 扩展激活后再获取 API，减少回退剪贴板的情况
- ✅ **多仓库选择信息增强** - 显示仓库名称、父路径和当前分支，方便区分同名仓库

### v1.0.3 - 会话状态保持优化 💾
- ✅ **修复选择覆盖问题** - 修复 selectType/selectStyle 设置的类型/风格在执行 generate 时被默认配置覆盖的 bug
- ✅ **会话内状态保持** - 用户通过 selectType/selectStyle 手动选择后，该选择在本次 VSCode 会话内持续生效
- ✅ **默认配置保留** - defaultType/defaultStyle 仍作为初始值和兜底配置

### v1.0.4 - 工作区偏好持久化 🧠
- ✅ **工作区级偏好记忆** - 最近一次使用的 Commit 类型和风格会保存到 workspaceState，重启窗口后仍可恢复
- ✅ **生成链路同步保存** - selectType/selectStyle、generate、generateRandom 都会同步更新偏好
- ✅ **一键重置偏好** - 新增 `重置类型/风格偏好` 命令，清空工作区记忆并恢复为默认配置
- ✅ **文档同步更新** - README 与插件文档补充偏好记忆与重置说明

### v1.1.0 - 描述历史记录 📝 (当前版本)
- ✅ **描述历史记录** - 使用 workspaceState 存储最近使用的 description（最多 10 条）
- ✅ **智能选择 UI** - 生成 Commit 时先显示历史记录 QuickPick 供选择
- ✅ **双模式输入** - 提供"选择最近使用的描述..."和"输入新描述..."选项
- ✅ **自动记忆** - 使用过的描述会自动保存，最新优先，最多保留 10 条
- ✅ **清空历史** - 新增 `清空描述历史` 命令用于清空所有历史记录
- ✅ **文档同步更新** - README 补充描述历史功能说明

### v1.2.0 - 音效反馈系统 🎵
- ✅ **音效配置项** - 新增 `gitCommitSaoHua.enableSoundEffects` 配置（默认 true）
- ✅ **视觉音效反馈** - 使用状态栏 emoji 动画提供视觉反馈（生成/复制/成功）
- ✅ **系统通知音** - 通过不同通知级别触发系统提示音
- ✅ **多场景支持** - 生成骚话、复制剪贴板、插入 Git 输入框时均有反馈
- ✅ **可关闭音效** - 用户可在设置中关闭音效反馈

### v1.3.0 - 智能 Commit 类型检测 🧠
- ✅ **智能检测命令** - 新增 `gitCommitSaoHua.generateSmart` 命令，自动分析 Git 变更
- ✅ **文件类型映射** - 10+ 种文件类型自动识别（CSS→style、测试文件→test、MD→docs 等）
- ✅ **智能推荐算法** - 根据变更文件数量最多的类型推荐最优 Commit 类型
- ✅ **双模式选择** - 用户可选择"智能检测"或"手动选择"，灵活切换
- ✅ **优雅降级** - 智能检测失败时自动回退到手动选择模式
- ✅ **无 Git 变更提示** - 未检测到变更时友好提示用户使用手动模式

### v1.4.0 - Diff 内容智能分析 📝
- ✅ **Diff 内容分析** - 新增 `getDiffContent` 和 `analyzeDiffContent` 函数，分析 git diff 内容
- ✅ **关键词检测** - fix 关键词（fix/bug/issue/error/crash/resolve/patch）和 feat 关键词（add/new/create/implement/feature/support）
- ✅ **综合判断算法** - 结合文件类型和 diff 内容综合判断，diff 分析结果优先
- ✅ **置信度等级** - 高（🎯3+ 关键词）/中（✨1-2 关键词）/低（💡仅文件类型）三级置信度
- ✅ **详细信息展示** - 智能检测时显示类型、置信度、分析依据和匹配关键词
- ✅ **文档更新** - README.md 补充智能检测功能说明和置信度等级表格

### v1.5.0 - 自定义骚话管理功能 ✨
- ✅ **自定义骚话管理命令** - 新增 `manageCustomSaoHua`/`addCustomSaoHua`/`clearCustomSaoHua` 命令
- ✅ **管理界面** - 支持添加、查看、删除、导入、导出自定义骚话
- ✅ **30% 概率触发** - 生成时有 30% 概率使用自定义骚话（如果存在）
- ✅ **workspaceState 存储** - `gitCommitSaoHua.customSaoHua` 永久保存在工作区
- ✅ **数据结构** - 每条骚话包含 type/style/content/addedAt 字段
- ✅ **使用标记** - 使用自定义骚话时显示 ✨ 标记和 "(自定义)" 标签
- ✅ **JSON 导入导出** - 支持批量导入导出，方便分享个人骚话库
- ✅ **文档同步更新** - README.md 补充自定义骚话功能说明和使用指南

### v1.6.0 - 使用统计功能 📊 (本次进化)
- ✅ **统计功能核心** - 新增 `getStatistics`/`recordGeneration`/`resetStatistics`/`showStatistics` 函数
- ✅ **统计内容** - 记录总生成次数、每种 Commit 类型使用次数、每种风格使用次数、最近生成时间
- ✅ **workspaceState 存储** - `gitCommitSaoHua.statistics` 永久保存在工作区
- ✅ **统计面板** - 使用 QuickPick 展示总次数、Top 3 类型、Top 3 风格、最近生成时间
- ✅ **重置功能** - 支持一键清空所有统计数据
- ✅ **三入口集成** - 在 generateSmart/generateRandom/generate 三个生成入口自动记录统计
- ✅ **新命令注册** - 新增 `gitCommitSaoHua.showStatistics` 命令（查看使用统计）
- ✅ **文档同步更新** - README.md 补充统计功能说明，PROJECT_EVOLUTION.md 版本更新至 v1.6.0

---

## 📈 数据对比

| 功能 | v1.0 | v1.1 | v2.0 | v2.1 | v2.2 |
|------|------|------|------|------|------|
| Commit 类型 | 12 | 12 | 12 | 12 | 12 |
| 风格模式 | 5 | 5 | 5 | 5 | 5 |
| 骚话数量 | 60 | 60 | 180+ | 360+ | 1200 |
| 自定义骚话 | ❌ | ❌ | ❌ | ✅ (无限) | ✅ (无限) |
| 主题 | 1 | 1 | 2 | 2 | 2 |
| 历史记录 | ❌ | ✅ (10 条) | ✅ (20 条) | ✅ (20 条) | ✅ (20 条) |
| 收藏功能 | ❌ | ❌ | ✅ (50 条) | ✅ (50 条) | ✅ (50 条) |
| 成就系统 | ❌ | ❌ | ✅ (12 个) | ✅ (12 个) | ✅ (12 个) |
| 每日一句 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 快捷键 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 统计面板 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 分享功能 | ❌ | ✅ | ✅ (优化) | ✅ | ✅ |
| 导入导出 | ❌ | ❌ | ❌ | ✅ | ✅ |
| 震动反馈 | ❌ | ❌ | ❌ | ❌ | ✅ |
| 移动端优化 | ❌ | 基础 | 良好 | 良好 | 优秀 |

---

## 🏆 成就系统详情

| 成就 ID | 名称 | 描述 | 图标 | 解锁条件 |
|---------|------|------|------|----------|
| first_generate | 初次尝试 | 第一次生成骚话 | 🎉 | 生成次数 ≥ 1 |
| generate_10 | 渐入佳境 | 累计生成 10 次 | 🔥 | 生成次数 ≥ 10 |
| generate_50 | 骚话大师 | 累计生成 50 次 | ✨ | 生成次数 ≥ 50 |
| generate_100 | 传说级骚话王 | 累计生成 100 次 | 👑 | 生成次数 ≥ 100 |
| favorite_5 | 收藏家 | 收藏 5 条骚话 | ⭐ | 收藏数 ≥ 5 |
| use_all_types | 全能选手 | 使用所有 Commit 类型 | 🎯 | 使用 12 种类型 |
| use_all_styles | 风格大师 | 使用所有风格 | 🎨 | 使用 5 种风格 |
| midnight_coder | 深夜 coder | 在 23:00-06:00 生成 | 🌙 | 深夜生成 ≥ 1 |
| share_master | 分享达人 | 分享 1 次 | 📢 | 分享次数 ≥ 1 |
| keyboard_warrior | 键盘侠 | 使用快捷键生成 | ⌨️ | 快捷键生成 ≥ 1 |
| theme_switcher | 变脸大师 | 切换主题 | 🌓 | 主题切换 ≥ 1 |
| copy_paste | 复制粘贴 | 复制 10 次 | 📋 | 复制次数 ≥ 10 |

---

## 🎨 UI/UX 优化

### 视觉设计
- ✨ 渐变动画标题
- ✨ 卡片毛玻璃效果
- ✨ 平滑过渡动画
- ✨ 响应式布局（手机/平板/桌面）
- ✨ 亮色/暗色主题支持

### 交互优化
- ✨ 按钮悬停效果
- ✨ 列表项悬停动画
- ✨ Toast 提示优化
- ✨ 模态框动画
- ✨ 进度条动画

### 用户体验
- ✨ 键盘快捷键支持
- ✨ 每日一句惊喜
- ✨ 成就解锁提示
- ✨ 实时统计展示
- ✨ 一键清空历史

---

## 📦 技术实现

### 核心架构
```
index.html (单文件应用)
├── HTML 结构
├── CSS 样式（内联）
│   ├── CSS 变量（主题系统）
│   ├── 响应式设计
│   └── 动画效果
└── JavaScript 逻辑
    ├── 数据管理（localStorage）
    ├── 骚话数据库（saoHuaDB）
    ├── 统计系统
    ├── 成就系统
    ├── 历史记录
    ├── 收藏管理
    ├── 主题切换
    └── 键盘快捷键
```

### 数据存储
- **历史记录**: `git_sao_hua_history` (最多 20 条)
- **收藏列表**: `git_sao_hua_favorites` (最多 50 条)
- **统计数据**: `git_sao_hua_stats` (永久保存)
- **成就解锁**: `git_sao_hua_achievements` (永久保存)
- **主题偏好**: `git_sao_hua_theme` (dark/light)

### 外部依赖
- QRCode.js (二维码生成) - CDN 加载
- 无其他外部依赖

---

## 🚀 部署方式

### GitHub Pages（推荐）
1. Fork/Clone 仓库
2. Settings → Pages → Source: main branch
3. 访问 `https://username.github.io/git-commit-sao-hua`

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Netlify
拖拽项目文件夹到 [Netlify Drop](https://app.netlify.com/drop)

### 本地运行
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

---

## 📊 代码统计（v2.1.0）

| 指标 | 数值 |
|------|------|
| 总代码行数 | ~2900 行 |
| HTML 行数 | ~500 行 |
| CSS 行数 | ~900 行 |
| JavaScript 行数 | ~1500 行 |
| 文件大小 | ~110 KB |
| 基础骚话数量 | 360+ 条 |
| 自定义骚话 | 无限（用户添加） |
| Commit 类型 | 12 种 |
| 风格模式 | 5 种 |
| 成就数量 | 12 个 |
| 自定义函数 | 51 个 | 53 个 |

---

## 🎯 未来规划

### 短期（1-2 周）
- [x] 用户自定义骚话 ✅ v2.1.0
- [x] 骚话导入/导出 ✅ v2.1.0
- [x] 添加更多骚话模板（每种 20+ 条）✅ v2.2.0
- [x] 优化移动端体验 ✅ v2.2.0
- [x] 添加音效系统 ✅ v1.2.0
- [x] 智能 Commit 类型检测 ✅ v1.3.0

### 中期（1 个月）
- [ ] 浏览器插件版本
- [ ] 微信小程序版本
- [ ] 骚话模板市场（社区分享）
- [ ] 云同步功能

### 长期（3 个月+）
- [ ] AI 生成个性化骚话
- [ ] 团队骚话库
- [ ] 开放 API
- [ ] 多语言支持

---

## 📍 当前状态与下一步建议

### 本轮迭代 (v1.9.0)
- **改进内容**: AST 检测增强 + 多语言关键词支持
  - 新增 import/export 语句检测（`import xxx from`, `export default`, `export const/let/var`, `export { xxx }`）
  - 新增测试文件变更识别（`.test.js`, `.spec.js` 等），自动推荐 `test` 类型
  - Diff 分析扩展支持 Python 关键词（`def`, `class`, `import`, `from`）
  - Diff 分析扩展支持 Java/Kotlin 关键词（`public`, `private`, `protected`, `class`, `interface`, `fun`）
  - Diff 分析扩展支持 TypeScript 关键词（`interface`, `type`, `enum`, `namespace`）
  - 语言特定类型映射：检测到语言特定关键词时自动推荐 `feat` 类型
  - 版本号同步：package.json 和 extension.js 更新到 1.9.0
- **风险等级**: 低风险（仅分析逻辑增强，无核心逻辑变更）
- **收益**: 进一步提升智能检测准确率，支持多语言项目，让 Commit 类型推荐更加精准

### 上轮迭代 (v1.8.0)
- **改进内容**: AST 代码结构分析增强
  - 新增 `analyzeASTChange` 函数，通过正则匹配识别代码结构变更
  - 支持 7 种函数定义模式检测（`function xxx(`, `const xxx = (`, `async function`, 箭头函数等）
  - 支持 4 种类/组件定义模式检测（`class xxx`, `export default function`, React Component 等）
  - 支持 12 种 CSS 属性检测（color, margin, padding, display, width, height 等）
  - 优化智能检测优先级：AST 分析 > Diff 关键词 > 文件类型
  - 置信度评估增强：AST 高置信度结果优先，提升检测准确率
  - 智能检测结果显示 AST 分析依据和特征
  - `analyzeCommitType` 返回值新增 `astFeatures` 字段
- **风险等级**: 低风险（仅分析逻辑增强，无核心逻辑变更）
- **收益**: 显著提升智能检测准确率，让 Commit 类型推荐更加智能化，减少手动选择成本

### 上轮迭代 (v1.7.0)
- **改进内容**: 快捷键绑定功能
  - 为 `gitCommitSaoHua.showStatistics` 命令添加 `Ctrl+Shift+S` 快捷键
  - 在 package.json 的 `contributes.keybindings` 中注册
  - when 条件：`editorTextFocus`，仅在编辑器聚焦时生效
  - 与现有快捷键 `Ctrl+Shift+G`（随机生成）形成一致的快捷键体系
- **风险等级**: 低风险（仅快捷键配置，无核心逻辑变更）
- **收益**: 提升用户访问统计功能的便捷性，完善快捷键体系，无需打开命令面板即可查看统计

### 上轮迭代 (v1.6.0)
- **改进内容**: 使用统计功能
  - 新增 `getStatistics`/`recordGeneration`/`resetStatistics`/`showStatistics` 函数
  - 记录总生成次数、每种 Commit 类型使用次数、每种风格使用次数、最近生成时间
  - 使用 QuickPick 展示统计面板（总次数、Top 3 类型、Top 3 风格、最近生成时间）
  - 支持一键重置统计数据
  - 在三个生成入口（generate/generateRandom/generateSmart）自动记录统计
  - 新增 `gitCommitSaoHua.showStatistics` 命令（查看使用统计）
- **风险等级**: 低风险（仅状态管理增强，无核心逻辑变更）
- **收益**: 让用户了解自己的使用习惯，增加趣味性和粘性，类似 Web 版本的统计面板

### 上轮迭代 (v1.5.0)
- **改进内容**: 自定义骚话管理功能
  - 新增 `manageCustomSaoHua`/`addCustomSaoHua`/`clearCustomSaoHua` 三个命令
  - 支持添加、查看、删除、导入、导出自定义骚话
  - 生成时 30% 概率使用自定义骚话（如果存在）
  - 自定义骚话存储在 workspaceState 中，按工作区隔离
  - 使用自定义骚话时显示 ✨ 标记和 "(自定义)" 标签
  - 支持 JSON 格式批量导入导出，方便分享个人骚话库
- **风险等级**: 低风险（仅插件状态管理增强，无核心逻辑变更）
- **收益**: 实现与 Web 版本的功能对等，让用户在编辑器中也能管理个人专属骚话库，提升个性化体验

### 当前状态
- ✅ VSCode 插件功能完善
- ✅ selectType/selectStyle 工作区持久记忆
- ✅ generate/generateRandom 自动同步偏好
- ✅ resetPreferences 重置入口已补齐
- ✅ descriptionHistory 描述历史记录（最多 10 条）
- ✅ clearDescriptionHistory 清空历史命令
- ✅ activationEvents 完整注册所有命令
- ✅ Git 扩展激活处理优化
- ✅ 多仓库智能匹配与选择器优化
- ✅ 文档已更新
- ✅ enableSoundEffects 音效反馈系统（v1.2.0）
- ✅ generateSmart 智能 Commit 类型检测（v1.3.0）
- ✅ 10+ 种文件类型自动识别映射
- ✅ 智能检测/手动选择双模式
- ✅ Diff 内容智能分析（v1.4.0）
- ✅ fix/feat关键词检测与置信度评估
- ✅ 综合判断算法（diff 优先 + 文件类型兜底）
- ✅ customSaoHua 自定义骚话管理（v1.5.0）
- ✅ 30% 概率触发机制
- ✅ JSON 导入导出支持
- ✅ statistics 使用统计功能（v1.6.0）
- ✅ 统计面板展示（总次数、Top 3 类型、Top 3 风格、最近生成时间）
- ✅ 一键重置统计
- ✅ showStatistics 快捷键绑定（v1.7.0）
- ✅ Ctrl+Shift+S 查看统计
- ✅ Ctrl+Shift+G 随机生成
- ✅ AST 代码结构分析增强（v1.8.0）
- ✅ 7 种函数定义模式检测
- ✅ 4 种类/组件定义模式检测
- ✅ 12 种 CSS 属性检测
- ✅ AST 优先级优化（AST > Diff > 文件类型）
- ✅ 置信度评估增强
- ✅ Import/Export 语句检测（v1.9.0）
- ✅ 测试文件变更识别（v1.9.0）
- ✅ Python 关键词支持（v1.9.0）
- ✅ Java/Kotlin 关键词支持（v1.9.0）
- ✅ TypeScript 关键词支持（v1.9.0）
- ✅ 语言特定类型映射（v1.9.0）

### 下一步建议
1. **短期**: 
   - ~~优化 diff 分析算法（支持更多语言特定的关键词）~~ ✅ 已在 v1.9.0 实现
   - ~~添加更多 AST 特征检测（import/export 语句、测试文件识别）~~ ✅ 已在 v1.9.0 实现
   - ~~添加骚话使用统计（最受欢迎的类型/风格）~~ ✅ 已在 v1.6.0 实现
   - ~~添加快捷键绑定（例如 Ctrl+Shift+S 查看统计）~~ ✅ 已在 v1.7.0 实现
   - ~~智能检测准确率提升（集成简单 AST 分析）~~ ✅ 已在 v1.8.0 实现
   - [ ] 智能检测置信度可视化增强（在 UI 中更直观展示分析依据）
   - [ ] 添加更多文件类型映射（.vue, .py, .java, .go 等）
2. **中期**: 
   - 浏览器插件版本（Chrome/Edge）
   - 微信小程序版本
   - 智能检测准确率再提升（集成 TypeScript AST API）
3. **长期**: 
   - AI 生成个性化骚话
   - 团队骚话库（云同步）
   - 开放 API

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 贡献骚话
请在 Issue 中提供：
1. Commit 类型（fix/feat/chore 等）
2. 风格（情话/骚话/扎心/中二/佛系）
3. 你的骚话内容

### 贡献代码
1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 License

MIT License - 想怎么用就怎么用

---

## 💖 结语

Git Commit 骚话生成器从一个简单的想法，进化成为一个功能完善、用户体验优秀的开源项目。

**让代码不再枯燥，让提交充满乐趣！** 🎉

---

*持续进化，永不止息。* 🚀
