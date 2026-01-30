import { Message, Events } from 'discord.js';
import { external_delete_check, timeout_delete } from '../utility/timeout/timeout.js';
import { isTextChannel } from '../global/types/other_types.js';
import { EventModule } from '../global/types/module.js';

const messageDelete: EventModule<Message> = {
    event_name: Events.MessageDelete,
    once: false,
    async execute(message: Message): Promise<void> {
        if (message.author.id !== message.client.user.id) return;
        if (!isTextChannel(message.channel)) return;
        const exist_obj: {
            exist: false;
        } | {
            exist: true;
            clientId: string;
            timeout_type: "create" | "user_settings" | "settings_prefix" | "gameplay";
        } = external_delete_check(message.id);
        if (!exist_obj.exist) return;
        timeout_delete(exist_obj.clientId, exist_obj.timeout_type);
        await message.channel.send({ content: 'External deletion to the bot\'s message is detected!', embeds: [], components: [] });
    }
}

export default messageDelete;