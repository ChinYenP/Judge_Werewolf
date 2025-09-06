import { StringSelectMenuInteraction, ButtonInteraction, EmbedBuilder } from 'discord.js';
import { InteractionModule } from './module.js';

export interface selectLangStates {
    user_settings: [EmbedBuilder, EmbedBuilder]
}

export interface buttonPrefixNoStates {
    prefix_no: undefined
}

export interface buttonPrefixYesStates {
    prefix_yes: undefined
}

type selectStates = selectLangStates;
type selectModules<T> = T extends object ? InteractionModule<StringSelectMenuInteraction, T> : never;
export type AllSelectModules = selectModules<selectStates>;

type buttonStates = buttonPrefixNoStates | buttonPrefixYesStates;
type buttonModules<T> = T extends object ? InteractionModule<ButtonInteraction, T> : never;
export type AllButtonModules = buttonModules<buttonStates>;