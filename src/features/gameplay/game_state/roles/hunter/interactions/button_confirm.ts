import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, Message, StringSelectMenuBuilder } from "discord.js";
import { buttonGameplayHunterConfirm } from "../../../../../../global/types/interaction_states.js";
import { InteractionModule } from "../../../../../../global/types/module.js";
import { is_valid_interaction, timeout_delete, timeout_set } from "../../../../../../utility/timeout/timeout.js";
import { get_display_text } from "../../../../../../utility/get_display.js";
import { ui_error_fatal, ui_error_non_fatal } from "../../../../../../utility/embed/error.js";
import { display_error_str, embed_hex_color, gameplay, timeout_sec } from "../../../../../../global/config.js";
import { GAME_MATCH, GameMatchInstance } from "../../../../../../global/sqlite_db.js";
import { t_error_code } from "../../../../../../global/types/list_str.js";
import { game_result } from "../../../global/result.js";
import { i_player_info } from "../../../../../../global/types/player_info.js";
import { game_next_state } from "../../../../game_logic/next_state.js";
import { get_last_word } from "../../../global/get_last_word.js";
import { randomise_array } from "../../../../../../utility/randomise_array.js";

const button_hunter_confirm_interaction: InteractionModule<ButtonInteraction, buttonGameplayHunterConfirm> = {
    interaction_name: 'button_gameplay_hunter_confirm',
    states: {
        next_state: {
            execute: async function (interaction: ButtonInteraction): Promise<void> {
                const clientId: string = interaction.user.id;
                const game_match: GameMatchInstance | null = await GAME_MATCH.findOne({ where: { clientId: clientId } });
                if (game_match === null) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D4');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                if (game_match.status.status !== 'hunter_day' && game_match.status.status !== 'hunter_night') {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }

                //Decide on shooting.
                const new_players_info: i_player_info[] = game_match.players_info;
                const target_index: number | null = game_match.status.target;
                const [hunter_phase_title, hunter_shot_message]: string[]
                    = await get_display_text(['gameplay.hunter.hunter_phase_title', 'gameplay.hunter.shot'], clientId);
                let new_consecutive_death: number = game_match.consecutive_no_death;
                let additional_info: string[] = [];
                //For now, only werewolves can kill at night (other than hunter).
                if (target_index !== null) {
                    if (new_players_info[target_index] === undefined) {
                        console.error('The shotted player must exist.');
                        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                        await interaction.reply({embeds: [errorEmbed], components: []});
                        return;
                    }
                    new_players_info[target_index].dead = true;
                    additional_info.push(`${hunter_shot_message ?? display_error_str} ${String(target_index + 1)}`);
                    new_consecutive_death = gameplay.consecutive_no_death;
                    if ((game_match.status.status === 'hunter_night' && game_match.num_days === 1) || game_match.status.status === 'hunter_day') {
                        const last_word_obj: {error: true, code: t_error_code} | {error: false, last_word: string}
                            = await get_last_word(clientId, new_players_info[target_index], target_index + 1);
                        if (last_word_obj.error) {
                            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, last_word_obj.code);
                            await interaction.reply({embeds: [errorEmbed], components: []});
                            return;
                        }
                        additional_info.push(last_word_obj.last_word);
                    }
                    //For now no chaining hunter :(
                }
                //Create the additional info message
                additional_info = randomise_array<string>(additional_info);
                let hunter_result_desc: string = '';
                const i: number = 0;
                for (const text of additional_info) {
                    hunter_result_desc += text;
                    if (i !== additional_info.length - 1) {
                        hunter_result_desc += '\n';
                    }
                }
                
                //Update database
                const [affectedCountPlayer]: [number] = await GAME_MATCH.update({
                    players_info: new_players_info,
                    consecutive_no_death: new_consecutive_death
                }, { where: { clientId: clientId } });
                if (affectedCountPlayer <= 0) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }

                //Create an embed for this night result.
                const hunterResultEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(embed_hex_color)
                    .setTitle(hunter_phase_title ?? display_error_str)
                    .setDescription(hunter_result_desc)
                    .setTimestamp()
                
                const gameUIObj: {error: true, code: t_error_code} |
                    {error: false, end: false, infoEmbed: EmbedBuilder, prevStateEmbed: EmbedBuilder | null, stateEmbed: EmbedBuilder, components: (ActionRowBuilder<StringSelectMenuBuilder> | ActionRowBuilder<ButtonBuilder>)[]} |
                    {error: false, end: true, prevStateEmbed: EmbedBuilder | null, resultEmbed: EmbedBuilder}
                    = await game_next_state(clientId, hunterResultEmbed);
                if (gameUIObj.error) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, gameUIObj.code);
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                if (gameUIObj.prevStateEmbed === null) {
                    console.error('Logically, prevState should exist since it is the hunterResultEmbed.');
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                if (gameUIObj.end) {
                    await interaction.update({embeds: [gameUIObj.prevStateEmbed], components: []});
                    await interaction.followUp({embeds: [gameUIObj.resultEmbed], components: []});
                    timeout_delete(clientId, 'gameplay');
                    return;
                }
                await interaction.update({embeds: [gameUIObj.prevStateEmbed], components: []});
                const update_msg: Message = await interaction.followUp({embeds: [gameUIObj.infoEmbed, gameUIObj.stateEmbed], components: gameUIObj.components});
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
    entry: async function(interaction: ButtonInteraction): Promise<void> {
        console.log('interaction run: button_gameplay_day_vote_confirm');
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
        await this.states.next_state.execute(interaction);
    }
}

export default button_hunter_confirm_interaction;