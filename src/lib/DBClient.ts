import { durationToMilli } from '#util/functions';
import type { Guild as Guild, GuildMember, User } from 'discord.js';
import pg from 'pg';
import type { Client } from './Client';
import type { Member, Guild as DbGuild, User as DbUser, Config, Mute } from './types/db';
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

    async getMute(id: number): Promise<Mute | undefined> {
        return (await this.query(`SELECT * FROM mutes WHERE mute_id = ${id}`)).rows[0];
    };

    async trackMute({ mute_id, member_id }: Mute) {
        
        const { user_id, guild_id } = (await this.getMember(member_id))!;

        const guild = await this.client.guilds.fetch(guild_id);
        const member = await guild.members.fetch(user_id);
        const role = await guild.roles.fetch((await this.fetchGuild(guild)).mute_role_id!);

        const mute = await this.getMute(mute_id);

        if (mute && role) {
    
            console.log(`Tracking mute for ${member.user.tag} in ${member.guild.name}`);

            let interval = setInterval(() => {

                if (Date.now() > mute.ends) {
                    member.roles.remove(role)
                    clearInterval(interval);
                } else {
                    member.roles.add(role)
                }


            }, 20*1000)


        } else return;


    };
};