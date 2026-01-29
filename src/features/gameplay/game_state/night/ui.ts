import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { get_display_text } from "../../../../utility/get_display.js";
import { display_error_str, embed_hex_color } from "../../../../global/config.js";
import { i_player_info } from "../../../../global/types/player_info.js";
import { t_interaction_name } from "../../../../global/types/list_str.js";
import { must_have_buttons } from "../global/must_have_buttons.js";

export async function ui_night(clientId: string, num_days: number, num_ability: number, selecting: {
    target1: number | null,
    target2: number | null,
    ability: number | null
}, actions: {
    target1: number,
    target2: number,
    ability: number
}[], players_info: i_player_info[])
: Promise<{action_rows: (ActionRowBuilder<StringSelectMenuBuilder> | ActionRowBuilder<ButtonBuilder>)[], embed: EmbedBuilder}> {
    
    const [title_text, description_text, action_title_text, select_target_1_text, select_target_2_text,
        ability_num_text, delete_action_text, add_button_text, next_day_button_text]: string[]
        = await get_display_text(['gameplay.night.title', 'gameplay.night.description', 'gameplay.night.actions',
            'gameplay.night.select_target_1', 'gameplay.night.select_target_2',
            'gameplay.night.ability_num', 'gameplay.night.delete_action', 'gameplay.night.add_button',
            'gameplay.night.next_day_button'], clientId);

    const target1_survived_arr: {label: string, description: string, value: string, default: boolean}[] = [];
    const target2_survived_arr: {label: string, description: string, value: string, default: boolean}[] = [];
    let i: number = 1;
    for (const player_info of players_info) {
        if (player_info.dead) {
            i++;
            continue;
        };
        target1_survived_arr.push({
            label: String(i),
            description: String(i),
            value: String(i - 1),
            default: (selecting.target1 !== null && i - 1 === selecting.target1)
        });
        target2_survived_arr.push({
            label: String(i),
            description: String(i),
            value: String(i - 1),
            default: (selecting.target2 !== null && i - 1 === selecting.target2)
        });
        i++;
    }
    const num_abilities_arr: {label: string, description: string, value: string, default: boolean}[] = [];
    for (let j = 1; j <= num_ability; j++) {
        num_abilities_arr.push({
            label: String(j),
            description: String(j),
            value: String(j - 1),
            default: (selecting.ability !== null && j - 1 === selecting.ability)
        });
    }
    const action_arr: {label: string, description: string, value: string}[] = [];
    let action_description_text: string = '';
    i = 1;
    for (const action of actions) {
        action_arr.push({
            label: `${String(action.target1 + 1)} --${String(action.ability + 1)}-->${String(action.target2 + 1)}`,
            description: `${String(action.target1 + 1)} --${String(action.ability + 1)}-->${String(action.target2 + 1)}`,
            value: String(i - 1)
        })
        if (i !== 1) {
            action_description_text += '\n';
        }
        action_description_text += `${String(action.target1 + 1)} --${String(action.ability + 1)}->${String(action.target2 + 1)}`;
        i++;
    }

    const rowTarget1: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_gameplay_night_target1' satisfies t_interaction_name)
                .setPlaceholder(select_target_1_text ?? display_error_str)
                .addOptions(target1_survived_arr)
        )
    const rowTarget2: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_gameplay_night_target2' satisfies t_interaction_name)
                .setPlaceholder(select_target_2_text ?? display_error_str)
                .addOptions(target2_survived_arr)
        )
    const rowAbilityNum: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_gameplay_night_ability_num' satisfies t_interaction_name)
                .setPlaceholder(ability_num_text ?? display_error_str)
                .addOptions(num_abilities_arr)
        )
    
        
    const must_buttons: {cancel_button: ButtonBuilder, guess_button: ButtonBuilder} = await must_have_buttons(clientId);

    const add_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('button_gameplay_night_add' satisfies t_interaction_name)
        .setLabel(add_button_text ?? display_error_str)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(selecting.ability === null || selecting.target1 === null || selecting.target2 === null);

    const next_day_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('button_gameplay_night_next_day' satisfies t_interaction_name)
        .setLabel(next_day_button_text ?? display_error_str)
        .setStyle(ButtonStyle.Success);
        
    const rowButton: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(must_buttons.cancel_button, must_buttons.guess_button, add_button, next_day_button);
    
    const nightEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(`${title_text ?? display_error_str} ${String(num_days)}`)
        .setDescription(description_text ?? display_error_str)
        .addFields(
            {
                name: action_title_text ?? display_error_str,
                value: action_description_text ?? display_error_str
            }
        )
        .setTimestamp()
        
    if (action_arr.length !== 0) {
        const rowdeleteAction: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_gameplay_night_delete_action' satisfies t_interaction_name)
                    .setPlaceholder(delete_action_text ?? display_error_str)
                    .addOptions(action_arr)
            )
        return ({action_rows: [rowTarget1, rowAbilityNum, rowTarget2, rowdeleteAction, rowButton], embed: nightEmbed});
    }

    return ({action_rows: [rowTarget1, rowAbilityNum, rowTarget2, rowButton], embed: nightEmbed});
}