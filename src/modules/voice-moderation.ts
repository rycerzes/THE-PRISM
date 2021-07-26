import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {

    constructor(client: Client) {
        super('voice-mod', client)
    };

    public id = 7;
    public default = true;
    public description = 'Voice channel moderation'
    
};