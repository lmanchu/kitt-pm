const pool = require('./client');

const installationStore = {
  storeInstallation: async (installation) => {
    const { team, user, bot } = installation;
    const teamId = team.id;
    const teamName = team.name;
    const botToken = bot.token;
    const botUserId = bot.userId;

    const query = {
      text: `
        INSERT INTO workspaces (team_id, team_name, bot_token, bot_user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (team_id)
        DO UPDATE SET
          team_name = EXCLUDED.team_name,
          bot_token = EXCLUDED.bot_token,
          bot_user_id = EXCLUDED.bot_user_id,
          updated_at = NOW()
      `,
      values: [teamId, teamName, botToken, botUserId],
    };

    await pool.query(query);
    return;
  },
  fetchInstallation: async (query) => {
    const { teamId } = query;
    const result = await pool.query({
      text: 'SELECT * FROM workspaces WHERE team_id = $1',
      values: [teamId],
    });

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        team: { id: row.team_id, name: row.team_name },
        bot: {
          token: row.bot_token,
          userId: row.bot_user_id,
          scopes: [], // Bolt requires this, but we don't store it
        },
        user: { token: undefined, scopes: undefined, id: undefined },
      };
    }
    return undefined;
  },
  deleteInstallation: async (query) => {
    const { teamId } = query;
    await pool.query({
      text: 'DELETE FROM workspaces WHERE team_id = $1',
      values: [teamId],
    });
    return;
  },
};

module.exports = installationStore;
