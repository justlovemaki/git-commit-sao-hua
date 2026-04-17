const { execSync } = require('child_process');

const SECTION_ORDER = [
    'feat',
    'fix',
    'perf',
    'refactor',
    'docs',
    'test',
    'build',
    'ci',
    'chore',
    'revert',
    'other',
    'breaking'
];

const SECTION_TITLES = {
    feat: 'Features',
    fix: 'Fixes',
    perf: 'Performance',
    refactor: 'Refactors',
    docs: 'Docs',
    test: 'Tests',
    build: 'Build',
    ci: 'CI',
    chore: 'Chores',
    revert: 'Reverts',
    other: 'Other Changes',
    breaking: 'Breaking Changes'
};

function parseConventionalCommit(subject = '', body = '') {
    const trimmedSubject = subject.trim();
    const conventionalMatch = trimmedSubject.match(/^([a-z]+)(\(([^)]+)\))?(!)?:\s+(.+)$/i);
    const bodyText = (body || '').trim();
    const hasBreakingMarker = /BREAKING CHANGE:/i.test(bodyText);

    if (!conventionalMatch) {
        return {
            type: 'other',
            scope: null,
            description: trimmedSubject,
            breaking: hasBreakingMarker
        };
    }

    const type = conventionalMatch[1].toLowerCase();
    const scope = conventionalMatch[3] || null;
    const description = conventionalMatch[5].trim();
    const breaking = Boolean(conventionalMatch[4]) || hasBreakingMarker;

    return { type, scope, description, breaking };
}

function parseGitLog(logText) {
    return (logText || '')
        .split('\x1e')
        .map(entry => entry.trim())
        .filter(Boolean)
        .map(entry => {
            const [hash, subject, body] = entry.split('\x1f');
            const parsed = parseConventionalCommit(subject || '', body || '');
            return {
                hash: (hash || '').trim(),
                shortHash: (hash || '').trim().slice(0, 7),
                subject: (subject || '').trim(),
                body: (body || '').trim(),
                ...parsed
            };
        });
}

function groupCommits(commits) {
    const sections = SECTION_ORDER.reduce((acc, key) => {
        acc[key] = [];
        return acc;
    }, {});

    for (const commit of commits) {
        const bucket = sections[commit.type] ? commit.type : 'other';
        sections[bucket].push(commit);
        if (commit.breaking) {
            sections.breaking.push(commit);
        }
    }

    return sections;
}

function formatCommitLine(commit) {
    const scopeText = commit.scope ? `**${commit.scope}:** ` : '';
    const hashText = commit.shortHash ? ` (${commit.shortHash})` : '';
    return `- ${scopeText}${commit.description}${hashText}`;
}

function buildReleaseNotes(commits, options = {}) {
    const title = options.title || 'Release Notes';
    const generatedAt = options.generatedAt || new Date().toISOString();
    const range = options.range || null;
    const sections = groupCommits(commits);
    const lines = [`# ${title}`, ''];

    if (range) {
        lines.push(`> Range: \`${range}\``);
    }
    lines.push(`> Generated at: ${generatedAt}`);
    lines.push(`> Total commits: ${commits.length}`);
    lines.push('');

    const summary = SECTION_ORDER
        .filter(key => key !== 'breaking' && sections[key].length > 0)
        .map(key => `- ${SECTION_TITLES[key]}: ${sections[key].length}`);

    if (summary.length > 0) {
        lines.push('## Summary');
        lines.push('');
        lines.push(...summary);
        lines.push('');
    }

    for (const key of SECTION_ORDER) {
        if (sections[key].length === 0) {
            continue;
        }

        lines.push(`## ${SECTION_TITLES[key]}`);
        lines.push('');

        const uniqueCommits = key === 'breaking'
            ? Array.from(new Map(sections[key].map(commit => [commit.hash, commit])).values())
            : sections[key];

        lines.push(...uniqueCommits.map(formatCommitLine));
        lines.push('');
    }

    return lines.join('\n').trim() + '\n';
}

function getGitLog(range, options = {}) {
    const repoPath = options.repoPath || process.cwd();
    const commandRange = range || '';
    const command = `git log ${commandRange} --pretty=format:%H%x1f%s%x1f%b%x1e`;
    return execSync(command.trim(), { cwd: repoPath, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function generateReleaseNotes(range, options = {}) {
    const logText = options.logText != null ? options.logText : getGitLog(range, options);
    const commits = parseGitLog(logText);
    return {
        commits,
        markdown: buildReleaseNotes(commits, {
            title: options.title,
            generatedAt: options.generatedAt,
            range
        })
    };
}

module.exports = {
    SECTION_ORDER,
    SECTION_TITLES,
    parseConventionalCommit,
    parseGitLog,
    groupCommits,
    buildReleaseNotes,
    getGitLog,
    generateReleaseNotes
};
