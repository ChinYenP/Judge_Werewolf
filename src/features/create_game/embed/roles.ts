import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { get_display_text, get_game_text } from '../../../utility/get_display.js';
import { display_error_str, embed_hex_color } from '../../../global/config.js';
import { t_role_id } from '../../../global/types/other_types.js';
import { t_game_rule, t_interaction_name } from '../../../global/types/list_str.js';
import { win_condition_in_role } from '../../gameplay/game_logic/win_condition.js';

async function ui_create_roles(clientId: string, num_players_max: number, roles_list: t_role_id[], game_rule: t_game_rule)
: Promise<[[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
    | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]> {

    const [title_text, description_text, num_player_title, role_list_title, select_werewolf_text,
        select_village_team_text, select_delete_roles_text, button_next_text, button_cancel_text]: string[]
        = await get_display_text(['create.roles.embed.title', 'create.roles.embed.description',
            'create.roles.embed.num_player.title', 'create.roles.embed.role_list.title',
            'create.roles.select_werewolf', 'create.roles.select_village_team',
            'create.roles.select_delete_roles', 'create.button_next', 'create.button_cancel'
        ], clientId);

    let role_list_content: string = '';
    const delete_roles_arr: {label: string, description: string, value: string}[] = [];
    let i: number = 1;
    for (const each_roles_id of roles_list) {
        role_list_content += `${String(i)}. ${await get_game_text(each_roles_id, 'name', clientId)}`;
        delete_roles_arr.push({
            label: `${String(i)}. ${await get_game_text(each_roles_id, 'name', clientId)}`,
            description: await get_game_text(each_roles_id, 'description', clientId),
            value: String(i - 1)
        });
        if (i != roles_list.length) {
            role_list_content += '\n';
        }
        i++;
    }

    const rowWerewolf: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_create_roles_werewolf' satisfies t_interaction_name)
                .setPlaceholder(select_werewolf_text ?? display_error_str)
                .addOptions(
                    {
                        label: await get_game_text('W00', 'name', clientId),
                        description: await get_game_text('W00', 'description', clientId),
                        value: 'W00'
                    }
                )
        )
    const rowVillageTeam: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_create_roles_village_team' satisfies t_interaction_name)
                .setPlaceholder(select_village_team_text ?? display_error_str)
                .addOptions(
                    {
                        label: await get_game_text('V00', 'name', clientId),
                        description: await get_game_text('V00', 'description', clientId),
                        value: 'V00'
                    },
                    {
                        label: await get_game_text('G00', 'name', clientId),
                        description: await get_game_text('G00', 'description', clientId),
                        value: 'G00'
                    },
                    {
                        label: await get_game_text('G01', 'name', clientId),
                        description: await get_game_text('G01', 'description', clientId),
                        value: 'G01'
                    },
                    {
                        label: await get_game_text('G02', 'name', clientId),
                        description: await get_game_text('G02', 'description', clientId),
                        value: 'G02'
                    }
                )
        )

    const next_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('button_create_roles_next' satisfies t_interaction_name)
        .setLabel(button_next_text ?? display_error_str)
        .setStyle(ButtonStyle.Success)
        .setDisabled(roles_list.length !== num_players_max || win_condition_in_role(roles_list, game_rule) !== 'unknown');

    const cancel_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('button_create_cancel' satisfies t_interaction_name)
        .setLabel(button_cancel_text ?? display_error_str)
        .setStyle(ButtonStyle.Secondary)
        
    const rowButton: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(cancel_button, next_button);

    const rolesEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(title_text ?? display_error_str)
        .setDescription(description_text ?? display_error_str)
        .addFields(
            {
                name: num_player_title ?? display_error_str,
                value: `${String(roles_list.length)} / ${String(num_players_max)}`
            },
            {
                name: role_list_title ?? display_error_str,
                value: role_list_content
            }
        )
        .setTimestamp()


    if (roles_list.length === 0) {
        return ([[rowWerewolf, rowVillageTeam, rowButton], rolesEmbed]);
    }

    const rowDeleteRole: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_create_roles_delete_roles' satisfies t_interaction_name)
                .setPlaceholder(select_delete_roles_text ?? display_error_str)
                .addOptions(delete_roles_arr)
                .setMinValues(1)
			    .setMaxValues(roles_list.length)
        )
    
    return ([[rowWerewolf, rowVillageTeam, rowDeleteRole, rowButton], rolesEmbed]);
}

export { ui_create_roles }