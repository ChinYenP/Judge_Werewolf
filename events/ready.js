const { Events } = require('discord.js');
const db = require('../database/sqlite_db.js');
const fs = require('fs');
const path = require('path');

module.exports = {

    name: Events.ClientReady,
    once: true,
    async execute(client) {

        const dbFilePath = path.join(__dirname, '..', process.env.DBSTORAGE);

        // Generate a timestamp for the backup file name
        const timestamp = Date.now();
        const backupFilename = `/database/db_backup/backup_${timestamp}.sqlite`;
        const backupFilePath = path.join(__dirname, '..', backupFilename);
        try {
            // Create a backup of the existing database file
            fs.copyFileSync(dbFilePath, backupFilePath);
            console.log(`Database backup created successfully at ${backupFilePath}`);
        } catch (error) {
            throw new Error(`Failed to create database backup: ${ error}`);
        };

        await db.sequelize.sync(/*{force: true}*/).then(() => {
            console.log('Database created in ready.js successfully!');
        }).catch((error) => {
            throw new Error(`Unable to create table: ${ error}`);
        });

        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};