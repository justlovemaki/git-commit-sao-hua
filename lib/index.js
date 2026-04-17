const generator = require('./generator.js');
const smartDetector = require('./smart-detector.js');
const aiGenerator = require('./ai-generator.js');
const hookManager = require('./hook-manager.js');
const configModule = require('./config.js');
const pluginManager = require('./plugin-manager.js');
const versionModule = require('./version.js');
const naturalLanguage = require('./natural-language.js');
const releaseNotes = require('./release-notes.js');

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
    reloadPluginData: generator.reloadPluginData,
    
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
    
    // Hook 管理器 (v1.26.0)
    HookManager: hookManager,
    installHook: hookManager.install,
    uninstallHook: hookManager.uninstall,
    isHookInstalled: hookManager.isInstalled,
    getHookStatus: hookManager.getStatus,
    getHookScript: hookManager.getHookScript,
    
    // 配置系统 (v1.26.0)
    Config: configModule,
    loadConfig: configModule.loadConfig,
    createDefaultConfig: configModule.createDefaultConfig,
    validateConfig: configModule.validateConfig,
    saveConfig: configModule.saveConfig,
    
    // 插件系统 (v1.27.0)
    PluginManager: pluginManager,
    validatePlugin: pluginManager.validatePlugin,
    loadPlugin: pluginManager.loadPlugin,
    loadAllPlugins: pluginManager.loadAllPlugins,
    listPlugins: pluginManager.listPlugins,
    installPluginObject: pluginManager.installPluginObject,
    installPlugin: pluginManager.installPlugin,
    installPluginFromUrl: pluginManager.installPluginFromUrl,
    installPluginFromGitHub: pluginManager.installPluginFromGitHub,
    fetchPluginFromGitHub: pluginManager.fetchPluginFromGitHub,
    fetchPluginFromUrl: pluginManager.fetchPluginFromUrl,
    removePlugin: pluginManager.removePlugin,
    createPluginTemplate: pluginManager.createPluginTemplate,
    fetchPluginIndex: pluginManager.fetchPluginIndex,
    searchPluginIndex: pluginManager.searchPluginIndex,
    installPluginFromIndex: pluginManager.installPluginFromIndex,
    parseGitHubShorthand: pluginManager.parseGitHubShorthand,
    calculateSha256: pluginManager.calculateSha256,
    calculateFileSha256: pluginManager.calculateFileSha256,
    verifyChecksum: pluginManager.verifyChecksum,
    getPluginDetails: pluginManager.getPluginDetails,
    getPluginsLockInfo: pluginManager.getPluginsLockInfo,
    validatePluginJson: pluginManager.validatePluginJson,
    generateIndexEntry: pluginManager.generateIndexEntry,
    generatePluginMetadata: pluginManager.generatePluginMetadata,
    packPlugin: pluginManager.packPlugin,
    DEFAULT_INDEX_URL: pluginManager.DEFAULT_INDEX_URL,
    DEFAULT_GITHUB_REF: pluginManager.DEFAULT_GITHUB_REF,
    DEFAULT_GITHUB_PATHS: pluginManager.DEFAULT_GITHUB_PATHS,

    analyzeLanguage: naturalLanguage.analyzeLanguage,
    extractTopic: naturalLanguage.extractTopic,
    generateFromNaturalLanguage: naturalLanguage.generateFromNaturalLanguage,

    ReleaseNotes: releaseNotes,
    parseConventionalCommit: releaseNotes.parseConventionalCommit,
    parseGitLog: releaseNotes.parseGitLog,
    groupReleaseNotesCommits: releaseNotes.groupCommits,
    buildReleaseNotes: releaseNotes.buildReleaseNotes,
    generateReleaseNotes: releaseNotes.generateReleaseNotes,
    getReleaseNotesGitLog: releaseNotes.getGitLog,
    
    version: versionModule.getVersion() || '1.31.0',
    packageName: 'git-sao-hua-core'
};
