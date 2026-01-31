import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { get_display_text } from "../../../../utility/get_display.js";
import { display_error_str, embed_hex_color } from "../../../../global/config.js";
import { i_player_info } from "../../../../global/types/player_info.js";
import { t_interaction_name } from "../../../../global/types/list_str.js";
import { must_have_buttons } from "../global/must_have_buttons.js";

export async function ui_day(clientId: string, num_days: number, lynch: number | null, players_info: i_player_info[])
: Promise<{action_rows: [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], embed: EmbedBuilder}> {
    
    const [title_text, description_text, select_lynch_placeholder, button_confirm_text, no_lynch_option]: string[]
        = await get_display_text(['gameplay.day_vote.embed.title', 'gameplay.day_vote.embed.description',
            'gameplay.day_vote.select_lynch', 'gameplay.day_vote.button_confirm', 'gameplay.day_vote.no_lynch_option'], clientId);

    const lynch_survived_arr: {label: string, description: string, value: string, default: boolean}[] = [];
    lynch_survived_arr.push({
        label: no_lynch_option ?? display_error_str,
        description: no_lynch_option ?? display_error_str,
        value: 'null',
        default: false
    });
    let i: number = 1;
    for (const player_info of players_info) {
        if (player_info.dead) {
            i++;
            continue;
        };
        lynch_survived_arr.push({
            label: String(i),
            description: select_lynch_placeholder ?? display_error_str,
            value: String(i - 1),
            default: (lynch !== null && i - 1 === lynch)
        });
        i++;
    }

    const rowLynch: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_gameplay_day_vote_lynch' satisfies t_interaction_name)
                .setPlaceholder(select_lynch_placeholder ?? display_error_str)
                .addOptions(lynch_survived_arr)
        )

    const must_buttons: {cancel_button: ButtonBuilder, guess_button: ButtonBuilder} = await must_have_buttons(clientId);

    const confirm_button: ButtonBuilder = new ButtonBuilder()
        .setCustomId('button_gameplay_day_vote_confirm' satisfies t_interaction_name)
        .setLabel(button_confirm_text ?? display_error_str)
        .setStyle(ButtonStyle.Success);
        
    const rowButton: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(must_buttons.cancel_button, must_buttons.guess_button, confirm_button);
    
    const dayVoteEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(`${title_text ?? display_error_str} ${String(num_days)}`)
        .setDescription(description_text ?? display_error_str)
        .setTimestamp()
        
    return ({action_rows: [rowLynch, rowButton], embed: dayVoteEmbed});
}