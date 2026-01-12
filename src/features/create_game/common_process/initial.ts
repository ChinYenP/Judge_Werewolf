import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { GameCreateInstance, GAME_CREATE } from '../../../global/sqlite_db.js';
import { ui_create_initial } from '../embed/initial.js';
import { t_error_code, t_game_rule } from '../../../global/types/list_str.js';

async function initial_common_process(clientId: string,
    change: {replace: 'num_player', value: number} |
    {replace: 'preset', value: boolean} |
    {replace: 'game_rule', value: t_game_rule} |
    {replace: 'none'}): Promise<{
        error: false,
        value: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>,
        ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
    } | {
        error: true,
        code: t_error_code
    }> {
    const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });
    let num_player_selected: number | null = null;
    let preset_selected: boolean | null = null;
    let game_rule_selected: t_game_rule | null = null;
    if (game_create !== null) {
        switch (change.replace) {
            case 'none':
                break;
            case 'num_player':
                const [affectedCountPlayer]: [number] = await GAME_CREATE.update({ num_players: change.value }, { where: { clientId: clientId } });
                if (affectedCountPlayer <= 0) {
                    return ({error: true, code: 'D3'});
                }
                num_player_selected = change.value;
                preset_selected = game_create.is_preset;
                game_rule_selected = game_create.game_rule;
                break;
            case 'preset':
                const [affectedCountPreset]: [number] = await GAME_CREATE.update({ is_preset: change.value }, { where: { clientId: clientId } });
                if (affectedCountPreset <= 0) {
                    return ({error: true, code: 'D3'});
                }
                num_player_selected = game_create.num_players;
                preset_selected = change.value;
                game_rule_selected = game_create.game_rule;
                break;
            case 'game_rule':
                const [affectedCountRule]: [number] = await GAME_CREATE.update({ game_rule: change.value }, { where: { clientId: clientId } });
                if (affectedCountRule <= 0) {
                    return ({error: true, code: 'D3'});
                }
                num_player_selected = game_create.num_players;
                preset_selected = game_create.is_preset;
                game_rule_selected = change.value;
                break;
        }
    } else {
        //Create new game
        try {
            await GAME_CREATE.create({
                clientId: clientId,
                status: 'initial',
                num_players: (change.replace === 'num_player') ? change.value : null,
                is_preset: (change.replace === 'preset') ? change.value : null,
                sheriff: null,
                players_role: null,
                game_rule: (change.replace === 'game_rule') ? change.value : null
            })
        }
        catch (error) {
            console.log(error);
            return ({error: true, code: 'D1'});
        }
        num_player_selected = (change.replace === 'num_player') ? change.value : null;
        preset_selected = (change.replace === 'preset') ? change.value : null;
        game_rule_selected = (change.replace === 'game_rule') ? change.value : null;
    }
    const [ActionRowArr, initialEmbed]: [[ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<StringSelectMenuBuilder>,
        ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], EmbedBuilder]
        = await ui_create_initial(clientId, num_player_selected, preset_selected, game_rule_selected);
    return ({error: false, value: [ActionRowArr, initialEmbed]});
}

export { initial_common_process };