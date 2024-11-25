const { shutdown_general_timeout } = require('./utility/timeout/general_timeout.js');
const { shutdown_settings_prefix_timeout } = require('./utility/timeout/settings_prefix_timeout.js');
const { shutdown_sqlite_db } = require('./database/sqlite_db.js');

async function shutdown_cleanup(bot_client_instance) {
    await shutdown_general_timeout(bot_client_instance);
    await shutdown_settings_prefix_timeout(bot_client_instance);
    await shutdown_sqlite_db();
};

module.exports = { shutdown_cleanup };