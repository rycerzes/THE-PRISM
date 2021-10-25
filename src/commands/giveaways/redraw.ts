import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'redraw',
            description: 'Redraw a giveaway.',
            usage: ['[message URL]', '[giveaway ID]'],
            preconditions: ['guild'],
        });

        this.module = this.client.modules.get('giveaways')!;
    };

    public async messageRun(message: Message, args: Args): Promise<any> {

        const giveaway = (await args.pickResult('giveaway')).value;

        if (!giveaway) return this.client.emit('help', message, { command: this });

        // if (giveaway.user_id !== message.author.id || giveaway.guild_id !== message.guild!.id || !message.member!.permissions.has('ADMINISTRATOR'))
        if (giveaway.guild_id !== message.guild!.id || (giveaway.user_id !== message.author.id && !message.member!.permissions.has('ADMINISTRATOR'))) return message.reply({ content: 'You can\'t redraw someone else\'s giveaway.', allowedMentions: { repliedUser: false }});

        const msg = await this.client.util.resolveMessage(giveaway.message_url);

        if (!msg) {
            this.db.deleteGiveaway(giveaway.giveaway_id);
            return message.reply({ content: 'This giveaway no longer exists', allowedMentions: { repliedUser: false }});
        };

        const winner = await this.db.drawGiveaway(giveaway);
        return msg.edit(await this.client.util.giveawayMessage(giveaway, winner));

    };
};