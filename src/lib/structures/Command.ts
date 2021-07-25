import Sapphire, { PieceContext, PreconditionEntryResolvable } from '@sapphire/framework';
import type { BaseModule } from '#structures/BaseModule'
import type { ApplicationCommandOptionData } from 'discord.js';

export abstract class Command extends Sapphire.Command {

    constructor(context: PieceContext, { preconditions = [], ...options }: Sapphire.CommandOptions) {

        (preconditions as PreconditionEntryResolvable[]).push('module');

        super(context, { preconditions, ...options });
    };

    public module: BaseModule = this.client.modules.get('base')!;

    public slash: {
        name: string,
        description: string,
        options: ApplicationCommandOptionData[] | undefined,
        defaultPermission: boolean
    } = {name: this.name, description: this.description, options: undefined, defaultPermission: this.isDefault};

    get client() {
        return this.context.client;
    };

    get db() {
        return this.context.client.db;
    }

    get isDefault(): boolean {
        return this.module?.default ?? true
    };
};