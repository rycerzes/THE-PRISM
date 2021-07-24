import type { BaseModule } from '#structures/BaseModule';
import { Argument } from '#structures/Argument';
import type { AsyncArgumentResult, PieceContext } from "@sapphire/framework";

export default class extends Argument<BaseModule> {

    constructor(context: PieceContext) {
        super(context, { name: 'module' })
    };

    public async run(parameter: string): AsyncArgumentResult<BaseModule> {

        const module = this.client.modules.get(parameter) || [...this.client.modules.values()].find(m => m.name.includes(parameter));

        return module ? this.ok(module) : this.error({ parameter, identifier: 'InvalidModuleError', message: 'Unable to resolve module' });
    };
};