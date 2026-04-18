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

function parseGitLog(logText, options = {}) {
    const includeAuthor = options.includeAuthor !== false;
    return (logText || '')
        .split('\x1e')
        .map(entry => entry.trim())
        .filter(Boolean)
        .map(entry => {
            const parts = entry.split('\x1f');
            const hash = (parts[0] || '').trim();
            const subject = (parts[1] || '').trim();
            const body = (parts[2] || '').trim();
            const authorName = includeAuthor ? (parts[3] || '').trim() : null;
            const authorEmail = includeAuthor ? (parts[4] || '').trim() : null;
            const parsed = parseConventionalCommit(subject || '', body || '');
            return {
                hash: hash,
                shortHash: hash.slice(0, 7),
                subject: subject,
                body: body,
                authorName: authorName || null,
                authorEmail: authorEmail || null,
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

function extractPRNumbers(subject) {
    const matches = subject.match(/#(\d+)/g) || [];
    return matches.map(m => m.slice(1));
}

function formatCommitLine(commit, options = {}) {
    const { repo = null, baseUrl = null } = options;
    const scopeText = commit.scope ? `**${commit.scope}:** ` : '';
    const description = commit.description;

    let lineText = `- ${scopeText}${description}`;

    if (repo && baseUrl) {
        const commitLink = `${baseUrl}/commit/${commit.hash}`;
        lineText += ` ([${commit.shortHash}](${commitLink}))`;

        const prNumbers = extractPRNumbers(commit.subject);
        for (const prNum of prNumbers.slice(0, 1)) {
            const prLink = `${baseUrl}/pull/${prNum}`;
            lineText += ` ([#${prNum}](${prLink}))`;
        }
    } else if (commit.shortHash) {
        lineText += ` (${commit.shortHash})`;
    }

    return lineText;
}

function parseCompareRange(range) {
    if (!range) return null;

    const match = range.match(/^([a-zA-Z0-9.]+)\.\.([a-zA-Z0-9.]+)$/);
    if (match) {
        return { from: match[1], to: match[2] };
    }

    return null;
}

function buildReleaseNotes(commits, options = {}) {
    const title = options.title || 'Release Notes';
    const generatedAt = options.generatedAt || new Date().toISOString();
    const range = options.range || null;
    const repo = options.repo || null;
    const baseUrl = repo ? `https://github.com/${repo}` : null;
    const sections = groupCommits(commits);
    const lines = [`# ${title}`, ''];

    if (range) {
        lines.push(`> Range: \`${range}\``);

        if (repo && baseUrl) {
            const compareRange = parseCompareRange(range);
            if (compareRange) {
                const compareLink = `${baseUrl}/compare/${compareRange.from}...${compareRange.to}`;
                lines.push(`> Compare: [${compareRange.from}...${compareRange.to}](${compareLink})`);
            }
        }
    }

    if (repo) {
        lines.push(`> Repository: ${repo}`);
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

        lines.push(...uniqueCommits.map(c => formatCommitLine(c, { repo, baseUrl })));
        lines.push('');
    }

    return lines.join('\n').trim() + '\n';
}

function getGitLog(range, options = {}) {
    const repoPath = options.repoPath || process.cwd();
    const commandRange = range || '';
    const includeAuthor = options.includeAuthor !== false;
    const format = includeAuthor
        ? '%H%x1f%s%x1f%b%x1f%an%x1f%ae%x1e'
        : '%H%x1f%s%x1f%b%x1e';
    const command = `git log ${commandRange} --pretty=format:${format}`;
    return execSync(command.trim(), { cwd: repoPath, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function getRemoteOrigin(options = {}) {
    const repoPath = options.repoPath || process.cwd();
    try {
        const url = execSync('git remote get-url origin', {
            cwd: repoPath,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe']
        }).trim();

        if (url.includes('github.com')) {
            const match = url.match(/github\.com[/:]([^/]+\/[^/]+?)(\.git)?$/);
            if (match) {
                return match[1];
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

function buildReleaseNotesData(commits, options = {}) {
    const title = options.title || 'Release Notes';
    const generatedAt = options.generatedAt || new Date().toISOString();
    const range = options.range || null;
    const repo = options.repo || null;
    const baseUrl = repo ? `https://github.com/${repo}` : null;
    const sections = groupCommits(commits);
    const compareInfo = range ? parseCompareRange(range) : null;

    const sectionCounts = {};
    const sectionList = {};
    for (const key of SECTION_ORDER) {
        if (sections[key].length > 0) {
            const uniqueCommits = key === 'breaking'
                ? Array.from(new Map(sections[key].map(commit => [commit.hash, commit])).values())
                : sections[key];
            const count = uniqueCommits.length;
            sectionCounts[SECTION_TITLES[key] || key] = count;
            sectionList[SECTION_TITLES[key] || key] = uniqueCommits.map(c => ({
                hash: c.hash,
                shortHash: c.shortHash,
                type: c.type,
                scope: c.scope,
                description: c.description,
                breaking: c.breaking,
                body: c.body || null,
                authorName: c.authorName,
                authorEmail: c.authorEmail
            }));
        }
    }

    return {
        title,
        version: title,
        range,
        repo,
        baseUrl,
        compare: compareInfo ? {
            from: compareInfo.from,
            to: compareInfo.to,
            url: compareInfo ? `${baseUrl}/compare/${compareInfo.from}...${compareInfo.to}` : null
        } : null,
        generatedAt,
        totalCommits: commits.length,
        summary: sectionCounts,
        sections: sectionList,
        commits: commits.map(c => ({
            hash: c.hash,
            shortHash: c.shortHash,
            type: c.type,
            scope: c.scope,
            description: c.description,
            breaking: c.breaking,
            body: c.body || null,
            authorName: c.authorName,
            authorEmail: c.authorEmail
        }))
    };
}

function generateReleaseNotes(range, options = {}) {
    const logText = options.logText != null ? options.logText : getGitLog(range, options);
    const commits = parseGitLog(logText, { includeAuthor: options.includeAuthor !== false });

    let repo = options.repo;
    if (!repo && options.inferRepo !== false) {
        repo = getRemoteOrigin(options);
    }

    const data = buildReleaseNotesData(commits, {
        title: options.title,
        generatedAt: options.generatedAt,
        range,
        repo
    });

    return {
        commits,
        markdown: buildReleaseNotes(commits, {
            title: options.title,
            generatedAt: options.generatedAt,
            range,
            repo
        }),
        repo,
        data
    };
}

module.exports = {
    SECTION_ORDER,
    SECTION_TITLES,
    parseConventionalCommit,
    parseGitLog,
    groupCommits,
    buildReleaseNotes,
    buildReleaseNotesData,
    getGitLog,
    getRemoteOrigin,
    generateReleaseNotes,
    formatCommitLine,
    extractPRNumbers,
    parseCompareRange
};