const vscode = require('vscode');
const { commitTypes, styles, getRandomSaoHua, generateCommitMessage } = require('./sao-hua-data');

const STATE_KEYS = {
    type: 'gitCommitSaoHua.currentType',
    style: 'gitCommitSaoHua.currentStyle',
    descriptionHistory: 'gitCommitSaoHua.descriptionHistory'
};

const MAX_HISTORY_COUNT = 10;

let currentType = 'feat';
let currentStyle = 'sao';
let extensionContext = null;

/**
 * 获取 Git 变更文件列表
 * @returns {Promise<{files: string[], raw: string}[]>} 变更文件列表
 */
async function getChangedFiles() {
    try {
        const gitExtension = vscode.extensions.getExtension('vscode.git');
        if (!gitExtension) {
            return null;
        }

        if (!gitExtension.isActive) {
            try {
                await gitExtension.activate();
            } catch (e) {
                return null;
            }
        }

        const git = gitExtension.exports.getAPI(1);
        if (!git || !git.repositories || git.repositories.length === 0) {
            return null;
        }

        const repo = git.repositories[0];
        const changes = repo.state.workingTreeChanges;
        
        if (!changes || changes.length === 0) {
            return null;
        }

        return changes.map(change => ({
            files: [change.uri.fsPath],
            raw: change.uri.fsPath
        }));
    } catch (error) {
        console.error('获取 Git 变更失败:', error);
        return null;
    }
}

/**
 * 智能分析文件变更，推荐 Commit 类型
 * @param {Array<{files: string[], raw: string}>} changedFiles 变更文件列表
 * @returns {string|null} 推荐的 commit 类型，如果无法确定则返回 null
 */
function analyzeCommitType(changedFiles) {
    if (!changedFiles || changedFiles.length === 0) {
        return null;
    }

    const typeCounts = {
        fix: 0,
        feat: 0,
        chore: 0,
        docs: 0,
        style: 0,
        test: 0,
        ci: 0,
        build: 0,
        refactor: 0
    };

    for (const change of changedFiles) {
        const filePath = change.raw;
        const fileName = filePath.split(/[/\\]/).pop();
        const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() : '';
        const baseName = fileName.toLowerCase();

        // style: .css/.scss/.less/.sass
        if (['.css', '.scss', '.less', '.sass'].includes(ext)) {
            typeCounts.style++;
            continue;
        }

        // test: .test.js/.spec.js/test_*.js
        if (baseName.match(/(\.test\.js|\.spec\.js|^test_.+\.js$)/)) {
            typeCounts.test++;
            continue;
        }

        // docs: .md/.txt
        if (['.md', '.txt'].includes(ext) && !baseName.includes('changelog')) {
            typeCounts.docs++;
            continue;
        }

        // chore: .json (package.json 除外)
        if (ext === '.json' && !baseName.includes('package')) {
            typeCounts.chore++;
            continue;
        }

        // build: package.json/package-lock.json
        if (baseName === 'package.json' || baseName === 'package-lock.json') {
            typeCounts.build++;
            continue;
        }

        // .gitignore/.editorconfig → chore
        if (baseName === '.gitignore' || baseName === '.editorconfig') {
            typeCounts.chore++;
            continue;
        }

        // CI/CD 配置文件 (.github/, .gitlab-ci.yml) → ci
        if (filePath.includes('.github/') || baseName === '.gitlab-ci.yml' || baseName === 'jenkinsfile') {
            typeCounts.ci++;
            continue;
        }

        // 配置文件 (.env, config/*) → chore
        if (baseName.startsWith('.env') || filePath.includes('/config/') || filePath.includes('\\config\\')) {
            typeCounts.chore++;
            continue;
        }

        // .ts/.js → feat 或 fix（根据变更内容判断）
        if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
            // 简单判断：如果是修复性关键词则判定为 fix
            // 这里可以根据更复杂的逻辑来判断
            // 暂时默认为 feat
            typeCounts.feat++;
            continue;
        }

        // 其他情况默认为 chore
        typeCounts.chore++;
    }

    // 找出出现次数最多的类型
    let maxType = null;
    let maxCount = 0;

    for (const [type, count] of Object.entries(typeCounts)) {
        if (count > maxCount) {
            maxCount = count;
            maxType = type;
        }
    }

    return maxType;
}

/**
 * 智能检测 Commit 类型
 * 自动分析当前 Git 变更，推荐合适的 Commit 类型
 */
async function generateSmartCommit() {
    const config = vscode.workspace.getConfiguration('gitCommitSaoHua');
    const defaultStyle = config.get('defaultStyle', 'sao');
    const defaultType = config.get('defaultType', 'feat');
    const autoInsert = config.get('autoInsert', true);

    const initialStyle = currentStyle || defaultStyle;
    const initialType = currentType || defaultType;

    // 显示正在分析的状态
    vscode.window.setStatusBarMessage('🔍 正在智能分析变更文件...', 2000);

    // 获取变更文件
    const changedFiles = await getChangedFiles();

    if (!changedFiles || changedFiles.length === 0) {
        vscode.window.showWarningMessage('未检测到 Git 变更文件，将使用手动选择模式');
        return await showSaoHuaGenerator();
    }

    // 智能分析 Commit 类型
    const detectedType = analyzeCommitType(changedFiles);
    
    if (!detectedType) {
        vscode.window.showWarningMessage('智能检测失败，将使用手动选择模式');
        return await showSaoHuaGenerator();
    }

    currentType = detectedType;
    await persistPreferences();

    vscode.window.showInformationMessage(`✨ 智能检测推荐类型: ${detectedType}`);
    playSoundEffect('generate');

    // 继续选择风格和描述
    const styleItems = styles.map(s => ({
        label: `${s.emoji} ${s.label}`,
        value: s.value,
        picked: s.value === initialStyle
    }));

    const selectedStyle = await vscode.window.showQuickPick(styleItems, {
        placeHolder: '选择风格模式',
        ignoreFocusOut: true
    });

    if (!selectedStyle) {
        return;
    }
    currentStyle = selectedStyle.value;
    await persistPreferences();

    let description = await getDescriptionWithHistory();

    const message = generateCommitMessage(currentType, currentStyle, description);

    if (autoInsert) {
        const result = await vscode.window.showInformationMessage(
            `生成成功！类型: ${currentType} (智能推荐)`,
            { modal: true, detail: message },
            '插入到 Git'
        );

        if (result === '插入到 Git') {
            await insertToGitInput(message, true);
        } else {
            await vscode.env.clipboard.writeText(message);
            playSoundEffect('copy');
            vscode.window.showInformationMessage('已复制到剪贴板');
        }
    } else {
        await vscode.env.clipboard.writeText(message);
        playSoundEffect('copy');
        await vscode.window.showInformationMessage(
            `已复制到剪贴板！类型: ${currentType} (智能推荐)`,
            { modal: true, detail: message }
        );
    }
}

/**
 * 播放音效反馈
 * - 状态栏消息 + emoji 动画作为视觉反馈
 * - 不同通知级别触发系统通知音
 * @param {'generate' | 'copy' | 'success'} type 音效类型
 */
function playSoundEffect(type) {
    const config = vscode.workspace.getConfiguration('gitCommitSaoHua');
    const enableSoundEffects = config.get('enableSoundEffects', true);

    if (!enableSoundEffects) {
        return;
    }

    const emojiAnimations = {
        generate: ['🎯', '🎯', '✨'],
        copy: ['📋', '📋', '✅'],
        success: ['🎉', '🎉', '🎊']
    };

    const statusMessages = {
        generate: '正在生成骚话...',
        copy: '已复制到剪贴板',
        success: '生成成功！'
    };

    const notificationLevels = {
        generate: vscode.window.showInformationMessage,
        copy: vscode.window.showInformationMessage,
        success: vscode.window.showInformationMessage
    };

    const emojis = emojiAnimations[type] || ['✨'];
    const statusMsg = statusMessages[type] || '完成';

    let index = 0;
    const animation = setInterval(() => {
        if (index >= emojis.length) {
            clearInterval(animation);
            vscode.window.setStatusBarMessage(`${statusMsg} ${emojis[emojis.length - 1]}`, 3000);
            return;
        }
        vscode.window.setStatusBarMessage(`${statusMsg} ${emojis[index]}`, 500);
        index++;
    }, 300);

    const notifyFn = notificationLevels[type];
    if (type === 'success') {
        notifyFn('✨ 骚话生成成功！', { modal: false });
    } else if (type === 'copy') {
        notifyFn('📋 已复制到剪贴板', { modal: false });
    }
}

function activate(context) {
    console.log('Git Commit 骚话生成器 已激活!');

    extensionContext = context;
    restorePreferences();

    const generateCommand = vscode.commands.registerCommand('gitCommitSaoHua.generate', async () => {
        await showSaoHuaGenerator();
    });

    const generateSmartCommand = vscode.commands.registerCommand('gitCommitSaoHua.generateSmart', async () => {
        await generateSmartCommit();
    });

    const generateRandomCommand = vscode.commands.registerCommand('gitCommitSaoHua.generateRandom', async () => {
        const config = vscode.workspace.getConfiguration('gitCommitSaoHua');
        const autoInsert = config.get('autoInsert', true);

        const result = getRandomSaoHua();
        currentType = result.type;
        currentStyle = result.style;
        await persistPreferences();

        const message = generateCommitMessage(result.type, result.style);

        if (autoInsert) {
            await vscode.window.showInformationMessage(`随机生成: ${result.type} (${getStyleLabel(result.style)})`, {
                modal: true,
                detail: message
            });
            playSoundEffect('success');
            await insertToGitInput(message, true);
        } else {
            await vscode.env.clipboard.writeText(message);
            playSoundEffect('copy');
            await vscode.window.showInformationMessage(`已复制到剪贴板！类型: ${result.type} (${getStyleLabel(result.style)})`, {
                modal: true,
                detail: message
            });
        }
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
            await persistPreferences();
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
            await persistPreferences();
            vscode.window.showInformationMessage(`已选择风格: ${selected.label}`);
        }
    });

    const resetPreferencesCommand = vscode.commands.registerCommand('gitCommitSaoHua.resetPreferences', async () => {
        resetPreferencesToConfig();
        await clearPersistedPreferences();
        vscode.window.showInformationMessage(`已重置偏好：${currentType} / ${getStyleLabel(currentStyle)}`);
    });

    const clearDescriptionHistoryCommand = vscode.commands.registerCommand('gitCommitSaoHua.clearDescriptionHistory', async () => {
        await clearDescriptionHistory();
        vscode.window.showInformationMessage('已清空描述历史记录');
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
            content: `// 在此文件中添加以下配置来自定义快捷键:\n//
// 示例:\n// ${keybindingsConfig}\n//
// 可用命令:\n// - gitCommitSaoHua.generate: 生成骚话 Commit\n// - gitCommitSaoHua.generateSmart: 智能检测生成 Commit\n// - gitCommitSaoHua.generateRandom: 随机生成 Commit\n// - gitCommitSaoHua.selectType: 选择 Commit 类型\n// - gitCommitSaoHua.selectStyle: 选择风格模式\n// - gitCommitSaoHua.resetPreferences: 重置类型/风格偏好\n`,
            language: 'json'
        });

        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage('请在打开的文件中添加快捷键配置，或打开: 文件 > 首选项 > 快捷键 进行设置');
    });

    context.subscriptions.push(generateCommand);
    context.subscriptions.push(generateSmartCommand);
    context.subscriptions.push(generateRandomCommand);
    context.subscriptions.push(selectTypeCommand);
    context.subscriptions.push(selectStyleCommand);
    context.subscriptions.push(resetPreferencesCommand);
    context.subscriptions.push(clearDescriptionHistoryCommand);
    context.subscriptions.push(openKeybindingsCommand);
}

async function showSaoHuaGenerator() {
    const config = vscode.workspace.getConfiguration('gitCommitSaoHua');
    const defaultStyle = config.get('defaultStyle', 'sao');
    const defaultType = config.get('defaultType', 'feat');
    const autoInsert = config.get('autoInsert', true);

    const initialType = currentType || defaultType;
    const initialStyle = currentStyle || defaultStyle;

    // 让用户选择使用智能检测还是手动选择
    const modeItems = [
        { label: '$(search) 智能检测', description: '自动分析 Git 变更，推荐 Commit 类型', value: 'smart' },
        { label: '$(list-flat) 手动选择', description: '手动选择 Commit 类型', value: 'manual' }
    ];

    const selectedMode = await vscode.window.showQuickPick(modeItems, {
        placeHolder: '选择生成方式',
        ignoreFocusOut: true
    });

    if (!selectedMode) {
        return;
    }

    // 如果选择智能检测，调用智能检测功能
    if (selectedMode.value === 'smart') {
        return await generateSmartCommit();
    }

    // 手动选择模式

    const typeItems = commitTypes.map(t => ({
        label: t.label,
        description: t.desc,
        value: t.value,
        picked: t.value === initialType
    }));

    const selectedType = await vscode.window.showQuickPick(typeItems, {
        placeHolder: '选择 Commit 类型',
        ignoreFocusOut: true
    });

    if (!selectedType) {
        return;
    }
    currentType = selectedType.value;
    await persistPreferences();

    const styleItems = styles.map(s => ({
        label: `${s.emoji} ${s.label}`,
        value: s.value,
        picked: s.value === initialStyle
    }));

    const selectedStyle = await vscode.window.showQuickPick(styleItems, {
        placeHolder: '选择风格模式',
        ignoreFocusOut: true
    });

    if (!selectedStyle) {
        return;
    }
    currentStyle = selectedStyle.value;
    await persistPreferences();

    let description = await getDescriptionWithHistory();

    const message = generateCommitMessage(currentType, currentStyle, description);

    playSoundEffect('generate');

    if (autoInsert) {
        const result = await vscode.window.showInformationMessage(
            `生成成功！类型: ${currentType}`,
            { modal: true, detail: message },
            '插入到 Git'
        );

        if (result === '插入到 Git') {
            await insertToGitInput(message, true);
        } else {
            await vscode.env.clipboard.writeText(message);
            playSoundEffect('copy');
            vscode.window.showInformationMessage('已复制到剪贴板');
        }
    } else {
        await vscode.env.clipboard.writeText(message);
        playSoundEffect('copy');
        await vscode.window.showInformationMessage(
            `已复制到剪贴板！类型: ${currentType}`,
            { modal: true, detail: message }
        );
    }
}

function restorePreferences() {
    const config = vscode.workspace.getConfiguration('gitCommitSaoHua');
    const defaultType = config.get('defaultType', 'feat');
    const defaultStyle = config.get('defaultStyle', 'sao');

    const savedType = extensionContext?.workspaceState.get(STATE_KEYS.type);
    const savedStyle = extensionContext?.workspaceState.get(STATE_KEYS.style);

    currentType = isValidType(savedType) ? savedType : defaultType;
    currentStyle = isValidStyle(savedStyle) ? savedStyle : defaultStyle;
}

function resetPreferencesToConfig() {
    const config = vscode.workspace.getConfiguration('gitCommitSaoHua');
    currentType = config.get('defaultType', 'feat');
    currentStyle = config.get('defaultStyle', 'sao');
}

async function persistPreferences() {
    if (!extensionContext) {
        return;
    }

    await extensionContext.workspaceState.update(STATE_KEYS.type, currentType);
    await extensionContext.workspaceState.update(STATE_KEYS.style, currentStyle);
}

async function clearPersistedPreferences() {
    if (!extensionContext) {
        return;
    }

    await extensionContext.workspaceState.update(STATE_KEYS.type, undefined);
    await extensionContext.workspaceState.update(STATE_KEYS.style, undefined);
}

function isValidType(type) {
    return commitTypes.some(item => item.value === type);
}

function isValidStyle(styleKey) {
    return styles.some(item => item.value === styleKey);
}

function getStyleLabel(styleKey) {
    const style = styles.find(s => s.value === styleKey);
    return style ? `${style.emoji} ${style.label}` : styleKey;
}

async function getDescriptionWithHistory() {
    const history = getDescriptionHistory();

    if (history.length === 0) {
        return await vscode.window.showInputBox({
            placeHolder: '输入简短描述（可选）',
            prompt: '例如：用户登录功能'
        });
    }

    const historyItems = history.map((desc, index) => ({
        label: desc,
        description: `最近使用 #${index + 1}`
    }));

    const options = [
        { label: '$(history) 选择最近使用的描述...', kind: 'history' },
        { label: '$(add) 输入新描述...', kind: 'new' }
    ];

    const selected = await vscode.window.showQuickPick(options, {
        placeHolder: '选择或输入描述',
        ignoreFocusOut: true
    });

    if (!selected) {
        return undefined;
    }

    if (selected.kind === 'history') {
        const pickedDesc = await vscode.window.showQuickPick(historyItems, {
            placeHolder: '选择最近使用的描述',
            ignoreFocusOut: true
        });

        if (pickedDesc) {
            return pickedDesc.label;
        }
        return undefined;
    }

    const newDescription = await vscode.window.showInputBox({
        placeHolder: '输入简短描述（可选）',
        prompt: '例如：用户登录功能'
    });

    if (newDescription) {
        await saveDescriptionToHistory(newDescription);
    }

    return newDescription;
}

function getDescriptionHistory() {
    return extensionContext?.workspaceState.get(STATE_KEYS.descriptionHistory) || [];
}

async function saveDescriptionToHistory(description) {
    if (!extensionContext || !description) {
        return;
    }

    let history = getDescriptionHistory();
    history = history.filter(d => d !== description);
    history.unshift(description);

    if (history.length > MAX_HISTORY_COUNT) {
        history = history.slice(0, MAX_HISTORY_COUNT);
    }

    await extensionContext.workspaceState.update(STATE_KEYS.descriptionHistory, history);
}

async function clearDescriptionHistory() {
    if (!extensionContext) {
        return;
    }

    await extensionContext.workspaceState.update(STATE_KEYS.descriptionHistory, []);
}

async function insertToGitInput(message, tryInsert = true) {
    if (!tryInsert) {
        await vscode.env.clipboard.writeText(message);
        playSoundEffect('copy');
        vscode.window.showInformationMessage('已复制到剪贴板');
        return;
    }

    try {
        const gitExtension = vscode.extensions.getExtension('vscode.git');
        if (!gitExtension) {
            await fallbackToClipboard(message, '未找到 Git 扩展');
            return;
        }

        if (!gitExtension.isActive) {
            try {
                await gitExtension.activate();
            } catch (e) {
                await fallbackToClipboard(message, 'Git 扩展激活失败');
                return;
            }
        }

        const git = gitExtension.exports.getAPI(1);
        if (!git || !git.repositories || git.repositories.length === 0) {
            await fallbackToClipboard(message, '未找到 Git 仓库');
            return;
        }

        const repos = git.repositories;
        let targetRepo = null;

        if (repos.length === 1) {
            targetRepo = repos[0];
        } else {
            const activeEditor = vscode.window.activeTextEditor;
            const activePath = activeEditor ? activeEditor.document.uri.fsPath : null;

            const matchedRepos = activePath
                ? repos.filter(repo => isPathInsideRepo(activePath, repo.root))
                : [];

            if (matchedRepos.length === 1) {
                targetRepo = matchedRepos[0];
            } else if (matchedRepos.length > 1) {
                targetRepo = await selectRepository(matchedRepos);
            } else {
                targetRepo = await selectRepository(repos);
            }
        }

        if (!targetRepo) {
            await fallbackToClipboard(message, '未选择仓库');
            return;
        }

        const inputBox = targetRepo.inputBox;
        if (inputBox) {
            inputBox.value = message;
            playSoundEffect('success');
            vscode.window.showInformationMessage('✓ 已插入到 Git 输入框');
            return;
        }

        await fallbackToClipboard(message, '无法获取 Git 输入框');
    } catch (error) {
        await fallbackToClipboard(message, '插入失败');
    }
}

async function selectRepository(repos) {
    const items = repos.map(repo => {
        const root = repo.root;
        const parts = root.replace(/\\/g, '/').split('/');
        const name = parts[parts.length - 1] || root;
        const parentPath = parts.slice(0, -1).join('/');
        const branch = repo.state.HEAD ? repo.state.HEAD.name : 'unknown';

        return {
            label: parentPath ? `${name} (${parentPath})` : name,
            description: `分支: ${branch}`,
            repo: repo
        };
    });

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: '选择要插入的 Git 仓库',
        ignoreFocusOut: true
    });

    return selected ? selected.repo : null;
}

function isPathInsideRepo(filePath, repoRoot) {
    const normalizedFilePath = filePath.replace(/\\/g, '/').toLowerCase();
    const normalizedRepoRoot = repoRoot.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();

    return normalizedFilePath === normalizedRepoRoot || normalizedFilePath.startsWith(`${normalizedRepoRoot}/`);
}

async function fallbackToClipboard(message, reason) {
    await vscode.env.clipboard.writeText(message);
    playSoundEffect('copy');
    vscode.window.showInformationMessage(`已复制到剪贴板（${reason}）`);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
