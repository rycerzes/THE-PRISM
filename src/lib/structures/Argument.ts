import Sapphire from '@sapphire/framework';

export abstract class Argument<T> extends Sapphire.Argument<T> {

    get client() {
        return this.container.client
    }
};