const assert = require('assert');
const { spawn } = require('child_process');
const path = require('path');

function encodeMessage(payload) {
    const json = JSON.stringify(payload);
    return `Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`;
}

function createClient() {
    const serverPath = path.join(__dirname, 'server.js');
    const child = spawn(process.execPath, [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let buffer = Buffer.alloc(0);
    const pending = new Map();
    let nextId = 1;

    child.stdout.on('data', chunk => {
        buffer = Buffer.concat([buffer, Buffer.from(chunk)]);

        while (true) {
            const headerEnd = buffer.indexOf('\r\n\r\n');
            if (headerEnd === -1) break;

            const headerText = buffer.slice(0, headerEnd).toString('utf8');
            const match = headerText.match(/Content-Length:\s*(\d+)/i);
            if (!match) {
                throw new Error('Missing Content-Length header');
            }

            const length = Number(match[1]);
            const bodyStart = headerEnd + 4;
            const bodyEnd = bodyStart + length;
            if (buffer.length < bodyEnd) break;

            const body = buffer.slice(bodyStart, bodyEnd).toString('utf8');
            buffer = buffer.slice(bodyEnd);
            const payload = JSON.parse(body);
            const waiter = pending.get(payload.id);
            if (waiter) {
                pending.delete(payload.id);
                waiter(payload);
            }
        }
    });

    function request(method, params) {
        const id = nextId++;
        child.stdin.write(encodeMessage({ jsonrpc: '2.0', id, method, params }));
        return new Promise(resolve => pending.set(id, resolve));
    }

    function notify(method, params) {
        child.stdin.write(encodeMessage({ jsonrpc: '2.0', method, params }));
    }

    async function close() {
        child.stdin.end();
        child.kill();
        await new Promise(resolve => child.once('exit', resolve));
    }

    return { child, request, notify, close };
}

(async function run() {
    const client = createClient();

    try {
        const init = await client.request('initialize', {
            protocolVersion: '2024-11-05',
            clientInfo: { name: 'test-client', version: '1.0.0' },
            capabilities: {}
        });
        assert.ok(init.result, 'initialize should return result');
        assert.strictEqual(init.result.serverInfo.name, 'git-sao-hua-mcp');
        client.notify('notifications/initialized', {});

        const toolList = await client.request('tools/list', {});
        assert.ok(Array.isArray(toolList.result.tools), 'tools/list should return tools array');
        assert.ok(toolList.result.tools.some(tool => tool.name === 'generate_saohua'));
        assert.ok(toolList.result.tools.some(tool => tool.name === 'batch_generate_saohua'));

        const single = await client.request('tools/call', {
            name: 'generate_saohua',
            arguments: { type: 'fix', style: 'love', language: 'zh-CN' }
        });
        const singlePayload = JSON.parse(single.result.content[0].text);
        assert.strictEqual(singlePayload.type, 'fix');
        assert.strictEqual(singlePayload.style, 'love');
        assert.match(singlePayload.fullMessage, /^fix:/);

        const natural = await client.request('tools/call', {
            name: 'generate_from_natural_language',
            arguments: { text: '修复登录页面闪退 bug', language: 'zh-CN' }
        });
        const naturalPayload = JSON.parse(natural.result.content[0].text);
        assert.strictEqual(naturalPayload.type, 'fix');
        assert.ok(naturalPayload.fullMessage.includes('fix:'));

        const taxonomy = await client.request('tools/call', {
            name: 'list_taxonomy',
            arguments: { language: 'en' }
        });
        const taxonomyPayload = JSON.parse(taxonomy.result.content[0].text);
        assert.strictEqual(taxonomyPayload.language, 'en');
        assert.ok(taxonomyPayload.types.some(item => item.value === 'feat'));
        assert.ok(taxonomyPayload.styles.some(item => item.value === 'sao'));

        const batch = await client.request('tools/call', {
            name: 'batch_generate_saohua',
            arguments: {
                items: [
                    { mode: 'typed', type: 'feat', style: 'sao', lang: 'zh-CN' },
                    { mode: 'random', lang: 'en' }
                ]
            }
        });
        const batchPayload = JSON.parse(batch.result.content[0].text);
        assert.strictEqual(batchPayload.success, true);
        assert.strictEqual(batchPayload.count, 2);
        assert.strictEqual(batchPayload.items.length, 2);

        const unknown = await client.request('tools/call', {
            name: 'not_exists',
            arguments: {}
        });
        assert.ok(unknown.error, 'unknown tool should return error');
        assert.strictEqual(unknown.error.code, -32602);

        console.log('✅ MCP server tests passed');
    } finally {
        await client.close();
    }
})().catch(error => {
    console.error('❌ MCP server tests failed:', error);
    process.exit(1);
});
