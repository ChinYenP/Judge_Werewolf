// Require the necessary discord.js classes
import 'dotenv/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Client, Interaction, Message, GatewayIntentBits } from 'discord.js';
import { EventModule, AllowedEventParam, isEventModule } from './global/types/module.js';

//Global variable: __dirname
global.__dirname = dirname(fileURLToPath(import.meta.url));

const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

//Event Handling
const eventsPath: string = path.join(__dirname, './events');
const eventFiles: string[] = fs.readdirSync(eventsPath).filter((file: string) => file.endsWith('.js'));

for (const file of eventFiles) {
    const fileUrl: string = new URL(`file://${path.join(eventsPath, file)}`).href;
    const eventUnknown: unknown = await import(fileUrl);
    if (isEventModule(eventUnknown)) {
        const event: EventModule<AllowedEventParam> = eventUnknown.default;
        if (event.once) {
            client.once(event.event_name, (...args: [Message | Interaction | Client]) => { void event.execute(...args).catch(console.error); });
        } else {
            client.on(event.event_name, (...args: [Message | Interaction]) => { void event.execute(...args).catch(console.error); });
        }
    } else {
        console.warn(`No default import found in file ${fileUrl}.`);
    }
}

// Graceful shutdown
import { shutdown_cleanup } from './utility/shutdown_cleanup.js';
async function shutdown(signal: string): Promise<void> {
    console.log(`${signal} received: shutting down gracefully...`);
    await shutdown_cleanup();
    await client.destroy(); // Close Discord connection
    process.exit(0); // Exit after cleanup
}

// Handle termination signals
process.on('SIGINT', () => { void shutdown('SIGINT').catch(console.error); });  // Ctrl + C
process.on('SIGTERM', () => { void shutdown('SIGTERM').catch(console.error); }); // System termination signal

// Log in to Discord with your client's token
await client.login(process.env.TOKEN);