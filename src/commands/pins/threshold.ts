import { Command } from "#structures/Command";
import { colors } from "#util/constants";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor( context: PieceContext) {
        super(context, {
            name: 'threshold',
            description: 'Set the minimum number of reactions a message needs to be pinned',
            detailedDescription: 'Set the minimum number of reactions a message needs to be pinned\nThe value must be within the range of `1-100`',
            usage: ['[number]'],
            preconditions: ['admin', 'guild'],
            aliases: ['minpins', 'setpins', 'setnumber']
        });

        this.module = this.client.modules.get('pins')!;

    };

    public async run(message: Message, args: Args): Promise<Message | boolean> {

        const nn = (await args.pickResult('integer')).value;

        if (!nn || nn < 1 || nn > 100) return this.client.emit('help', message, { command: this });

        const { pins_reaction_count } = await this.db.updateConfig(message.guild!, `SET pins_reaction_count = ${nn}`);

        return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
            {
                title: 'CONFIG UPDATED',
                description: `Set pin reaction count to \` ${pins_reaction_count} \``,
                color: colors.green
            }
        ]});

    };
};