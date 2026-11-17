import { Message, Events } from 'discord.js';
import { external_delete_check, timeout_delete } from '../utility/timeout/timeout.js';
import { isTextChannel } from '../global/types/other_types.js';
import { EventModule } from '../global/types/module.js';
import { create_delete_database } from '../features/create_game/interactions/button_cancel.js';
import { delete_game_database } from '../features/gameplay/game_state/global/result.js';

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
        if (exist_obj.timeout_type === 'create') {
            await create_delete_database(exist_obj.clientId);
        } else if (exist_obj.timeout_type === 'gameplay') {
            await delete_game_database(exist_obj.clientId);
        }
        try {
            await message.channel.send({ content: 'Deleting bot\'s message will cause the session terminate.', embeds: [], components: [] });
        } catch (e) {
            console.log(e);
        }
    }
}

export default messageDelete;