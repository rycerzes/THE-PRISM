import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'messageCreate',
            event: 'messageCreate'
        })
    }

    public async run(message: Message) {
        
        if (message.partial) await message.fetch();
        if (message.author.bot) return;

        if (message.member) {

            const member = message.member;

            // Increment message stat;
            const data = (await this.db.updateMember(member, `SET messages = messages + 1`))!;

            // XP
            if ((Date.now() - (data.xp_last_message_timestamp || 0)) >= 10000) {
                this.client.emit('xp-add', member, 'message');
            };

        };
    };
};