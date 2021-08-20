import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'avatar',
            description: 'View a member\'s avatar',
            usage: ['(member)'],
            aliases: ['av'],
            preconditions: ['guild']
        });

        this.module = this.client.modules.get('info')!
    };

    public async run(message: Message, args: Args) {

        const member = await args.pick('member').catch(() => message.member!) 

        return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
            {
                image: {
                    url: member.user.displayAvatarURL({size: 1024})
                },
                color: await this.client.util.guildColor(message.guild!)
            }
        ]});

    };
};