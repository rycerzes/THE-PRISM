import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {
    constructor(client: Client) {
        super('embeds', client)
    };

    public id = 13;
    public default = true;
    public description = 'Create and edit custom embeds to make things look pretty.'
};