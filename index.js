// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();
// Require Sequelize
const db = require('./sqlite_db.js');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

//Create a cooldown checker (set)
//const talkedRecently = new Set();


try {
    db.sequelize.authenticate();
    console.log('Connection in index.js has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
};


client.commands = new Collection();

// Dynamically retrieve command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "name" or "execute" property.`);
    };
};


//Event Handling
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    };
};


// Log in to Discord with your client's token
client.login(process.env.TOKEN);


//Event emmitter:
const myEmitter = require('./emitter');

myEmitter.on('getWebsocketLatency', async (callback) => {
    const ws_latency_event = await client.ws.ping;
    callback(ws_latency_event);
});

myEmitter.on('getCommands', async (callback) => {
    callback(client.commands);
});

myEmitter.on('deleteMessage', async ({ channelId, messageId }) => {
    client.channels.fetch(channelId).then(channel => {
        channel.messages.fetch(messageId).then(message => {
            message.delete();
        }).catch(error => {
            console.error('Error fetching message:', error);
        });
    }).catch(error => {
        console.error('Error fetching channel:', error);
    });
});