const data = require('./sao-hua-data.js');

const saoHuaData = data.saoHuaData;
const commitTypesData = data.commitTypes;
const stylesData = data.styles;
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
    getDataStats
};
