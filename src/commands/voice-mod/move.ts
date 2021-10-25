import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'move',
            description: 'Move members from one voice channel to another',
            usage: ['[channel] (members)'],
            preconditions: ['guild', 'moderator'],
        });

        this.module = this.client.modules.get('voice-mod')!

    };

    public async messageRun(message: Message, args: Args) {

        const channel = (await args.pickResult('guildVoiceChannel')).value;

        if (!channel) return message.reply({ allowedMentions: { repliedUser: false }, content: 'Invalid channel.' });

        const members = await args.rest('members').catch(() => [...message.member!.voice.channel!.members.values()]).catch(() => undefined);

        if (!members) return message.reply({ allowedMentions: { repliedUser: false }, content: 'You must be in a voice channel' });

        for (const member of members) {

            member.voice.setChannel(channel);

        };

        return await message.react('👌');
    };
};