const generator = require('./generator.js');

const TYPE_KEYWORDS = {
    fix: ['修复', 'fix', 'bug', '错误', '问题', '崩溃', '闪退', '异常', '修复', '修正', '解决', '修复了', '改动'],
    feat: ['新增', '添加', 'feat', '添加', '新功能', '新特性', '增加', '加入', '实现', '创建', '添加了'],
    chore: ['更新', '升级', '更新依赖', '配置', '调整', 'chore', '维护', '重构', '优化'],
    docs: ['文档', 'docs', '说明', '注释', 'readme', '文档'],
    refactor: ['重构', 'refactor', '重写', '优化代码', '整理', '整理代码'],
    style: ['格式', 'style', '格式化', '样式', '风格', 'lint', '格式调整'],
    test: ['测试', 'test', '单元测试', '测试用例', '添加测试'],
    perf: ['性能', 'perf', '优化', '加速', '缓存', '性能提升', '优化'],
    ci: ['ci', 'CI', '流水线', 'workflow', 'actions'],
    build: ['构建', 'build', '打包', '编译', '构建'],
    revert: ['revert', '回滚', '撤销', '恢复'],
    hotfix: ['hotfix', '紧急修复', '快速修复', '临时修复']
};

const STYLE_KEYWORDS = {
    love: ['爱', 'love', '喜欢', '甜甜', '情', '表白', '宠'],
    sao: ['骚', 'sao', '撩', '骚气', '撩人', '痞'],
    zha: ['扎心', 'zha', '心塞', '难受', '难过', '扎'],
    chu: ['中二', 'chu', '热血', '燃', '酷', '帅'],
    fo: ['佛系', 'fo', '随缘', '平和', '淡定', '淡泊']
};

function analyzeLanguage(text) {
    if (!text) return { type: null, style: null, confidence: 0, reason: '' };

    const lowerText = text.toLowerCase();
    const typeScores = {};
    const styleScores = {};

    for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
        typeScores[type] = 0;
        for (const kw of keywords) {
            if (lowerText.includes(kw.toLowerCase())) {
                typeScores[type] += 1;
            }
        }
    }

    for (const [style, keywords] of Object.entries(STYLE_KEYWORDS)) {
        styleScores[style] = 0;
        for (const kw of keywords) {
            if (lowerText.includes(kw.toLowerCase())) {
                styleScores[style] += 1;
            }
        }
    }

    let bestType = 'feat';
    let bestTypeScore = 0;
    for (const [type, score] of Object.entries(typeScores)) {
        if (score > bestTypeScore) {
            bestTypeScore = score;
            bestType = type;
        }
    }

    let bestStyle = 'sao';
    let bestStyleScore = 0;
    for (const [style, score] of Object.entries(styleScores)) {
        if (score > bestStyleScore) {
            bestStyleScore = score;
            bestStyle = style;
        }
    }

    let confidence = 'low';
    if (bestTypeScore >= 2) {
        confidence = 'high';
    } else if (bestTypeScore === 1) {
        confidence = 'medium';
    }

    const reasons = [];
    if (bestTypeScore > 0) {
        reasons.push(`检测到类型关键词: ${bestType}`);
    }
    if (bestStyleScore > 0) {
        reasons.push(`匹配风格: ${bestStyle}`);
    }

    return {
        type: bestType,
        style: bestStyle,
        confidence,
        reason: reasons.join(', ') || '未能识别关键词，使用默认'
    };
}

function extractTopic(text) {
    if (!text) return '';

    let topic = text
        .replace(/^(修复|新增|添加|更新|修复了|添加了)/, '')
        .replace(/^(fix|feat|chore|refactor|update|add)/i, '')
        .trim();

    topic = topic
        .replace(/^(一个|一个|这个|这个)/, '')
        .trim();

    if (topic.length > 50) {
        topic = topic.substring(0, 47) + '...';
    }

    return topic || '功能';
}

function generateFromNaturalLanguage(naturalText, language = 'zh-CN') {
    const analysis = analyzeLanguage(naturalText);
    const topic = extractTopic(naturalText);

    return {
        naturalText,
        detectedType: analysis.type,
        detectedStyle: analysis.style,
        topic,
        confidence: analysis.confidence,
        reason: analysis.reason,
        language
    };
}

function generateCommitFromNaturalLanguage(naturalText, options = {}) {
    const language = options.language || 'zh-CN';
    const analysisResult = generateFromNaturalLanguage(naturalText, language);
    const selectedType = options.type || analysisResult.detectedType || 'feat';
    const selectedStyle = options.style || analysisResult.detectedStyle || 'sao';
    const commit = generator.generateByType(selectedType, selectedStyle, language);

    return {
        ...analysisResult,
        type: commit.type,
        style: commit.style,
        message: commit.message,
        fullMessage: commit.fullMessage
    };
}

module.exports = {
    analyzeLanguage,
    extractTopic,
    generateFromNaturalLanguage,
    generateCommitFromNaturalLanguage,
    TYPE_KEYWORDS,
    STYLE_KEYWORDS
};
