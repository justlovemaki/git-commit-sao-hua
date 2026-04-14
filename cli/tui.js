const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    red: '\x1b[31m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

function colorize(color, text) {
    return (COLORS[color] || '') + text + COLORS.reset;
}

function green(text) {
    return colorize('green', text);
}

function yellow(text) {
    return colorize('yellow', text);
}

function cyan(text) {
    return colorize('cyan', text);
}

function bold(text) {
    return colorize('bold', text);
}

function dim(text) {
    return colorize('dim', text);
}

function stripAnsi(text) {
    return String(text || '').replace(/\x1B\[[0-9;]*m/g, '');
}

function clearScreen(output = process.stdout) {
    if (output && typeof output.write === 'function') {
        output.write('\x1b[2J\x1b[0f');
    }
}

function formatMenu(title, description, options, footer) {
    const lines = [''];
    lines.push(bold(cyan('╔══════════════════════════════════════════════╗')));
    lines.push(bold(cyan(`║ ${title.padEnd(44)}║`)));
    lines.push(bold(cyan('╚══════════════════════════════════════════════╝')));

    if (description) {
        lines.push('');
        lines.push(dim(description));
    }

    if (Array.isArray(options) && options.length > 0) {
        lines.push('');
        options.forEach((option, index) => {
            const label = `${index + 1}. ${option.label}`;
            lines.push(`  ${green(label)}${option.description ? ' - ' + option.description : ''}`);
        });
    }

    if (footer) {
        lines.push('');
        lines.push(dim(footer));
    }

    lines.push('');
    return lines.join('\n');
}

function formatPreview(message, meta = {}) {
    const lines = [''];
    lines.push(bold(cyan('╔══════════════════════════════════════════════╗')));
    lines.push(bold(cyan('║ Git Commit 骚话 TUI 预览                     ║')));
    lines.push(bold(cyan('╚══════════════════════════════════════════════╝')));
    lines.push('');
    lines.push(`  ${bold('commit')}  ${yellow(message.fullMessage || '')}`);
    lines.push(`  ${bold('type')}    ${green(meta.type || message.type || '-')}`);
    lines.push(`  ${bold('style')}   ${green(meta.style || message.style || '-')}`);
    lines.push(`  ${bold('lang')}    ${green(meta.language || message.language || 'zh-CN')}`);
    lines.push(`  ${bold('mode')}    ${green(meta.mode || (message.isAI ? 'ai' : 'template'))}`);
    if (meta.hint) {
        lines.push(`  ${dim(meta.hint)}`);
    }
    lines.push('');
    return lines.join('\n');
}

function resolveChoice(answer, items, fallbackValue, formatter) {
    const raw = (answer || '').trim();
    if (!raw) {
        return fallbackValue;
    }

    const index = parseInt(raw, 10);
    if (!Number.isNaN(index) && index >= 1 && index <= items.length) {
        return formatter(items[index - 1]);
    }

    const normalized = raw.toLowerCase();
    const matched = items.find(item => formatter(item).toLowerCase() === normalized);
    return matched ? formatter(matched) : fallbackValue;
}

module.exports = {
    COLORS,
    green,
    yellow,
    cyan,
    bold,
    dim,
    stripAnsi,
    clearScreen,
    formatMenu,
    formatPreview,
    resolveChoice
};
