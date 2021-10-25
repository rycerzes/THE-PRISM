import type { RoleHeader } from "#lib/types/db";
import { Command } from "#structures/Command";
import type { PieceContext } from "@sapphire/framework";
import { ButtonInteraction, Guild, Message, MessageActionRow, MessageComponentInteraction, MessageEmbed, Role, SelectMenuInteraction } from "discord.js";

export default class extends Command {
    
    constructor(context: PieceContext) {
        super(context, {
            name: 'roleheaders',
            description: 'Add/remove role headers',
            detailedDescription: 'Add/remove role headers.\nRole headers are roles that separate user roles up.',
            usage: [''],
            preconditions: ['admin', 'guild'],
            aliases: ['separators', 'rh']
        });

        this.module = this.client.modules.get('role-headers')!

    };

    private roleHeaders: RoleHeader[] = [];

    public async messageRun(message: Message) {

        const guild = message.guild!;

        await this.fetchRoleHeaders(guild);

        let list = await message.reply({ allowedMentions: { repliedUser: false }, embeds: await this.embeds(guild), components: this.components() });

        const collector = list.createMessageComponentCollector({ filter: (interaction: MessageComponentInteraction) => interaction.isButton() && interaction.user.id === message.author.id, time: 300*1000 });

        collector.on('collect', async (interaction: ButtonInteraction) => {

            await interaction.update({ components: this.components(true) });

            let sent: Message | undefined; let res: Message | undefined; let int: ButtonInteraction | SelectMenuInteraction | undefined;

            switch (interaction.customId) {

                case 'rhAdd':

                    let role: Role | undefined

                    sent = await interaction.channel?.send('Provide a role:');
                    res = (await interaction.channel?.awaitMessages({ filter: msg => msg.author.id === message.author.id, max: 1, time: 30*1000 }).catch(() => undefined))?.first();

                    if (res?.content) role = this.client.util.resolveRole(res.content, await guild.roles.fetch());
                    if (res) await res.delete();

                    if (!role) break;

                    await this.db.addRoleHeader(guild, role);
                    
                    break;

                case 'rhRemove':

                    sent = await interaction.channel?.send({ content: '\u200b', components: await this.selectMenu(guild) })
                    int = await sent?.awaitMessageComponent({ filter: (i: MessageComponentInteraction) => i.user.id === interaction.user.id, time: 60*1000 }).catch(() => undefined) as SelectMenuInteraction | ButtonInteraction | undefined;

                    if (!int || !int.isSelectMenu()) break;

                    for await (const value of int.values) {
                        await this.db.deleteRoleHeader(Number(value));
                    };

                    break;
            };

            if (sent) await sent.delete();
            await this.fetchRoleHeaders(guild);
            await list.edit({ embeds: await this.embeds(guild), components: this.components() })

        });

    };

    private async embeds(guild: Guild): Promise<MessageEmbed[]> {

        return [
            new MessageEmbed({
                title: 'ROLE HEADERS',
                description: this.roleHeaders.length > 0 ? this.roleHeaders.map(r => `\`ID: ${r.role_header_id}.\` • <@&${r.role_id}>`).join('\n') : '`none`',
                color: await this.client.util.guildColor(guild)
            })
        ]

    };

    private components(disabled = false): MessageActionRow[] {

        return [
            new MessageActionRow({
                components: [
                    {
                        type: 'BUTTON',
                        label: 'ADD',
                        emoji: '➕',
                        style: 'SUCCESS',
                        customId: 'rhAdd',
                        disabled: this.roleHeaders.length >= 15 || disabled
                    },
                    {
                        type: 'BUTTON',
                        label: 'REMOVE',
                        emoji: '➖',
                        style: 'DANGER',
                        customId: 'rhRemove',
                        disabled
                    }
                ]
            })
        ]
    };

    private async selectMenu(guild: Guild) {

        return [
            new MessageActionRow({
                components: [
                    {
                        type: 'SELECT_MENU',
                        placeholder: 'Select which role headers to remove',
                        maxValues: this.roleHeaders.length,
                        minValues: 1,
                        options: await Promise.all(this.roleHeaders.map(async r => {
                            
                            const role = await guild.roles.fetch(r.role_id);

                            return {
                                label: `ID: ${r.role_header_id}`,
                                description: role ? role.name : r.role_id,
                                value: `${r.role_header_id}`
                            }
                        })),
                        customId: 'rhSelectMenu'
                    }
                ]
            }),
            new MessageActionRow({
                components: [
                    {
                        type: 'BUTTON',
                        label: 'CANCEL',
                        style: 'DANGER',
                        customId: 'rhSelectMenuCancel'
                    }
                ]
            })
        ];
    };

    private async fetchRoleHeaders(guild: Guild): Promise<RoleHeader[]> {
        return this.roleHeaders = await this.db.getRoleHeaders(guild)
    }
};