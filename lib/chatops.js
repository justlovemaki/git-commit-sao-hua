const crypto = require('crypto');

const SUPPORTED_CHATOPS_TARGETS = ['plain', 'slack', 'discord', 'lark', 'github-comment'];
const DEFAULT_SECRET_HEADER = 'X-Saohua-Signature-256';
const DEFAULT_TIMEOUT_MS = 10000;
const MAX_RESPONSE_BODY_LENGTH = 2000;

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

function normalizeHeaders(headers = {}) {
    if (!headers || typeof headers !== 'object' || Array.isArray(headers)) {
        return {};
    }

    return Object.entries(headers).reduce((acc, [key, value]) => {
        const name = String(key || '').trim();
        if (!name) {
            return acc;
        }

        if (value === undefined || value === null) {
            return acc;
        }

        acc[name] = String(value);
        return acc;
    }, {});
}

function normalizeWebhookUrl(webhookUrl) {
    if (!webhookUrl || typeof webhookUrl !== 'string') {
        throw new Error('请提供 webhookUrl~');
    }

    let url;
    try {
        url = new URL(webhookUrl);
    } catch {
        throw new Error('webhookUrl 格式无效~');
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('webhookUrl 仅支持 http/https 协议~');
    }

    return url.toString();
}

function normalizeTimeoutMs(timeoutMs) {
    const parsed = parseInt(timeoutMs, 10);
    if (!Number.isFinite(parsed)) {
        return DEFAULT_TIMEOUT_MS;
    }

    return Math.min(Math.max(parsed, 1000), 30000);
}

function truncateResponseBody(value) {
    const text = typeof value === 'string' ? value : String(value || '');
    if (text.length <= MAX_RESPONSE_BODY_LENGTH) {
        return text;
    }

    return `${text.slice(0, MAX_RESPONSE_BODY_LENGTH)}…`;
}

function buildWebhookRequest(payloadEnvelope, deliveryOptions = {}) {
    const target = normalizeTarget(deliveryOptions.target || payloadEnvelope?.target);
    const envelope = payloadEnvelope?.target === target
        ? payloadEnvelope
        : buildChatOpsPayload(payloadEnvelope, { target });
    const webhookUrl = normalizeWebhookUrl(deliveryOptions.webhookUrl);
    const timeoutMs = normalizeTimeoutMs(deliveryOptions.timeoutMs);
    const secretHeader = String(deliveryOptions.secretHeader || DEFAULT_SECRET_HEADER).trim() || DEFAULT_SECRET_HEADER;
    const requestBody = JSON.stringify(envelope.payload);
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'git-sao-hua-chatops/1.0',
        ...normalizeHeaders(deliveryOptions.headers)
    };

    if (deliveryOptions.secret) {
        const digest = crypto
            .createHmac('sha256', String(deliveryOptions.secret))
            .update(requestBody)
            .digest('hex');
        headers[secretHeader] = `sha256=${digest}`;
    }

    return {
        target,
        payloadEnvelope: envelope,
        webhookUrl,
        timeoutMs,
        secretHeader,
        requestBody,
        headers
    };
}

async function deliverChatOpsPayload(payloadEnvelope, deliveryOptions = {}) {
    const request = buildWebhookRequest(payloadEnvelope, deliveryOptions);
    const startedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), request.timeoutMs);

    try {
        const response = await fetch(request.webhookUrl, {
            method: 'POST',
            headers: request.headers,
            body: request.requestBody,
            signal: controller.signal
        });
        const responseBody = truncateResponseBody(await response.text());
        return {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            target: request.target,
            url: request.webhookUrl,
            attemptedAt: new Date(startedAt).toISOString(),
            durationMs: Date.now() - startedAt,
            responseBody,
            payload: request.payloadEnvelope.payload
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            statusText: error.name === 'AbortError' ? 'Timeout' : 'NetworkError',
            target: request.target,
            url: request.webhookUrl,
            attemptedAt: new Date(startedAt).toISOString(),
            durationMs: Date.now() - startedAt,
            responseBody: truncateResponseBody(error.message || 'Unknown error'),
            payload: request.payloadEnvelope.payload
        };
    } finally {
        clearTimeout(timeout);
    }
}

module.exports = {
    SUPPORTED_CHATOPS_TARGETS,
    DEFAULT_SECRET_HEADER,
    normalizeTarget,
    buildChatOpsPayload,
    buildWebhookRequest,
    deliverChatOpsPayload
};
