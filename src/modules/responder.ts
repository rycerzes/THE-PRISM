import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {
    constructor(client: Client) {
        super('responder', client)
    };

    public id = 13;
    public default = false;
    public description = 'Textchannel autoresponder'
};