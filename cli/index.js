#!/usr/bin/env node

const readline = require('readline');
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const data = require('../lib');

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

const VERSION = '1.20.0';

const VALID_TYPES = ['fix', 'feat', 'chore', 'docs', 'refactor', 'style', 'test', 'perf', 'ci', 'build', 'revert', 'hotfix'];
const VALID_STYLES = ['love', 'sao', 'zha', 'chu', 'fo'];

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

function generateMessage(type, style) {
    let msgType = type;
    let msgStyle = style;

    if (!msgType) {
        const random = data.getRandomSaoHua();
        msgType = random.type;
        msgStyle = random.style;
    } else if (!msgStyle) {
        const styleKeys = Object.keys(data.saoHuaData[msgType]);
        msgStyle = styleKeys[getRandomInt(styleKeys.length)];
    }

    const message = data.getSaoHua(msgType, msgStyle);
    return {
        type: msgType,
        style: msgStyle,
        message: message,
        fullMessage: `${msgType}: ${message}`
    };
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
    console.log('');
    console.log(bold('选项:'));
    console.log('  ' + green('-t, --type <type>') + '      指定 commit 类型');
    console.log('  ' + green('-s, --style <style>') + '    指定骚话风格');
    console.log('  ' + green('-a, --auto') + '             智能检测 commit 类型 (v1.20.0 新增)');
    console.log('  ' + green('-l, --list') + '             列出所有可用类型和风格');
    console.log('  ' + green('-c, --copy') + '             生成后复制到剪贴板');
    console.log('  ' + green('-g, --git') + '              直接执行 git commit');
    console.log('  ' + green('-i, --interactive') + '      交互模式');
    console.log('  ' + green('-h, --help') + '             显示帮助信息');
    console.log('  ' + green('-v, --version') + '         显示版本号');
    console.log('');
    console.log(bold('示例:'));
    console.log(dim('  # 随机生成一条骚话'));
    console.log('  git-sao-hua');
    console.log(dim('\n  # 指定类型为 fix'));
    console.log('  git-sao-hua -t fix');
    console.log(dim('\n  # 指定类型和风格'));
    console.log('  git-sao-hua -t feat -s love');
    console.log(dim('\n  # 智能检测类型并生成'));
    console.log('  git-sao-hua -a');
    console.log(dim('\n  # 生成并复制到剪贴板'));
    console.log('  git-sao-hua -c');
    console.log(dim('\n  # 生成并直接提交'));
    console.log('  git-sao-hua -g');
    console.log(dim('\n  # 交互模式'));
    console.log('  git-sao-hua -i');
}

function showList() {
    console.log('\n' + bold('可用类型:'));
    data.commitTypes.forEach(t => {
        console.log(`  ${green(t.value.padEnd(10))} - ${t.desc}`);
    });

    console.log('\n' + bold('可用风格:'));
    data.styles.forEach(s => {
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

async function interactiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('\n' + bold('====== 交互模式 ======\n'));

    console.log(bold('请选择类型:'));
    data.commitTypes.forEach((t, i) => {
        console.log(`  ${green((i + 1).toString())}. ${t.value} - ${t.desc}`);
    });

    let typeAnswer = await askQuestion(rl, '\n请输入类型编号或名称：');
    let type = typeAnswer.trim();

    if (!isNaN(type) && type >= 1 && type <= data.commitTypes.length) {
        type = data.commitTypes[parseInt(type) - 1].value;
    }

    if (!VALID_TYPES.includes(type)) {
        type = VALID_TYPES[getRandomInt(VALID_TYPES.length)];
        console.log(dim(`  输入无效，已随机选择：${type}`));
    }

    console.log('\n' + bold('请选择风格:'));
    data.styles.forEach((s, i) => {
        console.log(`  ${green((i + 1).toString())}. ${s.value} - ${s.emoji} ${s.label}`);
    });

    let styleAnswer = await askQuestion(rl, '\n请输入风格编号或名称：');
    let style = styleAnswer.trim();

    if (!isNaN(style) && style >= 1 && style <= data.styles.length) {
        style = data.styles[parseInt(style) - 1].value;
    }

    if (!VALID_STYLES.includes(style)) {
        const styleKeys = Object.keys(data.saoHuaData[type]);
        style = styleKeys[getRandomInt(styleKeys.length)];
        console.log(dim(`  输入无效，已随机选择：${style}`));
    }

    rl.close();

    return { type, style };
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
        help: false,
        version: false
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

    return options;
}

async function main() {
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
        type = result.type;
        style = result.style;
    }

    const msgObj = generateMessage(type, style);
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
