import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { Message, TextChannel } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'counting-messageCreate',
            event: 'messageCreate'
        });
    };

    public async run(message: Message) {

        // Check for guild
        const guild = message.guild;
        if (!guild || !await this.checkModule(guild, 'counting')) return;

        // Check if same channel
        const { counting_channel_id } = await this.db.fetchConfig(guild);
        if (!counting_channel_id || message.channel.id !== counting_channel_id) return;

        // Check if channel exists
        const channel = await this.client.channels.fetch(counting_channel_id) as TextChannel;
        if (!channel) return await this.db.updateConfig(guild, `SET counting_channel_id = null`);

        if (message.author.id === this.client.user?.id && !isNaN(Number(message.content))) return;

        // Actual code :)

        // If string does not match a number
        console.log(message.member?.displayName, "Checking if string is number")
        if (!/^\d+$/.test(message.content)) return message.delete();

        // Get counts
        const { counting_count } = await this.db.fetchGuild(guild);
        const count = Number(message.content);
        
        // Get previous message
        const lastMessage = (await channel.messages.fetch({ limit: 1, before: message.id  }).catch(() => undefined))?.first();

        // If same author
        if (lastMessage && (lastMessage.author.id === message.author.id)) return message.delete();

        // If NaN or not next count
        let deleted = false;
        if (isNaN(count) || count !== counting_count + 1) {
            await message.delete();
            deleted = true;
        };

        // If count not the same
        if (lastMessage && Number(lastMessage.content) !== counting_count && count !== counting_count + 1) return channel.send(`${counting_count}`);

        // If message was deleted
        else if (deleted) return;

        // Else
        await this.db.updateGuild(guild, `SET counting_count = counting_count + 1`);
        return await this.db.updateMember(message.member!, `SET counting_counts = counting_counts + 1, counting_last_message_url = '${message.url}'`);

    };
};