import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {

    constructor(client: Client) {
        super('xp', client)
    };

    public id = 8;
    public default = true;
    public description = 'Text & Voice Exp Levelling system.'
    
};