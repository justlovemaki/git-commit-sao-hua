/**
 * Git Commit 骚话生成器 - 主插件文件
 * 
 * 功能特性:
 * - 支持 12 种 Commit 类型 × 5 种风格模式
 * - 智能检测 Git 变更，自动推荐 Commit 类型
 * - AST 代码结构分析，识别函数/类/CSS 变更
 * - 多语言关键词支持（Python/Java/TypeScript/Go/Rust/PHP/Ruby/Swift）
 * - 代码模式检测（Promise/async、错误处理、React Hooks）
 * - 加权评分系统提升检测准确率
 * - 自定义骚话管理，支持导入导出
 * - 使用统计追踪
 * - 快捷设置面板，UI 调节智能检测参数
 * - 智能检测日志记录和准确率分析
 * 
 * @author coding-expert
 * @version 1.17.0
 */

const vscode = require('vscode');
const { commitTypes, styles, getSaoHua, getRandomSaoHua, generateCommitMessage } = require('../lib');

// ==================== 常量定义 ====================

/**
 * Commit 类型关键词映射
 * 用于通过 diff 内容智能识别 Commit 类型
 */
const FIX_KEYWORDS = ['fix', 'bug', 'issue', 'error', 'crash', 'resolve', 'patch'];
const FEAT_KEYWORDS = ['add', 'new', 'create', 'implement', 'feature', 'support'];

const PYTHON_KEYWORDS = ['def ', 'class ', 'import ', 'from '];
const JAVA_KEYWORDS = ['public ', 'private ', 'protected ', 'class ', 'interface ', 'fun '];
const TYPESCRIPT_KEYWORDS = ['interface ', 'type ', 'enum ', 'namespace '];
const GO_KEYWORDS = ['func ', 'package ', 'import ', 'var ', 'const ', 'type ', 'struct ', 'interface '];
const RUST_KEYWORDS = ['fn ', 'mod ', 'pub ', 'impl ', 'trait ', 'struct ', 'enum ', 'let ', 'mut '];
const PHP_KEYWORDS = ['function ', 'class ', 'public ', 'private ', 'protected ', 'use ', 'namespace ', 'trait '];
const RUBY_KEYWORDS = ['def ', 'class ', 'module ', 'include ', 'extend ', 'attr_reader', 'attr_writer', 'attr_accessor'];
const SWIFT_KEYWORDS = ['func ', 'class ', 'struct ', 'enum ', 'protocol ', 'extension ', 'var ', 'let ', 'import '];

/**
 * 代码模式检测关键词
 * 用于检测特定类型的代码变更
 */
const DATABASE_PATTERNS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'EXECUTE'];
const API_PATTERNS = ['fetch', 'axios', 'http.get', 'http.post', 'http.put', 'http.delete', 'XMLHttpRequest', '$.ajax'];
const ROUTE_PATTERNS = ['router.get', 'router.post', 'router.put', 'router.delete', '@GetMapping', '@PostMapping', '@Route', 'path:', 'url:'];
const COMPONENT_PATTERNS = ['template:', 'render(', 'h(', 'createElement', 'jsx', '<div>', '<Component>'];
const STYLE_PATTERNS = ['display: flex', 'display: grid', 'animation:', 'transition:', 'transform:', '@keyframes', '@media'];

/**
 * 工作区状态键名
 * 用于持久化用户偏好设置
 */
const STATE_KEYS = {
    type: 'gitCommitSaoHua.currentType',
    style: 'gitCommitSaoHua.currentStyle',
    descriptionHistory: 'gitCommitSaoHua.descriptionHistory',
    customSaoHua: 'gitCommitSaoHua.customSaoHua',
    statistics: 'gitCommitSaoHua.statistics',
    detectionLogs: 'gitCommitSaoHua.detectionLogs'
};

// ==================== Git 扩展管理 ====================

/**
 * Git 扩展管理器
 * 封装 Git 扩展的获取和激活逻辑，避免重复代码
 */
class GitExtensionManager {
    /**
     * 获取并激活 Git 扩展
     * @returns {Promise<{api: any, repo: any}|null>} Git API 和当前仓库，失败返回 null
     */
    static async getGitAPI() {
        try {
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (!gitExtension) {
                console.warn('[GitSaoHua] 未找到 Git 扩展');
                return null;
            }

            if (!gitExtension.isActive) {
                try {
                    await gitExtension.activate();
                    console.log('[GitSaoHua] Git 扩展已激活');
                } catch (e) {
                    console.error('[GitSaoHua] Git 扩展激活失败:', e.message);
                    return null;
                }
            }

            const git = gitExtension.exports.getAPI(1);
            if (!git || !git.repositories || git.repositories.length === 0) {
                console.warn('[GitSaoHua] 未找到 Git 仓库');
                return null;
            }

            const repo = git.repositories[0];
            return { api: git, repo };
        } catch (error) {
            console.error('[GitSaoHua] 获取 Git API 失败:', error);
            return null;
        }
    }

    /**
     * 获取变更文件列表
     * @returns {Promise<Array<{files: string[], raw: string}>|null>} 变更文件列表
     */
    static async getChangedFiles() {
        const git = await this.getGitAPI();
        if (!git) return null;

        const changes = git.repo.state.workingTreeChanges;
        if (!changes || changes.length === 0) {
            return null;
        }

        return changes.map(change => ({
            files: [change.uri.fsPath],
            raw: change.uri.fsPath
        }));
    }

    /**
     * 获取 Git diff 内容
     * @returns {Promise<string|null>} diff 内容
     */
    static async getDiffContent() {
        const git = await this.getGitAPI();
        if (!git) return null;

        try {
            const diff = await git.repo.diff();
            return diff || null;
        } catch (error) {
            console.error('[GitSaoHua] 获取 diff 失败:', error);
            return null;
        }
    }

    /**
     * 插入消息到 Git 输入框
     * @param {string} message 要插入的消息
     * @param {string} reason 失败原因
     */
    static async fallbackToClipboard(message, reason) {
        await vscode.env.clipboard.writeText(message);
        vscode.window.showInformationMessage(`已复制到剪贴板（${reason}）`);
    }
}

// ==================== 配置管理 ====================

/**
 * 插件配置管理器
 * 封装配置读取和默认值管理
 */
class ConfigManager {
    /**
     * 获取配置项
     * @template T
     * @param {string} key 配置键名
     * @param {T} defaultValue 默认值
     * @returns {T} 配置值
     */
    static get(key, defaultValue) {
        const config = vscode.workspace.getConfiguration('gitCommitSaoHua');
        return config.get(key, defaultValue);
    }

    /**
     * 获取所有配置默认值
     * @returns {Object} 配置默认值对象
     */
    static getDefaults() {
        return {
            defaultStyle: 'sao',
            defaultType: 'feat',
            autoInsert: true,
            enableSoundEffects: true,
            customSaoHuaProbability: 0.3,
            maxHistoryCount: 10,
            enableSmartDetection: true,
            astAnalysisEnabled: true,
            showConfidenceDetail: true,
            enableDetectionLogging: true,
            smartDetection: {
                highConfidenceThreshold: 3,
                mediumConfidenceThreshold: 1,
                astPriorityEnabled: true,
                diffPriorityEnabled: true
            }
        };
    }

    static getSmartDetectionConfig() {
        return {
            highConfidenceThreshold: this.get('smartDetection.highConfidenceThreshold', 3),
            mediumConfidenceThreshold: this.get('smartDetection.mediumConfidenceThreshold', 1),
            astPriorityEnabled: this.get('smartDetection.astPriorityEnabled', true),
            diffPriorityEnabled: this.get('smartDetection.diffPriorityEnabled', true)
        };
    }
}

// ==================== 状态管理 ====================

/**
 * 插件全局状态
 */
const PluginState = {
    currentType: 'feat',
    currentStyle: 'sao',
    extensionContext: null
};

/**
 * 获取使用统计数据
 * @returns {Object} 统计数据对象
 */
function getStatistics() {
    return PluginState.extensionContext?.workspaceState.get(STATE_KEYS.statistics) || {
        totalCount: 0,
        typeUsage: {},
        styleUsage: {},
        lastGeneratedAt: null
    };
}

/**
 * 保存统计数据
 * @param {Object} stats 统计数据
 */
async function saveStatistics(stats) {
    if (!PluginState.extensionContext) return;
    await PluginState.extensionContext.workspaceState.update(STATE_KEYS.statistics, stats);
}

/**
 * 记录生成事件
 * @param {string} type Commit 类型
 * @param {string} style 风格
 */
async function recordGeneration(type, style) {
    const stats = getStatistics();
    stats.totalCount += 1;
    stats.typeUsage[type] = (stats.typeUsage[type] || 0) + 1;
    stats.styleUsage[style] = (stats.styleUsage[style] || 0) + 1;
    stats.lastGeneratedAt = Date.now();
    await saveStatistics(stats);
}

/**
 * 重置统计数据
 */
async function resetStatistics() {
    await saveStatistics({
        totalCount: 0,
        typeUsage: {},
        styleUsage: {},
        lastGeneratedAt: null
    });
}

// ==================== 检测日志管理 ====================

const MAX_DETECTION_LOGS = 50;

/**
 * 获取检测日志列表
 * @returns {Array} 检测日志数组
 */
function getDetectionLogs() {
    return PluginState.extensionContext?.workspaceState.get(STATE_KEYS.detectionLogs) || [];
}

/**
 * 保存检测日志列表
 * @param {Array} logs 检测日志数组
 */
async function saveDetectionLogs(logs) {
    if (!PluginState.extensionContext) return;
    await PluginState.extensionContext.workspaceState.update(STATE_KEYS.detectionLogs, logs);
}

/**
 * 添加检测日志
 * @param {Object} logData 日志数据
 */
async function addDetectionLog(logData) {
    if (!ConfigManager.get('enableDetectionLogging', true)) return;
    
    const logs = getDetectionLogs();
    logs.unshift({
        timestamp: Date.now(),
        ...logData
    });
    
    if (logs.length > MAX_DETECTION_LOGS) {
        logs.length = MAX_DETECTION_LOGS;
    }
    
    await saveDetectionLogs(logs);
}

/**
 * 清空检测日志
 */
async function clearDetectionLogs() {
    await saveDetectionLogs([]);
}

/**
 * 分析检测准确率
 * @returns {Object} 准确率分析结果
 */
function analyzeDetectionAccuracy() {
    const logs = getDetectionLogs();
    
    if (logs.length === 0) {
        return {
            totalCount: 0,
            adoptedCount: 0,
            skippedCount: 0,
            modifiedCount: 0,
            adoptionRate: 0,
            message: '暂无检测日志'
        };
    }
    
    const adoptedCount = logs.filter(log => log.userChoice === 'adopted').length;
    const skippedCount = logs.filter(log => log.userChoice === 'skipped').length;
    const modifiedCount = logs.filter(log => log.userChoice === 'modified').length;
    const totalCount = logs.length;
    const adoptionRate = totalCount > 0 ? (adoptedCount / totalCount * 100).toFixed(1) : 0;
    
    return {
        totalCount,
        adoptedCount,
        skippedCount,
        modifiedCount,
        adoptionRate,
        logs: logs.slice(0, 10)
    };
}

/**
 * 显示检测日志
 */
async function showDetectionLogs() {
    const logs = getDetectionLogs();
    
    if (logs.length === 0) {
        vscode.window.showInformationMessage('暂无检测日志');
        return;
    }
    
    const logItems = logs.map((log, index) => {
        const time = new Date(log.timestamp).toLocaleString('zh-CN');
        const choiceLabel = {
            adopted: '✓ 采纳',
            skipped: '→ 跳过',
            modified: '✎ 修改'
        }[log.userChoice] || '未选择';
        
        const patternStr = log.detectedPatterns 
            ? Object.entries(log.detectedPatterns)
                .filter(([_, patterns]) => patterns.length > 0)
                .map(([key, patterns]) => `${key}: ${patterns.join(', ')}`)
                .join(' | ')
            : 'N/A';
        
        return {
            label: `${index + 1}. [${log.detectedType}] ${choiceLabel}`,
            description: `${log.fileType} | 置信度: ${log.confidence}`,
            detail: `时间: ${time}\nAST: ${log.astFeatures?.join(', ') || 'N/A'}\nDiff: ${log.matchedKeywords?.join(', ') || 'N/A'}\n代码模式: ${patternStr}`,
            timestamp: log.timestamp
        };
    });
    
    const analysis = analyzeDetectionAccuracy();
    
    const options = [
        { label: '📋 最近检测日志', description: `共 ${logs.length} 条记录`, value: 'view' },
        { label: '📊 准确率分析', description: `采纳率: ${analysis.adoptionRate}%`, value: 'analysis' },
        { label: '🗑️ 清空日志', description: '删除所有检测日志', value: 'clear' }
    ];
    
    const selected = await vscode.window.showQuickPick(options, {
        placeHolder: '选择操作',
        ignoreFocusOut: true
    });
    
    if (!selected) return;
    
    switch (selected.value) {
        case 'view':
            const viewSelected = await vscode.window.showQuickPick(logItems, {
                placeHolder: '查看检测日志',
                ignoreFocusOut: true
            });
            if (viewSelected) {
                vscode.window.showInformationMessage(
                    `日志详情：${viewSelected.label}`,
                    { modal: false, detail: viewSelected.detail }
                );
            }
            break;
        case 'analysis':
            await showDetectionAnalysis();
            break;
        case 'clear':
            const confirm = await vscode.window.showWarningMessage(
                '确定要清空所有检测日志吗？',
                { modal: true },
                '确定清空',
                '取消'
            );
            if (confirm === '确定清空') {
                await clearDetectionLogs();
                vscode.window.showInformationMessage('已清空所有检测日志');
            }
            break;
    }
}

/**
 * 显示检测准确率分析
 */
async function showDetectionAnalysis() {
    const analysis = analyzeDetectionAccuracy();
    
    const message = [
        '📊 智能检测准确率分析',
        '',
        '──── 统计概览 ────',
        `总检测次数：${analysis.totalCount}`,
        `✓ 采纳：${analysis.adoptedCount} 次`,
        `→ 跳过：${analysis.skippedCount} 次`,
        `✎ 修改：${analysis.modifiedCount} 次`,
        '',
        '──── 采纳率 ────',
        `${analysis.adoptionRate}%`,
        '',
        analysis.totalCount < 5 ? '💡 提示：检测次数越多，准确率分析越准确' : ''
    ].filter(Boolean).join('\n');
    
    vscode.window.showInformationMessage(message, { modal: false });
}

/**
 * 获取使用频率最高的项目
 * @param {Object} usageObj 使用次数对象
 * @param {number} count 返回数量
 * @returns {Array<[string, number]>} 排序后的数组
 */
function getTopItems(usageObj, count = 3) {
    return Object.entries(usageObj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count);
}

/**
 * 格式化时间戳为友好提示
 * @param {number} timestamp 时间戳
 * @returns {string} 友好的时间描述
 */
function formatLastGeneratedTime(timestamp) {
    if (!timestamp) return '暂无记录';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleString('zh-CN');
}

/**
 * 显示统计信息
 */
async function showStatistics() {
    const stats = getStatistics();
    const totalCount = stats.totalCount || 0;
    const topTypes = getTopItems(stats.typeUsage, 3);
    const topStyles = getTopItems(stats.styleUsage, 3);
    const lastTime = formatLastGeneratedTime(stats.lastGeneratedAt);

    // 构建类型和风格标签映射
    const typeLabels = Object.fromEntries(commitTypes.map(t => [t.value, t.label]));
    const styleLabels = Object.fromEntries(styles.map(s => [s.value, `${s.emoji} ${s.label}`]));

    const statsItems = [
        { label: `$(number) 总生成次数：${totalCount}`, kind: vscode.QuickPickItemKind.Separator },
        { label: `📊 总生成次数`, description: `${totalCount} 次`, kind: vscode.QuickPickItemKind.Default }
    ];

    if (topTypes.length > 0) {
        statsItems.push(
            { label: '', kind: vscode.QuickPickItemKind.Separator },
            { label: `🔥 最常用的 Commit 类型 (Top 3)`, kind: vscode.QuickPickItemKind.Default }
        );
        for (const [type, count] of topTypes) {
            statsItems.push({
                label: `   ${typeLabels[type] || type}`,
                description: `${count} 次`,
                kind: vscode.QuickPickItemKind.Default
            });
        }
    }

    if (topStyles.length > 0) {
        statsItems.push(
            { label: '', kind: vscode.QuickPickItemKind.Separator },
            { label: `✨ 最常用的风格 (Top 3)`, kind: vscode.QuickPickItemKind.Default }
        );
        for (const [style, count] of topStyles) {
            statsItems.push({
                label: `   ${styleLabels[style] || style}`,
                description: `${count} 次`,
                kind: vscode.QuickPickItemKind.Default
            });
        }
    }

    statsItems.push(
        { label: '', kind: vscode.QuickPickItemKind.Separator },
        { label: `🕐 最近生成时间`, description: lastTime, kind: vscode.QuickPickItemKind.Default },
        { label: '', kind: vscode.QuickPickItemKind.Separator },
        { label: `$(trash) 重置统计`, description: '清空所有统计数据', value: 'reset', kind: vscode.QuickPickItemKind.Default }
    );

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

// ==================== AST 分析器 ====================

/**
 * AST 代码结构分析器
 * 分析 diff 内容中的代码结构变更
 */
class ASTAnalyzer {
    /**
     * 分析 diff 内容中的 AST 代码结构变更
     * @param {string} diffContent - git diff 内容
     * @returns {{type: string|null, confidence: string, reason: string, astFeatures: string[]}} - AST 分析结果
     */
    static analyze(diffContent) {
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

        // 提取新增代码行
        const addedLines = diffContent.split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++'));
        const removedLines = diffContent.split('\n').filter(line => line.startsWith('-') && !line.startsWith('---'));
        const addedContent = addedLines.join('\n');

        // 检测新增函数
        const newFunctionCount = this.countPatternMatches(addedContent, [
            /function\s+\w+\s*\(/g,
            /const\s+\w+\s*=\s*(async\s+)?\(/g,
            /let\s+\w+\s*=\s*(async\s+)?\(/g,
            /async\s+function\s+\w+/g,
            /(\w+)\s*:\s*(async\s+)?function/g,
            /(\w+)\s*=\s*(async\s+)?\([^)]*\)\s*=>/g
        ]);

        if (newFunctionCount > 0) {
            astFeatures.push(`新增 ${newFunctionCount} 个函数`);
            detectedType = 'feat';
            confidence = 'high';
        }

        // 检测 import/export 语句变更
        const importExportCount = this.countPatternMatches(addedContent, [
            /import\s+.+\s+from/gi,
            /export\s+default/gi,
            /export\s+(const|let|var)\s+/gi,
            /export\s+\{/gi,
            /export\s+\w+/gi
        ]);

        if (importExportCount > 0) {
            astFeatures.push(`检测到 ${importExportCount} 处 import/export 语句`);
            if (!detectedType) {
                detectedType = 'feat';
                confidence = 'high';
            } else if (detectedType === 'refactor') {
                confidence = 'high';
            }
        }

        // 检测测试文件变更
        const testFilePatterns = /\.(test|spec)\.(js|ts|jsx|tsx)$/i;
        const hasTestChanges = testFilePatterns.test(diffContent) || 
            (addedContent.includes('.test.') || addedContent.includes('.spec.'));

        if (hasTestChanges) {
            astFeatures.push('检测到测试文件变更');
            if (!detectedType) {
                detectedType = 'test';
                confidence = 'medium';
            }
        }

        // 检测新增类/组件
        const newClassCount = this.countPatternMatches(addedContent, [
            /class\s+\w+/g,
            /export\s+default\s+function\s+\w+/g,
            /export\s+(const|let|var)\s+\w+\s*=\s*\([^)]*\)\s*=>/g,
            /export\s+(const|let|var)\s+\w+\s*=\s*React\.Component/g
        ]);

        if (newClassCount > 0) {
            astFeatures.push(`新增 ${newClassCount} 个类/组件`);
            if (!detectedType) {
                detectedType = 'feat';
                confidence = 'high';
            }
        }

        // 检测 CSS 样式变更
        const cssMatchCount = this.countPatternMatches(diffContent, [
            /\bcolor\s*:/gi, /\bmargin\s*:/gi, /\bpadding\s*:/gi,
            /\bdisplay\s*:/gi, /\bwidth\s*:/gi, /\bheight\s*:/gi,
            /\bfont-size\s*:/gi, /\bbackground(-color)?\s*:/gi,
            /\bborder\s*:/gi, /\bposition\s*:/gi,
            /\bflex(-grow|-shrink|-basis)?\s*:/gi,
            /\bgrid(-template|-area|-column|-row)?\s*:/gi
        ]);

        if (cssMatchCount >= 3) {
            astFeatures.push(`检测到 ${cssMatchCount} 处 CSS 样式变更`);
            detectedType = 'style';
            confidence = 'high';
        }

        // 检测纯删除操作
        if (removedLines.length > 0 && addedLines.length === 0) {
            astFeatures.push(`删除 ${removedLines.length} 行代码`);
            if (!detectedType) {
                detectedType = 'refactor';
                confidence = 'medium';
            }
        }

        // 检测修改操作
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

        // 检测 Promise/async 模式
        const asyncPatterns = [
            /\.then\s*\(/g,
            /\.catch\s*\(/g,
            /await\s+/g,
            /async\s+function/g,
            /async\s+\(/g,
            /Promise\.resolve/g,
            /Promise\.reject/g
        ];
        const asyncMatchCount = this.countPatternMatches(addedContent, asyncPatterns);
        if (asyncMatchCount > 0) {
            astFeatures.push(`检测到 ${asyncMatchCount} 处 Promise/async 模式`);
            if (!detectedType) {
                detectedType = 'feat';
                confidence = confidence === 'low' ? 'medium' : confidence;
            }
        }

        // 检测错误处理模式
        const errorPatterns = [
            /try\s*\{/g,
            /catch\s*\(/g,
            /throw\s+new\s+Error/g,
            /throw\s+new\s+\w+Error/g,
            /\.catch\s*\(/g,
            /reject\s*\(/g
        ];
        const errorMatchCount = this.countPatternMatches(addedContent, errorPatterns);
        if (errorMatchCount > 0) {
            astFeatures.push(`检测到 ${errorMatchCount} 处错误处理模式`);
            if (!detectedType) {
                detectedType = 'fix';
                confidence = 'medium';
            } else if (detectedType === 'feat') {
                confidence = 'medium';
            }
        }

        // 检测 React Hooks
        const reactHookPatterns = [
            /useState\s*\(/g,
            /useEffect\s*\(/g,
            /useContext\s*\(/g,
            /useReducer\s*\(/g,
            /useCallback\s*\(/g,
            /useMemo\s*\(/g,
            /useRef\s*\(/g,
            /useLayoutEffect\s*\(/g
        ];
        const hookMatchCount = this.countPatternMatches(addedContent, reactHookPatterns);
        if (hookMatchCount > 0) {
            astFeatures.push(`检测到 ${hookMatchCount} 处 React Hooks`);
            if (!detectedType) {
                detectedType = 'feat';
                confidence = 'high';
            }
        }

        return {
            type: detectedType,
            confidence,
            reason: astFeatures.length > 0 
                ? `AST 分析：${astFeatures.join(', ')}`
                : '未检测到明显的 AST 结构变更',
            astFeatures
        };
    }

    /**
     * 统计多个正则表达式的匹配总数
     * @param {string} content 待匹配内容
     * @param {RegExp[]} patterns 正则表达式数组
     * @returns {number} 匹配总数
     */
    static countPatternMatches(content, patterns) {
        let totalCount = 0;
        for (const pattern of patterns) {
            const matches = content.match(pattern);
            if (matches) {
                totalCount += matches.length;
            }
        }
        return totalCount;
    }
}

// ==================== Diff 分析器 ====================

/**
 * Diff 内容分析器
 * 通过关键词匹配分析 Commit 类型
 */
class DiffAnalyzer {
    /**
     * 分析 diff 内容判断 commit 类型
     * @param {string} diffContent diff 内容
     * @returns {{type: string, confidence: string, matchedKeywords: string[], reason: string}} 分析结果
     */
    static analyze(diffContent) {
        if (!diffContent || diffContent.length === 0) {
            return {
                type: 'chore',
                confidence: 'low',
                matchedKeywords: [],
                reason: '无 diff 内容'
            };
        }

        const lowerContent = diffContent.toLowerCase();
        const smartConfig = ConfigManager.getSmartDetectionConfig();
        const highThreshold = smartConfig.highConfidenceThreshold;
        const mediumThreshold = smartConfig.mediumConfidenceThreshold;
        
        // 统计 fix 和 feat 关键词匹配
        const fixMatched = this.matchKeywords(lowerContent, FIX_KEYWORDS);
        const featMatched = this.matchKeywords(lowerContent, FEAT_KEYWORDS);

        // 统计语言特定关键词
        const pythonMatched = this.matchKeywords(diffContent, PYTHON_KEYWORDS);
        const javaMatched = this.matchKeywords(diffContent, JAVA_KEYWORDS);
        const tsMatched = this.matchKeywords(diffContent, TYPESCRIPT_KEYWORDS);
        const goMatched = this.matchKeywords(diffContent, GO_KEYWORDS);
        const rustMatched = this.matchKeywords(diffContent, RUST_KEYWORDS);
        const phpMatched = this.matchKeywords(diffContent, PHP_KEYWORDS);
        const rubyMatched = this.matchKeywords(diffContent, RUBY_KEYWORDS);
        const swiftMatched = this.matchKeywords(diffContent, SWIFT_KEYWORDS);

        // 代码模式检测
        const detectedPatterns = this.detectCodePatterns(diffContent);

        const fixScore = fixMatched.length;
        const featScore = featMatched.length;
        const pythonScore = pythonMatched.length;
        const javaScore = javaMatched.length;
        const tsScore = tsMatched.length;
        const goScore = goMatched.length;
        const rustScore = rustMatched.length;
        const phpScore = phpMatched.length;
        const rubyScore = rubyMatched.length;
        const swiftScore = swiftMatched.length;

        // 语言特定类型映射
        const langScores = [
            { name: 'Python', score: pythonScore, type: 'feat' },
            { name: 'Java/Kotlin', score: javaScore, type: 'feat' },
            { name: 'TypeScript', score: tsScore, type: 'feat' },
            { name: 'Go', score: goScore, type: 'feat' },
            { name: 'Rust', score: rustScore, type: 'feat' },
            { name: 'PHP', score: phpScore, type: 'feat' },
            { name: 'Ruby', score: rubyScore, type: 'feat' },
            { name: 'Swift', score: swiftScore, type: 'feat' }
        ];

        // 根据匹配结果判断类型
        let type = 'chore';
        let confidence = 'low';
        let reason = '';
        const allMatched = [...fixMatched, ...featMatched];

        const calcConfidence = (score) => {
            if (score >= highThreshold) return 'high';
            if (score >= mediumThreshold) return 'medium';
            return 'low';
        };

        // 检查语言特定关键词
        const highLangScore = langScores.find(l => l.score >= mediumThreshold);
        if (highLangScore && fixScore === 0 && featScore === 0) {
            type = highLangScore.type;
            confidence = calcConfidence(highLangScore.score);
            reason = `检测到 ${highLangScore.name} 特定关键词`;
            allMatched.push(...langScores.filter(l => l.score > 0).flatMap(l => 
                Array(l.score).fill(l.name.toLowerCase())
            ));
        } else if (fixScore > 0 && fixScore > featScore) {
            type = 'fix';
            confidence = calcConfidence(fixScore);
            reason = `检测到 fix 关键词：${[...new Set(fixMatched)].join(', ')}`;
        } else if (featScore > 0 && featScore > fixScore) {
            type = 'feat';
            confidence = calcConfidence(featScore);
            reason = `检测到 feat 关键词：${[...new Set(featMatched)].join(', ')}`;
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
            matchedKeywords: [...new Set(allMatched)],
            reason,
            detectedPatterns
        };
    }

    /**
     * 检测代码模式
     * @param {string} diffContent diff 内容
     * @returns {Object} 检测到的代码模式
     */
    static detectCodePatterns(diffContent) {
        const patterns = {
            database: [],
            api: [],
            route: [],
            component: [],
            style: []
        };

        const addedLines = diffContent.split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++'));
        const addedContent = addedLines.join('\n');

        for (const keyword of DATABASE_PATTERNS) {
            if (addedContent.toLowerCase().includes(keyword.toLowerCase())) {
                patterns.database.push(keyword);
            }
        }

        for (const keyword of API_PATTERNS) {
            if (addedContent.includes(keyword)) {
                patterns.api.push(keyword);
            }
        }

        for (const keyword of ROUTE_PATTERNS) {
            if (addedContent.includes(keyword)) {
                patterns.route.push(keyword);
            }
        }

        for (const keyword of COMPONENT_PATTERNS) {
            if (addedContent.includes(keyword)) {
                patterns.component.push(keyword);
            }
        }

        for (const keyword of STYLE_PATTERNS) {
            if (addedContent.includes(keyword)) {
                patterns.style.push(keyword);
            }
        }

        return patterns;
    }

    /**
     * 匹配关键词
     * @param {string} content 小写内容
     * @param {string[]} keywords 关键词列表
     * @returns {string[]} 匹配到的关键词
     */
    static matchKeywords(content, keywords) {
        const matched = [];
        for (const keyword of keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const matches = content.match(regex);
            if (matches) {
                matched.push(...Array(matches.length).fill(keyword));
            }
        }
        return matched;
    }
}

// ==================== 智能类型检测 ====================

/**
 * 智能 Commit 类型检测器
 * 综合分析文件类型、diff 内容和 AST 结构
 */
class CommitTypeDetector {
    /**
     * 智能分析文件变更、diff 内容和 AST 结构，推荐 Commit 类型
     * @param {Array<{files: string[], raw: string}>} changedFiles 变更文件列表
     * @param {string} diffContent diff 内容
     * @returns {{type: string, confidence: string, matchedKeywords: string[], reason: string, fileType: string, astFeatures: string[]}} 综合分析结果
     */
    static analyze(changedFiles, diffContent = null) {
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

        // 文件类型分析
        const typeCounts = this.analyzeFileTypes(changedFiles);
        
        // AST 分析
        const astResult = ConfigManager.get('astAnalysisEnabled', true) && diffContent
            ? ASTAnalyzer.analyze(diffContent)
            : null;

        // Diff 关键词分析
        const diffResult = diffContent ? DiffAnalyzer.analyze(diffContent) : null;

        // 综合判断最终类型
        return this.makeFinalDecision(typeCounts, astResult, diffResult);
    }

    /**
     * 分析文件类型
     * @param {Array<{files: string[], raw: string}>} changedFiles 变更文件列表
     * @returns {Object} 类型计数字典
     */
    static analyzeFileTypes(changedFiles) {
        const typeCounts = {
            fix: 0, feat: 0, chore: 0, docs: 0, style: 0,
            test: 0, ci: 0, build: 0, refactor: 0
        };

        for (const change of changedFiles) {
            const filePath = change.raw;
            const fileName = filePath.split(/[/\\]/).pop();
            const ext = fileName.includes('.') 
                ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() 
                : '';
            const baseName = fileName.toLowerCase();

            // 样式文件
            if (['.css', '.scss', '.less', '.sass'].includes(ext)) {
                typeCounts.style++;
                continue;
            }

            // 测试文件
            if (baseName.match(/(\.test\.js|\.spec\.js|^test_.+\.js$)/)) {
                typeCounts.test++;
                continue;
            }

            // 文档文件
            if (['.md', '.txt'].includes(ext) && !baseName.includes('changelog')) {
                typeCounts.docs++;
                continue;
            }

            // 配置文件
            if (ext === '.json' && !baseName.includes('package')) {
                typeCounts.chore++;
                continue;
            }

            // 构建配置
            if (baseName === 'package.json' || baseName === 'package-lock.json') {
                typeCounts.build++;
                continue;
            }

            // 编辑器配置
            if (baseName === '.gitignore' || baseName === '.editorconfig') {
                typeCounts.chore++;
                continue;
            }

            // CI/CD 配置
            if (filePath.includes('.github/') || 
                baseName === '.gitlab-ci.yml' || 
                baseName === 'jenkinsfile') {
                typeCounts.ci++;
                continue;
            }

            // 环境变量和配置文件
            if (baseName.startsWith('.env') || filePath.includes('/config/')) {
                typeCounts.chore++;
                continue;
            }

            // 源代码文件
            if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
                typeCounts.feat++;
                continue;
            }

            // Vue 组件
            if (ext === '.vue') {
                typeCounts.feat++;
                continue;
            }

            // Python 代码
            if (ext === '.py') {
                typeCounts.feat++;
                continue;
            }

            // Java / Kotlin 代码
            if (['.java', '.kt'].includes(ext)) {
                typeCounts.feat++;
                continue;
            }

            // Go 代码
            if (ext === '.go') {
                typeCounts.feat++;
                continue;
            }

            // Rust 代码
            if (ext === '.rs') {
                typeCounts.feat++;
                continue;
            }

            // PHP 代码
            if (ext === '.php') {
                typeCounts.feat++;
                continue;
            }

            // Ruby 代码
            if (ext === '.rb') {
                typeCounts.feat++;
                continue;
            }

            // Swift 代码
            if (ext === '.swift') {
                typeCounts.feat++;
                continue;
            }

            // Scala 代码
            if (ext === '.scala') {
                typeCounts.feat++;
                continue;
            }

            // Elixir 代码
            if (['.ex', '.exs'].includes(ext)) {
                typeCounts.feat++;
                continue;
            }

            // Elm 代码
            if (ext === '.elm') {
                typeCounts.feat++;
                continue;
            }

            // Erlang 代码
            if (ext === '.erl') {
                typeCounts.feat++;
                continue;
            }

            // Haskell 代码
            if (ext === '.hs') {
                typeCounts.feat++;
                continue;
            }

            // Clojure 代码
            if (['.clj', '.cljs'].includes(ext)) {
                typeCounts.feat++;
                continue;
            }

            // F# 代码
            if (['.fs', '.fsx'].includes(ext)) {
                typeCounts.feat++;
                continue;
            }

            // OCaml 代码
            if (['.ml', '.mli'].includes(ext)) {
                typeCounts.feat++;
                continue;
            }

            // R 代码
            if (['.r', '.R'].includes(ext)) {
                typeCounts.feat++;
                continue;
            }

            // Objective-C 代码
            if (['.m', '.mm'].includes(ext)) {
                typeCounts.feat++;
                continue;
            }

            // Dart 代码
            if (ext === '.dart') {
                typeCounts.feat++;
                continue;
            }

            // Lua 代码
            if (ext === '.lua') {
                typeCounts.feat++;
                continue;
            }

            // C# 代码
            if (ext === '.cs') {
                typeCounts.feat++;
                continue;
            }

            // 其他文件
            typeCounts.chore++;
        }

        return typeCounts;
    }

    /**
     * 综合判断最终 Commit 类型（加权评分系统）
     * @param {Object} typeCounts 文件类型计数
     * @param {Object|null} astResult AST 分析结果
     * @param {Object|null} diffResult Diff 分析结果
     * @returns {{type: string, confidence: string, matchedKeywords: string[], reason: string, fileType: string, astFeatures: string[], breakdown: Object}}
     */
    static makeFinalDecision(typeCounts, astResult, diffResult) {
        let finalType = null;
        let confidence = 'low';
        let matchedKeywords = [];
        let reason = '';
        const astFeatures = astResult?.astFeatures || [];
        
        const smartConfig = ConfigManager.getSmartDetectionConfig();
        const highThreshold = smartConfig.highConfidenceThreshold;
        const mediumThreshold = smartConfig.mediumConfidenceThreshold;
        const astPriorityEnabled = smartConfig.astPriorityEnabled;
        const diffPriorityEnabled = smartConfig.diffPriorityEnabled;
        
        const breakdown = {
            fileType: { type: null, count: 0, reason: '', score: 0 },
            ast: { type: null, confidence: 'low', reason: '', score: 0 },
            diff: { type: null, confidence: 'low', matchedKeywords: [], reason: '', score: 0 }
        };

        const [maxFileType, maxFileCount] = Object.entries(typeCounts)
            .reduce((max, [type, count]) => count > max[1] ? [type, count] : max, ['', 0]);
        const fileTypeScore = maxFileCount * 0.2;
        breakdown.fileType = {
            type: maxFileType,
            count: maxFileCount,
            score: fileTypeScore,
            reason: `📁 ${maxFileType} (${maxFileCount} 个文件)`
        };

        if (astResult?.type) {
            const astScoreMap = { high: 0.4, medium: 0.25, low: 0.1 };
            const astScore = astScoreMap[astResult.confidence] || 0.1;
            breakdown.ast = {
                type: astResult.type,
                confidence: astResult.confidence,
                score: astScore,
                reason: `🧠 ${astResult.reason}`
            };
        }

        if (diffResult?.matchedKeywords?.length > 0) {
            const diffScoreMap = { high: 0.4, medium: 0.25, low: 0.1 };
            const diffScore = diffScoreMap[diffResult.confidence] || 0.1;
            breakdown.diff = {
                type: diffResult.type,
                confidence: diffResult.confidence,
                score: diffScore,
                matchedKeywords: diffResult.matchedKeywords,
                reason: `📝 ${diffResult.reason}`
            };
        }

        const calcFileTypeConfidence = (count) => {
            if (count >= highThreshold) return 'medium';
            return 'low';
        };

        // 加权评分系统：AST 0.4 + Diff 0.4 + FileType 0.2
        const typeScores = {};
        
        if (astResult?.type) {
            typeScores[astResult.type] = (typeScores[astResult.type] || 0) + (breakdown.ast.score || 0);
        }
        if (diffResult?.type) {
            typeScores[diffResult.type] = (typeScores[diffResult.type] || 0) + (breakdown.diff.score || 0);
        }
        if (maxFileType && maxFileCount > 0) {
            typeScores[maxFileType] = (typeScores[maxFileType] || 0) + fileTypeScore;
        }

        // 找出得分最高的类型
        const sortedTypes = Object.entries(typeScores).sort((a, b) => b[1] - a[1]);
        const topType = sortedTypes[0];
        const topScore = topType ? topType[1] : 0;

        // 检查是否有多个来源指向同一类型（置信度提升）
        const sourcesAgree = [];
        if (astResult?.type) sourcesAgree.push(astResult.type);
        if (diffResult?.type) sourcesAgree.push(diffResult.type);
        if (maxFileCount > 0) sourcesAgree.push(maxFileType);
        
        const typeOccurrences = {};
        for (const t of sourcesAgree) {
            typeOccurrences[t] = (typeOccurrences[t] || 0) + 1;
        }
        const agreementCount = topType ? typeOccurrences[topType[0]] : 0;

        // 根据加权得分和一致性计算最终置信度
        if (astResult?.type && astResult.confidence === 'high' && astPriorityEnabled) {
            finalType = astResult.type;
            confidence = 'high';
            reason = breakdown.ast.reason;
        }
        else if (astResult?.type && astResult.confidence === 'medium') {
            if (diffResult?.matchedKeywords?.length > 0) {
                if (diffResult.confidence === 'high' && diffPriorityEnabled) {
                    finalType = diffResult.type;
                    confidence = 'high';
                    reason = breakdown.diff.reason;
                } else {
                    finalType = astResult.type;
                    confidence = agreementCount >= 2 ? 'high' : 'medium';
                    reason = `${breakdown.ast.reason}; ${breakdown.diff.reason}`;
                }
            } else {
                finalType = astResult.type;
                confidence = 'medium';
                reason = breakdown.ast.reason;
            }
            matchedKeywords = diffResult?.matchedKeywords || [];
        }
        else if (diffResult?.matchedKeywords?.length > 0) {
            finalType = diffResult.type;
            confidence = agreementCount >= 2 ? 'high' : diffResult.confidence;
            reason = breakdown.diff.reason;
            matchedKeywords = diffResult.matchedKeywords;
        }
        else {
            finalType = maxFileType;
            reason = breakdown.fileType.reason;
            confidence = calcFileTypeConfidence(maxFileCount);
        }

        // 如果多个分析来源指向同一类型，提升置信度
        if (agreementCount >= 2 && confidence !== 'high') {
            confidence = confidence === 'low' ? 'medium' : 'high';
        }

        const detectedPatterns = diffResult?.detectedPatterns || {
            database: [],
            api: [],
            route: [],
            component: [],
            style: []
        };

        return {
            type: finalType,
            confidence,
            matchedKeywords,
            reason,
            fileType: 'code',
            astFeatures,
            breakdown,
            weightedScore: topScore,
            detectedPatterns
        };
    }
}

// ==================== 偏好管理 ====================

/**
 * 恢复用户偏好设置
 */
function restorePreferences() {
    const defaults = ConfigManager.getDefaults();
    const savedType = PluginState.extensionContext?.workspaceState.get(STATE_KEYS.type);
    const savedStyle = PluginState.extensionContext?.workspaceState.get(STATE_KEYS.style);

    PluginState.currentType = isValidType(savedType) ? savedType : defaults.defaultType;
    PluginState.currentStyle = isValidStyle(savedStyle) ? savedStyle : defaults.defaultStyle;
}

/**
 * 重置偏好到配置默认值
 */
function resetPreferencesToConfig() {
    const defaults = ConfigManager.getDefaults();
    PluginState.currentType = defaults.defaultType;
    PluginState.currentStyle = defaults.defaultStyle;
}

/**
 * 持久化偏好设置
 */
async function persistPreferences() {
    if (!PluginState.extensionContext) return;
    await PluginState.extensionContext.workspaceState.update(STATE_KEYS.type, PluginState.currentType);
    await PluginState.extensionContext.workspaceState.update(STATE_KEYS.style, PluginState.currentStyle);
}

/**
 * 清除持久化偏好
 */
async function clearPersistedPreferences() {
    if (!PluginState.extensionContext) return;
    await PluginState.extensionContext.workspaceState.update(STATE_KEYS.type, undefined);
    await PluginState.extensionContext.workspaceState.update(STATE_KEYS.style, undefined);
}

/**
 * 验证 Commit 类型是否有效
 * @param {string} type 类型值
 * @returns {boolean} 是否有效
 */
function isValidType(type) {
    return commitTypes.some(item => item.value === type);
}

/**
 * 验证风格是否有效
 * @param {string} styleKey 风格值
 * @returns {boolean} 是否有效
 */
function isValidStyle(styleKey) {
    return styles.some(item => item.value === styleKey);
}

/**
 * 获取风格标签
 * @param {string} styleKey 风格值
 * @returns {string} 风格标签
 */
function getStyleLabel(styleKey) {
    const style = styles.find(s => s.value === styleKey);
    return style ? `${style.emoji} ${style.label}` : styleKey;
}

// ==================== 自定义骚话管理 ====================

/**
 * 获取自定义骚话列表
 * @returns {Array<{type: string, style: string, content: string}>} 自定义骚话列表
 */
function getCustomSaoHuaList() {
    return PluginState.extensionContext?.workspaceState.get(STATE_KEYS.customSaoHua) || [];
}

/**
 * 保存自定义骚话列表
 * @param {Array} list 自定义骚话列表
 */
async function saveCustomSaoHuaList(list) {
    if (!PluginState.extensionContext) return;
    await PluginState.extensionContext.workspaceState.update(STATE_KEYS.customSaoHua, list);
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
        return { success: false, count: 0, message: `导入失败：${error.message}` };
    }
}

/**
 * 随机获取自定义骚话
 * @returns {{type: string, style: string, content: string}|null} 随机自定义骚话或 null
 */
function getRandomCustomSaoHua() {
    const list = getCustomSaoHuaList();
    if (list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
}

/**
 * 生成自定义骚话 Commit 消息
 * @returns {string} Commit 消息
 */
function generateCustomSaoHuaMessage() {
    const customSaoHua = getRandomCustomSaoHua();
    if (!customSaoHua) return null;
    return generateCommitMessage(customSaoHua.type, customSaoHua.style, customSaoHua.content);
}

/**
 * 检查是否应使用自定义骚话
 * @returns {boolean} 是否使用自定义骚话
 */
function shouldUseCustomSaoHua() {
    const list = getCustomSaoHuaList();
    if (list.length === 0) return false;
    const probability = ConfigManager.get('customSaoHuaProbability', 0.3);
    return Math.random() < probability;
}

// ==================== 描述历史管理 ====================

/**
 * 获取描述历史记录
 * @returns {string[]} 描述历史
 */
function getDescriptionHistory() {
    return PluginState.extensionContext?.workspaceState.get(STATE_KEYS.descriptionHistory) || [];
}

/**
 * 保存描述到历史
 * @param {string} description 描述内容
 */
async function saveDescriptionToHistory(description) {
    if (!PluginState.extensionContext || !description) return;

    let history = getDescriptionHistory();
    history = history.filter(d => d !== description);
    history.unshift(description);

    const maxCount = ConfigManager.get('maxHistoryCount', 10);
    if (history.length > maxCount) {
        history = history.slice(0, maxCount);
    }

    await PluginState.extensionContext.workspaceState.update(STATE_KEYS.descriptionHistory, history);
}

/**
 * 清空描述历史
 */
async function clearDescriptionHistory() {
    if (!PluginState.extensionContext) return;
    await PluginState.extensionContext.workspaceState.update(STATE_KEYS.descriptionHistory, []);
}

/**
 * 获取描述（带历史记录）
 * @returns {Promise<string|undefined>} 描述内容
 */
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

    if (!selected) return undefined;

    if (selected.kind === 'history') {
        const pickedDesc = await vscode.window.showQuickPick(historyItems, {
            placeHolder: '选择最近使用的描述',
            ignoreFocusOut: true
        });
        return pickedDesc?.label;
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

/**
 * 提示用户是否添加详细描述
 * @param {string} saoHuaMessage 骚话内容
 * @returns {Promise<string|undefined>} 描述内容或 undefined
 */
async function promptForDescription(saoHuaMessage) {
    const enablePrompt = ConfigManager.get('enableDescriptionPrompt', true);
    if (!enablePrompt) return undefined;

    const options = [
        { label: '$(add) 添加详细描述', description: '为 commit 添加更详细的描述', value: 'add' },
        { label: '$(arrow-right) 跳过', description: '仅使用骚话，不添加描述', value: 'skip' }
    ];

    const selected = await vscode.window.showQuickPick(options, {
        placeHolder: '是否添加详细描述？',
        ignoreFocusOut: true
    });

    if (!selected || selected.value === 'skip') return undefined;

    const description = await vscode.window.showInputBox({
        placeHolder: '输入详细描述（可选）',
        prompt: '例如：实现用户登录功能，包含表单验证和错误处理',
        ignoreFocusOut: true
    });

    if (description) {
        await saveDescriptionToHistory(description);
    }

    return description;
}

/**
 * 组合骚话和描述为完整 commit message
 * @param {string} type Commit 类型
 * @param {string} saoHua 骚话内容
 * @param {string|undefined} description 描述内容
 * @returns {string} 完整的 commit message
 */
function composeCommitMessage(type, saoHua, description) {
    if (description) {
        return `${type}: ${saoHua}\n\n${description}`;
    }
    return `${type}: ${saoHua}`;
}

// ==================== Git 输入框插入 ====================

/**
 * 插入消息到 Git 输入框
 * @param {string} message 消息内容
 * @param {boolean} tryInsert 是否尝试插入
 */
async function insertToGitInput(message, tryInsert = true) {
    if (!tryInsert) {
        await vscode.env.clipboard.writeText(message);
        vscode.window.showInformationMessage('已复制到剪贴板');
        return;
    }

    try {
        const git = await GitExtensionManager.getGitAPI();
        if (!git) {
            await GitExtensionManager.fallbackToClipboard(message, '未找到 Git 扩展');
            return;
        }

        const repos = git.api.repositories;
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
            await GitExtensionManager.fallbackToClipboard(message, '未选择仓库');
            return;
        }

        const inputBox = targetRepo.inputBox;
        if (inputBox) {
            inputBox.value = message;
            vscode.window.showInformationMessage('✓ 已插入到 Git 输入框');
            return;
        }

        await GitExtensionManager.fallbackToClipboard(message, '无法获取 Git 输入框');
    } catch (error) {
        console.error('[GitSaoHua] 插入到 Git 失败:', error);
        await GitExtensionManager.fallbackToClipboard(message, '插入失败');
    }
}

/**
 * 选择仓库
 * @param {Array} repos 仓库列表
 * @returns {Promise<any|null>} 选中的仓库
 */
async function selectRepository(repos) {
    const items = repos.map(repo => {
        const root = repo.root;
        const parts = root.replace(/\\/g, '/').split('/');
        const name = parts[parts.length - 1] || root;
        const parentPath = parts.slice(0, -1).join('/');
        const branch = repo.state.HEAD ? repo.state.HEAD.name : 'unknown';

        return {
            label: parentPath ? `${name} (${parentPath})` : name,
            description: `分支：${branch}`,
            repo: repo
        };
    });

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: '选择要插入的 Git 仓库',
        ignoreFocusOut: true
    });

    return selected ? selected.repo : null;
}

/**
 * 判断路径是否在仓库内
 * @param {string} filePath 文件路径
 * @param {string} repoRoot 仓库根路径
 * @returns {boolean} 是否在仓库内
 */
function isPathInsideRepo(filePath, repoRoot) {
    const normalizedFilePath = filePath.replace(/\\/g, '/').toLowerCase();
    const normalizedRepoRoot = repoRoot.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
    return normalizedFilePath === normalizedRepoRoot || 
           normalizedFilePath.startsWith(`${normalizedRepoRoot}/`);
}

// ==================== 音效反馈 ====================

/**
 * 播放音效反馈（通过状态栏动画和通知实现）
 * @param {'generate' | 'copy' | 'success'} type 音效类型
 */
function playSoundEffect(type) {
    const enableSoundEffects = ConfigManager.get('enableSoundEffects', true);
    if (!enableSoundEffects) return;

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

    if (type === 'success') {
        vscode.window.showInformationMessage('✨ 骚话生成成功！', { modal: false });
    } else if (type === 'copy') {
        vscode.window.showInformationMessage('📋 已复制到剪贴板', { modal: false });
    }
}

// ==================== 智能生成 ====================

/**
 * 智能检测 Commit 类型并生成
 */
async function generateSmartCommit() {
    const defaultStyle = ConfigManager.get('defaultStyle', 'sao');
    const defaultType = ConfigManager.get('defaultType', 'feat');
    const autoInsert = ConfigManager.get('autoInsert', true);

    const initialStyle = PluginState.currentStyle || defaultStyle;
    const initialType = PluginState.currentType || defaultType;

    vscode.window.setStatusBarMessage('🔍 正在智能分析变更文件和 diff 内容...', 2000);

    const changedFiles = await GitExtensionManager.getChangedFiles();
    const diffContent = await GitExtensionManager.getDiffContent();

    if (!changedFiles || changedFiles.length === 0) {
        vscode.window.showWarningMessage('未检测到 Git 变更文件，将使用手动选择模式');
        return await showSaoHuaGenerator();
    }

    const analysisResult = CommitTypeDetector.analyze(changedFiles, diffContent);
    
    if (!analysisResult || !analysisResult.type) {
        vscode.window.showWarningMessage('智能检测失败，将使用手动选择模式');
        return await showSaoHuaGenerator();
    }

    PluginState.currentType = analysisResult.type;
    await persistPreferences();

    const confidenceEmoji = {
        high: '🎯',
        medium: '✨',
        low: '💡'
    }[analysisResult.confidence] || '💡';

    const { breakdown, detectedPatterns } = analysisResult;
    
    const patternLabels = {
        database: '💾 数据库操作',
        api: '🌐 API/HTTP 请求',
        route: '🛤️ 路由变更',
        component: '🧩 组件/模板',
        style: '🎨 样式布局'
    };
    
    const patternLines = [];
    for (const [key, label] of Object.entries(patternLabels)) {
        const patterns = detectedPatterns?.[key] || [];
        if (patterns.length > 0) {
            patternLines.push(`${label}: ${patterns.join(', ')}`);
        }
    }
    
    const breakdownLines = [];
    if (breakdown?.fileType?.count > 0) {
        breakdownLines.push(breakdown.fileType.reason);
    }
    if (breakdown?.ast?.type) {
        breakdownLines.push(breakdown.ast.reason);
    }
    if (breakdown?.diff?.matchedKeywords?.length > 0) {
        breakdownLines.push(breakdown.diff.reason);
    }

    const detailMessage = [
        `类型：${analysisResult.type} (${analysisResult.confidence})`,
        '',
        '──── 分析链路 ────',
        ...breakdownLines,
        '',
        patternLines.length > 0 ? '──── 代码模式识别 ────' : '',
        ...patternLines,
        '',
        '──── 最终结论 ────',
        analysisResult.reason
    ].filter(Boolean).join('\n');

    vscode.window.showInformationMessage(
        `${confidenceEmoji} 智能检测推荐类型：${analysisResult.type}`,
        { modal: false, detail: detailMessage }
    );

    const feedbackOptions = [
        { label: '✓ 采纳推荐', description: '使用推荐的类型', value: 'adopted' },
        { label: '🔄 手动修改', description: '选择其他类型', value: 'modified' },
        { label: '→ 跳过检测', description: '使用手动选择模式', value: 'skipped' }
    ];

    const userChoice = await vscode.window.showQuickPick(feedbackOptions, {
        placeHolder: '是否采纳智能检测推荐？',
        ignoreFocusOut: true
    });

    let userChoiceResult = 'skipped';
    
    if (!userChoice) {
        return;
    }

    userChoiceResult = userChoice.value;

    const logData = {
        detectedType: analysisResult.type,
        confidence: analysisResult.confidence,
        fileType: analysisResult.fileType,
        astFeatures: analysisResult.astFeatures || [],
        astResult: breakdown?.ast || null,
        diffResult: breakdown?.diff || null,
        breakdown: breakdown,
        userChoice: userChoiceResult,
        matchedKeywords: analysisResult.matchedKeywords || [],
        detectedPatterns: analysisResult.detectedPatterns || null
    };

    await addDetectionLog(logData);

    if (userChoiceResult === 'skipped') {
        return await showSaoHuaGenerator();
    }

    if (userChoiceResult === 'modified') {
        return await showManualTypeSelection(analysisResult.type);
    }

    playSoundEffect('generate');

    const styleItems = styles.map(s => ({
        label: `${s.emoji} ${s.label}`,
        value: s.value,
        picked: s.value === initialStyle
    }));

    const selectedStyle = await vscode.window.showQuickPick(styleItems, {
        placeHolder: '选择风格模式',
        ignoreFocusOut: true
    });

    if (!selectedStyle) return;
    
    PluginState.currentStyle = selectedStyle.value;
    await persistPreferences();

    let saoHuaMessage;
    let usedCustom = false;
    if (shouldUseCustomSaoHua()) {
        const customMessage = generateCustomSaoHuaMessage();
        if (customMessage) {
            saoHuaMessage = customMessage;
            usedCustom = true;
        }
    }
    if (!saoHuaMessage) {
        saoHuaMessage = getSaoHua(PluginState.currentType, PluginState.currentStyle);
    }

    const description = await promptForDescription(saoHuaMessage);
    const message = composeCommitMessage(PluginState.currentType, saoHuaMessage, description);

    const customLabel = usedCustom ? ' (自定义)' : '';
    const customEmoji = usedCustom ? '✨ ' : '';

    if (autoInsert) {
        const result = await vscode.window.showInformationMessage(
            `${customEmoji}生成成功！类型：${PluginState.currentType}${customLabel} ${confidenceEmoji} (智能推荐/${analysisResult.confidence})`,
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
            `${customEmoji}已复制到剪贴板！类型：${PluginState.currentType}${customLabel} ${confidenceEmoji} (智能推荐/${analysisResult.confidence})`,
            { modal: true, detail: message }
        );
    }

    await recordGeneration(PluginState.currentType, PluginState.currentStyle);
}

/**
 * 显示手动类型选择（带预选）
 * @param {string} defaultType 预选的默认类型
 */
async function showManualTypeSelection(defaultType) {
    const defaultStyle = ConfigManager.get('defaultStyle', 'sao');
    const autoInsert = ConfigManager.get('autoInsert', true);
    const initialStyle = PluginState.currentStyle || defaultStyle;

    const typeItems = commitTypes.map(t => ({
        label: t.label,
        description: t.desc,
        value: t.value,
        picked: t.value === defaultType
    }));

    const selectedType = await vscode.window.showQuickPick(typeItems, {
        placeHolder: '选择 Commit 类型',
        ignoreFocusOut: true
    });

    if (!selectedType) return;
    
    PluginState.currentType = selectedType.value;
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

    if (!selectedStyle) return;
    
    PluginState.currentStyle = selectedStyle.value;
    await persistPreferences();

    let saoHuaMessage;
    let usedCustom = false;
    if (shouldUseCustomSaoHua()) {
        const customMessage = generateCustomSaoHuaMessage();
        if (customMessage) {
            saoHuaMessage = customMessage;
            usedCustom = true;
        }
    }
    if (!saoHuaMessage) {
        saoHuaMessage = getSaoHua(PluginState.currentType, PluginState.currentStyle);
    }

    const description = await promptForDescription(saoHuaMessage);
    const message = composeCommitMessage(PluginState.currentType, saoHuaMessage, description);

    const customLabel = usedCustom ? ' (自定义)' : '';
    const customEmoji = usedCustom ? '✨ ' : '';

    playSoundEffect('generate');

    if (autoInsert) {
        const result = await vscode.window.showInformationMessage(
            `${customEmoji}生成成功！类型：${PluginState.currentType}${customLabel}`,
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
            `${customEmoji}已复制到剪贴板！类型：${PluginState.currentType}${customLabel}`,
            { modal: true, detail: message }
        );
    }

    await recordGeneration(PluginState.currentType, PluginState.currentStyle);
}

// ==================== 主生成器 ====================

/**
 * 显示骚话生成器界面
 */
async function showSaoHuaGenerator() {
    const defaultStyle = ConfigManager.get('defaultStyle', 'sao');
    const defaultType = ConfigManager.get('defaultType', 'feat');
    const autoInsert = ConfigManager.get('autoInsert', true);
    const enableSmartDetection = ConfigManager.get('enableSmartDetection', true);

    const initialType = PluginState.currentType || defaultType;
    const initialStyle = PluginState.currentStyle || defaultStyle;

    // 模式选择
    const modeItems = [
        { label: '$(search) 智能检测', description: '自动分析 Git 变更，推荐 Commit 类型', value: 'smart' },
        { label: '$(list-flat) 手动选择', description: '手动选择 Commit 类型', value: 'manual' }
    ];

    const selectedMode = await vscode.window.showQuickPick(modeItems, {
        placeHolder: '选择生成方式',
        ignoreFocusOut: true
    });

    if (!selectedMode) return;

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

    if (!selectedType) return;
    
    PluginState.currentType = selectedType.value;
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

    if (!selectedStyle) return;
    
    PluginState.currentStyle = selectedStyle.value;
    await persistPreferences();

    let saoHuaMessage;
    let usedCustom = false;
    if (shouldUseCustomSaoHua()) {
        const customMessage = generateCustomSaoHuaMessage();
        if (customMessage) {
            saoHuaMessage = customMessage;
            usedCustom = true;
        }
    }
    if (!saoHuaMessage) {
        saoHuaMessage = getSaoHua(PluginState.currentType, PluginState.currentStyle);
    }

    const description = await promptForDescription(saoHuaMessage);
    const message = composeCommitMessage(PluginState.currentType, saoHuaMessage, description);

    const customLabel = usedCustom ? ' (自定义)' : '';
    const customEmoji = usedCustom ? '✨ ' : '';

    playSoundEffect('generate');

    if (autoInsert) {
        const result = await vscode.window.showInformationMessage(
            `${customEmoji}生成成功！类型：${PluginState.currentType}${customLabel}`,
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
            `${customEmoji}已复制到剪贴板！类型：${PluginState.currentType}${customLabel}`,
            { modal: true, detail: message }
        );
    }

    await recordGeneration(PluginState.currentType, PluginState.currentStyle);
}

// ==================== 自定义骚话管理界面 ====================

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

    if (!selected) return;

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
        case 'clear': {
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

    if (!selectedType) return;

    const styleItems = styles.map(s => ({
        label: `${s.emoji} ${s.label}`,
        value: s.value
    }));

    const selectedStyle = await vscode.window.showQuickPick(styleItems, {
        placeHolder: '选择风格模式',
        ignoreFocusOut: true
    });

    if (!selectedStyle) return;

    const content = await vscode.window.showInputBox({
        placeHolder: '输入自定义骚话内容',
        prompt: '例如：这是我为你写的专属骚话',
        validateInput: (value) => {
            if (!value || value.trim().length === 0) return '请输入内容';
            if (value.length > 100) return '内容不能超过 100 个字符';
            return null;
        }
    });

    if (!content) return;

    await addCustomSaoHua(selectedType.value, selectedStyle.value, content.trim());
    vscode.window.showInformationMessage(`已添加自定义骚话：${selectedType.value}/${selectedStyle.value}`);
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
        detail: `添加时间：${new Date(item.addedAt).toLocaleString()}`,
        value: index
    }));

    const viewOrDelete = await vscode.window.showQuickPick([
        { label: '$(eye) 查看/删除', description: '查看列表并删除', value: 'view' },
        { label: '$(clippy) 复制全部', description: '复制所有自定义骚话为 JSON', value: 'copy' }
    ], {
        placeHolder: '选择操作',
        ignoreFocusOut: true
    });

    if (!viewOrDelete) return;

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
    if (!fileUri || fileUri.length === 0) return;

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
        vscode.window.showErrorMessage(`导入失败：${error.message}`);
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
    if (!fileUri) return;

    try {
        const jsonContent = exportCustomSaoHua();
        const writeData = Buffer.from(jsonContent, 'utf8');
        await vscode.workspace.fs.writeFile(fileUri, writeData);
        vscode.window.showInformationMessage(`已导出 ${list.length} 条自定义骚话到 ${fileUri.fsPath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`导出失败：${error.message}`);
    }
}

// ==================== 插件激活/停用 ====================

/**
 * 激活插件
 * @param {vscode.ExtensionContext} context 扩展上下文
 */
function activate(context) {
    console.log('[GitSaoHua] Git Commit 骚话生成器 已激活!');

    PluginState.extensionContext = context;
    restorePreferences();

    // 注册命令
    const commands = [
        vscode.commands.registerCommand('gitCommitSaoHua.generate', showSaoHuaGenerator),
        vscode.commands.registerCommand('gitCommitSaoHua.generateSmart', generateSmartCommit),
        vscode.commands.registerCommand('gitCommitSaoHua.generateRandom', generateRandomCommit),
        vscode.commands.registerCommand('gitCommitSaoHua.selectType', selectType),
        vscode.commands.registerCommand('gitCommitSaoHua.selectStyle', selectStyle),
        vscode.commands.registerCommand('gitCommitSaoHua.resetPreferences', resetPreferences),
        vscode.commands.registerCommand('gitCommitSaoHua.clearDescriptionHistory', clearDescriptionHistory),
        vscode.commands.registerCommand('gitCommitSaoHua.openKeybindings', openKeybindings),
        vscode.commands.registerCommand('gitCommitSaoHua.manageCustomSaoHua', showCustomSaoHuaManager),
        vscode.commands.registerCommand('gitCommitSaoHua.addCustomSaoHua', addSingleCustomSaoHua),
        vscode.commands.registerCommand('gitCommitSaoHua.clearCustomSaoHua', clearCustomSaoHuaCommand),
        vscode.commands.registerCommand('gitCommitSaoHua.showStatistics', showStatistics),
        vscode.commands.registerCommand('gitCommitSaoHua.quickSettings', quickSettings),
        vscode.commands.registerCommand('gitCommitSaoHua.showDetectionLogs', showDetectionLogs),
        vscode.commands.registerCommand('gitCommitSaoHua.clearDetectionLogs', clearDetectionLogs),
        vscode.commands.registerCommand('gitCommitSaoHua.analyzeDetectionAccuracy', showDetectionAnalysis)
    ];

    context.subscriptions.push(...commands);
}

/**
 * 随机生成 Commit
 */
async function generateRandomCommit() {
    const autoInsert = ConfigManager.get('autoInsert', true);

    let saoHuaMessage;
    let usedCustom = false;
    let result;

    if (shouldUseCustomSaoHua()) {
        const customMessage = generateCustomSaoHuaMessage();
        if (customMessage) {
            saoHuaMessage = customMessage;
            usedCustom = true;
            const customSaoHua = getRandomCustomSaoHua();
            if (customSaoHua) {
                PluginState.currentType = customSaoHua.type;
                PluginState.currentStyle = customSaoHua.style;
                result = { type: customSaoHua.type, style: customSaoHua.style };
            }
        }
    }

    if (!saoHuaMessage) {
        result = getRandomSaoHua();
        PluginState.currentType = result.type;
        PluginState.currentStyle = result.style;
        await persistPreferences();
        saoHuaMessage = result.message;
    } else {
        await persistPreferences();
    }

    const description = await promptForDescription(saoHuaMessage);
    const message = composeCommitMessage(result.type, saoHuaMessage, description);

    const typeLabel = usedCustom ? `${result.type} (自定义)` : `${result.type}`;

    if (autoInsert) {
        await vscode.window.showInformationMessage(`随机生成：${typeLabel} ${usedCustom ? '✨' : ''}`, {
            modal: true,
            detail: message
        });
        playSoundEffect('success');
        await insertToGitInput(message, true);
    } else {
        await vscode.env.clipboard.writeText(message);
        playSoundEffect('copy');
        await vscode.window.showInformationMessage(`已复制到剪贴板！类型：${typeLabel} ${usedCustom ? '✨' : ''}`, {
            modal: true,
            detail: message
        });
    }

    if (result) {
        await recordGeneration(result.type, result.style);
    }
}

/**
 * 选择 Commit 类型
 */
async function selectType() {
    const items = commitTypes.map(t => ({
        label: t.label,
        description: t.desc,
        value: t.value
    }));

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: '选择 Commit 类型'
    });

    if (selected) {
        PluginState.currentType = selected.value;
        await persistPreferences();
        vscode.window.showInformationMessage(`已选择类型：${selected.label}`);
    }
}

/**
 * 选择风格模式
 */
async function selectStyle() {
    const items = styles.map(s => ({
        label: `${s.emoji} ${s.label}`,
        value: s.value
    }));

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: '选择风格模式'
    });

    if (selected) {
        PluginState.currentStyle = selected.value;
        await persistPreferences();
        vscode.window.showInformationMessage(`已选择风格：${selected.label}`);
    }
}

/**
 * 重置偏好设置
 */
async function resetPreferences() {
    resetPreferencesToConfig();
    await clearPersistedPreferences();
    vscode.window.showInformationMessage(`已重置偏好：${PluginState.currentType} / ${getStyleLabel(PluginState.currentStyle)}`);
}

/**
 * 打开快捷键设置
 */
async function openKeybindings() {
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
    vscode.window.showInformationMessage('请在打开的文件中添加快捷键配置，或打开：文件 > 首选项 > 快捷键 进行设置');
}

/**
 * 清空自定义骚话命令
 */
async function clearCustomSaoHuaCommand() {
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
}

// ==================== 快捷设置面板 ====================

/**
 * 快捷设置面板 - 使用 QuickPick 提供直观的 UI 调节设置
 */
async function quickSettings() {
    const config = vscode.workspace.getConfiguration('gitCommitSaoHua');
    const smartConfig = ConfigManager.getSmartDetectionConfig();

    const settingsItems = [
        {
            label: '$(gear) 高置信度阈值',
            description: `当前：${smartConfig.highConfidenceThreshold} (范围 1-10)`,
            detail: '高置信度所需的关键词数量阈值',
            settingKey: 'smartDetection.highConfidenceThreshold',
            currentValue: smartConfig.highConfidenceThreshold,
            min: 1,
            max: 10,
            type: 'number'
        },
        {
            label: '$(gear) 中等置信度阈值',
            description: `当前：${smartConfig.mediumConfidenceThreshold} (范围 1-5)`,
            detail: '中等置信度所需的关键词数量阈值',
            settingKey: 'smartDetection.mediumConfidenceThreshold',
            currentValue: smartConfig.mediumConfidenceThreshold,
            min: 1,
            max: 5,
            type: 'number'
        },
        {
            label: '$(symbol-boolean) AST 分析优先',
            description: smartConfig.astPriorityEnabled ? '✓ 已启用' : '✗ 已禁用',
            detail: '高置信度 AST 结果优先于其他分析',
            settingKey: 'smartDetection.astPriorityEnabled',
            currentValue: smartConfig.astPriorityEnabled,
            type: 'boolean'
        },
        {
            label: '$(symbol-boolean) Diff 分析优先',
            description: smartConfig.diffPriorityEnabled ? '✓ 已启用' : '✗ 已禁用',
            detail: '当 AST 置信度不足时，优先采用 diff 结果',
            settingKey: 'smartDetection.diffPriorityEnabled',
            currentValue: smartConfig.diffPriorityEnabled,
            type: 'boolean'
        },
        {
            label: '$(symbol-boolean) 描述提示',
            description: config.get('enableDescriptionPrompt', true) ? '✓ 已启用' : '✗ 已禁用',
            detail: '生成骚话后询问是否添加详细描述',
            settingKey: 'enableDescriptionPrompt',
            currentValue: config.get('enableDescriptionPrompt', true),
            type: 'boolean'
        }
    ];

    const selected = await vscode.window.showQuickPick(settingsItems, {
        placeHolder: '选择要调整的设置',
        ignoreFocusOut: true
    });

    if (!selected) return;

    let newValue;

    if (selected.type === 'number') {
        const input = await vscode.window.showInputBox({
            placeHolder: `输入新值 (${selected.min}-${selected.max})`,
            value: selected.currentValue.toString(),
            validateInput: (value) => {
                const num = parseInt(value);
                if (isNaN(num)) return '请输入有效数字';
                if (num < selected.min || num > selected.max) {
                    return `值必须在 ${selected.min} 到 ${selected.max} 之间`;
                }
                return null;
            }
        });

        if (input === undefined) return;
        newValue = parseInt(input);
    } else {
        const toggleItems = [
            { label: '✓ 启用', value: true },
            { label: '✗ 禁用', value: false }
        ];

        const toggleSelected = await vscode.window.showQuickPick(toggleItems, {
            placeHolder: `当前：${selected.currentValue ? '启用' : '禁用'}`,
            ignoreFocusOut: true
        });

        if (!toggleSelected) return;
        newValue = toggleSelected.value;
    }

    // 保存设置
    await config.update(selected.settingKey, newValue, vscode.ConfigurationTarget.Workspace);

    const settingLabel = selected.label.replace(/^\$\([^)]+\)\s*/, '');
    const valueLabel = selected.type === 'boolean' 
        ? (newValue ? '已启用' : '已禁用')
        : `已设置为 ${newValue}`;

    vscode.window.showInformationMessage(`✓ ${settingLabel}：${valueLabel}`);
}

/**
 * 停用插件
 */
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
