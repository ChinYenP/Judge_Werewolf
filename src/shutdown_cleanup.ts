import { shutdown_timeout } from './utility/timeout.js';
import { shutdown_sqlite_db } from './database/sqlite_db.js';
import { Client } from 'discord.js';
import { isMyClient } from './declare_type/type_guard.js';

async function shutdown_cleanup(bot_client_instance: Client): Promise<void> {
    if (!isMyClient(bot_client_instance)) return;
    await shutdown_timeout(bot_client_instance);
    await shutdown_sqlite_db();
}

export { shutdown_cleanup }