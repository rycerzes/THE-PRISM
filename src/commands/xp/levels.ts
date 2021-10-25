import type { Member } from "#lib/types/db";
import { Command } from "#structures/Command";
import { RankingMessage } from "#structures/RankingMessage";
import { groupDigits, levelCalc, pad } from "#util/functions";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message, TextChannel } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'levels',
            description: 'View level leaerboard.',
            usage: ['(page|member)'],
            aliases: ['ranks'],
            preconditions: ['guild']
        });
    };

    public module = this.client.modules.get('xp')!;

    public async messageRun(message: Message, args: Args) {
        
        let lb = new RankingMessage(this.client, {
            channel: message.channel as TextChannel, title: `${message.guild!.name} Leaderboard`, author: message.author,

            array: [...(await this.client.db.query(`SELECT user_id, xp FROM members WHERE guild_id = ${message.guild!.id}`)).rows],
            
            buttons: true,
             

            display: async (member) => {
                return `\`Lvl [${pad(levelCalc(member.xp), 2)}]\` • ${await this.client.util.mention(member, message.guild!)} • \`${groupDigits(member.xp)}\` xp`
            },

            sort: (a, b) => {
                return b.xp - a.xp
            }
        });

        lb.page = await args.pick('rankpage', { rankingMessage: lb, resolve: ({ parameter, array }: { parameter: string, array: Member[] }): Member | undefined => {

            const member = this.client.util.resolveMember(parameter, message.guild!.members.cache);
            return member ? array.find(m => m.user_id === member.id) : undefined;
            
        } }).catch(() => 1);

        await lb.send();

    };
};