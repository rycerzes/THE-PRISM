import { Argument } from '#structures/Argument';
import type { AsyncArgumentResult, PieceContext } from "@sapphire/framework";

export default class extends Argument<string> {

    constructor(context: PieceContext) {
        super(context, { name: 'moduleoption' })
    };

    public async run(parameter: string): AsyncArgumentResult<string> {

        const options = [
            ['ENABLE', 'ON'],
            ['DISABLE', 'OFF'],
            ['INFO', 'VIEW']
        ];

        const option = options.find(aliases => aliases.includes(parameter.toUpperCase()));

        return option ? this.ok(option[0]) : this.error({ parameter, identifier: 'InvalidModuleOption', message: 'Unable to resolve option.' });

    };
};