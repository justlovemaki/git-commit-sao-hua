#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

function green(text) { return COLORS.green + text + COLORS.reset; }
function yellow(text) { return COLORS.yellow + text + COLORS.reset; }
function red(text) { return COLORS.red + text + COLORS.reset; }
function cyan(text) { return COLORS.cyan + text + COLORS.reset; }
function bold(text) { return COLORS.bold + text + COLORS.reset; }
function dim(text) { return COLORS.dim + text + COLORS.reset; }

const projectRoot = path.resolve(__dirname, '..');
const releasePath = path.join(projectRoot, 'RELEASE.json');

let releaseData = null;

function loadReleaseData() {
    try {
        if (fs.existsSync(releasePath)) {
            const content = fs.readFileSync(releasePath, 'utf8');
            releaseData = JSON.parse(content);
            return true;
        }
    } catch (e) {
        console.error(red('Failed to load RELEASE.json:'), e.message);
    }
    return false;
}

function checkModuleUsesVersionModule(filePath, moduleName) {
    const fullPath = path.join(projectRoot, filePath);
    try {
        if (!fs.existsSync(fullPath)) {
            return { passed: false, error: 'File not found' };
        }
        const content = fs.readFileSync(fullPath, 'utf8');
        const usesDynamic = content.includes(`${moduleName}.getVersion()`) || content.includes('versionModule') || content.includes('apiVersion');
        return { passed: usesDynamic, usesDynamic };
    } catch (e) {
        return { passed: false, error: e.message };
    }
}

function checkReadmeVersion() {
    const readmePath = path.join(projectRoot, 'README.md');
    try {
        if (!fs.existsSync(readmePath)) {
            return { passed: false, error: 'README.md not found' };
        }
        const content = fs.readFileSync(readmePath, 'utf8');
        const versionHeader = content.match(/### v(\d+\.\d+\.\d+)/);
        if (versionHeader) {
            const found = versionHeader[1];
            return { passed: found === releaseData.version, found, expected: releaseData.version };
        }
        return { passed: false, error: 'Version header not found in README' };
    } catch (e) {
        return { passed: false, error: e.message };
    }
}

function checkPackageJsonVersion(pkgJsonPath) {
    const fullPath = path.join(projectRoot, pkgJsonPath);
    try {
        if (!fs.existsSync(fullPath)) {
            return { found: null, passed: false, error: 'File not found' };
        }
        const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const version = json.version;
        const passed = version === releaseData.version;
        return { found: version, passed, expected: releaseData.version };
    } catch (e) {
        return { passed: false, error: e.message };
    }
}

function runDoctor() {
    console.log('');
    console.log(bold(cyan('═══════ Release Doctor ═══════')));
    console.log('');
    
    if (!loadReleaseData()) {
        console.log(red('✗ Failed to load RELEASE.json'));
        process.exit(1);
    }
    
    console.log(cyan('📋 Release Metadata:'));
    console.log(`  Version:      ${bold(releaseData.version)}`);
    console.log(`  Release Date:${dim(' ' + (releaseData.releaseDate || 'N/A'))}`);
    console.log(`  Latest:      ${dim(releaseData.channels?.latest || 'N/A')}`);
    console.log('');
    
    console.log(cyan('📦 Package Versions:'));
    const pkgVersions = releaseData.packages || {};
    for (const [key, pkg] of Object.entries(pkgVersions)) {
        console.log(`  ${key}: ${bold(pkg.version)} (${dim(pkg.name)})`);
    }
    console.log('');
    
    console.log(cyan('🔍 Consistency Checks:'));
    console.log('');
    
    let allPassed = true;
    
    console.log(cyan('  README.md:'));
    const readmeCheck = checkReadmeVersion();
    if (readmeCheck.passed) {
        console.log(`    ${green('✓')} Version header: v${readmeCheck.found}`);
    } else {
        console.log(`    ${red('✗')} ${readmeCheck.error || 'Found: ' + readmeCheck.found + ', Expected: ' + readmeCheck.expected}`);
        allPassed = false;
    }
    
    console.log(cyan('\n  API Health Endpoint:'));
    const healthCheck = checkModuleUsesVersionModule('api/server.js', 'versionModule');
    if (healthCheck.passed) {
        console.log(`    ${green('✓')} Uses dynamic version`);
    } else {
        console.log(`    ${red('✗')} ${healthCheck.error}`);
        allPassed = false;
    }
    
    console.log(cyan('\n  OpenAPI Spec:'));
    const openapiCheck = checkModuleUsesVersionModule('api/swagger.js', 'versionModule');
    if (openapiCheck.passed) {
        console.log(`    ${green('✓')} Uses dynamic version`);
    } else {
        console.log(`    ${red('✗')} ${openapiCheck.error}`);
        allPassed = false;
    }
    
    console.log(cyan('\n  CLI index.js:'));
    const cliCheck = checkModuleUsesVersionModule('cli/index.js', 'versionModule');
    if (cliCheck.passed) {
        console.log(`    ${green('✓')} Uses dynamic version`);
    } else {
        console.log(`    ${red('✗')} ${cliCheck.error}`);
        allPassed = false;
    }
    
    console.log(cyan('\n  lib/index.js:'));
    const libCheck = checkModuleUsesVersionModule('lib/index.js', 'versionModule');
    if (libCheck.passed) {
        console.log(`    ${green('✓')} Uses dynamic version`);
    } else {
        console.log(`    ${red('✗')} ${libCheck.error}`);
        allPassed = false;
    }
    
    console.log(cyan('\n  Package.json files:'));
    const pkgChecks = [
        checkPackageJsonVersion('cli/package.json'),
        checkPackageJsonVersion('api/package.json'),
        checkPackageJsonVersion('lib/package.json')
    ];
    const pkgPaths = ['cli/package.json', 'api/package.json', 'lib/package.json'];
    for (let i = 0; i < pkgChecks.length; i++) {
        const check = pkgChecks[i];
        const status = check.passed ? green('✓') : red('✗');
        console.log(`    ${status} ${pkgPaths[i]}: ${check.found || check.error}`);
        if (!check.passed) allPassed = false;
    }
    console.log('');
    
    console.log(bold('────────────────────────────────'));
    if (allPassed) {
        console.log(bold(green('✓ All version checks passed!')));
        console.log('');
        process.exit(0);
    } else {
        console.log(bold(red('✗ Some version checks failed.')));
        console.log('');
        console.log(dim('Tip: Update RELEASE.json version, then run:'));
        console.log(dim('  node bin/release-doctor.js'));
        console.log('');
        process.exit(1);
    }
}

runDoctor();