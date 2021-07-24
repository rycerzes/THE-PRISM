import { Command } from '#structures/Command';
import type { Args, PieceContext } from '@sapphire/framework';
import { Message, MessageAttachment } from 'discord.js'

export default class extends Command {

    public module = this.client.modules.get('xp')!;

    constructor(context: PieceContext) {
        super(context, {
            name: 'rank',
            description: 'Check a member\'s rank.',
            aliases: ['level'],
            preconditions: ['guild']
        });
    };

    public async run(message: Message, args: Args) {
        message.channel.startTyping();
        const member = await args.pick('member').catch(() => message.member!);
        message.channel.send({ files: [new MessageAttachment(await this.client.util.getRankCard(member))]});
        return message.channel.stopTyping();
    }
};