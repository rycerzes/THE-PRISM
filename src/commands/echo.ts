import { Command } from "#structures/Command";
import type { PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {

    constructor(context: PieceContext) {
        super(context, {
            name: 'echo',
            description: 'Echo\'s the user\'s message.',
            aliases: ['say']
        });
    };

    public module = this.client.modules.get('base') || null;

    public run(message: Message) {
        console.log(this)
        return message.channel.send(message.content);
    };
};