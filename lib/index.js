const generator = require('./generator.js');
const smartDetector = require('./smart-detector.js');

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
    
    // 智能检测模块 (v1.20.0 新增)
    ASTAnalyzer: smartDetector.ASTAnalyzer,
    DiffAnalyzer: smartDetector.DiffAnalyzer,
    FileTypeAnalyzer: smartDetector.FileTypeAnalyzer,
    SmartDetector: smartDetector.SmartDetector,
    
    version: '1.20.0',
    packageName: 'git-sao-hua-core'
};
