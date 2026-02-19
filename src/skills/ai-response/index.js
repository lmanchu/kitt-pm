require('dotenv').config();

const name = 'ai-response';

const SYSTEM_PROMPT = `You are KITT PM, an AI product management co-pilot for Slack teams.
You help teams with product decisions, roadmap planning, feature prioritization, meeting summaries, and task tracking.
Be concise, practical, and actionable. Keep responses under 300 words unless asked for detail.
Do not use markdown headers or bullet points with asterisks — plain text with line breaks works best in Slack.`;

async function callAI(userMessage) {
  const baseUrl = (process.env.CLIPROXY_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const url = `${baseUrl}/chat/completions`;

  const body = {
    model: process.env.AI_MODEL || 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${JSON.stringify(data)}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from AI');
  }
  return content;
}

const register = (app) => {
  app.event('app_mention', async ({ event, say }) => {
    const userMessage = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

    if (!userMessage) {
      await say({ text: 'Hi! How can I help with your product management today?', thread_ts: event.ts });
      return;
    }

    try {
      const reply = await callAI(userMessage);
      await say({ text: reply, thread_ts: event.ts });
    } catch (error) {
      console.error(`[ai-response] Error: ${error.message}`);
      await say({ text: '⚠️ Something went wrong. Please try again.', thread_ts: event.ts });
    }
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
