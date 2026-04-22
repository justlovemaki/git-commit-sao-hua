const { execSync } = require('child_process');

function normalizeGitHubMetadata(metadata = null) {
    if (!metadata || typeof metadata !== 'object') {
        return null;
    }

    const prs = metadata.prs && typeof metadata.prs === 'object' ? metadata.prs : {};
    const labels = Array.from(new Set(
        Object.values(prs).flatMap(pr => Array.isArray(pr.labels) ? pr.labels : [])
    ));
    const authors = Array.from(new Set(
        Object.values(prs)
            .map(pr => pr && pr.user ? pr.user : null)
            .filter(Boolean)
    ));

    return {
        prs,
        summary: {
            prCount: Object.keys(prs).length,
            labels,
            authors
        }
    };
}

async function fetchGitHubMetadata(repo, options = {}) {
    const {
        token = null,
        commits = [],
        fetchImpl = globalThis.fetch,
        apiBaseUrl = 'https://api.github.com',
        maxPulls = 20
    } = options;

    if (!repo || !fetchImpl || !Array.isArray(commits) || commits.length === 0) {
        return normalizeGitHubMetadata(null);
    }

    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
        return normalizeGitHubMetadata(null);
    }

    const prNumbers = Array.from(new Set(
        commits.flatMap(commit => extractPRNumbers(commit.subject || ''))
    )).slice(0, maxPulls);

    if (prNumbers.length === 0) {
        return normalizeGitHubMetadata({ prs: {} });
    }

    const headers = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'git-sao-hua'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const prs = {};
    await Promise.all(prNumbers.map(async (prNumber) => {
        try {
            const response = await fetchImpl(`${apiBaseUrl}/repos/${owner}/${repoName}/pulls/${prNumber}`, { headers });
            if (!response || !response.ok) {
                return;
            }

            const data = await response.json();
            prs[String(prNumber)] = {
                number: data.number,
                title: data.title || null,
                url: data.html_url || null,
                user: data.user && data.user.login ? data.user.login : null,
                labels: Array.isArray(data.labels) ? data.labels.map(label => label.name).filter(Boolean) : [],
                mergedAt: data.merged_at || null,
                state: data.state || null
            };
        } catch (error) {
            // 忽略富化失败，保持 release-notes 主流程可用
        }
    }));

    return normalizeGitHubMetadata({ prs });
}

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

function getCommitGitHubInfo(commit, githubMetadata) {
    if (!githubMetadata || !githubMetadata.prs) {
        return null;
    }

    const prNumber = extractPRNumbers(commit.subject || '')[0];
    if (!prNumber) {
        return null;
    }

    const pr = githubMetadata.prs[String(prNumber)];
    if (!pr) {
        return { prNumber };
    }

    return {
        prNumber: String(prNumber),
        prTitle: pr.title || null,
        prUrl: pr.url || null,
        labels: Array.isArray(pr.labels) ? pr.labels : [],
        authorLogin: pr.user || null,
        mergedAt: pr.mergedAt || null,
        state: pr.state || null
    };
}

function formatCommitLine(commit, options = {}) {
    const { repo = null, baseUrl = null, enrich = true, githubMetadata = null } = options;
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

        if (enrich) {
            const githubInfo = getCommitGitHubInfo(commit, githubMetadata);
            if (githubInfo && githubInfo.labels && githubInfo.labels.length > 0) {
                lineText += ` [\`${githubInfo.labels[0]}\`]`;
            }
            if (githubInfo && githubInfo.authorLogin) {
                lineText += ` [@${githubInfo.authorLogin}]`;
            }
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
    const enrich = options.enrich !== false;

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

    if (enrich && options.githubMetadata && options.githubMetadata.summary) {
        const { prCount = 0, labels = [], authors = [] } = options.githubMetadata.summary;
        if (prCount > 0) {
            lines.push(`> PRs: ${prCount}`);
        }
        if (labels.length > 0) {
            lines.push(`> Labels: ${labels.join(', ')}`);
        }
        if (authors.length > 0) {
            lines.push(`> PR Authors: ${authors.map(author => `@${author}`).join(', ')}`);
        }
    }

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

        lines.push(...uniqueCommits.map(c => formatCommitLine(c, { repo, baseUrl, enrich, githubMetadata: enrich ? options.githubMetadata : null })));
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

function buildGitHubReleasePayload(commits, options = {}) {
    const tagName = options.tagName || options.title || 'v1.0.0';
    const name = options.name || options.title || tagName;
    const appendix = options.body || '';
    const targetCommitish = options.targetCommitish || null;
    const draft = options.draft !== undefined ? options.draft : false;
    const prerelease = options.prerelease !== undefined ? options.prerelease : false;
    const repo = options.repo || null;
    const baseUrl = repo ? `https://github.com/${repo}` : null;
    const sections = groupCommits(commits);

    const formattedSections = [];
    for (const key of SECTION_ORDER) {
        if (key === 'breaking' || sections[key].length === 0) {
            continue;
        }

        const typeTitle = SECTION_TITLES[key];
        const lines = sections[key].map(c => {
            let line = `- ${c.description}`;
            if (c.scope) {
                line = `- **${c.scope}:** ${c.description}`;
            }
            if (baseUrl) {
                const commitLink = `${baseUrl}/commit/${c.hash}`;
                line += ` ([${c.shortHash}](${commitLink}))`;
                const prNumbers = extractPRNumbers(c.subject);
                for (const prNum of prNumbers.slice(0, 1)) {
                    const prLink = `${baseUrl}/pull/${prNum}`;
                    line += ` ([#${prNum}](${prLink}))`;
                }
                if (options.githubMetadata) {
                    const githubInfo = getCommitGitHubInfo(c, options.githubMetadata);
                    if (githubInfo && githubInfo.labels && githubInfo.labels.length > 0) {
                        line += ` [\`${githubInfo.labels[0]}\`]`;
                    }
                    if (githubInfo && githubInfo.authorLogin) {
                        line += ` [@${githubInfo.authorLogin}]`;
                    }
                }
            } else if (c.shortHash) {
                line += ` (${c.shortHash})`;
            }
            return line;
        });

        formattedSections.push(`### ${typeTitle}\n${lines.join('\n')}`);
    }

    if (sections.breaking.length > 0) {
        const breakingLines = sections.breaking.map(c => {
            let line = `- ${c.description}`;
            if (c.scope) {
                line = `- **${c.scope}:** ${c.description}`;
            }
            if (c.body && /BREAKING CHANGE:/i.test(c.body)) {
                const breakingBody = c.body
                    .split(/\r?\n/)
                    .map(part => part.trim())
                    .find(part => /^BREAKING CHANGE:/i.test(part));
                if (breakingBody) {
                    line += ` — ${breakingBody.replace(/^BREAKING CHANGE:\s*/i, '').trim()}`;
                }
            }
            if (baseUrl) {
                const commitLink = `${baseUrl}/commit/${c.hash}`;
                line += ` ([${c.shortHash}](${commitLink}))`;
            }
            return line;
        });
        formattedSections.push(`### ${SECTION_TITLES.breaking}\n${breakingLines.join('\n')}`);
    }

    const releaseBody = formattedSections.length > 0
        ? formattedSections.join('\n\n') + (appendix ? `\n\n${appendix}` : '')
        : appendix || 'No changes';

    return {
        tag_name: tagName,
        name: name,
        body: releaseBody,
        draft: draft,
        prerelease: prerelease,
        target_commitish: targetCommitish
    };
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
                authorEmail: c.authorEmail,
                github: getCommitGitHubInfo(c, options.githubMetadata)
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
        github: options.githubMetadata ? options.githubMetadata.summary : null,
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
            authorEmail: c.authorEmail,
            github: getCommitGitHubInfo(c, options.githubMetadata)
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
        repo,
        githubMetadata: options.githubMetadata || null
    });

    const tagName = options.tagName || options.title || null;
    const githubRelease = tagName
        ? buildGitHubReleasePayload(commits, {
            tagName: tagName,
            name: options.title,
            body: options.body || '',
            targetCommitish: options.targetCommitish || null,
            draft: options.draft || false,
            prerelease: options.prerelease || false,
            generatedAt: options.generatedAt,
            repo,
            githubMetadata: options.githubMetadata || null
        })
        : null;

    return {
        commits,
        markdown: buildReleaseNotes(commits, {
            title: options.title,
            generatedAt: options.generatedAt,
            range,
            repo,
            githubMetadata: options.githubMetadata || null,
            enrich: options.enrich
        }),
        repo,
        data,
        githubRelease
    };
}

async function generateReleaseNotesWithGitHub(range, options = {}) {
    let githubMetadata = normalizeGitHubMetadata(options.githubMetadata || null);
    const baseResult = generateReleaseNotes(range, {
        ...options,
        githubMetadata,
        enrich: options.enrich
    });

    if (!githubMetadata && options.enrichGitHub) {
        githubMetadata = await fetchGitHubMetadata(baseResult.repo || options.repo, {
            token: options.githubToken || null,
            commits: baseResult.commits,
            fetchImpl: options.fetchImpl,
            apiBaseUrl: options.githubApiBaseUrl,
            maxPulls: options.maxPulls
        });
    }

    if (!githubMetadata) {
        return baseResult;
    }

    return {
        commits: baseResult.commits,
        repo: baseResult.repo,
        markdown: buildReleaseNotes(baseResult.commits, {
            title: options.title,
            generatedAt: options.generatedAt,
            range,
            repo: baseResult.repo,
            githubMetadata,
            enrich: options.enrich
        }),
        data: buildReleaseNotesData(baseResult.commits, {
            title: options.title,
            generatedAt: options.generatedAt,
            range,
            repo: baseResult.repo,
            githubMetadata
        }),
        githubRelease: baseResult.githubRelease
            ? buildGitHubReleasePayload(baseResult.commits, {
                tagName: options.tagName || options.title || null,
                name: options.title,
                body: options.body || '',
                targetCommitish: options.targetCommitish || null,
                draft: options.draft || false,
                prerelease: options.prerelease || false,
                generatedAt: options.generatedAt,
                repo: baseResult.repo,
                githubMetadata
            })
            : null
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
    buildGitHubReleasePayload,
    fetchGitHubMetadata,
    getGitLog,
    getRemoteOrigin,
    generateReleaseNotes,
    generateReleaseNotesWithGitHub,
    formatCommitLine,
    getCommitGitHubInfo,
    extractPRNumbers,
    parseCompareRange,
    normalizeGitHubMetadata
};
