import { check_cooldown } from '../utility/cooldown.js';
import { get_display_text, get_game_data } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';
import { Message } from 'discord.js';
import { isMyClient, t_role_id } from '../declare_type/type_guard.js';
import { EmbedBuilder } from 'discord.js';
import { ui_error_fatal, ui_error_non_fatal } from '../common_ui/error.js';
import { ui_invalid_game_id } from '../common_ui/invalid_game_id.js';
import { game_id_validation } from '../utility/validation/game_id_validation.js';

export default {

    name: 'game_id',
    cooldown_sec: config['cooldown_sec'].game_id,
    async execute(message: Message, args: string[]): Promise<void> {
        console.log(`Game_id command ran, args: ${args.join(", ")}`);
        const clientId: string = message.author.id;

        if (!isMyClient(message.client)) return;
        if (!await check_cooldown(clientId, this.name, this.cooldown_sec, message.client, message)) {
            return;
        }

        //Check arguments
        if (args.length > 1) {
            //Too much arguments;
            const [much_args_text]: string[] = await get_display_text(['general.command_args_error.much_args'], clientId);
            const much_args_embed: EmbedBuilder = await ui_error_non_fatal(clientId, `settings ${much_args_text ?? config['display_error']}`);
            await message.reply({embeds: [much_args_embed], components: []});
            return;
        }
        if (args.length === 1) {
            const validate: [boolean, {} | {
                'num_roles_max': number,
                'sheriff': boolean,
                'game_rule': t_game_rule,
                'roles_list': t_role_id[]}] = await game_id_validation(args[0] ?? '');
            if (!(validate[0])) {
                const invalidEmbed: EmbedBuilder = await ui_invalid_game_id(clientId, args[0] ?? '');
                try {
                    await message.reply({ embeds: [invalidEmbed] });
                } catch (error) {
                    console.error(error);
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'M1');
                    await message.reply({embeds: [errorEmbed], components: []});
                }
            } else {
                await data_display(message, clientId, args[0] ?? '', validate[1] as {
                    'num_roles_max': number,
                    'sheriff': boolean,
                    'game_rule': t_game_rule,
                    'roles_list': t_role_id[]});
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
            .setColor(config['embed_hex_color'])
            .setTitle(title_text ?? config['display_error'])
            .setDescription(description_text ?? config['display_error'])
            .addFields(
                {
                    name: format_title_text ?? config['display_error'],
                    value: format_desc_text ?? config['display_error']
                },
                {
                    name: example_title_text ?? config['display_error'],
                    value: example_desc_text ?? config['display_error']
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
    }

}

async function data_display(message: Message, clientId: string, game_id: string, data: {
    'num_roles_max': number,
    'sheriff': boolean,
    'game_rule': t_game_rule,
    'roles_list': t_role_id[]}): Promise<void> {

    const [title_text, description_text, max_num_player_text, sheriff_mode_title, game_rule_title, role_list_text]: string[]
    = await get_display_text(['game_id.valid_embed.title', 'game_id.common_description',
        'game_id.valid_embed.max_num_player', 'game_id.valid_embed.sheriff_mode.title',
        'game_id.valid_embed.game_rule.title', 'game_id.valid_embed.role_list'
    ], clientId);

    let sheriff_desc_text: string | undefined;
    let game_rule_desc_text: string | undefined;
    if (data['sheriff']) {
        [sheriff_desc_text] = await get_display_text(['game_id.valid_embed.sheriff_mode.enabled'], clientId);
    } else {
        [sheriff_desc_text] = await get_display_text(['game_id.valid_embed.sheriff_mode.disabled'], clientId);
    }
    if (data['game_rule'] === 'kill_all') {
        [game_rule_desc_text] = await get_display_text(['game_id.valid_embed.game_rule.kill_all'], clientId);
    } else {
        [game_rule_desc_text] = await get_display_text(['game_id.valid_embed.game_rule.kill_either'], clientId);
    }

    let role_list_content: string = '';
    let i: number = 1;
    for (const each_roles_id of data['roles_list']) {
        role_list_content += `${String(i)}. ${await get_game_data(each_roles_id, 'name', clientId)}`;
        if (i != data['roles_list'].length) {
            role_list_content += '\n';
        }
        i++;
    }

    const validEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(title_text ?? config['display_error'])
        .setDescription(`${description_text}\`${game_id}\``)
        .addFields(
            {
                name: max_num_player_text ?? config['display_error'],
                value: String(data['num_roles_max'])
            },
            {
                name: sheriff_mode_title ?? config['display_error'],
                value: sheriff_desc_text ?? config['display_error']
            },
            {
                name: game_rule_title ?? config['display_error'],
                value: game_rule_desc_text ?? config['display_error']
            },
            {
                name: role_list_text ?? config['display_error'],
                value: role_list_content ?? config['display_error']
            }
        )
        .setTimestamp()

    try {
        await message.reply({ embeds: [validEmbed] });
    } catch (error) {
        console.error(error);
        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'M1');
        await message.reply({embeds: [errorEmbed], components: []});
    }
}