import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import saoHuaCore from '../lib/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
};
app.use(requestLogger);

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

app.get('/api/health', (req, res) => {
    res.json(successResponse({
        status: 'ok',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
    }, '服务器运行中~'));
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

app.use((req, res) => {
    res.status(404).json(errorResponse('404 - 找不到这个接口哦~', 404));
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json(errorResponse('服务器内部错误: ' + err.message));
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 骚话 API 服务启动成功!`);
        console.log(`📍 访问地址: http://localhost:${PORT}`);
        console.log(`❤️  健康检查: http://localhost:${PORT}/api/health`);
    });
}

export default app;