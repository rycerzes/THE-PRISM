import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { MessageReaction, User } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'pins-reactions-messageReactionAdd',
            event: 'messageReactionAdd'
        });
    };

    public async run(messageReaction: MessageReaction, user: User) {

        // If bot already reacted.
        if (messageReaction.me || messageReaction.emoji.name !== '📌') return;

        const message = messageReaction.message.partial ? await messageReaction.message.fetch() : messageReaction.message;
        const guild = message.guild;

        if (!guild || !await this.client.checkModule('pins', guild)) return;

        if (message.author.id === user.id) return messageReaction.users.remove(user.id);

        const { pins_channel_id, pins_reaction_count } = await this.db.fetchConfig(guild);

        if (!pins_channel_id || messageReaction.count < pins_reaction_count) return;

        const channel = await guild.channels.fetch(pins_channel_id);

        if (channel) {

            await message.react('📌');
            return this.client.emit('pinCreate', message, channel);

        } else return this.db.updateConfig(message.guild!, `SET pins_channel_id = null`);;

    };
};