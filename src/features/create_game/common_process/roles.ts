import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { GameCreateInstance, GAME_CREATE } from '../../../global/sqlite_db.js';
import { t_error_code } from '../../../global/types/list_str.js';
import { t_role_id } from '../../../global/types/other_types.js';
import { ui_create_roles } from '../embed/roles.js';

async function roles_common_process(clientId: string,
    change: {action: 'add_role', value: t_role_id} |
    {action: 'delete_role', value: number[]} |
    {action: 'none'} | {action: 'just_next'}): Promise<{
        error: false,
        value: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
            | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
            , EmbedBuilder]
    } | {
        error: true,
        code: t_error_code
    }> {
    const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
    if (game_create === null) {
        return ({error: true, code: 'D4'});
    }

    //Update first
    if (game_create.num_players === null || game_create.game_rule === null) {
        return ({error: true, code: 'U'});
    }
    let new_players_role: t_role_id[] = [];
    if (change.action === 'just_next') {
        const [affectedCount] = await GAME_CREATE.update({ sheriff: false }, { where: { clientId: clientId } });
        if (affectedCount <= 0) {
            return ({error: true, code: 'D3'});
        }
    } else {
        if (game_create.players_role === null) {
            return ({error: true, code: 'U'});
        }
        new_players_role = game_create.players_role;
        switch (change.action) {
            case ('none'):
                break;
            case ('add_role'):
                if (new_players_role.length < game_create.num_players) {
                    new_players_role.push(change.value);
                }
                break;
            case ('delete_role'):
                for (const number of change.value) {
                    if (Number.isNaN(number)) {
                        return ({error: true, code: 'U'});
                    }
                }
                const indicesToRemove: Set<number> = new Set<number>(change.value);
                new_players_role = new_players_role.filter((_, index) => !indicesToRemove.has(index));
                break;
        }
    }
    const [affectedCount] = await GAME_CREATE.update({ players_role: new_players_role }, { where: { clientId: clientId } });
    if (affectedCount <= 0) {
        return ({error: true, code: 'D3'});
    }
    const [ActionRowArr, rolesEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>]
        | [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
    = await ui_create_roles(clientId, game_create.num_players, new_players_role, game_create.game_rule);
    return ({error: false, value: [ActionRowArr, rolesEmbed]});
}

export { roles_common_process };