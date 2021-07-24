import { Argument, ArgumentContext, AsyncArgumentResult, PieceContext } from "@sapphire/framework";

export default class extends Argument<number> {

    constructor(context: PieceContext) {
        super(context, {name: 'rankpage'});
    };

    public async run(parameter: string, { map }: ArgumentContext): AsyncArgumentResult<number> {
        
        // Try number
        let num = Number(parameter);
        
        console.log(num, map?.size);

        return num ? this.ok(num) : this.error({ parameter, identifier: 'InvlidPageError', message: 'Unabled to resolve page from string' });
    }
}