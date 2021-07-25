import type { Guild, Member } from "#lib/types/db";
import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { GuildMember, Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'counting',
            description: 'View counting stats',
            preconditions: ['guild']
        });
    };

    public module = this.client.modules.get('counting')!

    public async run(message: Message, args: Args) {
        
        const member: GuildMember = await args.pick('member').catch(() => message.member!);

        const { counting_counts, counting_last_message_url }: Member = (await this.db.query(`SELECT user_id, counting_counts, counting_last_message_url FROM members WHERE guild_id = ${message.guild!.id} AND user_id = ${member.id}`)).rows[0];
        const guild = (await this.client.db.query(`SELECT counting_count FROM guilds WHERE guild_id = ${message.guild!.id}`)).rows[0] as Guild;

        return message.channel.send({ embeds: [
            {
                title: 'COUNTING STATS',
                description: `${member} has counted \`${counting_counts}\` times.`,
                fields: [
                    {
                        name: '% OF COUNTS',
                        value: `\`${Math.round(counting_counts!*100/guild.counting_count!)/100}%\``,
                        inline: true
                    },
                    {
                        name: 'LAST COUNT',
                        value: `[\`${(await this.client.util.resolveMessage(counting_last_message_url!))?.content ?? 'null'}\`](${counting_last_message_url})`,
                        inline: true
                    },
                    // {
                    //     name: 'RANK',
                    //     value: `\`1\``,
                    //     inline: true
                    // }
                ],
                thumbnail: {
                    url: member.user.displayAvatarURL()
                },
                color: await this.client.util.guildColor(message.guild!)
            }
        ]})

    };
};