const saoHua = require('git-sao-hua-core');

const TYPE_KEYWORDS = {
    fix: ['fix', 'bug', '修复', '错误', '问题', '修复'],
    feat: ['feat', 'feature', '功能', '新功能', '添加', '增加'],
    chore: ['chore', '维护', '日常', '更新依赖'],
    docs: ['docs', '文档', 'readme', '说明'],
    refactor: ['refactor', '重构', '重写', '优化代码'],
    style: ['style', '格式', '格式化', '排版', 'lint'],
    test: ['test', '测试', '单元测试', '测试用例'],
    perf: ['perf', '性能', '优化', 'speed', 'performance'],
    ci: ['ci', 'cd', 'pipeline', 'workflow', 'github actions'],
    build: ['build', '构建', '打包', 'compile'],
    revert: ['revert', '回滚', '撤销', '撤销'],
    hotfix: ['hotfix', '紧急', 'urgent', '快速修复'],
};

const STYLE_KEYWORDS = {
    love: ['love', '爱', '喜欢', '心', '甜甜的'],
    sao: ['骚', '撩', '浪', '暧昧', '不正经'],
    zha: ['扎心', '难过', '伤心', '哭', '泪', 'sad'],
    chu: ['中二', '燃', '热血', '战斗', '觉醒'],
    fo: ['佛系', '随缘', '淡定', '平和', '修行'],
};

function detectType(text) {
    const lowerText = text.toLowerCase();
    
    for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword.toLowerCase())) {
                return type;
            }
        }
    }
    
    return 'feat';
}

function detectStyle(text) {
    const lowerText = text.toLowerCase();
    
    for (const [style, keywords] of Object.entries(STYLE_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword.toLowerCase())) {
                return style;
            }
        }
    }
    
    const styles = ['love', 'sao', 'zha', 'chu', 'fo'];
    return styles[Math.floor(Math.random() * styles.length)];
}

function generateSaoHuaComment(data) {
    const combinedText = `${data.title} ${data.body}`.toLowerCase();
    
    const type = detectType(combinedText);
    const style = detectStyle(combinedText);
    
    const result = saoHua.generateByType(type, style);
    
    const prefix = data.type === 'pull_request' 
        ? '🐙 收到 PR 了，让我来看看~' 
        : '🐙 收到 Issue 了，让我来康康~';
    
    const comment = `${prefix}\n\n> ${data.title}\n\n${result.message}\n\n---\n*骚话生成器自动生成*`;
    
    return comment;
}

async function handlePullRequest(data, context) {
    const comment = generateSaoHuaComment(data);
    
    const commentParams = context.repo({
        body: comment,
        issue_number: data.issueNumber,
    });
    
    await context.octokit.issues.createComment(commentParams);
    
    return comment;
}

module.exports = {
    handlePullRequest,
    generateSaoHuaComment,
    detectType,
    detectStyle,
};
