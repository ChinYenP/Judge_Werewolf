type t_languages = 'eng' | 'malay' | 'schi' | 'tchi' | 'yue';
type t_commands = 'clean_all' | 'overall' | 'create' | 'help' | 'ping' | 'prefix' | 'settings' | 'settings_prefix' | 'game_id';
type t_create_status = 'initial' | 'roles' | 'final';
type t_game_match_status = 'night' | 'sheriff' | 'hunter' | 'day_ability' | 'day_vote' | 'result';
type t_game_rule = 'kill_all' | 'kill_either';
type t_win_con = 'werewolf' | 'village' | 'tie';


interface i_player_info {
    role_id: t_role_id;
    dead: boolean;
    sheriff: boolean;
    target: number[];
};