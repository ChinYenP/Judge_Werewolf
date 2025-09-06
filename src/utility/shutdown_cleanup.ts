import { shutdown_timeout } from './timeout/timeout.js';
import { shutdown_sqlite_db } from '../global/sqlite_db.js';

async function shutdown_cleanup(): Promise<void> {
    await shutdown_timeout();
    await shutdown_sqlite_db();
}

export { shutdown_cleanup }