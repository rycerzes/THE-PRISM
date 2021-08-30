import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {

    constructor(client: Client) {
        super('admin', client, true)
    };

    public id = 2;
    public default = true;
    public description = 'Admin module.'
    
};