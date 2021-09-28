import { Command } from "#structures/Command";
import { emoji } from "#util/constants";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'poll',
            description: 'Create a poll',
            detailedDescription: 'Create a poll. You must provide 2-20 options.',
            usage: ['question; option 1; option 2; option 3...'],
            preconditions: ['guild'],
        });

        this.module = this.client.modules.get('utilities')!;

    };

    public async run(message: Message, args: Args): Promise<boolean | Message | undefined> {

        const str = await args.rest('string').catch(() => undefined);
        let options = str?.split(';');

        if (!options) return this.client.emit('help', message, { command: this })

        const question = options.shift();

        if (!question || options.length < 2 || options.length > 20) return message.reply({ allowedMentions: { repliedUser: false }, content: 'Please provide 2-20 options' });

        const emojis = Object.values(emoji).slice(11);

        for (const i in options) {
            options[i] = `${emojis[i]} - ${options[i]}`
        };

        let sent = await message.channel.send({ content: `${message.member!} asks:`, embeds: [
            {
                description: `**"${question.trim()}"**\n\n${options.join('\n')}`,
                thumbnail: {
                    url: message.author.displayAvatarURL()
                },
                color: await this.client.util.guildColor(message.guild!)
            }
        ]});

        message.delete();

        for (const i in options) {
            await sent.react(emojis[i]);
        };

        return;

    };
};