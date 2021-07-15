import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'debug',
            aliases: ['test', 'foo']
        });
    };

    public module = this.client.modules.get('base') || null;

    public async run(message: Message, args: Args) {
        const arg = await args.pick('string').catch(() => 'bar');
        message.author.send(arg);
    };
};