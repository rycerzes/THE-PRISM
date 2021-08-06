import { Precondition } from '#structures/Precondition';
import type { PieceContext, PreconditionOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {

    constructor(context: PieceContext, options: PreconditionOptions) {
        super(context, options);
    };

    public run(message: Message) {
        return message.author.id === this.client.ownerID ? this.ok() : this.error({ message: 'Command is owner only.' })
    };
}