import Color from "color";
import { Argument } from "#structures/Argument";
import type { AsyncArgumentResult, PieceContext } from "@sapphire/framework";
import type { ColorResolvable } from "discord.js";

export default class extends Argument<ColorResolvable> {
    
    constructor(context: PieceContext) {
        super(context, { name: 'color' });
    };

    public async run(parameter: string ): AsyncArgumentResult<ColorResolvable> {
        
        try {
            const color = new Color(parameter);

            return color ? this.ok(color.hex() as ColorResolvable) : this.error({ parameter, identifier: 'InvalidColorError', message: 'Unable to resolve color'})

        } catch {
            return this.error({ parameter, identifier: 'ArgumentError', message: 'Unable to resolve color'})
        }

    }
}