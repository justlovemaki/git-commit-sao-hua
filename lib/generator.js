const { saoHuaData, commitTypes, styles, getSaoHua, getRandomSaoHua, generateCommitMessage } = require('./sao-hua-data.js');

const VALID_TYPES = commitTypes.map(t => t.value);
const VALID_STYLES = styles.map(s => s.value);

function getAllTypes() {
    return VALID_TYPES;
}

function getAllStyles() {
    return VALID_STYLES;
}

function getTypeInfo(type) {
    return commitTypes.find(t => t.value === type);
}

function getStyleInfo(style) {
    return styles.find(s => s.value === style);
}

function validateType(type) {
    return VALID_TYPES.includes(type);
}

function validateStyle(style) {
    return VALID_STYLES.includes(style);
}

function generateByType(type, style = null) {
    if (!validateType(type)) {
        throw new Error(`Invalid type: ${type}. Valid types: ${VALID_TYPES.join(', ')}`);
    }

    let msgStyle = style;
    if (!msgStyle) {
        const styleKeys = Object.keys(saoHuaData[type]);
        msgStyle = styleKeys[Math.floor(Math.random() * styleKeys.length)];
    } else if (!validateStyle(msgStyle)) {
        throw new Error(`Invalid style: ${style}. Valid styles: ${VALID_STYLES.join(', ')}`);
    }

    const message = getSaoHua(type, msgStyle);
    return {
        type: type,
        style: msgStyle,
        message: message,
        fullMessage: `${type}: ${message}`
    };
}

function generateByStyle(style) {
    if (!validateStyle(style)) {
        throw new Error(`Invalid style: ${style}. Valid styles: ${VALID_STYLES.join(', ')}`);
    }

    const types = Object.keys(saoHuaData);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const message = getSaoHua(randomType, style);

    return {
        type: randomType,
        style: style,
        message: message,
        fullMessage: `${randomType}: ${message}`
    };
}

function generateRandom() {
    const random = getRandomSaoHua();
    return {
        type: random.type,
        style: random.style,
        message: random.message,
        fullMessage: `${random.type}: ${random.message}`
    };
}

function generateFullCommitMessage(type, style, description = '') {
    if (!validateType(type)) {
        throw new Error(`Invalid type: ${type}. Valid types: ${VALID_TYPES.join(', ')}`);
    }

    let msgStyle = style;
    if (!msgStyle) {
        const styleKeys = Object.keys(saoHuaData[type]);
        msgStyle = styleKeys[Math.floor(Math.random() * styleKeys.length)];
    } else if (!validateStyle(msgStyle)) {
        throw new Error(`Invalid style: ${style}. Valid styles: ${VALID_STYLES.join(', ')}`);
    }

    return generateCommitMessage(type, msgStyle, description);
}

function getDataStats() {
    let totalMessages = 0;
    const typeStats = {};

    for (const type of VALID_TYPES) {
        const styleCounts = {};
        for (const style of VALID_STYLES) {
            const count = (saoHuaData[type]?.[style] || []).length;
            styleCounts[style] = count;
            totalMessages += count;
        }
        typeStats[type] = styleCounts;
    }

    return {
        totalTypes: VALID_TYPES.length,
        totalStyles: VALID_STYLES.length,
        totalMessages,
        typeStats
    };
}

module.exports = {
    VALID_TYPES,
    VALID_STYLES,
    commitTypes,
    styles,
    saoHuaData,
    getSaoHua,
    getRandomSaoHua,
    generateCommitMessage,
    getAllTypes,
    getAllStyles,
    getTypeInfo,
    getStyleInfo,
    validateType,
    validateStyle,
    generateByType,
    generateByStyle,
    generateRandom,
    generateFullCommitMessage,
    getDataStats
};
