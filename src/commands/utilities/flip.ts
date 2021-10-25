import { Command } from "#structures/Command";
import { rng } from "#util/functions";
import type { PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'flip',
            description: 'Flip a coin',
            usage: [''],
        });

        this.module = this.client.modules.get('utilities')!;

    };

    public async messageRun(message: Message) {

        return message.reply(`🪙 ${['Heads!', 'Tails!'][rng(0,1)]}`);

    };
};