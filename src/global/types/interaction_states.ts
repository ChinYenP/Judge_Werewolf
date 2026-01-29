import { StringSelectMenuInteraction, ButtonInteraction, EmbedBuilder } from 'discord.js';
import { InteractionModule } from './module.js';

//Insert the data to pass to timeout_execute. Otherwise, write undefined.
export interface selectLangStates {
    user_settings: [EmbedBuilder, EmbedBuilder]
}
export interface buttonPrefixNoStates {
    prefix_no: undefined
}
export interface buttonPrefixYesStates {
    prefix_yes: undefined
}

export interface selectCreateGameRule {
    initial: EmbedBuilder
}
export interface selectCreateNumPlayer {
    initial: EmbedBuilder
}
export interface selectCreatePresetCustom {
    initial: EmbedBuilder
}
export interface buttonCreateCancelStates {
    cancel: undefined
}
export interface buttonCreateInitialNext {
    initial: EmbedBuilder,
    roles: EmbedBuilder
}

export interface selectCreateAddRoleWerewolf {
    roles: EmbedBuilder
}
export interface selectCreateAddRoleVillage {
    roles: EmbedBuilder
}
export interface selectCreateDeleteRole {
    roles: EmbedBuilder
}
export interface buttonCreateRolesNext {
    roles: EmbedBuilder,
    final: EmbedBuilder
}

export interface buttonCreateFinalStartGame {
    start_game: undefined
}
export interface buttonGameplayCancel {
    cancel: undefined
}
export interface buttonGameplayGuess {
    guess: undefined
}

export interface selectGameplayGuessRole {
    guess: undefined,
    result: undefined
}

export interface selectGameplayNightTarget1 {
    night: undefined
}
export interface selectGameplayNightTarget2 {
    night: undefined
}
export interface selectGameplayNightAbilityNum {
    night: undefined
}
export interface selectGameplayNightDeleteAction {
    night: undefined
}
export interface buttonGameplayNightAdd {
    night: undefined
}
export interface buttonGameplayNightNextDay {
    next_state: undefined
}

export interface selectGameplayDayVoteLynch {
    day_vote: undefined
}
export interface buttonGameplayDayVoteConfirm {
    next_state: undefined
}

export interface selectGameplayHunterTarget {
    hunter: undefined
}
export interface buttonGameplayHunterConfirm {
    next_state: undefined
}

type selectStates = selectLangStates | selectCreateGameRule | selectCreateNumPlayer | selectCreatePresetCustom
    | selectCreateAddRoleVillage | selectCreateAddRoleWerewolf | selectCreateDeleteRole |
    selectGameplayNightTarget1 | selectGameplayNightTarget2 | selectGameplayNightAbilityNum | selectGameplayNightDeleteAction
    | selectGameplayDayVoteLynch | selectGameplayHunterTarget | selectGameplayGuessRole;
type selectModules<T> = T extends object ? InteractionModule<StringSelectMenuInteraction, T> : never;
export type AllSelectModules = selectModules<selectStates>;

type buttonStates = buttonPrefixNoStates | buttonPrefixYesStates
    | buttonCreateCancelStates | buttonCreateInitialNext | buttonCreateRolesNext | buttonCreateFinalStartGame
    | buttonGameplayCancel | buttonGameplayGuess | buttonGameplayNightAdd | buttonGameplayNightNextDay
    | buttonGameplayDayVoteConfirm | buttonGameplayHunterConfirm;
type buttonModules<T> = T extends object ? InteractionModule<ButtonInteraction, T> : never;
export type AllButtonModules = buttonModules<buttonStates>;