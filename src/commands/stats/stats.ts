import { Command } from "#structures/Command";
import { blankFieldInline } from "#util/constants";
import { groupDigits } from "#util/functions";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'stats',
            description: 'View a member\'s stats for the server',
            usage: ['(member)'],
            aliases: ['statistics'],
            preconditions: ['guild'],
        });
    };

    public async run(message: Message, args: Args) {

        const member = (await args.pick('member').catch(() => message.member))!;

        const { messages, voice_minutes: minutes, afk_count, mute_minutes } = (await this.db.fetchMember(member));

        return message.reply({ allowedMentions: { repliedUser: false}, embeds: [
            {
                title: `${member.guild.name.toUpperCase()} STATS`,
                description: `${member}`,
                fields: [
                    {
                        name: 'MESSAGES',
                        value: `\`${groupDigits(messages!)}\``,
                        inline: true
                    },
                    blankFieldInline,
                    {
                        name: 'VOICE',
                        value: minutes! > 60000 ? `\`${groupDigits(Math.round(minutes!/60))}\` hours` : minutes! > 120 ? `\`${Math.round(minutes!/6)/10}\` hours` : `\`${groupDigits(minutes!)}\` minutes`,
                        inline: true
                    },
                    {
                        name: 'AFK COUNT',
                        value: `\`${groupDigits(afk_count!)}\``,
                        inline: true
                    },
                    blankFieldInline,
                    {
                        name: 'MUTED',
                        value: `${mute_minutes! > 60000 ? `\`${groupDigits(Math.round(mute_minutes!/60))}\` hours` : mute_minutes! > 120 ? `\`${Math.round(mute_minutes!/6)/10}\` hours` : `\`${groupDigits(mute_minutes!)}\` minutes`}, \`${minutes! > 0 ? Math.round(1000*mute_minutes!/minutes!)/10 : `0.00`}%\``,
                        inline: true
                    }
                ],
                color: await this.client.util.guildColor(message.guild!),
                thumbnail: {
                    url: member.user.displayAvatarURL({ size: 128 })
                }
            }
        ]});
    };
};