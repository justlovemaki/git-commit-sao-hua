const assert = require('assert');
const { buildChatOpsPayload } = require('./chatops.js');

function run() {
    const slack = buildChatOpsPayload({
        type: 'feat',
        style: 'love',
        message: '新功能也想和你贴贴',
        fullMessage: 'feat: 新功能也想和你贴贴',
        language: 'zh-CN'
    }, { target: 'slack' });

    assert.strictEqual(slack.target, 'slack');
    assert.strictEqual(slack.payload.text, 'feat: 新功能也想和你贴贴');

    const github = buildChatOpsPayload({
        naturalText: '修复登录异常',
        detectedType: 'fix',
        detectedStyle: 'sao',
        type: 'fix',
        style: 'sao',
        message: '这次修复比夜色还丝滑',
        fullMessage: 'fix: 这次修复比夜色还丝滑',
        language: 'zh-CN',
        topic: '登录异常'
    }, { target: 'github-comment' });

    assert.strictEqual(github.target, 'github-comment');
    assert.ok(github.payload.body.includes('fix: 这次修复比夜色还丝滑'));
    assert.strictEqual(github.meta.source, 'natural-language');
}

if (require.main === module) {
    run();
    console.log('chatops tests passed');
}

module.exports = { run };
