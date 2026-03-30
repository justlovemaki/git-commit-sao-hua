# GitHub Saohua App

> 当有人创建 PR 或 Issue 时，自动用骚话评论！

## 功能特性

- 🎯 自动监听 `pull_request.opened` 事件
- 🎯 自动监听 `issues.opened` 事件
- 🔍 智能分析标题和内容，生成合适的骚话
- 💕 支持多种风格：情话、骚话、扎心、中二、佛系

## 骚话风格

| 风格 | 说明 | 关键词 |
|------|------|--------|
| 情话 | 甜甜的情话 | love, 爱, 喜欢 |
| 骚话 | 撩人的骚话 | 骚, 撩, 浪 |
| 扎心 | 扎心的现实 | 扎心, 难过, 哭 |
| 中二 | 中二少年 | 中二, 燃, 热血 |
| 佛系 | 佛系人生 | 佛系, 随缘, 淡定 |

## 快速部署

### 方式一：一键创建 (推荐)

1. 打开 [GitHub App Manifest](https://github.com/settings/apps/new?state=saohua)
2. 使用 manifest.json 配置创建 App
3. 安装到你的仓库

### 方式二：手动创建

1. 在 [GitHub Developer settings](https://github.com/settings/developers) 创建新 GitHub App
2. 设置 Webhook URL 为你的服务器地址
3. 设置权限：
   - Issues: Read & Write
   - Pull requests: Read & Write
   - Contents: Read only
4. 订阅事件：`pull_request`, `issues`

## 本地开发

### 前置要求

- Node.js >= 18
- npm 或 yarn

### 安装

```bash
cd github-app
npm install
```

### 配置

1. 复制环境变量文件：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入以下配置：

```env
APP_ID=your_app_id
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
your_private_key
-----END RSA PRIVATE KEY-----"
WEBHOOK_SECRET=your_webhook_secret
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
PORT=3000
```

### 运行

```bash
# 开发模式 (自动重启)
npm run dev

# 生产模式
npm start
```

### 使用 ngrok 本地测试

```bash
# 安装 ngrok
npm install -g ngrok

# 启动 webhook 转发
ngrok http 3000

# 将 ngrok 提供的 URL 配置到 GitHub App 的 Webhook 中
```

## 部署到服务器

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Railway 部署

1. 将代码推送到 GitHub
2. 在 Railway 创建新项目，选择 GitHub 仓库
3. 添加环境变量
4. 部署完成！

### Vercel 部署

```bash
npm i -g vercel
vercel
```

## 工作原理

```
用户创建 PR/Issue
       ↓
GitHub 发送 Webhook
       ↓
服务器接收事件
       ↓
分析标题和内容
       ↓
选择合适的类型和风格
       ↓
生成骚话评论
       ↓
自动回复评论
```

## 目录结构

```
github-app/
├── index.js          # 主入口 (Probot)
├── webhook.js        # Webhook 处理器
├── package.json     # 依赖配置
├── .env.example     # 环境变量示例
├── manifest.json    # GitHub App 清单
└── README.md        # 说明文档
```

## 自定义骚话

项目使用 `git-sao-hua-core` 库生成骚话。你可以通过以下方式自定义：

1. 修改 `../lib/sao-hua-data.js` 中的数据
2. 在 `webhook.js` 中调整类型检测逻辑

## 常见问题

### Q: 如何获取 APP_ID 和 PRIVATE_KEY？

A: 在 GitHub App 详情页，APP_ID 在页面顶部，PRIVATE_KEY 需要点击 "Generate a new private key" 下载。

### Q: Webhook 验证失败怎么办？

A: 确保 `.env` 中的 `WEBHOOK_SECRET` 与 GitHub App 设置中的 Webhook secret 完全一致。

### Q: 如何只对特定仓库启用？

A: 在 GitHub App 设置中的 "Install" 页面，选择安装到特定仓库。

## 相关项目

- [git-sao-hua-core](https://github.com/justlovemaki/git-commit-sao-hua) - 核心库
- [vscode-extension](https://github.com/justlovemaki/git-commit-sao-hua/tree/main/vscode-extension) - VS Code 插件
- [cli](https://github.com/justlovemaki/git-commit-sao-hua/tree/main/cli) - 命令行工具

## License

MIT
