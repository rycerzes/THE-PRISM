import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'setColor',
            description: 'Sets the color for the guild.',
            usage: ['[color]'],
            aliases: ['color'],
            preconditions: ['guild', 'admin']
        });

        this.module = this.client.modules.get('admin')!
    };

    public async messageRun(message: Message, args: Args) {

        const color = await args.pick('color').catch(() => undefined);

        if (color) {

            await this.db.query(`UPDATE guilds SET main_color = '${color}' WHERE guild_id = ${message.guild!.id}`);

            return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                {
                    description: `Set \`COLOR\` to \`${color}\``,
                    color: color
                }
            ]});

        } else {

            return message.reply({ allowedMentions: { repliedUser: false }, content: 'Unabled to resolve color' })
        }

    };
};