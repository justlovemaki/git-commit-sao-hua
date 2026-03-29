# 发布准备检查清单 (Release Checklist)

> 版本：v1.22.0  
> 最后更新：2026-03-29  
> 用途：确保发布前所有配置和文档就绪

---

## 📋 发布前检查

### 1. GitHub Secrets 配置

在 GitHub 仓库 → Settings → Secrets and variables → Actions 中确认以下 Secrets 已配置：

| Secret 名称 | 用途 | 状态 |
|------------|------|------|
| `NPM_TOKEN` | npm 自动发布（lib/ 和 cli/） | ⬜ 待配置 |
| `VSCE_PAT` | VSCode Marketplace 自动发布 | ⬜ 待配置 |

**配置步骤：**
1. 访问 https://github.com/justlovemaki/git-commit-sao-hua/settings/secrets/actions
2. 点击 "New repository secret"
3. 添加上述 Secrets

---

### 2. 版本号一致性检查

确认所有模块版本号一致：

```bash
# 检查各模块版本号
grep '"version":' lib/package.json
grep '"version":' cli/package.json
grep '"version":' vscode-extension/package.json
grep '"version":' action/package.json
```

**当前版本：** v1.22.0 ✅

---

### 3. CHANGELOG 更新

确认以下 CHANGELOG 已更新：

| 文件 | 状态 |
|------|------|
| `vscode-extension/CHANGELOG.md` | ✅ 已更新 v1.22.0 |
| `README.md` | ✅ 已更新 |

---

### 4. 测试验证

在发布前运行完整测试：

```bash
# 核心库测试
cd lib
npm test

# CLI 测试
cd cli
npm test

# 功能测试
node index.js --help
node index.js --list
node index.js --auto
```

---

### 5. 文档完整性

确认以下文档存在且最新：

| 文档 | 位置 | 状态 |
|------|------|------|
| README.md | 根目录 | ✅ |
| PUBLISHING.md | vscode-extension/ | ✅ |
| CHANGELOG.md | vscode-extension/ | ✅ |
| PROJECT_EVOLUTION.md | 根目录 | ✅ |
| RELEASE_CHECKLIST.md | 根目录 | ✅ (本文档) |

---

## 🚀 发布流程

### 第一步：配置 Secrets（一次性）

```bash
# 访问 GitHub Secrets 页面
https://github.com/justlovemaki/git-commit-sao-hua/settings/secrets/actions

# 添加以下 Secrets：
# - NPM_TOKEN: 从 https://www.npmjs.com/settings/YOUR_USERNAME/tokens 获取
# - VSCE_PAT: 从 https://marketplace.visualstudio.com/manage 获取
```

### 第二步：推送代码到 main 分支

```bash
cd /home/node/.openclaw/workspace/agents/coding-expert/projects/git-commit-sao-hua

git add -A
git commit -m "chore: 发布准备检查清单 + 最终验证"
git push origin main
```

### 第三步：触发 CI/CD 自动发布

推送后，GitHub Actions 会自动：
1. 运行所有测试（test + lint）
2. 测试通过后，自动发布到 npm（如果 NPM_TOKEN 已配置）

**检查工作流状态：**
https://github.com/justlovemaki/git-commit-sao-hua/actions

### 第四步：发布 VSCode 插件（手动或自动）

#### 方式 A：通过 GitHub Release 触发（推荐）

```bash
# 打标签并推送
git tag v1.22.0
git push origin v1.22.0

# 然后在 GitHub Releases 页面创建 Release
```

#### 方式 B：手动触发 Workflow

1. 访问 https://github.com/justlovemaki/git-commit-sao-hua/actions/workflows/vscode-marketplace-publish.yml
2. 点击 "Run workflow"
3. 选择版本更新类型（patch/minor/major）
4. 点击 "Run workflow"

---

## ✅ 发布后验证

### npm 包验证

```bash
# 检查 npm 包是否发布成功
npm view git-sao-hua-core
npm view git-sao-hua

# 本地安装测试
npm install -g git-sao-hua
git-sao-hua --help
```

### VSCode Marketplace 验证

1. 访问扩展页面：https://marketplace.visualstudio.com/items?itemName=coding-expert.git-commit-sao-hua
2. 确认版本号正确
3. 检查描述、图标、截图

### GitHub Release 验证

1. 访问 Releases 页面
2. 确认 VSIX 附件已上传
3. 检查 Release Notes

---

## 📊 发布统计

发布后 24-48 小时检查：

| 平台 | 检查项 | 链接 |
|------|--------|------|
| npm | 下载量 | https://www.npmjs.com/package/git-sao-hua-core |
| VSCode Marketplace | 安装量 | https://marketplace.visualstudio.com/items?itemName=coding-expert.git-commit-sao-hua |
| GitHub | Stars/Usage | https://github.com/justlovemaki/git-commit-sao-hua |

---

## 🔧 故障排查

### 问题 1: npm 发布失败

**可能原因：**
- NPM_TOKEN 未配置或过期
- 版本号与 npm 上已有版本冲突

**解决方案：**
```bash
# 1. 检查 Token 是否有效
npm whoami

# 2. 重新生成 Token
# 访问 https://www.npmjs.com/settings/YOUR_USERNAME/tokens

# 3. 更新 GitHub Secrets
```

### 问题 2: VSCode Marketplace 发布失败

**可能原因：**
- VSCE_PAT 未配置或过期
- 缺少必需文件（README.md, LICENSE, icon.png）
- 版本号冲突

**解决方案：**
```bash
# 1. 本地测试打包
cd vscode-extension
npm run package

# 2. 检查必需文件
npm run check

# 3. 重新生成 VSCE_PAT
# 访问 https://marketplace.visualstudio.com/manage
```

### 问题 3: CI/CD 工作流失败

**检查步骤：**
1. 访问 Actions 页面查看失败日志
2. 确认测试是否通过
3. 确认 Secrets 是否正确配置

---

## 📝 版本发布记录模板

发布新版本时，在 CHANGELOG.md 中添加：

```markdown
## [1.22.0] - 2026-03-29

### ✨ 新增
- GitHub Action v1.22.0 — 在 CI/CD 中自动生成骚话 commit message
- 国际化支持 (i18n) — 多语言骚话生成（中/英/日）

### 🔧 优化
- 四端版本号统一同步至 v1.22.0
- 完善发布文档和检查清单

### 📦 技术更新
- lib/: v1.20.0 → v1.22.0
- cli/: v1.20.0 → v1.22.0
- vscode-extension/: v1.21.0 → v1.22.0
- action/: v1.0.0 → v1.22.0
```

---

## 🎯 下一步行动

- [ ] 配置 NPM_TOKEN 到 GitHub Secrets
- [ ] 配置 VSCE_PAT 到 GitHub Secrets
- [ ] 推送代码到 main 分支，触发 CI/CD
- [ ] 验证 npm 包发布成功
- [ ] 触发 VSCode Marketplace 发布
- [ ] 验证 VSCode 插件上架成功
- [ ] 更新 README.md 添加安装说明
- [ ] 在社区/社交媒体宣传

---

**发布准备就绪！🚀**

项目地址：https://github.com/justlovemaki/git-commit-sao-hua
