import { ActionRowBuilder, EmbedBuilder, Message, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import { InteractionModule } from "../../../../../global/types/module.js";
import { selectGameplayGuessRole } from "../../../../../global/types/interaction_states.js";
import { is_valid_interaction, timeout_delete, timeout_set } from "../../../../../utility/timeout/timeout.js";
import { ui_error_fatal, ui_error_non_fatal } from "../../../../../utility/embed/error.js";
import { get_display_text } from "../../../../../utility/get_display.js";
import { ui_guess } from "../../guess/ui.js";
import { GAME_MATCH, GameMatchInstance } from "../../../../../global/sqlite_db.js";
import { t_game_match_status, t_role_id } from "../../../../../global/types/other_types.js";
import { display_error_str, timeout_sec } from "../../../../../global/config.js";
import { t_error_code } from "../../../../../global/types/list_str.js";
import { game_result } from "../../global/result.js";

const button_game_guess_interaction: InteractionModule<StringSelectMenuInteraction, selectGameplayGuessRole> = {
    interaction_name: 'select_gameplay_guess_roles',
    states: {
        guess: {
            execute: async function (interaction: StringSelectMenuInteraction): Promise<void> {
                const clientId: string = interaction.user.id;
                
                const game_match: GameMatchInstance | null = await GAME_MATCH.findOne({ where: { clientId: clientId } });
                if (game_match === null || game_match.status.status !== 'guessing') {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D4');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                const gameUIObj: {action_rows: [ActionRowBuilder<StringSelectMenuBuilder>], embed: EmbedBuilder}
                    = await ui_guess(clientId, game_match.players_info.length, game_match.status.guesses, game_match.status.remaining_guesses);
                
                await interaction.update({embeds: [gameUIObj.embed], components: gameUIObj.action_rows});
                const update_msg: Message = await interaction.fetchReply();
                timeout_set('gameplay', update_msg.id, clientId, this.timeout_sec, this.timeout_execute, update_msg, undefined);
            },
            timeout: true,
            timeout_sec: timeout_sec.gameplay,
            timeout_execute: async function(reply_msg: Message, clientId: string, timeout_sec: number, nothing: undefined): Promise<void> {
                nothing;
                timeout_sec;
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
        },
        result: {
            execute: async function (interaction: StringSelectMenuInteraction): Promise<void> {
                const clientId: string = interaction.user.id;
                
                const game_match: GameMatchInstance | null = await GAME_MATCH.findOne({ where: { clientId: clientId } });
                if (game_match === null || game_match.status.status !== 'guessing') {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D4');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }

                //Now calculate scores
                let score: number = 0;
                let i: number = 0;
                for (const player_info of game_match.players_info) {
                    if (game_match.status.guesses[i] === undefined) {
                        console.error('game_match.status.guesses[i] is undefined, impossible case.');
                        const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                        await interaction.reply({embeds: [errorEmbed], components: []});
                        return;
                    }
                    if (game_match.status.guesses[i] === player_info.role_id) score++;
                    i++;
                }

                const gameUIObj: {error: true, code: t_error_code} |
                    {error: false, end: true, prevStateEmbed: EmbedBuilder | null, resultEmbed: EmbedBuilder}
                    = await game_result(clientId, 'guessed', null, score);
                if (gameUIObj.error) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, gameUIObj.code);
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }
                await interaction.update({ embeds: [gameUIObj.resultEmbed], components: [] });
                timeout_delete(clientId, 'gameplay');
            },
            timeout: false
        }
    },
    entry: async function(interaction: StringSelectMenuInteraction): Promise<void> {
        console.log('interaction run: button_gameplay_guess');
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

        const game_match: GameMatchInstance | null = await GAME_MATCH.findOne({ where: { clientId: clientId } });
        if (game_match === null || interaction.values[0] === undefined || game_match.status.status !== 'guessing') {
            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D4');
            await interaction.reply({embeds: [errorEmbed], components: []});
            return;
        }
        const guessed_role: t_role_id | undefined = game_match.status.remaining_guesses[Number(interaction.values[0])];
        if (guessed_role === undefined) {
            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D4');
            await interaction.reply({embeds: [errorEmbed], components: []});
            return;
        }

        let new_guesses: t_role_id[] = game_match.status.guesses;
        let new_remaining_guesses: t_role_id[] = game_match.status.remaining_guesses;
        new_guesses.push(guessed_role);
        new_remaining_guesses = new_remaining_guesses.toSpliced(Number(interaction.values[0]), 1);

        let new_status: t_game_match_status = {status: 'guessing', guesses: new_guesses, remaining_guesses: new_remaining_guesses};
        const [affectedCountPlayer]: [number] = await GAME_MATCH.update({ status: new_status }, { where: { clientId: clientId } });
        if (affectedCountPlayer <= 0) {
            const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D3');
            await interaction.reply({embeds: [errorEmbed], components: []});
            return;
        }

        if (new_remaining_guesses.length === 0) {
            await this.states.result.execute(interaction);
            return;
        }
        await this.states.guess.execute(interaction);
    }
}

export default button_game_guess_interaction;