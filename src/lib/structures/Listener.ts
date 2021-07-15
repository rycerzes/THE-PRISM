import Sapphire from '@sapphire/framework';
import type { BaseModule } from '#structures/BaseModule';

export abstract class Listener extends Sapphire.Event {

    public abstract module: BaseModule | null;

    get client() {
        return this.context.client;
    }
};