import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {
    constructor(client: Client) {
        super('stats', client)
    };

    public id = 3;
    public default = true;
    public description = 'Message and Voice statistics'
};