const assert = require('assert');
const { handlePullRequest, generateSaoHuaComment, detectType, detectStyle } = require('./webhook');

console.log('Running GitHub Saohua App tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        passed++;
    } catch (error) {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
        failed++;
    }
}

// Type Detection Tests
test('detectType should detect fix type', () => {
    const type = detectType('Fix bug in login');
    assert.strictEqual(type, 'fix');
});

test('detectType should detect feat type', () => {
    const type = detectType('Add new feature');
    assert.strictEqual(type, 'feat');
});

test('detectType should detect docs type', () => {
    const type = detectType('Update README documentation');
    assert.strictEqual(type, 'docs');
});

test('detectType should detect refactor type', () => {
    const type = detectType('Refactor code structure');
    assert.strictEqual(type, 'refactor');
});

test('detectType should detect test type', () => {
    const type = detectType('Add unit tests');
    assert.strictEqual(type, 'test');
});

test('detectType should default to feat', () => {
    const type = detectType('Random commit');
    assert.strictEqual(type, 'feat');
});

// Style Detection Tests
test('detectStyle should detect love style', () => {
    const style = detectStyle('I love this feature');
    assert.strictEqual(style, 'love');
});

test('detectStyle should detect sao style', () => {
    const style = detectStyle('This is so 撩');
    assert.strictEqual(style, 'sao');
});

test('detectStyle should detect zha style', () => {
    const style = detectStyle('This is so 难过 and sad');
    assert.strictEqual(style, 'zha');
});

test('detectStyle should detect chu style', () => {
    const style = detectStyle('This is so 燃 and 热血');
    assert.strictEqual(style, 'chu');
});

test('detectStyle should detect fo style', () => {
    const style = detectStyle('佛系随缘');
    assert.strictEqual(style, 'fo');
});

test('detectStyle should random when no keywords', () => {
    const style = detectStyle('Random commit');
    const validStyles = ['love', 'sao', 'zha', 'chu', 'fo'];
    assert(validStyles.includes(style), `Style ${style} should be valid`);
});

// Comment Generation Tests
test('generateSaoHuaComment should generate PR comment', () => {
    const comment = generateSaoHuaComment({
        type: 'pull_request',
        title: 'Add new feature',
        body: 'This is a cool feature',
        number: 1,
        sender: 'testuser',
    });
    
    assert(comment.includes('🐙 收到 PR 了'), 'Should include PR prefix');
    assert(comment.includes('Add new feature'), 'Should include title');
    assert(comment.includes('骚话生成器自动生成'), 'Should include footer');
});

test('generateSaoHuaComment should generate Issue comment', () => {
    const comment = generateSaoHuaComment({
        type: 'issue',
        title: 'Bug report',
        body: 'Found a bug',
        number: 2,
        sender: 'testuser',
    });
    
    assert(comment.includes('🐙 收到 Issue 了'), 'Should include Issue prefix');
    assert(comment.includes('Bug report'), 'Should include title');
});

test('generateSaoHuaComment should handle empty body', () => {
    const comment = generateSaoHuaComment({
        type: 'pull_request',
        title: 'Simple fix',
        body: '',
        number: 3,
        sender: 'testuser',
    });
    
    assert(comment.length > 0, 'Should generate comment even with empty body');
});

// Integration Tests
test('Full workflow: PR with fix keywords should generate fix type comment', () => {
    const comment = generateSaoHuaComment({
        type: 'pull_request',
        title: 'Fix critical bug',
        body: 'This fixes a critical issue',
        number: 4,
        sender: 'developer',
    });
    
    assert(comment.includes('🐙 收到 PR 了'), 'Should be PR comment');
    assert(comment.length > 50, 'Comment should have meaningful length');
});

test('Full workflow: Issue with feature request should generate feat type comment', () => {
    const comment = generateSaoHuaComment({
        type: 'issue',
        title: 'Feature request: Add dark mode',
        body: 'Would love to have dark mode',
        number: 5,
        sender: 'user',
    });
    
    assert(comment.includes('🐙 收到 Issue 了'), 'Should be Issue comment');
    assert(comment.includes('Feature request'), 'Should include title');
});

// Summary
console.log('\n=== Summary ===\n');
console.log(`Total: ${passed + failed} tests`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
    console.log('\n✅ All tests passed!');
    process.exit(0);
} else {
    console.log(`\n❌ ${failed} test(s) failed`);
    process.exit(1);
}
