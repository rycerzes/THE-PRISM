import { Argument } from '#structures/Argument';
import type { AsyncArgumentResult, PieceContext } from "@sapphire/framework";

export default class extends Argument<string> {

    constructor(context: PieceContext) {
        super(context, { name: 'lbcategory' })
    };

    public async run(parameter: string): AsyncArgumentResult<string> {

        const options = [
            ['MESSAGES', 'MESSAGE', 'MSG'],
            ['VOICE', 'VC'],
            ['MUTED', 'MUTE'],
            ['AFK'],
            ['COUNTING', 'COUNTS'],
            ['LEVELS', 'LVL', 'XP', 'RANKS'],
            ['SHARDS', 'BALANCE', 'BAL']
        ];

        const option = options.find(aliases => aliases.includes(parameter.toUpperCase()));

        return option ? this.ok(option[0]) : this.error({ parameter, identifier: 'ArgumentError', message: 'Unable to resolve option.' });

    };
};