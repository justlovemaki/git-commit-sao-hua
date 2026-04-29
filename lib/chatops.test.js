const assert = require('assert');
const http = require('http');
const { buildChatOpsPayload } = require('./chatops.js');
const { deliverChatOpsPayload } = require('./chatops.js');

async function run() {
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

    const received = await new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk;
            });
            req.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('ok');
                server.close(() => resolve({ headers: req.headers, body }));
            });
        });

        server.on('error', reject);
        server.listen(0, async () => {
            const { port } = server.address();
            const delivery = await deliverChatOpsPayload(slack, {
                webhookUrl: `http://127.0.0.1:${port}/hook`,
                secret: 'abc123'
            });

            assert.strictEqual(delivery.ok, true);
            assert.strictEqual(delivery.status, 200);
        });
    });

    assert.ok(received.headers['x-saohua-signature-256']);
    assert.ok(received.body.includes('feat: 新功能也想和你贴贴'));
}

if (require.main === module) {
    run().then(() => {
        console.log('chatops tests passed');
    });
}

module.exports = { run };
