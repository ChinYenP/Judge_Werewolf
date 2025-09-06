const commands_list = ['create', 'help', 'ping', 'prefix', 'settings', 'game_id'] as const;
type t_commands = typeof commands_list[number];
function isCommand(query: string): query is t_commands {
    return (commands_list.includes(query as t_commands));
}

const command_cooldown_type_list = ['overall', 'create', 'help', 'ping', 'prefix', 'user_settings', 'settings_prefix', 'game_id', 'gameplay'] as const;
type t_command_cooldown_type = typeof command_cooldown_type_list[number];
function isCommandCooldownType(query: string): query is t_command_cooldown_type {
    return (command_cooldown_type_list.includes(query as t_command_cooldown_type));
}

const timeout_type_list = ['create', 'user_settings', 'settings_prefix', 'gameplay'] as const;
type t_timeout_type = typeof timeout_type_list[number];
function isTimeoutType(query: string): query is t_timeout_type {
    return (timeout_type_list.includes(query as t_timeout_type));
}

const game_match_status_list = ['night', 'sheriff', 'day_ability', 'day_vote', 'hunter'] as const;
type t_game_match_status = typeof game_match_status_list[number];
function isGameMatchStatus(query: string): query is t_game_match_status {
    return (game_match_status_list.includes(query as t_game_match_status));
}

const win_con_list = ['werewolf', 'village', 'tie', 'unknown', 'guessed'] as const;
type t_win_con = typeof win_con_list[number];
function isWinCon(query: string): query is t_win_con {
    return (win_con_list.includes(query as t_win_con));
}

const languages_list = ['eng', 'malay', 'schi', 'tchi', 'yue'] as const;
type t_languages = typeof languages_list[number];
function isLanguages(query: string): query is t_languages {
    return (languages_list.includes(query as t_languages));
}

const create_status_list = ['initial', 'roles', 'schi', 'final'] as const;
type t_create_status = typeof create_status_list[number];
function isCreateStatus(query: string): query is t_create_status {
    return (create_status_list.includes(query as t_create_status));
}

const game_rule_list = ['kill_all', 'kill_either'] as const;
type t_game_rule = typeof game_rule_list[number];
function isGameRule(query: string): query is t_game_rule {
    return (game_rule_list.includes(query as t_game_rule));
}

const error_code_list = ['O','D1','D2','D3','D4','D5','C1','C2','C3','C4','S','DSPY','M1','U'] as const;
type t_error_code = typeof error_code_list[number];
function isErrorCode(query: string): query is t_error_code {
    return (error_code_list.includes(query as t_error_code));
}

const interactions_name_list = ['select_settings_user_lang', 'button_settings_prefix_no',
    'button_settings_prefix_yes'
] as const;
type t_interaction_name = typeof interactions_name_list[number];
function isInteractionName(query: string): query is t_interaction_name {
    return (interactions_name_list.includes(query as t_interaction_name));
}

export {
    t_commands, isCommand, commands_list,
    t_command_cooldown_type, isCommandCooldownType, command_cooldown_type_list,
    t_timeout_type, isTimeoutType, timeout_type_list,
    t_game_match_status, isGameMatchStatus, game_match_status_list,
    t_win_con, isWinCon, win_con_list,
    t_languages, isLanguages, languages_list,
    t_create_status, isCreateStatus, create_status_list,
    t_game_rule, isGameRule, game_rule_list,
    t_error_code, isErrorCode, error_code_list,
    t_interaction_name, isInteractionName, interactions_name_list
}