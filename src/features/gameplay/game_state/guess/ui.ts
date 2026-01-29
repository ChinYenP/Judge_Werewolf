import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { get_display_text, get_game_text } from "../../../../utility/get_display.js";
import { display_error_str, embed_hex_color } from "../../../../global/config.js";
import { t_interaction_name } from "../../../../global/types/list_str.js";
import { t_role_id } from "../../../../global/types/other_types.js";

export async function ui_guess(clientId: string, num_player: number, guesses: t_role_id[], remaining_guesses: t_role_id[])
: Promise<{action_rows: [ActionRowBuilder<StringSelectMenuBuilder>], embed: EmbedBuilder}> {
    
    const [title_text, description_text, your_guesses_title_text, select_role_placeholder]: string[]
        = await get_display_text(['gameplay.guessing.embed.title', 'gameplay.guessing.embed.description', 'gameplay.guessing.embed.your_guesses', 'gameplay.guessing.select_role_placeholder'], clientId);

    const select_roles_arr: {label: string, description: string, value: string}[] = [];
    let i: number = 1;
    for (const role of remaining_guesses) {
        const role_name: string = await get_game_text(role, 'name', clientId);
        select_roles_arr.push({
            label: role_name,
            description: role_name,
            value: String(i - 1),
        });
        i++;
    }
    let your_guesses_description_text: string = '';
    i = 1;
    for (const role of guesses) {
        const role_name: string = await get_game_text(role, 'name', clientId);
        if (i !== 1) {
            your_guesses_description_text += '\n';
        }
        your_guesses_description_text += `${String(i)}: ${role_name}`;
        i++;
    }
    while (i <= num_player) {
        if (i !== 1) {
            your_guesses_description_text += '\n';
        }
        your_guesses_description_text += `${String(i)}: `;
        i++;
    }
    const actual_select_role_placeholder: string = `${select_role_placeholder} ${String(guesses.length + 1)}`;

    const rowSelectRoles: ActionRowBuilder<StringSelectMenuBuilder> = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_gameplay_guess_roles' satisfies t_interaction_name)
                .setPlaceholder(actual_select_role_placeholder ?? display_error_str)
                .addOptions(select_roles_arr)
        )
        
    const guessEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(embed_hex_color)
        .setTitle(title_text ?? display_error_str)
        .setDescription(description_text ?? display_error_str)
        .addFields(
            {
                name: your_guesses_title_text ?? display_error_str,
                value: your_guesses_description_text ?? display_error_str
            }
        )
        .setTimestamp()
        
    return ({action_rows: [rowSelectRoles], embed: guessEmbed});
}