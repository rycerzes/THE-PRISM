import type { ColorResolvable, Snowflake } from "discord.js";

export type Member = {
    member_id: number;
    user_id: Snowflake,
    guild_id: Snowflake,
    messages: number,
    voice_minutes: number,
    mute_minutes: number,
    afk_count: number,
    xp: number,
    xp_messages: number,
    xp_minutes: number,
    xp_last_message_timestamp: number | null,
    temp_mute_end: number | null,
    voice: boolean,
    temp_mute: number | null,
    counting_counts: number,
    counting_last_message_url: string | null,
    rank_card_color: string | null,
    rank_card_bg_id: number,
    mc_username: string,
    mc_username_url: string | null
};

export type Guild = {
    guild_id: Snowflake,
    prefix: string,
    counting_channel_id: Snowflake | null,
    wording_channel_id: Snowflake | null,
    logs_channel_id: Snowflake | null,
    calls_channel_id: Snowflake | null,
    levels_chanel_id: Snowflake | null,
    pins_channel_id: Snowflake | null,
    mute_role_id: Snowflake | null,
    mod_role_id: Snowflake | null,
    counting_count: number,
    main_color: string,
    color: ColorResolvable;
    leaderboard_display: number,
    pins_reaction: number,
    enabled_modules: number
};

export type User = {
    user_id: Snowflake
};

export type Config = {
    guild_id: Snowflake;
    logs_channel_id: Snowflake | null;
    levels_channel_id: Snowflake | null;
    calls_channel_id: Snowflake | null;
    pins_channel_id: Snowflake | null;
    counting_channel_id: Snowflake | null;

    level_up_text: string | null;
    levels_message_embed: boolean;
};

export type ConfigOptions = {
    logs_channel_id?: Snowflake | null;
    levels_channel_id?: Snowflake | null;
    calls_channel_id?: Snowflake | null;
    pins_channel_id?: Snowflake | null;
    counting_channel_id?: Snowflake | null;

    level_up_text?: string | null;
    levels_message_embed?: boolean;
}

export type LevelRole = {
    guild_id: Snowflake;
    level: number;
    role_id: Snowflake;
};

export type WordFilter = {
    word_filter_id: number;
    guild_id: Snowflake;
    match_any: boolean;
    text: string;
};

export type Mute = {
    mute_id: number;
    member_id: number;
    reason: string;
    ends: number;
    started: number;
}