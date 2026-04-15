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

console.log('CLI TUI tests passed');
