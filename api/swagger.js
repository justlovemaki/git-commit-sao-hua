import swaggerJsdoc from 'swagger-jsdoc';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const versionModule = require('../lib/version.js');
const apiVersion = versionModule.getVersion() || '1.31.0';

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Git Saohua API',
            version: apiVersion,
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
            { name: 'Stats', description: '统计数据端点' },
            { name: 'Metrics', description: '可观测性指标端点' },
            { name: 'Plugins', description: '插件管理端点' }
        ],
        components: {
            securitySchemes: {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                    description: 'API Key 认证，通过 X-API-Key header 传递'
                },
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    description: 'Bearer Token 认证，通过 Authorization: Bearer <token> header 传递'
                }
            },
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
                        status: { type: 'string', example: 'ok' },
                        requestId: { type: 'string', example: 'a1b2c3d4e5f6' },
                        uptime: { type: 'number', example: 3600.5 },
                        memory: {
                            type: 'object',
                            properties: {
                                rss: { type: 'number', example: 123456 },
                                heapTotal: { type: 'number', example: 67890 },
                                heapUsed: { type: 'number', example: 54321 },
                                external: { type: 'number', example: 1234 }
                            }
                        },
                        runtime: {
                            type: 'object',
                            properties: {
                                nodeVersion: { type: 'string', example: 'v20.0.0' },
                                platform: { type: 'string', example: 'linux' },
                                arch: { type: 'string', example: 'x64' },
                                cpuUsage: {
                                    type: 'object',
                                    properties: {
                                        user: { type: 'number', example: 1000 },
                                        system: { type: 'number', example: 500 }
                                    }
                                }
                            }
                        },
                        service: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', example: 'git-sao-hua-api' },
                                version: { type: 'string', example: '1.31.0' }
                            }
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
                },
                PluginsData: {
                    type: 'object',
                    properties: {
                        plugins: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'my-plugin' },
                                    version: { type: 'string', example: '1.0.0' },
                                    description: { type: 'string', example: '自定义插件' },
                                    author: { type: 'string', example: 'developer' },
                                    messages: { type: 'object', example: { fix: { love: ['message1'] } } }
                                }
                            }
                        },
                        count: {
                            type: 'integer',
                            example: 3
                        }
                    }
                },
                PluginDetails: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'my-plugin' },
                        version: { type: 'string', example: '1.0.0' },
                        description: { type: 'string', example: '自定义插件' },
                        author: { type: 'string', example: 'developer' },
                        path: { type: 'string', example: '/home/user/.saohua/plugins/my-plugin.json' },
                        sourceType: { type: 'string', example: 'github' },
                        sourceUrl: { type: 'string', example: 'https://raw.githubusercontent.com/owner/repo/main/plugin.json', nullable: true },
                        fromIndex: { type: 'string', example: 'https://example.com/index.json', nullable: true },
                        githubSpec: { type: 'string', example: 'owner/repo:plugin.json@main', nullable: true },
                        checksum: { type: 'string', example: 'a1b2c3...', nullable: true },
                        installedAt: { type: 'string', example: '2026-04-15T10:20:00.000Z', nullable: true },
                        lockedAt: { type: 'string', example: '2026-04-15T10:20:01.000Z', nullable: true }
                    }
                },
                PluginInstallRequest: {
                    type: 'object',
                    properties: {
                        sourceUrl: {
                            type: 'string',
                            description: '插件 JSON 的 URL (支持 http/https)，与 githubSpec 二选一',
                            example: 'https://example.com/plugin.json'
                        },
                        githubSpec: {
                            type: 'string',
                            description: 'GitHub 简写 (如 owner/repo:path@ref)，与 sourceUrl 二选一',
                            example: 'owner/repo:saohua-plugin.json@main'
                        },
                        checksum: {
                            type: 'string',
                            description: '插件 JSON 的 SHA-256 校验和 (可选，用于验证插件完整性)',
                            example: 'a1b2c3d4e5f6...'
                        },
                        name: {
                            type: 'string',
                            description: '插件名称 (当不提供 sourceUrl 时必填)',
                            example: 'my-custom-plugin'
                        },
                        version: {
                            type: 'string',
                            description: '插件版本',
                            example: '1.0.0'
                        },
                        description: {
                            type: 'string',
                            description: '插件描述',
                            example: '自定义插件'
                        },
                        author: {
                            type: 'string',
                            description: '作者',
                            example: 'developer'
                        },
                        data: {
                            type: 'object',
                            description: '骚话消息内容 (当不提供 sourceUrl 时必填)',
                            example: {
                                'zh-CN': {
                                    fix: {
                                        love: ['修复 bug 也是爱你的表现'],
                                        sao: ['修 bug 和撩你，我都在行']
                                    }
                                }
                            }
                        }
                    }
                },
                PluginCreateRequest: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: {
                            type: 'string',
                            description: '插件名称',
                            example: 'my-plugin'
                        },
                        version: {
                            type: 'string',
                            description: '插件版本',
                            default: '1.0.0',
                            example: '1.0.0'
                        },
                        description: {
                            type: 'string',
                            description: '插件描述',
                            example: '自定义插件描述'
                        },
                        author: {
                            type: 'string',
                            description: '作者',
                            example: 'developer'
                        }
                    }
                },
                PluginIndexSearchRequest: {
                    type: 'object',
                    properties: {
                        q: {
                            type: 'string',
                            description: '搜索关键词',
                            example: 'love'
                        },
                        indexUrl: {
                            type: 'string',
                            description: '自定义索引 URL',
                            example: 'https://example.com/index.json'
                        }
                    }
                },
                PluginIndexInstallRequest: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: {
                            type: 'string',
                            description: '要安装的插件名称',
                            example: 'my-plugin'
                        },
                        indexUrl: {
                            type: 'string',
                            description: '自定义索引 URL (可选)',
                            example: 'https://example.com/index.json'
                        }
                    }
                },
                PluginIndexData: {
                    type: 'object',
                    properties: {
                        plugins: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'love-pack' },
                                    version: { type: 'string', example: '1.0.0' },
                                    description: { type: 'string', example: '情话插件包' },
                                    author: { type: 'string', example: 'developer' },
                                    tags: { type: 'array', items: { type: 'string' }, example: ['love', 'chinese'] },
                                    homepage: { type: 'string', example: 'https://github.com/example/plugin' },
                                    sourceUrl: { type: 'string', description: '直接 URL (与 github 二选一)', example: 'https://example.com/plugins/love-pack.json' },
                                    github: { type: 'string', description: 'GitHub 简写 (与 sourceUrl 二选一)', example: 'owner/repo:saohua-plugin.json@main' },
                                    checksum: { type: 'string', description: '插件的 SHA-256 校验和 (可选)', example: 'a1b2c3d4e5f6...' }
                                }
                            }
                        },
                        total: { type: 'integer', example: 10 },
                        query: { type: 'string', example: 'love' },
                        indexUrl: { type: 'string', example: 'https://example.com/index.json' }
                    }
                },
                MetricsData: {
                    type: 'object',
                    properties: {
                        requestId: {
                            type: 'object',
                            properties: {
                                enabled: { type: 'boolean', example: true },
                                header: { type: 'string', example: 'X-Request-Id' }
                            }
                        },
                        totalRequests: { type: 'integer', example: 1000 },
                        uptime: { type: 'integer', example: 3600 },
                        statusCodes: {
                            type: 'object',
                            properties: {
                                '2xx': { type: 'integer', example: 900 },
                                '3xx': { type: 'integer', example: 50 },
                                '4xx': { type: 'integer', example: 40 },
                                '5xx': { type: 'integer', example: 10 }
                            }
                        },
                        routes: {
                            type: 'object',
                            example: {
                                '/api/saohua': { count: 500, avgTime: 15 }
                            }
                        },
                        recentErrors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    requestId: { type: 'string', example: 'a1b2c3d4e5f6' },
                                    path: { type: 'string', example: '/api/saohua' },
                                    method: { type: 'string', example: 'GET' },
                                    statusCode: { type: 'integer', example: 500 },
                                    timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
                                }
                            }
                        },
                        runtime: {
                            type: 'object',
                            properties: {
                                memory: {
                                    type: 'object',
                                    properties: {
                                        rss: { type: 'number', example: 123456 },
                                        heapTotal: { type: 'number', example: 67890 },
                                        heapUsed: { type: 'number', example: 54321 },
                                        external: { type: 'number', example: 1234 }
                                    }
                                },
                                cpu: {
                                    type: 'object',
                                    properties: {
                                        user: { type: 'number', example: 1000 },
                                        system: { type: 'number', example: 500 }
                                    }
                                }
                            }
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
                                            requestId: 'a1b2c3d4e5f6',
                                            uptime: 3600.5,
                                            memory: { rss: 123456, heapTotal: 67890 },
                                            runtime: {
                                                nodeVersion: 'v20.0.0',
                                                platform: 'linux',
                                                arch: 'x64'
                                            },
                                            service: {
                                                name: 'git-sao-hua-api',
                                                version: '1.31.0'
                                            }
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
            '/api/health/live': {
                get: {
                    tags: ['Health'],
                    summary: '存活探针',
                    description: 'Kubernetes liveness probe，检查进程是否存活',
                    operationId: 'getLiveness',
                    responses: {
                        '200': {
                            description: '进程存活',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'ok' }
                                        }
                                    },
                                    example: {
                                        status: 'ok'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/health/ready': {
                get: {
                    tags: ['Health'],
                    summary: '就绪探针',
                    description: 'Kubernetes readiness probe，检查服务是否准备好接受请求',
                    operationId: 'getReadiness',
                    responses: {
                        '200': {
                            description: '服务已就绪',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'ok' },
                                            reason: { type: 'string', example: 'service ready' }
                                        }
                                    },
                                    example: {
                                        status: 'ok',
                                        reason: 'service ready'
                                    }
                                }
                            }
                        },
                        '503': {
                            description: '服务未就绪',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'not_ready' },
                                            reason: { type: 'string', example: 'core data not loaded' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/metrics': {
                get: {
                    tags: ['Metrics'],
                    summary: '获取指标快照',
                    description: '返回当前_metrics 可观测性指标快照，包括请求数、状态码分布、路由聚合、运行时信息和最近错误',
                    operationId: 'getMetrics',
                    responses: {
                        '200': {
                            description: '成功获取指标',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/SuccessResponse' },
                                            {
                                                properties: {
                                                    data: { $ref: '#/components/schemas/MetricsData' }
                                                }
                                            }
                                        ]
                                    },
                                    example: {
                                        success: true,
                                        data: {
                                            requestId: { enabled: true, header: 'X-Request-Id' },
                                            totalRequests: 1000,
                                            uptime: 3600,
                                            statusCodes: { '2xx': 900, '3xx': 50, '4xx': 40, '5xx': 10 },
                                            routes: {
                                                '/api/saohua': { count: 500, avgTime: 15 }
                                            },
                                            recentErrors: [],
                                            runtime: {
                                                memory: { rss: 123456, heapTotal: 67890 },
                                                cpu: { user: 1000, system: 500 }
                                            }
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: '获取指标快照成功~'
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
            },
            '/api/plugins': {
                get: {
                    tags: ['Plugins'],
                    summary: '获取插件列表',
                    description: '获取所有已安装插件列表',
                    operationId: 'listPlugins',
                    responses: {
                        '200': {
                            description: '成功获取插件列表',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/SuccessResponse' },
                                            {
                                                properties: {
                                                    data: { $ref: '#/components/schemas/PluginsData' }
                                                }
                                            }
                                        ]
                                    },
                                    example: {
                                        success: true,
                                        data: {
                                            plugins: [
                                                { name: 'my-plugin', version: '1.0.0', description: '自定义插件' }
                                            ],
                                            count: 1
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: '获取插件列表成功~'
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
            '/api/plugins/install': {
                post: {
                    tags: ['Plugins'],
                    summary: '安装插件',
                    description: '安装新插件，验证后写入 plugins 目录\n\n**需要认证**: 必须提供有效的 API Key 或 Bearer Token',
                    operationId: 'installPlugin',
                    security: [
                        { ApiKeyAuth: [] },
                        { BearerAuth: [] }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PluginInstallRequest' },
                                example: {
                                    sourceUrl: 'https://example.com/plugin.json',
                                    githubSpec: 'owner/repo:saohua-plugin.json@main',
                                    checksum: 'a1b2c3d4e5f6...',
                                    name: 'my-custom-plugin',
                                    version: '1.0.0',
                                    description: '自定义插件',
                                    author: 'developer',
                                    messages: {
                                        fix: {
                                            love: ['修复 bug 也是爱你的表现']
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: '插件安装成功',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                                    example: {
                                        success: true,
                                        data: {
                                            name: 'my-custom-plugin',
                                            path: '/home/user/.saohua/plugins/my-custom-plugin.json'
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: '插件安装成功~'
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: '插件验证失败',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                                    example: {
                                        success: false,
                                        error: '插件验证失败: 缺少必要字段',
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z'
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
            '/api/plugins/{name}': {
                get: {
                    tags: ['Plugins'],
                    summary: '获取单个插件详情',
                    description: '获取指定插件的来源、校验和、锁定时间等治理信息',
                    operationId: 'getPluginDetails',
                    parameters: [
                        {
                            name: 'name',
                            in: 'path',
                            description: '插件名称',
                            required: true,
                            schema: {
                                type: 'string'
                            },
                            example: 'my-custom-plugin'
                        }
                    ],
                    responses: {
                        '200': {
                            description: '成功获取插件详情',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/SuccessResponse' },
                                            {
                                                properties: {
                                                    data: { $ref: '#/components/schemas/PluginDetails' }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        '404': {
                            description: '插件不存在',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
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
                },
                delete: {
                    tags: ['Plugins'],
                    summary: '删除插件',
                    description: '删除指定名称的插件\n\n**需要认证**: 必须提供有效的 API Key 或 Bearer Token',
                    operationId: 'removePlugin',
                    security: [
                        { ApiKeyAuth: [] },
                        { BearerAuth: [] }
                    ],
                    parameters: [
                        {
                            name: 'name',
                            in: 'path',
                            description: '插件名称',
                            required: true,
                            schema: {
                                type: 'string'
                            },
                            example: 'my-custom-plugin'
                        }
                    ],
                    responses: {
                        '200': {
                            description: '插件删除成功',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                                    example: {
                                        success: true,
                                        data: {
                                            name: 'my-custom-plugin'
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: '插件删除成功~'
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: '请求参数错误',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
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
            '/api/plugins/create': {
                post: {
                    tags: ['Plugins'],
                    summary: '创建插件模板',
                    description: '创建新的插件模板文件\n\n**需要认证**: 必须提供有效的 API Key 或 Bearer Token',
                    operationId: 'createPluginTemplate',
                    security: [
                        { ApiKeyAuth: [] },
                        { BearerAuth: [] }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PluginCreateRequest' },
                                example: {
                                    name: 'my-plugin',
                                    version: '1.0.0',
                                    description: '我的自定义插件',
                                    author: 'developer'
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: '插件模板创建成功',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                                    example: {
                                        success: true,
                                        data: {
                                            path: '/home/user/.saohua/plugins/my-plugin.json',
                                            content: { name: 'my-plugin', version: '1.0.0' }
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: '插件模板创建成功~'
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: '请求参数错误',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
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
            '/api/plugins/reload': {
                post: {
                    tags: ['Plugins'],
                    summary: '重新加载插件数据',
                    description: '重新加载所有插件数据到缓存\n\n**需要认证**: 必须提供有效的 API Key 或 Bearer Token',
                    operationId: 'reloadPluginData',
                    security: [
                        { ApiKeyAuth: [] },
                        { BearerAuth: [] }
                    ],
                    responses: {
                        '200': {
                            description: '插件数据重新加载成功',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                                    example: {
                                        success: true,
                                        data: {
                                            reloaded: true
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: '插件数据重新加载成功~'
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
            '/api/plugin-registry': {
                get: {
                    tags: ['Plugins'],
                    summary: '搜索插件市场',
                    description: '从远程插件索引搜索插件',
                    operationId: 'searchPluginRegistry',
                    parameters: [
                        {
                            name: 'q',
                            in: 'query',
                            description: '搜索关键词 (支持搜索 name/description/tags)',
                            schema: {
                                type: 'string'
                            },
                            example: 'love'
                        },
                        {
                            name: 'indexUrl',
                            in: 'query',
                            description: '自定义索引 URL (可选，不提供则使用默认索引)',
                            schema: {
                                type: 'string'
                            },
                            example: 'https://example.com/index.json'
                        }
                    ],
                    responses: {
                        '200': {
                            description: '搜索成功',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/SuccessResponse' },
                                            {
                                                properties: {
                                                    data: { $ref: '#/components/schemas/PluginIndexData' }
                                                }
                                            }
                                        ]
                                    },
                                    example: {
                                        success: true,
                                        data: {
                                            plugins: [
                                                {
                                                    name: 'love-pack',
                                                    version: '1.0.0',
                                                    description: '甜甜的情话插件包',
                                                    author: 'developer',
                                                    tags: ['love', 'chinese'],
                                                    sourceUrl: 'https://example.com/plugins/love-pack.json'
                                                }
                                            ],
                                            total: 10,
                                            query: 'love',
                                            indexUrl: 'https://example.com/index.json'
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: '插件搜索成功~'
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: '搜索失败',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
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
            '/api/plugins/install-from-index': {
                post: {
                    tags: ['Plugins'],
                    summary: '从索引安装插件',
                    description: '从远程插件索引安装插件\n\n**需要认证**: 必须提供有效的 API Key 或 Bearer Token',
                    operationId: 'installPluginFromIndex',
                    security: [
                        { ApiKeyAuth: [] },
                        { BearerAuth: [] }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PluginIndexInstallRequest' },
                                example: {
                                    name: 'my-plugin',
                                    indexUrl: 'https://example.com/index.json'
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: '插件安装成功',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/SuccessResponse' },
                                    example: {
                                        success: true,
                                        data: {
                                            name: 'my-plugin',
                                            version: '1.0.0',
                                            path: '/home/user/.saohua/plugins/my-plugin.json',
                                            fromIndex: 'https://example.com/index.json',
                                            checksum: 'a1b2c3d4e5f6...'
                                        },
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z',
                                            message: '插件从索引安装成功~'
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: '安装失败',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' },
                                    example: {
                                        success: false,
                                        error: '索引中未找到插件: my-plugin',
                                        meta: {
                                            timestamp: '2024-01-01T00:00:00.000Z'
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
