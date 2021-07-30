import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {

    constructor(context: PieceContext) {
        super(context, {
            name: 'config',
            description: 'Configure the bot',
            usage: ['[option] [value]'],
            preconditions: ['admin', 'guild'],
        });
    };

    public async run(message: Message, args: Args) {

        

    };
};