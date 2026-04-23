const assert = require('assert');
const fs = require('fs');
const http = require('http');
const https = require('https');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const lib = require('./index.js');
const versionModule = require('./version.js');
const naturalLanguage = require('./natural-language.js');

process.env.NODE_ENV = 'test';

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

console.log('\n=== Batch Generation Tests ===\n');

test('generateBatch should be exported', () => {
    assert.ok(typeof lib.generateBatch === 'function', 'generateBatch should be a function');
});

test('MAX_BATCH_SIZE should be 50', () => {
    assert.strictEqual(lib.MAX_BATCH_SIZE, 50);
});

test('generateBatch should validate items array', async () => {
    const result = await lib.generateBatch(null);
    assert.strictEqual(result.success, false);
    assert.ok(result.error);
});

test('generateBatch should reject empty items', async () => {
    const result = await lib.generateBatch([]);
    assert.strictEqual(result.success, false);
});

test('generateBatch should generate random items', async () => {
    const items = [
        { mode: 'random' },
        { mode: 'random' }
    ];
    const result = await lib.generateBatch(items);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.count, 2);
    assert.strictEqual(result.successCount, 2);
    assert.ok(result.items[0].message);
    assert.ok(result.items[1].message);
});

test('generateBatch should generate typed items', async () => {
    const items = [
        { mode: 'typed', type: 'fix' },
        { mode: 'typed', type: 'feat', style: 'love' }
    ];
    const result = await lib.generateBatch(items);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.count, 2);
    assert.strictEqual(result.items[0].type, 'fix');
    assert.strictEqual(result.items[1].style, 'love');
});

test('generateBatch should require type for typed mode', async () => {
    const items = [
        { mode: 'typed' }
    ];
    const result = await lib.generateBatch(items);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.items[0].success, false);
    assert.ok(result.items[0].error.includes('type'));
});

test('generateBatch should require type and style for typed_style mode', async () => {
    const items = [
        { mode: 'typed_style', type: 'fix' }
    ];
    const result = await lib.generateBatch(items);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.items[0].success, false);
    assert.ok(result.items[0].error.includes('style'));
});

test('generateBatch should respect maxItems limit', async () => {
    const items = Array.from({ length: 51 }, () => ({ mode: 'random' }));
    const result = await lib.generateBatch(items, { maxItems: 50 });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('50'));
});

test('parseConventionalCommit should detect type scope and breaking change', () => {
    const parsed = lib.parseConventionalCommit('feat(cli)!: ship release notes', 'BREAKING CHANGE: command renamed');
    assert.strictEqual(parsed.type, 'feat');
    assert.strictEqual(parsed.scope, 'cli');
    assert.strictEqual(parsed.description, 'ship release notes');
    assert.strictEqual(parsed.breaking, true);
});

test('generateReleaseNotes should group commits into markdown sections', () => {
    const logText = [
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\x1ffeat(cli): add release notes\x1f\x1e',
        'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\x1ffix(api): harden auth\x1f\x1e',
        'cccccccccccccccccccccccccccccccccccccccc\x1fchore: tidy docs\x1f\x1e'
    ].join('');

    const result = lib.generateReleaseNotes('v1.0.0..HEAD', {
        title: 'v1.1.0',
        generatedAt: '2026-04-17T10:00:00.000Z',
        logText
    });

    assert.strictEqual(result.commits.length, 3);
    assert.match(result.markdown, /# v1.1.0/);
    assert.match(result.markdown, /Range: `v1.0.0..HEAD`/);
    assert.match(result.markdown, /## Features/);
    assert.match(result.markdown, /## Fixes/);
    assert.match(result.markdown, /## Chores/);
    assert.match(result.markdown, /\*\*cli:\*\* add release notes/);
});

test('parseGitLog should parse authorName and authorEmail', () => {
    const logText = [
        'abc123def456\x1ffeat(api): add endpoint\x1f\x1fTest Author\x1ftest@example.com\x1e',
        'def456abc789\x1ffix(core): resolve issue (#123)\x1f\x1fAnother Dev\x1fdev@local.org\x1e'
    ].join('');

    const commits = lib.parseGitLog(logText, { includeAuthor: true });

    assert.strictEqual(commits.length, 2);
    assert.strictEqual(commits[0].authorName, 'Test Author');
    assert.strictEqual(commits[0].authorEmail, 'test@example.com');
    assert.strictEqual(commits[1].authorName, 'Another Dev');
    assert.strictEqual(commits[1].authorEmail, 'dev@local.org');
});

test('extractPRNumbers should extract PR numbers from subject', () => {
    const prs = lib.extractPRNumbers('feat(api): add endpoint (#456) and fix (#789)');
    assert.deepStrictEqual(prs, ['456', '789']);

    const noPr = lib.extractPRNumbers('chore: regular commit');
    assert.deepStrictEqual(noPr, []);
});

test('parseCompareRange should parse valid range format', () => {
    const range = lib.parseCompareRange('v1.0.0..HEAD');
    assert.deepStrictEqual(range, { from: 'v1.0.0', to: 'HEAD' });

    const hashRange = lib.parseCompareRange('abc123..def456');
    assert.deepStrictEqual(hashRange, { from: 'abc123', to: 'def456' });

    assert.strictEqual(lib.parseCompareRange(null), null);
    assert.strictEqual(lib.parseCompareRange('HEAD'), null);
});

test('generateReleaseNotes with repo should include commit and PR links', () => {
    const logText = [
        'abc123def456\x1ffeat(cli): add release notes (#100)\x1f\x1e',
        'def456abc789\x1ffix(api): harden auth (#200)\x1f\x1e'
    ].join('');

    const result = lib.generateReleaseNotes('v1.0.0..HEAD', {
        title: 'v1.1.0',
        logText,
        repo: 'owner/repo'
    });

    assert.match(result.markdown, /Repository: owner\/repo/);
    assert.match(result.markdown, /\[[a-f0-9]+\]\(https:\/\/github\.com\/owner\/repo\/commit\/abc123def456\)/);
    assert.match(result.markdown, /\[#100\]\(https:\/\/github\.com\/owner\/repo\/pull\/100\)/);
    assert.match(result.markdown, /\[#200\]\(https:\/\/github\.com\/owner\/repo\/pull\/200\)/);
});

test('generateReleaseNotes with repo should include compare link for range', () => {
    const logText = 'abc123def456\x1ffeat( ): single commit\x1f\x1e';

    const result = lib.generateReleaseNotes('v1.0.0..v1.1.0', {
        title: 'v1.1.0',
        logText,
        repo: 'owner/repo'
    });

    assert.match(result.markdown, /\[v1\.0\.0\.\.\.v1\.1\.0\]\(https:\/\/github\.com\/owner\/repo\/compare\/v1\.0\.0\.\.\.v1\.1\.0\)/);
});

test('generateReleaseNotes should infer repo from git remote', () => {
    const logText = 'abc123def456\x1ffeat( ): test\x1f\x1e';

    const result = lib.generateReleaseNotes('HEAD', {
        logText,
        inferRepo: false,
        repo: null
    });

    assert.strictEqual(result.repo, null);
});

test('buildGitHubReleasePayload should return GitHub Release API format', () => {
    const logText = [
        'abc123def456\x1ffeat(cli): add release notes (#100)\x1f\x1e',
        'def456abc789\x1ffix(api): harden auth (#200)\x1f\x1e'
    ].join('');

    const commits = lib.parseGitLog(logText);
    const payload = lib.buildGitHubReleasePayload(commits, {
        tagName: 'v1.1.0',
        name: 'v1.1.0 Release',
        repo: 'owner/repo'
    });

    assert.strictEqual(payload.tag_name, 'v1.1.0');
    assert.strictEqual(payload.name, 'v1.1.0 Release');
    assert.ok(payload.body.includes('### Features'));
    assert.ok(payload.body.includes('add release notes'));
    assert.ok(payload.body.includes('### Fixes'));
    assert.ok(payload.body.includes('harden auth'));
    assert.strictEqual(payload.draft, false);
    assert.strictEqual(payload.prerelease, false);
});

test('buildGitHubReleasePayload should include commit and PR links when repo provided', () => {
    const logText = [
        'abc123def456\x1ffeat(cli): add release notes (#100)\x1f\x1e'
    ].join('');

    const commits = lib.parseGitLog(logText);
    const payload = lib.buildGitHubReleasePayload(commits, {
        tagName: 'v1.1.0',
        name: 'v1.1.0',
        repo: 'owner/repo'
    });

    assert.ok(payload.body.includes('github.com/owner/repo/commit/abc123def456'));
    assert.ok(payload.body.includes('github.com/owner/repo/pull/100'));
});

test('buildGitHubReleasePayload should handle draft and prerelease flags', () => {
    const logText = 'abc123def456\x1ffeat( ): test\x1f\x1e';
    const commits = lib.parseGitLog(logText);

    const payload = lib.buildGitHubReleasePayload(commits, {
        tagName: 'v1.0.0-beta',
        name: 'v1.0.0-beta',
        draft: true,
        prerelease: true,
        targetCommitish: 'main'
    });

    assert.strictEqual(payload.draft, true);
    assert.strictEqual(payload.prerelease, true);
    assert.strictEqual(payload.target_commitish, 'main');
});

test('buildGitHubReleasePayload should handle breaking changes', () => {
    const logText = [
        'abc123def456\x1ffeat(cli)!: breaking change (#100)\x1fBREAKING CHANGE: removed old API\x1e'
    ].join('');

    const commits = lib.parseGitLog(logText);
    const payload = lib.buildGitHubReleasePayload(commits, {
        tagName: 'v2.0.0',
        name: 'v2.0.0'
    });

    assert.ok(payload.body.includes('### Breaking Changes'));
    assert.ok(payload.body.includes('removed old API'));
});

test('generateReleaseNotes should include githubRelease when tagName provided', () => {
    const logText = [
        'abc123def456\x1ffeat(api): add feature\x1f\x1e'
    ].join('');

    const result = lib.generateReleaseNotes('HEAD', {
        title: 'v1.1.0',
        tagName: 'v1.1.0',
        logText,
        repo: 'owner/repo'
    });

    assert.ok(result.githubRelease);
    assert.strictEqual(result.githubRelease.tag_name, 'v1.1.0');
    assert.strictEqual(result.githubRelease.name, 'v1.1.0');
    assert.ok(result.githubRelease.body.includes('### Features'));
    assert.ok(result.githubRelease.body.includes('add feature'));
});

test('generateReleaseNotesWithGitHub should enrich markdown json and release payload', async () => {
    const logText = [
        'abc123def456\x1ffeat(cli): add release notes (#101)\x1f\x1e'
    ].join('');

    const fetchImpl = async () => ({
        ok: true,
        json: async () => ({
            number: 101,
            title: 'Ship release notes UX',
            html_url: 'https://github.com/owner/repo/pull/101',
            user: { login: 'maki' },
            labels: [{ name: 'release' }, { name: 'feature' }],
            merged_at: '2026-04-22T10:00:00Z',
            state: 'closed'
        })
    });

    const result = await lib.generateReleaseNotesWithGitHub('v1.0.0..HEAD', {
        title: 'v1.1.0',
        tagName: 'v1.1.0',
        repo: 'owner/repo',
        logText,
        enrichGitHub: true,
        fetchImpl
    });

    assert.match(result.markdown, /> PRs: 1/);
    assert.match(result.markdown, /> Labels: release, feature/);
    assert.match(result.markdown, /> PR Authors: @maki/);
    assert.match(result.markdown, /\[`release`\]/);
    assert.match(result.markdown, /\[@maki\]/);
    assert.strictEqual(result.data.github.prCount, 1);
    assert.deepStrictEqual(result.data.commits[0].github.labels, ['release', 'feature']);
    assert.strictEqual(result.data.commits[0].github.authorLogin, 'maki');
    assert.match(result.githubRelease.body, /\[`release`\]/);
    assert.match(result.githubRelease.body, /\[@maki\]/);
});

test('generateGitHubReleasePayload shortcut should be exported', () => {
    assert.ok(typeof lib.buildGitHubReleasePayload === 'function', 'buildGitHubReleasePayload should be exported');
});

test('syncReleaseNotesToChangelog should be exported', () => {
    assert.ok(typeof lib.syncReleaseNotesToChangelog === 'function', 'syncReleaseNotesToChangelog should be exported');
});

test('syncReleaseNotesToChangelog should create new CHANGELOG', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-changelog-'));
    try {
        const releaseNotes = '# v1.0.0\n\n## Features\n\n- new feature';
        const result = lib.syncReleaseNotesToChangelog(releaseNotes, {
            changelogPath: path.join(tmpDir, 'CHANGELOG.md'),
            versionTitle: 'v1.0.0',
            repoPath: tmpDir
        });

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.existed, false);
        assert.ok(fs.existsSync(path.join(tmpDir, 'CHANGELOG.md')));
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('syncReleaseNotesToChangelog should prepend version section', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-changelog-'));
    try {
        const existingContent = '# Changelog\n\n## v0.9.0\n\n- old change';
        fs.writeFileSync(path.join(tmpDir, 'CHANGELOG.md'), existingContent, 'utf8');

        const releaseNotes = '# v1.0.0\n\n## Features\n\n- new feature';
        const result = lib.syncReleaseNotesToChangelog(releaseNotes, {
            changelogPath: path.join(tmpDir, 'CHANGELOG.md'),
            versionTitle: 'v1.0.0',
            repoPath: tmpDir
        });

        assert.strictEqual(result.success, true);
        const content = fs.readFileSync(path.join(tmpDir, 'CHANGELOG.md'), 'utf8');
        assert.ok(content.includes('## v1.0.0'));
        assert.ok(content.includes('## v0.9.0'));
        assert.ok(content.includes('new feature'));
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('syncReleaseNotesToChangelog should replace existing version section', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-changelog-'));
    try {
        const existingContent = '# Changelog\n\n## v1.0.0\n\n- old change\n\n## v0.9.0\n\n- older';
        fs.writeFileSync(path.join(tmpDir, 'CHANGELOG.md'), existingContent, 'utf8');

        const releaseNotes = '# v1.0.0\n\n## Features\n\n- updated feature';
        const result = lib.syncReleaseNotesToChangelog(releaseNotes, {
            changelogPath: path.join(tmpDir, 'CHANGELOG.md'),
            versionTitle: 'v1.0.0',
            repoPath: tmpDir
        });

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.replaced, true);
        const content = fs.readFileSync(path.join(tmpDir, 'CHANGELOG.md'), 'utf8');
        assert.ok(content.includes('## v1.0.0'));
        assert.ok(content.includes('updated feature'));
        assert.ok(!content.includes('old change'));
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('inferContentType should infer content type from extension', () => {
    assert.strictEqual(lib.inferContentType('app.zip'), 'application/zip');
    assert.strictEqual(lib.inferContentType('archive.tar.gz'), 'application/gzip');
    assert.strictEqual(lib.inferContentType('file.json'), 'application/json');
    assert.strictEqual(lib.inferContentType('image.png'), 'image/png');
    assert.strictEqual(lib.inferContentType('binary.exe'), 'application/x-msdownload');
});

test('inferContentType should return octet-stream for unknown extension', () => {
    assert.strictEqual(lib.inferContentType('file.xyz'), 'application/octet-stream');
    assert.strictEqual(lib.inferContentType('file.unknown'), 'application/octet-stream');
});

test('inferContentType should handle empty input', () => {
    assert.strictEqual(lib.inferContentType(''), 'application/octet-stream');
    assert.strictEqual(lib.inferContentType(null), 'application/octet-stream');
});

test('collectAssetMetadata should collect file metadata', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-asset-'));
    try {
        const filePath = path.join(tmpDir, 'test.zip');
        fs.writeFileSync(filePath, 'test content', 'utf8');

        const result = lib.collectAssetMetadata(filePath);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.name, 'test.zip');
        assert.strictEqual(result.path, filePath);
        assert.ok(result.size > 0);
        assert.ok(result.sha256);
        assert.strictEqual(result.contentType, 'application/zip');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('collectAssetMetadata should handle non-existent file', () => {
    const result = lib.collectAssetMetadata('/non/existent/file.zip');
    assert.strictEqual(result.success, false);
    assert.ok(result.error);
});

test('collectAssetMetadataBatch should collect multiple files', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-assets-'));
    try {
        const file1 = path.join(tmpDir, 'app.zip');
        const file2 = path.join(tmpDir, 'data.json');
        fs.writeFileSync(file1, 'content1', 'utf8');
        fs.writeFileSync(file2, '{"key": "value"}', 'utf8');

        const result = lib.collectAssetMetadataBatch([file1, file2]);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.assets.length, 2);
        assert.strictEqual(result.assets[0].name, 'app.zip');
        assert.strictEqual(result.assets[1].name, 'data.json');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('collectAssetMetadataBatch should handle missing files', () => {
    const result = lib.collectAssetMetadataBatch(['/non/existent/file.zip', '/also/missing.txt']);
    assert.strictEqual(result.success, false);
    assert.ok(result.errors);
    assert.strictEqual(result.errors.length, 2);
});

test('collectAssetMetadataBatch should reject non-array', () => {
    const result = lib.collectAssetMetadataBatch('/single/file');
    assert.strictEqual(result.success, false);
    assert.ok(result.error);
});

test('buildGitHubReleaseManifest should create manifest with assets', () => {
    const githubRelease = { tag_name: 'v1.0.0', name: 'Release 1.0.0', body: 'Release notes' };
    const assets = [
        { name: 'app.zip', path: '/path/app.zip', size: 1024, sha256: 'abc123', contentType: 'application/zip' }
    ];

    const result = lib.buildGitHubReleaseManifest(githubRelease, assets);
    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.githubRelease, githubRelease);
    assert.strictEqual(result.assets.length, 1);
    assert.strictEqual(result.assets[0].name, 'app.zip');
    assert.strictEqual(result.assets[0].contentType, 'application/zip');
});

test('buildGitHubReleaseManifest should reject invalid release', () => {
    const result = lib.buildGitHubReleaseManifest(null, []);
    assert.strictEqual(result.success, false);
    assert.ok(result.error);
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
        const lockPath = lib.PluginManager.getPluginsLockFilePath(tmpDir);
        assert.ok(fs.existsSync(lockPath));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('getPluginDetails should return plugin provenance and lock info', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const plugin = {
            name: 'details-plugin',
            version: '1.2.3',
            data: { 'zh-CN': { feat: { love: ['details'] } } }
        };

        const result = lib.installPluginObject(plugin, tmpDir, {
            sourceType: 'github',
            sourceUrl: 'https://raw.githubusercontent.com/foo/bar/main/plugin.json',
            checksum: 'abc123',
            githubSpec: 'foo/bar@main'
        });

        assert.strictEqual(result.success, true);

        const details = lib.getPluginDetails('details-plugin', tmpDir);
        assert.strictEqual(details.success, true);
        assert.strictEqual(details.plugin.name, 'details-plugin');
        assert.strictEqual(details.plugin.sourceType, 'github');
        assert.strictEqual(details.plugin.githubSpec, 'foo/bar@main');
        assert.strictEqual(details.plugin.checksum, 'abc123');
        assert.ok(details.plugin.installedAt);
        assert.ok(details.lockEntry);
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

test('DEFAULT_INDEX_URL should be exported', () => {
    assert.ok(lib.DEFAULT_INDEX_URL, 'DEFAULT_INDEX_URL should exist');
    assert.ok(typeof lib.DEFAULT_INDEX_URL === 'string', 'DEFAULT_INDEX_URL should be a string');
});

console.log('\n=== Plugin Index Tests ===\n');

test('fetchPluginIndex should be exported', () => {
    assert.ok(typeof lib.fetchPluginIndex === 'function', 'fetchPluginIndex should be a function');
});

test('searchPluginIndex should be exported', () => {
    assert.ok(typeof lib.searchPluginIndex === 'function', 'searchPluginIndex should be a function');
});

test('installPluginFromIndex should be exported', () => {
    assert.ok(typeof lib.installPluginFromIndex === 'function', 'installPluginFromIndex should be a function');
});

test('fetchPluginIndex should reject invalid URL', async () => {
    const result = await lib.fetchPluginIndex('invalid-url');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('无效'));
});

test('fetchPluginIndex should reject unsupported protocol', async () => {
    const result = await lib.fetchPluginIndex('ftp://example.com/index.json');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('http/https'));
});

test('fetchPluginIndex should fetch index from local HTTP server', async () => {
    const indexData = {
        plugins: [
            { name: 'plugin1', version: '1.0.0', sourceUrl: 'http://example.com/p1.json' },
            { name: 'plugin2', version: '2.0.0', sourceUrl: 'http://example.com/p2.json' }
        ]
    };

    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(indexData));
    });

    await new Promise(resolve => server.listen(0, resolve));

    try {
        const url = `http://127.0.0.1:${server.address().port}/index.json`;
        const result = await lib.fetchPluginIndex(url);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.index.plugins.length, 2);
        assert.strictEqual(result.index.plugins[0].name, 'plugin1');
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('fetchPluginIndex should reject invalid index JSON', async () => {
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ notPlugins: true }));
    });

    await new Promise(resolve => server.listen(0, resolve));

    try {
        const url = `http://127.0.0.1:${server.address().port}/index.json`;
        const result = await lib.fetchPluginIndex(url);
        assert.strictEqual(result.success, false);
        assert.ok(result.error.includes('索引格式无效'));
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('searchPluginIndex should search plugins by name', async () => {
    const indexData = {
        plugins: [
            { name: 'love-pack', version: '1.0.0', description: '情话插件', sourceUrl: 'http://example.com/p1.json' },
            { name: 'sao-pack', version: '1.0.0', description: '骚话插件', sourceUrl: 'http://example.com/p2.json' },
            { name: 'fix-pack', version: '1.0.0', description: '修复插件', sourceUrl: 'http://example.com/p3.json' }
        ]
    };

    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(indexData));
    });

    await new Promise(resolve => server.listen(0, resolve));

    try {
        const url = `http://127.0.0.1:${server.address().port}/index.json`;
        const result = await lib.searchPluginIndex('love', url);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.plugins.length, 1);
        assert.strictEqual(result.plugins[0].name, 'love-pack');
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('searchPluginIndex should search plugins by description', async () => {
    const indexData = {
        plugins: [
            { name: 'plugin1', version: '1.0.0', description: 'Chinese love messages', sourceUrl: 'http://example.com/p1.json' },
            { name: 'plugin2', version: '1.0.0', description: 'English jokes', sourceUrl: 'http://example.com/p2.json' }
        ]
    };

    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(indexData));
    });

    await new Promise(resolve => server.listen(0, resolve));

    try {
        const url = `http://127.0.0.1:${server.address().port}/index.json`;
        const result = await lib.searchPluginIndex('love', url);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.plugins.length, 1);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('searchPluginIndex should search plugins by tags', async () => {
    const indexData = {
        plugins: [
            { name: 'plugin1', version: '1.0.0', tags: ['love', 'chinese'], sourceUrl: 'http://example.com/p1.json' },
            { name: 'plugin2', version: '1.0.0', tags: ['sao', 'english'], sourceUrl: 'http://example.com/p2.json' }
        ]
    };

    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(indexData));
    });

    await new Promise(resolve => server.listen(0, resolve));

    try {
        const url = `http://127.0.0.1:${server.address().port}/index.json`;
        const result = await lib.searchPluginIndex('chinese', url);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.plugins.length, 1);
        assert.strictEqual(result.plugins[0].name, 'plugin1');
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('searchPluginIndex should return all plugins when query is empty', async () => {
    const indexData = {
        plugins: [
            { name: 'plugin1', version: '1.0.0', sourceUrl: 'http://example.com/p1.json' },
            { name: 'plugin2', version: '1.0.0', sourceUrl: 'http://example.com/p2.json' }
        ]
    };

    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(indexData));
    });

    await new Promise(resolve => server.listen(0, resolve));

    try {
        const url = `http://127.0.0.1:${server.address().port}/index.json`;
        const result = await lib.searchPluginIndex('', url);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.plugins.length, 2);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('installPluginFromIndex should install plugin from index', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    
    const indexData = {
        plugins: [
            { name: 'index-install-plugin', version: '1.0.0', sourceUrl: `http://127.0.0.1:9999/plugin.json` }
        ]
    };

    const pluginData = {
        name: 'index-install-plugin',
        version: '1.0.0',
        description: 'From index',
        data: {
            'zh-CN': {
                feat: {
                    love: ['索引安装成功']
                }
            }
        }
    };

    let indexServerReady = false;
    let pluginServerReady = false;

    const indexServer = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(indexData));
    });

    const pluginServer = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pluginData));
    });

    await new Promise(resolve => indexServer.listen(0, resolve));
    const indexPort = indexServer.address().port;

    await new Promise(resolve => pluginServer.listen(0, resolve));
    const pluginPort = pluginServer.address().port;

    indexData.plugins[0].sourceUrl = `http://127.0.0.1:${pluginPort}/plugin.json`;

    try {
        const url = `http://127.0.0.1:${indexPort}/index.json`;
        const result = await lib.installPluginFromIndex('index-install-plugin', url, tmpDir);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.plugin.name, 'index-install-plugin');
        assert.ok(fs.existsSync(path.join(tmpDir, 'index-install-plugin.json')));
    } finally {
        await new Promise(resolve => indexServer.close(resolve));
        await new Promise(resolve => pluginServer.close(resolve));
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('installPluginFromIndex should reject non-existent plugin', async () => {
    const indexData = {
        plugins: [
            { name: 'plugin1', version: '1.0.0', sourceUrl: 'http://example.com/p1.json' }
        ]
    };

    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(indexData));
    });

    await new Promise(resolve => server.listen(0, resolve));

    try {
        const url = `http://127.0.0.1:${server.address().port}/index.json`;
        const result = await lib.installPluginFromIndex('non-existent', url);
        assert.strictEqual(result.success, false);
        assert.ok(result.error.includes('未找到'));
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('installPluginFromIndex should reject plugin without sourceUrl', async () => {
    const indexData = {
        plugins: [
            { name: 'no-source-plugin', version: '1.0.0' }
        ]
    };

    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(indexData));
    });

    await new Promise(resolve => server.listen(0, resolve));

    try {
        const url = `http://127.0.0.1:${server.address().port}/index.json`;
        const result = await lib.installPluginFromIndex('no-source-plugin', url);
        assert.strictEqual(result.success, false);
        assert.ok(result.error.includes('sourceUrl'));
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

console.log('\n=== Module Info Tests ===\n');

test('module should have version', () => {
    assert.ok(lib.version, 'version should exist');
    assert.ok(/^\d+\.\d+\.\d+$/.test(lib.version), 'version should be semver format');
});

test('module should have packageName', () => {
    assert.strictEqual(lib.packageName, 'git-sao-hua-core');
});

test('versionModule should export getVersion function', () => {
    assert.ok(typeof versionModule.getVersion === 'function', 'getVersion should be a function');
});

test('versionModule.getVersion should return version string', () => {
    const version = versionModule.getVersion();
    assert.ok(version, 'getVersion should return a value');
    assert.ok(/^\d+\.\d+\.\d+$/.test(version), 'version should be semver format');
});

test('versionModule.getAllPackageVersions should return package versions', () => {
    const versions = versionModule.getAllPackageVersions();
    assert.ok(versions, 'should return versions object');
    assert.strictEqual(versions.cli, lib.version, 'cli version should match');
    assert.strictEqual(versions.core, lib.version, 'core version should match');
});

console.log('\n=== Checksum Tests ===\n');

test('calculateSha256 should be exported', () => {
    assert.ok(typeof lib.calculateSha256 === 'function', 'calculateSha256 should be a function');
});

test('calculateSha256 should return consistent hash', () => {
    const content = '{"name":"test","version":"1.0.0"}';
    const hash1 = lib.calculateSha256(content);
    const hash2 = lib.calculateSha256(content);
    assert.strictEqual(hash1, hash2, 'same content should produce same hash');
    assert.strictEqual(hash1.length, 64, 'SHA-256 hash should be 64 characters');
});

test('calculateSha256 should return different hash for different content', () => {
    const hash1 = lib.calculateSha256('content1');
    const hash2 = lib.calculateSha256('content2');
    assert.notStrictEqual(hash1, hash2, 'different content should produce different hashes');
});

test('verifyChecksum should be exported', () => {
    assert.ok(typeof lib.verifyChecksum === 'function', 'verifyChecksum should be a function');
});

test('verifyChecksum should return valid for matching checksum', () => {
    const content = '{"name":"test","version":"1.0.0"}';
    const hash = lib.calculateSha256(content);
    const result = lib.verifyChecksum(content, hash);
    assert.strictEqual(result.valid, true);
});

test('verifyChecksum should return invalid for non-matching checksum', () => {
    const content = '{"name":"test","version":"1.0.0"}';
    const wrongHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const result = lib.verifyChecksum(content, wrongHash);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('SHA-256 校验失败'));
});

console.log('\n=== Plugin Validate/Pack Tests ===\n');

test('validatePluginJson should be exported', () => {
    assert.ok(typeof lib.validatePluginJson === 'function', 'validatePluginJson should be a function');
});

test('validatePluginJson should validate valid plugin', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const pluginPath = path.join(tmpDir, 'valid-plugin.json');
        const plugin = {
            name: 'valid-plugin',
            version: '1.0.0',
            description: 'A valid test plugin',
            author: 'Test Author',
            data: { 'zh-CN': { feat: { love: ['test message'] } } }
        };
        fs.writeFileSync(pluginPath, JSON.stringify(plugin), 'utf8');

        const result = lib.validatePluginJson(pluginPath);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.plugin.name, 'valid-plugin');
        assert.strictEqual(result.plugin.version, '1.0.0');
        assert.ok(result.checksum, 'should return checksum');
        assert.strictEqual(result.checksum.length, 64, 'checksum should be SHA-256 hex');
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('validatePluginJson should reject non-existent file', () => {
    const result = lib.validatePluginJson('/non/existent/path.json');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('不存在'));
});

test('validatePluginJson should reject invalid JSON', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const pluginPath = path.join(tmpDir, 'invalid.json');
        fs.writeFileSync(pluginPath, 'not valid json', 'utf8');

        const result = lib.validatePluginJson(pluginPath);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('JSON'));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('validatePluginJson should reject invalid plugin structure', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const pluginPath = path.join(tmpDir, 'bad-plugin.json');
        const plugin = {
            name: 'bad-plugin',
            version: '1.0.0'
        };
        fs.writeFileSync(pluginPath, JSON.stringify(plugin), 'utf8');

        const result = lib.validatePluginJson(pluginPath);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('data'));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('calculateFileSha256 should be exported', () => {
    assert.ok(typeof lib.calculateFileSha256 === 'function', 'calculateFileSha256 should be a function');
});

test('calculateFileSha256 should compute file hash', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const filePath = path.join(tmpDir, 'test.json');
        const content = '{"name":"test"}';
        fs.writeFileSync(filePath, content, 'utf8');

        const hash = lib.calculateFileSha256(filePath);
        assert.ok(hash, 'should return hash');
        assert.strictEqual(hash.length, 64);
        assert.strictEqual(hash, lib.calculateSha256(content));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('generateIndexEntry should be exported', () => {
    assert.ok(typeof lib.generateIndexEntry === 'function', 'generateIndexEntry should be a function');
});

test('generateIndexEntry should create valid entry', () => {
    const plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'Test plugin',
        author: 'Test Author'
    };
    const entry = lib.generateIndexEntry(plugin, {
        checksum: 'abc123',
        sourceUrl: 'https://example.com/plugin.json'
    });
    assert.strictEqual(entry.name, 'test-plugin');
    assert.strictEqual(entry.version, '1.0.0');
    assert.strictEqual(entry.description, 'Test plugin');
    assert.strictEqual(entry.author, 'Test Author');
    assert.strictEqual(entry.checksum, 'abc123');
    assert.strictEqual(entry.sourceUrl, 'https://example.com/plugin.json');
});

test('generateIndexEntry should handle github shorthand', () => {
    const plugin = { name: 'gh-plugin', version: '1.0.0', data: {} };
    const entry = lib.generateIndexEntry(plugin, {
        checksum: 'def456',
        github: 'owner/repo'
    });
    assert.strictEqual(entry.name, 'gh-plugin');
    assert.strictEqual(entry.checksum, 'def456');
    assert.ok(entry.github);
});

test('generatePluginMetadata should be exported', () => {
    assert.ok(typeof lib.generatePluginMetadata === 'function', 'generatePluginMetadata should be a function');
});

test('generatePluginMetadata should create metadata', () => {
    const plugin = {
        name: 'meta-plugin',
        version: '2.0.0',
        description: 'Metadata plugin',
        author: 'Meta Author'
    };
    const metadata = lib.generatePluginMetadata(plugin, {
        checksum: 'xyz789',
        sourceUrl: 'https://example.com/meta.json'
    });
    assert.strictEqual(metadata.name, 'meta-plugin');
    assert.strictEqual(metadata.version, '2.0.0');
    assert.strictEqual(metadata.checksum, 'xyz789');
    assert.strictEqual(metadata.sourceUrl, 'https://example.com/meta.json');
});

test('verifyPluginSignature should sign and verify checksum', () => {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
    const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
    const publicPem = publicKey.export({ type: 'spki', format: 'pem' });
    const checksum = lib.calculateSha256('{"name":"signed-plugin"}');
    const signResult = lib.signWithEd25519(checksum, privatePem);

    assert.strictEqual(signResult.success, true);

    const verifyResult = lib.verifyPluginSignature(checksum, {
        signature: signResult.signature,
        publicKey: publicPem,
        keyId: 'test-key'
    }, { requireSignature: true });

    assert.strictEqual(verifyResult.valid, true);
    assert.strictEqual(verifyResult.verified, true);
    assert.strictEqual(verifyResult.keyId, 'test-key');
});

test('validatePluginJson should verify signature when provided', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
        const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
        const publicPem = publicKey.export({ type: 'spki', format: 'pem' });
        const pluginPath = path.join(tmpDir, 'signed-plugin.json');
        const plugin = {
            name: 'signed-plugin',
            version: '1.0.0',
            data: { 'zh-CN': { feat: { love: ['signed'] } } }
        };

        fs.writeFileSync(pluginPath, JSON.stringify(plugin, null, 2), 'utf8');
        const checksum = lib.calculateFileSha256(pluginPath);
        const signResult = lib.signWithEd25519(checksum, privatePem);

        const result = lib.validatePluginJson(pluginPath, {
            verifySignature: true,
            requireSignature: true,
            signature: signResult.signature,
            publicKey: publicPem,
            keyId: 'release-key'
        });

        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.signatureInfo.verified, true);
        assert.strictEqual(result.signatureInfo.keyId, 'release-key');
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('packPlugin should be exported', () => {
    assert.ok(typeof lib.packPlugin === 'function', 'packPlugin should be a function');
});

test('packPlugin should pack valid plugin', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const pluginPath = path.join(tmpDir, 'pack-test.json');
        const plugin = {
            name: 'pack-test',
            version: '1.0.0',
            description: 'Pack test plugin',
            author: 'Pack Author',
            data: {
                'zh-CN': { feat: { love: ['test'] } },
                'en': { feat: { love: ['test'] } }
            },
            styles: {
                'zh-CN': { custom: { label: 'Custom', emoji: '🎉' } }
            }
        };
        fs.writeFileSync(pluginPath, JSON.stringify(plugin), 'utf8');

        const result = lib.packPlugin(pluginPath, {});
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.summary.name, 'pack-test');
        assert.strictEqual(result.summary.version, '1.0.0');
        assert.ok(result.summary.sha256);
        assert.ok(result.summary.fileSize > 0);
        assert.ok(result.summary.languages.includes('zh-CN'));
        assert.ok(result.summary.styles.includes('zh-CN'));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('packPlugin should handle source-url option', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const pluginPath = path.join(tmpDir, 'src-url.json');
        const plugin = {
            name: 'src-url-plugin',
            version: '1.0.0',
            data: {}
        };
        fs.writeFileSync(pluginPath, JSON.stringify(plugin), 'utf8');

        const result = lib.packPlugin(pluginPath, {
            sourceUrl: 'https://example.com/plugin.json'
        });
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.summary.sourceUrl, 'https://example.com/plugin.json');
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('packPlugin should handle github shorthand option', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const pluginPath = path.join(tmpDir, 'gh-pack.json');
        const plugin = {
            name: 'gh-pack-plugin',
            version: '1.0.0',
            data: {}
        };
        fs.writeFileSync(pluginPath, JSON.stringify(plugin), 'utf8');

        const result = lib.packPlugin(pluginPath, {
            github: 'owner/repo'
        });
        assert.strictEqual(result.success, true);
        assert.ok(result.summary.github);
        assert.strictEqual(result.summary.github.owner, 'owner');
        assert.strictEqual(result.summary.github.repo, 'repo');
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('packPlugin should write metadata file when requested', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const pluginPath = path.join(tmpDir, 'meta-out.json');
        const metadataPath = path.join(tmpDir, 'metadata.json');
        const plugin = {
            name: 'meta-output',
            version: '1.0.0',
            data: {}
        };
        fs.writeFileSync(pluginPath, JSON.stringify(plugin), 'utf8');

        const result = lib.packPlugin(pluginPath, {
            outputMetadata: metadataPath
        });
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.metadataPath, metadataPath);
        assert.ok(fs.existsSync(metadataPath));
        const metadataContent = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        assert.strictEqual(metadataContent.name, 'meta-output');
        assert.strictEqual(metadataContent.checksum.length, 64);
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('packPlugin should emit signature metadata when requested', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');
        const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
        const publicPem = publicKey.export({ type: 'spki', format: 'pem' });
        const pluginPath = path.join(tmpDir, 'signed-pack.json');
        const metadataPath = path.join(tmpDir, 'signed-metadata.json');
        const plugin = {
            name: 'signed-pack',
            version: '1.0.0',
            data: { 'zh-CN': { feat: { love: ['signed'] } } }
        };
        fs.writeFileSync(pluginPath, JSON.stringify(plugin, null, 2), 'utf8');

        const result = lib.packPlugin(pluginPath, {
            outputMetadata: metadataPath,
            signPrivateKey: privatePem,
            publicKey: publicPem,
            keyId: 'release-key'
        });

        assert.strictEqual(result.success, true);
        assert.ok(result.signature);
        assert.strictEqual(result.signature.keyId, 'release-key');

        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        assert.strictEqual(metadata.keyId, 'release-key');
        assert.ok(metadata.signature);
        assert.ok(metadata.publicKey.includes('BEGIN PUBLIC KEY'));
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('packPlugin should reject invalid plugin', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    try {
        const pluginPath = path.join(tmpDir, 'invalid-pack.json');
        const plugin = { name: 'invalid' };
        fs.writeFileSync(pluginPath, JSON.stringify(plugin), 'utf8');

        const result = lib.packPlugin(pluginPath, {});
        assert.strictEqual(result.success, false);
        assert.ok(result.error);
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('generateReleaseKit should be exported', () => {
    assert.ok(typeof lib.generateReleaseKit === 'function', 'generateReleaseKit should be a function');
});

test('generateReleaseKit should write metadata, index entry and submission markdown', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-release-kit-'));
    try {
        const pluginPath = path.join(tmpDir, 'release-kit.json');
        const outputDir = path.join(tmpDir, 'dist');
        const plugin = {
            name: 'release-kit-plugin',
            version: '1.2.3',
            description: 'Release kit plugin',
            author: 'Release Author',
            data: { 'zh-CN': { feat: { love: ['kit'] } } }
        };
        fs.writeFileSync(pluginPath, JSON.stringify(plugin, null, 2), 'utf8');

        const result = lib.generateReleaseKit(pluginPath, {
            outputDir,
            github: 'owner/repo:plugins/release-kit.json@main'
        });

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.summary.name, 'release-kit-plugin');
        assert.strictEqual(result.releases.outputDir, outputDir);
        assert.ok(fs.existsSync(result.releases.metadataPath));
        assert.ok(fs.existsSync(result.releases.indexEntryPath));
        assert.ok(fs.existsSync(result.releases.submissionMdPath));

        const metadata = JSON.parse(fs.readFileSync(result.releases.metadataPath, 'utf8'));
        const indexEntry = JSON.parse(fs.readFileSync(result.releases.indexEntryPath, 'utf8'));
        const submission = fs.readFileSync(result.releases.submissionMdPath, 'utf8');

        assert.strictEqual(metadata.name, 'release-kit-plugin');
        assert.strictEqual(indexEntry.name, 'release-kit-plugin');
        assert.match(submission, /Plugin Submission: release-kit-plugin/);
        assert.match(submission, /Index Entry/);
    } finally {
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('generateSubmissionMarkdown should include checklist and signature info', () => {
    const plugin = {
        name: 'submission-plugin',
        version: '1.0.0',
        description: 'Submission test',
        author: 'Tester',
        data: { 'zh-CN': { feat: { love: ['hello'] } } }
    };

    const checklist = lib.generateSubmissionChecklist(plugin, {
        validPlugin: true,
        checksum: 'abc123',
        indexEntry: { name: 'submission-plugin' },
        loadTested: true
    });

    const markdown = lib.generateSubmissionMarkdown(plugin, {
        checksum: 'abc123',
        github: 'owner/repo@main',
        indexEntry: { name: 'submission-plugin' },
        signature: 'signature-base64',
        publicKey: '-----BEGIN PUBLIC KEY-----\nTEST\n-----END PUBLIC KEY-----',
        keyId: 'release-key',
        algorithm: 'Ed25519',
        checklist
    });

    assert.match(markdown, /Plugin Submission: submission-plugin/);
    assert.match(markdown, /Pre-submission Checklist/);
    assert.match(markdown, /release-key/);
    assert.match(markdown, /signature-base64/);
});

test('getAllowedHosts should prefer options over config and env', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-config-'));
    const originalEnv = process.env.PLUGIN_ALLOWED_HOSTS;

    try {
        lib.saveConfig(tmpDir, {
            plugins: {
                enabled: true,
                dir: '~/.saohua/plugins',
                allowedHosts: ['config.example.com']
            }
        });
        process.env.PLUGIN_ALLOWED_HOSTS = 'env.example.com';

        const result = lib.PluginManager.getAllowedHosts({
            cwd: tmpDir,
            allowedHosts: ['cli.example.com']
        });

        assert.deepStrictEqual(result, ['cli.example.com', '127.0.0.1', 'localhost']);
    } finally {
        if (originalEnv === undefined) {
            delete process.env.PLUGIN_ALLOWED_HOSTS;
        } else {
            process.env.PLUGIN_ALLOWED_HOSTS = originalEnv;
        }
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('getAllowedHosts should load config when options are absent', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-config-'));
    const originalEnv = process.env.PLUGIN_ALLOWED_HOSTS;

    try {
        delete process.env.PLUGIN_ALLOWED_HOSTS;
        lib.saveConfig(tmpDir, {
            plugins: {
                enabled: true,
                dir: '~/.saohua/plugins',
                allowedHosts: ['config-only.example.com']
            }
        });

        const result = lib.PluginManager.getAllowedHosts({ cwd: tmpDir });
        assert.deepStrictEqual(result, ['config-only.example.com', '127.0.0.1', 'localhost']);
    } finally {
        if (originalEnv === undefined) {
            delete process.env.PLUGIN_ALLOWED_HOSTS;
        } else {
            process.env.PLUGIN_ALLOWED_HOSTS = originalEnv;
        }
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('fetchPluginFromUrl should reject host outside allowlist', async () => {
    const result = await lib.fetchPluginFromUrl('https://plugins.example.com/plugin.json', {
        allowedHosts: ['trusted.example.com']
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('不在允许列表中'));
});

test('fetchPluginFromUrl should allow host from options allowlist', async () => {
    const plugin = {
        name: 'allow-host-test-plugin',
        version: '1.0.0',
        data: {
            'zh-CN': {
                feat: {
                    love: ['allow host success']
                }
            }
        }
    };

    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(plugin));
    });

    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

    try {
        const url = `http://127.0.0.1:${server.address().port}/plugin.json`;
        const result = await lib.fetchPluginFromUrl(url, { allowedHosts: ['127.0.0.1'] });
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.plugin.name, 'allow-host-test-plugin');
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('installPluginFromUrl should verify checksum when provided', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    const plugin = {
        name: 'checksum-test-plugin',
        version: '1.0.0',
        description: 'Checksum test',
        data: {
            'zh-CN': {
                feat: {
                    love: ['校验测试']
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
        const correctChecksum = lib.calculateSha256(JSON.stringify(plugin));
        const result = await lib.installPluginFromUrl(url, tmpDir, { expectedChecksum: correctChecksum });
        assert.strictEqual(result.success, true, 'install should succeed with correct checksum');
        assert.strictEqual(result.plugin.checksum, correctChecksum, 'checksum should be saved');
    } finally {
        await new Promise(resolve => server.close(resolve));
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('installPluginFromUrl should fail with wrong checksum', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    const plugin = {
        name: 'checksum-fail-plugin',
        version: '1.0.0',
        data: {
            'zh-CN': {
                feat: {
                    love: ['校验失败测试']
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
        const wrongChecksum = '0000000000000000000000000000000000000000000000000000000000000000';
        const result = await lib.installPluginFromUrl(url, tmpDir, { expectedChecksum: wrongChecksum });
        assert.strictEqual(result.success, false, 'install should fail with wrong checksum');
        assert.ok(result.error.includes('SHA-256 校验失败'), 'error should mention checksum mismatch');
    } finally {
        await new Promise(resolve => server.close(resolve));
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('installPluginFromIndex should verify checksum from index when provided', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    
    const pluginData = {
        name: 'index-checksum-plugin',
        version: '1.0.0',
        description: 'Index checksum test',
        data: {
            'zh-CN': {
                feat: {
                    love: ['索引校验成功']
                }
            }
        }
    };
    const pluginChecksum = lib.calculateSha256(JSON.stringify(pluginData));

    const indexData = {
        plugins: [
            { 
                name: 'index-checksum-plugin', 
                version: '1.0.0', 
                sourceUrl: `http://127.0.0.1:9999/plugin.json`,
                checksum: pluginChecksum
            }
        ]
    };

    const indexServer = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(indexData));
    });

    const pluginServer = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pluginData));
    });

    await new Promise(resolve => indexServer.listen(0, resolve));
    const indexPort = indexServer.address().port;

    await new Promise(resolve => pluginServer.listen(0, resolve));
    const pluginPort = pluginServer.address().port;

    indexData.plugins[0].sourceUrl = `http://127.0.0.1:${pluginPort}/plugin.json`;

    try {
        const url = `http://127.0.0.1:${indexPort}/index.json`;
        const result = await lib.installPluginFromIndex('index-checksum-plugin', url, tmpDir);
        assert.strictEqual(result.success, true, 'install should succeed with correct checksum from index');
        assert.strictEqual(result.plugin.checksum, pluginChecksum, 'checksum from index should be saved');
    } finally {
        await new Promise(resolve => indexServer.close(resolve));
        await new Promise(resolve => pluginServer.close(resolve));
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('installPluginFromIndex should fail with wrong checksum from index', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    
    const pluginData = {
        name: 'index-wrong-checksum-plugin',
        version: '1.0.0',
        data: {
            'zh-CN': {
                feat: {
                    love: ['索引校验失败']
                }
            }
        }
    };

    const wrongChecksum = '0000000000000000000000000000000000000000000000000000000000000000';

    const indexData = {
        plugins: [
            { 
                name: 'index-wrong-checksum-plugin', 
                version: '1.0.0', 
                sourceUrl: `http://127.0.0.1:9999/plugin.json`,
                checksum: wrongChecksum
            }
        ]
    };

    const indexServer = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(indexData));
    });

    const pluginServer = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pluginData));
    });

    await new Promise(resolve => indexServer.listen(0, resolve));
    const indexPort = indexServer.address().port;

    await new Promise(resolve => pluginServer.listen(0, resolve));
    const pluginPort = pluginServer.address().port;

    indexData.plugins[0].sourceUrl = `http://127.0.0.1:${pluginPort}/plugin.json`;

    try {
        const url = `http://127.0.0.1:${indexPort}/index.json`;
        const result = await lib.installPluginFromIndex('index-wrong-checksum-plugin', url, tmpDir);
        assert.strictEqual(result.success, false, 'install should fail with wrong checksum from index');
        assert.ok(result.error.includes('SHA-256 校验失败'), 'error should mention checksum mismatch');
    } finally {
        await new Promise(resolve => indexServer.close(resolve));
        await new Promise(resolve => pluginServer.close(resolve));
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('installPluginFromIndex should install without checksum when not provided in index', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    
    const pluginData = {
        name: 'index-no-checksum-plugin',
        version: '1.0.0',
        data: {
            'zh-CN': {
                feat: {
                    love: ['无校验安装']
                }
            }
        }
    };

    const indexData = {
        plugins: [
            { 
                name: 'index-no-checksum-plugin', 
                version: '1.0.0', 
                sourceUrl: `http://127.0.0.1:9999/plugin.json`
            }
        ]
    };

    const indexServer = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(indexData));
    });

    const pluginServer = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pluginData));
    });

    await new Promise(resolve => indexServer.listen(0, resolve));
    const indexPort = indexServer.address().port;

    await new Promise(resolve => pluginServer.listen(0, resolve));
    const pluginPort = pluginServer.address().port;

    indexData.plugins[0].sourceUrl = `http://127.0.0.1:${pluginPort}/plugin.json`;

    try {
        const url = `http://127.0.0.1:${indexPort}/index.json`;
        const result = await lib.installPluginFromIndex('index-no-checksum-plugin', url, tmpDir);
        assert.strictEqual(result.success, true, 'install should succeed without checksum in index');
    } finally {
        await new Promise(resolve => indexServer.close(resolve));
        await new Promise(resolve => pluginServer.close(resolve));
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

test('installPluginFromUrl should save computed checksum when no expected checksum provided', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    const plugin = {
        name: 'auto-checksum-plugin',
        version: '1.0.0',
        description: 'Auto checksum test',
        data: {
            'zh-CN': {
                feat: {
                    love: ['自动校验测试']
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
        assert.strictEqual(result.success, true, 'install should succeed');
        assert.ok(result.plugin.checksum, 'checksum should be computed and saved');
        assert.strictEqual(result.plugin.checksum.length, 64, 'checksum should be SHA-256 format');
    } finally {
        await new Promise(resolve => server.close(resolve));
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

console.log('\n=== GitHub Shorthand Tests ===\n');

test('parseGitHubShorthand should be exported', () => {
    assert.ok(typeof lib.parseGitHubShorthand === 'function', 'parseGitHubShorthand should be a function');
});

test('DEFAULT_GITHUB_REF should be exported', () => {
    assert.strictEqual(lib.DEFAULT_GITHUB_REF, 'main');
});

test('DEFAULT_GITHUB_PATHS should be exported', () => {
    assert.deepStrictEqual(lib.DEFAULT_GITHUB_PATHS, ['saohua-plugin.json', 'plugin.json']);
});

test('parseGitHubShorthand should parse owner/repo format', () => {
    const result = lib.parseGitHubShorthand('owner/repo');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.owner, 'owner');
    assert.strictEqual(result.repo, 'repo');
    assert.strictEqual(result.ref, 'main');
    assert.strictEqual(result.path, 'saohua-plugin.json');
    assert.strictEqual(result.rawUrl, 'https://raw.githubusercontent.com/owner/repo/main/saohua-plugin.json');
    assert.deepStrictEqual(result.rawUrls, [
        'https://raw.githubusercontent.com/owner/repo/main/saohua-plugin.json',
        'https://raw.githubusercontent.com/owner/repo/main/plugin.json'
    ]);
});

test('parseGitHubShorthand should parse with github: prefix', () => {
    const result = lib.parseGitHubShorthand('github:owner/repo');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.owner, 'owner');
    assert.strictEqual(result.repo, 'repo');
    assert.strictEqual(result.ref, 'main');
});

test('parseGitHubShorthand should parse with custom path', () => {
    const result = lib.parseGitHubShorthand('owner/repo:path/to/plugin.json');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.path, 'path/to/plugin.json');
    assert.strictEqual(result.rawUrl, 'https://raw.githubusercontent.com/owner/repo/main/path/to/plugin.json');
});

test('parseGitHubShorthand should parse with custom ref', () => {
    const result = lib.parseGitHubShorthand('owner/repo@v1.0.0');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.ref, 'v1.0.0');
    assert.strictEqual(result.rawUrl, 'https://raw.githubusercontent.com/owner/repo/v1.0.0/saohua-plugin.json');
});

test('parseGitHubShorthand should parse with path and ref', () => {
    const result = lib.parseGitHubShorthand('owner/repo:plugins/my.json@dev-branch');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.path, 'plugins/my.json');
    assert.strictEqual(result.ref, 'dev-branch');
    assert.strictEqual(result.rawUrl, 'https://raw.githubusercontent.com/owner/repo/dev-branch/plugins/my.json');
});

test('parseGitHubShorthand should parse with github: prefix, path and ref', () => {
    const result = lib.parseGitHubShorthand('github:owner/repo:plugin.json@v2.0.0');
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.owner, 'owner');
    assert.strictEqual(result.repo, 'repo');
    assert.strictEqual(result.path, 'plugin.json');
    assert.strictEqual(result.ref, 'v2.0.0');
    assert.strictEqual(result.rawUrl, 'https://raw.githubusercontent.com/owner/repo/v2.0.0/plugin.json');
});

test('parseGitHubShorthand should reject empty input', () => {
    const result = lib.parseGitHubShorthand('');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('无效'));
});

test('parseGitHubShorthand should reject null input', () => {
    const result = lib.parseGitHubShorthand(null);
    assert.strictEqual(result.valid, false);
});

test('parseGitHubShorthand should reject invalid format', () => {
    const result = lib.parseGitHubShorthand('invalid-format');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('格式无效'));
});

test('parseGitHubShorthand should use custom defaultRef option', () => {
    const result = lib.parseGitHubShorthand('owner/repo', { defaultRef: 'develop' });
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.ref, 'develop');
});

test('parseGitHubShorthand should fallback to first path in custom paths', () => {
    const result = lib.parseGitHubShorthand('owner/repo', { defaultPaths: ['custom.json', 'other.json'] });
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.path, 'custom.json');
});

test('installPluginFromGitHub should be exported', () => {
    assert.ok(typeof lib.installPluginFromGitHub === 'function', 'installPluginFromGitHub should be a function');
});

test('fetchPluginFromGitHub should fallback to plugin.json when default path is missing', async () => {
    const originalRequest = https.request;
    const plugin = {
        name: 'github-fallback-plugin',
        version: '1.0.0',
        data: {
            'zh-CN': {
                feat: {
                    love: ['GitHub fallback success']
                }
            }
        }
    };

    https.request = (input, options, callback) => {
        const url = typeof input === 'string' ? new URL(input) : input;
        const request = new (require('events').EventEmitter)();
        request.end = () => {
            const response = new (require('events').EventEmitter)();
            response.setEncoding = () => {};
            response.resume = () => {};

            process.nextTick(() => {
                if (url.pathname.endsWith('/saohua-plugin.json')) {
                    response.statusCode = 404;
                    callback(response);
                    response.emit('end');
                    return;
                }

                response.statusCode = 200;
                callback(response);
                response.emit('data', JSON.stringify(plugin));
                response.emit('end');
            });
        };
        request.destroy = (error) => {
            if (error) {
                request.emit('error', error);
            }
        };
        request.setTimeout = () => {};
        return request;
    };

    try {
        const result = await lib.fetchPluginFromGitHub('owner/repo');
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.plugin.name, 'github-fallback-plugin');
        assert.strictEqual(result.sourceUrl, 'https://raw.githubusercontent.com/owner/repo/main/plugin.json');
    } finally {
        https.request = originalRequest;
    }
});

test('installPluginFromGitHub should install from mocked GitHub raw URL', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-plugin-'));
    const plugin = {
        name: 'github-install-test-plugin',
        version: '1.0.0',
        data: {
            'zh-CN': {
                feat: {
                    love: ['GitHub 安装成功']
                }
            }
        }
    };
    const originalRequest = https.request;

    https.request = (input, options, callback) => {
        const url = typeof input === 'string' ? new URL(input) : input;
        const request = new (require('events').EventEmitter)();
        request.end = () => {
            const response = new (require('events').EventEmitter)();
            response.setEncoding = () => {};
            response.resume = () => {};

            process.nextTick(() => {
                response.statusCode = 200;
                callback(response);
                response.emit('data', JSON.stringify(plugin));
                response.emit('end');
            });
        };
        request.destroy = (error) => {
            if (error) {
                request.emit('error', error);
            }
        };
        request.setTimeout = () => {};
        return request;
    };

    try {
        const result = await lib.installPluginFromGitHub('owner/repo:plugin.json@main', tmpDir);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.plugin.name, 'github-install-test-plugin');
        assert.strictEqual(result.plugin.sourceUrl, 'https://raw.githubusercontent.com/owner/repo/main/plugin.json');
    } finally {
        https.request = originalRequest;
        try { execSync(`rm -rf "${tmpDir}"`); } catch (e) {}
    }
});

console.log('\n=== Natural Language Tests (v1.35.0) ===\n');

test('analyzeLanguage should detect fix type', () => {
    const result = naturalLanguage.analyzeLanguage('修复登录bug');
    assert.strictEqual(result.type, 'fix');
    assert.strictEqual(result.confidence, 'high');
});

test('analyzeLanguage should detect feat type', () => {
    const result = naturalLanguage.analyzeLanguage('新增用户注册功能');
    assert.strictEqual(result.type, 'feat');
});

test('analyzeLanguage should detect chore type', () => {
    const result = naturalLanguage.analyzeLanguage('更新依赖版本');
    assert.strictEqual(result.type, 'chore');
    assert.strictEqual(result.confidence, 'high');
});

test('analyzeLanguage should detect English keywords', () => {
    const result = naturalLanguage.analyzeLanguage('fix the login bug');
    assert.strictEqual(result.type, 'fix');
    assert.strictEqual(result.confidence, 'high');
});

test('analyzeLanguage should handle empty input', () => {
    const result = naturalLanguage.analyzeLanguage('');
    assert.strictEqual(result.type, null);
});

test('extractTopic should clean input', () => {
    const topic = naturalLanguage.extractTopic('修复登录页面闪退 bug');
    assert.ok(topic.length > 0);
    assert.ok(topic.length <= 50);
});

test('extractTopic should handle long input', () => {
    const longInput = '修复登录页面闪退 bug 这是一个非常非常长的描述需要被截断因为超过了五十个字符的限制我们在这里添加更多内容来测试截断功能是否正常工作';
    const topic = naturalLanguage.extractTopic(longInput);
    assert.ok(topic.length <= 50);
});

test('generateFromNaturalLanguage should return valid result', () => {
    const result = naturalLanguage.generateFromNaturalLanguage('修复登录bug');
    assert.ok(result.detectedType);
    assert.ok(result.detectedStyle);
    assert.ok(result.topic);
    assert.ok(result.confidence);
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
