import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {
    constructor(client: Client) {
        super('calls', client)
    };

    public id = 9;
    public default = false;
    public description = 'Integrate custom user-calls.'
    
};