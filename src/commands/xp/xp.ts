import { Command } from "#structures/Command";
import { blankFieldInline } from "#util/constants";
import { groupDigits, levelCalc, xpCalc } from "#util/functions";
import type { Args, PieceContext } from "@sapphire/framework";
import { Message, MessageAttachment } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'xp',
            description: 'View a members XP statistics.',
            usage: ['(member)'],
            preconditions: ['guild']
        });

        this.module = this.client.modules.get('xp')!
    };

    public async messageRun(message: Message, args: Args) {

        const member = await args.pick('member').catch(() => message.member!);
        const { xp, xp_messages: messages, xp_minutes: minutes, xp_last_message_timestamp } = await this.db.fetchMember(member)

        message.reply({ allowedMentions: { repliedUser: false }, files: [new MessageAttachment(await this.client.util.getRankCard(member), 'rank.png')], embeds: [
            {
                fields: [
                    {
                        name: 'TOTAL XP',
                        value: `\`${groupDigits(xp)}\``,
                        inline: true
                    },
                    blankFieldInline,
                    {
                        name: 'REMAINING XP',
                        value: `\`${groupDigits(xpCalc(levelCalc(xp)+1) - xp)}\``,
                        inline: true
                    },
                    {
                        name: 'MESSAGES',
                        value: `\`${groupDigits(messages)}\``,
                        inline: true
                    },
                    blankFieldInline,
                    {
                        name: 'VOICE',
                        value: `\`${groupDigits(minutes)} minutes\``,
                        inline: true
                    }
                ],
                image: {
                    url: 'attachment://rank.png'
                },
                color: await this.client.util.guildColor(member.guild),
                footer: {
                    text: 'Last XP earned'
                },
                timestamp: Number(xp_last_message_timestamp!)
            }
        ]})

    };
};