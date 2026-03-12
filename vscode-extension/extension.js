const vscode = require('vscode');
const { saoHuaData, commitTypes, styles, getSaoHua, getRandomSaoHua, generateCommitMessage } = require('./sao-hua-data');

let currentType = 'feat';
let currentStyle = 'sao';

function activate(context) {
    console.log('Git Commit 骚话生成器 已激活!');

    const generateCommand = vscode.commands.registerCommand('gitCommitSaoHua.generate', async () => {
        await showSaoHuaGenerator();
    });

    const generateRandomCommand = vscode.commands.registerCommand('gitCommitSaoHua.generateRandom', async () => {
        const result = getRandomSaoHua();
        currentType = result.type;
        currentStyle = result.style;
        const message = generateCommitMessage(result.type, result.style);
        
        await vscode.window.showInformationMessage(`随机生成: ${result.type} (${getStyleLabel(result.style)})`, {
            modal: true,
            detail: message
        });
        
        await insertToGitInput(message);
    });

    const selectTypeCommand = vscode.commands.registerCommand('gitCommitSaoHua.selectType', async () => {
        const items = commitTypes.map(t => ({
            label: t.label,
            description: t.desc,
            value: t.value
        }));
        
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '选择 Commit 类型'
        });
        
        if (selected) {
            currentType = selected.value;
            vscode.window.showInformationMessage(`已选择类型: ${selected.label}`);
        }
    });

    const selectStyleCommand = vscode.commands.registerCommand('gitCommitSaoHua.selectStyle', async () => {
        const items = styles.map(s => ({
            label: `${s.emoji} ${s.label}`,
            value: s.value
        }));
        
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '选择风格模式'
        });
        
        if (selected) {
            currentStyle = selected.value;
            vscode.window.showInformationMessage(`已选择风格: ${selected.label}`);
        }
    });

    const openKeybindingsCommand = vscode.commands.registerCommand('gitCommitSaoHua.openKeybindings', async () => {
        const keybindingsConfig = [
            '{',
            '    "key": "ctrl+shift+g",',
            '    "command": "gitCommitSaoHua.generate",',
            '    "when": "editorTextFocus"',
            '}'
        ].join('\n');

        const doc = await vscode.workspace.openTextDocument({
            content: `// 在此文件中添加以下配置来自定义快捷键:\n//\n// 示例:\n// ${keybindingsConfig}\n//\n// 可用命令:\n// - gitCommitSaoHua.generate: 生成骚话 Commit\n// - gitCommitSaoHua.generateRandom: 随机生成 Commit\n// - gitCommitSaoHua.selectType: 选择 Commit 类型\n// - gitCommitSaoHua.selectStyle: 选择风格模式\n`,
            language: 'json'
        });

        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage('请在打开的文件中添加快捷键配置，或打开: 文件 > 首选项 > 快捷键 进行设置');
    });

    context.subscriptions.push(generateCommand);
    context.subscriptions.push(generateRandomCommand);
    context.subscriptions.push(selectTypeCommand);
    context.subscriptions.push(selectStyleCommand);
    context.subscriptions.push(openKeybindingsCommand);
}

async function showSaoHuaGenerator() {
    const config = vscode.workspace.getConfiguration('gitCommitSaoHua');
    const defaultStyle = config.get('defaultStyle', 'sao');
    currentStyle = defaultStyle;

    const typeItems = commitTypes.map(t => ({
        label: t.label,
        description: t.desc,
        value: t.value,
        picked: t.value === currentType
    }));

    const selectedType = await vscode.window.showQuickPick(typeItems, {
        placeHolder: '选择 Commit 类型',
        ignoreFocusOut: true
    });

    if (!selectedType) {
        return;
    }
    currentType = selectedType.value;

    const styleItems = styles.map(s => ({
        label: `${s.emoji} ${s.label}`,
        value: s.value,
        picked: s.value === currentStyle
    }));

    const selectedStyle = await vscode.window.showQuickPick(styleItems, {
        placeHolder: '选择风格模式',
        ignoreFocusOut: true
    });

    if (!selectedStyle) {
        return;
    }
    currentStyle = selectedStyle.value;

    const description = await vscode.window.showInputBox({
        placeHolder: '输入简短描述（可选）',
        prompt: '例如：用户登录功能'
    });

    const message = generateCommitMessage(currentType, currentStyle, description);

    const result = await vscode.window.showInformationMessage(
        `生成成功！类型: ${currentType}`,
        { modal: true, detail: message },
        '插入到 Git'
    );

    if (result === '插入到 Git') {
        await insertToGitInput(message);
    }
}

function getStyleLabel(styleKey) {
    const style = styles.find(s => s.value === styleKey);
    return style ? `${style.emoji} ${style.label}` : styleKey;
}

async function insertToGitInput(message) {
    try {
        const gitExtension = vscode.extensions.getExtension('vscode.git');
        if (gitExtension) {
            const git = gitExtension.exports.getAPI(1);
            if (git && git.repositories && git.repositories.length > 0) {
                const repo = git.repositories[0];
                const inputBox = repo.inputBox;
                if (inputBox) {
                    inputBox.value = message;
                    vscode.window.showInformationMessage('已插入到 Git 输入框');
                    return;
                }
            }
        }

        await vscode.env.clipboard.writeText(message);
        vscode.window.showInformationMessage('已复制到剪贴板，请手动粘贴到 Git 输入框');
    } catch (error) {
        await vscode.env.clipboard.writeText(message);
        vscode.window.showWarningMessage('复制到剪贴板（自动插入失败）');
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};