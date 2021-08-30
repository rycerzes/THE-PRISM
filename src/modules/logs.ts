import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {
    constructor(client: Client) {
        super('logs', client)
    };

    public id = 5;
    public default = false;
    public description = 'Action logs.'
};