import { Command } from "#structures/Command";
import { groupDigits } from "#util/functions";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'member',
            description: 'View a member\'s info.',
            usage: ['(member)'],
            aliases: ['memberinfo'],
            preconditions: ['guild']
        });

        this.module = this.client.modules.get('info')!
    };

    public async messageRun(message: Message, args: Args) {

        const member = await args.pick('member').catch(() => message.member!)
        const { member_id } = await this.db.fetchMember(member);

        message.reply({ allowedMentions: { repliedUser: false }, embeds: [
            {
                title: `MEMBER INFO`,
                description: `${member} - Joined <t:${Math.floor((member.joinedTimestamp || 0)/1000)}:R>`,
                fields: [
                    {
                        name: 'Join Rank',
                        value: `\` ${groupDigits([...member.guild.members.cache.values()].filter(m => !m.user.bot).sort((a, b) => Number(a.joinedTimestamp) - Number(b.joinedTimestamp)).indexOf(member) + 1)} \``,
                        inline: true
                    },
                    {
                        name: 'Boosting',
                        value: member.premiumSinceTimestamp ? `<t:${Math.floor(member.premiumSinceTimestamp/1000)}:R>` : '` N/A `',
                        inline: true
                    }
                ],
                thumbnail: {
                    url: member.user.displayAvatarURL({ size: 128 })
                },
                color: member.displayHexColor,
                footer: {
                    text: `ID: ${member_id}`
                }
            }
        ]});
    };
};