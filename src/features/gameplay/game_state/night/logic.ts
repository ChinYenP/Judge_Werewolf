import { t_game_match_state } from "../../../../global/types/other_types.js";
import { i_player_info } from "../../../../global/types/player_info.js";
import { isWerewolfRoleId } from "../../../../global/types/other_types.js";
import { gameplay } from "../../../../global/config.js";

// These are the only things the UI needs to know to write the message
export type NightAdditionalMsg = 
    | { type: 'seer_check', isWerewolf: boolean }
    | { type: 'death', targetIndex: number }
    | { type: 'last_word', targetIndex: number }
    | { type: 'hunter_shot', shooterIndex: number, targetIndex: number }
    | { type: 'no_deaths' };

export interface NightResolutionResult {
    new_players_info: i_player_info[];
    new_turn_order: t_game_match_state[];
    new_consecutive_death: number;
    additional_msg: NightAdditionalMsg[];
}

export function resolve_night_phase(
    players_info: i_player_info[],
    actions: { target1: number; target2: number; ability: number }[],
    current_turn_order: t_game_match_state[],
    current_consecutive_death: number,
    num_days: number
): NightResolutionResult | 'error' {

    const new_players_info: i_player_info[] = JSON.parse(JSON.stringify(players_info));
    const new_turn_order: t_game_match_state[] = [...current_turn_order];
    let new_consecutive_death: number = current_consecutive_death;
    const additional_msg: NightAdditionalMsg[] = [];

    const target_from_to: Map<number, { ability: number, to: number }[]>
        = new Map<number, { ability: number, to: number }[]>();
    const werewolf_votes: number[] = [];
    const werewolf_touched: Set<number> = new Set<number>();
    const guard_protected: Set<number> = new Set<number>();
    let witch_saving: boolean = false;
    const witch_poison_target: number[] = [];
    const death_players: Set<number> = new Set<number>();

    // --- A. ORGANIZE ACTIONS ---
    for (const action of actions) {
        let ability: number = action.ability;
        const actor_index: number = action.target1;
        const target_index: number = action.target2;
        if (new_players_info[actor_index] === undefined || new_players_info[target_index] === undefined) return ('error');

        if (new_players_info[actor_index].extra_info.role_id === 'G02') {
            if (ability > 1) ability = 1;
            if (ability === 1 && !new_players_info[actor_index].extra_info.poison) ability = 0;
        } else {
            ability = 0;
        }

        //For now, there is only one target for each role.
        target_from_to.set(actor_index, [{ability: ability, to: target_index}]);
    }

    // Role logics
    for (const [actor_index, targets] of target_from_to) {
        const first_target: {ability: number, to: number} | undefined = targets[0];
        const actor: i_player_info | undefined = new_players_info[actor_index];
        if (first_target === undefined || actor === undefined) return ('error');
        const target: i_player_info | undefined = new_players_info[first_target.to];
        if (target === undefined) return ('error');

        // Mark all touched werewolves (1/2)
        for (const t of targets) {
            const to: i_player_info | undefined = new_players_info[t.to];
            if (to === undefined) return ('error');
            if (isWerewolfRoleId(to.role_id)) {
                werewolf_touched.add(t.to);
            }
        }

        // Seer Logic
        if (actor.role_id === 'G00' && actor_index !== first_target.to) {
            
            const is_werewolf: boolean = isWerewolfRoleId(target.role_id) && target.role_id !== 'W01';
            additional_msg.push({ type: 'seer_check', isWerewolf: is_werewolf });
        }

        // Witch Logic
        if (actor.extra_info.role_id === 'G02') {
            if (first_target.ability === 0 && actor.extra_info.heal) {
                witch_saving = true;
                actor.extra_info.heal = false;
            } else if (first_target.ability === 1 && actor.extra_info.poison) {
                witch_poison_target.push(first_target.to);
                actor.extra_info.poison = false;
            }
        }

        // Werewolf Voting
        // Mark all touched werewolves (2/2)
        if (isWerewolfRoleId(actor.role_id)) {
            werewolf_votes.push(first_target.to);
            werewolf_touched.add(actor_index);
        }

        // Guard Logic
        if (actor.extra_info.role_id === 'G03') {
            // Guard logic (prevent same target twice)
            if (actor.extra_info.prev_protect !== first_target.to) {
                guard_protected.add(first_target.to);
                actor.extra_info.prev_protect = first_target.to;
            } else {
                actor.extra_info.prev_protect = null;
            }
        }
    }

    // Fake Werewolf Actions
    for (const werewolf_index of werewolf_touched) {
        const actor: i_player_info | undefined = new_players_info[werewolf_index];
        if (actor === undefined || !isWerewolfRoleId(actor.extra_info.role_id) || !('act' in actor.extra_info)) return ('error');
        if (actor.extra_info.act === 'G00') {
            // Fake Seer Logic (Random)
            const is_werewolf: boolean = Math.random() > 0.5;
            additional_msg.push({ 
                type: 'seer_check', 
                isWerewolf: is_werewolf
            });
        }
    }

    // Death Resolution
    let anyDeath: boolean = false;

    // 1. Witch Poison
    for (const poison_target of witch_poison_target) {
        if (new_players_info[poison_target] === undefined) return ('error');
        new_players_info[poison_target].dead = true;
        anyDeath = true;
        if (!death_players.has(poison_target)) {
            additional_msg.push({ type: 'death', targetIndex: poison_target });
            if (num_days === 1) {
                additional_msg.push({ type: 'last_word', targetIndex: poison_target });
            }
            // Poisoned Hunter cannot shoot
            if (new_players_info[poison_target].extra_info.role_id === 'G01') {
                new_players_info[poison_target].extra_info.witch_poisoned = true;
            }
            death_players.add(poison_target);
        }
    }

    // 2. Werewolf Kill
    if (werewolf_votes.length > 0) {
        const kill_index: number = Math.floor(Math.random() * werewolf_votes.length);
        const victim_index: number | undefined = werewolf_votes[kill_index];
        if (victim_index === undefined) return ('error');
        const victim: i_player_info | undefined = new_players_info[victim_index];
        if (victim === undefined) return ('error');

        const is_saved_by_witch: boolean = witch_saving && victim.role_id !== 'G02';
        const is_guarded: boolean = guard_protected.has(victim_index);
        
        if ((!is_saved_by_witch && !is_guarded) || (is_saved_by_witch && is_guarded)) {
            victim.dead = true;
            anyDeath = true;
            if (!death_players.has(victim_index)) {
                additional_msg.push({ type: 'death', targetIndex: victim_index });
                if (new_players_info[victim_index] === undefined) return ('error');
                if (num_days === 1) {
                    additional_msg.push({ type: 'last_word', targetIndex: victim_index });
                }


                // Hunter Logic
                if (victim.extra_info.role_id === 'G01' && !victim.extra_info.witch_poisoned) {
                    const hunter_target: number | null = victim.extra_info.target;
                    if (hunter_target !== null && hunter_target !== victim_index) {
                        if (new_players_info[hunter_target] === undefined) return ('error');
                        new_players_info[hunter_target].dead = true;
                        if (!death_players.has(hunter_target)) {
                            additional_msg.push({ type: 'death', targetIndex: hunter_target });
                            additional_msg.push({ type: 'hunter_shot', shooterIndex: victim_index, targetIndex: hunter_target })
                            if (num_days === 1) {
                                additional_msg.push({ type: 'last_word', targetIndex: hunter_target });
                            }
                            death_players.add(hunter_target);
                        }
                    } else {
                        new_turn_order.push('hunter_night');
                    }
                }
                death_players.add(victim_index);
            }
        }
    }

    if (!anyDeath) {
        additional_msg.push({ type: 'no_deaths' });
        new_consecutive_death--;
    } else {
        new_consecutive_death = gameplay.consecutive_no_death; // Reset
    }

    new_turn_order.push('day_vote');

    return { new_players_info: new_players_info, new_turn_order: new_turn_order,
        new_consecutive_death: new_consecutive_death, additional_msg: additional_msg };
}