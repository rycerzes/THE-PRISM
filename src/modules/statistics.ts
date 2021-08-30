import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {
    constructor(client: Client) {
        super('statistics', client)
    };

    public id = 4;
    public default = true;
    public description = 'Message and Voice statistics'
};