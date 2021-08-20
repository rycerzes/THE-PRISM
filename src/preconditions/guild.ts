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

    public run(message: Message) {
        return !message.guild ? this.error({ message: 'Command is guild only.' }) : this.ok();
    };
}