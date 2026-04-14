const fs = require('fs');
const path = require('path');

let releaseData = null;

function getReleaseData() {
    if (releaseData) {
        return releaseData;
    }
    
    const releasePath = path.resolve(__dirname, '../RELEASE.json');
    try {
        if (fs.existsSync(releasePath)) {
            const content = fs.readFileSync(releasePath, 'utf8');
            releaseData = JSON.parse(content);
            return releaseData;
        }
    } catch (e) {
        console.error('[version] Failed to load RELEASE.json:', e.message);
    }
    
    return null;
}

function getVersion() {
    const data = getReleaseData();
    return data ? data.version : null;
}

function getPackageVersion(packageName) {
    const data = getReleaseData();
    if (data && data.packages) {
        for (const key of Object.keys(data.packages)) {
            const pkg = data.packages[key];
            if (pkg.name === packageName || key === packageName) {
                return pkg.version;
            }
        }
    }
    return null;
}

function getAllPackageVersions() {
    const data = getReleaseData();
    if (!data || !data.packages) {
        return {};
    }
    const result = {};
    for (const key of Object.keys(data.packages)) {
        result[key] = data.packages[key].version;
    }
    return result;
}

function getReleaseChannel(channel = 'latest') {
    const data = getReleaseData();
    if (data && data.channels) {
        return data.channels[channel] || null;
    }
    return null;
}

function getChecks() {
    const data = getReleaseData();
    return data ? data.checks : null;
}

function clearCache() {
    releaseData = null;
}

module.exports = {
    getReleaseData,
    getVersion,
    getPackageVersion,
    getAllPackageVersions,
    getReleaseChannel,
    getChecks,
    clearCache
};