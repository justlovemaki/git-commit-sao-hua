/**
 * Git Hook 管理器
 * 管理 prepare-commit-msg hook 的安装/卸载/状态检查
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('./config.js');

/** Hook 文件名 */
const HOOK_NAME = 'prepare-commit-msg';

/** Hook 标识注释（用于识别是否由本工具安装） */
const HOOK_SIGNATURE = '# --- git-sao-hua hook (DO NOT EDIT) ---';

/**
 * 获取 Git 仓库的 hooks 目录路径
 * @param {string} repoPath - 仓库路径
 * @returns {string|null} hooks 目录绝对路径，非 git 仓库时返回 null
 */
function getHooksDir(repoPath) {
    try {
        const gitDir = execSync('git rev-parse --git-dir', {
            cwd: repoPath || process.cwd(),
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim();

        const hooksDir = path.resolve(repoPath || process.cwd(), gitDir, 'hooks');
        return hooksDir;
    } catch (e) {
        return null;
    }
}

/**
 * 获取 hook 文件路径
 * @param {string} repoPath - 仓库路径
 * @returns {string|null} hook 文件绝对路径
 */
function getHookPath(repoPath) {
    const hooksDir = getHooksDir(repoPath);
    if (!hooksDir) return null;
    return path.join(hooksDir, HOOK_NAME);
}

/**
 * 生成 hook 脚本内容
 * @param {object} [options] - 配置选项
 * @param {string} [options.format='suffix'] - 骚话位置: suffix/replace/prefix
 * @param {string} [options.style='sao'] - 骚话风格
 * @param {string} [options.language='zh-CN'] - 语言
 * @param {boolean} [options.auto=true] - 是否启用智能检测
 * @param {boolean} [options.ai=false] - 是否使用 AI 生成
 * @param {boolean} [options.emoji=true] - 是否包含 emoji
 * @param {boolean} [options.chainPrevious=false] - 是否链式调用之前的 hook
 * @returns {string} hook 脚本内容
 */
function getHookScript(options = {}) {
    const opts = {
        format: 'suffix',
        style: 'sao',
        language: 'zh-CN',
        auto: true,
        ai: false,
        emoji: true,
        chainPrevious: false,
        ...options
    };

    let chainSection = '';
    if (opts.chainPrevious) {
        chainSection = `
# 链式调用之前备份的 hook
BACKUP_HOOK="$0.bak"
if [ -f "$BACKUP_HOOK" ]; then
    "$BACKUP_HOOK" "$@"
    PREV_EXIT=$?
    if [ $PREV_EXIT -ne 0 ]; then
        exit $PREV_EXIT
    fi
fi
`;
    }

    const script = `#!/bin/bash
${HOOK_SIGNATURE}
# Git Commit 骚话生成器 - prepare-commit-msg hook
# 安装时间: ${new Date().toISOString()}
# 项目地址: https://github.com/justlovemaki/git-commit-sao-hua

COMMIT_MSG_FILE="$1"
COMMIT_SOURCE="$2"
SHA1="$3"

# 支持 --no-saohua 跳过骚话
if echo "$GIT_SAO_HUA_SKIP" | grep -qi "true"; then
    exit 0
fi

# 检查环境变量跳过
for arg in $(cat /proc/$PPID/cmdline 2>/dev/null | tr '\\0' '\\n' 2>/dev/null); do
    if [ "$arg" = "--no-saohua" ]; then
        exit 0
    fi
done
${chainSection}
# 仅对 message 来源和无来源的 commit 追加骚话
# merge/squash/commit(amend) 来源不处理
if [ -n "$COMMIT_SOURCE" ] && [ "$COMMIT_SOURCE" != "message" ] && [ "$COMMIT_SOURCE" != "template" ]; then
    exit 0
fi

# 尝试找到 git-sao-hua CLI
SAOHUA_CMD=""
if command -v git-sao-hua >/dev/null 2>&1; then
    SAOHUA_CMD="git-sao-hua"
elif command -v npx >/dev/null 2>&1; then
    SAOHUA_CMD="npx --yes git-sao-hua"
fi

if [ -z "$SAOHUA_CMD" ]; then
    # CLI 不可用，静默退出
    exit 0
fi

# 读取配置（如果存在 .saohuarc.json）
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
CONFIG_FILE="$REPO_ROOT/.saohuarc.json"
STYLE_ARG="${opts.style}"
LANG_ARG="${opts.language}"
AUTO_ARG=""
AI_ARG=""

if [ -f "$CONFIG_FILE" ]; then
    # 使用 node 解析 JSON 配置
    if command -v node >/dev/null 2>&1; then
        STYLE_ARG=$(node -e "try{var c=JSON.parse(require('fs').readFileSync('$CONFIG_FILE','utf8'));console.log(c.style||'${opts.style}')}catch(e){console.log('${opts.style}')}" 2>/dev/null)
        LANG_ARG=$(node -e "try{var c=JSON.parse(require('fs').readFileSync('$CONFIG_FILE','utf8'));console.log(c.language||'${opts.language}')}catch(e){console.log('${opts.language}')}" 2>/dev/null)
        USE_AUTO=$(node -e "try{var c=JSON.parse(require('fs').readFileSync('$CONFIG_FILE','utf8'));console.log(c.auto===false?'false':'true')}catch(e){console.log('true')}" 2>/dev/null)
        USE_AI=$(node -e "try{var c=JSON.parse(require('fs').readFileSync('$CONFIG_FILE','utf8'));console.log(c.ai===true?'true':'false')}catch(e){console.log('false')}" 2>/dev/null)
        FORMAT=$(node -e "try{var c=JSON.parse(require('fs').readFileSync('$CONFIG_FILE','utf8'));console.log(c.format||'${opts.format}')}catch(e){console.log('${opts.format}')}" 2>/dev/null)
        if [ "$USE_AUTO" = "true" ]; then
            AUTO_ARG="-a"
        fi
        if [ "$USE_AI" = "true" ]; then
            AI_ARG="--ai"
        fi
    fi
else
    FORMAT="${opts.format}"
fi

# 生成骚话
SAOHUA=$($SAOHUA_CMD -t "feat" -s "$STYLE_ARG" --lang "$LANG_ARG" $AUTO_ARG $AI_ARG 2>/dev/null | grep -oP '(?<=: ).*(?=\\s*║)' | head -1)

if [ -z "$SAOHUA" ]; then
    # 简单 fallback: 直接调用 CLI 获取纯文本
    SAOHUA=$($SAOHUA_CMD -t "feat" -s "$STYLE_ARG" --lang "$LANG_ARG" 2>/dev/null | sed -n 's/.*║[^:]*: \\(.*\\)  ║.*/\\1/p' | head -1)
fi

if [ -z "$SAOHUA" ]; then
    exit 0
fi

# 根据 format 模式处理 commit message
ORIGINAL_MSG=$(cat "$COMMIT_MSG_FILE")

case "$FORMAT" in
    "replace")
        echo "$SAOHUA" > "$COMMIT_MSG_FILE"
        ;;
    "prefix")
        echo "$SAOHUA" > "$COMMIT_MSG_FILE.tmp"
        echo "" >> "$COMMIT_MSG_FILE.tmp"
        echo "$ORIGINAL_MSG" >> "$COMMIT_MSG_FILE.tmp"
        mv "$COMMIT_MSG_FILE.tmp" "$COMMIT_MSG_FILE"
        ;;
    "suffix"|*)
        echo "" >> "$COMMIT_MSG_FILE"
        echo "# 🎉 骚话: $SAOHUA" >> "$COMMIT_MSG_FILE"
        ;;
esac

exit 0
`;

    return script;
}

/**
 * 检查 hook 是否已安装
 * @param {string} [repoPath] - 仓库路径
 * @returns {boolean} 是否已安装
 */
function isInstalled(repoPath) {
    const hookPath = getHookPath(repoPath);
    if (!hookPath) return false;

    try {
        if (!fs.existsSync(hookPath)) return false;
        const content = fs.readFileSync(hookPath, 'utf8');
        return content.includes(HOOK_SIGNATURE);
    } catch (e) {
        return false;
    }
}

/**
 * 安装 prepare-commit-msg hook
 * @param {string} [repoPath] - 仓库路径
 * @param {object} [options] - 配置选项
 * @returns {{success: boolean, message: string}} 安装结果
 */
function install(repoPath, options = {}) {
    const cwd = repoPath || process.cwd();
    const hooksDir = getHooksDir(cwd);

    if (!hooksDir) {
        return { success: false, message: '当前目录不是 Git 仓库' };
    }

    // 确保 hooks 目录存在
    if (!fs.existsSync(hooksDir)) {
        try {
            fs.mkdirSync(hooksDir, { recursive: true });
        } catch (e) {
            return { success: false, message: `无法创建 hooks 目录: ${e.message}` };
        }
    }

    const hookPath = path.join(hooksDir, HOOK_NAME);
    let chainPrevious = false;

    // 检查是否已有 hook
    if (fs.existsSync(hookPath)) {
        const existingContent = fs.readFileSync(hookPath, 'utf8');

        // 如果已经是我们的 hook，直接覆盖
        if (existingContent.includes(HOOK_SIGNATURE)) {
            // 重新安装，不需要备份
        } else {
            // 备份现有 hook
            const backupPath = hookPath + '.bak';
            try {
                fs.copyFileSync(hookPath, backupPath);
                // 确保备份也有执行权限
                fs.chmodSync(backupPath, 0o755);
                chainPrevious = true;
            } catch (e) {
                return { success: false, message: `备份现有 hook 失败: ${e.message}` };
            }
        }
    }

    // 加载项目配置
    const projectConfig = config.loadConfig(cwd);
    const scriptOptions = {
        ...projectConfig,
        ...options,
        chainPrevious
    };

    // 写入 hook 脚本
    try {
        const script = getHookScript(scriptOptions);
        fs.writeFileSync(hookPath, script, { encoding: 'utf8', mode: 0o755 });
        // 确保执行权限
        fs.chmodSync(hookPath, 0o755);

        let msg = 'Hook 安装成功';
        if (chainPrevious) {
            msg += '（已备份原有 hook 并链式调用）';
        }
        return { success: true, message: msg };
    } catch (e) {
        return { success: false, message: `写入 hook 文件失败: ${e.message}` };
    }
}

/**
 * 卸载 prepare-commit-msg hook
 * @param {string} [repoPath] - 仓库路径
 * @returns {{success: boolean, message: string}} 卸载结果
 */
function uninstall(repoPath) {
    const cwd = repoPath || process.cwd();
    const hookPath = getHookPath(cwd);

    if (!hookPath) {
        return { success: false, message: '当前目录不是 Git 仓库' };
    }

    if (!fs.existsSync(hookPath)) {
        return { success: false, message: 'Hook 未安装' };
    }

    // 检查是否是我们安装的 hook
    const content = fs.readFileSync(hookPath, 'utf8');
    if (!content.includes(HOOK_SIGNATURE)) {
        return { success: false, message: '当前 hook 不是 git-sao-hua 安装的，跳过卸载' };
    }

    try {
        // 删除 hook
        fs.unlinkSync(hookPath);

        // 如果有备份，恢复备份
        const backupPath = hookPath + '.bak';
        if (fs.existsSync(backupPath)) {
            fs.renameSync(backupPath, hookPath);
            return { success: true, message: 'Hook 已卸载，已恢复原有 hook' };
        }

        return { success: true, message: 'Hook 已卸载' };
    } catch (e) {
        return { success: false, message: `卸载失败: ${e.message}` };
    }
}

/**
 * 获取 hook 安装状态详情
 * @param {string} [repoPath] - 仓库路径
 * @returns {{installed: boolean, isGitRepo: boolean, hookPath: string|null, hasBackup: boolean, configLoaded: boolean}}
 */
function getStatus(repoPath) {
    const cwd = repoPath || process.cwd();
    const hookPath = getHookPath(cwd);
    const isGitRepo = hookPath !== null;
    const installed = isInstalled(cwd);
    const hasBackup = hookPath ? fs.existsSync(hookPath + '.bak') : false;
    const configPath = config.getConfigPath(cwd);
    const configLoaded = fs.existsSync(configPath);

    return {
        installed,
        isGitRepo,
        hookPath,
        hasBackup,
        configLoaded
    };
}

module.exports = {
    HOOK_NAME,
    HOOK_SIGNATURE,
    getHooksDir,
    getHookPath,
    getHookScript,
    isInstalled,
    install,
    uninstall,
    getStatus
};
