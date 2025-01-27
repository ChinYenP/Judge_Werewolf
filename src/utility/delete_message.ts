import { Message, Channel, TextChannel, Client } from 'discord.js';
import { isMyClient } from '../declare_type/type_guard.js';

async function delete_message(messageId: string, channelId: string, bot_client_instance: Client): Promise<void> {
    
    if (!isMyClient(bot_client_instance)) return;
    try {
        const channel: Channel | null = await bot_client_instance.channels.fetch(channelId);
        if (channel === null || !(channel instanceof TextChannel)) return;
        const message: Message | null = await channel.messages.fetch(messageId);
        if (message === null) return;
        await message.delete();
    } catch (error) {
        console.error(error);
    }
}

export { delete_message }