import { Listener } from '#structures/Listener';
import type { PieceContext } from '@sapphire/framework';

export default class extends Listener {

    constructor(context: PieceContext) {
        super(context, {
            name: 'ready',
            event: 'ready'
        })
    };

    public run() {

    }
}