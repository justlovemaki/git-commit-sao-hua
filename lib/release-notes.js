const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTENT_TYPE_MAP = {
    '.zip': 'application/zip',
    '.tar': 'application/x-tar',
    '.gz': 'application/gzip',
    '.tgz': 'application/gzip',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.exe': 'application/x-msdownload',
    '.dmg': 'application/x-apple-diskimage',
    '.deb': 'application/x-debian-package',
    '.rpm': 'application/x-rpm',
    '.appimage': 'application/x-softarchive',
    '.war': 'application/x-webarchive',
    '.jar': 'application/java-archive',
    '.tar.gz': 'application/gzip',
    '.7z': 'application/x-7z-compressed',
    '.rar': 'application/x-rar-compressed',
    '.xz': 'application/x-xz',
    '.wasm': 'application/wasm',
    '.wasm.gz': 'application/wasm',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
    '.psd': 'image/vnd.adobe.photoshop',
    '.ai': 'application/illustrator',
    '.eps': 'application/postscript',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.css': 'text/css',
    '.csv': 'text/csv',
    '.md': 'text/markdown',
    '.yaml': 'application/x-yaml',
    '.yml': 'application/x-yaml',
    '.sh': 'application/x-sh',
    '.bash': 'application/x-sh',
    '.zsh': 'application/x-sh',
    '.bat': 'text/plain',
    '.ps1': 'text/plain',
    '.pem': 'application/x-pem-file',
    '.pub': 'application/x-pub-file'
};

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

function inferContentType(filePath) {
    if (!filePath || typeof filePath !== 'string') {
        return 'application/octet-stream';
    }
    const normalizedPath = filePath.toLowerCase();
    const compoundExt = Object.keys(CONTENT_TYPE_MAP)
        .filter(ext => ext.includes('.'))
        .sort((a, b) => b.length - a.length)
        .find(ext => normalizedPath.endsWith(ext));
    if (compoundExt) {
        return CONTENT_TYPE_MAP[compoundExt];
    }
    const ext = path.extname(normalizedPath);
    return CONTENT_TYPE_MAP[ext] || 'application/octet-stream';
}

function collectAssetMetadata(filePath, options = {}) {
    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(resolvedPath)) {
        return {
            success: false,
            error: `File not found: ${filePath}`
        };
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isFile()) {
        return {
            success: false,
            error: `Not a file: ${filePath}`
        };
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const name = path.basename(resolvedPath);
    const contentType = inferContentType(resolvedPath);

    return {
        success: true,
        name,
        path: resolvedPath,
        size: stat.size,
        sha256,
        contentType
    };
}

function collectAssetMetadataBatch(filePaths = []) {
    if (!Array.isArray(filePaths)) {
        return {
            success: false,
            error: 'filePaths must be an array'
        };
    }

    const assets = [];
    const errors = [];

    for (const filePath of filePaths) {
        const result = collectAssetMetadata(filePath);
        if (result.success) {
            assets.push({
                name: result.name,
                path: result.path,
                size: result.size,
                sha256: result.sha256,
                contentType: result.contentType
            });
        } else {
            errors.push({ filePath, error: result.error });
        }
    }

    return {
        success: errors.length === 0,
        assets,
        errors: errors.length > 0 ? errors : undefined
    };
}

function buildGitHubReleaseManifest(githubRelease, assets = []) {
    if (!githubRelease || typeof githubRelease !== 'object') {
        return {
            success: false,
            error: 'githubRelease is required'
        };
    }

    return {
        success: true,
        githubRelease,
        assets: assets.map(asset => ({
            name: asset.name,
            path: asset.path,
            size: asset.size,
            sha256: asset.sha256,
            contentType: asset.contentType
        }))
    };
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

function normalizeReleaseNotesForChangelog(releaseNotesMarkdown, versionTitle) {
    const rawLines = String(releaseNotesMarkdown || '').trim().split(/\r?\n/);
    const lines = rawLines.length > 0 ? rawLines : [];
    const normalized = [];

    for (const line of lines) {
        if (line.startsWith('# ')) {
            normalized.push(`## ${versionTitle || line.slice(2).trim()}`);
        } else {
            normalized.push(line);
        }
    }

    if (normalized.length === 0) {
        normalized.push(`## ${versionTitle || 'Release Notes'}`);
    }

    if (!normalized[0].startsWith('## ')) {
        normalized.unshift(`## ${versionTitle || 'Release Notes'}`);
    }

    return normalized.join('\n').trim();
}

function syncReleaseNotesToChangelog(releaseNotesMarkdown, options = {}) {
    const changelogPath = options.changelogPath || options.changelog || 'CHANGELOG.md';
    const versionTitle = options.versionTitle || options.title || 'Release Notes';
    const repoPath = options.repoPath || process.cwd();
    const filePath = path.isAbsolute(changelogPath) ? changelogPath : path.join(repoPath, changelogPath);
    const sectionHeader = `## ${versionTitle}`;
    let existingContent = '';
    let fileExisted = false;

    try {
        if (fs.existsSync(filePath)) {
            existingContent = fs.readFileSync(filePath, 'utf8');
            fileExisted = true;
        }
    } catch (e) {
        return {
            success: false,
            error: `无法读取 CHANGELOG: ${e.message}`
        };
    }

    const normalizedSection = normalizeReleaseNotesForChangelog(releaseNotesMarkdown, versionTitle);
    const sectionPattern = new RegExp(`(^## ${versionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n[\\s\\S]*?)(?=^## |\\Z)`, 'm');
    const hasMainHeading = /^#\s+Changelog\s*$/m.test(existingContent);
    const replaced = fileExisted && sectionPattern.test(existingContent);
    let newContent;

    if (!fileExisted) {
        newContent = `# Changelog\n\n${normalizedSection}\n`;
    } else if (replaced) {
        newContent = existingContent.replace(sectionPattern, `${normalizedSection}\n\n`).trimEnd() + '\n';
    } else if (hasMainHeading) {
        newContent = existingContent.replace(/^#\s+Changelog\s*\n*/m, `# Changelog\n\n${normalizedSection}\n\n`);
        newContent = newContent.trimEnd() + '\n';
    } else {
        newContent = `${normalizedSection}\n\n${existingContent.trim()}`.trim() + '\n';
    }

    try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        return {
            success: true,
            path: filePath,
            existed: fileExisted,
            replaced
        };
    } catch (e) {
        return {
            success: false,
            error: `写入 CHANGELOG 失败: ${e.message}`
        };
    }
}

async function createGitHubRelease(repo, releaseData, options = {}) {
    const {
        token = null,
        fetchImpl = globalThis.fetch,
        dryRun = false,
        apiBaseUrl = 'https://api.github.com',
        update = false
    } = options;

    if (!repo) {
        return {
            success: false,
            error: 'repo is required'
        };
    }

    if (!releaseData || !releaseData.tag_name) {
        return {
            success: false,
            error: 'releaseData with tag_name is required'
        };
    }

    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
        return {
            success: false,
            error: 'Invalid repo format. Use owner/repo'
        };
    }

    const tagName = releaseData.tag_name;
    if (dryRun) {
        return {
            success: true,
            dryRun: true,
            action: update ? 'update' : 'create',
            repo,
            release: {
                tagName,
                name: releaseData.name || releaseData.tag_name,
                body: releaseData.body || '',
                draft: releaseData.draft || false,
                prerelease: releaseData.prerelease || false,
                targetCommitish: releaseData.target_commitish || null
            },
            message: `[dry-run] Would ${update ? 'update' : 'create'} release ${tagName} for ${repo}`
        };
    }

    if (!fetchImpl) {
        return {
            success: false,
            error: 'fetchImpl is required'
        };
    }

    const headers = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'git-sao-hua',
        'X-GitHub-Api-Version': '2022-11-28'
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const releasesUrl = `${apiBaseUrl}/repos/${owner}/${repoName}/releases`;

    try {
        let releaseId = null;

        const lookupResponse = await fetchImpl(`${releasesUrl}/tags/${tagName}`, { headers });
        if (lookupResponse.ok) {
            const existingRelease = await lookupResponse.json();
            if (existingRelease && existingRelease.id) {
                releaseId = existingRelease.id;
            }
        } else if (lookupResponse.status !== 404) {
            const errorText = await lookupResponse.text();
            return {
                success: false,
                error: `Failed to check existing release: ${lookupResponse.status} ${errorText}`
            };
        }

        let method = 'POST';
        let url = releasesUrl;
        if (releaseId) {
            if (!update) {
                return {
                    success: false,
                    error: `Release ${tagName} already exists. Use --update to update it.`,
                    existingRelease: { id: releaseId, tag_name: tagName }
                };
            }
            method = 'PATCH';
            url = `${releasesUrl}/${releaseId}`;
        }

        const response = await fetchImpl(url, {
            method,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...releaseData })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `GitHub API error: ${response.status} ${errorText}`,
                status: response.status
            };
        }

        const result = await response.json();
        return {
            success: true,
            action: releaseId ? 'update' : 'create',
            repo,
            release: {
                id: result.id,
                tagName: result.tag_name,
                name: result.name,
                htmlUrl: result.html_url,
                uploadUrl: result.upload_url,
                draft: result.draft,
                prerelease: result.prerelease
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function uploadReleaseAsset(release, asset, options = {}) {
    const {
        token = null,
        fetchImpl = globalThis.fetch,
        dryRun = false
    } = options;

    if (!asset || !asset.name || !asset.path) {
        return {
            success: false,
            error: 'asset with name and path is required'
        };
    }

    const fs = require('fs');

    if (dryRun) {
        const exists = fs.existsSync(asset.path);
        const fileSize = exists ? fs.statSync(asset.path).size : (asset.size || null);
        return {
            success: true,
            dryRun: true,
            action: 'upload',
            releaseId: release ? release.id : null,
            asset: {
                name: asset.name,
                path: asset.path,
                size: fileSize,
                contentType: asset.contentType || 'application/octet-stream'
            },
            message: release
                ? `[dry-run] Would upload asset ${asset.name}${fileSize != null ? ` (${fileSize} bytes)` : ''} to release ${release.id}`
                : `[dry-run] Would upload asset ${asset.name}${fileSize != null ? ` (${fileSize} bytes)` : ''}`
        };
    }

    if (!release || !fetchImpl) {
        return {
            success: false,
            error: 'release and fetchImpl are required'
        };
    }

    if (!fs.existsSync(asset.path)) {
        return {
            success: false,
            error: `Asset file not found: ${asset.path}`
        };
    }

    const releaseId = release.id;
    const uploadUrl = release.uploadUrl || release.upload_url;
    if (!releaseId || !uploadUrl) {
        return {
            success: false,
            error: 'release.id and release.uploadUrl are required'
        };
    }

    const fileSize = fs.statSync(asset.path).size;
    const uploadUrlBase = uploadUrl.replace(/\{\?name,label\}/, '');
    const assetUploadUrl = `${uploadUrlBase}?name=${encodeURIComponent(asset.name)}`;

    const headers = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'git-sao-hua',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': asset.contentType || 'application/octet-stream',
        'Content-Length': String(fileSize)
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        const fileBuffer = fs.readFileSync(asset.path);
        const response = await fetchImpl(assetUploadUrl, {
            method: 'POST',
            headers,
            body: fileBuffer
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `GitHub API error: ${response.status} ${errorText}`,
                status: response.status
            };
        }

        const result = await response.json();
        return {
            success: true,
            action: 'upload',
            releaseId,
            asset: {
                id: result.id,
                name: result.name,
                size: result.size,
                browserDownloadUrl: result.browser_download_url
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function deleteExistingAsset(assetUrl, options = {}) {
    const {
        token = null,
        fetchImpl = globalThis.fetch,
        dryRun = false
    } = options;

    if (!assetUrl) {
        return {
            success: false,
            error: 'assetUrl is required'
        };
    }

    if (dryRun) {
        return {
            success: true,
            dryRun: true,
            action: 'delete',
            assetUrl,
            message: `[dry-run] Would delete asset ${assetUrl}`
        };
    }

    if (!fetchImpl) {
        return {
            success: false,
            error: 'fetchImpl is required'
        };
    }

    const headers = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'git-sao-hua',
        'X-GitHub-Api-Version': '2022-11-28'
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetchImpl(assetUrl, {
            method: 'DELETE',
            headers
        });

        if (!response.ok && response.status !== 204) {
            const errorText = await response.text();
            return {
                success: false,
                error: `GitHub API error: ${response.status} ${errorText}`,
                status: response.status
            };
        }

        return {
            success: true,
            action: 'delete',
            assetUrl
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
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
    normalizeGitHubMetadata,
    syncReleaseNotesToChangelog,
    inferContentType,
    collectAssetMetadata,
    collectAssetMetadataBatch,
    buildGitHubReleaseManifest,
    createGitHubRelease,
    uploadReleaseAsset,
    deleteExistingAsset
};
