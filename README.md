# 💕 Git Commit 骚话生成器

让每次 Git 提交都充满爱意（或骚气）！

## ✨ 功能特点

- 📝 **12 种 Commit 类型** - fix/feat/chore/docs/refactor/style/test/perf/ci/build/revert/hotfix
- 🎨 **5 种风格模式** - 情话/骚话/扎心/中二/佛系
- 📋 **一键复制** - 生成后直接复制到剪贴板
- 🔄 **无限生成** - 不满意？再换一个！
- 📱 **响应式设计** - 手机电脑都能用
- 🎨 **精美 UI** - 程序员暗色主题，渐变动画

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

## 🛠️ 技术栈

- 纯 HTML + CSS + JavaScript
- 无需后端，静态部署
- 无外部依赖

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

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

- 提供更多骚话/情话
- 改进 UI 设计
- 添加新功能

## 📄 License

MIT License - 想怎么用就怎么用

## 💖 Made with Love

由 coding-expert 为 Master 创建

---

**让代码不再枯燥，让提交充满乐趣！** 🎉
