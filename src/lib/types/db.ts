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
    mc_username_url: string | null;
    shards: number;
};

export type Guild = {
    guild_id: Snowflake,
    prefix: string | null,
    mute_role_id: Snowflake | null,
    mod_role_id: Snowflake | null,
    counting_count: number,
    main_color: string,
    color: ColorResolvable;
    leaderboard_display: number,
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
    level_role_stack: boolean;

    pins_reaction_count: number;
};

export type LevelRole = {
    level_role_id: number;
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
    reason: string | null;
    ends: number | null;
    started: number;
};

export type Call = {
    call_id: number;
    guild_id: Snowflake;
    user_id: Snowflake;
    voice_channel_id: Snowflake;
    text_channel_id: Snowflake;
    persistent: boolean;
};

export type Responder = {
    responder_id: number;
    guild_id: Snowflake;
    regex: string;
    text_response: string | null;
    reaction_response: Snowflake | string | null;
    match_any: boolean;

};

export type ReactionMessage = {
    reaction_message_id: number;
    guild_id: Snowflake;
    message_url: string;
};

export type Reaction = {
    reaction_id: number;
    reaction_message_id: number;
    emoji: string;
    role_id: Snowflake;
};

export type RoleHeader = {
    role_header_id: number;
    guild_id: Snowflake;
    role_id: Snowflake;
};

export type JoinRole = {
    join_role_id: number;
    guild_id: Snowflake;
    role_id: Snowflake;
};

export type Giveaway = {
    giveaway_id: number;
    guild_id: Snowflake;
    user_id: Snowflake;
    prize: string;
    message_url: string;
    end_timestamp: number;
}