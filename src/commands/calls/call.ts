import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'call',
            description: 'Create\'s a temporary call',
            usage: ['(userlimit) (name)'],
            preconditions: ['guild'],
            aliases: ['pcall']
        });

        this.module = this.client.modules.get('calls')!;
    };

    public async run(message: Message, args: Args) {

        const guild = message.guild!;

        const priv = args.commandContext.commandName === 'pcall' ? true : false;

        const { calls_channel_id } = await this.db.fetchConfig(guild);

        if (!calls_channel_id) return message.reply({ allowedMentions: { repliedUser: false }, content: 'No parent channel has been set. Calls will be unavailable.'});

        let userLimit = await args.pick('integer').catch(() => 0);
        let name = (await args.pickResult('string')).value

        if (!name || name.length > 100) name = `${message.member?.displayName || message.author.username}'s Channel`;

        try {

            const vc = await guild.channels.create(name, {
                type: 'GUILD_VOICE',
                userLimit: userLimit,
                parent: calls_channel_id,
                permissionOverwrites: [
                    {
                        id: message.author.id,
                        allow: ['VIEW_CHANNEL']
                    },
                    {
                        id: this.client.user!.id,
                        allow: ['VIEW_CHANNEL']
                    },
                    priv ? { id: guild.roles.everyone.id, deny: ['VIEW_CHANNEL'] } : { id: guild.roles.everyone.id, allow: ['VIEW_CHANNEL'] }
                ]
            });

            const tc = await guild.channels.create(name, {
                type: 'GUILD_TEXT',
                parent: calls_channel_id,
                permissionOverwrites: [
                    {
                        id: message.author.id,
                        allow: ['VIEW_CHANNEL']
                    },
                    {
                        id: this.client.user!.id,
                        allow: ['VIEW_CHANNEL']
                    },
                    {
                        id: guild.roles.everyone.id,
                        deny: ['VIEW_CHANNEL']
                    }
                ]
            });
            
            await this.db.createCall(guild, message.author, vc, tc)

            return tc.send('Help message')

        } catch (e) {
            console.log(e)
            return message.reply('An error occured')
        }

    };
};