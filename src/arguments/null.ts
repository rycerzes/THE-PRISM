import { Argument } from "#structures/Argument";
import type { AsyncArgumentResult, PieceContext } from "@sapphire/framework";

export default class extends Argument<boolean> {
    constructor(context: PieceContext) {
        super(context, { name: 'null' })
    };

    public async run(parameter: string): AsyncArgumentResult<boolean> {

        return parameter.toLowerCase() === 'null' ? this.ok(true) : this.error({ parameter, identifier: 'ArgumentError' });        

    };
};