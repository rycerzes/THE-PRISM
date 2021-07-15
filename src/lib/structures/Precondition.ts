import Sapphire from '@sapphire/framework';
import type { BaseModule } from '#structures/BaseModule';

export abstract class Precondition extends Sapphire.Precondition {

    public abstract module: BaseModule | null

    get client() {
        return this.context.client;
    };
};