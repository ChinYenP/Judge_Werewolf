console.trace('index.ts executed');

// Require the necessary discord.js classes
import * as dotenv from 'dotenv';
dotenv.config(); //Must be at very top!
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Client, Interaction, Message, GatewayIntentBits, Collection } from 'discord.js';

console.log(process.env.DBSTORAGE)

//Global variable: __dirname
global.__dirname = dirname(fileURLToPath(import.meta.url));
console.log(__dirname);

// Extend the Client class to include a `commands` property
class MyClient extends Client {
    commands: Collection<string, CommandModule>;
    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ]
        })
        this.commands = new Collection();
    }
}
export { MyClient }

// Now you can instantiate MyClient and it will recognize `commands`
const client: MyClient = new MyClient();


client.commands = new Collection();

// Dynamically retrieve command files
const commandsPath: string = path.join(__dirname, 'commands');
const commandFiles: string[] = (fs.readdirSync(commandsPath)).filter((file: string) => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath: string = path.join(commandsPath, file);
    const fileUrl: string = new URL(`file://${filePath}`).href;
    const command: CommandModule = (await import(fileUrl)).default;
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

//Event Handling
const eventsPath: string = path.join(__dirname, './events');
const eventFiles: string[] = fs.readdirSync(eventsPath).filter((file: string) => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath: string = path.join(eventsPath, file);
    const fileUrl: string = new URL(`file://${filePath}`).href;
    const event: EventModule = (await import(fileUrl)).default;
    if (event.once) {
        client.once(event.name, async (...args: [Message | Interaction | Client]) => await event.execute(...args));
    } else {
        client.on(event.name, async (...args: [Message | Interaction]) => await event.execute(...args));
    }
}

// Graceful shutdown
import { shutdown_cleanup } from './shutdown_cleanup.js';
async function shutdown(signal: string): Promise<void> {
    console.log(`${signal} received: shutting down gracefully...`);
    await shutdown_cleanup(client);
    await client.destroy(); // Close Discord connection
    process.exit(0); // Exit after cleanup
}

// Handle termination signals
process.on('SIGINT', async () => await shutdown('SIGINT'));  // Ctrl + C
process.on('SIGTERM', async () => await shutdown('SIGTERM')); // System termination signal

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
    console.error('Unhandled Exception:', err);
    await shutdown('uncaughtException');
})


// Log in to Discord with your client's token
client.login(process.env.TOKEN);