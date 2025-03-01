import { check_cooldown } from '../utility/cooldown.js';
import { get_display_text } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';
import { Message } from 'discord.js';
import { isMyClient } from '../declare_type/type_guard.js';
import { EmbedBuilder } from 'discord.js';
import { ui_error_fatal } from '../common_ui/error.js';

export default {

    name: 'help',
    cooldown_sec: config['cooldown_sec'].help,
    async execute(message: Message, args: string[]): Promise<void> {
        console.log(`Help command ran, args: ${args.join(", ")}`);
        const clientId: string = message.author.id;

        if (!isMyClient(message.client)) return;
        if (!await check_cooldown(clientId, this.name, this.cooldown_sec, message.client, message)) {
            return;
        }

        const [optional_arguments_text, title_text, title_description_text, help_description_text,
            prefix_description_text, game_id_description_text, ping_description_text,
            settings_description_text, create_description_text, optional_ID_text]: string[]
            = await get_display_text(['help.optional_arguments', 'help.title', 'help.title_description', 'help.help_description',
            'help.prefix_description', 'help.game_id_description', 'help.ping_description',
            'help.settings_description', 'help.create_description', 'help.optional_ID'], clientId);

        const helpEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(config['embed_hex_color'])
            .setTitle(title_text ?? config['display_error'])
            .setDescription(title_description_text ?? config['display_error'])
            .addFields(
                {
                    name: 'jw help',
                    value: help_description_text ?? config['display_error']
                },
                {
                    name: 'jw prefix',
                    value: prefix_description_text ?? config['display_error']
                },
                {
                    name: `jw game_id <${optional_ID_text}>`,
                    value: game_id_description_text ?? config['display_error']
                },
                {
                    name: 'jw ping',
                    value: ping_description_text ?? config['display_error']
                },
                {
                    name: `jw settings <${optional_arguments_text}>`,
                    value: settings_description_text ?? config['display_error']
                },
                {
                    name: `jw create <${optional_ID_text}>`,
                    value: create_description_text ?? config['display_error']
                }
            )
            .setTimestamp()

        try {
            await message.reply({ embeds: [helpEmbed] });
        } catch (error) {
            console.error(error);
            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'M1');
            await message.reply({embeds: [errorEmbed], components: []});
        }
    }

}