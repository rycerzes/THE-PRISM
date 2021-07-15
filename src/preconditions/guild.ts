import { Precondition } from '#structures/Precondition';
import type { PieceContext, PreconditionOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {

    constructor(context: PieceContext, { ...options }: PreconditionOptions) {
        super(context, {
            name: 'guild',
            ...options
        });
    };

    public module = this.client.modules.get('base') || null;

    public run(message: Message) {
        return message.guild === null ? this.error({ message: 'Command is guild only.' }) : this.ok();
    };
}