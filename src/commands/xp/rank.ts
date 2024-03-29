import { Command } from '#structures/Command';
import type { Args, PieceContext } from '@sapphire/framework';
import { Message, MessageAttachment } from 'discord.js'

export default class extends Command {

    public module = this.client.modules.get('xp')!;

    constructor(context: PieceContext) {
        super(context, {
            name: 'rank',
            description: 'Check a member\'s rank.',
            usage: ['(member)'],
            aliases: ['level'],
            preconditions: ['guild']
        });

        this.module = this.client.modules.get('xp')!
    };

    public async messageRun(message: Message, args: Args) {

        const member = await args.pick('member').catch(() => message.member!);
        
        message.channel.send({ files: [new MessageAttachment(await this.client.util.getRankCard(member))]});

    }
};