// Require Sequelize
const Sequelize = require('sequelize');

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
        type: Sequelize.ENUM('eng', 'malay', 'schi', 'tchi', 'yue'),
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
        defaultValue: 'jw'
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

const GAME_CREATE = sequelize.define('GAME_CREATE', {
    clientId: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    status: {
        type: Sequelize.ENUM('create_initial', 'create_roles', 'create_final'),
        allowNull: false,
        defaultValue: 'create_initial'
    },
    num_players: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 6,
            max: 12
        }
    },
    sheriff: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
    },
    players_role: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
    },
},{
    freezeTableName: true,
    timestamps: false
});

const GAME_MATCH = sequelize.define('GAME_MATCH', {
    clientId: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    status: {
        type: Sequelize.ENUM('night', 'sheriff', 'hunter', 'day_ability', 'day_vote', 'result'),
        allowNull: false,
        defaultValue: 'night'
    },
    num_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    sheriff: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    num_players: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 6,
            max: 12
        }
    },
    consecutive_no_death: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 4
        }
    },
    players_role: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
    },
    players_info: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: []
    }
},{
    freezeTableName: true,
    timestamps: false
});

async function shutdown_sqlite_db()  {
    try {
        await COMMAND_COOLDOWN.truncate();
        await GAME_CREATE.truncate();
        await GAME_MATCH.truncate();
    } catch (err) {
        console.error(err);
    };
};


module.exports = { shutdown_sqlite_db, sequelize, USER_SETTINGS, SERVER_SETTINGS, COMMAND_COOLDOWN, GAME_CREATE, GAME_MATCH };