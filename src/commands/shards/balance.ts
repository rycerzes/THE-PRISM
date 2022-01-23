import { Command } from "#structures/Command";
import { shardEmoji } from "#util/constants";
import { groupDigits } from "#util/functions";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            aliases: ['bal'],
            usage: ['(member)'],
            description: 'View how many shards you have.',
            preconditions: ['guild'],
        })
    }

    public async messageRun(message: Message, args: Args) {

        const member = await args.pick('member').catch(() => message.member!);
        
        const { shards, total_shards } = await this.client.db.fetchMember(member);

        return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
            {
                title: 'BALANCE',
                description: `${shardEmoji}\`${groupDigits(shards)}\`\n\nTotal earned: \`${groupDigits(total_shards)}\``,
                color: await this.client.util.guildColor(message.guild!),
                thumbnail: {
                    url: member.displayAvatarURL()
                }
            }
        ]});

    }
}