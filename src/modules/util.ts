import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {
    constructor(client: Client) {
        super('util', client)
    };

    public id = 2;
    public default = true;
    public description = 'Utility commands.'
    
};