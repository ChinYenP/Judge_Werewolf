const { shutdown_settings_general_timeout } = require('./utility/timeout/settings_general_timeout.js');
const { shutdown_settings_prefix_timeout } = require('./utility/timeout/settings_prefix_timeout.js');
const { shutdown_sqlite_db } = require('./database/sqlite_db.js');

async function shutdown_cleanup() {
    await shutdown_settings_general_timeout();
    await shutdown_settings_prefix_timeout();
    await shutdown_sqlite_db();
};

module.exports = { shutdown_cleanup };