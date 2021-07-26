import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {
    constructor(client: Client) {
        super('reactions', client)
    };

    public id = 14;
    public default = false;
    public description = 'Role Reactions.'
};