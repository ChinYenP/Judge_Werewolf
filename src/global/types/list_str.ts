// eslint-disable-next-line @typescript-eslint/typedef
export const commands_list = ['create', 'help', 'ping', 'prefix', 'settings', 'game_id'] as const;
export type t_commands = typeof commands_list[number];
export function isCommand(query: string): query is t_commands {
    return (commands_list.includes(query as t_commands));
}

// eslint-disable-next-line @typescript-eslint/typedef
export const command_cooldown_type_list = ['overall', 'create', 'help', 'ping', 'prefix', 'user_settings', 'settings_prefix', 'game_id', 'gameplay'] as const;
export type t_command_cooldown_type = typeof command_cooldown_type_list[number];
export function isCommandCooldownType(query: string): query is t_command_cooldown_type {
    return (command_cooldown_type_list.includes(query as t_command_cooldown_type));
}

// eslint-disable-next-line @typescript-eslint/typedef
export const timeout_type_list = ['create', 'user_settings', 'settings_prefix', 'gameplay'] as const;
export type t_timeout_type = typeof timeout_type_list[number];
export function isTimeoutType(query: string): query is t_timeout_type {
    return (timeout_type_list.includes(query as t_timeout_type));
}

// eslint-disable-next-line @typescript-eslint/typedef
export const win_con_list = ['werewolf', 'village', 'tie', 'unknown', 'guessed', 'timeout', 'cancel'] as const;
export type t_win_con = typeof win_con_list[number];
export function isWinCon(query: string): query is t_win_con {
    return (win_con_list.includes(query as t_win_con));
}

// eslint-disable-next-line @typescript-eslint/typedef
export const languages_list = ['eng', 'malay', 'schi', 'tchi', 'yue'] as const;
export type t_languages = typeof languages_list[number];
export function isLanguages(query: string): query is t_languages {
    return (languages_list.includes(query as t_languages));
}

// eslint-disable-next-line @typescript-eslint/typedef
export const create_status_list = ['initial', 'roles', 'final'] as const;
export type t_create_status = typeof create_status_list[number];
export function isCreateStatus(query: string): query is t_create_status {
    return (create_status_list.includes(query as t_create_status));
}

// eslint-disable-next-line @typescript-eslint/typedef
export const game_rule_list = ['kill_all', 'kill_either'] as const;
export type t_game_rule = typeof game_rule_list[number];
export function isGameRule(query: string): query is t_game_rule {
    return (game_rule_list.includes(query as t_game_rule));
}

// eslint-disable-next-line @typescript-eslint/typedef
export const num_player_list = ['6', '7', '8', '9', '10', '11', '12'] as const;
export type t_num_player = typeof num_player_list[number];
export function isNumPlayer(query: string): query is t_num_player {
    return (num_player_list.includes(query as t_num_player));
}

// eslint-disable-next-line @typescript-eslint/typedef
export const preset_custom_list = ['preset', 'custom'] as const;
export type t_preset_custom = typeof preset_custom_list[number];
export function isPresetCustom(query: string): query is t_preset_custom {
    return (preset_custom_list.includes(query as t_preset_custom));
}

// eslint-disable-next-line @typescript-eslint/typedef
export const error_code_list = ['O','D1','D2','D3','D4','D5','C1','C2','C3','C4','S','DSPY','M1','U'] as const;
export type t_error_code = typeof error_code_list[number];
export function isErrorCode(query: string): query is t_error_code {
    return (error_code_list.includes(query as t_error_code));
}

// eslint-disable-next-line @typescript-eslint/typedef
export const interactions_name_list = ['select_settings_user_lang', 'button_settings_prefix_no', 'button_settings_prefix_yes',
    'button_create_cancel', 'select_create_initial_num_player', 'select_create_initial_preset_custom', 'select_create_initial_game_rule', 'button_create_initial_next',
    'select_create_roles_werewolf', 'select_create_roles_village_team', 'button_create_roles_next', 'select_create_roles_delete_roles',
    'button_create_final_start_game', 'button_gameplay_cancel', 'button_gameplay_guess',
    'select_gameplay_guess_roles',
    'select_gameplay_night_target1', 'select_gameplay_night_target2', 'select_gameplay_night_ability_num', 'select_gameplay_night_delete_action', 'button_gameplay_night_add', 'button_gameplay_night_next_day',
    'select_gameplay_day_vote_lynch', 'button_gameplay_day_vote_confirm',
    'select_gameplay_hunter_target', 'button_gameplay_hunter_confirm'
] as const;
export type t_interaction_name = typeof interactions_name_list[number];
export function isInteractionName(query: string): query is t_interaction_name {
    return (interactions_name_list.includes(query as t_interaction_name));
}

// eslint-disable-next-line @typescript-eslint/typedef
export const gameplay_config_data = ['consecutive_no_death'] as const;
export type t_gameplay_config_data = typeof gameplay_config_data[number];