import { Command } from "#structures/Command";
import { colors } from "#util/config";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message, NewsChannel, TextChannel, ThreadChannel } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'clear',
            description: 'Bulk delete messages',
            usage: ['[amount]'],
            preconditions: ['moderator', 'guild'],
            aliases: ['bulkdelete']
        });
    };

    public async run(message: Message, args: Args) {

        const n = (await (args.pickResult('integer'))).value;

        if (!n || n < 1 || n > 99) return message.reply({ content: 'Please provie a number of messages to be deleted. (1-99)', allowedMentions: { repliedUser: false }});

        await (message.channel as TextChannel | NewsChannel | ThreadChannel).bulkDelete(n+1);

        let sent = await message.channel.send({ embeds: [
            {
                description: `✅ Cleared \`${n}\` messages.`,
                color: colors.green
            }
        ]});

        return setTimeout(() => sent.delete(), 5000)
    };
};