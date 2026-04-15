/**
 * 插件管理系统
 * 管理自定义骚话包的加载、验证、合并
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const configModule = require('./config.js');

const DEFAULT_PLUGIN_FETCH_TIMEOUT = 30000;

const DEFAULT_ALLOWED_HOSTS = [
    'raw.githubusercontent.com',
    'githubusercontent.com',
    'github.com'
];

const DEFAULT_GITHUB_REF = 'main';
const DEFAULT_GITHUB_PATHS = ['saohua-plugin.json', 'plugin.json'];

const GITHUB_SHORTHAND_REGEX = /^(github:)?([^\/]+)\/([^:@]+)(?::([^@]+))?(?:@(.+))?$/;

function parseGitHubShorthand(spec, options = {}) {
    if (!spec || typeof spec !== 'string') {
        return { valid: false, error: 'GitHub shorthand 格式无效' };
    }

    const trimmed = spec.trim();
    const match = trimmed.match(GITHUB_SHORTHAND_REGEX);

    if (!match) {
        return { valid: false, error: 'GitHub shorthand 格式无效，请使用 owner/repo 或 github:owner/repo 格式' };
    }

    const [, , owner, repo, pathPrefix, ref] = match;
    const branch = ref || options.defaultRef || DEFAULT_GITHUB_REF;
    const pathOptions = options.defaultPaths || DEFAULT_GITHUB_PATHS;
    const candidatePaths = pathPrefix ? [pathPrefix] : pathOptions;
    const finalPath = candidatePaths[0];

    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${finalPath}`;

    return {
        valid: true,
        owner,
        repo,
        ref: branch,
        path: finalPath,
        rawUrl,
        candidatePaths,
        rawUrls: candidatePaths.map(candidatePath => `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${candidatePath}`)
    };
}

async function fetchPluginFromGitHub(githubSpec, options = {}) {
    const parseResult = parseGitHubShorthand(githubSpec, {
        defaultRef: options.ref,
        defaultPaths: options.paths
    });

    if (!parseResult.valid) {
        return { success: false, error: parseResult.error };
    }

    let lastError = null;
    for (let i = 0; i < parseResult.rawUrls.length; i++) {
        const candidateUrl = parseResult.rawUrls[i];
        const fetchResult = await fetchPluginFromUrl(candidateUrl, options);
        if (fetchResult.success) {
            return {
                ...fetchResult,
                github: {
                    owner: parseResult.owner,
                    repo: parseResult.repo,
                    ref: parseResult.ref,
                    path: parseResult.candidatePaths[i],
                    spec: githubSpec
                }
            };
        }
        lastError = fetchResult.error;
    }

    return {
        success: false,
        error: lastError || 'GitHub 插件下载失败'
    };
}

function normalizeAllowedHosts(hosts) {
    if (!hosts) {
        return [];
    }

    const values = Array.isArray(hosts) ? hosts : String(hosts).split(',');
    return values
        .map(host => String(host || '').trim().toLowerCase())
        .filter(Boolean);
}

function getConfigAllowedHosts(cwd = process.cwd()) {
    try {
        const config = configModule.loadConfig(cwd);
        if (!config || !config.plugins) {
            return [];
        }

        return normalizeAllowedHosts(config.plugins.allowedHosts);
    } catch (e) {
        return [];
    }
}

function getAllowedHosts(options = {}) {
    let hosts = normalizeAllowedHosts(options.allowedHosts);

    if (hosts.length === 0) {
        hosts = getConfigAllowedHosts(options.cwd || process.cwd());
    }

    if (hosts.length === 0) {
        hosts = normalizeAllowedHosts(process.env.PLUGIN_ALLOWED_HOSTS);
    }

    if (hosts.length === 0) {
        hosts = normalizeAllowedHosts(DEFAULT_ALLOWED_HOSTS);
    }

    if (process.env.NODE_ENV === 'test') {
        hosts = Array.from(new Set(hosts.concat(['127.0.0.1', 'localhost'])));
    }

    return hosts;
}

function isHostAllowed(host, options = {}) {
    const allowedHosts = getAllowedHosts(options);
    const normalizedHost = host.toLowerCase();
    return allowedHosts.some(allowed => {
        const normalized = allowed.toLowerCase();
        return normalized === normalizedHost || normalizedHost.endsWith('.' + normalized);
    });
}

function validateHost(url, options = {}) {
    try {
        const parsedUrl = new URL(url);
        if (!isHostAllowed(parsedUrl.hostname, options)) {
            return {
                valid: false,
                error: `Host "${parsedUrl.hostname}" 不在允许列表中，允许的 hosts: ${getAllowedHosts(options).join(', ')}`
            };
        }
        return { valid: true };
    } catch (e) {
        return { valid: false, error: 'URL 格式无效' };
    }
}

function calculateSha256(content) {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function verifyChecksum(content, expectedChecksum) {
    const actualChecksum = calculateSha256(content);
    if (actualChecksum !== expectedChecksum) {
        return {
            valid: false,
            error: `SHA-256 校验失败：期望 ${expectedChecksum}，实际 ${actualChecksum}`
        };
    }
    return { valid: true };
}

const DEFAULT_PLUGINS_DIR = path.join(os.homedir(), '.saohua', 'plugins');
const PLUGIN_LOCK_FILENAME = 'plugins.lock.json';

const DEFAULT_INDEX_URL = process.env.PLUGIN_INDEX_URL || 'https://raw.githubusercontent.com/justlovemaki/git-commit-sao-hua-plugin-index/main/index.json';

const REQUIRED_PLUGIN_FIELDS = ['name', 'version', 'data'];
const OPTIONAL_PLUGIN_FIELDS = ['description', 'author', 'styles'];

function getPluginsDir(pluginsDir) {
    return pluginsDir || DEFAULT_PLUGINS_DIR;
}

function getPluginLockPath(pluginsDir) {
    return path.join(getPluginsDir(pluginsDir), PLUGIN_LOCK_FILENAME);
}

function ensurePluginsDir(pluginsDir) {
    const dir = getPluginsDir(pluginsDir);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

function validatePlugin(plugin) {
    if (!plugin || typeof plugin !== 'object' || Array.isArray(plugin)) {
        return { valid: false, error: '插件必须是 JSON 对象' };
    }

    for (const field of REQUIRED_PLUGIN_FIELDS) {
        if (!(field in plugin)) {
            return { valid: false, error: `缺少必需字段: ${field}` };
        }
    }

    if (typeof plugin.name !== 'string' || plugin.name.trim() === '') {
        return { valid: false, error: 'name 必须是非空字符串' };
    }

    if (typeof plugin.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(plugin.version)) {
        return { valid: false, error: 'version 必须是有效的语义化版本号 (x.y.z)' };
    }

    if (typeof plugin.data !== 'object' || plugin.data === null) {
        return { valid: false, error: 'data 必须是对象' };
    }

    if (plugin.styles && (typeof plugin.styles !== 'object' || plugin.styles === null)) {
        return { valid: false, error: 'styles 必须是对象' };
    }

    return { valid: true };
}

function getDefaultPluginLock() {
    return {
        version: 1,
        plugins: {}
    };
}

function readPluginLock(pluginsDir) {
    const lockPath = getPluginLockPath(pluginsDir);
    if (!fs.existsSync(lockPath)) {
        return getDefaultPluginLock();
    }

    try {
        const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
        if (!lock || typeof lock !== 'object' || Array.isArray(lock)) {
            return getDefaultPluginLock();
        }

        return {
            version: lock.version || 1,
            plugins: lock.plugins && typeof lock.plugins === 'object' ? lock.plugins : {}
        };
    } catch (e) {
        return getDefaultPluginLock();
    }
}

function writePluginLock(lockData, pluginsDir) {
    ensurePluginsDir(pluginsDir);
    const lockPath = getPluginLockPath(pluginsDir);
    fs.writeFileSync(lockPath, JSON.stringify({
        version: 1,
        plugins: lockData && lockData.plugins ? lockData.plugins : {}
    }, null, 2), 'utf8');
    return lockPath;
}

function buildPluginMetadata(plugin, metadata = {}) {
    return {
        sourceType: metadata.sourceType || plugin.sourceType || 'local',
        sourceUrl: metadata.sourceUrl || plugin.sourceUrl || null,
        checksum: metadata.checksum || plugin.checksum || null,
        fromIndex: metadata.fromIndex || plugin.fromIndex || null,
        github: metadata.github || plugin.github || null,
        githubSpec: metadata.githubSpec || plugin.githubSpec || (metadata.github && metadata.github.spec) || (plugin.github && plugin.github.spec) || null,
        installedAt: metadata.installedAt || plugin.installedAt || new Date().toISOString(),
        installedPath: metadata.installedPath || null
    };
}

function updatePluginLock(plugin, pluginsDir, metadata = {}) {
    const lock = readPluginLock(pluginsDir);
    lock.plugins[plugin.name] = {
        name: plugin.name,
        version: plugin.version,
        description: plugin.description || '',
        author: plugin.author || '',
        ...buildPluginMetadata(plugin, metadata)
    };
    writePluginLock(lock, pluginsDir);
    return lock.plugins[plugin.name];
}

function removePluginFromLock(pluginName, pluginsDir) {
    const lock = readPluginLock(pluginsDir);
    if (lock.plugins[pluginName]) {
        delete lock.plugins[pluginName];
        writePluginLock(lock, pluginsDir);
    }
}

function extractPluginSummary(plugin, pluginPath, lockEntry = null) {
    return {
        name: plugin.name,
        version: plugin.version,
        description: plugin.description || '',
        author: plugin.author || '',
        path: pluginPath,
        sourceType: plugin.sourceType || (lockEntry && lockEntry.sourceType) || 'local',
        sourceUrl: plugin.sourceUrl || (lockEntry && lockEntry.sourceUrl) || null,
        checksum: plugin.checksum || (lockEntry && lockEntry.checksum) || null,
        fromIndex: plugin.fromIndex || (lockEntry && lockEntry.fromIndex) || null,
        githubSpec: plugin.githubSpec || (plugin.github && plugin.github.spec) || (lockEntry && lockEntry.githubSpec) || null,
        installedAt: plugin.installedAt || (lockEntry && lockEntry.installedAt) || null
    };
}

function loadPlugin(pluginPath) {
    try {
        if (!fs.existsSync(pluginPath)) {
            return { success: false, error: '文件不存在' };
        }

        const stats = fs.statSync(pluginPath);
        let plugin;
        let resolvedPath = pluginPath;

        if (stats.isDirectory()) {
            const pluginJsonPath = path.join(pluginPath, 'saohua-plugin.json');
            if (!fs.existsSync(pluginJsonPath)) {
                return { success: false, error: '目录中未找到 saohua-plugin.json' };
            }
            const content = fs.readFileSync(pluginJsonPath, 'utf8');
            plugin = JSON.parse(content);
            resolvedPath = pluginJsonPath;
        } else if (stats.isFile() && pluginPath.endsWith('.json')) {
            const content = fs.readFileSync(pluginPath, 'utf8');
            plugin = JSON.parse(content);
        } else {
            return { success: false, error: '插件文件必须是 .json 文件或包含 saohua-plugin.json 的目录' };
        }

        const validation = validatePlugin(plugin);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        return { success: true, plugin, path: resolvedPath };
    } catch (e) {
        if (e instanceof SyntaxError) {
            return { success: false, error: 'JSON 解析失败' };
        }
        return { success: false, error: e.message };
    }
}

function loadAllPlugins(pluginsDir) {
    const dir = getPluginsDir(pluginsDir);
    const plugins = [];

    if (!fs.existsSync(dir)) {
        return plugins;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            const result = loadPlugin(fullPath);
            if (result.success) {
                plugins.push(result.plugin);
            }
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            if (entry.name === PLUGIN_LOCK_FILENAME) {
                continue;
            }
            const result = loadPlugin(fullPath);
            if (result.success) {
                plugins.push(result.plugin);
            }
        }
    }

    return plugins;
}

function mergePluginData(coreData, plugins) {
    const merged = JSON.parse(JSON.stringify(coreData));

    for (const plugin of plugins) {
        if (!plugin.data) continue;

        for (const lang of Object.keys(plugin.data)) {
            if (!merged[lang]) {
                merged[lang] = {};
            }

            const pluginLangData = plugin.data[lang];
            for (const type of Object.keys(pluginLangData)) {
                if (!merged[lang][type]) {
                    merged[lang][type] = {};
                }

                const pluginTypeData = pluginLangData[type];
                for (const style of Object.keys(pluginTypeData)) {
                    if (!merged[lang][type][style]) {
                        merged[lang][type][style] = [];
                    }

                    const pluginMessages = pluginTypeData[style];
                    if (Array.isArray(pluginMessages)) {
                        merged[lang][type][style] = merged[lang][type][style].concat(pluginMessages);
                    }
                }
            }
        }
    }

    return merged;
}

function mergeStyles(coreStyles, plugins) {
    const merged = JSON.parse(JSON.stringify(coreStyles));

    for (const plugin of plugins) {
        if (!plugin.styles) continue;

        for (const lang of Object.keys(plugin.styles)) {
            if (!merged[lang]) {
                merged[lang] = [];
            }

            const pluginStyles = plugin.styles[lang];
            for (const style of Object.keys(pluginStyles)) {
                const existing = merged[lang].find(s => s.value === style);
                if (!existing) {
                    merged[lang].push({
                        value: style,
                        ...pluginStyles[style]
                    });
                }
            }
        }
    }

    return merged;
}

function mergeCommitTypes(coreTypes, plugins) {
    return coreTypes;
}

function listPlugins(pluginsDir) {
    const dir = getPluginsDir(pluginsDir);
    const plugins = [];
    const lockData = loadPluginsLockFile(pluginsDir);
    const lockPlugins = lockData && lockData.plugins ? lockData.plugins : {};

    if (!fs.existsSync(dir)) {
        return plugins;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            const result = loadPlugin(fullPath);
            if (result.success) {
                const lockEntry = lockPlugins[result.plugin.name] || {};
                plugins.push({
                    name: result.plugin.name,
                    version: result.plugin.version,
                    description: result.plugin.description || '',
                    author: result.plugin.author || '',
                    path: fullPath,
                    sourceType: result.plugin.sourceType || lockEntry.sourceType || 'local',
                    sourceUrl: result.plugin.sourceUrl || lockEntry.sourceUrl || null,
                    checksum: result.plugin.checksum || lockEntry.checksum || null,
                    fromIndex: result.plugin.fromIndex || lockEntry.fromIndex || null,
                    githubSpec: result.plugin.githubSpec || lockEntry.githubSpec || null,
                    installedAt: result.plugin.installedAt || lockEntry.installedAt || null
                });
            }
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            if (entry.name === PLUGIN_LOCK_FILENAME) {
                continue;
            }
            const result = loadPlugin(fullPath);
            if (result.success) {
                const lockEntry = lockPlugins[result.plugin.name] || {};
                plugins.push({
                    name: result.plugin.name,
                    version: result.plugin.version,
                    description: result.plugin.description || '',
                    author: result.plugin.author || '',
                    path: fullPath,
                    sourceType: result.plugin.sourceType || lockEntry.sourceType || 'local',
                    sourceUrl: result.plugin.sourceUrl || lockEntry.sourceUrl || null,
                    checksum: result.plugin.checksum || lockEntry.checksum || null,
                    fromIndex: result.plugin.fromIndex || lockEntry.fromIndex || null,
                    githubSpec: result.plugin.githubSpec || lockEntry.githubSpec || null,
                    installedAt: result.plugin.installedAt || lockEntry.installedAt || null
                });
            }
        }
    }

    return plugins;
}

function createPluginTemplate(outputPath, options = {}) {
    const name = options.name || 'my-sao-hua-pack';
    const version = options.version || '1.0.0';
    const description = options.description || '自定义骚话包';
    const author = options.author || '';

    const template = {
        name: name,
        version: version,
        description: description,
        author: author,
        data: {
            'zh-CN': {
                'feat': {
                    'love': [
                        '这是我为 ${name} 添加的新功能',
                        '为你带来新的惊喜'
                    ]
                }
            },
            'en': {
                'feat': {
                    'love': [
                        `New feature added for ${name}`,
                        'Bringing you new surprises'
                    ]
                }
            }
        },
        styles: {
            'zh-CN': {
                'custom': {
                    'label': '自定义风格',
                    'emoji': '🎉'
                }
            },
            'en': {
                'custom': {
                    'label': 'Custom Style',
                    'emoji': '🎉'
                }
            }
        }
    };

    try {
        ensurePluginsDir();
        
        const targetPath = outputPath || path.join(getPluginsDir(), `${name}.json`);
        const dir = path.dirname(targetPath);
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(targetPath, JSON.stringify(template, null, 2), 'utf8');
        return { success: true, path: targetPath };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

function installPluginObject(plugin, pluginsDir, metadata = {}) {
    const validation = validatePlugin(plugin);
    if (!validation.valid) {
        return { success: false, error: validation.error };
    }

    try {
        const targetDir = getPluginsDir(pluginsDir);
        ensurePluginsDir(pluginsDir);

        const targetPath = path.join(targetDir, `${plugin.name}.json`);
        if (fs.existsSync(targetPath)) {
            return { success: false, error: `插件 ${plugin.name} 已存在` };
        }

        const sourceType = metadata.sourceType || (metadata.sourceUrl ? 'url' : (metadata.fromIndex ? 'index' : (metadata.githubSpec ? 'github' : 'local')));
        const installedAt = new Date().toISOString();

        const pluginToSave = {
            ...plugin,
            sourceType,
            sourceUrl: metadata.sourceUrl || null,
            checksum: metadata.checksum || null,
            fromIndex: metadata.fromIndex || null,
            githubSpec: metadata.githubSpec || null,
            installedAt
        };

        fs.writeFileSync(targetPath, JSON.stringify(pluginToSave, null, 2), 'utf8');
        
        updatePluginLockEntry(plugin.name, {
            sourceType,
            sourceUrl: metadata.sourceUrl || null,
            checksum: metadata.checksum || null,
            fromIndex: metadata.fromIndex || null,
            githubSpec: metadata.githubSpec || null,
            installedAt,
            version: plugin.version
        }, pluginsDir);
        
        return { success: true, path: targetPath, plugin: pluginToSave };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

function installPlugin(sourcePath, pluginsDir) {
    try {
        const result = loadPlugin(sourcePath);
        if (!result.success) {
            return { success: false, error: result.error };
        }

        return installPluginObject(result.plugin, pluginsDir, {
            sourceType: 'local',
            sourceUrl: path.resolve(sourcePath)
        });
    } catch (e) {
        return { success: false, error: e.message };
    }
}

function fetchPluginFromUrl(pluginUrl, options = {}) {
    return new Promise((resolve) => {
        if (!pluginUrl || typeof pluginUrl !== 'string') {
            resolve({ success: false, error: '请提供有效的插件 URL' });
            return;
        }

        try {
            const parsedUrl = new URL(pluginUrl);
            const protocol = parsedUrl.protocol;

            if (protocol !== 'http:' && protocol !== 'https:') {
                resolve({ success: false, error: '插件 URL 仅支持 http/https' });
                return;
            }

            const hostValidation = validateHost(pluginUrl, options);
            if (!hostValidation.valid) {
                resolve({ success: false, error: hostValidation.error });
                return;
            }

            const timeout = options.timeout || DEFAULT_PLUGIN_FETCH_TIMEOUT;
            const redirectCount = options.redirectCount || 0;

            const client = protocol === 'https:' ? https : http;
            
            const req = client.request(parsedUrl, {
                method: 'GET',
                timeout,
                headers: {
                    'Accept': 'application/json, text/plain;q=0.9, */*;q=0.1',
                    'User-Agent': 'git-sao-hua-plugin-installer/1.0'
                }
            }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    if (redirectCount >= 3) {
                        res.resume();
                        resolve({ success: false, error: '插件 URL 重定向次数过多' });
                        return;
                    }

                    const redirectUrl = new URL(res.headers.location, parsedUrl).toString();
                    res.resume();
                    fetchPluginFromUrl(redirectUrl, { ...options, timeout, redirectCount: redirectCount + 1 }).then(resolve);
                    return;
                }

                if (res.statusCode !== 200) {
                    res.resume();
                    resolve({ success: false, error: `下载插件失败，HTTP 状态码: ${res.statusCode}` });
                    return;
                }

                let data = '';
                res.setEncoding('utf8');
                res.on('data', chunk => { data += chunk; });
                res.on('end', () => {
                    try {
                        const plugin = JSON.parse(data);
                        const validation = validatePlugin(plugin);
                        if (!validation.valid) {
                            resolve({ success: false, error: `插件验证失败: ${validation.error}` });
                            return;
                        }

                        resolve({ success: true, plugin, sourceUrl: parsedUrl.toString(), rawContent: data });
                    } catch (e) {
                        resolve({ success: false, error: '远程插件不是合法 JSON' });
                    }
                });
            });

            req.on('error', (e) => {
                resolve({ success: false, error: e.message === '下载插件超时' ? e.message : `下载插件失败: ${e.message}` });
            });

            req.on('timeout', () => {
                req.destroy(new Error('下载插件超时'));
            });

            req.end();
        } catch (e) {
            resolve({ success: false, error: '插件 URL 格式无效' });
        }
    });
}

async function installPluginFromUrl(pluginUrl, pluginsDir, options = {}) {
    try {
        const fetchResult = await fetchPluginFromUrl(pluginUrl, options);
        if (!fetchResult.success) {
            return { success: false, error: fetchResult.error };
        }

        if (options.expectedChecksum) {
            const verifyResult = verifyChecksum(fetchResult.rawContent, options.expectedChecksum);
            if (!verifyResult.valid) {
                return { success: false, error: verifyResult.error };
            }
        }

        const computedChecksum = options.expectedChecksum || calculateSha256(fetchResult.rawContent);
        
        const installResult = installPluginObject(fetchResult.plugin, pluginsDir, {
            sourceUrl: fetchResult.sourceUrl,
            sourceType: 'url',
            checksum: computedChecksum
        });

        return installResult;
    } catch (e) {
        return { success: false, error: e.message };
    }
}

async function installPluginFromGitHub(githubSpec, pluginsDir, options = {}) {
    try {
        const fetchResult = await fetchPluginFromGitHub(githubSpec, options);
        if (!fetchResult.success) {
            return { success: false, error: fetchResult.error };
        }

        if (options.expectedChecksum) {
            const verifyResult = verifyChecksum(fetchResult.rawContent, options.expectedChecksum);
            if (!verifyResult.valid) {
                return { success: false, error: verifyResult.error };
            }
        }

        const computedChecksum = options.expectedChecksum || calculateSha256(fetchResult.rawContent);
        const parseResult = parseGitHubShorthand(githubSpec);
        return installPluginObject(fetchResult.plugin, pluginsDir, {
            sourceUrl: fetchResult.sourceUrl,
            sourceType: 'github',
            checksum: computedChecksum,
            githubSpec: parseResult.valid ? githubSpec : null
        });
    } catch (e) {
        return { success: false, error: e.message };
    }
}

function getPluginsLockFilePath(pluginsDir) {
    return path.join(getPluginsDir(pluginsDir), 'plugins.lock.json');
}

function loadPluginsLockFile(pluginsDir) {
    const lockPath = getPluginsLockFilePath(pluginsDir);
    if (!fs.existsSync(lockPath)) {
        return null;
    }
    try {
        const content = fs.readFileSync(lockPath, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        return null;
    }
}

function savePluginsLockFile(pluginsDir, lockData) {
    const lockPath = getPluginsLockFilePath(pluginsDir);
    try {
        fs.writeFileSync(lockPath, JSON.stringify(lockData, null, 2), 'utf8');
        return true;
    } catch (e) {
        return false;
    }
}

function updatePluginLockEntry(pluginName, metadata, pluginsDir) {
    const lockPath = getPluginsLockFilePath(pluginsDir);
    let lockData = loadPluginsLockFile(pluginsDir);
    
    if (!lockData) {
        lockData = { version: '1.0.0', generatedAt: new Date().toISOString(), plugins: {} };
    }
    
    if (!lockData.plugins) {
        lockData.plugins = {};
    }
    
    lockData.plugins[pluginName] = {
        ...metadata,
        lockedAt: new Date().toISOString()
    };
    
    lockData.generatedAt = new Date().toISOString();
    
    return savePluginsLockFile(pluginsDir, lockData);
}

function removePluginLockEntry(pluginName, pluginsDir) {
    const lockData = loadPluginsLockFile(pluginsDir);
    if (!lockData || !lockData.plugins || !lockData.plugins[pluginName]) {
        return true;
    }
    
    delete lockData.plugins[pluginName];
    lockData.generatedAt = new Date().toISOString();
    
    return savePluginsLockFile(pluginsDir, lockData);
}

function getPluginDetails(pluginName, pluginsDir) {
    const dir = getPluginsDir(pluginsDir);
    const targetPath = path.join(dir, `${pluginName}.json`);
    
    const result = loadPlugin(targetPath);
    if (!result.success) {
        return { success: false, error: result.error };
    }
    
    const plugin = result.plugin;
    const lockData = loadPluginsLockFile(pluginsDir);
    const lockEntry = lockData && lockData.plugins ? lockData.plugins[pluginName] : null;
    
    return {
        success: true,
        plugin: {
            name: plugin.name,
            version: plugin.version,
            description: plugin.description || null,
            author: plugin.author || null,
            path: targetPath,
            data: plugin.data,
            styles: plugin.styles || null,
            sourceType: plugin.sourceType || (lockEntry ? lockEntry.sourceType : null),
            sourceUrl: plugin.sourceUrl || (lockEntry ? lockEntry.sourceUrl : null),
            checksum: plugin.checksum || (lockEntry ? lockEntry.checksum : null),
            fromIndex: plugin.fromIndex || (lockEntry ? lockEntry.fromIndex : null),
            githubSpec: plugin.githubSpec || (lockEntry ? lockEntry.githubSpec : null),
            installedAt: plugin.installedAt || (lockEntry ? lockEntry.installedAt : null),
            lockedAt: lockEntry ? lockEntry.lockedAt : null
        },
        lockEntry
    };
}

function getPluginsLockInfo(pluginsDir) {
    const lockData = loadPluginsLockFile(pluginsDir);
    if (!lockData) {
        return { hasLockFile: false, plugins: {} };
    }
    return {
        hasLockFile: true,
        version: lockData.version || '1.0.0',
        generatedAt: lockData.generatedAt || null,
        plugins: lockData.plugins || {}
    };
}

function removePlugin(pluginName, pluginsDir) {
    const dir = getPluginsDir(pluginsDir);
    const targetPath = path.join(dir, `${pluginName}.json`);

    if (!fs.existsSync(targetPath)) {
        return { success: false, error: `插件 ${pluginName} 不存在` };
    }

    try {
        fs.unlinkSync(targetPath);
        removePluginLockEntry(pluginName, pluginsDir);
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

function fetchPluginIndex(indexUrl, options = {}) {
    return new Promise((resolve) => {
        const url = indexUrl || process.env.PLUGIN_INDEX_URL || DEFAULT_INDEX_URL;

        if (!url || typeof url !== 'string') {
            resolve({ success: false, error: '请提供有效的索引 URL' });
            return;
        }

        try {
            const parsedUrl = new URL(url);
            const protocol = parsedUrl.protocol;

            if (protocol !== 'http:' && protocol !== 'https:') {
                resolve({ success: false, error: '索引 URL 仅支持 http/https' });
                return;
            }

            const hostValidation = validateHost(url, options);
            if (!hostValidation.valid) {
                resolve({ success: false, error: hostValidation.error });
                return;
            }

            const timeout = options.timeout || DEFAULT_PLUGIN_FETCH_TIMEOUT;

            const client = protocol === 'https:' ? https : http;

            const req = client.request(parsedUrl, {
                method: 'GET',
                timeout,
                headers: {
                    'Accept': 'application/json, text/plain;q=0.9, */*;q=0.1',
                    'User-Agent': 'git-sao-hua-plugin-index/1.0'
                }
            }, (res) => {
                if (res.statusCode !== 200) {
                    res.resume();
                    resolve({ success: false, error: `获取插件索引失败，HTTP 状态码: ${res.statusCode}` });
                    return;
                }

                let data = '';
                res.setEncoding('utf8');
                res.on('data', chunk => { data += chunk; });
                res.on('end', () => {
                    try {
                        const index = JSON.parse(data);
                        if (!index.plugins || !Array.isArray(index.plugins)) {
                            resolve({ success: false, error: '索引格式无效，缺少 plugins 数组' });
                            return;
                        }
                        resolve({ success: true, index, sourceUrl: parsedUrl.toString() });
                    } catch (e) {
                        resolve({ success: false, error: '插件索引 JSON 解析失败' });
                    }
                });
            });

            req.on('error', (e) => {
                resolve({ success: false, error: `获取插件索引失败: ${e.message}` });
            });

            req.on('timeout', () => {
                req.destroy(new Error('获取插件索引超时'));
            });

            req.end();
        } catch (e) {
            resolve({ success: false, error: '索引 URL 格式无效' });
        }
    });
}

function searchPluginIndex(query, indexUrl, options = {}) {
    return new Promise(async (resolve) => {
        const result = await fetchPluginIndex(indexUrl, options);
        if (!result.success) {
            resolve(result);
            return;
        }

        const plugins = result.index.plugins || [];
        const q = (query || '').toLowerCase().trim();

        let filtered = plugins;
        if (q) {
            filtered = plugins.filter(p => {
                const nameMatch = p.name && p.name.toLowerCase().includes(q);
                const descMatch = p.description && p.description.toLowerCase().includes(q);
                const tagsMatch = p.tags && p.tags.some(t => t.toLowerCase().includes(q));
                return nameMatch || descMatch || tagsMatch;
            });
        }

        resolve({
            success: true,
            plugins: filtered,
            total: plugins.length,
            query: q,
            indexUrl: result.sourceUrl
        });
    });
}

async function installPluginFromIndex(pluginName, indexUrl, pluginsDir, options = {}) {
    try {
        const searchResult = await searchPluginIndex(pluginName, indexUrl, options);
        if (!searchResult.success) {
            return { success: false, error: searchResult.error };
        }

        const plugin = searchResult.plugins.find(p => p.name === pluginName);
        if (!plugin) {
            return { success: false, error: `索引中未找到插件: ${pluginName}` };
        }

        if (!plugin.sourceUrl && !plugin.github) {
            return { success: false, error: `插件 ${pluginName} 缺少 sourceUrl 或 github 字段` };
        }

        const fetchResult = plugin.github && !plugin.sourceUrl
            ? await fetchPluginFromGitHub(plugin.github, options)
            : await fetchPluginFromUrl(plugin.sourceUrl, options);
        if (!fetchResult.success) {
            return { success: false, error: fetchResult.error };
        }

        if (plugin.checksum) {
            const verifyResult = verifyChecksum(fetchResult.rawContent, plugin.checksum);
            if (!verifyResult.valid) {
                return { success: false, error: verifyResult.error };
            }
        }

        const metadata = {
            sourceUrl: fetchResult.sourceUrl,
            fromIndex: searchResult.indexUrl,
            sourceType: plugin.github && !plugin.sourceUrl ? 'github' : 'index',
            checksum: plugin.checksum || null,
            githubSpec: plugin.github || null
        };

        return installPluginObject(fetchResult.plugin, pluginsDir, metadata);
    } catch (e) {
        return { success: false, error: e.message };
    }
}

module.exports = {
    DEFAULT_PLUGINS_DIR,
    DEFAULT_PLUGIN_FETCH_TIMEOUT,
    DEFAULT_INDEX_URL,
    DEFAULT_ALLOWED_HOSTS,
    DEFAULT_GITHUB_REF,
    DEFAULT_GITHUB_PATHS,
    normalizeAllowedHosts,
    getConfigAllowedHosts,
    getPluginsDir,
    ensurePluginsDir,
    getAllowedHosts,
    isHostAllowed,
    validateHost,
    validatePlugin,
    loadPlugin,
    loadAllPlugins,
    mergePluginData,
    mergeStyles,
    mergeCommitTypes,
    listPlugins,
    createPluginTemplate,
    installPluginObject,
    installPlugin,
    installPluginFromUrl,
    installPluginFromGitHub,
    fetchPluginFromGitHub,
    fetchPluginFromUrl,
    removePlugin,
    fetchPluginIndex,
    searchPluginIndex,
    installPluginFromIndex,
    parseGitHubShorthand,
    calculateSha256,
    verifyChecksum,
    getPluginDetails,
    getPluginsLockInfo,
    getPluginsLockFilePath,
    loadPluginsLockFile,
    savePluginsLockFile
};
