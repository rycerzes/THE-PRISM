import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {
    constructor(client: Client) {
        super('games', client)
    };

    public id = 16;
    public default = false;
    public description = 'Games to play in text channels'
};