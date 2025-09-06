import { check_cooldown } from '../utility/cooldown/check_cooldown.js';
import { ui_cooldown } from '../utility/cooldown/embed.js';
import { get_display_text } from '../utility/get_display.js';
import { command_cooldown_sec, embed_hex_color, display_error_str } from '../global/config.js';
import { Message } from 'discord.js';
import { t_game_rule } from '../global/types/list_str.js';
import { gameIdStates } from '../global/types/command_states.js';
import { CommandModule } from '../global/types/module.js';
import { t_cooldown_status, t_role_id } from '../global/types/other_types.js';
import { EmbedBuilder } from 'discord.js';
import { ui_error_fatal, ui_error_non_fatal } from '../utility/embed/error.js';
import { ui_invalid_game_id } from '../utility/embed/invalid_game_id.js';
import { ui_game_id } from '../utility/embed/game_id.js';
import { game_id_validation } from '../utility/validation/game_id_validation.js';

const game_id_command: CommandModule<gameIdStates> = {

    command: 'game_id',
    states: {
        game_id: {
            cooldown_sec: command_cooldown_sec.game_id,
            execute: async function(message: Message, args: string[]): Promise<void> {
                const clientId: string = message.author.id;

                const cooldown_status: t_cooldown_status = await check_cooldown(clientId, 'game_id', this.cooldown_sec);
                if (cooldown_status.status == 'cooldown') {
                    message.reply({ embeds: [await ui_cooldown(clientId, cooldown_status.remaining_sec)] })
                    return;
                } else if (cooldown_status.status == 'fatal') {
                    message.reply({ embeds: [await ui_error_fatal(clientId, cooldown_status.error_code)] })
                    return;
                }

                //Check arguments
                if (args.length > 1) {
                    //Too much arguments;
                    const [much_args_text]: string[] = await get_display_text(['general.command_args_error.much_args'], clientId);
                    const much_args_embed: EmbedBuilder = await ui_error_non_fatal(clientId, `game_id ${much_args_text ?? display_error_str}`);
                    await message.reply({embeds: [much_args_embed], components: []});
                    return;
                }
                if (args.length === 1) {
                    const validate: [false, string] | [true, {
                    'num_roles_max': number,
                    'sheriff': boolean,
                    'game_rule': t_game_rule,
                    'roles_list': t_role_id[]}] = await game_id_validation(args[0] ?? '', clientId);
                    if (!(validate[0])) {
                        const invalidEmbed: EmbedBuilder = await ui_invalid_game_id(clientId, args[0] ?? '', validate[1]);
                        try {
                            await message.reply({ embeds: [invalidEmbed] });
                        } catch (error) {
                            console.error(error);
                            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'M1');
                            await message.reply({embeds: [errorEmbed], components: []});
                        }
                    } else {
                        await data_display(message, clientId, args[0] ?? '', validate[1]);
                    }
                    return;
                }

                //Game ID Info

                const [title_text, description_text, format_title_text, format_desc_text, example_title_text, example_desc_text]: string[]
                    = await get_display_text(['game_id.info_embed.title', 'game_id.info_embed.description',
                        'game_id.info_embed.format.title', 'game_id.info_embed.format.description',
                        'game_id.info_embed.example.title', 'game_id.info_embed.example.description'
                    ], clientId);

                const infoEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(embed_hex_color)
                    .setTitle(title_text ?? display_error_str)
                    .setDescription(description_text ?? display_error_str)
                    .addFields(
                        {
                            name: format_title_text ?? display_error_str,
                            value: format_desc_text ?? display_error_str
                        },
                        {
                            name: example_title_text ?? display_error_str,
                            value: example_desc_text ?? display_error_str
                        }
                    )
                    .setTimestamp()

                try {
                    await message.reply({ embeds: [infoEmbed] });
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
        console.log(`Game_id command ran, args: ${args.join(", ")}`);
        await this.states.game_id.execute(message, args);
    }
}

export default game_id_command;

async function data_display(message: Message, clientId: string, game_id: string, data: {
    'num_roles_max': number,
    'sheriff': boolean,
    'game_rule': t_game_rule,
    'roles_list': t_role_id[]}): Promise<void> {

    const [title_text, description_text]: string[]
    = await get_display_text(['game_id.valid_embed.title', 'game_id.common_description'], clientId);

    const validEmbed: EmbedBuilder = await ui_game_id(clientId, title_text ?? display_error_str,
        `${description_text}\`${game_id}\``, data);

    try {
        await message.reply({ embeds: [validEmbed] });
    } catch (error) {
        console.error(error);
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'M1');
        await message.reply({embeds: [errorEmbed], components: []});
    }
}