const data = require('./sao-hua-data.js');
const pluginManager = require('./plugin-manager.js');

let saoHuaData = data.saoHuaData;
let commitTypesData = data.commitTypes;
let stylesData = data.styles;

function loadPluginData() {
    try {
        const plugins = pluginManager.loadAllPlugins();
        if (plugins.length > 0) {
            saoHuaData = pluginManager.mergePluginData(data.saoHuaData, plugins);
            stylesData = pluginManager.mergeStyles(data.styles, plugins);
        }
    } catch (e) {
    }
}

loadPluginData();

function reloadPluginData() {
    loadPluginData();
}
const supportedLanguages = data.supportedLanguages;
const defaultLanguage = data.defaultLanguage;

function getAllTypes(language = defaultLanguage) {
    const types = commitTypesData[language] || commitTypesData[defaultLanguage];
    return types.map(t => t.value);
}

function getAllStyles(language = defaultLanguage) {
    const styleList = stylesData[language] || stylesData[defaultLanguage];
    return styleList.map(s => s.value);
}

function getTypeInfo(type, language = defaultLanguage) {
    const types = commitTypesData[language] || commitTypesData[defaultLanguage];
    return types.find(t => t.value === type);
}

function getStyleInfo(style, language = defaultLanguage) {
    const styleList = stylesData[language] || stylesData[defaultLanguage];
    return styleList.find(s => s.value === style);
}

function validateType(type) {
    return supportedLanguages.every(lang => {
        const types = commitTypesData[lang];
        return types.some(t => t.value === type);
    });
}

function validateStyle(style) {
    return supportedLanguages.every(lang => {
        const styleList = stylesData[lang];
        return styleList.some(s => s.value === style);
    });
}

function generateByType(type, style = null, language = defaultLanguage) {
    if (!validateType(type)) {
        const allTypes = getAllTypes(language);
        throw new Error(`Invalid type: ${type}. Valid types: ${allTypes.join(', ')}`);
    }

    let msgStyle = style;
    const langData = saoHuaData[language] || saoHuaData[defaultLanguage];
    
    if (!msgStyle) {
        const styleKeys = Object.keys(langData[type]);
        msgStyle = styleKeys[Math.floor(Math.random() * styleKeys.length)];
    } else if (!validateStyle(msgStyle)) {
        const allStyles = getAllStyles(language);
        throw new Error(`Invalid style: ${style}. Valid styles: ${allStyles.join(', ')}`);
    }

    const message = data.getSaoHua(type, msgStyle, language);
    return {
        type: type,
        style: msgStyle,
        message: message,
        fullMessage: `${type}: ${message}`,
        language: language
    };
}

function generateByStyle(style, language = defaultLanguage) {
    if (!validateStyle(style)) {
        const allStyles = getAllStyles(language);
        throw new Error(`Invalid style: ${style}. Valid styles: ${allStyles.join(', ')}`);
    }

    const langData = saoHuaData[language] || saoHuaData[defaultLanguage];
    const types = Object.keys(langData);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const message = data.getSaoHua(randomType, style, language);

    return {
        type: randomType,
        style: style,
        message: message,
        fullMessage: `${randomType}: ${message}`,
        language: language
    };
}

function generateRandom(language = defaultLanguage) {
    const random = data.getRandomSaoHua(language);
    return {
        type: random.type,
        style: random.style,
        message: random.message,
        fullMessage: `${random.type}: ${random.message}`,
        language: language
    };
}

function generateFullCommitMessage(type, style, description = '', language = defaultLanguage) {
    if (!validateType(type)) {
        const allTypes = getAllTypes(language);
        throw new Error(`Invalid type: ${type}. Valid types: ${allTypes.join(', ')}`);
    }

    let msgStyle = style;
    const langData = saoHuaData[language] || saoHuaData[defaultLanguage];
    
    if (!msgStyle) {
        const styleKeys = Object.keys(langData[type]);
        msgStyle = styleKeys[Math.floor(Math.random() * styleKeys.length)];
    } else if (!validateStyle(msgStyle)) {
        const allStyles = getAllStyles(language);
        throw new Error(`Invalid style: ${style}. Valid styles: ${allStyles.join(', ')}`);
    }

    return data.generateCommitMessage(type, msgStyle, description, language);
}

function getDataStats(language = defaultLanguage) {
    const langData = saoHuaData[language] || saoHuaData[defaultLanguage];
    const types = commitTypesData[language] || commitTypesData[defaultLanguage];
    const styleList = stylesData[language] || stylesData[defaultLanguage];
    
    let totalMessages = 0;
    const typeStats = {};

    for (const type of types.map(t => t.value)) {
        const styleCounts = {};
        for (const style of styleList.map(s => s.value)) {
            const count = (langData[type]?.[style] || []).length;
            styleCounts[style] = count;
            totalMessages += count;
        }
        typeStats[type] = styleCounts;
    }

    return {
        totalTypes: types.length,
        totalStyles: styleList.length,
        totalMessages,
        typeStats,
        language: language
    };
}

const VALID_TYPES = getAllTypes();
const VALID_STYLES = getAllStyles();

const MAX_BATCH_SIZE = 50;

async function generateBatch(items, options = {}) {
    const { maxItems = MAX_BATCH_SIZE } = options;
    
    if (!Array.isArray(items) || items.length === 0) {
        return {
            success: false,
            error: '请提供有效的生成请求数组~',
            items: [],
            count: 0,
            successCount: 0,
            failedCount: 0
        };
    }
    
    if (items.length > maxItems) {
        return {
            success: false,
            error: `单次请求最多支持 ${maxItems} 条~`,
            items: [],
            count: items.length,
            successCount: 0,
            failedCount: items.length
        };
    }
    
    const results = [];
    
    for (const item of items) {
        const { mode = 'random', type, style, lang, diff } = item;
        const language = lang || defaultLanguage;
        
        try {
            let result;
            
            switch (mode) {
                case 'random':
                    result = {
                        ...generateRandom(language),
                        mode: 'random'
                    };
                    break;
                case 'typed':
                    if (!type) {
                        results.push({ success: false, error: 'typed 模式需要提供 type 参数', mode: 'typed' });
                        continue;
                    }
                    result = {
                        ...generateByType(type, style, language),
                        mode: 'typed'
                    };
                    break;
                case 'typed_style':
                    if (!type || !style) {
                        results.push({ success: false, error: 'typed_style 模式需要提供 type 和 style 参数', mode: 'typed_style' });
                        continue;
                    }
                    result = {
                        ...generateByType(type, style, language),
                        mode: 'typed_style'
                    };
                    break;
                case 'ai':
                    if (!diff) {
                        results.push({ success: false, error: 'ai 模式需要提供 diff 参数', mode: 'ai' });
                        continue;
                    }
                    try {
                        const aiGenerator = require('./ai-generator.js');
                        const aiResult = await aiGenerator.generateWithAIAsync(diff, {
                            type,
                            style,
                            language
                        });
                        result = {
                            ...aiResult,
                            mode: 'ai',
                            isAI: true
                        };
                    } catch (aiError) {
                        console.warn('AI 生成失败，使用 fallback:', aiError.message);
                        const msgType = type || 'chore';
                        result = {
                            ...generateByType(msgType, style, language),
                            mode: 'ai',
                            isAI: false,
                            isFallback: true
                        };
                    }
                    break;
                default:
                    results.push({ success: false, error: `不支持的模式: ${mode}`, mode });
                    continue;
            }
            
            results.push({ success: true, ...result });
        } catch (itemError) {
            results.push({ success: false, error: itemError.message, mode });
        }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return {
        success: true,
        items: results,
        count: results.length,
        successCount,
        failedCount: results.length - successCount
    };
}

module.exports = {
    VALID_TYPES,
    VALID_STYLES,
    commitTypes: commitTypesData,
    styles: stylesData,
    saoHuaData,
    supportedLanguages,
    defaultLanguage,
    getSaoHua: data.getSaoHua,
    getRandomSaoHua: data.getRandomSaoHua,
    generateCommitMessage: data.generateCommitMessage,
    getAllTypes,
    getAllStyles,
    getTypeInfo,
    getStyleInfo,
    validateType,
    validateStyle,
    validateLanguage: data.validateLanguage,
    getSupportedLanguages: data.getSupportedLanguages,
    getDefaultLanguage: data.getDefaultLanguage,
    generateByType,
    generateByStyle,
    generateRandom,
    generateFullCommitMessage,
    generateBatch,
    getDataStats,
    reloadPluginData,
    MAX_BATCH_SIZE
};
