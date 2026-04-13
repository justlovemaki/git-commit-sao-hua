#!/usr/bin/env node

const readline = require('readline');
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const data = require('../lib');
const aiGenerator = require('../lib/ai-generator.js');

const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    red: '\x1b[31m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

const VERSION = '1.30.0';
const hookManager = require('../lib/hook-manager.js');
const configModule = require('../lib/config.js');
const pluginManager = require('../lib/plugin-manager.js');

const VALID_TYPES = ['fix', 'feat', 'chore', 'docs', 'refactor', 'style', 'test', 'perf', 'ci', 'build', 'revert', 'hotfix'];
const VALID_STYLES = ['love', 'sao', 'zha', 'chu', 'fo'];
const VALID_LANGUAGES = ['zh-CN', 'en'];
const DEFAULT_LANGUAGE = 'zh-CN';

function green(text) {
    return COLORS.green + text + COLORS.reset;
}

function yellow(text) {
    return COLORS.yellow + text + COLORS.reset;
}

function cyan(text) {
    return COLORS.cyan + text + COLORS.reset;
}

function magenta(text) {
    return COLORS.magenta + text + COLORS.reset;
}

function bold(text) {
    return COLORS.bold + text + COLORS.reset;
}

function dim(text) {
    return COLORS.dim + text + COLORS.reset;
}

function red(text) {
    return COLORS.red + text + COLORS.reset;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/**
 * 智能检测 Commit 类型
 * @returns {{type: string, confidence: string, reason: string}|null} 检测结果
 */
function smartDetectType() {
    try {
        const diffContent = execSync('git diff --cached', { encoding: 'utf8', stdio: 'pipe' });
        const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
        
        const filePaths = statusOutput
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.trim().substring(3));

        if (filePaths.length === 0) {
            return null;
        }

        const result = data.SmartDetector.detect({
            filePaths,
            diffContent: diffContent || null
        });

        return result.type ? {
            type: result.type,
            confidence: result.confidence,
            reason: result.reason
        } : null;
    } catch (e) {
        return null;
    }
}

function generateMessage(type, style, language = DEFAULT_LANGUAGE) {
    let msgType = type;
    let msgStyle = style;
    const langData = data.saoHuaData[language] || data.saoHuaData[DEFAULT_LANGUAGE];

    if (!msgType) {
        const random = data.getRandomSaoHua(language);
        msgType = random.type;
        msgStyle = random.style;
    } else if (!msgStyle) {
        const styleKeys = Object.keys(langData[msgType]);
        msgStyle = styleKeys[getRandomInt(styleKeys.length)];
    }

    const message = data.getSaoHua(msgType, msgStyle, language);
    return {
        type: msgType,
        style: msgStyle,
        message: message,
        fullMessage: `${msgType}: ${message}`,
        language: language
    };
}

/**
 * AI 生成 Commit 消息
 * @param {string} type - commit 类型
 * @param {string} style - 骚话风格
 * @param {string} language - 语言
 * @returns {Promise<{type: string, style: string, message: string, fullMessage: string, language: string, isAI: boolean}>}
 */
async function generateAIMessage(type, style, language = DEFAULT_LANGUAGE) {
    try {
        console.log(cyan('🧠 正在调用 AI 生成个性化骚话...'));
        
        // 获取 git diff
        let diffContent = '';
        try {
            diffContent = execSync('git diff --cached', { encoding: 'utf8', stdio: 'pipe' });
        } catch (e) {
            // 没有 staged changes 时尝试获取工作区 diff
            try {
                diffContent = execSync('git diff HEAD', { encoding: 'utf8', stdio: 'pipe' });
            } catch (e2) {
                diffContent = '';
            }
        }
        
        // 调用 AI 生成
        const aiResult = await aiGenerator.generateWithAI(diffContent, {
            type: type || 'feat',
            style: style || 'sao',
            language: language
        });
        
        if (aiResult && aiResult.message) {
            console.log(cyan('✓ AI 生成成功'));
            return {
                type: aiResult.type || type || 'feat',
                style: aiResult.style || style || 'sao',
                message: aiResult.message,
                fullMessage: `${aiResult.type || type || 'feat'}: ${aiResult.message}`,
                language: language,
                isAI: true
            };
        }
    } catch (e) {
        console.log(yellow(`⚠ AI 生成失败：${e.message}`));
    }
    
    // Fallback 到传统模板生成
    console.log(yellow('⚠ 降级到模板生成模式'));
    const fallback = generateMessage(type, style, language);
    fallback.isAI = false;
    return fallback;
}

function copyToClipboard(text) {
    const platform = process.platform;
    let cmd = '';

    if (platform === 'darwin') {
        cmd = 'pbcopy';
    } else if (platform === 'win32') {
        cmd = 'clip';
    } else {
        cmd = 'xclip -selection clipboard';
    }

    try {
        execSync(cmd, { input: text });
        return true;
    } catch (e) {
        return false;
    }
}

function checkGitRepo() {
    try {
        execSync('git rev-parse --git-dir', { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
}

function hasStagedChanges() {
    try {
        const output = execSync('git status --porcelain', { encoding: 'utf8' });
        return output.trim().length > 0;
    } catch (e) {
        return false;
    }
}

function gitCommit(message) {
    if (!checkGitRepo()) {
        console.log(red('错误：当前目录不是 Git 仓库'));
        process.exit(1);
    }

    if (!hasStagedChanges()) {
        console.log(red('错误：没有 staged 的更改，请先 git add'));
        process.exit(1);
    }

    try {
        execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
        console.log(green('\n✓ 提交成功！'));
    } catch (e) {
        console.log(red('\n✗ 提交失败'));
        process.exit(1);
    }
}

function printMessage(msgObj) {
    const emojiMap = {
        love: '💕',
        sao: '😏',
        zha: '💔',
        chu: '😤',
        fo: '🙏'
    };

    const styleEmoji = emojiMap[msgObj.style] || '';

    console.log('');
    console.log(bold('  ╔═══════════════════════════════════════╗'));
    console.log(bold('  ║      ') + green(msgObj.type) + bold(': ') + yellow(msgObj.message) + bold('  ║'));
    console.log(bold('  ║            ') + dim(styleEmoji + ' ' + msgObj.style) + dim(' mode') + bold('             ║'));
    console.log(bold('  ╚═══════════════════════════════════════╝'));
    console.log('');
}

function showHelp() {
    console.log('');
    console.log(bold(green('git-sao-hua')) + ' - Git Commit 骚话生成器');
    console.log('');
    console.log(bold('用法:'));
    console.log('  git-sao-hua [选项]');
    console.log('  git-sao-hua hook <install|uninstall|status>');
    console.log('  git-sao-hua init');
    console.log('  git-sao-hua plugin <list|create|install|remove>');
    console.log('');
    console.log(bold('选项:'));
    console.log('  ' + green('-t, --type <type>') + '      指定 commit 类型');
    console.log('  ' + green('-s, --style <style>') + '    指定骚话风格');
    console.log('  ' + green('-a, --auto') + '             智能检测 commit 类型 (v1.20.0 新增)');
    console.log('  ' + green('--ai') + '                   使用 AI 生成个性化骚话 (v1.24.0 新增)');
    console.log('  ' + green('-l, --list') + '             列出所有可用类型和风格');
    console.log('  ' + green('-c, --copy') + '             生成后复制到剪贴板');
    console.log('  ' + green('-g, --git') + '              直接执行 git commit');
    console.log('  ' + green('-i, --interactive') + '      交互式提交向导');
    console.log('  ' + green('--lang <lang>') + '          设置语言 (zh-CN/en, 默认: zh-CN)');
    console.log('  ' + green('-h, --help') + '             显示帮助信息');
    console.log('  ' + green('-v, --version') + '         显示版本号');
    console.log('');
    console.log(bold('子命令:'));
    console.log('  ' + green('hook install') + '           在当前 Git 仓库安装 prepare-commit-msg hook');
    console.log('  ' + green('hook uninstall') + '         卸载 hook');
    console.log('  ' + green('hook status') + '            查看 hook 安装状态');
    console.log('  ' + green('init') + '                   在当前目录创建 .saohuarc.json 配置文件（交互式）');
    console.log('  ' + green('plugin list') + '            列出已安装的插件 (v1.27.0 新增)');
    console.log('  ' + green('plugin create [name]') + '    创建插件模板 (v1.27.0 新增)');
    console.log('  ' + green('plugin install <path>') + '     安装插件 (v1.27.0 新增)');
    console.log('  ' + green('plugin install --url <url>') + ' 从 URL 安装插件 (v1.28.0 新增)');
    console.log('  ' + green('plugin install --url <url> --checksum <sha256>') + ' 从 URL 安装插件并校验 (v1.30.0 新增)');
    console.log('  ' + green('plugin install --url <url> --allow-host <host>') + ' 允许指定 host (v1.31.0 新增)');
    console.log('  ' + green('plugin search [query]') + '     搜索插件市场 (v1.29.0 新增)');
    console.log('  ' + green('plugin search [query] --allow-host <host>') + ' 允许指定 host (v1.31.0 新增)');
    console.log('  ' + green('plugin install --from-index <name>') + ' 从索引安装插件 (v1.29.0 新增)');
    console.log('  ' + green('plugin install --from-index <name> --allow-host <host>') + ' 允许 host (v1.31.0 新增)');
    console.log('  ' + green('plugin remove <name>') + '    删除插件 (v1.27.0 新增)');
    console.log('');
    console.log(bold('示例:'));
    console.log(dim('  # 随机生成一条骚话'));
    console.log('  git-sao-hua');
    console.log(dim('\n  # 指定类型为 fix'));
    console.log('  git-sao-hua -t fix');
    console.log(dim('\n  # 指定类型和风格'));
    console.log('  git-sao-hua -t feat -s love');
    console.log(dim('\n  # 生成英文骚话'));
    console.log('  git-sao-hua --lang en');
    console.log(dim('\n  # 智能检测类型并生成'));
    console.log('  git-sao-hua -a');
    console.log(dim('\n  # 使用 AI 生成个性化骚话'));
    console.log('  git-sao-hua --ai');
    console.log(dim('\n  # AI 生成并指定风格'));
    console.log('  git-sao-hua --ai -s love');
    console.log(dim('\n  # 生成并复制到剪贴板'));
    console.log('  git-sao-hua -c');
    console.log(dim('\n  # 生成并直接提交'));
    console.log('  git-sao-hua -g');
    console.log(dim('\n  # 交互式提交向导'));
    console.log('  git-sao-hua -i');
    console.log(dim('\n  # 在交互模式里切换到 AI / 智能检测 / 一键提交'));
    console.log('  git-sao-hua -i');
    console.log(dim('\n  # 安装 Git Hook（自动在每次 commit 时追加骚话）'));
    console.log('  git-sao-hua hook install');
    console.log(dim('\n  # 创建项目配置文件'));
    console.log('  git-sao-hua init');
    console.log(dim('\n  # 列出已安装的插件'));
    console.log('  git-sao-hua plugin list');
    console.log(dim('\n  # 创建插件模板'));
    console.log('  git-sao-hua plugin create my-pack');
    console.log(dim('\n  # 安装插件'));
    console.log('  git-sao-hua plugin install ./my-plugin.json');
    console.log(dim('\n  # 从 URL 安装插件'));
    console.log('  git-sao-hua plugin install --url https://example.com/plugin.json');
    console.log(dim('\n  # 从 URL 安装插件并校验 SHA-256'));
    console.log('  git-sao-hua plugin install --url https://example.com/plugin.json --checksum abc123...');
    console.log(dim('\n  # 从 URL 安装并允许指定自定义 host'));
    console.log('  git-sao-hua plugin install --url https://example.com/plugin.json --allow-host example.com');
    console.log(dim('\n  # 搜索插件市场'));
    console.log('  git-sao-hua plugin search love');
    console.log(dim('\n  # 指定自定义索引 URL'));
    console.log('  git-sao-hua plugin search love --index https://example.com/index.json');
    console.log(dim('\n  # 搜索并允许自定义 host'));
    console.log('  git-sao-hua plugin search love --index https://example.com/index.json --allow-host example.com');
    console.log(dim('\n  # 从索引安装插件'));
    console.log('  git-sao-hua plugin install --from-index my-plugin');
    console.log(dim('\n  # 从自定义索引安装插件'));
    console.log('  git-sao-hua plugin install --from-index my-plugin --index https://example.com/index.json');
    console.log(dim('\n  # 从索引安装并允许自定义 host'));
    console.log('  git-sao-hua plugin install --from-index my-plugin --allow-host example.com');
    console.log(dim('\n  # 删除插件'));
    console.log('  git-sao-hua plugin remove my-pack');
}

function showList() {
    const typeOptions = getCommitTypeOptions();
    const styleOptions = getStyleOptions();

    console.log('\n' + bold('可用类型:'));
    typeOptions.forEach(t => {
        console.log(`  ${green(t.value.padEnd(10))} - ${t.desc}`);
    });

    console.log('\n' + bold('可用风格:'));
    styleOptions.forEach(s => {
        const emoji = s.emoji || '';
        console.log(`  ${green(s.value.padEnd(10))} - ${emoji} ${s.label}`);
    });
    console.log('');
}

function askQuestion(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

function resolveChoice(answer, items, fallbackValue, formatter) {
    const raw = (answer || '').trim();
    if (!raw) {
        return fallbackValue;
    }

    const index = parseInt(raw, 10);
    if (!isNaN(index) && index >= 1 && index <= items.length) {
        return formatter(items[index - 1]);
    }

    const normalized = raw.toLowerCase();
    const matched = items.find(item => formatter(item).toLowerCase() === normalized);
    return matched ? formatter(matched) : fallbackValue;
}

function getCommitTypeOptions(language = DEFAULT_LANGUAGE) {
    return data.commitTypes[language] || data.commitTypes[DEFAULT_LANGUAGE] || [];
}

function getStyleOptions(language = DEFAULT_LANGUAGE) {
    return data.styles[language] || data.styles[DEFAULT_LANGUAGE] || [];
}

async function promptLanguage(rl) {
    console.log(bold('请选择语言:'));
    console.log('  ' + green('1') + '. zh-CN (中文)');
    console.log('  ' + green('2') + '. en (English)');
    const answer = await askQuestion(rl, '\n请输入编号 (默认 1-zh-CN): ');
    return answer.trim() === '2' || answer.trim().toLowerCase() === 'en' ? 'en' : 'zh-CN';
}

async function promptGenerationMode(rl) {
    console.log('\n' + bold('请选择生成模式:'));
    console.log('  ' + green('1') + '. 模板生成 - 直接按类型/风格生成');
    console.log('  ' + green('2') + '. AI 生成 - 根据 diff 生成个性化骚话');
    console.log('  ' + green('3') + '. 智能检测 - 先检测类型，再按模板生成');

    const answer = await askQuestion(rl, '\n请输入编号 (默认 1-模板生成): ');
    const modeMap = { '1': 'template', '2': 'ai', '3': 'auto' };
    return modeMap[answer.trim()] || 'template';
}

async function promptType(rl, detectedType = null) {
    const typeOptions = getCommitTypeOptions();
    console.log('\n' + bold('请选择类型:'));
    typeOptions.forEach((t, i) => {
        console.log(`  ${green((i + 1).toString())}. ${t.value} - ${t.desc}`);
    });

    const defaultType = detectedType || 'feat';
    const answer = await askQuestion(rl, `\n请输入类型编号或名称 (默认 ${defaultType}): `);
    return resolveChoice(answer, typeOptions, defaultType, item => item.value);
}

async function promptStyle(rl, type) {
    const styleOptions = getStyleOptions();
    console.log('\n' + bold('请选择风格:'));
    styleOptions.forEach((s, i) => {
        console.log(`  ${green((i + 1).toString())}. ${s.value} - ${s.emoji} ${s.label}`);
    });

    const langData = data.saoHuaData[DEFAULT_LANGUAGE] || {};
    const typeStyles = langData[type] ? Object.keys(langData[type]) : VALID_STYLES;
    const fallbackStyle = typeStyles.includes('sao') ? 'sao' : typeStyles[0];
    const answer = await askQuestion(rl, `\n请输入风格编号或名称 (默认 ${fallbackStyle}): `);
    return resolveChoice(answer, styleOptions, fallbackStyle, item => item.value);
}

async function promptPostAction(rl) {
    console.log(bold('接下来做什么？'));
    console.log('  ' + green('1') + '. 重新生成一条');
    console.log('  ' + green('2') + '. 切换风格后重试');
    console.log('  ' + green('3') + '. 复制到剪贴板');
    console.log('  ' + green('4') + '. 直接 git commit');
    console.log('  ' + green('5') + '. 退出');

    const answer = await askQuestion(rl, '\n请输入编号 (默认 5-退出): ');
    const actionMap = {
        '1': 'regenerate',
        '2': 'restyle',
        '3': 'copy',
        '4': 'git',
        '5': 'exit'
    };
    return actionMap[answer.trim()] || 'exit';
}

async function buildInteractiveMessage({ type, style, language, mode }) {
    if (mode === 'ai') {
        return generateAIMessage(type, style, language);
    }

    if (mode === 'auto') {
        console.log(cyan('\n🔍 正在智能分析 Git 变更...'));
        const detection = smartDetectType();
        if (detection) {
            console.log(cyan(`✓ 检测推荐类型：${green(detection.type)} (置信度：${detection.confidence})`));
            console.log(dim(`  ${detection.reason}`));
            return generateMessage(detection.type, style, language);
        }
        console.log(yellow('⚠ 智能检测失败，将使用当前类型继续生成'));
    }

    return generateMessage(type, style, language);
}

async function interactiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('\n' + bold('====== 交互模式 ======\n'));

    const language = await promptLanguage(rl);
    const mode = await promptGenerationMode(rl);
    let detectedType = null;

    if (mode === 'auto') {
        const detection = smartDetectType();
        if (detection && detection.type) {
            detectedType = detection.type;
        }
    }

    const type = await promptType(rl, detectedType);
    let style = await promptStyle(rl, type);

    while (true) {
        const msgObj = await buildInteractiveMessage({ type, style, language, mode });
        printMessage(msgObj);

        const action = await promptPostAction(rl);

        if (action === 'regenerate') {
            console.log(dim('  好，再来一条新的。'));
            continue;
        }

        if (action === 'restyle') {
            style = await promptStyle(rl, type);
            continue;
        }

        if (action === 'copy') {
            const success = copyToClipboard(msgObj.fullMessage);
            console.log(success ? green('✓ 已复制到剪贴板') : red('✗ 复制到剪贴板失败'));
            continue;
        }

        if (action === 'git') {
            rl.close();
            gitCommit(msgObj.fullMessage);
            return { handled: true, type, style, language, mode };
        }

        rl.close();
        return { handled: true, type, style, language, mode, message: msgObj };
    }
}

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        type: null,
        style: null,
        list: false,
        copy: false,
        git: false,
        interactive: false,
        auto: false,
        ai: false,
        help: false,
        version: false,
        language: DEFAULT_LANGUAGE
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '-t' || arg === '--type') {
            options.type = args[++i];
        } else if (arg === '-s' || arg === '--style') {
            options.style = args[++i];
        } else if (arg === '-l' || arg === '--list') {
            options.list = true;
        } else if (arg === '-c' || arg === '--copy') {
            options.copy = true;
        } else if (arg === '-g' || arg === '--git') {
            options.git = true;
        } else if (arg === '-i' || arg === '--interactive') {
            options.interactive = true;
        } else if (arg === '-a' || arg === '--auto') {
            options.auto = true;
        } else if (arg === '--ai') {
            options.ai = true;
        } else if (arg === '--lang' || arg === '--language') {
            options.language = args[++i] || DEFAULT_LANGUAGE;
        } else if (arg === '-h' || arg === '--help') {
            options.help = true;
        } else if (arg === '-v' || arg === '--version') {
            options.version = true;
        } else if (arg.startsWith('-')) {
            console.log(red(`未知选项：${arg}`));
            showHelp();
            process.exit(1);
        }
    }

    if (options.language && !VALID_LANGUAGES.includes(options.language)) {
        console.log(red(`无效语言：${options.language}`));
        console.log(dim(`有效语言：${VALID_LANGUAGES.join(', ')}`));
        options.language = DEFAULT_LANGUAGE;
    }

    return options;
}

/**
 * 处理 hook 子命令
 * @param {string} action - install/uninstall/status
 */
function handleHookCommand(action) {
    const cwd = process.cwd();

    switch (action) {
        case 'install': {
            console.log(cyan('🔧 正在安装 prepare-commit-msg hook...'));
            const result = hookManager.install(cwd);
            if (result.success) {
                console.log(green('✓ ' + result.message));
                console.log(dim('  每次 git commit 将自动追加骚话注释'));
                console.log(dim('  设置 GIT_SAO_HUA_SKIP=true 可临时跳过'));

                // 提示配置文件
                const configPath = configModule.getConfigPath(cwd);
                if (!fs.existsSync(configPath)) {
                    console.log('');
                    console.log(yellow('💡 提示：运行 git-sao-hua init 创建配置文件来自定义骚话行为'));
                }
            } else {
                console.log(red('✗ ' + result.message));
                process.exit(1);
            }
            break;
        }
        case 'uninstall': {
            console.log(cyan('🔧 正在卸载 hook...'));
            const result = hookManager.uninstall(cwd);
            if (result.success) {
                console.log(green('✓ ' + result.message));
            } else {
                console.log(red('✗ ' + result.message));
                process.exit(1);
            }
            break;
        }
        case 'status': {
            const status = hookManager.getStatus(cwd);
            console.log('');
            console.log(bold('Hook 状态:'));
            console.log('  Git 仓库: ' + (status.isGitRepo ? green('✓ 是') : red('✗ 否')));
            console.log('  Hook 安装: ' + (status.installed ? green('✓ 已安装') : yellow('✗ 未安装')));
            if (status.hookPath) {
                console.log('  Hook 路径: ' + dim(status.hookPath));
            }
            console.log('  原有 Hook 备份: ' + (status.hasBackup ? green('✓ 有') : dim('无')));
            console.log('  配置文件: ' + (status.configLoaded ? green('✓ .saohuarc.json') : dim('未创建')));
            console.log('');
            break;
        }
        default:
            console.log(red(`未知的 hook 操作：${action}`));
            console.log(dim('可用操作：install, uninstall, status'));
            process.exit(1);
    }
}

/**
 * 处理 init 子命令 - 交互式创建 .saohuarc.json
 */
async function handleInitCommand() {
    const cwd = process.cwd();
    const configPath = configModule.getConfigPath(cwd);

    if (fs.existsSync(configPath)) {
        console.log(yellow('⚠ 配置文件已存在：' + configPath));
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const answer = await askQuestion(rl, '是否覆盖？(y/N) ');
        rl.close();
        if (answer.trim().toLowerCase() !== 'y') {
            console.log(dim('已取消'));
            return;
        }
    }

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log('');
    console.log(bold('====== 初始化 .saohuarc.json ======'));
    console.log('');

    // 选择风格
    console.log(bold('请选择默认骚话风格:'));
    data.styles.forEach((s, i) => {
        console.log(`  ${green((i + 1).toString())}. ${s.value} - ${s.emoji} ${s.label}`);
    });
    let styleAnswer = await askQuestion(rl, '\n请输入编号 (默认 2-sao): ');
    let styleIdx = parseInt(styleAnswer.trim()) - 1;
    let selectedStyle = (styleIdx >= 0 && styleIdx < data.styles.length)
        ? data.styles[styleIdx].value : 'sao';

    // 选择语言
    console.log('');
    console.log(bold('请选择默认语言:'));
    console.log('  ' + green('1') + '. zh-CN (中文)');
    console.log('  ' + green('2') + '. en (English)');
    let langAnswer = await askQuestion(rl, '\n请输入编号 (默认 1-zh-CN): ');
    let selectedLang = langAnswer.trim() === '2' ? 'en' : 'zh-CN';

    // 骚话位置
    console.log('');
    console.log(bold('骚话追加位置:'));
    console.log('  ' + green('1') + '. suffix - 在 commit message 末尾追加注释（推荐）');
    console.log('  ' + green('2') + '. prefix - 在 commit message 前面添加');
    console.log('  ' + green('3') + '. replace - 替换整个 commit message');
    let formatAnswer = await askQuestion(rl, '\n请输入编号 (默认 1-suffix): ');
    const formatMap = { '1': 'suffix', '2': 'prefix', '3': 'replace' };
    let selectedFormat = formatMap[formatAnswer.trim()] || 'suffix';

    // 智能检测
    let autoAnswer = await askQuestion(rl, '\n是否启用智能检测 commit 类型？(Y/n) ');
    let selectedAuto = autoAnswer.trim().toLowerCase() !== 'n';

    // AI 生成
    let aiAnswer = await askQuestion(rl, '是否使用 AI 生成骚话？(y/N) ');
    let selectedAI = aiAnswer.trim().toLowerCase() === 'y';

    // Emoji
    let emojiAnswer = await askQuestion(rl, '是否包含 emoji？(Y/n) ');
    let selectedEmoji = emojiAnswer.trim().toLowerCase() !== 'n';

    rl.close();

    const newConfig = {
        style: selectedStyle,
        language: selectedLang,
        auto: selectedAuto,
        ai: selectedAI,
        format: selectedFormat,
        emoji: selectedEmoji
    };

    const success = configModule.saveConfig(cwd, newConfig);
    if (success) {
        console.log('');
        console.log(green('✓ 配置文件已创建：' + configPath));
        console.log('');
        console.log(bold('配置内容:'));
        console.log(dim(JSON.stringify(newConfig, null, 2)));
        console.log('');
        console.log(yellow('💡 提示：运行 git-sao-hua hook install 安装 Git Hook'));
    } else {
        console.log(red('✗ 配置文件创建失败'));
        process.exit(1);
    }
}

/**
 * 处理 plugin 子命令
 * @param {string} action - list/create/install/remove/search
 * @param {string[]} args - 额外参数
 */
async function handlePluginCommand(action, args = []) {
    switch (action) {
        case 'list': {
            console.log('');
            console.log(bold('====== 已安装的插件 ======'));
            const plugins = pluginManager.listPlugins();
            if (plugins.length === 0) {
                console.log(yellow('  暂无已安装的插件'));
                console.log(dim('  运行 git-sao-hua plugin create 创建新插件'));
                console.log(dim('  运行 git-sao-hua plugin install <path> 安装插件'));
            } else {
                plugins.forEach((p, i) => {
                    console.log(`\n  ${green((i + 1).toString() + '. ' + p.name)}`);
                    console.log(`     版本: ${p.version}`);
                    if (p.description) console.log(`     描述: ${p.description}`);
                    if (p.author) console.log(`     作者: ${p.author}`);
                    console.log(`     路径: ${dim(p.path)}`);
                });
            }
            console.log('');
            break;
        }
        case 'create': {
            const name = args[0] || 'my-sao-hua-pack';
            console.log(cyan('正在创建插件模板...'));
            const result = pluginManager.createPluginTemplate(null, { name });
            if (result.success) {
                console.log(green('✓ 插件模板已创建: ' + result.path));
                console.log(dim('  编辑此文件添加你的自定义骚话'));
            } else {
                console.log(red('✗ 创建失败: ' + result.error));
                process.exit(1);
            }
            break;
        }
        case 'search': {
            const query = args[0] || '';
            const indexArg = args.find(arg => arg.startsWith('--index=') || arg === '--index');
            const indexUrl = indexArg ? (indexArg === '--index' ? args[args.indexOf(indexArg) + 1] : indexArg.split('=')[1]) : null;

            const allowedHosts = args
                .flatMap((arg, index) => {
                    if (arg === '--allow-host') {
                        return args[index + 1] ? [args[index + 1]] : [];
                    }
                    if (arg.startsWith('--allow-host=')) {
                        return [arg.split('=')[1]];
                    }
                    return [];
                })
                .filter(Boolean);

            console.log(cyan('正在搜索插件市场...'));
            if (indexUrl) {
                console.log(dim('  索引地址: ' + indexUrl));
            }
            if (allowedHosts.length > 0) {
                console.log(dim('  允许 Hosts: ' + allowedHosts.join(', ')));
            }
            const result = await pluginManager.searchPluginIndex(query, indexUrl, { 
                allowedHosts: allowedHosts.length > 0 ? allowedHosts : undefined,
                cwd: process.cwd()
            });
            if (!result.success) {
                console.log(red('✗ 搜索失败: ' + result.error));
                process.exit(1);
            }

            console.log('');
            console.log(bold(`====== 搜索结果 (${result.plugins.length} / ${result.total} 个插件) ======`));
            if (result.plugins.length === 0) {
                console.log(yellow('  未找到匹配插件'));
            } else {
                result.plugins.forEach((p, i) => {
                    console.log(`\n  ${green((i + 1).toString() + '. ' + p.name)} v${p.version || '?'}`);
                    if (p.description) console.log(`     描述: ${p.description}`);
                    if (p.author) console.log(`     作者: ${p.author}`);
                    if (p.tags && p.tags.length > 0) console.log(`     标签: ${dim(p.tags.join(', '))}`);
                    if (p.homepage) console.log(`     主页: ${dim(p.homepage)}`);
                    const installCommand = 'git-sao-hua plugin install --from-index ' + p.name
                        + (indexUrl ? ' --index ' + indexUrl : '')
                        + (allowedHosts.length > 0 ? ' ' + allowedHosts.map(host => '--allow-host ' + host).join(' ') : '');
                    console.log(`     安装: ${dim(installCommand)}`);
                });
            }
            console.log('');
            break;
        }
        case 'install': {
            const sourcePath = args[0];
            const urlArg = args.find(arg => arg.startsWith('--url=') || arg === '--url');
            const urlValue = urlArg ? (urlArg === '--url' ? args[args.indexOf(urlArg) + 1] : urlArg.split('=')[1]) : null;
            
            const checksumArg = args.find(arg => arg.startsWith('--checksum=') || arg === '--checksum');
            const checksumValue = checksumArg ? (checksumArg === '--checksum' ? args[args.indexOf(checksumArg) + 1] : checksumArg.split('=')[1]) : null;
            
            const fromIndexArg = args.find(arg => arg.startsWith('--from-index=') || arg === '--from-index');
            const fromIndexValue = fromIndexArg ? (fromIndexArg === '--from-index' ? args[args.indexOf(fromIndexArg) + 1] : fromIndexArg.split('=')[1]) : null;
            
            const indexArg = args.find(arg => arg.startsWith('--index=') || arg === '--index');
            const indexUrl = indexArg ? (indexArg === '--index' ? args[args.indexOf(indexArg) + 1] : indexArg.split('=')[1]) : null;

            const allowedHosts = args
                .flatMap((arg, index) => {
                    if (arg === '--allow-host') {
                        return args[index + 1] ? [args[index + 1]] : [];
                    }
                    if (arg.startsWith('--allow-host=')) {
                        return [arg.split('=')[1]];
                    }
                    return [];
                })
                .filter(Boolean);
            
            if (!sourcePath && !urlValue && !fromIndexValue) {
                console.log(red('错误：请指定插件路径、URL 或从索引安装'));
                console.log(dim('用法: git-sao-hua plugin install <path>'));
                console.log(dim('       git-sao-hua plugin install --url <url> [--checksum <sha256>]'));
                console.log(dim('       git-sao-hua plugin install --url <url> --allow-host <host>'));
                console.log(dim('       git-sao-hua plugin install --from-index <name> [--index <url>] [--allow-host <host>]'));
                process.exit(1);
            }
            
            if (fromIndexValue) {
                console.log(cyan('正在从插件市场安装...'));
                if (indexUrl) {
                    console.log(dim('  索引地址: ' + indexUrl));
                }
                if (allowedHosts.length > 0) {
                    console.log(dim('  允许 Hosts: ' + allowedHosts.join(', ')));
                }
                const result = await pluginManager.installPluginFromIndex(fromIndexValue, indexUrl, null, {
                    allowedHosts: allowedHosts.length > 0 ? allowedHosts : undefined,
                    cwd: process.cwd()
                });
                if (result.success) {
                    console.log(green('✓ 插件安装成功: ' + result.plugin.name));
                    console.log(dim('  版本: ' + result.plugin.version));
                    console.log(dim('  路径: ' + result.path));
                    if (result.plugin.checksum) {
                        console.log(dim('  SHA-256: ' + result.plugin.checksum));
                    }
                } else {
                    console.log(red('✗ 安装失败: ' + result.error));
                    process.exit(1);
                }
            } else if (urlValue) {
                console.log(cyan('正在从 URL 下载并安装插件...'));
                if (checksumValue) {
                    console.log(dim('  校验 SHA-256: ' + checksumValue));
                }
                if (allowedHosts.length > 0) {
                    console.log(dim('  允许 Hosts: ' + allowedHosts.join(', ')));
                }
                const result = await pluginManager.installPluginFromUrl(urlValue, null, {
                    expectedChecksum: checksumValue || null,
                    allowedHosts: allowedHosts.length > 0 ? allowedHosts : undefined,
                    cwd: process.cwd()
                });
                if (result.success) {
                    console.log(green('✓ 插件安装成功: ' + result.plugin.name));
                    console.log(dim('  版本: ' + result.plugin.version));
                    console.log(dim('  路径: ' + result.path));
                    if (result.plugin.checksum) {
                        console.log(dim('  SHA-256: ' + result.plugin.checksum));
                    }
                } else {
                    console.log(red('✗ 安装失败: ' + result.error));
                    process.exit(1);
                }
            } else {
                console.log(cyan('正在安装插件...'));
                const result = pluginManager.installPlugin(sourcePath);
                if (result.success) {
                    console.log(green('✓ 插件安装成功: ' + result.plugin.name));
                    console.log(dim('  版本: ' + result.plugin.version));
                    console.log(dim('  路径: ' + result.path));
                } else {
                    console.log(red('✗ 安装失败: ' + result.error));
                    process.exit(1);
                }
            }
            break;
        }
        case 'remove': {
            const pluginName = args[0];
            if (!pluginName) {
                console.log(red('错误：请指定插件名称'));
                console.log(dim('用法: git-sao-hua plugin remove <name>'));
                console.log(dim('查看插件列表: git-sao-hua plugin list'));
                process.exit(1);
            }
            console.log(cyan('正在删除插件...'));
            const result = pluginManager.removePlugin(pluginName);
            if (result.success) {
                console.log(green('✓ 插件已删除: ' + pluginName));
            } else {
                console.log(red('✗ 删除失败: ' + result.error));
                process.exit(1);
            }
            break;
        }
        default:
            console.log(red('未知的 plugin 操作：' + (action || '')));
            console.log('');
            console.log(bold('用法:'));
            console.log('  ' + green('git-sao-hua plugin list') + '           列出已安装的插件');
            console.log('  ' + green('git-sao-hua plugin create [name]') + '     创建插件模板');
            console.log('  ' + green('git-sao-hua plugin install <path>') + '     安装本地插件');
            console.log('  ' + green('git-sao-hua plugin install --url <url>') + ' 从 URL 安装插件');
            console.log('  ' + green('git-sao-hua plugin install --url <url> --checksum <sha256>') + ' 从 URL 安装并校验');
            console.log('  ' + green('git-sao-hua plugin search [query]') + '     搜索插件市场');
            console.log('  ' + green('git-sao-hua plugin install --from-index <name>') + ' 从索引安装插件');
            console.log('  ' + green('git-sao-hua plugin remove <name>') + '    删除插件');
            console.log('');
            console.log(dim('示例:'));
            console.log('  git-sao-hua plugin list');
            console.log('  git-sao-hua plugin create my-pack');
            console.log('  git-sao-hua plugin install ./my-plugin.json');
            console.log('  git-sao-hua plugin install --url https://example.com/plugin.json');
            console.log('  git-sao-hua plugin install --url https://example.com/plugin.json --checksum abc123...');
            console.log('  git-sao-hua plugin search love');
            console.log('  git-sao-hua plugin search love --index https://example.com/index.json');
            console.log('  git-sao-hua plugin install --from-index my-plugin');
            console.log('  git-sao-hua plugin remove my-pack');
            process.exit(1);
    }
}

async function main() {
    // 处理子命令（hook / init / plugin）
    const args = process.argv.slice(2);
    if (args[0] === 'hook') {
        handleHookCommand(args[1] || 'status');
        return;
    }
    if (args[0] === 'init') {
        await handleInitCommand();
        return;
    }
    if (args[0] === 'plugin') {
        await handlePluginCommand(args[1], args.slice(2));
        return;
    }

    const options = parseArgs();

    if (options.help) {
        showHelp();
        return;
    }

    if (options.version) {
        console.log(`git-sao-hua v${VERSION}`);
        return;
    }

    if (options.list) {
        showList();
        return;
    }

    let type = options.type;
    let style = options.style;

    // 智能检测模式
    if (options.auto) {
        console.log(cyan('🔍 正在智能分析 Git 变更...'));
        const detection = smartDetectType();
        
        if (detection) {
            type = detection.type;
            console.log(cyan(`✓ 检测推荐类型：${green(type)} (置信度：${detection.confidence})`));
            console.log(dim(`  ${detection.reason}`));
        } else {
            console.log(yellow('⚠ 智能检测失败，将随机生成'));
        }
    }

    if (type && !VALID_TYPES.includes(type)) {
        console.log(red(`无效类型：${type}`));
        console.log(dim(`有效类型：${VALID_TYPES.join(', ')}`));
        process.exit(1);
    }

    if (style && !VALID_STYLES.includes(style)) {
        console.log(red(`无效风格：${style}`));
        console.log(dim(`有效风格：${VALID_STYLES.join(', ')}`));
        process.exit(1);
    }

    if (options.interactive) {
        const result = await interactiveMode();
        if (result.handled) {
            return;
        }
    }

    const language = options.language;
    
    // AI 生成模式
    let msgObj;
    if (options.ai) {
        msgObj = await generateAIMessage(type, style, language);
    } else {
        msgObj = generateMessage(type, style, language);
    }
    
    printMessage(msgObj);

    if (options.copy) {
        const success = copyToClipboard(msgObj.fullMessage);
        if (success) {
            console.log(green('✓ 已复制到剪贴板'));
        } else {
            console.log(red('✗ 复制到剪贴板失败'));
        }
    }

    if (options.git) {
        gitCommit(msgObj.fullMessage);
    }
}

main();
