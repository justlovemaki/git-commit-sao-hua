/**
 * Git Commit 骚话生成器 - AI 智能生成模块
 * 
 * 基于实际代码 diff 分析，使用 AI 生成更个性化的骚话 commit message
 * 支持 fallback 机制：AI 失败时降级到传统模板生成
 * 
 * @version 1.23.0
 * @author coding-expert
 */

// ==================== 依赖模块 ====================

const generator = require('./generator.js');

// ==================== 配置常量 ====================

const DEFAULT_AI_CONFIG = {
    apiUrl: process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-3.5-turbo',
    maxTokens: 200,
    temperature: 0.8,
    timeout: 30000
};

const LANGUAGE_MAPPING = {
    'zh-CN': '中文',
    'en': '英文'
};

// ==================== Diff 分析函数 ====================

/**
 * 分析 diff 内容，提取关键信息
 * 
 * @param {string} diffText - git diff 内容
 * @returns {Object} 分析结果对象，包含：
 *   - changedFiles: {string[]} 修改的文件列表
 *   - fileTypes: {string[]} 文件类型数组
 *   - changeScale: {string} 变更规模 (small/medium/large)
 *   - addedLines: {number} 新增行数
 *   - removedLines: {number} 删除行数
 *   - keyIdentifiers: {string[]} 关键函数/类名
 *   - detectedFeatures: {string[]} 检测到的功能特征
 */
function analyzeDiff(diffText) {
    const result = {
        changedFiles: [],
        fileTypes: [],
        changeScale: 'small',
        addedLines: 0,
        removedLines: 0,
        keyIdentifiers: [],
        detectedFeatures: []
    };

    if (!diffText || diffText.trim().length === 0) {
        result.changeScale = 'none';
        return result;
    }

    const lines = diffText.split('\n');
    let currentFile = null;

    for (const line of lines) {
        if (line.startsWith('diff --git')) {
            const match = line.match(/diff --git a\/(.+?) b\/(.+)/);
            if (match) {
                currentFile = match[2] || match[1];
                result.changedFiles.push(currentFile);
                
                const ext = getFileExtension(currentFile);
                if (ext && !result.fileTypes.includes(ext)) {
                    result.fileTypes.push(ext);
                }
            }
        }
        else if (line.startsWith('+') && !line.startsWith('+++')) {
            result.addedLines++;
            
            const identifiers = extractIdentifiers(line);
            for (const id of identifiers) {
                if (!result.keyIdentifiers.includes(id)) {
                    result.keyIdentifiers.push(id);
                }
            }
        }
        else if (line.startsWith('-') && !line.startsWith('---')) {
            result.removedLines++;
        }
    }

    const totalChanges = result.addedLines + result.removedLines;
    if (totalChanges > 50) {
        result.changeScale = 'large';
    } else if (totalChanges > 10) {
        result.changeScale = 'medium';
    } else {
        result.changeScale = 'small';
    }

    result.detectedFeatures = detectFeatures(diffText, result);

    return result;
}

/**
 * 获取文件扩展名
 * @param {string} filePath - 文件路径
 * @returns {string} 扩展名
 */
function getFileExtension(filePath) {
    if (!filePath) return '';
    const lastDot = filePath.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filePath.substring(lastDot);
}

/**
 * 从代码行中提取关键标识符（函数名、类名等）
 * @param {string} line - 代码行
 * @returns {string[]} 标识符数组
 */
function extractIdentifiers(line) {
    const identifiers = [];
    
    const functionMatch = line.match(/(?:function|def|func|fn)\s+(\w+)/);
    if (functionMatch) identifiers.push(functionMatch[1]);
    
    const classMatch = line.match(/class\s+(\w+)/);
    if (classMatch) identifiers.push(classMatch[1]);
    
    const constMatch = line.match(/const\s+(\w+)/);
    if (constMatch) identifiers.push(constMatch[1]);
    
    const letMatch = line.match(/let\s+(\w+)/);
    if (letMatch) identifiers.push(letMatch[1]);
    
    const arrowMatch = line.match(/(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\w+\s*=>/);
    if (arrowMatch) {
        const nameMatch = line.match(/(?:const|let|var)\s+(\w+)/);
        if (nameMatch) identifiers.push(nameMatch[1]);
    }

    return identifiers;
}

/**
 * 检测代码功能特征
 * @param {string} diffText - diff 内容
 * @param {Object} analysisResult - 已有的分析结果
 * @returns {string[]} 功能特征数组
 */
function detectFeatures(diffText, analysisResult) {
    const features = [];

    const featurePatterns = [
        { pattern: /test|spec|describe|it\(/i, feature: '测试相关' },
        { pattern: /fix|bug|issue|error|exception/i, feature: '修复 bug' },
        { pattern: /add|new|create|implement/i, feature: '新增功能' },
        { pattern: /refactor|reorganize|restructure/i, feature: '代码重构' },
        { pattern: /style|format|lint/i, feature: '代码格式' },
        { pattern: /docs?|readme|document/i, feature: '文档更新' },
        { pattern: /perf|optimize|speed|improve/i, feature: '性能优化' },
        { pattern: /security|auth|permission/i, feature: '安全相关' },
        { pattern: /api|endpoint|route/i, feature: 'API 接口' },
        { pattern: /database|sql|query|migration/i, feature: '数据库变更' },
        { pattern: /config|setting|env/i, feature: '配置变更' },
        { pattern: /ci|cd|pipeline|workflow/i, feature: 'CI/CD 配置' },
        { pattern: /dependencies?|package|npm|yarn/i, feature: '依赖更新' },
        { pattern: /ui|component|view|render/i, feature: 'UI 组件' },
        { pattern: /hook|useState|useEffect/i, feature: 'React Hooks' },
        { pattern: /async|await|promise/i, feature: '异步处理' }
    ];

    for (const { pattern, feature } of featurePatterns) {
        if (pattern.test(diffText)) {
            features.push(feature);
        }
    }

    if (analysisResult.fileTypes.includes('.test.js') || 
        analysisResult.fileTypes.includes('.spec.js')) {
        features.push('测试文件');
    }

    if (analysisResult.fileTypes.includes('.css') || 
        analysisResult.fileTypes.includes('.scss')) {
        features.push('样式文件');
    }

    if (analysisResult.fileTypes.includes('.md') || 
        analysisResult.fileTypes.includes('.txt')) {
        features.push('文档文件');
    }

    return features;
}

// ==================== AI 生成函数 ====================

/**
 * 调用 AI API 生成个性化骚话 commit message
 * 
 * @param {string} diffText - git diff 内容
 * @param {Object} options - 配置选项
 * @param {string} [options.language='zh-CN'] - 语言选项
 * @param {string} [options.style='sao'] - 风格选项 (love/sao/zha/chu/fo)
 * @param {string} [options.apiUrl] - AI API 地址
 * @param {string} [options.apiKey] - AI API 密钥
 * @param {string} [options.model] - AI 模型
 * @param {number} [options.maxTokens] - 最大 token 数
 * @param {number} [options.temperature] - 温度参数
 * @param {number} [options.timeout] - 超时时间(毫秒)
 * @param {boolean} [options.enableFallback=true] - 是否启用 fallback
 * @returns {Promise<Object>} 生成结果，包含：
 *   - success: {boolean} 是否成功
 *   - message: {string} 生成的 commit message
 *   - type: {string} commit 类型
 *   - style: {string} 风格
 *   - isFallback: {boolean} 是否使用了 fallback
 *   - diffAnalysis: {Object} diff 分析结果
 */
async function generateWithAI(diffText, options = {}) {
    const {
        language = 'zh-CN',
        style = 'sao',
        apiUrl = DEFAULT_AI_CONFIG.apiUrl,
        apiKey = DEFAULT_AI_CONFIG.apiKey,
        model = DEFAULT_AI_CONFIG.model,
        maxTokens = DEFAULT_AI_CONFIG.maxTokens,
        temperature = DEFAULT_AI_CONFIG.temperature,
        timeout = DEFAULT_AI_CONFIG.timeout,
        enableFallback = true
    } = options;

    const diffAnalysis = analyzeDiff(diffText);

    if (!apiKey) {
        if (enableFallback) {
            return generateFallback(diffText, diffAnalysis, language, style);
        }
        throw new Error('AI API key is required. Set AI_API_KEY environment variable.');
    }

    const systemPrompt = buildSystemPrompt(language, style);
    const userPrompt = buildUserPrompt(diffText, diffAnalysis, language, style);

    try {
        const response = await callAIApi({
            apiUrl,
            apiKey,
            model,
            maxTokens,
            temperature,
            timeout,
            systemPrompt,
            userPrompt
        });

        const message = parseAIResponse(response);
        
        if (message && message.length > 0) {
            return {
                success: true,
                message: message,
                type: diffAnalysis.detectedFeatures.includes('修复 bug') ? 'fix' : 'feat',
                style: style,
                isFallback: false,
                diffAnalysis: diffAnalysis
            };
        }

        if (enableFallback) {
            return generateFallback(diffText, diffAnalysis, language, style);
        }

        throw new Error('AI response is empty');
    } catch (error) {
        if (enableFallback) {
            return generateFallback(diffText, diffAnalysis, language, style);
        }
        throw error;
    }
}

/**
 * 构建 AI 系统提示词
 * @param {string} language - 语言
 * @param {string} style - 风格
 * @returns {string} 系统提示词
 */
function buildSystemPrompt(language, style) {
    const langName = LANGUAGE_MAPPING[language] || '中文';
    
    const styleInstructions = {
        'love': '生成浪漫深情的骚话，像情话一样甜蜜动人',
        'sao': '生成调皮撩人的骚话，带点幽默和调侃',
        'zha': '生成扎心现实的骚话，带点自嘲和无奈',
        'chu': '生成中二热血的骚话，带点动漫式的激情',
        'fo': '生成佛系禅意的骚话，带点哲学和超脱'
    };

    return `你是一个 Git Commit Message 生成助手，专门生成骚气的 commit message。
语言：${langName}
风格：${styleInstructions[style] || styleInstructions['sao']}

要求：
1. 只返回 commit message 正文，不要包含其他说明
2. message 长度控制在 30-80 字之间
3. 结合代码变更内容生成个性化 message
4. 可以适当使用emoji，但要适量
5. message 格式：type: message（type 为 commit 类型如 fix/feat/chore 等）`;
}

/**
 * 构建 AI 用户提示词
 * @param {string} diffText - diff 内容
 * @param {Object} analysis - 分析结果
 * @param {string} language - 语言
 * @param {string} style - 风格
 * @returns {string} 用户提示词
 */
function buildUserPrompt(diffText, analysis, language, style) {
    let prompt = '请根据以下代码 diff 生成一个骚气的 commit message：\n\n';
    
    prompt += `## 变更概要\n`;
    prompt += `- 修改文件：${analysis.changedFiles.join(', ') || '无'}\n`;
    prompt += `- 文件类型：${analysis.fileTypes.join(', ') || '未知'}\n`;
    prompt += `- 变更规模：${analysis.changeScale}\n`;
    prompt += `- 新增行数：${analysis.addedLines}\n`;
    prompt += `- 删除行数：${analysis.removedLines}\n`;
    
    if (analysis.keyIdentifiers.length > 0) {
        prompt += `- 关键标识符：${analysis.keyIdentifiers.join(', ')}\n`;
    }
    
    if (analysis.detectedFeatures.length > 0) {
        prompt += `- 功能特征：${analysis.detectedFeatures.join(', ')}\n`;
    }
    
    prompt += `\n## 代码 diff (前 50 行)\n`;
    const diffLines = diffText.split('\n').slice(0, 50);
    prompt += diffLines.join('\n');
    
    return prompt;
}

/**
 * 调用 AI API
 * @param {Object} config - API 配置
 * @returns {Promise<Object>} API 响应
 */
async function callAIApi(config) {
    const { apiUrl, apiKey, model, maxTokens, temperature, timeout, systemPrompt, userPrompt } = config;
    
    const requestBody = {
        model: model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`AI API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('AI API request timeout');
        }
        throw error;
    }
}

/**
 * 解析 AI 响应
 * @param {Object} response - API 响应
 * @returns {string} 解析后的 message
 */
function parseAIResponse(response) {
    if (!response || !response.choices || response.choices.length === 0) {
        return null;
    }

    const content = response.choices[0].message?.content;
    if (!content) return null;

    const lines = content.trim().split('\n');
    const message = lines[0].trim();

    return message;
}

// ==================== Fallback 函数 ====================

/**
 * Fallback：使用传统模板生成
 * @param {string} diffText - diff 内容
 * @param {Object} analysis - 分析结果
 * @param {string} language - 语言
 * @param {string} style - 风格
 * @returns {Object} 生成结果
 */
function generateFallback(diffText, analysis, language, style) {
    const commitTypes = ['fix', 'feat', 'chore', 'docs', 'refactor', 'style', 'test', 'perf', 'ci', 'build', 'revert', 'hotfix'];
    
    let commitType = 'chore';
    for (const feature of analysis.detectedFeatures) {
        if (feature.includes('修复')) commitType = 'fix';
        else if (feature.includes('新增')) commitType = 'feat';
        else if (feature.includes('测试')) commitType = 'test';
        else if (feature.includes('文档')) commitType = 'docs';
        else if (feature.includes('重构')) commitType = 'refactor';
        else if (feature.includes('样式')) commitType = 'style';
        else if (feature.includes('性能')) commitType = 'perf';
        else if (feature.includes('CI/CD')) commitType = 'ci';
        else if (feature.includes('配置')) commitType = 'chore';
    }

    const fallbackMessage = generator.generateByType(commitType, style, language);

    return {
        success: true,
        message: fallbackMessage.fullMessage,
        type: commitType,
        style: style,
        isFallback: true,
        diffAnalysis: analysis
    };
}

// ==================== 同步包装函数 ====================

/**
 * 同步版本的 AI 生成（需要外部 async 包装）
 * @param {string} diffText - diff 内容
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} 生成结果
 */
function generateWithAIAsync(diffText, options) {
    return generateWithAI(diffText, options);
}

// ==================== 导出 ====================

module.exports = {
    analyzeDiff,
    generateWithAI,
    generateWithAIAsync,
    generateFallback,
    
    DEFAULT_AI_CONFIG,
    LANGUAGE_MAPPING
};
