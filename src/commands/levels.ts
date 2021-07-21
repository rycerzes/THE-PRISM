import { Command } from "#structures/Command";
import { RankingMessage } from "#structures/RankingMessage";
import { groupDigits, levelCalc, pad } from "#util/functions";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message, TextChannel } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'levels',
            aliases: ['ranks'],
            preconditions: ['guild']
        });
    };

    public module = this.client.modules.get('levels') || null;

    public async run(message: Message, args: Args) {

        const page = await args.pick('integer').catch(() => 1)
        
        let lb = new RankingMessage(this.client, {
            channel: message.channel as TextChannel, title: `${message.guild!.name} Leaderboard`, page: page, author: message.author,

            array: [...(await this.client.db.query(`SELECT user_id, xp FROM members WHERE guild_id = ${message.guild!.id}`)).rows],
            
            buttons: true,
             

            display: async (member) => {
                let mention;

                try {
                    mention = await message.guild?.members.fetch(member.user_id);
                } catch {

                    try{
                        mention = (await this.client.users.fetch(member.user_id)).tag;
                    } catch {
                        mention = '`Deleted User`';
                    };

                };

                return `\`Lvl [${pad(levelCalc(member.xp), 2)}]\` • ${mention} • \`${groupDigits(member.xp)}\` xp`
            },

            sort: (a, b) => {
                return b.xp - a.xp
            }
        });

        await lb.send();

    };
};