import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'text-mod-wordfilter',
            event: 'messageCreate'
        });
    };

    public async run(message: Message) {

        const guild = message.guild;

        if (!guild || !await this.checkModule(guild, 'text-mod')) return;

        const words = await this.db.getWords(guild);

        const any = words.filter(word => word.match_any).map(word => word.text.toLowerCase());
        const exact = words.filter(word => !word.match_any).map(word => word.text.toLowerCase());

        if (exact.includes(message.content.toLowerCase())) return message.delete();

        for (const word of any) {

            if (message.content.toLowerCase().includes(word)) return message.delete();

        };

        return;

    };
};