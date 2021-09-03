import { colors } from '#util/constants';
import { durationToMilli, rng } from '#util/functions';
import type { Guild as Guild, GuildMember, Message, Role, Snowflake, TextChannel, User, VoiceChannel } from 'discord.js';
import pg from 'pg';
import type { Client } from './Client';
import type { Member, Guild as DbGuild, User as DbUser, Config, Mute, WordFilter, Call, LevelRole, Responder, ReactionMessage, Reaction, RoleHeader, JoinRole, Giveaway } from './types/db';
import type { duration } from './types/util';

export interface DBClient {

};

export class DBClient extends pg.Client {
    constructor(client: Client) {

        super({
            connectionString: process.env.DB_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });

        this.client = client;

    };
    
    async fetchGuild(guild: Guild): Promise<DbGuild> {
        return (await this.query(`SELECT * FROM guilds WHERE guild_id = ${guild.id}`)).rows[0] || (await this.query(`INSERT INTO guilds (guild_id) VALUES (${guild.id}) RETURNING *`)).rows[0]
    };

    async updateGuild(guild: Guild, query: string): Promise<DbGuild> {
        await this.fetchGuild(guild);
        return (await this.query(`UPDATE guilds ${query} WHERE guild_id = ${guild.id} RETURNING *`)).rows[0];
    }

    async fetchUser(user: User): Promise<DbUser> {
        return (await this.query(`SELECT * FROM users WHERE user_id = ${user.id}`)).rows[0] || (await this.query(`INSERT INTO users (user_id) VALUES (${user.id}) RETURNING *`)).rows[0]
    };

    async updateUser(user: User, query: string): Promise<DbUser> {
        await this.fetchUser(user);
        return (await this.query(`UPDATE users ${query} WHERE user_id = ${user.id} RETURNING *`)).rows[0]!;
    };

    async fetchMember(member: GuildMember): Promise<Member> {
        await this.fetchUser(member.user); await this.fetchGuild(member.guild);
        return (await this.query(`SELECT * FROM members WHERE user_id = ${member.user.id} AND guild_id = ${member.guild.id}`)).rows[0] || (await this.query(`INSERT INTO members (user_id, guild_id) VALUES (${member.id}, ${member.guild.id}) RETURNING *`)).rows[0];
    };

    async getMember(id: number): Promise<Member | undefined> {
        return (await this.query(`SELECT * FROM members WHERE member_id = ${id}`)).rows[0]
    };

    async updateMember(member: GuildMember, query: string): Promise<Member> {

        await this.fetchMember(member);
        return (await this.query(`UPDATE members ${query} WHERE user_id = ${member.user.id} AND guild_id = ${member.guild.id} RETURNING *`)).rows[0]!;
    }
 
    async fetchConfig(guild: Guild): Promise<Config> {
        return (await this.query(`SELECT * FROM config WHERE guild_id = ${guild.id}`)).rows[0] || (await this.query(`INSERT INTO config (guild_id) VALUES (${guild.id}) RETURNING *`)).rows[0];
    };

    async updateConfig(guild: Guild, query: string): Promise<Config> {
        await this.fetchConfig(guild);
        return (await this.query(`UPDATE config ${query} WHERE guild_id = ${guild.id} RETURNING *`)).rows[0]!
    }

    async trackVoice(member: GuildMember): Promise<void> {

        console.log(`Tracking voice for ${member.user.tag} in ${member.guild.name}`)

        let i = 0;

        let interval = setInterval(async () => {

            i++;

            if (member.voice.channelId) {
                
                await this.updateMember(member, `SET voice_minutes = voice_minutes + 1 ${member.voice.mute ? ', mute_minutes = mute_minutes + 1' : ''}`)
                if (i % 5 === 0) {
                    
                    // Checks
                    if (!member.voice.deaf && member.voice.channel!.members.filter(m => !m.user.bot).size > 1) {
                        this.client.emit('xp-add', member, 'voice')
                    };

                }

            } else {
                
                console.log(`Stopping voice tracking for ${member.user.tag} in ${member.guild.name}`)
                await this.updateMember(member, `SET voice = false`);
                clearInterval(interval);
            }

        }, 60*1000);

    };

    async mute(member: GuildMember, reason: string, duartion: duration) {

        const { member_id } = await this.fetchMember(member);

        const milli = durationToMilli(duartion);

        try {

            const mute = (await this.query(`INSERT INTO mutes (member_id, reason, ends, started) VALUES (${member_id}, ${reason ? `'${reason}'` : null}, ${milli ? Date.now() + milli : null}, ${Date.now()}) RETURNING *`)).rows[0] as Mute;

            this.trackMute(mute);

            return true;

        } catch(e) {

            return false;

        }

    };

    async unmute(member: GuildMember): Promise<Mute[]> {
        const { member_id } =await this.fetchMember(member);
        return (await this.query(`UPDATE mutes SET ends = ${Date.now()} WHERE member_id = ${member_id} AND (ends > ${Date.now()} OR ends IS NULL) RETURNING *`)).rows;
    };

    async isMuted(member: GuildMember): Promise<boolean> {
        const { member_id } = await this.fetchMember(member);
        const active = (await this.query(`SELECT * FROM mutes WHERE member_id = ${member_id} AND (ends > ${Date.now()} OR ends IS NULL)`)).rows;
        return active.length > 0
    };

    async getMute(id: number): Promise<Mute | undefined> {
        return (await this.query(`SELECT * FROM mutes WHERE mute_id = ${id}`)).rows[0];
    };

    async getMutes(member: GuildMember): Promise<Mute[]> {
        const { member_id } = await this.fetchMember(member);
        return (await this.query(`SELECT * FROM mutes WHERE member_id = ${member_id}`)).rows;
    };

    async getActiveMutes(member?: GuildMember): Promise<Mute[]> {

        if (member) {
            const { member_id } = await this.fetchMember(member);
            return (await this.query(`SELECT * FROM mutes WHERE member_id = ${member_id} AND ends > ${Date.now()}`)).rows;
        }

        return (await this.query(`SELECT * FROM mutes WHERE ends > ${Date.now()}`)).rows;
    };

    async trackMute({ mute_id, member_id }: { mute_id: number, member_id: number }) {
        
        const { user_id, guild_id } = (await this.getMember(member_id))!;

        const guild = await this.client.guilds.fetch(guild_id);
        const member = await guild.members.fetch(user_id);
        const role = await guild.roles.fetch((await this.fetchGuild(guild)).mute_role_id!);

        if (role) {
    
            console.log(`Tracking mute for ${member.user.tag} in ${member.guild.name}`);

            let interval = setInterval(async () => {

                const mute = await this.getMute(mute_id);

                // Mute already ended
                if (!mute || !mute.ends) {
                    clearInterval(interval);
                    return;
                };

                // Mute ends
                if (Date.now() > mute.ends!) {
                    member.roles.remove(role)
                    this.muteEndAlert(mute)
                    clearInterval(interval);

                // Still active
                } else {
                    member.roles.add(role)
                }


            }, 20*1000)


        } else return;
    };

    async muteEndAlert(mute: Mute) {

        if (mute.ends! - mute.started < 2*60*1000) return;

        const { user_id, guild_id } = (await this.query(`SELECT user_id FROM members WHERE member_id = ${mute.member_id}`)).rows[0];

        return (await this.client.users.fetch(user_id)).send({ embeds: [
            {
                description: `You've been unmuted in ${(await this.client.guilds.fetch(guild_id)).name}`,
                color: colors.green
            }
        ]});

    };

    async getWords(guild: Guild): Promise<WordFilter[]> {

        return (await this.query(`SELECT * FROM word_filter WHERE guild_id = ${guild.id}`)).rows;

    };

    async addWord(guild: Guild, text: string, any: boolean) {

        await this.query(`INSERT INTO word_filter (guild_id, text, match_any) VALUES (${guild.id}, '${text}', ${any})`);

        return await this.getWords(guild);

    };

    async removeWord(id: number, guild: Guild) {
        await this.query(`DELETE FROM word_filter WHERE word_filter_id = ${id} AND guild_id = ${guild.id}`)

        return await this.getWords(guild);
    };

    async createCall(guild: Guild, user: User, voiceChannel: VoiceChannel, textChannel: TextChannel): Promise<Call> {
        return (await this.query(`INSERT INTO calls (guild_id, user_id, voice_channel_id, text_channel_id) VALUES (${guild.id}, ${user.id}, ${voiceChannel.id}, ${textChannel.id}) RETURNING *`)).rows[0];
    };

    async getCall(channelId: Snowflake): Promise<Call | undefined> {
        return (await this.query(`SELECT * FROM calls WHERE text_channel_id = ${channelId} OR voice_channel_id = ${channelId}`)).rows[0];
    };

    async deleteCall(id: number) {
        return this.query(`DELETE FROM calls WHERE call_id = ${id}`)
    };

    async addLevelRole(level: number, role: Role): Promise<LevelRole> {
        return (await this.query(`INSERT INTO level_roles (guild_id, level, role_id) VALUES (${role.guild.id}, ${level}, ${role.id}) RETURNING *`)).rows[0];
    };

    async deleteLevelRole(id: number) {
        return this.query(`DELETE FROM level_roles WHERE level_role_id = ${id}`)
    };

    async getLevelRole(id: number): Promise<LevelRole | undefined> {
        return (await this.query(`SELECT * FROM level_roles WHERE level_role_id = ${id}`)).rows[0];
    };

    async getLevelRoles(guild: Guild): Promise<LevelRole[]> {
        return (await this.query(`SELECT * FROM level_roles WHERE guild_id = ${guild.id}`)).rows;
    };

    async toggleStackLevelRoles(guild: Guild): Promise<boolean> {
        return (await this.query(`UPDATE config SET level_role_stack = NOT level_role_stack WHERE guild_id = ${guild.id} RETURNING level_role_stack`)).rows[0].level_role_stack;
    };

    async stackLevelRoles(guild: Guild): Promise<boolean> {
        const stack = (await this.query(`SELECT level_role_stack FROM config WHERE guild_id = ${guild.id}`)).rows[0].level_role_stack;
        return stack;
    }

    async fetchResponders(guild: Guild): Promise<Responder[]> {
        return (await this.query(`SELECT * FROM responder WHERE guild_id = ${guild.id}`)).rows;
    };

    async addResponder(guild: Guild, text: string, response: { text: string | null, reaction: string | Snowflake | null, matchAny: boolean }): Promise<Responder> {
        return (await this.query(`INSERT INTO responder (guild_id, regex, text_response, reaction_response, match_any) VALUES (
            ${guild.id},
            '${text}',
            ${response.text},
            ${response.reaction},
            ${response.matchAny}
        ) RETURNING *`)).rows[0];
    };

    async deleteResponder(id: number) {
        return (await this.query(`DELETE FROM responder WHERE responder_id = ${id}`))
    };

    async getReactionMessages(guild: Guild): Promise<ReactionMessage[]> {
        return (await this.query(`SELECT * FROM reaction_messages WHERE guild_id = ${guild.id}`)).rows;
    };

    async addReactionMessage(guild: Guild, url: string): Promise<ReactionMessage> {
        return (await this.query(`INSERT INTO reaction_messages (guild_id, message_url) VALUES (${guild.id}, '${url}') RETURNING *`)).rows[0];
    };

    async deleteReactionMessage(id: number) {
        return (await this.query(`DELETE FROM reaction_messages WHERE reaction_message_id = ${id}`));
    };

    async getReactionMessage({ id, url }: { id?: number, url?: string }): Promise<ReactionMessage | undefined> {
        if (id) return (await this.query(`SELECT * FROM reaction_messages WHERE reaction_message_id = ${id}`)).rows[0];
        if (url) return (await this.query(`SELECT * FROM reaction_messages WHERE message_url = '${url}'`)).rows[0];
        else return;
    };

    async getReactions( reactionMessageID: number): Promise<Reaction[]> {
        return (await this.query(`SELECT * FROM reactions WHERE reaction_message_id = ${reactionMessageID}`)).rows;
    };

    async addReaction(rm: ReactionMessage, role: Role, emoji: string | Snowflake): Promise<Reaction> {
        const reaction = (await this.query(`INSERT INTO reactions (reaction_message_id, role_id, emoji) VALUES (${rm.reaction_message_id}, ${role.id}, '${emoji}') RETURNING *`)).rows[0];
        await (await this.client.util.resolveMessage(rm.message_url))?.react(emoji);
        return reaction;
    };

    async deleteReaction(id: number) {
        return await this.query(`DELETE FROM reactions WHERE reaction_id = ${id}`)
    };

    async getReaction({ emoji, roleID }: { emoji?: string, roleID: Snowflake }): Promise<Reaction | undefined> {
        if (emoji) return (await this.query(`SELECT * FROM reactions WHERE emoji = ${emoji}`)).rows[0];
        if (roleID) return (await this.query(`SELECT * FROM reactions WHERE role_id = ${roleID}`)).rows[0];
        return;
    };

    async getRoleHeaders(guild: Guild): Promise<RoleHeader[]> {
        return (await this.query(`SELECT * FROM role_headers WHERE guild_id = ${guild.id}`)).rows;
    };

    async addRoleHeader(guild: Guild, role: Role): Promise<RoleHeader> {
        return (await this.query(`INSERT INTO role_headers (guild_id, role_id) VALUES (${guild.id}, ${role.id})`)).rows[0];
    };

    async deleteRoleHeader(id: number) {
        return (await this.query(`DELETE FROM role_headers WHERE role_header_id = ${id}`));
    };

    async getJoinRoles(guild: Guild): Promise<JoinRole[]> {
        return (await this.query(`SELECT * FROM join_roles WHERE guild_id = ${guild.id}`)).rows;
    };

    async addJoinRole(guild: Guild, role: Role): Promise<JoinRole> {
        return (await this.query(`INSERT INTO join_roles (guild_id, role_id) VALUES (${guild.id}, ${role.id}) RETURNING *`)).rows[0];
    };

    async deleteJoinRole(id: number) {
        return (await this.query(`DELETE FROM join_roles WHERE join_role_id = ${id}`));
    };

    async getGiveaways(): Promise<Giveaway[]> {
        return (await this.query(`SELECT * FROM giveaways WHERE end_timestamp > ${Date.now()}`)).rows;
    };

    async getGiveaway({ url, id }: { url?: string, id?: number }): Promise<Giveaway | undefined> {

        let giveaway: Giveaway | undefined;

        if (url) giveaway = (await this.query(`SELECT * FROM giveaways WHERE message_url = '${url}'`)).rows[0];
        if (id) giveaway = (await this.query(`SELECT * FROM giveaways WHERE giveaway_id = ${id}`)).rows[0];

        return giveaway
    };

    async startGiveaway(user: User, message: Message, prize: string, milli: number): Promise<Giveaway | undefined> {

        if (!message.guild) return undefined;

        const giveaway = (await this.query(`INSERT INTO giveaways (prize, guild_id, user_id, message_url, end_timestamp) VALUES (
            '${prize}',
            ${message.guild!.id},
            ${user.id},
            '${message.url}',
            ${Date.now() + milli}
        ) RETURNING *`)).rows[0];

        this.trackGiveaway(giveaway);
        message.react('🎁')   
        return giveaway;

    };

    async trackGiveaway(giveaway: Giveaway) {

        let message = await this.client.util.resolveMessage(giveaway.message_url);

        if (!message) return this.deleteGiveaway(Number(giveaway.giveaway_id));

        await message.edit(await this.client.util.giveawayMessage(giveaway))

        let interval = setInterval(async () => {

            message = await this.client.util.resolveMessage(giveaway.message_url);
            if (!message) {
                clearInterval(interval);
                this.deleteGiveaway(giveaway.giveaway_id);
                return;
            }

            if (giveaway.end_timestamp - Date.now() > 0) {
                await message.edit(await this.client.util.giveawayMessage(giveaway));
            } else {
                clearInterval(interval);
                const winner = await this.drawGiveaway(giveaway);
                if (winner) (await this.client.users.fetch(giveaway.user_id)).send({ embeds: [{
                    description: `🎉 [**You\'re giveaway**](${giveaway.message_url}) has ended.`,
                    color: await this.client.util.guildColor(message.guild!),
                    timestamp: Date.now()
                }]});
                await message.edit(await this.client.util.giveawayMessage(giveaway, winner));
            };

        }, 15*1000);

        return;

    };

    async drawGiveaway(giveaway: Giveaway): Promise<GuildMember | null | undefined> {

        const message = await this.client.util.resolveMessage(giveaway.message_url);

        if (!message) {
            this.deleteGiveaway(Number(giveaway.giveaway_id))
            return
        };

        const messageReaction = message.reactions.cache.get('🎁');

        if (!messageReaction) return null;

        const users = [...(await messageReaction.users.fetch()).values()].filter(u => u.id !== this.client.user?.id);
        
        if (users.length < 1) return null;

        const winner = await message.guild!.members.fetch(users[rng(0, users.length - 1)].id);

        return winner;
        
    };

    async deleteGiveaway(id: number) {
        return await this.query(`DELETE FROM giveaways WHERE giveaway_id = ${id}`)
    };
};