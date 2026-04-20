const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const tui = require('./tui');

(function testResolveChoiceByIndex() {
    const items = [{ value: 'feat' }, { value: 'fix' }];
    const result = tui.resolveChoice('2', items, 'feat', item => item.value);
    assert.strictEqual(result, 'fix');
})();

(function testResolveChoiceByText() {
    const items = [{ value: 'love' }, { value: 'sao' }];
    const result = tui.resolveChoice('SAO', items, 'love', item => item.value);
    assert.strictEqual(result, 'sao');
})();

(function testResolveChoiceFallsBack() {
    const items = [{ value: 'zh-CN' }, { value: 'en' }];
    const result = tui.resolveChoice('99', items, 'zh-CN', item => item.value);
    assert.strictEqual(result, 'zh-CN');
})();

(function testFormatMenuContainsOptions() {
    const output = tui.stripAnsi(tui.formatMenu('标题', '描述', [
        { label: '选项一', description: '说明一' },
        { label: '选项二', description: '说明二' }
    ], '页脚'));
    assert.match(output, /标题/);
    assert.match(output, /1\. 选项一/);
    assert.match(output, /2\. 选项二/);
    assert.match(output, /页脚/);
})();

(function testFormatPreviewContainsMessage() {
    const output = tui.stripAnsi(tui.formatPreview({
        fullMessage: 'feat: 给终端一点灵魂',
        type: 'feat',
        style: 'sao',
        language: 'zh-CN'
    }, {
        mode: 'tui'
    }));
    assert.match(output, /feat: 给终端一点灵魂/);
    assert.match(output, /type/);
    assert.match(output, /style/);
    assert.match(output, /mode/);
})();

(function testPluginInspectShowsProvenance() {
    const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-home-'));
    const pluginsDir = path.join(tmpHome, '.saohua', 'plugins');
    fs.mkdirSync(pluginsDir, { recursive: true });

    const plugin = {
        name: 'inspect-plugin',
        version: '1.0.0',
        description: 'inspect me',
        data: { 'zh-CN': { feat: { love: ['hi'] } } },
        sourceType: 'github',
        sourceUrl: 'https://raw.githubusercontent.com/foo/bar/main/plugin.json',
        githubSpec: 'foo/bar@main',
        checksum: 'abc123',
        installedAt: '2026-04-15T10:00:00.000Z'
    };
    fs.writeFileSync(path.join(pluginsDir, 'inspect-plugin.json'), JSON.stringify(plugin, null, 2), 'utf8');
    fs.writeFileSync(path.join(pluginsDir, 'plugins.lock.json'), JSON.stringify({
        version: '1.0.0',
        generatedAt: '2026-04-15T10:00:01.000Z',
        plugins: {
            'inspect-plugin': {
                sourceType: 'github',
                sourceUrl: plugin.sourceUrl,
                githubSpec: plugin.githubSpec,
                checksum: plugin.checksum,
                installedAt: plugin.installedAt,
                lockedAt: '2026-04-15T10:00:01.000Z'
            }
        }
    }, null, 2), 'utf8');

    try {
        const output = execFileSync(process.execPath, [path.join(__dirname, 'index.js'), 'plugin', 'inspect', 'inspect-plugin'], {
            env: { ...process.env, HOME: tmpHome },
            encoding: 'utf8'
        });

        assert.match(output, /inspect-plugin/);
        assert.match(output, /来源类型: github/);
        assert.match(output, /foo\/bar@main/);
        assert.match(output, /SHA-256: abc123/);
    } finally {
        fs.rmSync(tmpHome, { recursive: true, force: true });
    }
})();

(function testPluginValidateShowsChecksum() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-validate-'));
    const pluginPath = path.join(tmpDir, 'validate-test.json');
    const plugin = {
        name: 'validate-test',
        version: '1.2.3',
        description: 'Validate test plugin',
        author: 'Test',
        data: { 'zh-CN': { feat: { love: ['test'] } } }
    };
    fs.writeFileSync(pluginPath, JSON.stringify(plugin, null, 2), 'utf8');

    try {
        const rawOutput = execFileSync(process.execPath, [path.join(__dirname, 'index.js'), 'plugin', 'validate', pluginPath], {
            encoding: 'utf8'
        });
        const output = tui.stripAnsi(rawOutput);

        assert.match(output, /✓ 插件校验通过/);
        assert.match(output, /名称: validate-test/);
        assert.match(output, /版本: 1.2.3/);
        assert.match(output, /SHA-256:/);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
})();

(function testPluginValidateRejectsInvalid() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-validate-'));
    const pluginPath = path.join(tmpDir, 'invalid.json');
    fs.writeFileSync(pluginPath, 'not json', 'utf8');

    let exitCode = 0;
    try {
        execFileSync(process.execPath, [path.join(__dirname, 'index.js'), 'plugin', 'validate', pluginPath], {
            encoding: 'utf8'
        });
    } catch (e) {
        exitCode = e.status;
    }

    assert.strictEqual(exitCode, 1);
    fs.rmSync(tmpDir, { recursive: true, force: true });
})();

(function testPluginPackShowsSummaryAndIndexEntry() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-pack-'));
    const pluginPath = path.join(tmpDir, 'pack-test.json');
    const plugin = {
        name: 'pack-test',
        version: '2.0.0',
        description: 'Pack test',
        author: 'PackAuthor',
        data: { 'zh-CN': { feat: { love: ['test'] } } }
    };
    fs.writeFileSync(pluginPath, JSON.stringify(plugin, null, 2), 'utf8');

    try {
        const rawOutput = execFileSync(process.execPath, [path.join(__dirname, 'index.js'), 'plugin', 'pack', pluginPath], {
            encoding: 'utf8'
        });
        const output = tui.stripAnsi(rawOutput);

        assert.match(output, /✓ 打包成功/);
        assert.match(output, /名称: pack-test/);
        assert.match(output, /版本: 2.0.0/);
        assert.match(output, /SHA-256:/);
        assert.match(output, /建议索引条目:/);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
})();

(function testPluginPackWithOutput() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-pack-'));
    const pluginPath = path.join(tmpDir, 'pack-out.json');
    const metadataPath = path.join(tmpDir, 'metadata-out.json');
    const plugin = {
        name: 'pack-metadata',
        version: '3.0.0',
        data: { 'zh-CN': { feat: { love: ['test'] } } }
    };
    fs.writeFileSync(pluginPath, JSON.stringify(plugin, null, 2), 'utf8');

    try {
        const rawOutput = execFileSync(process.execPath, [path.join(__dirname, 'index.js'), 'plugin', 'pack', pluginPath, '--output', metadataPath], {
            encoding: 'utf8'
        });
        const output = tui.stripAnsi(rawOutput);

        assert.match(output, /✓ 元数据已写入/);
        assert.ok(fs.existsSync(metadataPath));
        const meta = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        assert.strictEqual(meta.name, 'pack-metadata');
        assert.strictEqual(meta.indexEntry.name, 'pack-metadata');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
})();

(function testPluginPackWithSignature() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-pack-sign-'));
    const pluginPath = path.join(tmpDir, 'pack-sign.json');
    const metadataPath = path.join(tmpDir, 'signed-metadata.json');
    const privateKeyPath = path.join(tmpDir, 'ed25519-private.pem');
    const publicKeyPath = path.join(tmpDir, 'ed25519-public.pem');
    const plugin = {
        name: 'pack-sign',
        version: '1.0.0',
        data: { 'zh-CN': { feat: { love: ['test'] } } }
    };
    fs.writeFileSync(pluginPath, JSON.stringify(plugin, null, 2), 'utf8');
    execFileSync(process.execPath, ['-e', `
const { generateKeyPairSync } = require('crypto');
const { writeFileSync } = require('fs');
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
writeFileSync(${JSON.stringify(privateKeyPath)}, privateKey.export({ type: 'pkcs8', format: 'pem' }));
writeFileSync(${JSON.stringify(publicKeyPath)}, publicKey.export({ type: 'spki', format: 'pem' }));
`]);

    try {
        const rawOutput = execFileSync(process.execPath, [
            path.join(__dirname, 'index.js'),
            'plugin', 'pack', pluginPath,
            '--output', metadataPath,
            '--sign-private-key', privateKeyPath,
            '--public-key', publicKeyPath,
            '--key-id', 'release-key'
        ], {
            encoding: 'utf8'
        });
        const output = tui.stripAnsi(rawOutput);
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

        assert.match(output, /签名状态: 已验证|签名状态: 未验证/);
        assert.match(output, /Key ID: release-key/);
        assert.strictEqual(metadata.keyId, 'release-key');
        assert.ok(metadata.signature);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
})();

(function testPluginVerifySignedFile() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-verify-'));
    const pluginPath = path.join(tmpDir, 'verify-plugin.json');
    const privateKeyPath = path.join(tmpDir, 'ed25519-private.pem');
    const publicKeyPath = path.join(tmpDir, 'ed25519-public.pem');
    const plugin = {
        name: 'verify-plugin',
        version: '1.0.0',
        data: { 'zh-CN': { feat: { love: ['verify'] } } }
    };
    fs.writeFileSync(pluginPath, JSON.stringify(plugin, null, 2), 'utf8');
    execFileSync(process.execPath, ['-e', `
const { generateKeyPairSync, createHash, sign } = require('crypto');
const { writeFileSync, readFileSync } = require('fs');
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
writeFileSync(${JSON.stringify(privateKeyPath)}, privateKey.export({ type: 'pkcs8', format: 'pem' }));
writeFileSync(${JSON.stringify(publicKeyPath)}, publicKey.export({ type: 'spki', format: 'pem' }));
const checksum = createHash('sha256').update(readFileSync(${JSON.stringify(pluginPath)}, 'utf8'), 'utf8').digest('hex');
const signature = sign(null, Buffer.from(checksum, 'utf8'), privateKey).toString('base64');
const plugin = JSON.parse(readFileSync(${JSON.stringify(pluginPath)}, 'utf8'));
plugin.signature = signature;
plugin.publicKey = readFileSync(${JSON.stringify(publicKeyPath)}, 'utf8');
plugin.keyId = 'release-key';
plugin.algorithm = 'Ed25519';
writeFileSync(${JSON.stringify(pluginPath)}, JSON.stringify(plugin, null, 2));
`]);

    try {
        const rawOutput = execFileSync(process.execPath, [path.join(__dirname, 'index.js'), 'plugin', 'verify', pluginPath], {
            encoding: 'utf8'
        });
        const output = tui.stripAnsi(rawOutput);

        assert.match(output, /✓ 签名校验通过/);
        assert.match(output, /Key ID: release-key/);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
})();

(function testReleaseNotesWritesMarkdown() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-release-notes-'));
    const outputPath = path.join(tmpDir, 'RELEASE_NOTES.md');

    try {
        execFileSync('git', ['init'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['config', 'user.name', 'CLI Test'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['config', 'user.email', 'cli@example.com'], { cwd: tmpDir, stdio: 'ignore' });

        fs.writeFileSync(path.join(tmpDir, 'feature.txt'), 'hello', 'utf8');
        execFileSync('git', ['add', 'feature.txt'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['commit', '-m', 'feat(cli): add release notes'], { cwd: tmpDir, stdio: 'ignore' });

        const rawOutput = execFileSync(process.execPath, [path.join(__dirname, 'index.js'), 'release-notes', 'HEAD', '--title', 'vNext', '--output', outputPath], {
            cwd: tmpDir,
            encoding: 'utf8'
        });
        const output = tui.stripAnsi(rawOutput);
        const markdown = fs.readFileSync(outputPath, 'utf8');

        assert.match(output, /Release Notes 已写入/);
        assert.match(markdown, /# vNext/);
        assert.match(markdown, /## Features/);
        assert.match(markdown, /add release notes/);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
})();

(function testReleaseNotesWithRepo() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-release-notes-repo-'));

    try {
        execFileSync('git', ['init'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['config', 'user.name', 'CLI Test'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['config', 'user.email', 'cli@example.com'], { cwd: tmpDir, stdio: 'ignore' });

        fs.writeFileSync(path.join(tmpDir, 'feature.txt'), 'hello', 'utf8');
        execFileSync('git', ['add', 'feature.txt'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['commit', '-m', 'feat(cli): add release notes (#100)'], { cwd: tmpDir, stdio: 'ignore' });

        const rawOutput = execFileSync(process.execPath, [
            path.join(__dirname, 'index.js'),
            'release-notes',
            'HEAD',
            '--title', 'vNext',
            '--repo', 'owner/test-repo'
        ], {
            cwd: tmpDir,
            encoding: 'utf8'
        });
        const output = tui.stripAnsi(rawOutput);

        assert.match(output, /owner\/test-repo/);
        assert.match(output, /# vNext/);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
})();

(function testReleaseNotesJsonFormat() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-release-notes-json-'));

    try {
        execFileSync('git', ['init'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['config', 'user.name', 'CLI Test'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['config', 'user.email', 'cli@example.com'], { cwd: tmpDir, stdio: 'ignore' });

        fs.writeFileSync(path.join(tmpDir, 'feature.txt'), 'hello', 'utf8');
        execFileSync('git', ['add', 'feature.txt'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['commit', '-m', 'feat(cli): add json output test'], { cwd: tmpDir, stdio: 'ignore' });
        fs.writeFileSync(path.join(tmpDir, 'fix.txt'), 'fix', 'utf8');
        execFileSync('git', ['add', 'fix.txt'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['commit', '-m', 'fix(core): resolve bug'], { cwd: tmpDir, stdio: 'ignore' });

        const rawOutput = execFileSync(process.execPath, [
            path.join(__dirname, 'index.js'),
            'release-notes',
            'HEAD',
            '--title', 'vNext',
            '--format', 'json'
        ], {
            cwd: tmpDir,
            encoding: 'utf8'
        });

        const lines = rawOutput.split('\n');
        const jsonStartIdx = lines.findIndex(line => line.startsWith('{'));
        const jsonText = lines.slice(jsonStartIdx).join('\n');
        const json = JSON.parse(jsonText);

        assert.strictEqual(json.title, 'vNext');
        assert.strictEqual(json.totalCommits, 2);
        assert.ok(json.commits);
        assert.ok(json.commits.length > 0);
        assert.ok(json.commits[0].hash);
        assert.ok(json.commits[0].type);
        assert.ok(json.commits[0].description);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
})();

(function testReleaseNotesJsonFormatWithOutput() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-release-notes-json-out-'));
    const outputPath = path.join(tmpDir, 'release.json');

    try {
        execFileSync('git', ['init'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['config', 'user.name', 'CLI Test'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['config', 'user.email', 'cli@example.com'], { cwd: tmpDir, stdio: 'ignore' });

        fs.writeFileSync(path.join(tmpDir, 'test.txt'), 'test', 'utf8');
        execFileSync('git', ['add', 'test.txt'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['commit', '-m', 'feat(core): json output test'], { cwd: tmpDir, stdio: 'ignore' });

        const rawOutput = execFileSync(process.execPath, [
            path.join(__dirname, 'index.js'),
            'release-notes',
            'HEAD',
            '--format', 'json',
            '--output', 'release.json'
        ], {
            cwd: tmpDir,
            encoding: 'utf8'
        });
        const output = tui.stripAnsi(rawOutput);

        assert.match(output, /Release Notes 已写入/);
        assert.ok(fs.existsSync(outputPath));
        const json = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        assert.strictEqual(json.title, 'Release Notes');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
})();

(function testReleaseNotesGitHubReleaseJsonFormat() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-release-gh-json-'));

    try {
        execFileSync('git', ['init'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['config', 'user.name', 'CLI Test'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['config', 'user.email', 'cli@example.com'], { cwd: tmpDir, stdio: 'ignore' });

        fs.writeFileSync(path.join(tmpDir, 'feature.txt'), 'hello', 'utf8');
        execFileSync('git', ['add', 'feature.txt'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['commit', '-m', 'feat(cli): add github release payload (#100)'], { cwd: tmpDir, stdio: 'ignore' });

        const rawOutput = execFileSync(process.execPath, [
            path.join(__dirname, 'index.js'),
            'release-notes',
            'HEAD',
            '--title', 'vNext',
            '--format', 'github-release-json',
            '--repo', 'owner/test-repo',
            '--tag', 'v1.2.3',
            '--target', 'main',
            '--draft',
            '--prerelease',
            '--body', '附加说明'
        ], {
            cwd: tmpDir,
            encoding: 'utf8'
        });

        const json = JSON.parse(rawOutput);

        assert.strictEqual(json.tag_name, 'v1.2.3');
        assert.strictEqual(json.name, 'vNext');
        assert.strictEqual(json.target_commitish, 'main');
        assert.strictEqual(json.draft, true);
        assert.strictEqual(json.prerelease, true);
        assert.match(json.body, /### Features/);
        assert.match(json.body, /附加说明/);
        assert.match(json.body, /owner\/test-repo\/pull\/100/);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
})();

(function testReleaseNotesGitHubReleaseJsonWithOutput() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-release-gh-json-out-'));
    const outputPath = path.join(tmpDir, 'github-release.json');

    try {
        execFileSync('git', ['init'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['config', 'user.name', 'CLI Test'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['config', 'user.email', 'cli@example.com'], { cwd: tmpDir, stdio: 'ignore' });

        fs.writeFileSync(path.join(tmpDir, 'feature.txt'), 'hello', 'utf8');
        execFileSync('git', ['add', 'feature.txt'], { cwd: tmpDir, stdio: 'ignore' });
        execFileSync('git', ['commit', '-m', 'feat(cli): write github release file'], { cwd: tmpDir, stdio: 'ignore' });

        const rawOutput = execFileSync(process.execPath, [
            path.join(__dirname, 'index.js'),
            'release-notes',
            'HEAD',
            '--format', 'github-release-json',
            '--output', 'github-release.json'
        ], {
            cwd: tmpDir,
            encoding: 'utf8'
        });
        const output = tui.stripAnsi(rawOutput);

        assert.match(output, /Release Notes 已写入/);
        assert.ok(fs.existsSync(outputPath));
        const json = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        assert.strictEqual(json.tag_name, 'Release Notes');
        assert.ok(typeof json.body === 'string');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
})();

(function testBatchCommandTextOutput() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-batch-'));
    const batchFile = path.join(tmpDir, 'items.json');
    fs.writeFileSync(batchFile, JSON.stringify({
        items: [
            { mode: 'random' },
            { mode: 'typed', type: 'fix' }
        ]
    }, null, 2), 'utf8');

    try {
        const rawOutput = execFileSync(process.execPath, [path.join(__dirname, 'index.js'), 'batch', '--file', batchFile], {
            encoding: 'utf8'
        });
        const output = tui.stripAnsi(rawOutput);

        assert.match(output, /正在批量生成/);
        assert.match(output, /统计:/);
        assert.match(output, /生成结果:/);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
})();

(function testBatchCommandJsonOutputIsMachineReadable() {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'saohua-cli-batch-json-'));
    const batchFile = path.join(tmpDir, 'items.json');
    fs.writeFileSync(batchFile, JSON.stringify([
        { mode: 'typed_style', type: 'feat', style: 'love' }
    ], null, 2), 'utf8');

    try {
        const output = execFileSync(process.execPath, [path.join(__dirname, 'index.js'), 'batch', '--file', batchFile, '--format', 'json'], {
            encoding: 'utf8'
        });
        const parsed = JSON.parse(output);

        assert.strictEqual(parsed.success, true);
        assert.strictEqual(parsed.count, 1);
        assert.strictEqual(parsed.items[0].success, true);
        assert.strictEqual(parsed.items[0].type, 'feat');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
})();

console.log('CLI TUI tests passed');
