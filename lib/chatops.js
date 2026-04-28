const SUPPORTED_CHATOPS_TARGETS = ['plain', 'slack', 'discord', 'lark', 'github-comment'];

function normalizeTarget(target) {
    return SUPPORTED_CHATOPS_TARGETS.includes(target) ? target : 'plain';
}

function normalizeInput(result = {}) {
    const type = result.type || result.detectedType || 'chore';
    const style = result.style || result.detectedStyle || 'sao';
    const message = result.message || result.fullMessage || '';
    const fullMessage = result.fullMessage || (message ? `${type}: ${message}` : `${type}:`);
    const language = result.language || 'zh-CN';
    const topic = result.topic || '';
    const source = result.naturalText ? 'natural-language' : 'saohua';

    return {
        ...result,
        type,
        style,
        message,
        fullMessage,
        language,
        topic,
        source
    };
}

function buildText(entry, target) {
    const prefix = entry.source === 'natural-language' ? '🧠 自然语言骚话' : '💕 骚话提交';
    const topicLine = entry.topic ? `\n主题：${entry.topic}` : '';

    if (target === 'github-comment') {
        return `${prefix}\n\n- 类型：\`${entry.type}\`\n- 风格：\`${entry.style}\`\n- 语言：\`${entry.language}\`${topicLine ? `\n- 主题：${entry.topic}` : ''}\n- 提交：\`${entry.fullMessage}\``;
    }

    return `${prefix}\n类型：${entry.type}\n风格：${entry.style}\n语言：${entry.language}${topicLine}\n提交：${entry.fullMessage}`;
}

function buildPayload(entry, target) {
    switch (target) {
        case 'slack':
            return {
                text: entry.fullMessage,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*Git Commit 骚话*\n\`${entry.fullMessage}\``
                        }
                    },
                    {
                        type: 'context',
                        elements: [
                            { type: 'mrkdwn', text: `type: \`${entry.type}\`` },
                            { type: 'mrkdwn', text: `style: \`${entry.style}\`` },
                            { type: 'mrkdwn', text: `lang: \`${entry.language}\`` }
                        ]
                    }
                ]
            };
        case 'discord':
            return {
                content: entry.fullMessage,
                embeds: [
                    {
                        title: 'Git Commit 骚话',
                        description: `\`${entry.fullMessage}\``,
                        fields: [
                            { name: 'Type', value: entry.type, inline: true },
                            { name: 'Style', value: entry.style, inline: true },
                            { name: 'Language', value: entry.language, inline: true }
                        ]
                    }
                ]
            };
        case 'lark':
            return {
                msg_type: 'interactive',
                card: {
                    config: { wide_screen_mode: true },
                    header: {
                        title: { tag: 'plain_text', content: 'Git Commit 骚话' },
                        template: 'blue'
                    },
                    elements: [
                        {
                            tag: 'div',
                            text: {
                                tag: 'lark_md',
                                content: `**提交**\n\`${entry.fullMessage}\`\n\n**类型**: ${entry.type}  **风格**: ${entry.style}  **语言**: ${entry.language}`
                            }
                        }
                    ]
                }
            };
        case 'github-comment':
            return {
                body: buildText(entry, target)
            };
        case 'plain':
        default:
            return {
                text: buildText(entry, target)
            };
    }
}

function buildChatOpsPayload(result = {}, options = {}) {
    const target = normalizeTarget(options.target || 'plain');
    const entry = normalizeInput(result);
    const text = buildText(entry, target);
    const payload = buildPayload(entry, target);

    return {
        target,
        text,
        payload,
        meta: {
            source: entry.source,
            type: entry.type,
            style: entry.style,
            language: entry.language,
            topic: entry.topic || undefined,
            supportedTargets: [...SUPPORTED_CHATOPS_TARGETS]
        }
    };
}

module.exports = {
    SUPPORTED_CHATOPS_TARGETS,
    normalizeTarget,
    buildChatOpsPayload
};
