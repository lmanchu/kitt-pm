require('dotenv').config();

const name = 'ai-response';

const register = (app) => {
  app.event('app_mention', async ({ event, say }) => {
    // Placeholder response
    await say('AI response placeholder');
  });
};

module.exports = {
  name,
  register,
  config: {
    provider: process.env.AI_PROVIDER,
    model: process.env.AI_MODEL,
    apiKey: process.env.AI_API_KEY,
  },
};
