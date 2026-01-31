import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { get_display_text } from "../../../../../utility/get_display.js";
import { t_interaction_name } from "../../../../../global/types/list_str.js";
import { display_error_str, embed_hex_color } from "../../../../../global/config.js";
import { i_player_info } from "../../../../../global/types/player_info.js";
import { must_have_buttons } from "../../global/must_have_buttons.js";

export async function ui_hunter(clientId: string, num_days: number, target: number | null, players_info: i_player_info[])
: Promise<{action_rows: [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], embed: EmbedBuilder}> {
    
    const [title_text, description_text, select_target_placeholder, button_confirm_text, no_shoot_option]: string[]
        = await get_display_text(['gameplay.hunter.embed.title', 'gameplay.hunter.embed.description', 'gameplay.hunter.select_target', 'gameplay.hunter.button_confirm', 'gameplay.hunter.no_shoot_option'], clientId);

    const target_survived_arr: {label: string, description: string, value: string, default: boolean}[] = [];
    target_survived_arr.push({
        label: no_shoot_option ?? display_error_str,
        description: no_shoot_option ?? display_error_str,
        value: 'null',
        default: false
    });
    let i: number = 1;
    for (const player_info of players_info) {
        if (player_info.dead) {
            i++;
            continue;
        };
        target_survived_arr.push({
            label: String(i),
            description: select_target_placeholder ?? display_error_str,
            value: String(i - 1),
            default: (target !== null && i - 1 === target)
        });
        i++;
    }

    const rowTarget: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_gameplay_hunter_target' satisfies t_interaction_name)
                .setPlaceholder(select_target_placeholder ?? display_error_str)
                .addOptions(target_survived_arr)
        )

    const must_buttons: {cancel_button: ButtonBuilder, guess_button: ButtonBuilder} = await must_have_buttons(clientId);

    const confirm_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('button_gameplay_hunter_confirm' satisfies t_interaction_name)
        .setLabel(button_confirm_text ?? display_error_str)
        .setStyle(ButtonStyle.Success);
        
    const rowButton: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(must_buttons.cancel_button, must_buttons.guess_button, confirm_button);
    
    const dayVoteEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(`${title_text ?? display_error_str} ${String(num_days)}`)
        .setDescription(description_text ?? display_error_str)
        .setTimestamp()
        
    return ({action_rows: [rowTarget, rowButton], embed: dayVoteEmbed});
}