import { Listener } from '#structures/Listener';
import type { PieceContext } from '@sapphire/framework';
import type { Snowflake } from 'discord.js';

export default class extends Listener {

    constructor(context: PieceContext) {
        super(context, {
            name: 'ready',
            event: 'ready'
        })
    };

    public async run() {

        // Continue voice tracking
        const data: { user_id: Snowflake, guild_id: Snowflake }[] = (await this.db.query(`SELECT user_id, guild_id FROM members WHERE voice = true`)).rows;

        for (const { user_id, guild_id } of data) {
            
            try {
                const member = await (await this.client.guilds.fetch(guild_id)).members.fetch(user_id);

                if (member) {
                    this.db.trackVoice(member);
                }
            } catch {
                console.log(`Missing access for user ${user_id} in guild ${guild_id}.`)
            }
        }

    }
}