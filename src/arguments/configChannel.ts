import { Argument } from '#structures/Argument';
import type { AsyncArgumentResult, PieceContext } from "@sapphire/framework";

export default class extends Argument<string> {

    constructor(context: PieceContext) {
        super(context, { name: 'configChannel' })
    };

    public async run(parameter: string): AsyncArgumentResult<string> {

        const options = [
            ['LOGS', 'LOG'],
            ['LEVELS', 'LEVEL', 'LEVELUP', 'XP'],
            ['CALLS', 'CALL'],
            ['PINS', 'PIN'],
            ['COUNTING', 'COUNT']
        ];

        const option = options.find(aliases => aliases.includes(parameter.toUpperCase()));

        return option ? this.ok(option[0]) : this.error({ parameter, identifier: 'ArgumentError', message: 'Unable to resolve option.' });

    };
};