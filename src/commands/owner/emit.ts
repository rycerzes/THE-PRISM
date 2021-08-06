import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    
    constructor(context: PieceContext) {
        super(context, {
            name: 'emit',
            description: 'Emit a client event',
            usage: ['[event]'],
            preconditions: ['owner']
        });
    };

    public async run(message: Message, args: Args) {

        const event = await args.pickResult('event');

        switch (event.value) {
            
            case 'guildMemberAdd':
                this.client.emit('guildMemberAdd', message.member!);
                break;
            
            case 'guildMemberRemove':
                this.client.emit('guildMemberRemove', message.member!);
                break;

        }

    }
}