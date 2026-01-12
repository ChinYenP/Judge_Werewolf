import { Message, Interaction, Client, StringSelectMenuInteraction, ButtonInteraction } from 'discord.js';
import { t_commands, t_interaction_name } from './list_str.js';

interface CommandStateBase {
    cooldown_sec: number;
    execute: (message: Message, args: string[]) => Promise<void>;
}
type CommandTimeoutState<Tdatas> = CommandStateBase & {
    timeout: true;
    timeout_sec: number;
    timeout_execute: (reply_msg: Message, clientId: string, timeout_sec: number, data_passed: Tdatas) => Promise<void>;
};
type CommandNonTimeoutState = CommandStateBase & {
    timeout: false;
};
export type CommandSingleState<Tdatas = undefined> = CommandTimeoutState<Tdatas> | CommandNonTimeoutState;
export interface CommandModule<TStateData extends { [K in keyof TStateData]: unknown }> {
    command: t_commands;
    states: {
        [K in keyof TStateData as K extends string ? K : never]: CommandSingleState<TStateData[K]>;
    };
    entry: (message: Message, args: string[]) => Promise<void>;
}


export type AllowedInteraction = StringSelectMenuInteraction | ButtonInteraction;
interface InteractionStateBase<TInteraction> {
    execute: (interaction: TInteraction) => Promise<void>;
}
type InteractionTimeoutState<TInteraction, Tdatas> = InteractionStateBase<TInteraction> & {
    timeout: true;
    timeout_sec: number;
    timeout_execute: (reply_msg: Message, clientId: string, timeout_sec: number, data_passed: Tdatas) => Promise<void>;
};
type InteractionNonTimeoutState<TInteraction> = InteractionStateBase<TInteraction> & {
    timeout: false;
};
export type InteractionSingleState<TInteraction, Tdatas = undefined> = InteractionTimeoutState<TInteraction, Tdatas> | InteractionNonTimeoutState<TInteraction>;
export interface InteractionModule<TInteraction extends AllowedInteraction, TStateData extends { [K in keyof TStateData]: unknown }> {
    interaction_name: t_interaction_name;
    states: {
        [K in keyof TStateData as K extends string ? K : never]: InteractionSingleState<TInteraction, TStateData[K]>;
    };
    entry: (interaction: TInteraction) => Promise<void>;
}

export type AllowedEventParam = Message | Interaction | Client;
export interface EventModule<T extends AllowedEventParam> {
    event_name: string;
    once: boolean;
    execute: (content: T) => Promise<void>;
}
export function isEventModule(module: unknown): module is { default: EventModule<AllowedEventParam> } {
    if (module === null || module === undefined || typeof module !== 'object') {
        return (false);
    }
    const wrapper: Record<string, unknown> = module as Record<string, unknown>;
    if (!('default' in wrapper)) {
        return false;
    }
    const event: unknown = wrapper['default'];
    if (typeof event !== 'object' || event === null) {
        return false;
    }
    const eventObj: Record<string, unknown> = event as Record<string, unknown>;
    return (
        typeof eventObj['event_name'] === 'string' &&
        typeof eventObj['execute'] === 'function' &&
        typeof eventObj['once'] === 'boolean'
    );
}