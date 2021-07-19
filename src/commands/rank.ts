import { Command } from '#structures/Command';
import type { PieceContext } from '@sapphire/framework';
import { Message, MessageAttachment } from 'discord.js'

export default class extends Command {

    public module = this.client.modules.get('xp') || null;

    constructor(context: PieceContext) {
        super(context, {
            name: 'rank',
            description: 'Check a member\'s rank.',
            aliases: ['level']
        });
    };

    public async run(message: Message) {
        message.channel.startTyping()
        message.channel.send({ files: [new MessageAttachment(await this.client.util.getRankCard(message.member!))]});
        return message.channel.stopTyping()
    }
};