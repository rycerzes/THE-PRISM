import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {
    constructor(client: Client) {
        super('giveaways', client)
    };

    public id = 12;
    public default = true;
    public description = 'Create giveaways for your servers.'
};