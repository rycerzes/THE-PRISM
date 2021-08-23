import { Command } from '#structures/Command';
import type { Args, PieceContext } from '@sapphire/framework';
import type { Message } from 'discord.js'

export default class extends Command {

    public module = this.client.modules.get('xp')!;

    constructor(context: PieceContext) {
        super(context, {
            name: 'eval',
            description: 'Evaluates a line of code',
            usage: ['```[code]```'],
            preconditions: ['owner']
        });
    };

    public async run(message: Message, args: Args) {
        
        let arg = await args.rest('string');

        let client = this.client

        const code = arg.split('```')[1]
        
        message.reply(await eval(code));

        

    }
};