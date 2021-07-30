import Sapphire from '@sapphire/framework';

export abstract class Listener extends Sapphire.Listener {

    get client() {
        return this.container.client;
    }

    get db() {
        return this.container.client.db;
    }
};