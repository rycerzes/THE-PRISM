import Sapphire, { PieceContext, PreconditionEntryResolvable } from '@sapphire/framework';
import type { BaseModule } from '#structures/BaseModule'
import type { Client } from '#lib/Client';
import type { DBClient } from '#lib/DBClient';

export abstract class Command extends Sapphire.Command {

    constructor(context: PieceContext, { preconditions = [], usage, ...options}: Sapphire.CommandOptions) {

        (preconditions as PreconditionEntryResolvable[]).push('module')

        super(context, { preconditions, usage, ...options });

        this.usage = usage;
        
    };

    public module: BaseModule = this.client.modules.get('base')!;

    get client(): Client {
        return this.container.client;
    };

    get db(): DBClient {
        return this.container.client.db;
    }

    get isDefault(): boolean {
        return this.module?.default ?? true
    };
    
};