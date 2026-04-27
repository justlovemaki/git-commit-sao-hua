const assert = require('assert');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const { createHttpServer } = require('./server.js');

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

function httpRequest({ port, path: pathname, method = 'GET', headers = {}, body }) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            host: '127.0.0.1',
            port,
            path: pathname,
            method,
            headers
        }, res => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        if (body) {
            req.write(body);
        }
        req.end();
    });
}

async function runHttpTests() {
    const server = createHttpServer({ port: 0, authToken: 'top-secret' });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();

    try {
        const health = await httpRequest({ port, path: '/health' });
        assert.strictEqual(health.statusCode, 200);
        const healthPayload = JSON.parse(health.body);
        assert.strictEqual(healthPayload.ok, true);
        assert.strictEqual(healthPayload.endpoint, '/mcp');
        assert.strictEqual(healthPayload.authRequired, true);

        const unauthorized = await httpRequest({
            port,
            path: '/mcp',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping', params: {} })
        });
        assert.strictEqual(unauthorized.statusCode, 401);
        assert.ok(String(unauthorized.headers['www-authenticate'] || '').includes('Bearer'));

        const init = await httpRequest({
            port,
            path: '/mcp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer top-secret'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 2,
                method: 'initialize',
                params: {
                    protocolVersion: '2024-11-05',
                    clientInfo: { name: 'http-test-client', version: '1.0.0' },
                    capabilities: {}
                }
            })
        });
        assert.strictEqual(init.statusCode, 200);
        const initPayload = JSON.parse(init.body);
        assert.strictEqual(initPayload.result.serverInfo.name, 'git-sao-hua-mcp');

        const tools = await httpRequest({
            port,
            path: '/mcp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer top-secret'
            },
            body: JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/list', params: {} })
        });
        assert.strictEqual(tools.statusCode, 200);
        const toolsPayload = JSON.parse(tools.body);
        assert.ok(Array.isArray(toolsPayload.result.tools));
        assert.ok(toolsPayload.result.tools.some(tool => tool.name === 'generate_saohua'));

        const invalidJson = await httpRequest({
            port,
            path: '/mcp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer top-secret'
            },
            body: '{invalid'
        });
        assert.strictEqual(invalidJson.statusCode, 400);
        const invalidPayload = JSON.parse(invalidJson.body);
        assert.strictEqual(invalidPayload.error.code, -32700);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
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
        assert.ok(init.result.capabilities.tools, 'initialize should declare tools capability');
        assert.ok(init.result.capabilities.resources, 'initialize should declare resources capability');
        assert.ok(init.result.capabilities.prompts, 'initialize should declare prompts capability');
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

        const resources = await client.request('resources/list', {});
        assert.ok(Array.isArray(resources.result.resources), 'resources/list should return resources array');
        assert.ok(resources.result.resources.some(r => r.uri === 'git-sao-hua://info/server'));
        assert.ok(resources.result.resources.some(r => r.uri === 'git-sao-hua://taxonomy/commits'));
        assert.ok(resources.result.resources.some(r => r.uri === 'git-sao-hua://info/usage'));

        const serverInfo = await client.request('resources/read', {
            uri: 'git-sao-hua://info/server'
        });
        const serverPayload = JSON.parse(serverInfo.result.contents[0].text);
        assert.strictEqual(serverPayload.serverInfo.name, 'git-sao-hua-mcp');
        assert.ok(serverPayload.capabilities.prompts.includes('generate_from_diff'));

        const commitTaxonomy = await client.request('resources/read', {
            uri: 'git-sao-hua://taxonomy/commits'
        });
        assert.ok(commitTaxonomy.result.contents, 'resources/read should return contents');
        const commitData = JSON.parse(commitTaxonomy.result.contents[0].text);
        assert.ok(Array.isArray(commitData['zh-CN']), 'commit taxonomy should have zh-CN types');

        const usageGuide = await client.request('resources/read', {
            uri: 'git-sao-hua://info/usage'
        });
        assert.ok(usageGuide.result.contents[0].text.includes('Git Saohua MCP Server'));

        const styleTaxonomy = await client.request('resources/read', {
            uri: 'git-sao-hua://taxonomy/styles'
        });
        const styleData = JSON.parse(styleTaxonomy.result.contents[0].text);
        assert.ok(Array.isArray(styleData['zh-CN']), 'style taxonomy should have zh-CN styles');

        const invalidResource = await client.request('resources/read', {
            uri: 'git-sao-hua://not/exist'
        });
        assert.ok(invalidResource.error, 'invalid resource should return error');

        const prompts = await client.request('prompts/list', {});
        assert.ok(Array.isArray(prompts.result.prompts), 'prompts/list should return prompts array');
        assert.ok(prompts.result.prompts.some(p => p.name === 'generate_from_natural_language'));
        assert.ok(prompts.result.prompts.some(p => p.name === 'generate_from_diff'));

        const promptNl = await client.request('prompts/get', {
            name: 'generate_from_natural_language',
            arguments: { text: 'add login feature', language: 'en' }
        });
        assert.ok(promptNl.result.prompt, 'prompts/get should return prompt');
        assert.ok(Array.isArray(promptNl.result.prompt.messages));
        assert.ok(promptNl.result.prompt.description.includes('natural-language'));
        assert.ok(promptNl.result.prompt.messages[1].content.text.includes('Suggested commit:'));

        const promptDiff = await client.request('prompts/get', {
            name: 'generate_from_diff',
            arguments: { diff: 'diff --git a/a.js b/a.js\n+console.log("hello")', language: 'zh-CN' }
        });
        assert.ok(promptDiff.result.prompt, 'generate_from_diff prompt should return result');
        assert.ok(promptDiff.result.prompt.description.includes('git diff'));
        assert.ok(promptDiff.result.prompt.messages[1].content.text.includes('Suggested commit:'));

        const invalidPrompt = await client.request('prompts/get', {
            name: 'not_exists',
            arguments: {}
        });
        assert.ok(invalidPrompt.error, 'invalid prompt should return error');

        console.log('✅ MCP server tests passed');
    } finally {
        await client.close();
    }
})().catch(error => {
    console.error('❌ MCP server tests failed:', error);
    process.exit(1);
});

function createHttpClient(port, token) {
    return {
        async request(method, params) {
            return new Promise((resolve, reject) => {
                const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
                const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) };
                if (token) headers['Authorization'] = `Bearer ${token}`;
                const req = http.request({ hostname: 'localhost', port, path: '/mcp', method: 'POST', headers }, res => {
                    let data = '';
                    res.on('data', chunk => { data += chunk; });
                    res.on('end', () => resolve(JSON.parse(data)));
                });
                req.on('error', reject);
                req.end(body);
            });
        },
        health() {
            return new Promise((resolve, reject) => {
                http.get(`http://localhost:${port}/health`, res => {
                    let data = '';
                    res.on('data', chunk => { data += chunk; });
                    res.on('end', () => resolve(JSON.parse(data)));
                }).on('error', reject);
            });
        }
    };
}

function getPortFromEnv() {
    return Number(process.env.MCP_HTTP_PORT) || 3100;
}

function getTokenFromEnv() {
    return process.env.MCP_HTTP_AUTH_TOKEN || '';
}

async function runHttpTests() {
    const { createHttpServer } = require('./server.js');
    const port = getPortFromEnv() + 1;
    const server = createHttpServer(port);
    const token = getTokenFromEnv();

    await new Promise(resolve => server.listen(port, resolve));

    try {
        const client = createHttpClient(port, token);

        const health = await client.health();
        assert.strictEqual(health.ok, true);
        assert.strictEqual(health.serverInfo.name, 'git-sao-hua-mcp');
        console.log('✅ HTTP health check passed');

        const init = await client.request('initialize', {
            protocolVersion: '2024-11-05',
            clientInfo: { name: 'test-client', version: '1.0.0' },
            capabilities: {}
        });
        assert.ok(init.result, 'initialize should return result');
        assert.strictEqual(init.result.serverInfo.name, 'git-sao-hua-mcp');

        const toolList = await client.request('tools/list', {});
        assert.ok(Array.isArray(toolList.result.tools), 'tools/list should return tools array');
        assert.ok(toolList.result.tools.some(tool => tool.name === 'generate_saohua'));

        const single = await client.request('tools/call', {
            name: 'generate_saohua',
            arguments: { type: 'fix', style: 'love', language: 'zh-CN' }
        });
        const singlePayload = JSON.parse(single.result.content[0].text);
        assert.strictEqual(singlePayload.type, 'fix');
        assert.strictEqual(singlePayload.style, 'love');

        const resources = await client.request('resources/list', {});
        assert.ok(Array.isArray(resources.result.resources), 'resources/list should return resources array');

        const prompts = await client.request('prompts/list', {});
        assert.ok(Array.isArray(prompts.result.prompts), 'prompts/list should return prompts array');

        const natural = await client.request('tools/call', {
            name: 'generate_from_natural_language',
            arguments: { text: '修复登录页面闪退 bug', language: 'zh-CN' }
        });
        const naturalPayload = JSON.parse(natural.result.content[0].text);
        assert.strictEqual(naturalPayload.type, 'fix');
        assert.ok(naturalPayload.fullMessage.includes('fix:'));

        console.log('✅ HTTP MCP server tests passed');
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
}

if (require.main === module) {
    const isHttpTest = process.argv.includes('--http');
    if (isHttpTest) {
        runHttpTests().catch(error => {
            console.error('❌ HTTP MCP server tests failed:', error);
            process.exit(1);
        });
    } else {
        console.log('Run stdio tests. Use --http for HTTP tests.');
        console.log('✅ All tests ready');
    }
}
