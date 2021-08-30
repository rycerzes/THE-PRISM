import { Command } from "#structures/Command";
import { colors } from "#util/constants";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'setmodrole',
            description: 'Set moderator role',
            usage: ['[role]', 'remove'],
            aliases: ['modrole'],
            preconditions: ['admin', 'guild']
        });

        this.module = this.client.modules.get('admin')!
    };

    public async run(message: Message, args: Args) {
        
        const peeked = await args.peekResult('string');

        if (['remove', 'rm', 'rem'].includes(peeked.value?.toLowerCase() || '')) {
            
            await this.db.updateGuild(message.guild!, `SET mod_role_id = null`);

            return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                {
                    title: 'MOD ROLE REMOVED',
                    color: colors.red,
                    timestamp: Date.now()
                }
            ]});

        } else {

            const role = (await args.pickResult('role')).value;

            if (role) {

                await this.db.updateGuild(message.guild!, `SET mod_role_id = ${role.id}`);

                return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                    {
                        title: 'MOD ROLE UPDATED',
                        description: `${role}`,
                        color: await this.client.util.guildColor(message.guild!),
                        timestamp: Date.now()
                    }
                ]});


            } else return message.reply({ allowedMentions: { repliedUser: false }, content: 'Unable to resolve role' })

        };

    };
};