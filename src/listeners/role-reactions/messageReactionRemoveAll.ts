import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'role-reactions-messageReactionRemoveAll',
            event: 'messageReactionRemoveAll'
        });
    };

    public async run(message: Message) {

        if (!message.guild || !await this.client.checkModule('role-reactions', message.guild)) return;

        const reactionMessage = await this.db.getReactionMessage({ url: message.url });

        if (!reactionMessage) return;

        const reactions = await this.db.getReactions(reactionMessage.reaction_message_id);

        for (const reaction of reactions) {
            await message.react(reaction.emoji)
        };

    };
};