import { Command } from "#structures/Command";
import { rng } from "#util/functions";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'roll',
            description: 'Roll a dice',
            usage: ['(max)'],
        });

        this.module = this.client.modules.get('utilities')!;

    };

    public async messageRun(message: Message, args: Args) {

        const n = await args.pick('integer').catch(() => 6);

        return message.reply(`🎲 You rolled ${rng(1,n)}`);

    };
};