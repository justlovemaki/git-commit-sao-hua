/**
 * API 认证中间件
 * 
 * 支持两种认证方式：
 * 1. API Key 认证：通过 X-API-Key header
 * 2. Bearer Token 认证：通过 Authorization: Bearer <token> header
 * 
 * 有效密钥从环境变量 SAOHUA_API_KEYS 读取（逗号分隔的多个密钥）
 */

/**
 * 从环境变量加载有效的 API 密钥
 * @returns {Set<string>} 有效密钥集合
 */
function loadValidKeys() {
    const keysEnv = process.env.SAOHUA_API_KEYS || '';
    if (!keysEnv.trim()) {
        return new Set();
    }
    
    const keys = keysEnv.split(',').map(k => k.trim()).filter(k => k.length > 0);
    return new Set(keys);
}

/**
 * 从请求中提取认证令牌
 * 支持两种格式：
 * - X-API-Key header
 * - Authorization: Bearer <token> header
 * 
 * @param {Object} req - Express 请求对象
 * @returns {string|null} 认证令牌，如果不存在则返回 null
 */
function extractToken(req) {
    // 优先检查 X-API-Key header
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
        return apiKey;
    }
    
    // 检查 Authorization header
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7); // 去掉 "Bearer " 前缀
    }
    
    return null;
}

/**
 * 认证中间件
 * 验证请求是否包含有效的 API Key 或 Bearer Token
 * 
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express next 中间件函数
 */
function requireAuth(req, res, next) {
    const validKeys = loadValidKeys();
    
    // 如果没有配置任何密钥，跳过认证（开发模式）
    if (validKeys.size === 0) {
        console.log('[Auth] 未配置 SAOHUA_API_KEYS，跳过认证');
        return next();
    }
    
    const token = extractToken(req);
    
    if (!token) {
        return res.status(401).json({
            success: false,
            error: '缺少认证信息，请提供 X-API-Key header 或 Authorization: Bearer <token>',
            meta: {
                timestamp: new Date().toISOString(),
                hint: '可通过环境变量 SAOHUA_API_KEYS 配置有效密钥'
            }
        });
    }
    
    if (!validKeys.has(token)) {
        console.log(`[Auth] 认证失败：无效的密钥 ${token.substring(0, 8)}...`);
        return res.status(401).json({
            success: false,
            error: '认证失败：无效的 API Key 或 Bearer Token',
            meta: {
                timestamp: new Date().toISOString()
            }
        });
    }
    
    console.log(`[Auth] 认证成功：密钥 ${token.substring(0, 8)}...`);
    next();
}

/**
 * 可选认证中间件
 * 如果提供了认证信息则验证，不提供则继续（用于读取端点）
 * 
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express next 中间件函数
 */
function optionalAuth(req, res, next) {
    const validKeys = loadValidKeys();
    
    if (validKeys.size === 0) {
        return next();
    }
    
    const token = extractToken(req);
    
    if (token && !validKeys.has(token)) {
        console.log(`[Auth] 可选认证失败：无效的密钥 ${token.substring(0, 8)}...`);
        return res.status(401).json({
            success: false,
            error: '认证失败：无效的 API Key 或 Bearer Token',
            meta: {
                timestamp: new Date().toISOString()
            }
        });
    }
    
    if (token) {
        console.log(`[Auth] 可选认证成功：密钥 ${token.substring(0, 8)}...`);
    }
    
    next();
}

export { requireAuth, optionalAuth, loadValidKeys, extractToken };
