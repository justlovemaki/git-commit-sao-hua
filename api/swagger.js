import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Git Saohua API',
            version: '1.25.0',
            description: 'Git Commit 骚话生成器 REST API 服务 - 提供骚话生成、类型管理、风格选择等功能',
            contact: {
                name: 'API Support',
                url: 'https://github.com/justlovemaki/git-commit-sao-hua'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: '本地开发服务器'
            }
        ],
        tags: [
            { name: 'Health', description: '健康检查端点' },
            { name: 'Saohua', description: '骚话生成端点' },
            { name: 'Types', description: '类型管理端点' },
            { name: 'Styles', description: '风格管理端点' },
            { name: 'Stats', description: '统计数据端点' }
        ],
        components: {
            schemas: {
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        data: {
                            type: 'object',
                            description: '响应数据'
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                timestamp: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2024-01-01T00:00:00.000Z'
                                },
                                message: {
                                    type: 'string',
                                    example: '骚气满满~'
                                }
                            }
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        error: {
                            type: 'string',
                            description: '错误信息'
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                timestamp: {
                                    type: 'string',
                                    format: 'date-time'
                                }
                            }
                        }
                    }
                },
                HealthData: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'ok'
                        },
                        uptime: {
                            type: 'number',
                            example: 3600.5
                        },
                        memory: {
                            type: 'object',
                            example: {
                                rss: 123456,
                                heapTotal: 67890,
                                heapUsed: 54321,
                                external: 1234
                            }
                        },
                        version: {
                            type: 'string',
                            example: '1.0.0'
                        }
                    }
                },
                SaohuaData: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            example: 'fix',
                            description: 'Commit 类型'
                        },
                        style: {
                            type: 'string',
                            example: 'sao',
                            description: '风格类型'
                        },
                        message: {
                            type: 'string',
                            example: '修 bug 和撩你，我都在行',
                            description: '骚话内容'
                        },
                        fullMessage: {
                            type: 'string',
                            example: 'fix: 修 bug 和撩你，我都在行',
                            description: '完整 Commit 消息'
                        },
                        language: {
                            type: 'string',
                            example: 'zh-CN',
                            description: '语言代码'
                        }
                    }
                },
                TypesData: {
                    type: 'object',
                    properties: {
                        types: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    value: { type: 'string', example: 'fix' },
                                    label: { type: 'string', example: '修复' },
                                    emoji: { type: 'string', example: '🔧' },
                                    description: { type: 'string', example: '修复 Bug' }
                                }
                            }
                        },
                        count: {
                            type: 'integer',
                            example: 12
                        }
                    }
                },
                StylesData: {
                    type: 'object',
                    properties: {
                        styles: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    value: { type: 'string', example: 'love' },
                                    label: { type: 'string', example: '情话' },
                                    emoji: { type: 'string', example: '💕' },
                                    description: { type: 'string', example: '甜甜的情话模式' }
                                }
                            }
                        },
                        count: {
                            type: 'integer',
                            example: 5
                        }
                    }
                },
                StatsData: {
                    type: 'object',
                    properties: {
                        totalTypes: {
                            type: 'integer',
                            example: 12
                        },
                        totalStyles: {
                            type: 'integer',
                            example: 5
                        },
                        totalMessages: {
                            type: 'integer',
                            example: 600
                        },
                        typeStats: {
                            type: 'object',
                            example: {
                                fix: { love: 5, sao: 5, zha: 5, chu: 5, fo: 5 }
                            }
                        },
                        language: {
                            type: 'string',
                            example: 'zh-CN'
                        },
                        supportedLanguages: {
                            type: 'array',
                            example: ['zh-CN', 'en']
                        },
                        defaultLanguage: {
                            type: 'string',
                            example: 'zh-CN'
                        }
                    }
                },
                AISaohuaRequest: {
                    type: 'object',
                    required: ['diff'],
                    properties: {
                        diff: {
                            type: 'string',
                            description: 'Git diff 内容',
                            example: 'diff --git a/test.js b/test.js\n+console.log("test");\n-// old'
                        },
                        type: {
                            type: 'string',
                            description: 'Commit 类型 (可选)',
                            enum: ['fix', 'feat', 'chore', 'docs', 'refactor', 'style', 'test', 'perf', 'ci', 'build', 'revert', 'hotfix']
                        },
                        style: {
                            type: 'string',
                            description: '风格 (可选)',
                            enum: ['love', 'sao', 'zha', 'chu', 'fo']
                        },
                        lang: {
                            type: 'string',
                            description: '语言 (可选)',
                            enum: ['zh-CN', 'en'],
                            default: 'zh-CN'
                        }
                    }
                }
            }
        },
        paths: {
            '/api/health': {
                get: {
                    tags: ['Health'],
                    summary: '健康检查',
                    description: '检查服务器运行状态，返回服务器信息和资源使用情况',
                    operationId: 'getHealth',
                    responses: {
                        '200': {
                            description: '服务器运行正常',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        allOf: [
                                            { $ref: '#/components/schemas/SuccessResponse' }
                                        ]
                                    },
                                    example: {
                                        success: true,
                                        data: {
                                            status: 'ok',
                                            uptime: 3600.5,
                                            memory: { rss: 123456, heapTotal: 67890 },
                                            version: '1.0.0'
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: '服务器运行中~'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/saohua': {
                get: {
                    tags: ['Saohua'],
                    summary: '随机骚话生成',
                    description: '生成随机骚话，支持指定语言和风格',
                    operationId: 'getRandomSaohua',
                    parameters: [
                        {
                            name: 'lang',
                            in: 'query',
                            description: '语言代码',
                            schema: {
                                type: 'string',
                                enum: ['zh-CN', 'en'],
                                default: 'zh-CN'
                            },
                            example: 'zh-CN'
                        },
                        {
                            name: 'style',
                            in: 'query',
                            description: '风格类型',
                            schema: {
                                type: 'string',
                                enum: ['love', 'sao', 'zha', 'chu', 'fo']
                            },
                            example: 'sao'
                        }
                    ],
                    responses: {
                        '200': {
                            description: '成功生成随机骚话',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/SuccessResponse' },
                                            {
                                                properties: {
                                                    data: { $ref: '#/components/schemas/SaohuaData' }
                                                }
                                            }
                                        ]
                                    },
                                    example: {
                                        success: true,
                                        data: {
                                            type: 'fix',
                                            style: 'sao',
                                            message: '修 bug 和撩你，我都在行',
                                            fullMessage: 'fix: 修 bug 和撩你，我都在行',
                                            language: 'zh-CN'
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: '随机骚话生成成功~'
                                        }
                                    }
                                }
                            }
                        },
                        '500': {
                            description: '服务器内部错误',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/api/saohua/{type}': {
                get: {
                    tags: ['Saohua'],
                    summary: '按类型生成骚话',
                    description: '根据指定类型生成骚话',
                    operationId: 'getSaohuaByType',
                    parameters: [
                        {
                            name: 'type',
                            in: 'path',
                            description: 'Commit 类型',
                            required: true,
                            schema: {
                                type: 'string',
                                enum: ['fix', 'feat', 'chore', 'docs', 'refactor', 'style', 'test', 'perf', 'ci', 'build', 'revert', 'hotfix']
                            },
                            example: 'fix'
                        },
                        {
                            name: 'lang',
                            in: 'query',
                            description: '语言代码',
                            schema: {
                                type: 'string',
                                enum: ['zh-CN', 'en'],
                                default: 'zh-CN'
                            }
                        },
                        {
                            name: 'style',
                            in: 'query',
                            description: '风格类型',
                            schema: {
                                type: 'string',
                                enum: ['love', 'sao', 'zha', 'chu', 'fo']
                            }
                        }
                    ],
                    responses: {
                        '200': {
                            description: '成功生成指定类型的骚话',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                                    example: {
                                        success: true,
                                        data: {
                                            type: 'fix',
                                            style: 'love',
                                            message: '修复 bug 也是爱你的表现',
                                            fullMessage: 'fix: 修复 bug 也是爱你的表现',
                                            language: 'zh-CN'
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: 'fix 类型骚话生成成功~'
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: '无效的类型',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                                    example: {
                                        success: false,
                                        error: '无效的类型: invalid-type',
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/saohua/{type}/{style}': {
                get: {
                    tags: ['Saohua'],
                    summary: '按类型+风格生成骚话',
                    description: '根据指定类型和风格组合生成骚话',
                    operationId: 'getSaohuaByTypeAndStyle',
                    parameters: [
                        {
                            name: 'type',
                            in: 'path',
                            description: 'Commit 类型',
                            required: true,
                            schema: {
                                type: 'string',
                                enum: ['fix', 'feat', 'chore', 'docs', 'refactor', 'style', 'test', 'perf', 'ci', 'build', 'revert', 'hotfix']
                            },
                            example: 'fix'
                        },
                        {
                            name: 'style',
                            in: 'path',
                            description: '风格类型',
                            required: true,
                            schema: {
                                type: 'string',
                                enum: ['love', 'sao', 'zha', 'chu', 'fo']
                            },
                            example: 'love'
                        },
                        {
                            name: 'lang',
                            in: 'query',
                            description: '语言代码',
                            schema: {
                                type: 'string',
                                enum: ['zh-CN', 'en'],
                                default: 'zh-CN'
                            }
                        }
                    ],
                    responses: {
                        '200': {
                            description: '成功生成指定类型和风格的骚话',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                                    example: {
                                        success: true,
                                        data: {
                                            type: 'fix',
                                            style: 'love',
                                            message: '修复 bug 也是爱你的表现',
                                            fullMessage: 'fix: 修复 bug 也是爱你的表现',
                                            language: 'zh-CN'
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: 'fix + love 组合生成成功~'
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: '无效的类型或风格',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/api/saohua/ai': {
                post: {
                    tags: ['Saohua'],
                    summary: 'AI 智能生成骚话',
                    description: '基于 Git diff 内容智能分析并生成骚话',
                    operationId: 'generateAISaohua',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AISaohuaRequest' },
                                example: {
                                    diff: 'diff --git a/test.js b/test.js\n+console.log("test");\n-// old',
                                    type: 'feat',
                                    style: 'sao',
                                    lang: 'zh-CN'
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: '成功通过 AI 生成骚话',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                                    example: {
                                        success: true,
                                        data: {
                                            type: 'feat',
                                            style: 'sao',
                                            message: '新功能get√，撩妹技能up↑',
                                            fullMessage: 'feat: 新功能get√，撩妹技能up↑',
                                            language: 'zh-CN'
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: 'AI 骚话生成成功~'
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: '请求参数错误',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                                    example: {
                                        success: false,
                                        error: '请提供 diff 内容~',
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z'
                                        }
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'AI 生成失败',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/api/types': {
                get: {
                    tags: ['Types'],
                    summary: '获取所有类型',
                    description: '获取所有支持的 Commit 类型列表及其详细信息',
                    operationId: 'getTypes',
                    parameters: [
                        {
                            name: 'lang',
                            in: 'query',
                            description: '语言代码',
                            schema: {
                                type: 'string',
                                enum: ['zh-CN', 'en'],
                                default: 'zh-CN'
                            }
                        }
                    ],
                    responses: {
                        '200': {
                            description: '成功获取类型列表',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/SuccessResponse' },
                                            {
                                                properties: {
                                                    data: { $ref: '#/components/schemas/TypesData' }
                                                }
                                            }
                                        ]
                                    },
                                    example: {
                                        success: true,
                                        data: {
                                            types: [
                                                { value: 'fix', label: '修复', emoji: '🔧', description: '修复 Bug' },
                                                { value: 'feat', label: '新功能', emoji: '✨', description: '新功能' }
                                            ],
                                            count: 12
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: '获取类型列表成功~'
                                        }
                                    }
                                }
                            }
                        },
                        '500': {
                            description: '服务器内部错误',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/api/styles': {
                get: {
                    tags: ['Styles'],
                    summary: '获取所有风格',
                    description: '获取所有支持的骚话风格列表及其详细信息',
                    operationId: 'getStyles',
                    parameters: [
                        {
                            name: 'lang',
                            in: 'query',
                            description: '语言代码',
                            schema: {
                                type: 'string',
                                enum: ['zh-CN', 'en'],
                                default: 'zh-CN'
                            }
                        }
                    ],
                    responses: {
                        '200': {
                            description: '成功获取风格列表',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/SuccessResponse' },
                                            {
                                                properties: {
                                                    data: { $ref: '#/components/schemas/StylesData' }
                                                }
                                            }
                                        ]
                                    },
                                    example: {
                                        success: true,
                                        data: {
                                            styles: [
                                                { value: 'love', label: '情话', emoji: '💕', description: '甜甜的情话模式' },
                                                { value: 'sao', label: '骚话', emoji: '😏', description: '骚气满满模式' }
                                            ],
                                            count: 5
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: '获取风格列表成功~'
                                        }
                                    }
                                }
                            }
                        },
                        '500': {
                            description: '服务器内部错误',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/api/stats': {
                get: {
                    tags: ['Stats'],
                    summary: '获取统计数据',
                    description: '获取数据库统计信息，包括类型数量、风格数量、消息总数等',
                    operationId: 'getStats',
                    parameters: [
                        {
                            name: 'lang',
                            in: 'query',
                            description: '语言代码',
                            schema: {
                                type: 'string',
                                enum: ['zh-CN', 'en'],
                                default: 'zh-CN'
                            }
                        }
                    ],
                    responses: {
                        '200': {
                            description: '成功获取统计数据',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/SuccessResponse' },
                                            {
                                                properties: {
                                                    data: { $ref: '#/components/schemas/StatsData' }
                                                }
                                            }
                                        ]
                                    },
                                    example: {
                                        success: true,
                                        data: {
                                            totalTypes: 12,
                                            totalStyles: 5,
                                            totalMessages: 600,
                                            typeStats: {
                                                fix: { love: 5, sao: 5, zha: 5, chu: 5, fo: 5 }
                                            },
                                            language: 'zh-CN',
                                            supportedLanguages: ['zh-CN', 'en'],
                                            defaultLanguage: 'zh-CN'
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: '获取统计数据成功~'
                                        }
                                    }
                                }
                            }
                        },
                        '500': {
                            description: '服务器内部错误',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./server.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;