import { Command } from "#structures/Command";
import { emoji } from "#util/constants";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'bigtext',
            description: 'Make your text 🅱ℹ🇬',
            usage: ['[text]'],
        });

        this.module = this.client.modules.get('fun')!;

    };

    public async run(message: Message, args: Args) {

        let channel;

        const peeked = await args.peekResult('guildTextChannel');

        if (peeked.success) {
            channel = await args.pick('guildTextChannel');
        } else {
            channel = message.channel;
        };

        const str = await args.rest('string').catch(() => undefined);

        if (!str) return message.reply({ allowedMentions: { repliedUser: false }, content: 'No text provided' });

        await channel.send({ content: str.split('').map(c => emoji[c]).join(' ') });

        return message.channel.id === channel.id ? message.delete() : message.react('👌')

    };
};