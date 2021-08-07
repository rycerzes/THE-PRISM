import Sapphire, { PieceContext, PreconditionEntryResolvable } from '@sapphire/framework';
import type { BaseModule } from '#structures/BaseModule'

export abstract class Command extends Sapphire.Command {

    constructor(context: PieceContext, { ...options }: Sapphire.CommandOptions) {

        //(preconditions as PreconditionEntryResolvable[]).push('module')

        super(context, { ...options });
        
    };

    public module: BaseModule = this.client.modules.get('base')!;

    get client() {
        return this.container.client;
    };

    get db() {
        return this.container.client.db;
    }

    get isDefault(): boolean {
        return this.module?.default ?? true
    };
};