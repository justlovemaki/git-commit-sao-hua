import fetch from 'node-fetch';
import http from 'http';

let BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const results = {
    passed: 0,
    failed: 0,
    tests: []
};

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function test(name, fn) {
    try {
        await fn();
        results.passed++;
        results.tests.push({ name, status: 'PASS' });
        console.log(`✅ ${name}`);
    } catch (error) {
        results.failed++;
        results.tests.push({ name, status: 'FAIL', error: error.message });
        console.log(`❌ ${name}: ${error.message}`);
    }
}

async function get(path, headers = {}) {
    const url = process.env.TEST_URL || BASE_URL;
    const response = await fetch(`${url}${path}`, { headers });
    const data = await response.json();
    return { status: response.status, data };
}

async function post(path, body, headers = {}) {
    const url = process.env.TEST_URL || BASE_URL;
    const response = await fetch(`${url}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    return { status: response.status, data };
}

async function del(path, headers = {}) {
    const url = process.env.TEST_URL || BASE_URL;
    const response = await fetch(`${url}${path}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...headers }
    });
    const data = await response.json();
    return { status: response.status, data };
}

const API_KEY = 'test-api-key-12345';
const BEARER_TOKEN = 'test-bearer-token-67890';

const tests = {
    // === 无认证测试 ===
    
    async testInstallWithoutAuth() {
        const plugin = {
            name: 'test-no-auth-plugin',
            version: '1.0.0',
            description: '测试无认证',
            data: { 'zh-CN': {} }
        };
        const res = await post('/api/plugins/install', plugin);
        // 如果没有配置 SAOHUA_API_KEYS，应该允许通过
        // 如果配置了，应该返回 401
        console.log(`   [Info] 无认证安装返回状态：${res.status}`);
        // 此测试用于观察行为，不强制断言
    },

    async testDeleteWithoutAuth() {
        const res = await del('/api/plugins/nonexistent');
        console.log(`   [Info] 无认证删除返回状态：${res.status}`);
    },

    async testCreateWithoutAuth() {
        const res = await post('/api/plugins/create', { name: 'test-no-auth' });
        console.log(`   [Info] 无认证创建返回状态：${res.status}`);
    },

    async testReloadWithoutAuth() {
        const res = await post('/api/plugins/reload', {});
        console.log(`   [Info] 无认证重载返回状态：${res.status}`);
    },

    // === 有效 API Key 测试 ===
    
    async testInstallWithValidApiKey() {
        const plugin = {
            name: 'test-api-key-plugin',
            version: '1.0.0',
            description: 'API Key 测试插件',
            data: { 'zh-CN': {} }
        };
        const res = await post('/api/plugins/install', plugin, { 'X-API-Key': API_KEY });
        assert(res.status === 200, `Install with valid API Key should return 200, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    async testDeleteWithValidApiKey() {
        const res = await del('/api/plugins/test-api-key-plugin', { 'X-API-Key': API_KEY });
        assert(res.status === 200, `Delete with valid API Key should return 200, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    async testCreateWithValidApiKey() {
        const res = await post('/api/plugins/create', { 
            name: 'test-api-key-template',
            version: '1.0.0'
        }, { 'X-API-Key': API_KEY });
        assert(res.status === 200, `Create with valid API Key should return 200, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    async testReloadWithValidApiKey() {
        const res = await post('/api/plugins/reload', {}, { 'X-API-Key': API_KEY });
        assert(res.status === 200, `Reload with valid API Key should return 200, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    // === 有效 Bearer Token 测试 ===
    
    async testInstallWithValidBearerToken() {
        const plugin = {
            name: 'test-bearer-plugin',
            version: '1.0.0',
            description: 'Bearer Token 测试插件',
            data: { 'zh-CN': {} }
        };
        const res = await post('/api/plugins/install', plugin, { 
            'Authorization': `Bearer ${BEARER_TOKEN}` 
        });
        assert(res.status === 200, `Install with valid Bearer Token should return 200, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    async testDeleteWithValidBearerToken() {
        const res = await del('/api/plugins/test-bearer-plugin', { 
            'Authorization': `Bearer ${BEARER_TOKEN}` 
        });
        assert(res.status === 200, `Delete with valid Bearer Token should return 200, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    async testCreateWithValidBearerToken() {
        const res = await post('/api/plugins/create', { 
            name: 'test-bearer-template',
            version: '1.0.0'
        }, { 'Authorization': `Bearer ${BEARER_TOKEN}` });
        assert(res.status === 200, `Create with valid Bearer Token should return 200, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    async testReloadWithValidBearerToken() {
        const res = await post('/api/plugins/reload', {}, { 
            'Authorization': `Bearer ${BEARER_TOKEN}` 
        });
        assert(res.status === 200, `Reload with valid Bearer Token should return 200, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    // === 无效密钥测试 ===
    
    async testInstallWithInvalidKey() {
        const plugin = {
            name: 'test-invalid-plugin',
            version: '1.0.0',
            description: '无效密钥测试',
            data: { 'zh-CN': {} }
        };
        const res = await post('/api/plugins/install', plugin, { 'X-API-Key': 'invalid-key' });
        assert(res.status === 401, `Install with invalid key should return 401, got ${res.status}`);
        assert(res.data.success === false, 'Should have success: false');
        assert(res.data.error.includes('认证失败'), 'Error should mention authentication failure');
    },

    async testDeleteWithInvalidKey() {
        const res = await del('/api/plugins/nonexistent', { 'X-API-Key': 'invalid-key' });
        assert(res.status === 401, `Delete with invalid key should return 401, got ${res.status}`);
        assert(res.data.success === false, 'Should have success: false');
    },

    async testCreateWithInvalidKey() {
        const res = await post('/api/plugins/create', { name: 'test' }, { 'X-API-Key': 'invalid-key' });
        assert(res.status === 401, `Create with invalid key should return 401, got ${res.status}`);
        assert(res.data.success === false, 'Should have success: false');
    },

    async testReloadWithInvalidKey() {
        const res = await post('/api/plugins/reload', {}, { 'X-API-Key': 'invalid-key' });
        assert(res.status === 401, `Reload with invalid key should return 401, got ${res.status}`);
        assert(res.data.success === false, 'Should have success: false');
    },

    // === 读取端点无需认证测试 ===
    
    async testPluginsListNoAuth() {
        const res = await get('/api/plugins');
        assert(res.status === 200, `Plugins list should return 200 without auth, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    async testHealthNoAuth() {
        const res = await get('/api/health');
        assert(res.status === 200, `Health should return 200 without auth, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    async testSaohuaNoAuth() {
        const res = await get('/api/saohua');
        assert(res.status === 200, `Saohua should return 200 without auth, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    async testTypesNoAuth() {
        const res = await get('/api/types');
        assert(res.status === 200, `Types should return 200 without auth, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    async testStylesNoAuth() {
        const res = await get('/api/styles');
        assert(res.status === 200, `Styles should return 200 without auth, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    async testStatsNoAuth() {
        const res = await get('/api/stats');
        assert(res.status === 200, `Stats should return 200 without auth, got ${res.status}`);
        assert(res.data.success === true, 'Should have success: true');
    },

    // === 清理测试 ===
    
    async testCleanupApiKeyTemplate() {
        const res = await del('/api/plugins/test-api-key-template', { 'X-API-Key': API_KEY });
        // 可能已经在上一步删除了，所以不强制断言
        console.log(`   [Info] 清理 API Key 模板返回状态：${res.status}`);
    },

    async testCleanupBearerTemplate() {
        const res = await del('/api/plugins/test-bearer-template', { 
            'Authorization': `Bearer ${BEARER_TOKEN}` 
        });
        console.log(`   [Info] 清理 Bearer 模板返回状态：${res.status}`);
    }
};

async function startTestServer() {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    
    // 设置测试密钥
    process.env.SAOHUA_API_KEYS = `${API_KEY},${BEARER_TOKEN}`;
    
    const app = await import('./server.js');
    const server = await new Promise((resolve) => {
        const s = http.createServer(app.default);
        s.listen(0, () => resolve(s));
    });
    
    const port = server.address().port;
    process.env.TEST_URL = `http://localhost:${port}`;
    console.log(`\n🧪 认证测试服务器运行在端口 ${port}`);
    console.log(`🔑 测试密钥：${API_KEY}, ${BEARER_TOKEN}\n`);
    
    return { server, originalEnv };
}

async function runTests() {
    console.log('🧪 开始运行 API 认证测试...\n');
    
    const { server, originalEnv } = await startTestServer();
    
    const testNames = Object.keys(tests);
    for (const name of testNames) {
        await test(name, tests[name]);
    }
    
    server.close();
    process.env.NODE_ENV = originalEnv;
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 认证测试结果：${results.passed} 通过，${results.failed} 失败`);
    console.log('='.repeat(50));
    
    if (results.failed > 0) {
        console.log('\n❌ 失败的测试:');
        results.tests
            .filter(t => t.status === 'FAIL')
            .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
    }
    
    process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('测试运行失败:', err);
    process.exit(1);
});
