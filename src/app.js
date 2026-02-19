require('dotenv').config();
const { App, ExpressReceiver } = require('@slack/bolt');
const installationStore = require('./db/installations');
const { loadSkills } = require('./skills/registry');

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  scopes: [
    'app_mentions:read',
    'channels:history',
    'channels:read',
    'chat:write',
    'groups:history',
    'groups:read',
    'im:history',
    'im:read',
    'im:write',
    'users:read',
  ],
  installationStore,
  redirectUri: process.env.SLACK_REDIRECT_URI,
  installerOptions: {
    redirectUriPath: '/slack/oauth_redirect',
    redirectUriSuccess: process.env.SLACK_INSTALL_SUCCESS_URL,
    redirectUriFailure: process.env.SLACK_INSTALL_FAILURE_URL,
  },
});

const app = new App({
  receiver,
  installationStore,
});

// Static legal pages required for Slack Marketplace
receiver.router.get('/privacy', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KITT PM — Privacy Policy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; line-height: 1.6; }
    h1 { color: #0f0f0f; } h2 { color: #333; margin-top: 32px; }
    a { color: #1264A3; }
  </style>
</head>
<body>
  <h1>KITT PM Privacy Policy</h1>
  <p><em>Last updated: February 19, 2026</em></p>

  <h2>What We Collect</h2>
  <p>KITT PM collects only the information necessary to provide its AI PM assistant service:</p>
  <ul>
    <li><strong>Workspace information</strong>: Slack team ID and team name, stored when you install the app.</li>
    <li><strong>Message content</strong>: Text of messages that @mention KITT PM, sent to our AI model to generate a response. Messages are not stored after the response is delivered.</li>
    <li><strong>Bot tokens</strong>: OAuth tokens required to post messages on your workspace's behalf, stored securely in our database.</li>
  </ul>

  <h2>What We Do Not Collect</h2>
  <ul>
    <li>We do not read messages that do not @mention KITT PM.</li>
    <li>We do not store message history or conversation logs.</li>
    <li>We do not collect personal information beyond what Slack provides (user IDs).</li>
  </ul>

  <h2>How We Use Your Data</h2>
  <p>Data is used solely to operate KITT PM — processing your @mentions and returning AI-generated responses. We do not sell, share, or use your data for advertising.</p>

  <h2>AI Processing</h2>
  <p>Message content is sent to our AI gateway (magi.irisgo.xyz) which routes to AI model providers. No message content is retained beyond the duration of the API call.</p>

  <h2>Data Retention</h2>
  <p>Workspace installation records are retained until you uninstall the app. You can request deletion at any time by contacting us.</p>

  <h2>Uninstalling</h2>
  <p>Uninstalling KITT PM from your Slack workspace stops all data collection. To request deletion of your workspace record, email us at support@irisgo.ai.</p>

  <h2>Contact</h2>
  <p>Questions? Email <a href="mailto:support@irisgo.ai">support@irisgo.ai</a></p>
</body>
</html>`);
});

receiver.router.get('/terms', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KITT PM — Terms of Service</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; line-height: 1.6; }
    h1 { color: #0f0f0f; } h2 { color: #333; margin-top: 32px; }
    a { color: #1264A3; }
  </style>
</head>
<body>
  <h1>KITT PM Terms of Service</h1>
  <p><em>Last updated: February 19, 2026</em></p>

  <h2>Acceptance</h2>
  <p>By installing KITT PM on your Slack workspace, you agree to these Terms of Service.</p>

  <h2>Service Description</h2>
  <p>KITT PM is an AI-powered product management assistant for Slack. It responds to @mentions with AI-generated assistance for product decisions, roadmap planning, meeting summaries, and task tracking.</p>

  <h2>Acceptable Use</h2>
  <p>You agree not to use KITT PM to generate harmful, illegal, or abusive content. We reserve the right to suspend access for violations.</p>

  <h2>Service Availability</h2>
  <p>We aim for high availability but do not guarantee uptime. The service is provided "as is" without warranties of any kind.</p>

  <h2>Limitation of Liability</h2>
  <p>KITT PM provides AI-generated suggestions. Decisions based on KITT PM's output remain your responsibility. IrisGo is not liable for any decisions made based on KITT PM's responses.</p>

  <h2>Changes to Terms</h2>
  <p>We may update these Terms. Continued use after changes constitutes acceptance of the new Terms.</p>

  <h2>Contact</h2>
  <p>Questions? Email <a href="mailto:support@irisgo.ai">support@irisgo.ai</a></p>
</body>
</html>`);
});

// App Home welcome page
app.event('app_home_opened', async ({ event, client }) => {
  try {
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: 'Welcome to KITT PM 🤖', emoji: true },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Your AI product management co-pilot for Slack.*\n\nKITT PM helps your team ship better products — faster.',
            },
          },
          { type: 'divider' },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*How to use KITT PM:*\nMention @KITT PM in any channel and ask your product question.',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Example questions:*\n• "Summarize what we decided in today\'s standup"\n• "Help me write acceptance criteria for this feature"\n• "What should we prioritize this sprint?"\n• "Draft a product brief for user notifications"',
            },
          },
          { type: 'divider' },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: 'KITT PM is powered by <https://irisgo.ai|IrisGo AI> · <https://kitt.irisgo.xyz/privacy|Privacy Policy> · <https://kitt.irisgo.xyz/terms|Terms of Service>',
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error('[app_home] Error publishing home tab:', error.message);
  }
});

// Load all skills
loadSkills(app);

(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`⚡️ KITT PM is running on port ${port}`);
})();

module.exports = { app };
