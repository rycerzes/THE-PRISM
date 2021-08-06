import { Precondition } from '#structures/Precondition';
import type { PieceContext, PreconditionOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {

    constructor(context: PieceContext, { ...options }: PreconditionOptions) {
        super(context, {
            name: 'admin',
            ...options
        });
    };

    public run(message: Message) {
        
        return message.member?.permissions.has('ADMINISTRATOR') ? this.ok() : this.error({ message: 'This command is Administrator only.' });
        
    };
};