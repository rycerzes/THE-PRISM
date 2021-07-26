import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {

    constructor(client: Client) {
        super('text-mod', client)
    };

    public id = 6;
    public default = true;
    public description = 'Moderation for text channels.'
    
};