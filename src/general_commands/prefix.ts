import { check_cooldown } from '../utility/cooldown/check_cooldown.js';
import { ui_cooldown } from '../utility/cooldown/embed.js';
import { get_display_text } from '../utility/get_display.js';
import { prefix_validation } from '../utility/validation/prefix_validation.js';
import { command_cooldown_sec, embed_hex_color, display_error_str, default_prefix } from '../global/config.js';
import { Message, EmbedBuilder } from 'discord.js';
import { ServerSettingsInstance, SERVER_SETTINGS } from '../global/sqlite_db.js';
import { prefixStates } from '../global/types/command_states.js';
import { CommandModule } from '../global/types/module.js';
import { t_cooldown_status } from '../global/types/other_types.js';
import { ui_error_fatal } from '../utility/embed/error.js';

const prefix_command: CommandModule<prefixStates> = {

    command: 'prefix',
    states: {
        prefix: {
            cooldown_sec: command_cooldown_sec.prefix,
            execute: async function(message: Message, args: string[]): Promise<void> {
                args.length; //Just to get through typescript warning compiler
                const clientId: string = message.author.id;

                const cooldown_status: t_cooldown_status = await check_cooldown(clientId, 'prefix', this.cooldown_sec);
                if (cooldown_status.status == 'cooldown') {
                    message.reply({ embeds: [await ui_cooldown(clientId, cooldown_status.remaining_sec)] })
                    return;
                } else if (cooldown_status.status == 'fatal') {
                    message.reply({ embeds: [await ui_error_fatal(clientId, cooldown_status.error_code)] })
                    return;
                }
                let prefix: string = default_prefix;
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
                    .setColor(embed_hex_color)
                    .setTitle(title_text ?? display_error_str)
                    .addFields(
                        {
                            name: current_prefix_text ?? display_error_str,
                            value: prefix
                        },
                        {
                            name: default_prefix_text ?? display_error_str,
                            value: 'jw'
                        },
                        {
                            name: '\u200b',
                            value: instruction_text ?? display_error_str
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
            },
            timeout: false
        }
    },
    entry: async function(message: Message, args: string[]): Promise<void> {
        console.log(`Prefix command ran, args: ${args.join(", ")}`);
        await this.states.prefix.execute(message, args);
    }
}

export default prefix_command;