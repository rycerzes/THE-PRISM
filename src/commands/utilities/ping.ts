import { Command } from '#structures/Command';
import type { PieceContext } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Command {

    constructor(context: PieceContext) {
        super(context, { 
            name: 'ping',
            usage: [''],
            preconditions: ['guild'],
            description: 'Returns the ping'
        });

    }

    public module = this.client.modules.get('utilities')!;

    public async messageRun(message: Message) {
        const sent = await message.reply('Pinging...');
        const ping = sent.createdTimestamp - message.createdTimestamp;
        return sent.edit(`Pong! \`${ping} ms\``);
    };
};