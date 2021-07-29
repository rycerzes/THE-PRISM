import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {

    constructor(context: PieceContext) {
        super(context, {
            name: 'say',
            description: 'Echo\'s the user\'s message.',
            usage: ['[text]', '(channel) [text]'],
            aliases: ['echo']
        });
    };

    public module = this.client.modules.get('util')!;

    public async run(message: Message, args: Args) {

        const peeked = await args.peekResult('guildTextChannel');
        
        const channel = peeked.success ? peeked.value : message.channel;
        const str = await args.rest('string');

        await channel.send(str);

        return channel.id === message.channel.id ? message.delete() : message.react('👌')

    };
};