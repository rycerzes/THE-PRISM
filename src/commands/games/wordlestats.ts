import { Command } from "#structures/Command";
import { blankFieldInline } from "#util/constants";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {

    constructor(context: PieceContext) {
        super(context, {
            name: 'wordlestats',
            usage: ['(member)'],
            description: 'View statistics for wordle.',
            aliases: ['wstats', 'wstat'],
            preconditions: ['guild'],
        })

        this.module = this.client.modules.get('games')!;

    }

    async messageRun(message: Message, args: Args) {

        const member = await args.pick('member').catch(() => message.member!);

        const { wordle_wins, wordle_fails, wordle_streak } = await this.db.fetchMember(member);

        return message.reply({ allowedMentions: {repliedUser: false}, embeds: [
            {
                title: 'WORDLE STATS',
                description: `${member}`,
                fields: [
                    {
                        name: 'WINS',
                        value: `\` ${wordle_wins} \``,
                        inline: true,
                    },
                    blankFieldInline,
                    {
                        name: 'FAILS',
                        value: `\` ${wordle_fails} \``,
                        inline: true,
                    },
                    {
                        name: 'STREAK',
                        value: `\` ${wordle_streak} \``,
                        inline: true,
                    },
                    blankFieldInline,
                    {
                        name: 'WIN RATE',
                        value: `\` ${Math.round(100 * wordle_wins / (wordle_fails + wordle_wins))}% \``,
                        inline: true
                    }
                ],
                color: await this.client.util.guildColor(message.guild!),
                thumbnail: {
                    url: member.displayAvatarURL(),
                }
            }
        ]})

    }
}