import { Command } from "#structures/Command";
import { blankFieldInline } from "#util/constants";
import { groupDigits } from "#util/functions";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'member',
            description: 'View a member\'s info.',
            usage: ['(member)'],
            aliases: ['profile'],
            preconditions: ['guild']
        });
    };

    public async run(message: Message, args: Args) {

        const member = await args.pick('member').catch(() => message.member!)

        console.log(member)

        message.reply({ allowedMentions: { repliedUser: false }, embeds: [
            {
                title: `${member.guild.name.toUpperCase()} PROFILE`,
                description: `${member} - Joined <t:${Math.floor((member.joinedTimestamp || 0)/1000)}:R>`,
                fields: [
                    {
                        name: 'NICKNAME',
                        value: `\` ${member.nickname ? member.nickname : 'null'} \``,
                        inline: true
                    },
                    blankFieldInline,
                    {
                        name: 'JOIN RANK',
                        value: `\` ${groupDigits([...member.guild.members.cache.values()].filter(m => !m.user.bot).sort((a, b) => Number(a.joinedTimestamp) - Number(b.joinedTimestamp)).indexOf(member) + 1)} \``,
                        inline: true
                    }
                ],
                thumbnail: {
                    url: member.user.displayAvatarURL({ size: 128 })
                },
                color: member.displayHexColor
            }
        ]})
    };
};