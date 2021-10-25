import { Command } from "#structures/Command";
import type { PieceContext } from "@sapphire/framework";
import type { Message, TextChannel } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'endcall',
            description: 'End a temporary call',
            usage: [''],
            preconditions: ['guild']
        });

        this.module = this.client.modules.get('calls')!;
    };

    public async messageRun(message: Message) {

        const call = await this.db.getCall(message.channel.id);

        if (!call) return message.reply({ allowedMentions: { repliedUser: false }, content: 'This command must be done in a call\'s text channel' });

        return this.client.emit('callEnd', message.channel as TextChannel, call);

    };
};