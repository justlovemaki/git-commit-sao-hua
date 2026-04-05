const generator = require('./generator.js');
const smartDetector = require('./smart-detector.js');
const aiGenerator = require('./ai-generator.js');

module.exports = {
    saoHuaData: generator.saoHuaData,
    commitTypes: generator.commitTypes,
    styles: generator.styles,
    getSaoHua: generator.getSaoHua,
    getRandomSaoHua: generator.getRandomSaoHua,
    generateCommitMessage: generator.generateCommitMessage,
    VALID_TYPES: generator.VALID_TYPES,
    VALID_STYLES: generator.VALID_STYLES,
    getAllTypes: generator.getAllTypes,
    getAllStyles: generator.getAllStyles,
    getTypeInfo: generator.getTypeInfo,
    getStyleInfo: generator.getStyleInfo,
    validateType: generator.validateType,
    validateStyle: generator.validateStyle,
    generateByType: generator.generateByType,
    generateByStyle: generator.generateByStyle,
    generateRandom: generator.generateRandom,
    generateFullCommitMessage: generator.generateFullCommitMessage,
    getDataStats: generator.getDataStats,
    
    supportedLanguages: generator.supportedLanguages,
    defaultLanguage: generator.defaultLanguage,
    validateLanguage: generator.validateLanguage,
    getSupportedLanguages: generator.getSupportedLanguages,
    getDefaultLanguage: generator.getDefaultLanguage,
    
    ASTAnalyzer: smartDetector.ASTAnalyzer,
    DiffAnalyzer: smartDetector.DiffAnalyzer,
    FileTypeAnalyzer: smartDetector.FileTypeAnalyzer,
    SmartDetector: smartDetector.SmartDetector,
    
    analyzeDiff: aiGenerator.analyzeDiff,
    generateWithAI: aiGenerator.generateWithAI,
    generateWithAIAsync: aiGenerator.generateWithAIAsync,
    generateFallback: aiGenerator.generateFallback,
    
    version: '1.25.0',
    packageName: 'git-sao-hua-core'
};
