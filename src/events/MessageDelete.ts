import { Message, Events } from 'discord.js';
import { external_delete_check, timeout_delete } from '../utility/timeout/timeout.js';
import { isTextChannel } from '../global/types/other_types.js';
import { EventModule } from '../global/types/module.js';
/*import { TempPrefixSettingInstance, TEMP_PREFIX_SETTINGS } from '../database/sqlite_db.js'
import { get_display_error_code } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';*/

const messageDelete: EventModule<Message> = {
    event_name: Events.MessageDelete,
    once: false,
    async execute(message: Message): Promise<void> {
        if (message.author.id !== message.client.user.id) return;
        if (!isTextChannel(message.channel)) return;
        if (!(await external_delete_check(message.id))) return;
        await timeout_delete(message.id);
        await message.channel.send({ content: 'External deletion to the bot\'s message is detected!', embeds: [], components: [] });
    }
}

export default messageDelete;