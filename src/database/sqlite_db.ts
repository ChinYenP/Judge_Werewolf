// Require Sequelize
import { DataTypes, Sequelize, Model, InferAttributes, InferCreationAttributes } from 'sequelize';

//Connect Database: SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    logging: false,
    //logging: (msg) => console.log(msg),
    storage: process.env.DBSTORAGE,
});


interface UserSettingsInstance extends Model<InferAttributes<UserSettingsInstance>, InferCreationAttributes<UserSettingsInstance>> {
    clientId: string;
    lang: t_languages;
};
const USER_SETTINGS = sequelize.define<UserSettingsInstance>('USER_SETTINGS', {
    clientId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    lang: {
        type: DataTypes.ENUM('eng', 'malay', 'schi', 'tchi', 'yue'),
        allowNull: false,
        defaultValue: 'eng'
    }
},{
    freezeTableName: true,
    timestamps: false
});


interface ServerSettingsInstance extends Model<InferAttributes<ServerSettingsInstance>, InferCreationAttributes<ServerSettingsInstance>> {
    guildId: string;
    prefix: string;
};
const SERVER_SETTINGS = sequelize.define<ServerSettingsInstance>('SERVER_SETTINGS', {
    guildId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    prefix: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'jw'
    }
},{
    freezeTableName: true,
    timestamps: false
});


interface TempPrefixSettingInstance extends Model<InferAttributes<ServerSettingsInstance>, InferCreationAttributes<ServerSettingsInstance>> {
    guildId: string;
    prefix: string;
};
const TEMP_PREFIX_SETTINGS = sequelize.define<TempPrefixSettingInstance>('TEMP_PREFIX_SETTINGS', {
    guildId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    prefix: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'jw'
    }
},{
    freezeTableName: true,
    timestamps: false
});


interface CommandCooldownInstance extends Model<InferAttributes<CommandCooldownInstance>, InferCreationAttributes<CommandCooldownInstance>> {
    clientId: string;
    command: string;
    expired_date: bigint;
};
const COMMAND_COOLDOWN = sequelize.define<CommandCooldownInstance>('COMMAND_COOLDOWN', {
    clientId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    command: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    expired_date: {
        type: DataTypes.BIGINT,
        allowNull: false,
    }
},{
    freezeTableName: true,
    timestamps: false
});


interface GameCreateInstance extends Model<InferAttributes<GameCreateInstance>, InferCreationAttributes<GameCreateInstance>> {
    clientId: string;
    status: t_create_status;
    num_players: number | null;
    is_preset: boolean | null;
    sheriff: boolean | null;
    players_role: string[] | null;
    game_rule: t_game_rule | null;
};
const GAME_CREATE = sequelize.define<GameCreateInstance>('GAME_CREATE', {
    clientId: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    status: {
        type: DataTypes.ENUM('initial', 'roles', 'final'),
        allowNull: false,
        defaultValue: 'initial'
    },
    num_players: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 6,
            max: 12
        }
    },
    is_preset: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    sheriff: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    players_role: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    game_rule: {
        type: DataTypes.ENUM('kill_all', 'kill_either'),
        allowNull: true,
    }
},{
    freezeTableName: true,
    timestamps: false
});


interface GameMatchInstance extends Model<InferAttributes<GameMatchInstance>, InferCreationAttributes<GameMatchInstance>> {
    clientId: string;
    status: t_game_match_status;
    turn_order: t_game_match_status[];
    num_days: number;
    sheriff: boolean;
    num_players: number;
    consecutive_no_death: number;
    players_info: i_player_info[];
};
const GAME_MATCH = sequelize.define<GameMatchInstance>('GAME_MATCH', {
    clientId: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    status: {
        type: DataTypes.ENUM('night', 'sheriff', 'hunter', 'day_ability', 'day_vote', 'result'),
        allowNull: false,
        defaultValue: 'night'
    },
    turn_order: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    num_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    sheriff: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    num_players: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 6,
            max: 12
        }
    },
    consecutive_no_death: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 4
        }
    },
    players_info: {
        type: DataTypes.JSON,
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
        await TEMP_PREFIX_SETTINGS.truncate();
    } catch (err) {
        console.error(err);
    };
};

export { shutdown_sqlite_db, sequelize,
    UserSettingsInstance, USER_SETTINGS,
    ServerSettingsInstance, SERVER_SETTINGS,
    TempPrefixSettingInstance, TEMP_PREFIX_SETTINGS,
    CommandCooldownInstance, COMMAND_COOLDOWN,
    GameCreateInstance, GAME_CREATE,
    GameMatchInstance, GAME_MATCH };