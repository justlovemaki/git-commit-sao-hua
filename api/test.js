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

async function get(path) {
    const url = process.env.TEST_URL || BASE_URL;
    const response = await fetch(`${url}${path}`);
    const data = await response.json();
    return { status: response.status, data };
}

async function post(path, body) {
    const url = process.env.TEST_URL || BASE_URL;
    const response = await fetch(`${url}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    return { status: response.status, data };
}

const tests = {
    async testHealthEndpoint() {
        const res = await get('/api/health');
        assert(res.status === 200, 'Health should return 200');
        assert(res.data.success === true, 'Health should have success: true');
        assert(res.data.data.status === 'ok', 'Health status should be ok');
        assert(res.data.data.version === '1.0.0', 'Version should be 1.0.0');
    },

    async testRandomSaoHua() {
        const res = await get('/api/saohua');
        assert(res.status === 200, 'Random saohua should return 200');
        assert(res.data.success === true, 'Should have success: true');
        assert(res.data.data.type, 'Should have type');
        assert(res.data.data.style, 'Should have style');
        assert(res.data.data.message, 'Should have message');
        assert(res.data.data.language, 'Should have language');
    },

    async testRandomSaoHuaWithLang() {
        const res = await get('/api/saohua?lang=en');
        assert(res.status === 200, 'Should return 200');
        assert(res.data.data.language === 'en', 'Language should be en');
    },

    async testRandomSaoHuaWithStyle() {
        const res = await get('/api/saohua?style=love');
        assert(res.status === 200, 'Should return 200');
        assert(res.data.data.style === 'love', 'Style should be love');
    },

    async testSaoHuaByType() {
        const res = await get('/api/saohua/fix');
        assert(res.status === 200, 'Type fix should return 200');
        assert(res.data.data.type === 'fix', 'Type should be fix');
        assert(res.data.data.message, 'Should have message');
    },

    async testSaoHuaByTypeWithLang() {
        const res = await get('/api/saohua/feat?lang=en');
        assert(res.status === 200, 'Should return 200');
        assert(res.data.data.type === 'feat', 'Type should be feat');
        assert(res.data.data.language === 'en', 'Language should be en');
    },

    async testSaoHuaByTypeInvalid() {
        const res = await get('/api/saohua/invalid-type');
        assert(res.status === 400, 'Invalid type should return 400');
        assert(res.data.success === false, 'Should have success: false');
    },

    async testSaoHuaByTypeAndStyle() {
        const res = await get('/api/saohua/fix/love');
        assert(res.status === 200, 'Should return 200');
        assert(res.data.data.type === 'fix', 'Type should be fix');
        assert(res.data.data.style === 'love', 'Style should be love');
        assert(res.data.data.message, 'Should have message');
    },

    async testSaoHuaByTypeAndStyleWithLang() {
        const res = await get('/api/saohua/feat/sao?lang=en');
        assert(res.status === 200, 'Should return 200');
        assert(res.data.data.type === 'feat', 'Type should be feat');
        assert(res.data.data.style === 'sao', 'Style should be sao');
        assert(res.data.data.language === 'en', 'Language should be en');
    },

    async testSaoHuaByTypeAndStyleInvalid() {
        const res = await get('/api/saohua/fix/invalid-style');
        assert(res.status === 400, 'Invalid style should return 400');
        assert(res.data.success === false, 'Should have success: false');
    },

    async testAIGeneration() {
        const res = await post('/api/saohua/ai', {
            diff: 'diff --git a/test.js b/test.js\n+console.log("test");\n-// old'
        });
        assert(res.status === 200, 'AI generation should return 200');
        assert(res.data.success === true, 'Should have success: true');
        assert(res.data.data.message, 'Should have message');
    },

    async testAIGenerationWithType() {
        const res = await post('/api/saohua/ai', {
            diff: 'diff --git a/test.js b/test.js\n+console.log("test");',
            type: 'feat',
            lang: 'en'
        });
        assert(res.status === 200, 'Should return 200');
        assert(res.data.data.type === 'feat', 'Type should be feat');
    },

    async testAIGenerationNoDiff() {
        const res = await post('/api/saohua/ai', {});
        assert(res.status === 400, 'No diff should return 400');
        assert(res.data.success === false, 'Should have success: false');
    },

    async testTypesEndpoint() {
        const res = await get('/api/types');
        assert(res.status === 200, 'Types should return 200');
        assert(res.data.success === true, 'Should have success: true');
        assert(Array.isArray(res.data.data.types), 'Types should be array');
        assert(res.data.data.count > 0, 'Should have types count');
    },

    async testTypesWithLang() {
        const res = await get('/api/types?lang=en');
        assert(res.status === 200, 'Should return 200');
        assert(res.data.data.types[0].value === 'fix', 'First type should be fix');
    },

    async testStylesEndpoint() {
        const res = await get('/api/styles');
        assert(res.status === 200, 'Styles should return 200');
        assert(res.data.success === true, 'Should have success: true');
        assert(Array.isArray(res.data.data.styles), 'Styles should be array');
        assert(res.data.data.count > 0, 'Should have styles count');
    },

    async testStylesWithLang() {
        const res = await get('/api/styles?lang=en');
        assert(res.status === 200, 'Should return 200');
        assert(res.data.data.styles[0].value === 'love', 'First style should be love');
    },

    async testStatsEndpoint() {
        const res = await get('/api/stats');
        assert(res.status === 200, 'Stats should return 200');
        assert(res.data.success === true, 'Should have success: true');
        assert(res.data.data.totalTypes > 0, 'Should have totalTypes');
        assert(res.data.data.totalStyles > 0, 'Should have totalStyles');
        assert(res.data.data.totalMessages > 0, 'Should have totalMessages');
    },

    async testStatsWithLang() {
        const res = await get('/api/stats?lang=en');
        assert(res.status === 200, 'Should return 200');
        assert(res.data.data.language === 'en', 'Language should be en');
    },

    async test404Endpoint() {
        const res = await get('/api/not-exist');
        assert(res.status === 404, 'Non-existent endpoint should return 404');
        assert(res.data.success === false, 'Should have success: false');
    },

    async testResponseStructure() {
        const res = await get('/api/saohua');
        assert(res.data.success !== undefined, 'Should have success field');
        assert(res.data.data !== undefined, 'Should have data field');
        assert(res.data.meta !== undefined, 'Should have meta field');
        assert(res.data.meta.timestamp !== undefined, 'Should have timestamp');
    },

    async testAllTypes() {
        const types = ['fix', 'feat', 'chore', 'docs', 'refactor', 'style', 'test', 'perf', 'ci', 'build', 'revert', 'hotfix'];
        for (const type of types) {
            const res = await get(`/api/saohua/${type}`);
            assert(res.status === 200, `Type ${type} should work`);
        }
    },

    async testAllStyles() {
        const styles = ['love', 'sao', 'zha', 'chu', 'fo'];
        const res = await get('/api/saohua/fix');
        const validStyles = styles;
        for (const style of validStyles) {
            const typeRes = await get(`/api/saohua/fix/${style}`);
            assert(typeRes.status === 200, `Style ${style} should work`);
        }
    }
};

async function startTestServer() {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    
    const app = await import('./server.js');
    const server = await new Promise((resolve) => {
        const s = http.createServer(app.default);
        s.listen(0, () => resolve(s));
    });
    
    const port = server.address().port;
    process.env.TEST_URL = `http://localhost:${port}`;
    console.log(`\n🧪 测试服务器运行在端口 ${port}\n`);
    
    return { server, originalEnv };
}

async function runTests() {
    console.log('🧪 开始运行 API 测试...\n');
    
    const { server, originalEnv } = await startTestServer();
    
    const testNames = Object.keys(tests);
    for (const name of testNames) {
        await test(name, tests[name]);
    }
    
    server.close();
    process.env.NODE_ENV = originalEnv;
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 测试结果: ${results.passed} 通过, ${results.failed} 失败`);
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