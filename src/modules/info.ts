import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {
    constructor(client: Client) {
        super('info', client)
    };

    public id = 8;
    public default = true;
    public description = 'Member/User/Server info commands.'
    
};