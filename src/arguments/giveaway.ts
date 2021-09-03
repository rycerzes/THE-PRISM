import type { Giveaway } from "#lib/types/db";
import { Argument } from "#structures/Argument";
import { RegEx } from "#util/constants";
import type { AsyncArgumentResult, PieceContext } from "@sapphire/framework";

export default class extends Argument<Giveaway> {
    constructor(context: PieceContext) {
        super(context, { name: 'giveaway' });
    };

    public async run(parameter: string): AsyncArgumentResult<Giveaway> {

        let giveaway: Giveaway | undefined;

        if (RegEx.messageURL.test(parameter)) {
            giveaway = await this.db.getGiveaway({ url: parameter });
        } else if (!isNaN(Number(parameter))) {
            giveaway = await this.db.getGiveaway({ id: Number(parameter)});
        };

        return giveaway ? this.ok(giveaway) : this.error({ parameter })

    };
};