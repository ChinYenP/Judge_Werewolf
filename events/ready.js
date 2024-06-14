const { events, Events } = require('discord.js');
const Sequelize = require('sequelize');
const db = require('../sqlite_db.js');
const fs = require('fs');
const path = require('path');

module.exports = {

    name: Events.ClientReady,
    once: true,
    async execute(client) {

        const dbFilePath = path.join(__dirname, '..', process.env.DBSTORAGE);
        let backupFilePath;

        // Generate a timestamp for the backup file name
        const timestamp = Date.now();
        const backupFilename = `db_backup/backup_${timestamp}.sqlite`;
        backupFilePath = path.join(__dirname, '..', backupFilename);
        try {
            // Create a backup of the existing database file
            fs.copyFileSync(dbFilePath, backupFilePath);
            console.log(`Database backup created successfully at ${backupFilePath}`);
        } catch (error) {
            console.error('Failed to create database backup: ', error);
        };

        await db.sequelize.sync( /*{force: true}*/ ).then(() => {
            console.log('Database created in ready.js successfully!');
        }).catch((error) => {
            console.error('Unable to create table: ' , error);
        });

        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};