const vscode = require('vscode');
const { commitTypes, styles, getRandomSaoHua, generateCommitMessage } = require('./sao-hua-data');

const FIX_KEYWORDS = ['fix', 'bug', 'issue', 'error', 'crash', 'resolve', 'patch'];
const FEAT_KEYWORDS = ['add', 'new', 'create', 'implement', 'feature', 'support'];

const STATE_KEYS = {
    type: 'gitCommitSaoHua.currentType',
    style: 'gitCommitSaoHua.currentStyle',
    descriptionHistory: 'gitCommitSaoHua.descriptionHistory',
    customSaoHua: 'gitCommitSaoHua.customSaoHua',
    statistics: 'gitCommitSaoHua.statistics'
};

const CUSTOM_SAO_HUA_PROBABILITY = 0.3;

const MAX_HISTORY_COUNT = 10;

let currentType = 'feat';
let currentStyle = 'sao';
let extensionContext = null;

function getStatistics() {
    return extensionContext?.workspaceState.get(STATE_KEYS.statistics) || {
        totalCount: 0,
        typeUsage: {},
        styleUsage: {},
        lastGeneratedAt: null
    };
}

async function saveStatistics(stats) {
    if (!extensionContext) {
        return;
    }
    await extensionContext.workspaceState.update(STATE_KEYS.statistics, stats);
}

async function recordGeneration(type, style) {
    const stats = getStatistics();
    stats.totalCount += 1;
    stats.typeUsage[type] = (stats.typeUsage[type] || 0) + 1;
    stats.styleUsage[style] = (stats.styleUsage[style] || 0) + 1;
    stats.lastGeneratedAt = Date.now();
    await saveStatistics(stats);
}

async function resetStatistics() {
    await saveStatistics({
        totalCount: 0,
        typeUsage: {},
        styleUsage: {},
        lastGeneratedAt: null
    });
}

function getTopItems(usageObj, count = 3) {
    return Object.entries(usageObj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count);
}

function formatLastGeneratedTime(timestamp) {
    if (!timestamp) {
        return '暂无记录';
    }
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
        return '刚刚';
    } else if (diffMins < 60) {
        return `${diffMins} 分钟前`;
    } else if (diffHours < 24) {
        return `${diffHours} 小时前`;
    } else if (diffDays < 7) {
        return `${diffDays} 天前`;
    } else {
        return date.toLocaleString('zh-CN');
    }
}

async function showStatistics() {
    const stats = getStatistics();
    const totalCount = stats.totalCount || 0;
    const topTypes = getTopItems(stats.typeUsage, 3);
    const topStyles = getTopItems(stats.styleUsage, 3);
    const lastTime = formatLastGeneratedTime(stats.lastGeneratedAt);

    const typeLabels = {};
    for (const t of commitTypes) {
        typeLabels[t.value] = t.label;
    }
    const styleLabels = {};
    for (const s of styles) {
        styleLabels[s.value] = `${s.emoji} ${s.label}`;
    }

    const statsItems = [
        {
            label: `$(number) 总生成次数: ${totalCount}`,
            kind: vscode.QuickPickItemKind.Separator
        },
        {
            label: `📊 总生成次数`,
            description: `${totalCount} 次`,
            kind: vscode.QuickPickItemKind.Default
        }
    ];

    if (topTypes.length > 0) {
        statsItems.push({
            label: '',
            kind: vscode.QuickPickItemKind.Separator
        });
        statsItems.push({
            label: `🔥 最常用的 Commit 类型 (Top 3)`,
            kind: vscode.QuickPickItemKind.Default
        });
        for (const [type, count] of topTypes) {
            statsItems.push({
                label: `   ${typeLabels[type] || type}`,
                description: `${count} 次`,
                kind: vscode.QuickPickItemKind.Default
            });
        }
    }

    if (topStyles.length > 0) {
        statsItems.push({
            label: '',
            kind: vscode.QuickPickItemKind.Separator
        });
        statsItems.push({
            label: `✨ 最常用的风格 (Top 3)`,
            kind: vscode.QuickPickItemKind.Default
        });
        for (const [style, count] of topStyles) {
            statsItems.push({
                label: `   ${styleLabels[style] || style}`,
                description: `${count} 次`,
                kind: vscode.QuickPickItemKind.Default
            });
        }
    }

    statsItems.push({
        label: '',
        kind: vscode.QuickPickItemKind.Separator
    });
    statsItems.push({
        label: `🕐 最近生成时间`,
        description: lastTime,
        kind: vscode.QuickPickItemKind.Default
    });

    statsItems.push({
        label: '',
        kind: vscode.QuickPickItemKind.Separator
    });
    statsItems.push({
        label: `$(trash) 重置统计`,
        description: '清空所有统计数据',
        value: 'reset',
        kind: vscode.QuickPickItemKind.Default
    });

    const selected = await vscode.window.showQuickPick(statsItems, {
        placeHolder: '查看使用统计',
        ignoreFocusOut: true
    });

    if (selected && selected.value === 'reset') {
        const confirmResult = await vscode.window.showWarningMessage(
            '确定要重置所有统计数据吗？',
            { modal: true },
            '确定重置',
            '取消'
        );

        if (confirmResult === '确定重置') {
            await resetStatistics();
            vscode.window.showInformationMessage('已重置所有统计数据');
        }
    }
}

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
 * 获取 Git diff 内容
 * @returns {Promise<string|null>} diff 内容
 */
async function getDiffContent() {
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
        const diff = await repo.diff();
        
        return diff || null;
    } catch (error) {
        console.error('获取 Git diff 失败:', error);
        return null;
    }
}

/**
 * 分析 diff 内容中的 AST 代码结构变更
 * @param {string} diffContent - git diff 内容
 * @returns {{type: string|null, confidence: string, reason: string, astFeatures: string[]}} - AST 分析结果
 */
function analyzeASTChange(diffContent) {
    if (!diffContent || diffContent.length === 0) {
        return {
            type: null,
            confidence: 'low',
            reason: '无 diff 内容',
            astFeatures: []
        };
    }

    const astFeatures = [];
    let detectedType = null;
    let confidence = 'low';
    let reason = '';

    const addedLines = diffContent.split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++'));
    const removedLines = diffContent.split('\n').filter(line => line.startsWith('-') && !line.startsWith('---'));
    const addedContent = addedLines.join('\n');

    const newFunctionPatterns = [
        /function\s+\w+\s*\(/g,
        /const\s+\w+\s*=\s*(async\s+)?\(/g,
        /let\s+\w+\s*=\s*(async\s+)?\(/g,
        /async\s+function\s+\w+/g,
        /(\w+)\s*:\s*(async\s+)?function/g,
        /(\w+)\s*=\s*(async\s+)?\([^)]*\)\s*=>/g
    ];

    let newFunctionCount = 0;
    for (const pattern of newFunctionPatterns) {
        const matches = addedContent.match(pattern);
        if (matches) {
            newFunctionCount += matches.length;
        }
    }
    if (newFunctionCount > 0) {
        astFeatures.push(`新增 ${newFunctionCount} 个函数`);
        detectedType = 'feat';
        confidence = 'high';
    }

    const newClassPatterns = [
        /class\s+\w+/g,
        /export\s+default\s+function\s+\w+/g,
        /export\s+(const|let|var)\s+\w+\s*=\s*\([^)]*\)\s*=>/g,
        /export\s+(const|let|var)\s+\w+\s*=\s*React\.Component/g
    ];

    let newClassCount = 0;
    for (const pattern of newClassPatterns) {
        const matches = addedContent.match(pattern);
        if (matches) {
            newClassCount += matches.length;
        }
    }
    if (newClassCount > 0) {
        astFeatures.push(`新增 ${newClassCount} 个类/组件`);
        if (!detectedType) {
            detectedType = 'feat';
            confidence = 'high';
        }
    }

    const cssPatterns = [
        /\bcolor\s*:/gi,
        /\bmargin\s*:/gi,
        /\bpadding\s*:/gi,
        /\bdisplay\s*:/gi,
        /\bwidth\s*:/gi,
        /\bheight\s*:/gi,
        /\bfont-size\s*:/gi,
        /\bbackground(-color)?\s*:/gi,
        /\bborder\s*:/gi,
        /\bposition\s*:/gi,
        /\bflex(-grow|-shrink|-basis)?\s*:/gi,
        /\bgrid(-template|-area|-column|-row)?\s*:/gi
    ];

    let cssMatchCount = 0;
    for (const pattern of cssPatterns) {
        const matches = diffContent.match(pattern);
        if (matches) {
            cssMatchCount += matches.length;
        }
    }
    if (cssMatchCount >= 3) {
        astFeatures.push(`检测到 ${cssMatchCount} 处 CSS 样式变更`);
        detectedType = 'style';
        confidence = 'high';
    }

    if (removedLines.length > 0 && addedLines.length === 0) {
        astFeatures.push(`删除 ${removedLines.length} 行代码`);
        if (!detectedType) {
            detectedType = 'refactor';
            confidence = 'medium';
        }
    }

    if (addedLines.length > 0 && removedLines.length > 0 && !detectedType) {
        const totalChanges = addedLines.length + removedLines.length;
        if (totalChanges > 10) {
            astFeatures.push(`修改 ${totalChanges} 行代码`);
            detectedType = 'refactor';
            confidence = 'medium';
        } else {
            astFeatures.push(`小幅度修改 (${totalChanges} 行)`);
            detectedType = 'fix';
            confidence = 'low';
        }
    }

    if (astFeatures.length > 0) {
        reason = `AST 分析：${astFeatures.join(', ')}`;
    } else {
        reason = '未检测到明显的 AST 结构变更';
        confidence = 'low';
    }

    return {
        type: detectedType,
        confidence,
        reason,
        astFeatures
    };
}

/**
 * 分析 diff 内容判断 commit 类型
 * @param {string} diffContent diff 内容
 * @returns {{type: string, confidence: string, matchedKeywords: string[], reason: string}} 分析结果
 */
function analyzeDiffContent(diffContent) {
    if (!diffContent || diffContent.length === 0) {
        return {
            type: 'chore',
            confidence: 'low',
            matchedKeywords: [],
            reason: '无 diff 内容'
        };
    }

    const lowerContent = diffContent.toLowerCase();
    
    let fixScore = 0;
    let featScore = 0;
    const fixMatched = [];
    const featMatched = [];

    for (const keyword of FIX_KEYWORDS) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerContent.match(regex);
        if (matches) {
            fixScore += matches.length;
            fixMatched.push(keyword);
        }
    }

    for (const keyword of FEAT_KEYWORDS) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerContent.match(regex);
        if (matches) {
            featScore += matches.length;
            featMatched.push(keyword);
        }
    }

    let type = 'chore';
    let confidence = 'low';
    let reason = '';

    if (fixScore > 0 && fixScore > featScore) {
        type = 'fix';
        confidence = fixScore >= 3 ? 'high' : 'medium';
        reason = `检测到 fix 关键词: ${[...new Set(fixMatched)].join(', ')}`;
    } else if (featScore > 0 && featScore > fixScore) {
        type = 'feat';
        confidence = featScore >= 3 ? 'high' : 'medium';
        reason = `检测到 feat 关键词: ${[...new Set(featMatched)].join(', ')}`;
    } else if (fixScore > 0 && fixScore === featScore) {
        type = 'fix';
        confidence = 'low';
        reason = 'fix 和 feat 关键词数量相同，优先选择 fix';
    } else {
        reason = '未检测到明确的 fix 或 feat 关键词';
    }

    return {
        type,
        confidence,
        matchedKeywords: [...new Set([...fixMatched, ...featMatched])],
        reason
    };
}

/**
 * 智能分析文件变更、diff 内容和 AST 结构，推荐 Commit 类型
 * @param {Array<{files: string[], raw: string}>} changedFiles 变更文件列表
 * @param {string} diffContent diff 内容
 * @returns {{type: string, confidence: string, matchedKeywords: string[], reason: string, fileType: string, astFeatures: string[]}} 综合分析结果
 */
function analyzeCommitType(changedFiles, diffContent = null) {
    if (!changedFiles || changedFiles.length === 0) {
        return {
            type: null,
            confidence: 'low',
            matchedKeywords: [],
            reason: '无变更文件',
            fileType: 'unknown',
            astFeatures: []
        };
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

    let fileType = 'unknown';

    for (const change of changedFiles) {
        const filePath = change.raw;
        const fileName = filePath.split(/[/\\]/).pop();
        const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() : '';
        const baseName = fileName.toLowerCase();

        if (['.css', '.scss', '.less', '.sass'].includes(ext)) {
            typeCounts.style++;
            fileType = 'style';
            continue;
        }

        if (baseName.match(/(\.test\.js|\.spec\.js|^test_.+\.js$)/)) {
            typeCounts.test++;
            fileType = 'test';
            continue;
        }

        if (['.md', '.txt'].includes(ext) && !baseName.includes('changelog')) {
            typeCounts.docs++;
            fileType = 'docs';
            continue;
        }

        if (ext === '.json' && !baseName.includes('package')) {
            typeCounts.chore++;
            continue;
        }

        if (baseName === 'package.json' || baseName === 'package-lock.json') {
            typeCounts.build++;
            fileType = 'build';
            continue;
        }

        if (baseName === '.gitignore' || baseName === '.editorconfig') {
            typeCounts.chore++;
            continue;
        }

        if (filePath.includes('.github/') || baseName === '.gitlab-ci.yml' || baseName === 'jenkinsfile') {
            typeCounts.ci++;
            fileType = 'ci';
            continue;
        }

        if (baseName.startsWith('.env') || filePath.includes('/config/') || filePath.includes('\\config\\')) {
            typeCounts.chore++;
            continue;
        }

        if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
            typeCounts.feat++;
            fileType = 'code';
            continue;
        }

        typeCounts.chore++;
    }

    let astResult = null;
    if (diffContent) {
        astResult = analyzeASTChange(diffContent);
    }

    let diffResult = null;
    if (diffContent) {
        diffResult = analyzeDiffContent(diffContent);
    }

    let finalType = null;
    let confidence = 'low';
    let matchedKeywords = [];
    let reason = '';
    const astFeatures = astResult?.astFeatures || [];

    if (astResult && astResult.type && astResult.confidence === 'high') {
        finalType = astResult.type;
        confidence = 'high';
        reason = astResult.reason;
    }
    else if (astResult && astResult.type && astResult.confidence === 'medium') {
        if (diffResult && diffResult.matchedKeywords.length > 0) {
            if (diffResult.confidence === 'high') {
                finalType = diffResult.type;
                confidence = 'high';
                reason = diffResult.reason;
            } else {
                finalType = astResult.type;
                confidence = 'medium';
                reason = `${astResult.reason}; ${diffResult.reason}`;
            }
        } else {
            finalType = astResult.type;
            confidence = 'medium';
            reason = astResult.reason;
        }
        matchedKeywords = diffResult?.matchedKeywords || [];
    }
    else if (diffResult && diffResult.matchedKeywords.length > 0) {
        finalType = diffResult.type;
        confidence = diffResult.confidence;
        reason = diffResult.reason;
        matchedKeywords = diffResult.matchedKeywords;
    }
    else {
        let maxFileType = null;
        let maxFileCount = 0;
        for (const [type, count] of Object.entries(typeCounts)) {
            if (count > maxFileCount) {
                maxFileCount = count;
                maxFileType = type;
            }
        }
        finalType = maxFileType;
        reason = `基于文件类型分析：${maxFileType} (${maxFileCount} 个文件)`;
        confidence = maxFileCount >= 3 ? 'medium' : 'low';
    }

    return {
        type: finalType,
        confidence,
        matchedKeywords,
        reason,
        fileType,
        astFeatures
    };
}

/**
 * 智能检测 Commit 类型
 * 自动分析当前 Git 变更和 diff 内容，推荐合适的 Commit 类型
 */
async function generateSmartCommit() {
    const config = vscode.workspace.getConfiguration('gitCommitSaoHua');
    const defaultStyle = config.get('defaultStyle', 'sao');
    const defaultType = config.get('defaultType', 'feat');
    const autoInsert = config.get('autoInsert', true);

    const initialStyle = currentStyle || defaultStyle;
    const initialType = currentType || defaultType;

    // 显示正在分析的状态
    vscode.window.setStatusBarMessage('🔍 正在智能分析变更文件和 diff 内容...', 2000);

    // 获取变更文件和 diff 内容
    const changedFiles = await getChangedFiles();
    const diffContent = await getDiffContent();

    if (!changedFiles || changedFiles.length === 0) {
        vscode.window.showWarningMessage('未检测到 Git 变更文件，将使用手动选择模式');
        return await showSaoHuaGenerator();
    }

    // 智能分析 Commit 类型（结合文件和 diff 内容）
    const analysisResult = analyzeCommitType(changedFiles, diffContent);
    
    if (!analysisResult || !analysisResult.type) {
        vscode.window.showWarningMessage('智能检测失败，将使用手动选择模式');
        return await showSaoHuaGenerator();
    }

    currentType = analysisResult.type;
    await persistPreferences();

    // 显示详细的智能检测信息
    const confidenceEmoji = analysisResult.confidence === 'high' ? '🎯' : 
                           analysisResult.confidence === 'medium' ? '✨' : '💡';
    const detailMessage = [
        `类型: ${analysisResult.type}`,
        `置信度: ${analysisResult.confidence}`,
        `分析: ${analysisResult.reason}`,
        analysisResult.astFeatures && analysisResult.astFeatures.length > 0 
            ? `AST: ${analysisResult.astFeatures.join(', ')}` 
            : ''
    ].filter(Boolean).join('\n');

    vscode.window.showInformationMessage(
        `${confidenceEmoji} 智能检测推荐类型: ${analysisResult.type}`,
        { modal: false, detail: detailMessage }
    );
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

    let message;
    let usedCustom = false;
    if (shouldUseCustomSaoHua()) {
        const customMessage = generateCustomSaoHuaMessage();
        if (customMessage) {
            message = customMessage;
            usedCustom = true;
        }
    }
    if (!message) {
        message = generateCommitMessage(currentType, currentStyle, description);
    }

    const customLabel = usedCustom ? ' (自定义)' : '';
    const customEmoji = usedCustom ? '✨ ' : '';

    if (autoInsert) {
        const confidenceEmoji = analysisResult.confidence === 'high' ? '🎯' : 
                               analysisResult.confidence === 'medium' ? '✨' : '💡';
        const result = await vscode.window.showInformationMessage(
            `${customEmoji}生成成功！类型: ${currentType}${customLabel} ${confidenceEmoji} (智能推荐/${analysisResult.confidence})`,
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
        const confidenceEmoji = analysisResult.confidence === 'high' ? '🎯' : 
                               analysisResult.confidence === 'medium' ? '✨' : '💡';
        await vscode.window.showInformationMessage(
            `${customEmoji}已复制到剪贴板！类型: ${currentType}${customLabel} ${confidenceEmoji} (智能推荐/${analysisResult.confidence})`,
            { modal: true, detail: message }
        );
    }

    await recordGeneration(currentType, currentStyle);
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

        let message;
        let usedCustom = false;
        let result;

        if (shouldUseCustomSaoHua()) {
            const customMessage = generateCustomSaoHuaMessage();
            if (customMessage) {
                message = customMessage;
                usedCustom = true;
                const customSaoHua = getRandomCustomSaoHua();
                if (customSaoHua) {
                    currentType = customSaoHua.type;
                    currentStyle = customSaoHua.style;
                    result = { type: customSaoHua.type, style: customSaoHua.style };
                }
            }
        }

        if (!message) {
            result = getRandomSaoHua();
            currentType = result.type;
            currentStyle = result.style;
            await persistPreferences();
            message = generateCommitMessage(result.type, result.style);
        } else {
            await persistPreferences();
        }

        const typeLabel = usedCustom ? `${result.type} (自定义)` : `${result.type}`;

        if (autoInsert) {
            await vscode.window.showInformationMessage(`随机生成: ${typeLabel} ${usedCustom ? '✨' : ''}`, {
                modal: true,
                detail: message
            });
            playSoundEffect('success');
            await insertToGitInput(message, true);
        } else {
            await vscode.env.clipboard.writeText(message);
            playSoundEffect('copy');
            await vscode.window.showInformationMessage(`已复制到剪贴板！类型: ${typeLabel} ${usedCustom ? '✨' : ''}`, {
                modal: true,
                detail: message
            });
        }

        if (result) {
            await recordGeneration(result.type, result.style);
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

    const manageCustomSaoHuaCommand = vscode.commands.registerCommand('gitCommitSaoHua.manageCustomSaoHua', async () => {
        await showCustomSaoHuaManager();
    });

    const addCustomSaoHuaCommand = vscode.commands.registerCommand('gitCommitSaoHua.addCustomSaoHua', async () => {
        await addSingleCustomSaoHua();
    });

    const clearCustomSaoHuaCommand = vscode.commands.registerCommand('gitCommitSaoHua.clearCustomSaoHua', async () => {
        const list = getCustomSaoHuaList();
        if (list.length === 0) {
            vscode.window.showInformationMessage('暂无自定义骚话');
            return;
        }

        const result = await vscode.window.showWarningMessage(
            `确定要清空所有 ${list.length} 条自定义骚话吗？`,
            { modal: true },
            '确定清空',
            '取消'
        );

        if (result === '确定清空') {
            await clearAllCustomSaoHua();
            vscode.window.showInformationMessage('已清空所有自定义骚话');
        }
    });

    const showStatisticsCommand = vscode.commands.registerCommand('gitCommitSaoHua.showStatistics', async () => {
        await showStatistics();
    });

    context.subscriptions.push(generateCommand);
    context.subscriptions.push(generateSmartCommand);
    context.subscriptions.push(generateRandomCommand);
    context.subscriptions.push(selectTypeCommand);
    context.subscriptions.push(selectStyleCommand);
    context.subscriptions.push(resetPreferencesCommand);
    context.subscriptions.push(clearDescriptionHistoryCommand);
    context.subscriptions.push(openKeybindingsCommand);
    context.subscriptions.push(manageCustomSaoHuaCommand);
    context.subscriptions.push(addCustomSaoHuaCommand);
    context.subscriptions.push(clearCustomSaoHuaCommand);
    context.subscriptions.push(showStatisticsCommand);
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

    let message;
    let usedCustom = false;
    if (shouldUseCustomSaoHua()) {
        const customMessage = generateCustomSaoHuaMessage();
        if (customMessage) {
            message = customMessage;
            usedCustom = true;
        }
    }
    if (!message) {
        message = generateCommitMessage(currentType, currentStyle, description);
    }

    const customLabel = usedCustom ? ' (自定义)' : '';
    const customEmoji = usedCustom ? '✨ ' : '';

    playSoundEffect('generate');

    if (autoInsert) {
        const result = await vscode.window.showInformationMessage(
            `${customEmoji}生成成功！类型: ${currentType}${customLabel}`,
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
            `${customEmoji}已复制到剪贴板！类型: ${currentType}${customLabel}`,
            { modal: true, detail: message }
        );
    }

    await recordGeneration(currentType, currentStyle);
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

/**
 * 获取自定义骚话列表
 * @returns {Array<{type: string, style: string, content: string}>} 自定义骚话列表
 */
function getCustomSaoHuaList() {
    return extensionContext?.workspaceState.get(STATE_KEYS.customSaoHua) || [];
}

/**
 * 保存自定义骚话列表
 * @param {Array} list 自定义骚话列表
 */
async function saveCustomSaoHuaList(list) {
    if (!extensionContext) {
        return;
    }
    await extensionContext.workspaceState.update(STATE_KEYS.customSaoHua, list);
}

/**
 * 添加单条自定义骚话
 * @param {string} type Commit 类型
 * @param {string} style 风格
 * @param {string} content 骚话内容
 */
async function addCustomSaoHua(type, style, content) {
    const list = getCustomSaoHuaList();
    list.push({
        type,
        style,
        content,
        addedAt: Date.now()
    });
    await saveCustomSaoHuaList(list);
}

/**
 * 删除自定义骚话
 * @param {number} index 要删除的索引
 */
async function deleteCustomSaoHua(index) {
    const list = getCustomSaoHuaList();
    if (index >= 0 && index < list.length) {
        list.splice(index, 1);
        await saveCustomSaoHuaList(list);
    }
}

/**
 * 清空所有自定义骚话
 */
async function clearAllCustomSaoHua() {
    await saveCustomSaoHuaList([]);
}

/**
 * 导出自定义骚话
 * @returns {string} JSON 格式的导出数据
 */
function exportCustomSaoHua() {
    const list = getCustomSaoHuaList();
    return JSON.stringify(list, null, 2);
}

/**
 * 导入自定义骚话
 * @param {string} jsonData JSON 格式的导入数据
 * @returns {{success: boolean, count: number, message: string}} 导入结果
 */
async function importCustomSaoHua(jsonData) {
    try {
        const importedList = JSON.parse(jsonData);
        if (!Array.isArray(importedList)) {
            return { success: false, count: 0, message: '数据格式错误：不是数组' };
        }

        const validItems = importedList.filter(item => 
            item.type && item.style && item.content && 
            commitTypes.some(t => t.value === item.type) &&
            styles.some(s => s.value === item.style)
        );

        const existingList = getCustomSaoHuaList();
        const newList = [...existingList, ...validItems];
        await saveCustomSaoHuaList(newList);

        return { 
            success: true, 
            count: validItems.length, 
            message: `成功导入 ${validItems.length} 条自定义骚话` 
        };
    } catch (error) {
        return { success: false, count: 0, message: `导入失败: ${error.message}` };
    }
}

/**
 * 随机获取自定义骚话
 * @returns {{type: string, style: string, content: string}|null} 随机自定义骚话或 null
 */
function getRandomCustomSaoHua() {
    const list = getCustomSaoHuaList();
    if (list.length === 0) {
        return null;
    }
    return list[Math.floor(Math.random() * list.length)];
}

/**
 * 生成自定义骚话 Commit 消息
 * @returns {string} Commit 消息
 */
function generateCustomSaoHuaMessage() {
    const customSaoHua = getRandomCustomSaoHua();
    if (!customSaoHua) {
        return null;
    }
    return generateCommitMessage(customSaoHua.type, customSaoHua.style, customSaoHua.content);
}

/**
 * 检查是否应使用自定义骚话（30% 概率）
 * @returns {boolean} 是否使用自定义骚话
 */
function shouldUseCustomSaoHua() {
    const list = getCustomSaoHuaList();
    if (list.length === 0) {
        return false;
    }
    return Math.random() < CUSTOM_SAO_HUA_PROBABILITY;
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

/**
 * 显示自定义骚话管理界面
 */
async function showCustomSaoHuaManager() {
    const list = getCustomSaoHuaList();
    
    const actionItems = [
        { label: '$(add) 添加自定义骚话', description: '添加新的自定义骚话', value: 'add' },
        { label: '$(list) 查看自定义骚话', description: `查看已添加的 ${list.length} 条骚话`, value: 'view' },
        { label: '$(arrow-down) 导入自定义骚话', description: '从 JSON 文件导入', value: 'import' },
        { label: '$(arrow-up) 导出自定义骚话', description: '导出为 JSON 文件', value: 'export' },
        { label: '$(trash) 清空所有自定义骚话', description: `删除全部 ${list.length} 条记录`, value: 'clear' }
    ];

    const selected = await vscode.window.showQuickPick(actionItems, {
        placeHolder: '选择操作',
        ignoreFocusOut: true
    });

    if (!selected) {
        return;
    }

    switch (selected.value) {
        case 'add':
            await addSingleCustomSaoHua();
            break;
        case 'view':
            await viewCustomSaoHuaList();
            break;
        case 'import':
            await importCustomSaoHuaFromFile();
            break;
        case 'export':
            await exportCustomSaoHuaToFile();
            break;
        case 'clear':
            const confirmResult = await vscode.window.showWarningMessage(
                `确定要清空所有 ${list.length} 条自定义骚话吗？`,
                { modal: true },
                '确定清空',
                '取消'
            );
            if (confirmResult === '确定清空') {
                await clearAllCustomSaoHua();
                vscode.window.showInformationMessage('已清空所有自定义骚话');
            }
            break;
    }
}

/**
 * 添加单条自定义骚话
 */
async function addSingleCustomSaoHua() {
    const typeItems = commitTypes.map(t => ({
        label: t.label,
        description: t.desc,
        value: t.value
    }));

    const selectedType = await vscode.window.showQuickPick(typeItems, {
        placeHolder: '选择 Commit 类型',
        ignoreFocusOut: true
    });

    if (!selectedType) {
        return;
    }

    const styleItems = styles.map(s => ({
        label: `${s.emoji} ${s.label}`,
        value: s.value
    }));

    const selectedStyle = await vscode.window.showQuickPick(styleItems, {
        placeHolder: '选择风格模式',
        ignoreFocusOut: true
    });

    if (!selectedStyle) {
        return;
    }

    const content = await vscode.window.showInputBox({
        placeHolder: '输入自定义骚话内容',
        prompt: '例如：这是我为你写的专属骚话',
        validateInput: (value) => {
            if (!value || value.trim().length === 0) {
                return '请输入内容';
            }
            if (value.length > 100) {
                return '内容不能超过 100 个字符';
            }
            return null;
        }
    });

    if (!content) {
        return;
    }

    await addCustomSaoHua(selectedType.value, selectedStyle.value, content.trim());
    vscode.window.showInformationMessage(`已添加自定义骚话: ${selectedType.value}/${selectedStyle.value}`);
}

/**
 * 查看自定义骚话列表
 */
async function viewCustomSaoHuaList() {
    const list = getCustomSaoHuaList();
    
    if (list.length === 0) {
        vscode.window.showInformationMessage('暂无自定义骚话，请先添加');
        return;
    }

    const items = list.map((item, index) => ({
        label: `${index + 1}. ${item.type}/${item.style}`,
        description: item.content.substring(0, 50) + (item.content.length > 50 ? '...' : ''),
        detail: `添加时间: ${new Date(item.addedAt).toLocaleString()}`,
        value: index
    }));

    const viewOrDelete = await vscode.window.showQuickPick([
        { label: '$(eye) 查看/删除', description: '查看列表并删除', value: 'view' },
        { label: '$(clippy) 复制全部', description: '复制所有自定义骚话为 JSON', value: 'copy' }
    ], {
        placeHolder: '选择操作',
        ignoreFocusOut: true
    });

    if (!viewOrDelete) {
        return;
    }

    if (viewOrDelete.value === 'view') {
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '选择要删除的骚话',
            ignoreFocusOut: true
        });

        if (selected) {
            const deleteConfirm = await vscode.window.showWarningMessage(
                '确定要删除这条自定义骚话吗？',
                { modal: true },
                '删除',
                '取消'
            );

            if (deleteConfirm === '删除') {
                await deleteCustomSaoHua(selected.value);
                vscode.window.showInformationMessage('已删除自定义骚话');
            }
        }
    } else if (viewOrDelete.value === 'copy') {
        const jsonContent = exportCustomSaoHua();
        await vscode.env.clipboard.writeText(jsonContent);
        vscode.window.showInformationMessage(`已复制 ${list.length} 条自定义骚话到剪贴板`);
    }
}

/**
 * 从文件导入自定义骚话
 */
async function importCustomSaoHuaFromFile() {
    const options = {
        canSelectMany: false,
        filters: { 'JSON Files': ['json'] },
        title: '选择要导入的 JSON 文件'
    };

    const fileUri = await vscode.window.showOpenDialog(options);

    if (!fileUri || fileUri.length === 0) {
        return;
    }

    try {
        const doc = await vscode.workspace.openTextDocument(fileUri[0]);
        const jsonContent = doc.getText();
        const result = await importCustomSaoHua(jsonContent);
        
        if (result.success) {
            vscode.window.showInformationMessage(result.message);
        } else {
            vscode.window.showErrorMessage(result.message);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`导入失败: ${error.message}`);
    }
}

/**
 * 导出自定义骚话到文件
 */
async function exportCustomSaoHuaToFile() {
    const list = getCustomSaoHuaList();
    
    if (list.length === 0) {
        vscode.window.showInformationMessage('暂无自定义骚话可导出');
        return;
    }

    const defaultPath = `custom-sao-hua-${Date.now()}.json`;
    
    const options = {
        defaultUri: vscode.Uri.file(defaultPath),
        filters: { 'JSON Files': ['json'] },
        title: '保存自定义骚话'
    };

    const fileUri = await vscode.window.showSaveDialog(options);

    if (!fileUri) {
        return;
    }

    try {
        const jsonContent = exportCustomSaoHua();
        const writeData = Buffer.from(jsonContent, 'utf8');
        await vscode.workspace.fs.writeFile(fileUri, writeData);
        vscode.window.showInformationMessage(`已导出 ${list.length} 条自定义骚话到 ${fileUri.fsPath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`导出失败: ${error.message}`);
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
