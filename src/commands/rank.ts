import { Command } from '#structures/Command';
import type { PieceContext } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Command {

    public module = this.client.modules.get('levels') || null;

    constructor(context: PieceContext) {
        super(context, {
            name: 'rank',
            description: 'Check a member\'s rank.',
            aliases: ['level']
        });
    };

    public run(message: Message) {
        return message.reply("Rank")
    }
};