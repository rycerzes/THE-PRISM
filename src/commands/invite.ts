import { Command } from "#structures/Command";
import type { PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'invite',
            description: 'Invite the bot to another server.',
            usage: [''],
        });
    };

    public async run(message: Message) {

        return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
            {
                description: `[INVITE](${this.client.generateInvite({ scopes: ['bot'], permissions: ['ADMINISTRATOR']})})`
            }
        ]})

    }
}