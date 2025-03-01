import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { get_display_text, get_game_data } from '../../utility/get_display.js';
import { config } from '../../text_data_config/config.js';
import { t_role_id } from '../../declare_type/type_guard.js';
import { ui_timeout } from '../timeout.js';

async function ui_create_roles(clientId: string, time_sec: number, num_players_max: number, roles_list: t_role_id[])
: Promise<[[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
    | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder, EmbedBuilder]> {

    const [title_text, description_text, num_player_title, role_list_title, select_werewolf_text,
        select_village_team_text, select_delete_roles_text, timeout_text, button_next_text, button_cancel_text]: string[]
        = await get_display_text(['create.roles.embed.title', 'create.roles.embed.description',
            'create.roles.embed.num_player.title', 'create.roles.embed.role_list.title',
            'create.roles.select_werewolf', 'create.roles.select_village_team',
            'create.roles.select_delete_roles', 'create.timeout', 'create.button_next', 'create.button_cancel'
        ], clientId);

    let role_list_content: string = '';
    let delete_roles_arr: {label: string, description: string, value: string}[] = [];
    let i: number = 1;
    for (const each_roles_id of roles_list) {
        role_list_content += `${String(i)}. ${await get_game_data(each_roles_id, 'name', clientId)}`;
        delete_roles_arr.push({
            label: await get_game_data(each_roles_id, 'name', clientId),
            description: await get_game_data(each_roles_id, 'description', clientId),
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
                .setCustomId('create_roles_werewolf')
                .setPlaceholder(select_werewolf_text ?? config['display_error'])
                .addOptions(
                    {
                        label: await get_game_data('W00', 'name', clientId),
                        description: await get_game_data('W00', 'description', clientId),
                        value: 'W00'
                    }
                )
        )
    const rowVillageTeam = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('create_roles_village_team')
                .setPlaceholder(select_village_team_text ?? config['display_error'])
                .addOptions(
                    {
                        label: await get_game_data('V00', 'name', clientId),
                        description: await get_game_data('V00', 'description', clientId),
                        value: 'V00'
                    },
                    {
                        label: await get_game_data('G00', 'name', clientId),
                        description: await get_game_data('G00', 'description', clientId),
                        value: 'G00'
                    },
                    {
                        label: await get_game_data('G01', 'name', clientId),
                        description: await get_game_data('G01', 'description', clientId),
                        value: 'G01'
                    }
                )
        )

    const next_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('create_roles_next')
        .setLabel(button_next_text ?? config['display_error'])
        .setStyle(ButtonStyle.Success)

    const cancel_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('create_cancel')
        .setLabel(button_cancel_text ?? config['display_error'])
        .setStyle(ButtonStyle.Secondary)
        
    const rowButton: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(cancel_button, next_button);

    const rolesEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(config['embed_hex_color'])
        .setTitle(title_text ?? config['display_error'])
        .setDescription(description_text ?? config['display_error'])
        .addFields(
            {
                name: num_player_title ?? config['display_error'],
                value: `${roles_list.length} / ${num_players_max}`
            },
            {
                name: role_list_title ?? config['display_error'],
                value: role_list_content
            }
        )
        .setTimestamp()


    if (roles_list.length === 0) {
        return ([[rowWerewolf, rowVillageTeam, rowButton], rolesEmbed, (await ui_timeout(clientId, time_sec, timeout_text ?? config['display_error']))]);
    }

    const rowDeleteRole: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('create_roles_delete_roles')
                .setPlaceholder(select_delete_roles_text ?? config['display_error'])
                .addOptions(delete_roles_arr)
        )
    
    return ([[rowWerewolf, rowVillageTeam, rowDeleteRole, rowButton], rolesEmbed, (await ui_timeout(clientId, time_sec, timeout_text ?? config['display_error']))]);
}

export { ui_create_roles }