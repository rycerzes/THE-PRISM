import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'mesageCreate',
            event: 'messageCreate'
        })
    }

    public async run(message: Message) {
        console.log(message.content)
    }
}