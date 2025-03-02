import { EmbedBuilder } from 'discord.js';
import { get_display_text, get_game_data } from '../utility/get_display.js';
import { config } from '../text_data_config/config.js';
import { t_role_id } from '../declare_type/type_guard.js';

async function ui_game_id(clientId: string, title: string, description: string, data: {
    'num_roles_max': number,
    'sheriff': boolean,
    'game_rule': t_game_rule,
    'roles_list': t_role_id[]}): Promise<EmbedBuilder> {

        const [max_num_player_text, sheriff_mode_title, game_rule_title, role_list_text]: string[]
        = await get_display_text([
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
            .setTitle(title)
            .setDescription(description)
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

    return (validEmbed);
}

export { ui_game_id }