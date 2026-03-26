/**
 * Git Commit 骚话生成器 - 智能检测模块
 * 
 * 提供 AST 分析、Diff 关键词匹配、代码模式识别等功能
 * 可被 CLI 和 VSCode 插件共享使用
 * 
 * @version 1.20.0
 * @author coding-expert
 */

// ==================== 常量定义 ====================

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

const DATABASE_PATTERNS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'EXECUTE'];
const API_PATTERNS = ['fetch', 'axios', 'http.get', 'http.post', 'http.put', 'http.delete', 'XMLHttpRequest', '$.ajax'];
const ROUTE_PATTERNS = ['router.get', 'router.post', 'router.put', 'router.delete', '@GetMapping', '@PostMapping', '@Route', 'path:', 'url:'];
const COMPONENT_PATTERNS = ['template:', 'render(', 'h(', 'createElement', 'jsx', '<div>', '<Component>'];
const STYLE_PATTERNS = ['display: flex', 'display: grid', 'animation:', 'transition:', 'transform:', '@keyframes', '@media'];

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

        const addedLines = diffContent.split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++'));
        const removedLines = diffContent.split('\n').filter(line => line.startsWith('-') && !line.startsWith('---'));
        const addedContent = addedLines.join('\n');

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
     * @param {Object} options 配置选项
     * @returns {{type: string, confidence: string, matchedKeywords: string[], reason: string, detectedPatterns: Object}} 分析结果
     */
    static analyze(diffContent, options = {}) {
        const {
            highConfidenceThreshold = 3,
            mediumConfidenceThreshold = 1
        } = options;

        if (!diffContent || diffContent.length === 0) {
            return {
                type: 'chore',
                confidence: 'low',
                matchedKeywords: [],
                reason: '无 diff 内容',
                detectedPatterns: {}
            };
        }

        const lowerContent = diffContent.toLowerCase();
        
        const fixMatched = this.matchKeywords(lowerContent, FIX_KEYWORDS);
        const featMatched = this.matchKeywords(lowerContent, FEAT_KEYWORDS);

        const pythonMatched = this.matchKeywords(diffContent, PYTHON_KEYWORDS);
        const javaMatched = this.matchKeywords(diffContent, JAVA_KEYWORDS);
        const tsMatched = this.matchKeywords(diffContent, TYPESCRIPT_KEYWORDS);
        const goMatched = this.matchKeywords(diffContent, GO_KEYWORDS);
        const rustMatched = this.matchKeywords(diffContent, RUST_KEYWORDS);
        const phpMatched = this.matchKeywords(diffContent, PHP_KEYWORDS);
        const rubyMatched = this.matchKeywords(diffContent, RUBY_KEYWORDS);
        const swiftMatched = this.matchKeywords(diffContent, SWIFT_KEYWORDS);

        const detectedPatterns = this.detectCodePatterns(diffContent);

        const fixScore = fixMatched.length;
        const featScore = featMatched.length;

        const langScores = [
            { name: 'Python', score: pythonMatched.length, type: 'feat' },
            { name: 'Java/Kotlin', score: javaMatched.length, type: 'feat' },
            { name: 'TypeScript', score: tsMatched.length, type: 'feat' },
            { name: 'Go', score: goMatched.length, type: 'feat' },
            { name: 'Rust', score: rustMatched.length, type: 'feat' },
            { name: 'PHP', score: phpMatched.length, type: 'feat' },
            { name: 'Ruby', score: rubyMatched.length, type: 'feat' },
            { name: 'Swift', score: swiftMatched.length, type: 'feat' }
        ];

        let type = 'chore';
        let confidence = 'low';
        let reason = '';
        const allMatched = [...fixMatched, ...featMatched];

        const calcConfidence = (score) => {
            if (score >= highConfidenceThreshold) return 'high';
            if (score >= mediumConfidenceThreshold) return 'medium';
            return 'low';
        };

        const highLangScore = langScores.find(l => l.score >= mediumConfidenceThreshold);
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

// ==================== 文件类型分析器 ====================

/**
 * 文件类型分析器
 * 根据文件路径和扩展名分析 Commit 类型
 */
class FileTypeAnalyzer {
    /**
     * 分析文件类型
     * @param {string[]} filePaths 文件路径列表
     * @returns {Object} 类型计数字典
     */
    static analyzeFileTypes(filePaths) {
        const typeCounts = {
            fix: 0, feat: 0, chore: 0, docs: 0, style: 0,
            test: 0, ci: 0, build: 0, refactor: 0
        };

        for (const filePath of filePaths) {
            const fileName = filePath.split(/[/\\]/).pop();
            const ext = fileName.includes('.') 
                ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() 
                : '';
            const baseName = fileName.toLowerCase();

            if (['.css', '.scss', '.less', '.sass'].includes(ext)) {
                typeCounts.style++;
                continue;
            }

            if (baseName.match(/(\.test\.js|\.spec\.js|^test_.+\.js$)/)) {
                typeCounts.test++;
                continue;
            }

            if (['.md', '.txt'].includes(ext) && !baseName.includes('changelog')) {
                typeCounts.docs++;
                continue;
            }

            if (ext === '.json' && !baseName.includes('package')) {
                typeCounts.chore++;
                continue;
            }

            if (baseName === 'package.json' || baseName === 'package-lock.json') {
                typeCounts.build++;
                continue;
            }

            if (baseName === '.gitignore' || baseName === '.editorconfig') {
                typeCounts.chore++;
                continue;
            }

            if (filePath.includes('.github/') || 
                baseName === '.gitlab-ci.yml' || 
                baseName === 'jenkinsfile') {
                typeCounts.ci++;
                continue;
            }

            if (baseName.startsWith('.env') || filePath.includes('/config/')) {
                typeCounts.chore++;
                continue;
            }

            if (['.ts', '.tsx', '.js', '.jsx', '.vue', '.py', '.java', '.kt', '.go', '.rs', '.php', '.rb', '.swift', '.scala', '.ex', '.exs', '.elm', '.erl', '.hs', '.clj', '.cljs', '.fs', '.fsx', '.ml', '.mli', '.r', '.R', '.m', '.mm', '.dart', '.lua', '.cs'].includes(ext)) {
                typeCounts.feat++;
                continue;
            }

            typeCounts.chore++;
        }

        return typeCounts;
    }
}

// ==================== 智能类型检测器 ====================

/**
 * 智能 Commit 类型检测器
 * 综合分析文件类型、diff 内容和 AST 结构
 */
class SmartDetector {
    /**
     * 默认配置
     */
    static get defaultConfig() {
        return {
            highConfidenceThreshold: 3,
            mediumConfidenceThreshold: 1,
            astPriorityEnabled: true,
            diffPriorityEnabled: true
        };
    }

    /**
     * 智能分析文件变更、diff 内容和 AST 结构，推荐 Commit 类型
     * @param {Object} options 分析选项
     * @param {string[]} options.filePaths 变更文件路径列表
     * @param {string} [options.diffContent] git diff 内容
     * @param {Object} [options.config] 配置选项
     * @returns {{type: string, confidence: string, matchedKeywords: string[], reason: string, fileType: string, astFeatures: string[], breakdown: Object, detectedPatterns: Object}} 综合分析结果
     */
    static detect(options) {
        const {
            filePaths = [],
            diffContent = null,
            config = {}
        } = options;

        const finalConfig = { ...this.defaultConfig, ...config };

        if (!filePaths || filePaths.length === 0) {
            return {
                type: null,
                confidence: 'low',
                matchedKeywords: [],
                reason: '无变更文件',
                fileType: 'unknown',
                astFeatures: [],
                breakdown: {},
                detectedPatterns: {}
            };
        }

        const typeCounts = FileTypeAnalyzer.analyzeFileTypes(filePaths);
        
        const astResult = diffContent
            ? ASTAnalyzer.analyze(diffContent)
            : null;

        const diffResult = diffContent 
            ? DiffAnalyzer.analyze(diffContent, finalConfig)
            : null;

        return this.makeFinalDecision(typeCounts, astResult, diffResult, finalConfig);
    }

    /**
     * 综合判断最终 Commit 类型（加权评分系统）
     * @param {Object} typeCounts 文件类型计数
     * @param {Object|null} astResult AST 分析结果
     * @param {Object|null} diffResult Diff 分析结果
     * @param {Object} config 配置
     * @returns {{type: string, confidence: string, matchedKeywords: string[], reason: string, fileType: string, astFeatures: string[], breakdown: Object, detectedPatterns: Object}}
     */
    static makeFinalDecision(typeCounts, astResult, diffResult, config) {
        let finalType = null;
        let confidence = 'low';
        let matchedKeywords = [];
        let reason = '';
        const astFeatures = astResult?.astFeatures || [];
        
        const {
            highConfidenceThreshold,
            mediumConfidenceThreshold,
            astPriorityEnabled,
            diffPriorityEnabled
        } = config;
        
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

        const sortedTypes = Object.entries(typeScores).sort((a, b) => b[1] - a[1]);
        const topType = sortedTypes[0];
        const topScore = topType ? topType[1] : 0;

        const sourcesAgree = [];
        if (astResult?.type) sourcesAgree.push(astResult.type);
        if (diffResult?.type) sourcesAgree.push(diffResult.type);
        if (maxFileCount > 0) sourcesAgree.push(maxFileType);
        
        const typeOccurrences = {};
        for (const t of sourcesAgree) {
            typeOccurrences[t] = (typeOccurrences[t] || 0) + 1;
        }
        const agreementCount = topType ? typeOccurrences[topType[0]] : 0;

        const calcFileTypeConfidence = (count) => {
            if (count >= highConfidenceThreshold) return 'medium';
            return 'low';
        };

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

// ==================== 导出 ====================

module.exports = {
    ASTAnalyzer,
    DiffAnalyzer,
    FileTypeAnalyzer,
    SmartDetector,
    FIX_KEYWORDS,
    FEAT_KEYWORDS,
    DATABASE_PATTERNS,
    API_PATTERNS,
    ROUTE_PATTERNS,
    COMPONENT_PATTERNS,
    STYLE_PATTERNS
};
