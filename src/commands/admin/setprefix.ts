import { Command } from "#structures/Command";
import { defaults } from "#util/config";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'setprefix',
            description: 'Change the prefix for the bot',
            usage: ['[prefix]'],
            preconditions: ['guild', 'admin'],
            aliases: ['prefix']
        });
    };

    public async run(message: Message, args: Args) {

        const guild = message.guild!;

        const prefix = (await args.pickResult('string')).value;

        if (prefix) {
            await this.db.updateGuild(guild, `SET prefix = '${prefix}'`);
            return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                {
                    title: 'PREFIX UPDATED',
                    description: `PREFIX set to \`${prefix}\``,
                    color: await this.client.util.guildColor(guild)
                }
            ]});
        } else {
            return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                {
                    description: `The current prefix is \`${(await this.db.fetchGuild(guild)).prefix || defaults.prefix}\``,
                    color: await this.client.util.guildColor(guild)
                }
            ]});
        };
    };
};