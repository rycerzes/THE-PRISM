import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {

    constructor(client: Client) {
        super('role-headers', client)
    };

    public id = 19;
    public default = false;
    public description = 'Split up your roles with role headers.'
    
};