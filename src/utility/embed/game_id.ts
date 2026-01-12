import { EmbedBuilder } from 'discord.js';
import { get_display_text, get_game_text, get_role_list_order } from '../get_display.js';
import { embed_hex_color, display_error_str } from '../../global/config.js';
import { t_game_rule } from '../../global/types/list_str.js';
import { t_role_id } from '../../global/types/other_types.js';

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
        if (data.sheriff) {
            [sheriff_desc_text] = await get_display_text(['game_id.valid_embed.sheriff_mode.enabled'], clientId);
        } else {
            [sheriff_desc_text] = await get_display_text(['game_id.valid_embed.sheriff_mode.disabled'], clientId);
        }
        if (data.game_rule === 'kill_all') {
            [game_rule_desc_text] = await get_display_text(['game_id.valid_embed.game_rule.kill_all'], clientId);
        } else {
            [game_rule_desc_text] = await get_display_text(['game_id.valid_embed.game_rule.kill_either'], clientId);
        }
    
        let role_list_content: string = '';
        let i: number = 1;
        const role_order: [t_role_id, number][] = get_role_list_order(data.roles_list);
        for (const [each_role_id, count] of role_order) {
            role_list_content += `${await get_game_text(each_role_id, 'name', clientId)} x${String(count)}`;
            if (i != role_order.length) {
                role_list_content += '\n';
            }
            i++;
        }
    
        const validEmbed: EmbedBuilder = new EmbedBuilder()
            .setColor(embed_hex_color)
            .setTitle(title)
            .setDescription(description)
            .addFields(
                {
                    name: max_num_player_text ?? display_error_str,
                    value: String(data.num_roles_max)
                },
                {
                    name: sheriff_mode_title ?? display_error_str,
                    value: sheriff_desc_text ?? display_error_str
                },
                {
                    name: game_rule_title ?? display_error_str,
                    value: game_rule_desc_text ?? display_error_str
                },
                {
                    name: role_list_text ?? display_error_str,
                    value: role_list_content
                }
            )
            .setTimestamp()

    return (validEmbed);
}

export { ui_game_id }