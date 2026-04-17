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

console.log('CLI TUI tests passed');
