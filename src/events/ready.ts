import { Listener } from '#structures/Listener';
import type { PieceContext } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Listener {

    constructor(context: PieceContext) {
        super(context, {
            name: 'base-messageCreate',
            event: 'messageCreate'
        })
    };

    public module = this.client.modules.get('base') || null;

    public run(message: Message) {
        return console.log(message.channel.type);
    }
}