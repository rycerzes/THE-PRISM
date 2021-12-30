import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { MessageReaction, User } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'role-reactions-messageReactionRemove',
            event: 'messageReactionRemove'
        });
    };

    public async run(messageReaction: MessageReaction, user: User) {

        if (messageReaction.partial) await messageReaction.fetch();

        if (!messageReaction.message.guild || !await this.client.checkModule('role-reactions', messageReaction.message.guild)) return;

        const reactionMessage = await this.db.getReactionMessage({ url: messageReaction.message.url });

        if (!reactionMessage) return;

        if (user.bot) return;

        const reactions = await this.db.getReactions(reactionMessage.reaction_message_id);
        const rEmoji = messageReaction.emoji.id ? messageReaction.emoji.id : messageReaction.emoji.name;

        const reaction = reactions.find(r => r.emoji === rEmoji);

        if (reaction) (await messageReaction.message.guild.members.fetch(user.id)).roles.remove(reaction?.role_id);

    };
};