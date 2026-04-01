const assert = require('assert');
const lib = require('./index.js');

console.log('Running git-sao-hua-core tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        passed++;
    } catch (e) {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${e.message}`);
        failed++;
    }
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

console.log('\n=== Module Info Tests ===\n');

test('module should have version', () => {
    assert.ok(lib.version, 'version should exist');
    assert.ok(/^\d+\.\d+\.\d+$/.test(lib.version), 'version should be semver format');
});

test('module should have packageName', () => {
    assert.strictEqual(lib.packageName, 'git-sao-hua-core');
});

console.log('\n=== Summary ===\n');
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
