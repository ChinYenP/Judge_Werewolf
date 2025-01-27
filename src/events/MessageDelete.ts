import { Message, Events } from 'discord.js';
import { general_is_outdated, timeouts_message_get_clientId, general_timeout_delete } from '../utility/timeout/general_timeout.js';
import { isTextChannel } from '../declare_type/type_guard.js';
import { TempPrefixSettingInstance, TEMP_PREFIX_SETTINGS } from '../database/sqlite_db.js'
import { get_display_error_code } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';

export default {
    name: Events.MessageDelete,
    once: false,
    async execute(message: Message): Promise<void> {
        if (message.author.id === message.client.user.id) {
            if (!isTextChannel(message.channel)) return;
            if (!(await general_is_outdated(message.id))) {
                await general_timeout_delete(message.id, await timeouts_message_get_clientId(message.id));
                await message.channel.send("Test: delete message solved.");

                if (message.guildId !== null) {
                    const settings: TempPrefixSettingInstance | null = await TEMP_PREFIX_SETTINGS.findOne({ where: { guildId: message.guildId } });
                    if (settings !== null) {
                        try {
                            await TEMP_PREFIX_SETTINGS.destroy({ where: { guildId: message.guildId } });
                        } catch (error) {
                            const display_arr: string[] = await get_display_error_code('D2', message.author.id);
                            if (display_arr.length !== 1) {
                                console.error('DSPY error at ./commands/settings.js, no17');
                                await message.reply({content: config['display_error'], components: []});
                                return;
                            }
                            console.error(`D3 error at ./commands/settings.js, no18`);
                            await message.reply({content: display_arr[0] ?? config['display_error'], components: []});
                            return;
                        }
                    }
                }

            }
        }
    }
}