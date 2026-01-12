import { check_cooldown } from '../utility/cooldown/check_cooldown.js';
import { ui_cooldown } from '../utility/cooldown/embed.js';
import { get_display_text } from '../utility/get_display.js';
import { command_cooldown_sec, embed_hex_color, display_error_str } from '../global/config.js';
import { Message } from 'discord.js';
import { helpStates } from '../global/types/command_states.js';
import { CommandModule } from '../global/types/module.js';
import { t_cooldown_status } from '../global/types/other_types.js';
import { EmbedBuilder } from 'discord.js';
import { ui_error_fatal } from '../utility/embed/error.js';

const help_command: CommandModule<helpStates> = {
    command: 'help',
    states: {
        help: {
            cooldown_sec: command_cooldown_sec.help,
            execute: async function(message: Message, _args: string[]): Promise<void> {
                const clientId: string = message.author.id;

                const cooldown_status: t_cooldown_status = await check_cooldown(clientId, 'help', this.cooldown_sec);
                if (cooldown_status.status == 'cooldown') {
                    await message.reply({ embeds: [await ui_cooldown(clientId, cooldown_status.remaining_sec)], components: [] })
                    return;
                } else if (cooldown_status.status == 'fatal') {
                    await message.reply({ embeds: [await ui_error_fatal(clientId, cooldown_status.error_code)], components: [] })
                    return;
                }

                const [optional_arguments_text, title_text, title_description_text, help_description_text,
                    prefix_description_text, game_id_description_text, ping_description_text,
                    settings_description_text, create_description_text, optional_ID_text]: string[]
                    = await get_display_text(['help.optional_arguments', 'help.title', 'help.title_description', 'help.help_description',
                    'help.prefix_description', 'help.game_id_description', 'help.ping_description',
                    'help.settings_description', 'help.create_description', 'help.optional_ID'], clientId);

                const helpEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(embed_hex_color)
                    .setTitle(title_text ?? display_error_str)
                    .setDescription(title_description_text ?? display_error_str)
                    .addFields(
                        {
                            name: 'jw help',
                            value: help_description_text ?? display_error_str
                        },
                        {
                            name: 'jw prefix',
                            value: prefix_description_text ?? display_error_str
                        },
                        {
                            name: `jw game_id <${optional_ID_text ?? display_error_str}>`,
                            value: game_id_description_text ?? display_error_str
                        },
                        {
                            name: 'jw ping',
                            value: ping_description_text ?? display_error_str
                        },
                        {
                            name: `jw settings <${optional_arguments_text ?? display_error_str}>`,
                            value: settings_description_text ?? display_error_str
                        },
                        {
                            name: `jw create <${optional_ID_text ?? display_error_str}>`,
                            value: create_description_text ?? display_error_str
                        }
                    )
                    .setTimestamp()

                try {
                    await message.reply({ embeds: [helpEmbed], components: [] });
                } catch (error) {
                    console.error(error);
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'M1');
                    await message.reply({embeds: [errorEmbed], components: []});
                }
            },
            timeout: false
        }
    },
    entry: async function(message: Message, args: string[]): Promise<void> {
        console.log(`Help command ran, args: ${args.join(", ")}`);
        await this.states.help.execute(message, args);
    }
}

export default help_command;