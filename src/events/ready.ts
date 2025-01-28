import { Events, Client } from 'discord.js';
import { sequelize } from '../database/sqlite_db.js';
import * as fs from 'fs';
import * as path from 'path';
import { isMyClient } from '../declare_type/type_guard.js';

export default {

    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {

        if (!isMyClient(client) || client.user === null) return;
        const dbFilePath: string = path.join(__dirname, '..', process.env.DBSTORAGE);

        await sequelize.authenticate().then(() => {
            console.log('Database connection established!');
        }).catch((error: string) => {
            throw new Error(`Unable to connect to the database: ${ error}`);
        })

        await sequelize.sync(/*{force: true}*/).then(() => {
            console.log('Database created in ready.js successfully!');
        }).catch((error: string) => {
            throw new Error(`Unable to create table: ${ error}`);
        })

        // Generate a timestamp for the backup file name
        const timestamp: number = Date.now();
        const backupFolderPath: string = process.env.DBBACKUPFOLDER;
        const backupFilePath: string = path.join(__dirname, '..', backupFolderPath, `backup_${timestamp}.sqlite`);
        try {
            if (!fs.existsSync(backupFolderPath)) {
                fs.mkdirSync(backupFolderPath, { recursive: true });
                console.log(`Backup folder created at ${backupFolderPath}`);
            }
            // Create a backup of the existing database file
            fs.copyFileSync(dbFilePath, backupFilePath);
            console.log(`Database backup created successfully at ${backupFilePath}`);
        } catch (error) {
            throw new Error(`Failed to create database backup: ${ error}`);
        }

        console.log(`Ready! Logged in as ${client.user.tag}`);
    }
}