const { Probot, LogLevel } = require('probot');
const { handlePullRequest } = require('./webhook');
require('dotenv').config();

const probot = new Probot({
    appId: process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
    webhookSecret: process.env.WEBHOOK_SECRET,
    logLevel: LogLevel.INFO,
});

probot.on('pull_request.opened', async (context) => {
    const { pull_request, repository } = context.payload;
    
    console.log(`Received PR #${pull_request.number} opened in ${repository.full_name}`);
    
    try {
        const comment = await handlePullRequest({
            type: 'pull_request',
            title: pull_request.title,
            body: pull_request.body || '',
            number: pull_request.number,
            sender: pull_request.user.login,
            owner: repository.owner.login,
            repo: repository.name,
            issueNumber: pull_request.number,
        }, context);
        
        if (comment) {
            console.log(`Comment posted to PR #${pull_request.number}: ${comment.substring(0, 50)}...`);
        }
    } catch (error) {
        console.error('Error handling PR:', error);
    }
});

probot.on('issues.opened', async (context) => {
    const { issue, repository } = context.payload;
    
    console.log(`Received Issue #${issue.number} opened in ${repository.full_name}`);
    
    try {
        const comment = await handlePullRequest({
            type: 'issue',
            title: issue.title,
            body: issue.body || '',
            number: issue.number,
            sender: issue.user.login,
            owner: repository.owner.login,
            repo: repository.name,
            issueNumber: issue.number,
        }, context);
        
        if (comment) {
            console.log(`Comment posted to Issue #${issue.number}: ${comment.substring(0, 50)}...`);
        }
    } catch (error) {
        console.error('Error handling Issue:', error);
    }
});

module.exports = (app) => {
    app.log.info('GitHub Saohua App loaded!');
};

if (require.main === module) {
    const port = process.env.PORT || 3000;
    probot.server?.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
