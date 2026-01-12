import { EmbedBuilder } from 'discord.js';
import { CommandModule } from './module.js';

export interface helpStates {
    help: undefined
}
export interface pingStates {
    ping: undefined
}
export interface gameIdStates {
    game_id: undefined
}
export interface prefixStates {
    prefix: undefined
}
export interface settingsStates {
    user_settings: [EmbedBuilder, EmbedBuilder],
    prefix_confirmation: EmbedBuilder
}
export interface createStates {
    initial: EmbedBuilder,
    roles: EmbedBuilder,
    final: EmbedBuilder,
    createID: EmbedBuilder
}

type commandStates = helpStates | pingStates | gameIdStates | prefixStates | settingsStates | createStates;
type commandModules<T> = T extends object ? CommandModule<T> : never;
export type AllCommandModules = commandModules<commandStates>;