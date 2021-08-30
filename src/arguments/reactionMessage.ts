import type { ReactionMessage } from "#lib/types/db";
import { Argument } from "#structures/Argument";
import { RegEx } from "#util/constants";
import type { AsyncArgumentResult, PieceContext } from "@sapphire/framework";

export default class extends Argument<ReactionMessage> {
    constructor(context: PieceContext) {
        super(context, { name: 'reactionMessage' });
    };

    public async run(parameter: string): AsyncArgumentResult<ReactionMessage> {

        let reactionMessage: ReactionMessage | undefined;

        if (RegEx.messageURL.test(parameter)) {

            reactionMessage = await this.db.getReactionMessage({ url: parameter });
        } else if (!isNaN(Number(parameter))) {

            reactionMessage = await this.db.getReactionMessage({ id: Number(parameter)});
        };

        return reactionMessage ? this.ok(reactionMessage) : this.error({ parameter, message: 'Unable to resolve argument' });

    };
};