import type { ConfigOptions } from "#lib/types/db";
import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { CategoryChannel, Message, Snowflake, TextChannel } from "discord.js";

export default class extends Command {

    constructor(context: PieceContext) {
        super(context, {
            name: 'setchannel',
            description: 'Set PRISM\'s custom channels',
            usage: ['[option] [channel]'],
            preconditions: ['admin', 'guild'],
            aliases: ['channel']
        });
    };

    public async run(message: Message, args: Args) {

        // Get channel option
        // LOGS | LEVELS | PINS | CALLS | COUNTING ...
        const channelOption = await args.pick('configChannel').catch(() => undefined);
        if (!channelOption) return message.reply({ content: 'Please specify which channel you would like to set.', allowedMentions: { repliedUser: false }});

        let value: string;

        // Check if user wishes to set channel to null
        const peeked = await args.peekResult('null').catch();

        if (peeked.success) {

            // Set value to null if the user specified.
            value = 'null';

        } else {

            let channel: TextChannel | CategoryChannel | undefined;

            switch (channelOption) {
            
                case 'LOGS':
                case 'LEVELS':
                case 'PINS':
                case 'COUNTING':
                    channel = await args.pick('guildTextChannel').catch(() => undefined);
                    break;
                case 'CALLS':
                    channel = await args.pick('guildCategoryChannel').catch(() => undefined);
                    break;
                default:
                    return message.reply({ content: 'An error occurred.' });

            };

            if (!channel) return message.reply({ content: 'Please provide a valid channel.', allowedMentions: { repliedUser: false }});

            value = channel.id

        }
        
        // Set value
        await this.db.updateConfig(message.guild!, `SET ${channelOption.toLowerCase()}_channel_id = ${value}`);

        // Notify user.
        return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
            {
                description: `Set \`${channelOption}\` channel to ${value === 'null' ? '`null`' : `<#${value}>`}.`,
                color: await this.client.util.guildColor(message.guild!)
            }
        ]});

    };
};