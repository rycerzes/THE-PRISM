import { Command } from "#structures/Command";
import { colors } from "#util/constants";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {

    constructor(context: PieceContext) {
        super(context, {
            name: 'setmuterole',
            description: 'Set the muted role',
            usage: ['[role]', 'create'],
            preconditions: ['admin', 'guild'],
            aliases: ['muterole']
        });

        this.module = this.client.modules.get('admin')!
    };

    public async run(message: Message, args: Args) {

        const peeked = await args.peekResult('string');

        if (peeked.value?.toLowerCase() === 'create') {

            const role = await message.guild!.roles.create({ name: 'Muted', color: '#1d1d1d'});

            await this.db.updateGuild(message.guild!, `SET mute_role_id = ${role.id}`);

            return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                {
                    title: 'MUTE ROLE CREATED',
                    description: `${role}`,
                    color: colors.green,
                    timestamp: Date.now()
                }
            ]});

        } else if (peeked.value?.toLowerCase() === 'remove') {

            await this.db.updateGuild(message.guild!, `SET mute_role_id = null`);

            return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                {
                    title: 'MUTE ROLE REMOVED',
                    color: colors.red,
                    timestamp: Date.now()
                }
            ]});

        } else {

            const role = (await args.pickResult('role')).value;

            if (role) {

                await this.db.updateGuild(message.guild!, `SET mute_role_id = ${role.id}`);

                return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                    {
                        title: 'MUTE ROLE UPDATED',
                        description: `${role}`,
                        color: await this.client.util.guildColor(message.guild!),
                        timestamp: Date.now()
                    }
                ]});
                
            } else {

                return message.reply({ allowedMentions: { repliedUser: false }, content: 'Unable to resolve role.'});

            }

        }

    };

};