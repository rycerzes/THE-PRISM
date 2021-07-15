import type { Client } from "#lib/Client";
import type { ColorResolvable, Guild, GuildMember, Snowflake, User } from 'discord.js';
import { RegEx } from '#util/constants';

export interface Util {
    client: Client;
}

// Thanks to Akairo for a lotta inspo here :P

export class Util {

    constructor(client: Client) {
        /**
         * The Client
         * @type {Client}
         */
        this.client = client;
    };

    /**
     * Resolves a user from string.
     * @param {str} str - String to resolve
     * @param {Map<string, User>} users - Users to search through.
     * @returns {User}
     */
    public resolveUser(str: string, users: Map<Snowflake, User>) {
        return users.get(str as Snowflake) || [...users.values()].find(user => this.checkUser(str, user));
    };

    /**
     * Checks whether a string is referring to a user
     * @param str - string to check
     * @param user - user to check
     * @returns {Boolean}
     */
    public checkUser(str: string, user: User) {

        // Check for user ID
        if (str === user.id) return true;

        // Check for mention
        const match = RegEx.mentions.user.exec(str);
        if (match && match[1] === user.id) return true; 

        const username = user.username.toLowerCase(); const discrim = user.discriminator;

        str = str.toLowerCase();
        // Check for tag
        return username.includes(str) || (username.includes(str.split('#')[0]) && discrim.includes(str.split('#')[1]));
    };

    /**
     * Resolves a member from a string.
     * @param str - string to resolve from.
     * @param members - Map of GuildMembers to resolve from
     * @returns {GuildMember}
     */
    public resolveMember(str: string, members: Map<Snowflake, GuildMember>) {
        console.log([...members.values()].map(m => m.user.tag))
        return members.get(str as Snowflake) || [...members.values()].find(member => this.checkMember(str, member));
    };

    /**
     * Checks if a string is referring to a member
     * @param str - String to check
     * @param member - GuildMember to check
     * @returns {Boolean}
     */
    public checkMember(str: string, member: GuildMember) {

        // Check for user ID
        if (str === member.id) return true;

        // Check for mention
        const match = RegEx.mentions.user.exec(str);
        if (match && match[1] === member.id) return true;

        const username = member.user.username.toLowerCase(); const discrim = member.user.discriminator; const displayName = member.displayName.toLowerCase();

        // Check for name match
        str = str.toLowerCase();
        return username.includes(str) || displayName.includes(str) || ((username.includes(str.split('#')[0]) || displayName.includes(str.split('#')[0])) && discrim.includes(str.split('#')[1]));

    };

    /**
     * Gets a guilds "main_color".
     * @param guild Guild to get color for.
     * @returns {Promise<ColorResolvable>}
     */
    public async guildColor(guild: Guild): Promise<ColorResolvable> {
        return (await this.client.db.query(`SELECT main_color FROM guilds WHERE guild_id = ${guild.id}`)).rows[0].main_color as ColorResolvable;
    };

};