const assert = require('assert');
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

console.log('CLI TUI tests passed');
