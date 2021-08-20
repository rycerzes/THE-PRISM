import type { LevelRole } from "#lib/types/db";
import { Argument } from "#structures/Argument";
import type { AsyncArgumentResult, PieceContext } from "@sapphire/framework";

export default class extends Argument<LevelRole> {
    constructor(context: PieceContext) {
        super(context, { name: 'levelrole' });
    };

    public async run(parameter: string): AsyncArgumentResult<LevelRole> {

        const levelRole = await this.db.getLevelRole(Number(parameter));

        return levelRole ? this.ok(levelRole) : this.error({ parameter, message: 'Unable to resolve levelrole' });

    };
};