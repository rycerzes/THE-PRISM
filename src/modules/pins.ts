import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {

    constructor(client: Client) {
        super('pins', client)
    };

    public id = 18;
    public default = false;
    public description = 'Let users react to messages to pin them to a channel'
    
};