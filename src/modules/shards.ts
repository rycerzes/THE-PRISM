import type { Client } from "#lib/Client";
import { BaseModule } from "#structures/BaseModule";

export class Module extends BaseModule {
    constructor(client: Client) {
        super('shards', client)
    };

    public id = 20;
    public default = false;
    public description = 'A currency/economy system'

};