/**
 * 插件管理系统
 * 管理自定义骚话包的加载、验证、合并
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_PLUGINS_DIR = path.join(os.homedir(), '.saohua', 'plugins');

const REQUIRED_PLUGIN_FIELDS = ['name', 'version', 'data'];
const OPTIONAL_PLUGIN_FIELDS = ['description', 'author', 'styles'];

function getPluginsDir(pluginsDir) {
    return pluginsDir || DEFAULT_PLUGINS_DIR;
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
    const pluginPaths = [];

    if (!fs.existsSync(dir)) {
        return plugins;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            const result = loadPlugin(fullPath);
            if (result.success) {
                plugins.push({
                    name: result.plugin.name,
                    version: result.plugin.version,
                    description: result.plugin.description || '',
                    author: result.plugin.author || '',
                    path: fullPath
                });
            }
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            const result = loadPlugin(fullPath);
            if (result.success) {
                plugins.push({
                    name: result.plugin.name,
                    version: result.plugin.version,
                    description: result.plugin.description || '',
                    author: result.plugin.author || '',
                    path: fullPath
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

function installPlugin(sourcePath, pluginsDir) {
    try {
        const result = loadPlugin(sourcePath);
        if (!result.success) {
            return { success: false, error: result.error };
        }

        const plugin = result.plugin;
        const targetDir = getPluginsDir(pluginsDir);
        ensurePluginsDir(pluginsDir);

        const targetPath = path.join(targetDir, `${plugin.name}.json`);
        
        if (fs.existsSync(targetPath)) {
            return { success: false, error: `插件 ${plugin.name} 已存在` };
        }

        fs.writeFileSync(targetPath, JSON.stringify(plugin, null, 2), 'utf8');
        return { success: true, path: targetPath, plugin };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

function removePlugin(pluginName, pluginsDir) {
    const dir = getPluginsDir(pluginsDir);
    const targetPath = path.join(dir, `${pluginName}.json`);

    if (!fs.existsSync(targetPath)) {
        return { success: false, error: `插件 ${pluginName} 不存在` };
    }

    try {
        fs.unlinkSync(targetPath);
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

module.exports = {
    DEFAULT_PLUGINS_DIR,
    getPluginsDir,
    ensurePluginsDir,
    validatePlugin,
    loadPlugin,
    loadAllPlugins,
    mergePluginData,
    mergeStyles,
    mergeCommitTypes,
    listPlugins,
    createPluginTemplate,
    installPlugin,
    removePlugin
};