#!/usr/bin/env node

const core = require('../lib/index.js');

const SERVER_INFO = {
    name: 'git-sao-hua-mcp',
    version: core.version || '1.31.0'
};

const TOOL_DEFS = [
    {
        name: 'generate_saohua',
        description: 'Generate a single git commit saohua message by type/style/language, or random when omitted.',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: 'Commit type, like feat/fix/docs.' },
                style: { type: 'string', description: 'Saohua style, like sao/love/fo.' },
                language: { type: 'string', description: 'Language, zh-CN or en.' },
                description: { type: 'string', description: 'Optional commit description appended after the saohua.' }
            },
            additionalProperties: false
        }
    },
    {
        name: 'batch_generate_saohua',
        description: 'Generate saohua messages in batch mode.',
        inputSchema: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    description: 'Batch request items compatible with git-sao-hua generateBatch().',
                    items: {
                        type: 'object',
                        properties: {
                            mode: { type: 'string', description: 'random/typed/typed_style/ai' },
                            type: { type: 'string' },
                            style: { type: 'string' },
                            lang: { type: 'string' },
                            diff: { type: 'string' }
                        },
                        additionalProperties: true
                    }
                }
            },
            required: ['items'],
            additionalProperties: false
        }
    },
    {
        name: 'generate_from_natural_language',
        description: 'Generate a commit message from natural language description.',
        inputSchema: {
            type: 'object',
            properties: {
                text: { type: 'string', description: 'Natural language description of the change.' },
                language: { type: 'string', description: 'Language, zh-CN or en.' },
                type: { type: 'string', description: 'Optional forced commit type.' },
                style: { type: 'string', description: 'Optional forced saohua style.' }
            },
            required: ['text'],
            additionalProperties: false
        }
    },
    {
        name: 'list_taxonomy',
        description: 'List supported commit types and styles for a given language.',
        inputSchema: {
            type: 'object',
            properties: {
                language: { type: 'string', description: 'Language, zh-CN or en.' }
            },
            additionalProperties: false
        }
    }
];

const RESOURCE_DEFS = [
    {
        uri: 'git-sao-hua://info/server',
        name: 'Server Info',
        description: 'Basic metadata and capability summary for the git-sao-hua MCP server',
        mimeType: 'application/json'
    },
    {
        uri: 'git-sao-hua://taxonomy/commits',
        name: 'Commit Taxonomy',
        description: 'List of supported commit types (feat, fix, chore, docs, etc.) with descriptions',
        mimeType: 'application/json'
    },
    {
        uri: 'git-sao-hua://taxonomy/styles',
        name: 'Style Taxonomy',
        description: 'List of supported saohua styles (love, sao, zha, chu, fo) with descriptions',
        mimeType: 'application/json'
    },
    {
        uri: 'git-sao-hua://info/usage',
        name: 'Server Usage Guide',
        description: 'Usage guide for git-sao-hua MCP server including available tools, resources, and prompts',
        mimeType: 'text/markdown'
    }
];

const PROMPT_DEFS = [
    {
        name: 'generate_from_natural_language',
        description: 'Generate a git commit message from natural language description',
        arguments: [
            { name: 'text', description: 'Natural language description of the change', required: true },
            { name: 'language', description: 'Language (zh-CN or en)', required: false },
            { name: 'type', description: 'Optional forced commit type', required: false },
            { name: 'style', description: 'Optional forced saohua style', required: false }
        ]
    },
    {
        name: 'generate_from_diff',
        description: 'Generate candidate commit messages by analyzing a git diff',
        arguments: [
            { name: 'diff', description: 'Git diff content', required: true },
            { name: 'language', description: 'Language (zh-CN or en)', required: false }
        ]
    }
];

class McpServer {
    constructor({ input = process.stdin, output = process.stdout, error = process.stderr } = {}) {
        this.input = input;
        this.output = output;
        this.error = error;
        this.buffer = Buffer.alloc(0);
        this.initialized = false;
    }

    start() {
        this.input.on('data', chunk => this.handleChunk(chunk));
        this.input.on('error', err => this.logError(err));
    }

    handleChunk(chunk) {
        this.buffer = Buffer.concat([this.buffer, Buffer.from(chunk)]);

        while (true) {
            const headerEnd = this.buffer.indexOf('\r\n\r\n');
            if (headerEnd === -1) {
                return;
            }

            const headerText = this.buffer.slice(0, headerEnd).toString('utf8');
            const headers = this.parseHeaders(headerText);
            const contentLength = Number(headers['content-length']);

            if (!Number.isFinite(contentLength) || contentLength < 0) {
                this.sendError(null, -32700, 'Invalid Content-Length header');
                this.buffer = Buffer.alloc(0);
                return;
            }

            const bodyStart = headerEnd + 4;
            const bodyEnd = bodyStart + contentLength;
            if (this.buffer.length < bodyEnd) {
                return;
            }

            const body = this.buffer.slice(bodyStart, bodyEnd).toString('utf8');
            this.buffer = this.buffer.slice(bodyEnd);
            this.handleMessage(body);
        }
    }

    parseHeaders(headerText) {
        const headers = {};
        for (const line of headerText.split('\r\n')) {
            const index = line.indexOf(':');
            if (index === -1) continue;
            headers[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
        }
        return headers;
    }

    async handleMessage(body) {
        let message;
        try {
            message = JSON.parse(body);
        } catch (error) {
            this.sendError(null, -32700, 'Invalid JSON payload');
            return;
        }

        if (!message || message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
            this.sendError(message && Object.prototype.hasOwnProperty.call(message, 'id') ? message.id : null, -32600, 'Invalid JSON-RPC request');
            return;
        }

        try {
            const result = await this.dispatch(message.method, message.params || {});
            if (Object.prototype.hasOwnProperty.call(message, 'id')) {
                this.sendResponse(message.id, result);
            }
        } catch (error) {
            if (Object.prototype.hasOwnProperty.call(message, 'id')) {
                this.sendError(message.id, error.code || -32000, error.message || 'Internal error', error.data);
            } else {
                this.logError(error);
            }
        }
    }

    async dispatch(method, params) {
        switch (method) {
            case 'initialize':
                this.initialized = true;
                return {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: {},
                        resources: {},
                        prompts: {}
                    },
                    serverInfo: SERVER_INFO
                };
            case 'notifications/initialized':
                return null;
            case 'ping':
                return {};
            case 'tools/list':
                this.assertInitialized();
                return { tools: TOOL_DEFS };
            case 'tools/call':
                this.assertInitialized();
                return await this.callTool(params);
            case 'resources/list':
                this.assertInitialized();
                return { resources: RESOURCE_DEFS };
            case 'resources/read':
                this.assertInitialized();
                return await this.readResource(params);
            case 'prompts/list':
                this.assertInitialized();
                return { prompts: PROMPT_DEFS };
            case 'prompts/get':
                this.assertInitialized();
                return await this.getPrompt(params);
            default:
                throw this.createError(-32601, `Method not found: ${method}`);
        }
    }

    assertInitialized() {
        if (!this.initialized) {
            throw this.createError(-32002, 'Server not initialized');
        }
    }

    async callTool(params) {
        const name = params && params.name;
        const args = (params && params.arguments) || {};

        if (!name) {
            throw this.createError(-32602, 'Tool name is required');
        }

        let payload;
        switch (name) {
            case 'generate_saohua':
                payload = this.generateSaohua(args);
                break;
            case 'batch_generate_saohua':
                payload = await this.batchGenerate(args);
                break;
            case 'generate_from_natural_language':
                payload = this.generateFromNaturalLanguage(args);
                break;
            case 'list_taxonomy':
                payload = this.listTaxonomy(args);
                break;
            default:
                throw this.createError(-32602, `Unknown tool: ${name}`);
        }

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(payload, null, 2)
                }
            ]
        };
    }

    normalizeLanguage(language) {
        return core.validateLanguage(language) ? language : core.defaultLanguage;
    }

    generateSaohua(args = {}) {
        const language = this.normalizeLanguage(args.language);
        const { type, style, description } = args;

        if (description) {
            const selectedType = type || 'feat';
            const fullMessage = core.generateFullCommitMessage(selectedType, style, description, language);
            return {
                mode: 'description',
                type: selectedType,
                style: style || null,
                language,
                fullMessage
            };
        }

        if (type) {
            return {
                mode: 'typed',
                ...core.generateByType(type, style, language)
            };
        }

        if (style) {
            return {
                mode: 'style',
                ...core.generateByStyle(style, language)
            };
        }

        return {
            mode: 'random',
            ...core.generateRandom(language)
        };
    }

    async batchGenerate(args = {}) {
        if (!Array.isArray(args.items)) {
            throw this.createError(-32602, 'items must be an array');
        }
        return await core.generateBatch(args.items);
    }

    generateFromNaturalLanguage(args = {}) {
        if (!args.text || typeof args.text !== 'string') {
            throw this.createError(-32602, 'text is required');
        }

        const language = this.normalizeLanguage(args.language);
        return core.generateCommitFromNaturalLanguage(args.text, {
            language,
            type: args.type,
            style: args.style
        });
    }

    listTaxonomy(args = {}) {
        const language = this.normalizeLanguage(args.language);
        return {
            language,
            types: core.getAllTypes(language).map(type => ({
                value: type,
                info: core.getTypeInfo(type, language)
            })),
            styles: core.getAllStyles(language).map(style => ({
                value: style,
                info: core.getStyleInfo(style, language)
            }))
        };
    }

    async readResource(params = {}) {
        const uri = params && params.uri;
        if (!uri) {
            throw this.createError(-32602, 'uri is required');
        }

        let content;
        let mimeType = 'text/plain';

        if (uri === 'git-sao-hua://info/server') {
            content = JSON.stringify({
                serverInfo: SERVER_INFO,
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: TOOL_DEFS.map(tool => tool.name),
                    resources: RESOURCE_DEFS.map(resource => resource.uri),
                    prompts: PROMPT_DEFS.map(prompt => prompt.name)
                },
                supportedLanguages: core.getSupportedLanguages ? core.getSupportedLanguages() : [core.defaultLanguage]
            }, null, 2);
            mimeType = 'application/json';
        } else if (uri === 'git-sao-hua://taxonomy/commits') {
            const zhTypes = core.getAllTypes('zh-CN').map(type => ({
                value: type,
                ...core.getTypeInfo(type, 'zh-CN')
            }));
            const enTypes = core.getAllTypes('en').map(type => ({
                value: type,
                ...core.getTypeInfo(type, 'en')
            }));
            content = JSON.stringify({ 'zh-CN': zhTypes, en: enTypes }, null, 2);
            mimeType = 'application/json';
        } else if (uri === 'git-sao-hua://taxonomy/styles') {
            const zhStyles = core.getAllStyles('zh-CN').map(style => ({
                value: style,
                ...core.getStyleInfo(style, 'zh-CN')
            }));
            const enStyles = core.getAllStyles('en').map(style => ({
                value: style,
                ...core.getStyleInfo(style, 'en')
            }));
            content = JSON.stringify({ 'zh-CN': zhStyles, en: enStyles }, null, 2);
            mimeType = 'application/json';
        } else if (uri === 'git-sao-hua://info/usage') {
            content = `# Git Saohua MCP Server

## Available Tools

- \`generate_saohua\` - Generate a single commit saohua message
- \`batch_generate_saohua\` - Batch generate saohua messages
- \`generate_from_natural_language\` - Generate from natural language
- \`list_taxonomy\` - List commit types and styles

## Available Resources

- \`git-sao-hua://info/server\` - Server metadata and capabilities
- \`git-sao-hua://taxonomy/commits\` - Commit type taxonomy
- \`git-sao-hua://taxonomy/styles\` - Style taxonomy  
- \`git-sao-hua://info/usage\` - This usage guide

## Available Prompts

- \`generate_from_natural_language\` - Generate commit from description
- \`generate_from_diff\` - Generate commit from git diff

## Language Support

Supported languages: zh-CN, en
`;
            mimeType = 'text/markdown';
        } else {
            throw this.createError(-32602, `Unknown resource: ${uri}`);
        }

        return {
            contents: [{
                uri,
                mimeType,
                text: content
            }]
        };
    }

    async getPrompt(params = {}) {
        const name = params && params.name;
        const arguments_ = (params && params.arguments) || {};

        if (!name) {
            throw this.createError(-32602, 'prompt name is required');
        }

        let prompt;
        if (name === 'generate_from_natural_language') {
            const text = arguments_.text;
            if (!text) {
                throw this.createError(-32602, 'text argument is required');
            }
            const language = this.normalizeLanguage(arguments_.language);
            const result = core.generateCommitFromNaturalLanguage(text, {
                language,
                type: arguments_.type,
                style: arguments_.style
            });
            prompt = {
                description: 'Turn a natural-language change summary into a ready-to-use commit message.',
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: [
                                'Please write one git commit message for the following change summary.',
                                `Language: ${language}`,
                                arguments_.type ? `Preferred type: ${arguments_.type}` : 'Preferred type: auto-detect',
                                arguments_.style ? `Preferred style: ${arguments_.style}` : 'Preferred style: auto-detect',
                                '',
                                'Change summary:',
                                text
                            ].join('\n')
                        }
                    },
                    {
                        role: 'assistant',
                        content: {
                            type: 'text',
                            text: [
                                `Suggested commit: ${result.fullMessage}`,
                                `Detected type: ${result.type}`,
                                `Detected style: ${result.style}`
                            ].join('\n')
                        }
                    }
                ]
            };
        } else if (name === 'generate_from_diff') {
            const diff = arguments_.diff;
            if (!diff) {
                throw this.createError(-32602, 'diff argument is required');
            }
            const language = this.normalizeLanguage(arguments_.language);
            const analysis = core.analyzeDiff(diff);
            const result = core.generateFallback(diff, analysis, language, arguments_.style || 'sao');
            prompt = {
                description: 'Summarize a git diff and propose a commit message candidate.',
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: [
                                'Analyze this git diff and write one concise commit message.',
                                `Language: ${language}`,
                                `Preferred style: ${arguments_.style || 'sao'}`,
                                '',
                                'Diff:',
                                diff
                            ].join('\n')
                        }
                    },
                    {
                        role: 'assistant',
                        content: {
                            type: 'text',
                            text: [
                                `Suggested commit: ${result.message}`,
                                `Detected type: ${result.type}`,
                                `Changed files: ${(analysis.changedFiles || []).join(', ') || 'unknown'}`,
                                `Detected features: ${(analysis.detectedFeatures || []).join(', ') || 'none'}`
                            ].join('\n')
                        }
                    }
                ]
            };
        } else {
            throw this.createError(-32602, `Unknown prompt: ${name}`);
        }

        return { prompt };
    }

    sendResponse(id, result) {
        this.write({ jsonrpc: '2.0', id, result });
    }

    sendError(id, code, message, data) {
        const payload = {
            jsonrpc: '2.0',
            id,
            error: { code, message }
        };
        if (data !== undefined) {
            payload.error.data = data;
        }
        this.write(payload);
    }

    write(payload) {
        const json = JSON.stringify(payload);
        this.output.write(`Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`);
    }

    createError(code, message, data) {
        const error = new Error(message);
        error.code = code;
        error.data = data;
        return error;
    }

    logError(error) {
        this.error.write(`[git-sao-hua-mcp] ${error && error.stack ? error.stack : String(error)}\n`);
    }
}

if (require.main === module) {
    new McpServer().start();
}

module.exports = {
    McpServer,
    TOOL_DEFS,
    RESOURCE_DEFS,
    PROMPT_DEFS,
    SERVER_INFO
};
