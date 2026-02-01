import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Message, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import { selectGameplayDayVoteLynch } from "../../../../../global/types/interaction_states.js";
import { InteractionModule } from "../../../../../global/types/module.js";
import { is_valid_interaction, timeout_set } from "../../../../../utility/timeout/timeout.js";
import { get_display_text } from "../../../../../utility/get_display.js";
import { ui_error_fatal, ui_error_non_fatal } from "../../../../../utility/embed/error.js";
import { display_error_str, timeout_sec } from "../../../../../global/config.js";
import { GAME_MATCH, GameMatchInstance } from "../../../../../global/sqlite_db.js";
import { t_error_code } from "../../../../../global/types/list_str.js";
import { game_result } from "../../global/result.js";
import { t_game_match_status } from "../../../../../global/types/other_types.js";
import { ui_day } from "../ui.js";
import { ui_gameplay_info } from "../../global/info_ui.js";

const select_day_vote_lynch_interaction: InteractionModule<StringSelectMenuInteraction, selectGameplayDayVoteLynch> = {
    interaction_name: 'select_gameplay_day_vote_lynch',
    states: {
        day_vote: {
            execute: async function (interaction: StringSelectMenuInteraction): Promise<void> {
                const clientId: string = interaction.user.id;
                let game_match: GameMatchInstance | null = await GAME_MATCH.findOne({ where: { clientId: clientId } });
                if (game_match === null) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D4');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                if (interaction.values[0] === undefined || game_match.status.status !== 'day_vote') {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }

                const new_status: t_game_match_status = game_match.status;
                if (interaction.values[0] === 'null') {
                    new_status.lynch = null;
                } else {
                    new_status.lynch = Number(interaction.values[0]);
                }
                const [affectedCountPlayer]: [number] = await GAME_MATCH.update({ status: new_status }, { where: { clientId: clientId } });
                if (affectedCountPlayer <= 0) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }

                game_match = await GAME_MATCH.findOne({ where: { clientId: clientId } });
                if (game_match?.status.status !== 'day_vote') {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D4');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                const infoEmbed: EmbedBuilder = await ui_gameplay_info(clientId, game_match);
                const gameUIObj: {action_rows: [ActionRowBuilder<StringSelectMenuBuilder>, ActionRowBuilder<ButtonBuilder>], embed: EmbedBuilder}
                    = await ui_day(clientId, game_match.num_days, game_match.status.lynch, game_match.players_info);
                
                await interaction.update({embeds: [infoEmbed, gameUIObj.embed], components: gameUIObj.action_rows});
                const update_msg: Message = await interaction.fetchReply();
                timeout_set('gameplay', update_msg.id, clientId, this.timeout_sec, this.timeout_execute, update_msg, undefined);
            },
            timeout: true,
            timeout_sec: timeout_sec.gameplay,
            timeout_execute: async function(reply_msg: Message, clientId: string, _timeout_sec: number, _nothing: undefined): Promise<void> {
                const gameUIObj: {error: true, code: t_error_code} |
                    {error: false, end: true, prevStateEmbed: EmbedBuilder | null, resultEmbed: EmbedBuilder}
                    = await game_result(clientId, 'timeout', null);
                if (gameUIObj.error) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, gameUIObj.code);
                    await reply_msg.edit({embeds: [errorEmbed], components: []});
                    return;
                }
                await reply_msg.edit({ embeds: [gameUIObj.resultEmbed], components: [] });
            }
        }
    },
    entry: async function(interaction: StringSelectMenuInteraction): Promise<void> {
        console.log('interaction run: select_gameplay_day_vote_lynch');
        const clientId: string = interaction.user.id;
        const messageId: string = interaction.message.id;

        const interaction_check: {
            valid: true
        } | {
            valid: false,
            type: 'outdated' | 'not_owner'
        } = is_valid_interaction(messageId, clientId);

        if (!interaction_check.valid) {
            if (interaction_check.type === 'outdated') {
                const [outdated_interaction_text]: string[] = await get_display_text(['general.outdated_interaction'], clientId);
                const outdated_embed: EmbedBuilder = await ui_error_non_fatal(clientId, outdated_interaction_text ?? display_error_str);
                await interaction.update({embeds: [outdated_embed], components: []});
            }
            return;
        }
        await this.states.day_vote.execute(interaction);
    }
}

export default select_day_vote_lynch_interaction;