import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {

    constructor(client: Client) {
        super('base', client)
    };

    public id = 1;
    public default = true;
    public description = 'Base module'
    
};