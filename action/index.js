const core = require('@actions/core');
const path = require('path');

const lib = require('../lib/index.js');

const STYLE_MAP = {
  normal: 'love',
  professional: 'fo',
  casual: 'sao',
  poetic: 'chu',
  meme: 'zha'
};

const LANGUAGE_MAP = {
  zh: 'zh-CN',
  en: 'en',
  ja: 'en'
};

const VALID_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'build', 'revert', 'hotfix'];
const VALID_STYLES = ['normal', 'professional', 'casual', 'poetic', 'meme', 'random'];
const VALID_LANGUAGES = ['zh', 'en', 'ja'];

function mapLanguage(lang) {
  return LANGUAGE_MAP[lang] || 'zh-CN';
}

function mapStyle(style) {
  if (!style || style === 'random') {
    return null;
  }
  return STYLE_MAP[style] || null;
}

function detectType(commitMessage, diffContent) {
  if (commitMessage) {
    const lowerMsg = commitMessage.toLowerCase();
    for (const type of VALID_TYPES) {
      if (lowerMsg.includes(type)) {
        return type;
      }
    }
  }

  if (diffContent) {
    const keywords = {
      fix: ['fix', 'bug', 'issue', 'error', 'crash', 'resolve', 'patch'],
      feat: ['add', 'new', 'create', 'implement', 'feature', 'support'],
      docs: ['doc', 'readme', 'comment', 'guide'],
      refactor: ['refactor', 'restructure', 'reorganize'],
      test: ['test', 'spec', 'mock', 'suite'],
      chore: ['chore', 'update', 'upgrade', 'bump'],
      perf: ['perf', 'performance', 'optimize', 'speed'],
      ci: ['ci', 'pipeline', 'workflow', 'github action'],
      build: ['build', 'compile', 'bundle', 'webpack', 'vite']
    };

    const lowerDiff = diffContent.toLowerCase();
    for (const [type, words] of Object.entries(keywords)) {
      for (const word of words) {
        if (lowerDiff.includes(word)) {
          return type;
        }
      }
    }
  }

  return 'chore';
}

try {
  const inputType = core.getInput('type') || '';
  const inputStyle = core.getInput('style') || '';
  const inputLanguage = core.getInput('language') || 'zh';
  const commitMessage = core.getInput('commit-message') || '';

  let type = inputType.toLowerCase().trim();
  let style = inputStyle.toLowerCase().trim();
  let language = mapLanguage(inputLanguage.toLowerCase().trim());

  if (!VALID_LANGUAGES.includes(inputLanguage.toLowerCase().trim())) {
    core.warning(`Invalid language: ${inputLanguage}, using default: zh`);
    language = 'zh-CN';
  }

  const diffContent = process.env.GITHUB_DIFF || '';

  if (!type) {
    type = detectType(commitMessage, diffContent);
    core.info(`Auto-detected type: ${type}`);
  }

  if (!VALID_TYPES.includes(type)) {
    core.warning(`Invalid type: ${type}, using default: chore`);
    type = 'chore';
  }

  let actualStyle = mapStyle(style);
  let actualStyleName = style || 'random';

  if (!actualStyle) {
    const styles = ['love', 'sao', 'zha', 'chu', 'fo'];
    actualStyle = styles[Math.floor(Math.random() * styles.length)];
    actualStyleName = 'random';
  }

  let result;
  try {
    result = lib.generateByType(type, actualStyle, language);
  } catch (err) {
    core.warning(`generateByType failed: ${err.message}, trying random`);
    result = lib.generateRandom(language);
  }

  const outputMessage = result.fullMessage || `${type}: ${result.message}`;

  core.setOutput('commit-message', outputMessage);
  core.setOutput('type', result.type);
  core.setOutput('style', result.style);
  core.setOutput('language', result.language);

  console.log(`Generated commit message: ${outputMessage}`);
  console.log(`Type: ${result.type}, Style: ${result.style}, Language: ${result.language}`);

} catch (error) {
  core.setFailed(`Action failed: ${error.message}`);
}
