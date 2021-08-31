import { Precondition } from '#structures/Precondition';
import type { PieceContext, PreconditionOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {

    constructor(context: PieceContext, { ...options }: PreconditionOptions) {
        super(context, {
            name: 'moderator',
            ...options
        });
    };

    public async run(message: Message) {

        if (!message.guild) return this.ok();

        if (message.member?.permissions.has('ADMINISTRATOR')) return this.ok();

        const { mod_role_id } = await this.db.fetchGuild(message.guild);
        
        return mod_role_id ? message.member!.roles.cache.has(mod_role_id) ? this.ok() : this.error({ message: 'This command is Moderator only.' }) : this.error({ message: 'This command is Moderator only.' });
        
    };
};