import Sapphire from '@sapphire/framework';

export abstract class Precondition extends Sapphire.Precondition {

    get client() {
        return this.container.client;
    };

    get db() {
        return this.container.client.db;
    }
};