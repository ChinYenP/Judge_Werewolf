import { Client } from 'discord.js';
import { isMyClient } from '../../declare_type/type_guard.js';

//You should not fail this normally...
async function command_validation(command: string, bot_client_instance: Client): Promise<boolean> {
    if (!isMyClient(bot_client_instance)) return (false);
    if (command === 'overall') return (true);
    try {
        return (bot_client_instance.commands.has(command));
    } catch (error) {
        console.error(error);
        return (false);
    }
}

export { command_validation }