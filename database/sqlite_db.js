// Require Sequelize
const Sequelize = require('sequelize');
const myEmitter = require('../utility/emitter.js');

//Connect Database: SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    logging: false,
    //logging: (msg) => console.log(msg),
    storage: process.env.DBSTORAGE,
});


/*
 * equivalent to: CREATE TABLE USER_SETTINGS(
 * clientId VARCHAR(30) UNIQUE,
 * lang NOT NULL VARCHAR(255),
 * );
 */
const USER_SETTINGS = sequelize.define('USER_SETTINGS', {
    clientId: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    lang: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'eng'
    }
},{
    freezeTableName: true,
    timestamps: false
});


const SERVER_SETTINGS = sequelize.define('SERVER_SETTINGS', {
    guildId: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    prefix: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'bat'
    }
},{
    freezeTableName: true,
    timestamps: false
});


const COMMAND_COOLDOWN = sequelize.define('COMMAND_COOLDOWN', {
    clientId: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    command: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    expired_date: {
        type: Sequelize.BIGINT,
        allowNull: false,
    }
},{
    freezeTableName: true,
    timestamps: false
});

async function shutdown_sqlite_db()  {
    try {
        await COMMAND_COOLDOWN.truncate();
    } catch (err) {
        console.error(err);
    };
};


module.exports = { shutdown_sqlite_db, sequelize, USER_SETTINGS, SERVER_SETTINGS, COMMAND_COOLDOWN };