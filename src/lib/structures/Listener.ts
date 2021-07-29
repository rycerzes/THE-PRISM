import Sapphire from '@sapphire/framework';
import type { BaseModule } from '#structures/BaseModule';

export abstract class Listener extends Sapphire.Listener {

    public module: BaseModule = this.client.modules.get('base')!;

    get client() {
        return this.container.client;
    }
};