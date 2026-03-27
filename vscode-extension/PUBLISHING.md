# VSCode Extension 发布指南

本文档说明如何将 Git Commit 骚话生成器发布到 VSCode Marketplace。

## 📋 前置准备

### 1. 获取发布令牌 (Personal Access Token)

1. 访问 [VSCode Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. 登录你的 Microsoft 账户
3. 创建一个新的 Publisher（如果还没有）
   - Publisher ID: `coding-expert`
   - Publisher Name: `Coding Expert`
4. 创建 Personal Access Token：
   - 点击右上角头像 → Security
   - 点击 "Create" 创建新令牌
   - 选择 Scope: **Marketplace (Publish)**
   - 复制生成的令牌

### 2. 配置 GitHub Secrets

在 GitHub 仓库中添加以下 Secrets：

1. 访问仓库 → Settings → Secrets and variables → Actions
2. 添加以下 Secrets：
   - **VSCE_PAT**: VSCode Marketplace 发布令牌
   - **NPM_TOKEN**: npm 发布令牌（用于 lib/ 和 cli/ 的自动发布）

## 🚀 发布流程

### 方式一：通过 GitHub Release 触发（推荐）

1. 在 GitHub 上创建新的 Release：
   ```bash
   # 本地打标签并推送
   cd vscode-extension
   npm version patch  # 或 minor / major
   git push --follow-tags
   ```

2. 在 GitHub Releases 页面编辑刚创建的 Release，点击 "Publish release"

3. GitHub Actions 会自动：
   - 打包 VSIX 文件
   - 发布到 VSCode Marketplace
   - 上传 VSIX 到 GitHub Release

### 方式二：通过 Workflow Dispatch 手动触发

1. 访问 [Actions](https://github.com/justlovemaki/git-commit-sao-hua/actions/workflows/vscode-marketplace-publish.yml)
2. 点击 "Run workflow"
3. 选择版本更新类型：
   - **patch**: 补丁版本 (1.17.0 → 1.17.1)
   - **minor**: 次版本 (1.17.0 → 1.18.0)
   - **major**: 主版本 (1.17.0 → 2.0.0)
4. 点击 "Run workflow"

5. Workflow 会自动：
   - 更新版本号
   - 打包 VSIX
   - 发布到 Marketplace
   - 创建 GitHub Release
   - 推送版本标签

## 📦 本地测试发布

在正式发布前，可以先本地测试打包：

```bash
cd vscode-extension

# 检查必需文件
npm run check

# 打包 VSIX
npm run package

# 本地安装测试
code --install-extension git-commit-sao-hua.vsix
```

## 📝 版本管理

### 版本号规则

遵循语义化版本规范 (SemVer)：

- **主版本号 (major)**: 不兼容的 API 修改
- **次版本号 (minor)**: 向下兼容的功能性新增
- **修订号 (patch)**: 向下兼容的问题修正

### 更新 CHANGELOG

发布前务必更新 `CHANGELOG.md`：

1. 在顶部添加新版本记录
2. 包含新增功能、优化改进、问题修复
3. 标注日期

## 🔍 故障排查

### 发布失败

检查 GitHub Actions 日志，常见问题：

1. **VSCE_PAT 过期或无效**
   - 重新生成 Personal Access Token
   - 更新 GitHub Secrets

2. **版本号冲突**
   - 确保 package.json 版本号高于 Marketplace 已有版本
   - 使用 `npm version` 命令自动管理版本号

3. **缺少必需文件**
   - 运行 `npm run check` 检查文件完整性
   - 确保包含：extension.js, README.md, LICENSE, icon.png, CHANGELOG.md

### Marketplace 审核

- 首次发布可能需要审核（通常 1-2 个工作日）
- 确保扩展描述清晰、功能正常
- 遵守 [Microsoft Marketplace Policies](https://aka.ms/marketplace-policies)

## 📊 发布后检查

1. **VSCode Marketplace**
   - 访问扩展页面确认发布成功
   - 检查版本号、描述、截图

2. **GitHub Release**
   - 确认 VSIX 附件已上传
   - 检查 Release Notes

3. **下载统计**
   - 在 [Manage Publishers](https://marketplace.visualstudio.com/manage) 查看下载量

## 🎯 最佳实践

- ✅ 发布前在本地充分测试
- ✅ 更新 CHANGELOG 记录变更
- ✅ 使用 GitHub Release 管理版本
- ✅ 保持 README 和文档最新
- ✅ 及时回应用户反馈和 Issues

---

**Happy Publishing! 🎉**
