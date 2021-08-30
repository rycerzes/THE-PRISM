import { Command } from "#structures/Command";
import { blankField } from "#util/constants";
import type { PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'server',
            description: 'View server info',
            usage: [''],
            preconditions: ['guild'],
            aliases: ['guild', 'serverinfo', 'guildinfo']
        });

        this.module = this.client.modules.get('info')!
    };

    public async run(message: Message) {

        const guild = message.guild!;

        const info = await this.db.fetchGuild(guild);

        const members = await guild.members.fetch();

        return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
            {
                title: guild.name.toUpperCase(),
                description: `Owner - <@${guild.ownerId}> **|** Created - <t:${Math.floor(guild.createdTimestamp/1000)}:R>\n───────────────────────────\u200b`,
                fields: [
                    {
                        name: 'PREFIX',
                        value: `\`${await this.client.fetchPrefix(message)}\``,
                        inline: true
                    },
                    // Members
                    {
                        name: 'MEMBERS',
                        value: `\` ${members.size} \``,
                        inline: true
                    },
                    //blankFieldInline,
                    {
                        name: 'BOTS',
                        value: `\` ${members.filter(m => m.user.bot).size} \``,
                        inline: true
                    },
                    blankField,
                    // Roles
                    {
                        name: 'ROLES',
                        value: `\` ${(await guild.roles.fetch()).size} \``,
                        inline: true
                    },
                    {
                        name: 'MOD ROLE',
                        value: info.mod_role_id ? `<@&${info.mod_role_id}>` : '`null`',
                        inline: true
                    },
                    {
                        name: 'MUTE ROLE',
                        value: info.mute_role_id ? `<@&${info.mute_role_id}>` : '`null`',
                        inline: true
                    },
                ],
                thumbnail: {
                    url: guild.iconURL({ size: 4096 }) ?? undefined
                },
                image: {
                    url: guild.bannerURL({ size: 1024, format: 'png' }) ?? undefined
                },
                color: await this.client.util.guildColor(guild),
                footer: {
                    text: `ID | ${guild.id}`
                }
            }
        ]})

    };
};