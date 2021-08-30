import type { Client } from '#lib/Client';
import { BaseModule } from '#structures/BaseModule';

export class Module extends BaseModule {
    constructor(client: Client) {
        super('fun', client)
    };

    public id = 11;
    public default = false;
    public description = 'Just some fun commands :)'
};