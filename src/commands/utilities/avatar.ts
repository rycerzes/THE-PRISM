import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'avatar',
            description: 'View a users avatar',
            usage: ['(member)'],
            preconditions: ['guild'],
            aliases: ['av']
        });

        this.module = this.client.modules.get('utilities')!
    };

    public async messageRun(message: Message, args: Args) {

        const member = await args.pick('member').catch(() => message.member);

        return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
            {
                color: await this.client.util.guildColor(message.guild!),
                image: {
                    url: member?.user.displayAvatarURL({ size: 4096 })
                }
            }
        ]});

    };
};