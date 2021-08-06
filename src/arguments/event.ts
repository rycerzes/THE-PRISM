import { Argument } from "#structures/Argument";
import type { AsyncArgumentResult, PieceContext } from "@sapphire/framework";

export default class extends Argument<string> {
    constructor(context: PieceContext) {
        super(context, { name: 'event' });
    };

    public async run(parameter: string): AsyncArgumentResult<string> {

        const event = [
            'guildMemberAdd',
            'guildMemberRemove',
            'guildMemberUpdate',
        ].find(e => e.toLowerCase() === parameter.toLowerCase());

        return event ? this.ok(event) : this.error({ parameter });

    };
};