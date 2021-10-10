import { Argument, ArgumentContext, AsyncArgumentResult, PieceContext } from "@sapphire/framework";

export default class extends Argument<number> {

    constructor(context: PieceContext) {
        super(context, {name: 'rankpage'});
    };

    public async run(parameter: string, { rankingMessage, resolve }: ArgumentContext): AsyncArgumentResult<number> {
        
        // Try number
        let num: number | undefined = Number(parameter);
        
        // Try resolve
        if (isNaN(num)) {

            let element = await resolve({parameter, array: rankingMessage.array});

            if (element) {

                let index = rankingMessage.array.indexOf(element);
                num = Math.ceil((index+1)/rankingMessage.perPage)

            } else {
                this.error({ parameter, identifier: 'InvlidPageError', message: 'Unabled to resolve page from string' })
            }

        }

        return num > 0 ? this.ok(Math.floor(num)) : this.error({ parameter, identifier: 'ArgumentError', message: 'Unabled to resolve page from string' });
    }
}