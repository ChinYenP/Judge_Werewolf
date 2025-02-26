import { check_cooldown } from '../utility/cooldown.js';
import { get_display_text } from '../utility/get_display.js';
import { prefix_validation } from '../utility/validation/prefix_validation.js';
import { config } from '../text_data_config/config.js';
import { Message, EmbedBuilder } from 'discord.js';
import { ServerSettingsInstance, SERVER_SETTINGS } from '../database/sqlite_db.js';
import { isMyClient } from '../declare_type/type_guard.js';
import { ui_error_fatal } from '../common_ui/error.js';

export default {

    name: 'prefix',
    cooldown_sec: config['cooldown_sec'].prefix,
    async execute(message: Message, args: string[]): Promise<void> {
        console.log(`Prefix command ran, args: ${args.join(", ")}`);
        const clientId: string = message.author.id;

        if (!isMyClient(message.client)) return;
        if (!await check_cooldown(clientId, this.name, this.cooldown_sec, message.client, message)) {
            return;
        }

        let prefix: string = config['default_prefix'];
        if (message.guildId !== null) {
            const settings: ServerSettingsInstance | null = await SERVER_SETTINGS.findOne({ where: { guildId: message.guildId } });
            if (settings !== null) {
                //guildId exist
                prefix = settings.prefix;
            }
        }

        //Validate prefix
        if (!(await prefix_validation(prefix))) {
            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'C3');
            await message.reply({embeds: [errorEmbed], components: []});
        }

        const [title_text, current_prefix_text, default_prefix_text, instruction_text]: string[]
            = await get_display_text(['prefix.title', 'prefix.current_prefix', 'prefix.default_prefix', 'prefix.instruction'], clientId);
        
        const prefixEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(config['embed_hex_color'])
            .setTitle(title_text ?? config['display_error'])
            .addFields(
                {
                    name: current_prefix_text ?? config['display_error'],
                    value: prefix
                },
                {
                    name: default_prefix_text ?? config['display_error'],
                    value: 'jw'
                },
                {
                    name: '\u200b',
                    value: instruction_text ?? config['display_error']
                }
            )
            .setTimestamp()

            try {
                await message.reply({ embeds: [prefixEmbed] });
            } catch (error) {
                console.error(error);
                const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'M1');
                await message.reply({embeds: [errorEmbed], components: []});
            }
    }

}