require('dotenv').config();
const { App, ExpressReceiver } = require('@slack/bolt');
const installationStore = require('./db/installations');
const { loadSkills } = require('./skills/registry');

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  scopes: ['app_mentions:read', 'chat:write'],
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
  // This is a multi-tenant app, so we don't need a single token
  // token: process.env.SLACK_BOT_TOKEN,
  // signingSecret: process.env.SLACK_SIGNING_SECRET,
  installationStore,
});

// Load all skills
loadSkills(app);

(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`⚡️ KITT PM is running on port ${port}`);
})();

module.exports = { app };
