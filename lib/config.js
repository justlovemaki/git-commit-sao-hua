/**
 * 配置系统模块
 * 管理 .saohuarc.json 项目级配置
 */

const fs = require('fs');
const path = require('path');

/** 配置文件名 */
const CONFIG_FILENAME = '.saohuarc.json';

/** 默认配置 */
const DEFAULT_CONFIG = {
    style: 'sao',
    language: 'zh-CN',
    auto: true,
    ai: false,
    format: 'suffix',
    emoji: true,
    plugins: {
        enabled: true,
        dir: '~/.saohua/plugins'
    }
};

/** 配置项验证规则 */
const CONFIG_SCHEMA = {
    style: {
        type: 'string',
        values: ['love', 'sao', 'zha', 'chu', 'fo'],
        desc: '骚话风格'
    },
    language: {
        type: 'string',
        values: ['zh-CN', 'en'],
        desc: '默认语言'
    },
    auto: {
        type: 'boolean',
        desc: '是否启用智能检测'
    },
    ai: {
        type: 'boolean',
        desc: '是否使用 AI 生成'
    },
    format: {
        type: 'string',
        values: ['suffix', 'replace', 'prefix'],
        desc: '骚话位置'
    },
    emoji: {
        type: 'boolean',
        desc: '是否包含 emoji'
    },
    plugins: {
        type: 'object',
        desc: '插件配置',
        fields: {
            enabled: { type: 'boolean', desc: '是否启用插件' },
            dir: { type: 'string', desc: '插件目录' }
        }
    }
};

/**
 * 获取配置文件路径
 * @param {string} repoPath - 仓库根目录路径
 * @returns {string} 配置文件绝对路径
 */
function getConfigPath(repoPath) {
    return path.join(repoPath || process.cwd(), CONFIG_FILENAME);
}

/**
 * 创建默认配置对象
 * @returns {object} 默认配置的深拷贝
 */
function createDefaultConfig() {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

/**
 * 验证配置对象
 * @param {object} config - 待验证的配置对象
 * @returns {{valid: boolean, errors: string[]}} 验证结果
 */
function validateConfig(config) {
    const errors = [];

    if (!config || typeof config !== 'object' || Array.isArray(config)) {
        return { valid: false, errors: ['配置必须是一个 JSON 对象'] };
    }

    for (const [key, value] of Object.entries(config)) {
        const schema = CONFIG_SCHEMA[key];

        // 未知配置项（不报错，只忽略）
        if (!schema) {
            continue;
        }

        // 类型检查
        if (schema.type === 'object' && schema.fields) {
            if (typeof value !== 'object' || value === null) {
                errors.push(`"${key}" 应为 ${schema.type} 类型，当前为 ${typeof value}`);
                continue;
            }
            for (const [subKey, subValue] of Object.entries(value)) {
                const subSchema = schema.fields[subKey];
                if (subSchema && typeof subValue !== subSchema.type) {
                    errors.push(`"${key}.${subKey}" 应为 ${subSchema.type} 类型`);
                }
            }
            continue;
        }

        if (typeof value !== schema.type) {
            errors.push(`"${key}" 应为 ${schema.type} 类型，当前为 ${typeof value}`);
            continue;
        }

        // 枚举值检查
        if (schema.values && !schema.values.includes(value)) {
            errors.push(`"${key}" 的值 "${value}" 无效，可选值: ${schema.values.join(', ')}`);
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * 从 .saohuarc.json 加载配置
 * 配置文件缺失时返回默认配置，不报错
 * @param {string} [repoPath] - 仓库根目录路径，默认为 process.cwd()
 * @returns {object} 合并后的配置对象（默认值 + 用户配置）
 */
function loadConfig(repoPath) {
    const configPath = getConfigPath(repoPath);
    const defaults = createDefaultConfig();

    try {
        if (!fs.existsSync(configPath)) {
            return defaults;
        }

        const raw = fs.readFileSync(configPath, 'utf8');
        const userConfig = JSON.parse(raw);

        // 验证用户配置
        const { valid, errors } = validateConfig(userConfig);
        if (!valid) {
            // 配置有问题时使用默认值，但不中断流程
            return defaults;
        }

        // 合并：用户配置覆盖默认值
        return { ...defaults, ...userConfig };
    } catch (e) {
        // JSON 解析失败等错误，静默返回默认配置
        return defaults;
    }
}

/**
 * 将配置写入 .saohuarc.json
 * @param {string} repoPath - 仓库根目录路径
 * @param {object} config - 配置对象
 * @returns {boolean} 是否写入成功
 */
function saveConfig(repoPath, config) {
    try {
        const configPath = getConfigPath(repoPath);
        const content = JSON.stringify(config, null, 2) + '\n';
        fs.writeFileSync(configPath, content, 'utf8');
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = {
    CONFIG_FILENAME,
    DEFAULT_CONFIG,
    CONFIG_SCHEMA,
    getConfigPath,
    createDefaultConfig,
    validateConfig,
    loadConfig,
    saveConfig
};
