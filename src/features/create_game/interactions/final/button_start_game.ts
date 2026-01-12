import { delete_message, is_valid_interaction } from '../../../../utility/timeout/timeout.js';
import { get_display_text } from '../../../../utility/get_display.js';
import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { display_error_str } from '../../../../global/config.js';
import { GameCreateInstance, GAME_CREATE } from '../../../../global/sqlite_db.js';
import { ui_error_non_fatal, ui_error_fatal } from '../../../../utility/embed/error.js';
import { InteractionModule } from '../../../../global/types/module.js';
import { buttonCreateFinalStartGame } from '../../../../global/types/interaction_states.js';
import { win_condition_in_role } from '../../../gameplay/game_logic/win_condition.js';
import { isFakeRoleId, t_fake_role_id } from '../../../../global/types/other_types.js';

const button_start_game_interaction: InteractionModule<ButtonInteraction, buttonCreateFinalStartGame> = {
    interaction_name: 'button_create_cancel',
    states: {
        start_game: {
            execute: async function (interaction: ButtonInteraction): Promise<void> {
                const clientId: string = interaction.user.id;

                const game_create: GameCreateInstance | null = await GAME_CREATE.findOne({ where: { clientId: clientId } });

                if (game_create === null
                    || game_create.is_preset === null || game_create.num_players === null || game_create.game_rule === null
                    || game_create.sheriff === null || game_create.players_role?.length !== game_create.num_players
                    || win_condition_in_role(game_create.players_role, game_create.game_rule) !== 'unknown'
                ) {
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'U');
                    await interaction.update({embeds: [errorEmbed], components: []});
                    return;
                }

                await delete_message(clientId, 'create');

                const fake_role_list: t_fake_role_id[] = [];
                for (const each_role_id of game_create.players_role) {
                    if (isFakeRoleId(each_role_id) && !fake_role_list.includes(each_role_id)) {
                        fake_role_list.push(each_role_id);
                    }
                }

                // //Create game_match
                // try {
                //     await GAME_MATCH.create({
                //         clientId: clientId,
                //         status: 'night',
                //         turn_order: await start_turn_order(['night']),
                //         num_days: 0,
                //         sheriff: game_create.sheriff,
                //         game_rule: game_create.game_rule,
                //         consecutive_no_death: config["gameplay"]["consecutive_no_death"],
                //         num_ability: await start_num_ability(game_create.players_role),
                //         role_count: await get_role_list_order(game_create.players_role),
                //         fake_role_list: fake_role_list.sort(compareRoleId),
                //         players_info: await start_players_info(game_create.players_role, fake_role_list)
                //     })
                // }
                // catch (error) {
                //     console.log(error);
                //     const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D1');
                //     await interaction.update({embeds: [errorEmbed], components: []});
                //     return;
                // }

                //Destroy game_create
                try {
                    await GAME_CREATE.destroy({ where: { clientId: clientId } });
                } catch (error) {
                    console.error(error);
                    const errorEmbed: EmbedBuilder = await ui_error_fatal(clientId, 'D2');
                    await interaction.reply({embeds: [errorEmbed], components: []});
                    return;
                }

                // await game_next_state(clientId, interaction);

                await interaction.reply({content: 'To be continued...', embeds: [], components: []});
            },
            timeout: false
        }
    },
    entry: async function(interaction: ButtonInteraction): Promise<void> {
        console.log('interaction run: button_create_final_start_game');
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
        await this.states.start_game.execute(interaction);
    }
}

export default button_start_game_interaction;