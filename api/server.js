import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import swaggerUi from 'swagger-ui-express';

import saoHuaCore from '../lib/index.js';
import swaggerSpec from './swagger.js';
import versionModule from '../lib/version.js';
import { requireAuth } from './auth-middleware.js';
import { metricsMiddleware, getMetricsSnapshot, formatPrometheusMetrics } from './metrics.js';

const MAX_STREAM_COUNT = 100;
const MAX_INTERVAL_MS = 10000;
const MIN_INTERVAL_MS = 100;
const DEFAULT_STREAM_INTERVAL_MS = 100;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/openapi.json', (req, res) => {
    res.json(swaggerSpec);
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.use(express.json());

const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
};
app.use(requestLogger);
app.use(metricsMiddleware);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: '请求过于频繁，请稍后再试~',
        meta: { retryAfter: '15 minutes' }
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

function successResponse(data, message = '骚气满满~') {
    return {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            message
        }
    };
}

function errorResponse(message, statusCode = 400) {
    return {
        success: false,
        error: message,
        meta: {
            timestamp: new Date().toISOString()
        }
    };
}

function normalizeAssetPaths(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map(item => typeof item === 'string' ? item.trim() : '')
        .filter(Boolean);
}

function buildReleaseNotesOptions(body = {}) {
    return {
        title: body.title,
        repo: body.repo,
        tagName: body.tagName,
        body: body.body,
        targetCommitish: body.targetCommitish,
        draft: Boolean(body.draft),
        prerelease: Boolean(body.prerelease),
        enrich: body.enrich !== false,
        enrichGitHub: Boolean(body.enrichGitHub),
        githubToken: body.githubToken,
        githubMetadata: body.githubMetadata,
        repoPath: body.repoPath ? resolve(PROJECT_ROOT, body.repoPath) : PROJECT_ROOT
    };
}

function parseAllowedHosts(value) {
    if (!value) {
        return undefined;
    }

    const items = Array.isArray(value) ? value : String(value).split(',');
    const hosts = items.map(item => String(item || '').trim()).filter(Boolean);
    return hosts.length > 0 ? hosts : undefined;
}

function parseStreamParams(input = {}) {
    const { type, style, lang, count, intervalMs } = input;
    return {
        language: lang || 'zh-CN',
        msgType: type || undefined,
        msgStyle: style || undefined,
        requestCount: Math.min(Math.max(parseInt(count) || 10, 1), MAX_STREAM_COUNT),
        interval: Math.min(
            Math.max(parseInt(intervalMs) || DEFAULT_STREAM_INTERVAL_MS, MIN_INTERVAL_MS),
            MAX_INTERVAL_MS
        )
    };
}

function validateStreamParams({ language, msgType, msgStyle }) {
    const validTypes = saoHuaCore.getAllTypes(language);
    if (msgType && !validTypes.includes(msgType)) {
        return `无效的类型: ${msgType}`;
    }

    const validStyles = saoHuaCore.getAllStyles(language);
    if (msgStyle && !validStyles.includes(msgStyle)) {
        return `无效的风格: ${msgStyle}`;
    }

    return null;
}

function createStreamGenerator({ language, msgType, msgStyle, requestCount, interval, sendEvent, closeConnection }) {
    let currentIndex = 0;
    let closed = false;
    let timer = null;

    const stop = () => {
        closed = true;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };

    const scheduleNext = () => {
        timer = setTimeout(generateNext, interval);
    };

    const generateNext = () => {
        if (closed || currentIndex >= requestCount) {
            sendEvent('done', { total: currentIndex });
            stop();
            closeConnection?.();
            return;
        }

        try {
            let result;
            if (msgType && msgStyle) {
                result = saoHuaCore.generateByType(msgType, msgStyle, language);
            } else if (msgType) {
                result = saoHuaCore.generateByType(msgType, undefined, language);
            } else if (msgStyle) {
                const types = saoHuaCore.getAllTypes(language);
                const randomType = types[Math.floor(Math.random() * types.length)];
                result = saoHuaCore.generateByType(randomType, msgStyle, language);
            } else {
                result = saoHuaCore.generateRandom(language);
            }

            sendEvent('item', { ...result, index: currentIndex + 1 });
            currentIndex++;
            scheduleNext();
        } catch (error) {
            sendEvent('error', { message: error.message, index: currentIndex + 1 });
            stop();
            closeConnection?.();
        }
    };

    return {
        start() {
            sendEvent('meta', { count: requestCount, interval, language, type: msgType, style: msgStyle });
            generateNext();
        },
        stop
    };
}

export function attachSaohuaWebSocket(server) {
    if (!server || server.__saohuaWebSocketAttached) {
        return server?.__saohuaWebSocketServer;
    }

    const wss = new WebSocketServer({ server, path: '/api/saohua/ws' });
    server.__saohuaWebSocketAttached = true;
    server.__saohuaWebSocketServer = wss;

    wss.on('connection', (ws, req) => {
        const url = new URL(req.url, 'http://localhost');
        const params = parseStreamParams(Object.fromEntries(url.searchParams.entries()));
        const validationError = validateStreamParams(params);

        const sendEvent = (eventName, data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ event: eventName, data }));
            }
        };

        if (validationError) {
            sendEvent('error', { message: validationError, index: 0 });
            ws.close(1008, validationError);
            return;
        }

        const stream = createStreamGenerator({
            ...params,
            sendEvent,
            closeConnection: () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close(1000, 'done');
                }
            }
        });

        ws.on('close', () => {
            stream.stop();
        });

        stream.start();
    });

    return wss;
}

app.get('/api/health', (req, res) => {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    res.json(successResponse({
        status: 'ok',
        requestId: req.requestId,
        uptime: process.uptime(),
        memory: {
            rss: mem.rss,
            heapTotal: mem.heapTotal,
            heapUsed: mem.heapUsed,
            external: mem.external
        },
        runtime: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            cpuUsage: {
                user: cpu.user,
                system: cpu.system
            }
        },
        service: {
            name: 'git-sao-hua-api',
            version: versionModule.getVersion() || '1.31.0'
        }
    }, '服务器运行中~'));
});

app.get('/api/health/live', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/api/health/ready', async (req, res) => {
    try {
        const types = saoHuaCore.getAllTypes('zh-CN');
        const ready = types && types.length > 0;
        res.status(ready ? 200 : 503).json({
            status: ready ? 'ok' : 'not_ready',
            reason: ready ? 'service ready' : 'core data not loaded'
        });
    } catch (error) {
        res.status(503).json({ status: 'not_ready', reason: error.message });
    }
});

app.get('/api/metrics', (req, res) => {
    const metrics = getMetricsSnapshot();
    res.json(successResponse(metrics, '获取指标快照成功~'));
});

app.get('/api/metrics/prometheus', (req, res) => {
    const prometheusOutput = formatPrometheusMetrics();
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(prometheusOutput);
});

app.get('/api/saohua', (req, res) => {
    try {
        const { lang, style } = req.query;
        const language = lang || 'zh-CN';
        const msgStyle = style || undefined;
        
        let result;
        if (msgStyle) {
            result = saoHuaCore.generateByStyle(msgStyle, language);
        } else {
            result = saoHuaCore.generateRandom(language);
        }
        
        res.json(successResponse(result, '随机骚话生成成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('生成失败: ' + error.message));
    }
});

app.get('/api/saohua/stream', (req, res) => {
    const streamParams = parseStreamParams(req.query);
    const validationError = validateStreamParams(streamParams);

    if (validationError) {
        res.status(400).json(errorResponse(validationError));
        return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const sendEvent = (eventName, data) => {
        res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const stream = createStreamGenerator({
        ...streamParams,
        sendEvent,
        closeConnection: () => res.end()
    });

    req.on('close', () => {
        stream.stop();
    });

    stream.start();
});

app.get('/api/saohua/:type', (req, res) => {
    try {
        const { type } = req.params;
        const { lang, style } = req.query;
        const language = lang || 'zh-CN';
        const msgStyle = style || undefined;
        
        const result = saoHuaCore.generateByType(type, msgStyle, language);
        res.json(successResponse(result, `${type} 类型骚话生成成功~`));
    } catch (error) {
        res.status(400).json(errorResponse(error.message));
    }
});

app.get('/api/saohua/:type/:style', (req, res) => {
    try {
        const { type, style } = req.params;
        const { lang } = req.query;
        const language = lang || 'zh-CN';
        
        const result = saoHuaCore.generateByType(type, style, language);
        res.json(successResponse(result, `${type} + ${style} 组合生成成功~`));
    } catch (error) {
        res.status(400).json(errorResponse(error.message));
    }
});

app.post('/api/saohua/ai', async (req, res) => {
    try {
        const { diff, lang, style, type } = req.body;
        
        if (!diff) {
            return res.status(400).json(errorResponse('请提供 diff 内容~'));
        }
        
        const language = lang || 'zh-CN';
        const msgStyle = style || undefined;
        const msgType = type || undefined;
        
        let result;
        if (msgType) {
            result = saoHuaCore.generateByType(msgType, msgStyle, language);
        } else {
            try {
                result = await saoHuaCore.generateWithAIAsync(diff, {
                    type: msgType,
                    style: msgStyle,
                    language
                });
            } catch (aiError) {
                console.warn('AI 生成失败，使用 fallback:', aiError.message);
                const analysis = saoHuaCore.analyzeDiff(diff);
                let commitType = msgType;
                if (!commitType) {
                    const detectedFeatures = analysis.detectedFeatures || [];
                    for (const feature of detectedFeatures) {
                        if (feature.includes('修复')) { commitType = 'fix'; break; }
                        else if (feature.includes('新增')) { commitType = 'feat'; break; }
                        else if (feature.includes('测试')) { commitType = 'test'; break; }
                        else if (feature.includes('文档')) { commitType = 'docs'; break; }
                        else if (feature.includes('重构')) { commitType = 'refactor'; break; }
                        else if (feature.includes('样式')) { commitType = 'style'; break; }
                        else if (feature.includes('性能')) { commitType = 'perf'; break; }
                        else if (feature.includes('CI/CD')) { commitType = 'ci'; break; }
                    }
                }
                commitType = commitType || 'chore';
                result = saoHuaCore.generateByType(commitType, msgStyle, language);
            }
        }
        
        res.json(successResponse(result, 'AI 骚话生成成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('AI 生成失败: ' + error.message));
    }
});

app.post('/api/saohua/natural/analyze', (req, res) => {
    try {
        const { text, lang } = req.body || {};

        if (!text) {
            return res.status(400).json(errorResponse('请提供 text 自然语言描述~'));
        }

        const language = lang || 'zh-CN';
        const result = saoHuaCore.generateFromNaturalLanguage(text, language);
        res.json(successResponse(result, '自然语言分析成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('自然语言分析失败: ' + error.message));
    }
});

app.post('/api/saohua/natural/generate', (req, res) => {
    try {
        const { text, lang, style, type } = req.body || {};

        if (!text) {
            return res.status(400).json(errorResponse('请提供 text 自然语言描述~'));
        }

        const language = lang || 'zh-CN';
        const result = saoHuaCore.generateCommitFromNaturalLanguage(text, {
            language,
            style,
            type
        });
        res.json(successResponse(result, '自然语言骚话生成成功~'));
    } catch (error) {
        res.status(400).json(errorResponse(error.message));
    }
});

app.post('/api/saohua/batch', async (req, res) => {
    try {
        const { items } = req.body;
        
        if (!items) {
            return res.status(400).json(errorResponse('请提供 items 数组~'));
        }
        
        const result = await saoHuaCore.generateBatch(items);
        
        if (!result.success) {
            return res.status(400).json(errorResponse(result.error));
        }
        
        res.json(successResponse({
            items: result.items,
            count: result.count,
            successCount: result.successCount,
            failedCount: result.failedCount
        }, `批量生成完成，成功 ${result.successCount}/${result.count}~`));
    } catch (error) {
        res.status(500).json(errorResponse('批量生成失败: ' + error.message));
    }
});

app.post('/api/release-notes/generate', async (req, res) => {
    try {
        const body = req.body || {};
        const result = await saoHuaCore.generateReleaseNotesWithGitHub(body.range || '', buildReleaseNotesOptions(body));

        res.json(successResponse({
            markdown: result.markdown,
            data: result.data,
            repo: result.repo,
            githubRelease: result.githubRelease,
            totalCommits: result.commits.length
        }, 'Release notes 生成成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('Release notes 生成失败: ' + error.message));
    }
});

app.post('/api/release-notes/manifest', async (req, res) => {
    try {
        const body = req.body || {};
        const assetPaths = normalizeAssetPaths(body.assetPaths);

        if (assetPaths.length === 0) {
            return res.status(400).json(errorResponse('请提供 assetPaths 数组~'));
        }

        const releaseNotes = await saoHuaCore.generateReleaseNotesWithGitHub(body.range || '', buildReleaseNotesOptions(body));
        const assetBatch = saoHuaCore.collectAssetMetadataBatch(assetPaths.map(filePath => resolve(PROJECT_ROOT, filePath)));

        if (!assetBatch.success) {
            return res.status(400).json(errorResponse(assetBatch.errors?.[0]?.error || '资产元数据收集失败~'));
        }

        const githubRelease = releaseNotes.githubRelease || saoHuaCore.buildGitHubReleasePayload(releaseNotes.commits, {
            ...buildReleaseNotesOptions(body),
            repo: releaseNotes.repo
        });

        const manifest = saoHuaCore.buildGitHubReleaseManifest(githubRelease, assetBatch.assets);
        if (!manifest.success) {
            return res.status(400).json(errorResponse(manifest.error || 'Release manifest 生成失败~'));
        }

        res.json(successResponse(manifest, 'Release manifest 生成成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('Release manifest 生成失败: ' + error.message));
    }
});

app.get('/api/types', (req, res) => {
    try {
        const { lang } = req.query;
        const language = lang || 'zh-CN';
        
        const types = saoHuaCore.getAllTypes(language);
        const typesInfo = types.map(t => saoHuaCore.getTypeInfo(t, language));
        
        res.json(successResponse({
            types: typesInfo,
            count: typesInfo.length
        }, '获取类型列表成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('获取类型列表失败: ' + error.message));
    }
});

app.get('/api/styles', (req, res) => {
    try {
        const { lang } = req.query;
        const language = lang || 'zh-CN';
        
        const styles = saoHuaCore.getAllStyles(language);
        const stylesInfo = styles.map(s => saoHuaCore.getStyleInfo(s, language));
        
        res.json(successResponse({
            styles: stylesInfo,
            count: stylesInfo.length
        }, '获取风格列表成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('获取风格列表失败: ' + error.message));
    }
});

app.get('/api/stats', (req, res) => {
    try {
        const { lang } = req.query;
        const language = lang || 'zh-CN';
        
        const stats = saoHuaCore.getDataStats(language);
        
        res.json(successResponse({
            ...stats,
            supportedLanguages: saoHuaCore.getSupportedLanguages(),
            defaultLanguage: saoHuaCore.getDefaultLanguage()
        }, '获取统计数据成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('获取统计数据失败: ' + error.message));
    }
});

app.get('/api/plugins', (req, res) => {
    try {
        const plugins = saoHuaCore.listPlugins();
        res.json(successResponse({
            plugins,
            count: plugins.length
        }, '获取插件列表成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('获取插件列表失败: ' + error.message));
    }
});

app.get('/api/plugins/:name', (req, res) => {
    try {
        const { name } = req.params;
        const result = saoHuaCore.getPluginDetails(name);

        if (!result.success) {
            return res.status(404).json(errorResponse(result.error, 404));
        }

        res.json(successResponse(result.plugin, '获取插件详情成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('获取插件详情失败: ' + error.message));
    }
});

app.post('/api/plugins/install', requireAuth, async (req, res) => {
    try {
        const body = req.body || {};
        const sourceUrl = body.sourceUrl;
        const githubSpec = body.githubSpec;
        const checksum = body.checksum;
        const allowedHosts = parseAllowedHosts(body.allowedHosts);
        
        if (sourceUrl) {
            const result = await saoHuaCore.installPluginFromUrl(sourceUrl, null, { 
                expectedChecksum: checksum || null,
                allowedHosts
            });
            if (!result.success) {
                return res.status(400).json(errorResponse(result.error));
            }
            
            saoHuaCore.reloadPluginData();
            
            res.json(successResponse({
                name: result.plugin.name,
                path: result.path,
                sourceUrl: result.plugin.sourceUrl || sourceUrl,
                checksum: result.plugin.checksum || null
            }, '插件从 URL 安装成功~'));
            return;
        }

        if (githubSpec) {
            const result = await saoHuaCore.installPluginFromGitHub(githubSpec, null, {
                expectedChecksum: checksum || null,
                allowedHosts
            });
            if (!result.success) {
                return res.status(400).json(errorResponse(result.error));
            }

            saoHuaCore.reloadPluginData();

            res.json(successResponse({
                name: result.plugin.name,
                path: result.path,
                sourceUrl: result.plugin.sourceUrl || null,
                checksum: result.plugin.checksum || null
            }, '插件从 GitHub 简写安装成功~'));
            return;
        }
        
        if (!body.name) {
            return res.status(400).json(errorResponse('请提供插件内容~'));
        }

        const result = saoHuaCore.installPluginObject(body, null, { checksum: checksum || null });
        if (!result.success) {
            return res.status(400).json(errorResponse('插件验证失败: ' + result.error));
        }
        
        saoHuaCore.reloadPluginData();
        
        res.json(successResponse({
            name: result.plugin.name,
            path: result.path,
            checksum: result.plugin.checksum || null
        }, '插件安装成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('插件安装失败: ' + error.message));
    }
});

app.delete('/api/plugins/:name', requireAuth, (req, res) => {
    try {
        const { name } = req.params;
        
        if (!name) {
            return res.status(400).json(errorResponse('请提供插件名称~'));
        }
        
        const result = saoHuaCore.removePlugin(name);
        if (!result.success) {
            return res.status(400).json(errorResponse('插件删除失败: ' + result.error));
        }
        
        saoHuaCore.reloadPluginData();
        
        res.json(successResponse({
            name
        }, '插件删除成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('插件删除失败: ' + error.message));
    }
});

app.post('/api/plugins/create', requireAuth, (req, res) => {
    try {
        const { name, version, description, author } = req.body;
        
        if (!name) {
            return res.status(400).json(errorResponse('请提供插件名称~'));
        }
        
        const result = saoHuaCore.createPluginTemplate(null, {
            name,
            version: version || '1.0.0',
            description: description || '',
            author: author || ''
        });
        
        if (!result.success) {
            return res.status(500).json(errorResponse('插件模板创建失败: ' + result.error));
        }
        
        saoHuaCore.reloadPluginData();
        
        res.json(successResponse(result, '插件模板创建成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('插件模板创建失败: ' + error.message));
    }
});

app.post('/api/plugins/reload', requireAuth, (req, res) => {
    try {
        saoHuaCore.reloadPluginData();
        res.json(successResponse({
            reloaded: true
        }, '插件数据重新加载成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('插件数据重新加载失败: ' + error.message));
    }
});

app.get('/api/plugin-registry', (req, res) => {
    try {
        const { q, indexUrl } = req.query;
        const allowedHosts = parseAllowedHosts(req.query.allowedHosts);
        
        saoHuaCore.searchPluginIndex(q || '', indexUrl || null, { allowedHosts }).then(result => {
            if (!result.success) {
                return res.status(400).json(errorResponse(result.error));
            }
            
            res.json(successResponse({
                plugins: result.plugins,
                total: result.total,
                query: result.query || '',
                indexUrl: result.indexUrl
            }, '插件搜索成功~'));
        }).catch(error => {
            res.status(500).json(errorResponse('插件搜索失败: ' + error.message));
        });
    } catch (error) {
        res.status(500).json(errorResponse('插件搜索失败: ' + error.message));
    }
});

app.post('/api/plugins/install-from-index', requireAuth, async (req, res) => {
    try {
        const { name, indexUrl } = req.body;
        const allowedHosts = parseAllowedHosts(req.body.allowedHosts);
        
        if (!name) {
            return res.status(400).json(errorResponse('请提供插件名称~'));
        }
        
        const result = await saoHuaCore.installPluginFromIndex(name, indexUrl || null, null, { allowedHosts });
        if (!result.success) {
            return res.status(400).json(errorResponse(result.error));
        }
        
        saoHuaCore.reloadPluginData();
        
        res.json(successResponse({
            name: result.plugin.name,
            version: result.plugin.version,
            path: result.path,
            fromIndex: result.plugin.fromIndex || null,
            checksum: result.plugin.checksum || null
        }, '插件从索引安装成功~'));
    } catch (error) {
        res.status(500).json(errorResponse('插件从索引安装失败: ' + error.message));
    }
});

app.use((req, res) => {
    res.status(404).json(errorResponse('404 - 找不到这个接口哦~', 404));
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json(errorResponse('服务器内部错误: ' + err.message));
});

if (process.env.NODE_ENV !== 'test') {
    const server = app.listen(PORT, () => {
        console.log(`🚀 骚话 API 服务启动成功!`);
        console.log(`📍 访问地址: http://localhost:${PORT}`);
        console.log(`❤️  健康检查: http://localhost:${PORT}/api/health`);
    });

    attachSaohuaWebSocket(server);
    console.log(`🔌 WebSocket 端点: ws://localhost:${PORT}/api/saohua/ws`);
}

export default app;
