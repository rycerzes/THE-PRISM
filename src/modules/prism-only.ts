import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {

    constructor(client: Client) {
        super('prism-only', client)
    };

    public id = 21;
    public default = false;
    public hidden = true;
    public description = 'Bit for the official PRISM server.'
    
};