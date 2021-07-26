import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {
    constructor(client: Client) {
        super('counting', client)
    };

    public id = 16;
    public default = false;
    public description = 'Implements a counting game.'
    
};