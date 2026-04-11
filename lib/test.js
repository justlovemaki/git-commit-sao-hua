const assert = require('assert');
const fs = require('fs');
const http = require('http');
const path = require('path');
const lib = require('./index.js');

console.log('Running git-sao-hua-core tests...\n');

let passed = 0;
let failed = 0;
const testCases = [];

function test(name, fn) {
    testCases.push({ name, fn });
}

console.log('=== Data Integrity Tests ===\n');

test('saoHuaData should have 2 languages', () => {
    assert.strictEqual(Object.keys(lib.saoHuaData).length, 2);
});

test('saoHuaData should have zh-CN and en', () => {
    assert.ok(lib.saoHuaData['zh-CN'], 'should have zh-CN');
    assert.ok(lib.saoHuaData['en'], 'should have en');
});

test('commitTypes should have entries for both languages', () => {
    assert.ok(lib.commitTypes['zh-CN'], 'should have zh-CN types');
    assert.ok(lib.commitTypes['en'], 'should have en types');
    assert.strictEqual(lib.commitTypes['zh-CN'].length, 12);
    assert.strictEqual(lib.commitTypes['en'].length, 12);
});

test('styles should have entries for both languages', () => {
    assert.ok(lib.styles['zh-CN'], 'should have zh-CN styles');
    assert.ok(lib.styles['en'], 'should have en styles');
    assert.strictEqual(lib.styles['zh-CN'].length, 5);
    assert.strictEqual(lib.styles['en'].length, 5);
});

test('each language type should have 5 styles', () => {
    for (const lang of ['zh-CN', 'en']) {
        for (const type of lib.VALID_TYPES) {
            assert.strictEqual(Object.keys(lib.saoHuaData[lang][type]).length, 5, `Language ${lang}, Type ${type} should have 5 styles`);
        }
    }
});

test('each language style should have 5 messages', () => {
    for (const lang of ['zh-CN', 'en']) {
        for (const type of lib.VALID_TYPES) {
            for (const style of lib.VALID_STYLES) {
                assert.ok(lib.saoHuaData[lang][type][style].length >= 5, `Language ${lang}, Type ${type}, style ${style} should have at least 5 messages`);
            }
        }
    }
});

console.log('\n=== Language Support Tests ===\n');

test('supportedLanguages should include zh-CN and en', () => {
    assert.deepStrictEqual(lib.supportedLanguages, ['zh-CN', 'en']);
});

test('defaultLanguage should be zh-CN', () => {
    assert.strictEqual(lib.defaultLanguage, 'zh-CN');
});

test('validateLanguage should return true for valid languages', () => {
    assert.strictEqual(lib.validateLanguage('zh-CN'), true);
    assert.strictEqual(lib.validateLanguage('en'), true);
});

test('validateLanguage should return false for invalid languages', () => {
    assert.strictEqual(lib.validateLanguage('invalid'), false);
    assert.strictEqual(lib.validateLanguage('zh'), false);
    assert.strictEqual(lib.validateLanguage(''), false);
});

test('getSupportedLanguages should return array of supported languages', () => {
    const langs = lib.getSupportedLanguages();
    assert.strictEqual(langs.length, 2);
    assert.ok(langs.includes('zh-CN'));
    assert.ok(langs.includes('en'));
});

test('getDefaultLanguage should return default language', () => {
    assert.strictEqual(lib.getDefaultLanguage(), 'zh-CN');
});

console.log('\n=== Generation with Language Tests ===\n');

test('getSaoHua should return Chinese message by default', () => {
    const message = lib.getSaoHua('fix', 'love');
    assert.ok(message.length > 0);
    assert.ok(/[\u4e00-\u9fa5]/.test(message), 'should contain Chinese characters');
});

test('getSaoHua should return Chinese message for zh-CN', () => {
    const message = lib.getSaoHua('fix', 'love', 'zh-CN');
    assert.ok(message.length > 0);
    assert.ok(/[\u4e00-\u9fa5]/.test(message), 'should contain Chinese characters');
});

test('getSaoHua should return English message for en', () => {
    const message = lib.getSaoHua('fix', 'love', 'en');
    assert.ok(message.length > 0);
    assert.ok(/^[a-zA-Z]/.test(message), 'should start with English letter');
});

test('getSaoHua should fallback to default language for invalid language', () => {
    const message = lib.getSaoHua('fix', 'love', 'invalid');
    assert.ok(message.length > 0);
});

test('getRandomSaoHua should return Chinese message by default', () => {
    const result = lib.getRandomSaoHua();
    assert.ok(result.message.length > 0);
    assert.ok(result.language === 'zh-CN' || result.language === undefined);
});

test('getRandomSaoHua should return English message for en', () => {
    const result = lib.getRandomSaoHua('en');
    assert.ok(result.message.length > 0);
    assert.ok(/^[a-zA-Z]/.test(result.message), 'should start with English letter');
    assert.strictEqual(result.language, 'en');
});

test('generateByType should support language parameter', () => {
    const result = lib.generateByType('fix', 'love', 'en');
    assert.strictEqual(result.type, 'fix');
    assert.strictEqual(result.style, 'love');
    assert.ok(result.message.length > 0);
    assert.strictEqual(result.language, 'en');
});

test('generateByStyle should support language parameter', () => {
    const result = lib.generateByStyle('love', 'en');
    assert.strictEqual(result.style, 'love');
    assert.ok(result.message.length > 0);
    assert.strictEqual(result.language, 'en');
});

test('generateRandom should support language parameter', () => {
    const result = lib.generateRandom('en');
    assert.ok(result.type);
    assert.ok(result.style);
    assert.ok(result.message.length > 0);
    assert.strictEqual(result.language, 'en');
});

test('generateFullCommitMessage should support language parameter', () => {
    const result = lib.generateFullCommitMessage('feat', 'sao', 'test feature', 'en');
    assert.ok(result.includes('feat:'));
    assert.ok(result.includes('test feature'));
});

test('getDataStats should support language parameter', () => {
    const stats = lib.getDataStats('en');
    assert.strictEqual(stats.totalTypes, 12);
    assert.strictEqual(stats.totalStyles, 5);
    assert.ok(stats.totalMessages > 0);
    assert.strictEqual(stats.language, 'en');
});

test('getAllTypes should support language parameter', () => {
    const types = lib.getAllTypes('en');
    assert.strictEqual(types.length, 12);
    assert.ok(types.includes('fix'));
});

test('getAllStyles should support language parameter', () => {
    const styles = lib.getAllStyles('en');
    assert.strictEqual(styles.length, 5);
    assert.ok(styles.includes('love'));
});

test('getTypeInfo should support language parameter', () => {
    const info = lib.getTypeInfo('fix', 'en');
    assert.strictEqual(info.value, 'fix');
    assert.strictEqual(info.label, 'fix - fix bug');
});

test('getStyleInfo should support language parameter', () => {
    const info = lib.getStyleInfo('love', 'en');
    assert.strictEqual(info.value, 'love');
    assert.strictEqual(info.label, 'Romantic Mode');
    assert.strictEqual(info.emoji, '💕');
});

console.log('\n=== Random Generation Tests ===\n');

test('generateRandom should return object with required fields', () => {
    const result = lib.generateRandom();
    assert.ok(result.type, 'should have type');
    assert.ok(result.style, 'should have style');
    assert.ok(result.message, 'should have message');
    assert.ok(result.fullMessage, 'should have fullMessage');
});

test('generateRandom should return valid type and style', () => {
    const result = lib.generateRandom();
    assert.ok(lib.VALID_TYPES.includes(result.type), 'type should be valid');
    assert.ok(lib.VALID_STYLES.includes(result.style), 'style should be valid');
});

console.log('\n=== Generate by Type Tests ===\n');

test('generateByType should generate message for valid type', () => {
    const result = lib.generateByType('fix');
    assert.strictEqual(result.type, 'fix');
    assert.ok(result.message.length > 0);
});

test('generateByType should accept style parameter', () => {
    const result = lib.generateByType('fix', 'love');
    assert.strictEqual(result.type, 'fix');
    assert.strictEqual(result.style, 'love');
});

test('generateByType should throw for invalid type', () => {
    assert.throws(() => lib.generateByType('invalid'), /Invalid type/);
});

test('generateByType should throw for invalid style', () => {
    assert.throws(() => lib.generateByType('fix', 'invalid'), /Invalid style/);
});

console.log('\n=== Generate by Style Tests ===\n');

test('generateByStyle should generate message for valid style', () => {
    const result = lib.generateByStyle('love');
    assert.strictEqual(result.style, 'love');
    assert.ok(result.message.length > 0);
});

test('generateByStyle should throw for invalid style', () => {
    assert.throws(() => lib.generateByStyle('invalid'), /Invalid style/);
});

console.log('\n=== Generate Full Commit Message Tests ===\n');

test('generateFullCommitMessage should generate message with description', () => {
    const result = lib.generateFullCommitMessage('feat', 'sao', '登录功能');
    assert.ok(result.includes('feat:'));
    assert.ok(result.includes('登录功能'));
});

test('generateFullCommitMessage should generate message without description', () => {
    const result = lib.generateFullCommitMessage('feat', 'sao');
    assert.ok(result.includes('feat:'));
});

test('generateFullCommitMessage should throw for invalid type', () => {
    assert.throws(() => lib.generateFullCommitMessage('invalid', 'sao'), /Invalid type/);
});

console.log('\n=== Validation Tests ===\n');

test('validateType should return true for valid types', () => {
    assert.strictEqual(lib.validateType('fix'), true);
    assert.strictEqual(lib.validateType('feat'), true);
});

test('validateType should return false for invalid types', () => {
    assert.strictEqual(lib.validateType('invalid'), false);
    assert.strictEqual(lib.validateType(''), false);
});

test('validateStyle should return true for valid styles', () => {
    assert.strictEqual(lib.validateStyle('love'), true);
    assert.strictEqual(lib.validateStyle('sao'), true);
});

test('validateStyle should return false for invalid styles', () => {
    assert.strictEqual(lib.validateStyle('invalid'), false);
    assert.strictEqual(lib.validateStyle(''), false);
});

console.log('\n=== Utility Tests ===\n');

test('getAllTypes should return array of types', () => {
    const types = lib.getAllTypes();
    assert.strictEqual(types.length, 12);
    assert.ok(types.includes('fix'));
});

test('getAllStyles should return array of styles', () => {
    const styles = lib.getAllStyles();
    assert.strictEqual(styles.length, 5);
    assert.ok(styles.includes('love'));
});

test('getTypeInfo should return type info object', () => {
    const info = lib.getTypeInfo('fix');
    assert.strictEqual(info.value, 'fix');
    assert.strictEqual(info.label, 'fix - 修复 bug');
});

test('getStyleInfo should return style info object', () => {
    const info = lib.getStyleInfo('love');
    assert.strictEqual(info.value, 'love');
    assert.strictEqual(info.label, '情话模式');
    assert.strictEqual(info.emoji, '💕');
});

test('getDataStats should return statistics', () => {
    const stats = lib.getDataStats();
    assert.strictEqual(stats.totalTypes, 12);
    assert.strictEqual(stats.totalStyles, 5);
    assert.ok(stats.totalMessages > 0);
    assert.ok(stats.typeStats);
});

console.log('\n=== AI Generator Tests ===\n');

test('analyzeDiff should return object with required fields', () => {
    const diff = `diff --git a/src/index.js b/src/index.js
--- a/src/index.js
+++ b/src/index.js
@@ -1,5 +1,8 @@
+function test() {
+    console.log('test');
+}
 return true;
 `;
    const result = lib.analyzeDiff(diff);
    assert.ok(result.changedFiles, 'should have changedFiles');
    assert.ok(result.fileTypes, 'should have fileTypes');
    assert.ok(result.changeScale, 'should have changeScale');
    assert.ok(result.addedLines >= 0, 'should have addedLines');
    assert.ok(result.removedLines >= 0, 'should have removedLines');
});

test('analyzeDiff should detect changed files', () => {
    const diff = `diff --git a/src/utils.js b/src/utils.js
diff --git a/src/helpers.js b/src/helpers.js
--- a/src/utils.js
+++ b/src/utils.js
+const a = 1;`;
    const result = lib.analyzeDiff(diff);
    assert.strictEqual(result.changedFiles.length, 2);
    assert.ok(result.changedFiles.includes('src/utils.js'));
    assert.ok(result.changedFiles.includes('src/helpers.js'));
});

test('analyzeDiff should detect file types', () => {
    const diff = `diff --git a/src/app.js b/src/app.js
diff --git a/src/styles.css b/src/styles.css
+const a = 1;`;
    const result = lib.analyzeDiff(diff);
    assert.ok(result.fileTypes.includes('.js'));
    assert.ok(result.fileTypes.includes('.css'));
});

test('analyzeDiff should calculate change scale', () => {
    const smallDiff = `diff --git a/test.js b/test.js
+const a = 1;`;
    const smallResult = lib.analyzeDiff(smallDiff);
    assert.strictEqual(smallResult.changeScale, 'small');

    const largeDiff = `diff --git a/test.js b/test.js
+const a = 1;
+const b = 2;
+const c = 3;
+const d = 4;
+const e = 5;
+const f = 6;
+const g = 7;
+const h = 8;
+const i = 9;
+const j = 10;
+const k = 11;
+const l = 12;
+const m = 13;
+const n = 14;
+const o = 15;
+const p = 16;
+const q = 17;
+const r = 18;
+const s = 19;
+const t = 20;
+const u = 21;
+const v = 22;
+const w = 23;
+const x = 24;
+const y = 25;
+const z = 26;
+const aa = 27;
+const ab = 28;
+const ac = 29;
+const ad = 30;
+const ae = 31;
+const af = 32;
+const ag = 33;
+const ah = 34;
+const ai = 35;
+const aj = 36;
+const ak = 37;
+const al = 38;
+const am = 39;
+const an = 40;
+const ao = 41;
+const ap = 42;
+const aq = 43;
+const ar = 44;
+const as = 45;
+const at = 46;
+const au = 47;
+const av = 48;
+const aw = 49;
+const ax = 50;
+const ay = 51;
+const az = 52;
+const ba = 53;
+const bb = 54;
+const bc = 55;
+const bd = 56;
+const be = 57;
+const bf = 58;
+const bg = 59;
+const bh = 60;
+const bi = 61;
+const bj = 62;
+const bk = 63;
+const bl = 64;
+const bm = 65;
+const bn = 66;
+const bo = 67;
+const bp = 68;
+const bq = 69;
+const br = 70;
+const bs = 71;
+const bt = 72;
+const bu = 73;
+const bv = 74;
+const bw = 75;
+const bx = 76;
+const by = 77;
+const bz = 78;
+const ca = 79;
+const cb = 80;
+const cc = 81;
+const cd = 82;
+const ce = 83;
+const cf = 84;
+const cg = 85;
+const ch = 86;
+const ci = 87;
+const cj = 88;
+const ck = 89;
+const cl = 90;
+const cm = 91;
+const cn = 92;
+const co = 93;
+const cp = 94;
+const cq = 95;
+const cr = 96;
+const cs = 97;
+const ct = 98;
+const cu = 99;
+const cv = 100;`;
    const largeResult = lib.analyzeDiff(largeDiff);
    assert.strictEqual(largeResult.changeScale, 'large');
});

test('analyzeDiff should detect features', () => {
    const testDiff = `diff --git a/test.js b/test.js
+describe('test', () => { it('should work', () => {}); });`;
    const result = lib.analyzeDiff(testDiff);
    assert.ok(result.detectedFeatures.includes('测试相关'));
});

test('analyzeDiff should handle empty diff', () => {
    const result = lib.analyzeDiff('');
    assert.strictEqual(result.changeScale, 'none');
    assert.strictEqual(result.changedFiles.length, 0);
});

test('analyzeDiff should handle null input', () => {
    const result = lib.analyzeDiff(null);
    assert.strictEqual(result.changeScale, 'none');
});

test('analyzeDiff should detect key identifiers', () => {
    const diff = `diff --git a/src/app.js b/src/app.js
+function myFunction() {
+    class MyClass {
+        const myConst = 1;
+    }
+}`;
    const result = lib.analyzeDiff(diff);
    assert.ok(result.keyIdentifiers.includes('myFunction'));
    assert.ok(result.keyIdentifiers.includes('MyClass'));
    assert.ok(result.keyIdentifiers.includes('myConst'));
});

test('generateFallback should return valid result', () => {
    const diff = `diff --git a/src/index.js b/src/index.js
+function test() { return true; }`;
    const analysis = lib.analyzeDiff(diff);
    const result = lib.generateFallback(diff, analysis, 'zh-CN', 'sao');
    assert.ok(result.success, 'should be successful');
    assert.ok(result.message.length > 0, 'should have message');
    assert.ok(result.type, 'should have type');
    assert.strictEqual(result.style, 'sao');
    assert.strictEqual(result.isFallback, true);
});

test('generateFallback should detect fix type for bug fixes', () => {
    const diff = `diff --git a/src/index.js b/src/index.js
+function fixBug() { /* fix the bug */ }`;
    const analysis = lib.analyzeDiff(diff);
    const result = lib.generateFallback(diff, analysis, 'zh-CN', 'sao');
    assert.strictEqual(result.type, 'fix');
});

test('generateFallback should detect feat type for new features', () => {
    const diff = `diff --git a/src/index.js b/src/index.js
+function addFeature() { /* add new feature */ }`;
    const analysis = lib.analyzeDiff(diff);
    const result = lib.generateFallback(diff, analysis, 'zh-CN', 'sao');
    assert.strictEqual(result.type, 'feat');
});

test('generateFallback should support English language', () => {
    const diff = `diff --git a/src/index.js b/src/index.js
+function test() {}`;
    const analysis = lib.analyzeDiff(diff);
    const result = lib.generateFallback(diff, analysis, 'en', 'love');
    assert.ok(result.message.length > 0);
    assert.ok(/^[a-zA-Z]/.test(result.message));
});

test('generateWithAI should throw error without API key when fallback disabled', async () => {
    let errorThrown = false;
    try {
        await lib.generateWithAI('diff content', { enableFallback: false, apiKey: '' });
    } catch (e) {
        errorThrown = true;
        assert.ok(e.message.includes('API key'));
    }
    assert.strictEqual(errorThrown, true);
});

test('generateWithAI should fallback when API key is empty', async () => {
    const diff = `diff --git a/src/index.js b/src/index.js
+function test() {}`;
    const result = await lib.generateWithAI(diff, { enableFallback: true, apiKey: '' });
    assert.ok(result.success, 'should fallback successfully');
    assert.strictEqual(result.isFallback, true);
});

test('generateWithAI should fallback on API error', async () => {
    const diff = `diff --git a/src/index.js b/src/index.js
+function test() {}`;
    const result = await lib.generateWithAI(diff, { 
        enableFallback: true, 
        apiKey: 'invalid-key',
        apiUrl: 'https://invalid-url-that-does-not-exist.com'
    });
    assert.ok(result.success, 'should fallback on error');
    assert.strictEqual(result.isFallback, true);
});

console.log('\n=== Hook Manager Tests ===\n');

test('HookManager should be exported', () => {
    assert.ok(lib.HookManager, 'HookManager should exist');
    assert.ok(typeof lib.HookManager.install === 'function', 'install should be a function');
    assert.ok(typeof lib.HookManager.uninstall === 'function', 'uninstall should be a function');
    assert.ok(typeof lib.HookManager.isInstalled === 'function', 'isInstalled should be a function');
    assert.ok(typeof lib.HookManager.getStatus === 'function', 'getStatus should be a function');
    assert.ok(typeof lib.HookManager.getHookScript === 'function', 'getHookScript should be a function');
});

test('installHook shortcut should be exported', () => {
    assert.ok(typeof lib.installHook === 'function', 'installHook should be a function');
    assert.ok(typeof lib.uninstallHook === 'function', 'uninstallHook should be a function');
    assert.ok(typeof lib.isHookInstalled === 'function', 'isHookInstalled should be a function');
});

test('getHookScript should generate valid bash script', () => {
    const script = lib.HookManager.getHookScript();
    assert.ok(script.startsWith('#!/bin/bash'), 'should start with shebang');
    assert.ok(script.includes('prepare-commit-msg'), 'should mention hook name');
    assert.ok(script.includes('COMMIT_MSG_FILE'), 'should reference commit msg file');
    assert.ok(script.includes('GIT_SAO_HUA_SKIP'), 'should support skip env var');
    assert.ok(script.includes('git-sao-hua'), 'should reference CLI tool');
});

test('getHookScript should support chainPrevious option', () => {
    const script = lib.HookManager.getHookScript({ chainPrevious: true });
    assert.ok(script.includes('.bak'), 'should reference backup hook');
    assert.ok(script.includes('PREV_EXIT'), 'should chain previous hook');
});

test('getHookScript should use custom style and language', () => {
    const script = lib.HookManager.getHookScript({ style: 'love', language: 'en' });
    assert.ok(script.includes('love'), 'should use custom style');
    assert.ok(script.includes('en'), 'should use custom language');
});

test('isInstalled should return false for non-git directory', () => {
    const result = lib.HookManager.isInstalled('/tmp/not-a-git-repo-' + Date.now());
    assert.strictEqual(result, false);
});

test('install should fail for non-git directory', () => {
    const result = lib.HookManager.install('/tmp/not-a-git-repo-' + Date.now());
    assert.strictEqual(result.success, false);
    assert.ok(result.message.includes('Git'), 'should mention Git');
});

test('uninstall should fail for non-git directory', () => {
    const result = lib.HookManager.uninstall('/tmp/not-a-git-repo-' + Date.now());
    assert.strictEqual(result.success, false);
});

test('getStatus should report non-git directory', () => {
    const status = lib.HookManager.getStatus('/tmp/not-a-git-repo-' + Date.now());
    assert.strictEqual(status.isGitRepo, false);
    assert.strictEqual(status.installed, false);
});

console.log('\n=== Config Module Tests ===\n');

test('Config should be exported', () => {
    assert.ok(lib.Config, 'Config should exist');
    assert.ok(typeof lib.Config.loadConfig === 'function', 'loadConfig should be a function');
    assert.ok(typeof lib.Config.createDefaultConfig === 'function', 'createDefaultConfig should be a function');
    assert.ok(typeof lib.Config.validateConfig === 'function', 'validateConfig should be a function');
    assert.ok(typeof lib.Config.saveConfig === 'function', 'saveConfig should be a function');
});

test('loadConfig shortcut should be exported', () => {
    assert.ok(typeof lib.loadConfig === 'function', 'loadConfig should be a function');
    assert.ok(typeof lib.createDefaultConfig === 'function', 'createDefaultConfig should be a function');
});

test('createDefaultConfig should return valid default config', () => {
    const config = lib.Config.createDefaultConfig();
    assert.strictEqual(config.style, 'sao');
    assert.strictEqual(config.language, 'zh-CN');
    assert.strictEqual(config.auto, true);
    assert.strictEqual(config.ai, false);
    assert.strictEqual(config.format, 'suffix');
    assert.strictEqual(config.emoji, true);
});

test('createDefaultConfig should return a new object each time', () => {
    const config1 = lib.Config.createDefaultConfig();
    const config2 = lib.Config.createDefaultConfig();
    assert.notStrictEqual(config1, config2, 'should be different objects');
    assert.deepStrictEqual(config1, config2, 'should have same values');
});

test('validateConfig should accept valid config', () => {
    const result = lib.Config.validateConfig({
        style: 'love',
        language: 'en',
        auto: false,
        ai: true,
        format: 'prefix',
        emoji: false
    });
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
});

test('validateConfig should reject invalid style', () => {
    const result = lib.Config.validateConfig({ style: 'invalid' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.length > 0);
});

test('validateConfig should reject invalid type for boolean field', () => {
    const result = lib.Config.validateConfig({ auto: 'yes' });
    assert.strictEqual(result.valid, false);
});

test('validateConfig should reject non-object input', () => {
    const result = lib.Config.validateConfig(null);
    assert.strictEqual(result.valid, false);
    const result2 = lib.Config.validateConfig([1, 2]);
    assert.strictEqual(result2.valid, false);
});

test('validateConfig should ignore unknown keys', () => {
    const result = lib.Config.validateConfig({ unknownKey: 'whatever' });
    assert.strictEqual(result.valid, true);
});

test('loadConfig should return defaults for non-existent path', () => {
    const config = lib.Config.loadConfig('/tmp/non-existent-path-' + Date.now());
    assert.deepStrictEqual(config, lib.Config.createDefaultConfig());
});

test('getConfigPath should return path ending with .saohuarc.json', () => {
    const p = lib.Config.getConfigPath('/some/repo');
    assert.ok(p.endsWith('.saohuarc.json'));
});

console.log('\n=== Hook Install/Uninstall Integration Tests ===\n');

// 使用临时 git 仓库测试安装/卸载流程
const { execSync } = require('child_process');
const os = require('os');

test('hook install/uninstall in temp git repo', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-test-'));
    try {
        execSync('git init', { cwd: tmpDir, stdio: 'pipe' });

        // 初始状态：未安装
        assert.strictEqual(lib.HookManager.isInstalled(tmpDir), false);

        // 安装
        const installResult = lib.HookManager.install(tmpDir);
        assert.strictEqual(installResult.success, true);
        assert.strictEqual(lib.HookManager.isInstalled(tmpDir), true);

        // 状态检查
        const status = lib.HookManager.getStatus(tmpDir);
        assert.strictEqual(status.isGitRepo, true);
        assert.strictEqual(status.installed, true);
        assert.strictEqual(status.hasBackup, false);

        // 重复安装（应成功覆盖）
        const reinstallResult = lib.HookManager.install(tmpDir);
        assert.strictEqual(reinstallResult.success, true);

        // 卸载
        const uninstallResult = lib.HookManager.uninstall(tmpDir);
        assert.strictEqual(uninstallResult.success, true);
        assert.strictEqual(lib.HookManager.isInstalled(tmpDir), false);

        // 重复卸载（应失败）
        const uninstallResult2 = lib.HookManager.uninstall(tmpDir);
        assert.strictEqual(uninstallResult2.success, false);
    } finally {
        // 清理
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('hook install should backup existing non-saohua hook', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-test-'));
    try {
        execSync('git init', { cwd: tmpDir, stdio: 'pipe' });
        const hooksDir = path.join(tmpDir, '.git', 'hooks');
        if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });

        // 写入一个非 saohua 的 hook
        const hookPath = path.join(hooksDir, 'prepare-commit-msg');
        fs.writeFileSync(hookPath, '#!/bin/bash\necho "original hook"', { mode: 0o755 });

        // 安装
        const result = lib.HookManager.install(tmpDir);
        assert.strictEqual(result.success, true);
        assert.ok(result.message.includes('备份'), 'should mention backup');

        // 检查备份存在
        assert.ok(fs.existsSync(hookPath + '.bak'), 'backup should exist');
        const backupContent = fs.readFileSync(hookPath + '.bak', 'utf8');
        assert.ok(backupContent.includes('original hook'), 'backup should have original content');

        // 检查新 hook 有链式调用
        const newHook = fs.readFileSync(hookPath, 'utf8');
        assert.ok(newHook.includes('.bak'), 'new hook should chain to backup');

        // 卸载应恢复原有 hook
        const uninstallResult = lib.HookManager.uninstall(tmpDir);
        assert.strictEqual(uninstallResult.success, true);
        assert.ok(uninstallResult.message.includes('恢复'), 'should mention restore');

        const restoredContent = fs.readFileSync(hookPath, 'utf8');
        assert.ok(restoredContent.includes('original hook'), 'should restore original hook');
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('config save and load in temp directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cfg-'));
    try {
        const customConfig = {
            style: 'love',
            language: 'en',
            auto: false,
            ai: true,
            format: 'prefix',
            emoji: false
        };

        const saved = lib.Config.saveConfig(tmpDir, customConfig);
        assert.strictEqual(saved, true);

        const loaded = lib.Config.loadConfig(tmpDir);
        assert.strictEqual(loaded.style, 'love');
        assert.strictEqual(loaded.language, 'en');
        assert.strictEqual(loaded.auto, false);
        assert.strictEqual(loaded.ai, true);
        assert.strictEqual(loaded.format, 'prefix');
        assert.strictEqual(loaded.emoji, false);
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('loadConfig should return defaults for invalid JSON', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cfg-'));
    try {
        const configPath = path.join(tmpDir, '.saohuarc.json');
        fs.writeFileSync(configPath, 'not valid json{{{', 'utf8');
        const config = lib.Config.loadConfig(tmpDir);
        assert.deepStrictEqual(config, lib.Config.createDefaultConfig());
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

console.log('\n=== Plugin Manager Tests ===\n');

test('PluginManager should be exported', () => {
    assert.ok(lib.PluginManager, 'PluginManager should exist');
    assert.ok(typeof lib.validatePlugin === 'function', 'validatePlugin should be a function');
    assert.ok(typeof lib.loadPlugin === 'function', 'loadPlugin should be a function');
    assert.ok(typeof lib.loadAllPlugins === 'function', 'loadAllPlugins should be a function');
    assert.ok(typeof lib.listPlugins === 'function', 'listPlugins should be a function');
    assert.ok(typeof lib.installPlugin === 'function', 'installPlugin should be a function');
    assert.ok(typeof lib.removePlugin === 'function', 'removePlugin should be a function');
    assert.ok(typeof lib.createPluginTemplate === 'function', 'createPluginTemplate should be a function');
});

test('validatePlugin should accept valid plugin', () => {
    const plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        data: { 'zh-CN': { feat: { love: ['test'] } } }
    };
    const result = lib.validatePlugin(plugin);
    assert.strictEqual(result.valid, true);
});

test('validatePlugin should reject plugin without name', () => {
    const plugin = {
        version: '1.0.0',
        data: { 'zh-CN': { feat: { love: ['test'] } } }
    };
    const result = lib.validatePlugin(plugin);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('name'));
});

test('validatePlugin should reject plugin without version', () => {
    const plugin = {
        name: 'test-plugin',
        data: { 'zh-CN': { feat: { love: ['test'] } } }
    };
    const result = lib.validatePlugin(plugin);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('version'));
});

test('validatePlugin should reject invalid version format', () => {
    const plugin = {
        name: 'test-plugin',
        version: '1.0',
        data: { 'zh-CN': { feat: { love: ['test'] } } }
    };
    const result = lib.validatePlugin(plugin);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('version'));
});

test('validatePlugin should reject plugin without data', () => {
    const plugin = {
        name: 'test-plugin',
        version: '1.0.0'
    };
    const result = lib.validatePlugin(plugin);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('data'));
});

test('validatePlugin should reject non-object plugin', () => {
    assert.strictEqual(lib.validatePlugin(null).valid, false);
    assert.strictEqual(lib.validatePlugin([]).valid, false);
    assert.strictEqual(lib.validatePlugin('string').valid, false);
});

test('validatePlugin should accept optional fields', () => {
    const plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        data: { 'zh-CN': { feat: { love: ['test'] } } },
        description: 'A test plugin',
        author: 'Test Author',
        styles: { 'zh-CN': { custom: { label: 'Custom', emoji: '🎉' } } }
    };
    const result = lib.validatePlugin(plugin);
    assert.strictEqual(result.valid, true);
});

test('loadPlugin should load valid JSON file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const pluginPath = path.join(tmpDir, 'test-plugin.json');
        const plugin = {
            name: 'test-plugin',
            version: '1.0.0',
            data: { 'zh-CN': { feat: { love: ['test message'] } } }
        };
        fs.writeFileSync(pluginPath, JSON.stringify(plugin), 'utf8');
        
        const result = lib.loadPlugin(pluginPath);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.plugin.name, 'test-plugin');
        assert.ok(result.plugin.data['zh-CN'].feat.love.includes('test message'));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('loadPlugin should load plugin from directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const pluginDir = path.join(tmpDir, 'my-plugin');
        fs.mkdirSync(pluginDir, { recursive: true });
        const plugin = {
            name: 'my-plugin',
            version: '1.0.0',
            data: { 'zh-CN': { feat: { sao: ['dir message'] } } }
        };
        fs.writeFileSync(path.join(pluginDir, 'saohua-plugin.json'), JSON.stringify(plugin), 'utf8');
        
        const result = lib.loadPlugin(pluginDir);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.plugin.name, 'my-plugin');
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('loadPlugin should reject non-existent file', () => {
    const result = lib.loadPlugin('/non/existent/path.json');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('不存在'));
});

test('loadPlugin should reject invalid JSON', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const pluginPath = path.join(tmpDir, 'invalid.json');
        fs.writeFileSync(pluginPath, 'not valid json', 'utf8');
        
        const result = lib.loadPlugin(pluginPath);
        assert.strictEqual(result.success, false);
        assert.ok(result.error.includes('JSON'));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('loadPlugin should reject directory without saohua-plugin.json', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const pluginDir = path.join(tmpDir, 'empty-dir');
        fs.mkdirSync(pluginDir, { recursive: true });
        
        const result = lib.loadPlugin(pluginDir);
        assert.strictEqual(result.success, false);
        assert.ok(result.error.includes('saohua-plugin.json'));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('mergePluginData should merge plugin messages', () => {
    const coreData = {
        'zh-CN': {
            feat: {
                love: ['core message 1', 'core message 2']
            }
        }
    };
    const plugins = [
        {
            name: 'test-plugin',
            version: '1.0.0',
            data: {
                'zh-CN': {
                    feat: {
                        love: ['plugin message 1', 'plugin message 2']
                    }
                }
            }
        }
    ];
    const merged = lib.PluginManager.mergePluginData(coreData, plugins);
    assert.ok(merged['zh-CN'].feat.love.includes('core message 1'));
    assert.ok(merged['zh-CN'].feat.love.includes('plugin message 1'));
    assert.ok(merged['zh-CN'].feat.love.includes('plugin message 2'));
});

test('mergePluginData should add new type', () => {
    const coreData = {
        'zh-CN': {
            fix: { love: ['fix message'] }
        }
    };
    const plugins = [
        {
            name: 'test-plugin',
            version: '1.0.0',
            data: {
                'zh-CN': {
                    custom: {
                        love: ['custom message']
                    }
                }
            }
        }
    ];
    const merged = lib.PluginManager.mergePluginData(coreData, plugins);
    assert.ok(merged['zh-CN'].custom);
    assert.ok(merged['zh-CN'].custom.love.includes('custom message'));
});

test('mergePluginData should add new style', () => {
    const coreData = {
        'zh-CN': {
            feat: { love: ['love message'] }
        }
    };
    const plugins = [
        {
            name: 'test-plugin',
            version: '1.0.0',
            data: {
                'zh-CN': {
                    feat: {
                        custom: ['custom style message']
                    }
                }
            }
        }
    ];
    const merged = lib.PluginManager.mergePluginData(coreData, plugins);
    assert.ok(merged['zh-CN'].feat.custom);
    assert.ok(merged['zh-CN'].feat.custom.includes('custom style message'));
});

test('mergePluginData should not overwrite core data', () => {
    const coreData = {
        'zh-CN': {
            feat: {
                love: ['core message']
            }
        }
    };
    const plugins = [
        {
            name: 'test-plugin',
            version: '1.0.0',
            data: {
                'zh-CN': {
                    feat: {
                        love: ['plugin message']
                    }
                }
            }
        }
    ];
    const merged = lib.PluginManager.mergePluginData(coreData, plugins);
    assert.ok(merged['zh-CN'].feat.love.includes('core message'));
    assert.ok(merged['zh-CN'].feat.love.includes('plugin message'));
});

test('mergePluginData should handle empty plugins', () => {
    const coreData = { 'zh-CN': { feat: { love: ['test'] } } };
    const merged = lib.PluginManager.mergePluginData(coreData, []);
    assert.deepStrictEqual(merged, coreData);
});

test('mergePluginData should handle multiple languages', () => {
    const coreData = {
        'zh-CN': { feat: { love: ['zh message'] } },
        'en': { feat: { love: ['en message'] } }
    };
    const plugins = [
        {
            name: 'test-plugin',
            version: '1.0.0',
            data: {
                'zh-CN': { feat: { sao: ['zh sao'] } },
                'en': { feat: { sao: ['en sao'] } }
            }
        }
    ];
    const merged = lib.PluginManager.mergePluginData(coreData, plugins);
    assert.ok(merged['zh-CN'].feat.sao.includes('zh sao'));
    assert.ok(merged['en'].feat.sao.includes('en sao'));
});

test('mergeStyles should add new styles from plugins', () => {
    const coreStyles = {
        'zh-CN': [
            { value: 'love', label: '情话模式', emoji: '💕' }
        ]
    };
    const plugins = [
        {
            name: 'test-plugin',
            version: '1.0.0',
            data: {},
            styles: {
                'zh-CN': {
                    custom: { label: '自定义', emoji: '🎉' }
                }
            }
        }
    ];
    const merged = lib.PluginManager.mergeStyles(coreStyles, plugins);
    assert.ok(merged['zh-CN'].find(s => s.value === 'custom'));
});

test('createPluginTemplate should create valid plugin file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const targetPath = path.join(tmpDir, 'my-template.json');
        const result = lib.createPluginTemplate(targetPath, { name: 'my-template', version: '1.0.0' });
        assert.strictEqual(result.success, true);
        
        const content = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        assert.strictEqual(content.name, 'my-template');
        assert.strictEqual(content.version, '1.0.0');
        assert.ok(content.data['zh-CN']);
        assert.ok(content.styles);
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('installPlugin should copy plugin to plugins directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const sourcePath = path.join(tmpDir, 'source.json');
        const plugin = {
            name: 'install-test-plugin',
            version: '1.0.0',
            data: { 'zh-CN': { feat: { love: ['test'] } } }
        };
        fs.writeFileSync(sourcePath, JSON.stringify(plugin), 'utf8');
        
        const result = lib.installPlugin(sourcePath, tmpDir);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.plugin.name, 'install-test-plugin');
        
        const installedPath = path.join(tmpDir, 'install-test-plugin.json');
        assert.ok(fs.existsSync(installedPath));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('installPlugin should reject duplicate plugin', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const plugin = {
            name: 'duplicate-plugin',
            version: '1.0.0',
            data: { 'zh-CN': { feat: { love: ['test'] } } }
        };
        const pluginPath = path.join(tmpDir, 'duplicate-plugin.json');
        fs.writeFileSync(pluginPath, JSON.stringify(plugin), 'utf8');
        
        const result = lib.installPlugin(pluginPath, tmpDir);
        assert.strictEqual(result.success, false);
        assert.ok(result.error.includes('已存在'));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('removePlugin should delete plugin file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const plugin = {
            name: 'remove-test-plugin',
            version: '1.0.0',
            data: { 'zh-CN': { feat: { love: ['test'] } } }
        };
        const pluginPath = path.join(tmpDir, 'remove-test-plugin.json');
        fs.writeFileSync(pluginPath, JSON.stringify(plugin), 'utf8');
        
        const result = lib.removePlugin('remove-test-plugin', tmpDir);
        assert.strictEqual(result.success, true);
        assert.ok(!fs.existsSync(pluginPath));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('removePlugin should reject non-existent plugin', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    const result = lib.removePlugin('non-existent-plugin', tmpDir);
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('不存在'));
});

test('listPlugins should list installed plugins', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const plugin1 = { name: 'plugin1', version: '1.0.0', data: {} };
        const plugin2 = { name: 'plugin2', version: '2.0.0', data: {} };
        fs.writeFileSync(path.join(tmpDir, 'plugin1.json'), JSON.stringify(plugin1));
        fs.writeFileSync(path.join(tmpDir, 'plugin2.json'), JSON.stringify(plugin2));
        
        const plugins = lib.listPlugins(tmpDir);
        assert.strictEqual(plugins.length, 2);
        assert.ok(plugins.find(p => p.name === 'plugin1'));
        assert.ok(plugins.find(p => p.name === 'plugin2'));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('loadAllPlugins should load all plugins from directory', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const plugin1 = { name: 'load-all-1', version: '1.0.0', data: {} };
        const plugin2 = { name: 'load-all-2', version: '1.0.0', data: {} };
        fs.writeFileSync(path.join(tmpDir, 'load-all-1.json'), JSON.stringify(plugin1));
        fs.writeFileSync(path.join(tmpDir, 'load-all-2.json'), JSON.stringify(plugin2));
        
        const plugins = lib.loadAllPlugins(tmpDir);
        assert.strictEqual(plugins.length, 2);
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('reloadPluginData should reload plugin data', () => {
    assert.ok(typeof lib.reloadPluginData === 'function', 'reloadPluginData should be a function');
});

console.log('\n=== Plugin URL Install Tests ===\n');

test('installPluginFromUrl should be exported', () => {
    assert.ok(typeof lib.installPluginFromUrl === 'function', 'installPluginFromUrl should be a function');
});

test('installPluginFromUrl should reject invalid URL', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const result = await lib.installPluginFromUrl('invalid-url', tmpDir);
        assert.strictEqual(result.success, false);
        assert.ok(result.error.includes('无效'));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('installPluginFromUrl should reject unsupported protocol', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const result = await lib.installPluginFromUrl('ftp://example.com/plugin.json', tmpDir);
        assert.strictEqual(result.success, false);
        assert.ok(result.error.includes('http/https'));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('fetchPluginFromUrl should be exported', () => {
    assert.ok(typeof lib.fetchPluginFromUrl === 'function', 'fetchPluginFromUrl should be a function');
});

test('installPluginObject should be exported', () => {
    assert.ok(typeof lib.installPluginObject === 'function', 'installPluginObject should be a function');
});

test('installPluginFromUrl should install plugin from local HTTP server', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    const plugin = {
        name: 'remote-test-plugin',
        version: '1.0.0',
        description: 'Remote plugin',
        data: {
            'zh-CN': {
                feat: {
                    love: ['远程插件安装成功']
                }
            }
        }
    };

    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(plugin));
    });

    await new Promise(resolve => server.listen(0, resolve));

    try {
        const url = `http://127.0.0.1:${server.address().port}/plugin.json`;
        const result = await lib.installPluginFromUrl(url, tmpDir);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.plugin.name, 'remote-test-plugin');
        assert.strictEqual(result.plugin.sourceUrl, url);
        assert.ok(fs.existsSync(path.join(tmpDir, 'remote-test-plugin.json')));
    } finally {
        await new Promise(resolve => server.close(resolve));
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('installPluginFromUrl should reject duplicate remote plugin install', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    const plugin = {
        name: 'duplicate-remote-plugin',
        version: '1.0.0',
        data: {
            'zh-CN': {
                fix: {
                    sao: ['远程重复安装测试']
                }
            }
        }
    };

    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(plugin));
    });

    await new Promise(resolve => server.listen(0, resolve));

    try {
        const url = `http://127.0.0.1:${server.address().port}/plugin.json`;
        const first = await lib.installPluginFromUrl(url, tmpDir);
        const second = await lib.installPluginFromUrl(url, tmpDir);
        assert.strictEqual(first.success, true);
        assert.strictEqual(second.success, false);
        assert.ok(second.error.includes('已存在'));
    } finally {
        await new Promise(resolve => server.close(resolve));
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('fetchPluginFromUrl should reject invalid remote plugin JSON', async () => {
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ nope: true }));
    });

    await new Promise(resolve => server.listen(0, resolve));

    try {
        const url = `http://127.0.0.1:${server.address().port}/bad-plugin.json`;
        const result = await lib.fetchPluginFromUrl(url);
        assert.strictEqual(result.success, false);
        assert.ok(result.error.includes('插件验证失败'));
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('DEFAULT_PLUGIN_FETCH_TIMEOUT should be exported', () => {
    assert.strictEqual(lib.PluginManager.DEFAULT_PLUGIN_FETCH_TIMEOUT, 30000);
});

console.log('\n=== Module Info Tests ===\n');

test('module should have version', () => {
    assert.ok(lib.version, 'version should exist');
    assert.ok(/^\d+\.\d+\.\d+$/.test(lib.version), 'version should be semver format');
});

test('module should have packageName', () => {
    assert.strictEqual(lib.packageName, 'git-sao-hua-core');
});

console.log('\n=== Summary ===\n');

async function runTests() {
    for (const { name, fn } of testCases) {
        try {
            await fn();
            console.log(`✓ ${name}`);
            passed++;
        } catch (e) {
            console.log(`✗ ${name}`);
            console.log(`  Error: ${e.message}`);
            failed++;
        }
    }

    console.log(`Total: ${passed + failed} tests`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
        console.log('\n⚠️  Some tests failed!');
        process.exit(1);
    } else {
        console.log('\n✅ All tests passed!');
        process.exit(0);
    }
}

runTests().catch((error) => {
    console.error('测试运行失败:', error);
    process.exit(1);
});
