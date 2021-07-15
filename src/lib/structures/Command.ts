import Sapphire, { PieceContext, PreconditionEntryResolvable } from '@sapphire/framework';
import type { BaseModule } from '#structures/BaseModule'

export abstract class Command extends Sapphire.Command {

    constructor(context: PieceContext, { preconditions = [], ...options }: Sapphire.CommandOptions) {

        (preconditions as PreconditionEntryResolvable[]).push('module');

        super(context, { preconditions, ...options });
    };

    public abstract module: BaseModule | null;

    get client() {
        return this.context.client;
    };
};