import type { JoinRole } from "#lib/types/db";
import { Command } from "#structures/Command";
import type { PieceContext } from "@sapphire/framework";
import { ButtonInteraction, Guild, Message, MessageActionRow, MessageComponentInteraction, MessageEmbed, Role, SelectMenuInteraction } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'joinroles',
            description: 'Configure join roles',
            usage: [''],
            preconditions: ['admin', 'guild'],
        });
    };

    private joinRoles: JoinRole[] = [];

    public async messageRun(message: Message) {

        const guild = message.guild!;

        await this.fetchjoinRoles(guild);

        let list = await message.reply({ allowedMentions: { repliedUser: false }, embeds: await this.embeds(guild), components: this.components() });

        const collector = list.createMessageComponentCollector({ filter: (interaction: MessageComponentInteraction) => interaction.isButton() && interaction.user.id === message.author.id, time: 300*1000 });

        collector.on('collect', async (interaction: ButtonInteraction) => {

            await interaction.update({ components: this.components(true) });

            let sent: Message | undefined; let res: Message | undefined; let int: ButtonInteraction | SelectMenuInteraction | undefined;

            switch (interaction.customId) {

                case 'jrAdd':

                    let role: Role | undefined

                    sent = await interaction.channel?.send('Provide a role:');
                    res = (await interaction.channel?.awaitMessages({ filter: msg => msg.author.id === message.author.id, max: 1, time: 30*1000 }).catch(() => undefined))?.first();

                    if (res?.content) role = this.client.util.resolveRole(res.content, await guild.roles.fetch());
                    if (res) await res.delete();

                    if (!role) break;

                    await this.db.addJoinRole(guild, role);
                    
                    break;

                case 'jrRemove':

                    sent = await interaction.channel?.send({ content: '\u200b', components: await this.selectMenu(guild) })
                    int = await sent?.awaitMessageComponent({ filter: (i: MessageComponentInteraction) => i.user.id === interaction.user.id, time: 60*1000 }).catch(() => undefined) as SelectMenuInteraction | ButtonInteraction | undefined;

                    if (!int || !int.isSelectMenu()) break;

                    for await (const value of int.values) {
                        await this.db.deleteJoinRole(Number(value));
                    };

                    break;
            };

            if (sent) await sent.delete();
            await this.fetchjoinRoles(guild);
            await list.edit({ embeds: await this.embeds(guild), components: this.components() })

        });

    };

    private async embeds(guild: Guild): Promise<MessageEmbed[]> {

        return [
            new MessageEmbed({
                title: 'JOIN ROLES',
                description: this.joinRoles.length > 0 ? this.joinRoles.map(r => `\`ID: ${r.join_role_id}.\` • <@&${r.role_id}>`).join('\n') : '`none`',
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
                        customId: 'jrAdd',
                        disabled: this.joinRoles.length >= 15 || disabled
                    },
                    {
                        type: 'BUTTON',
                        label: 'REMOVE',
                        emoji: '➖',
                        style: 'DANGER',
                        customId: 'jrRemove',
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
                        placeholder: 'Select which join roles to remove',
                        maxValues: this.joinRoles.length,
                        minValues: 1,
                        options: await Promise.all(this.joinRoles.map(async r => {
                            
                            const role = await guild.roles.fetch(r.role_id);

                            return {
                                label: `ID: ${r.join_role_id}`,
                                description: role ? role.name : r.role_id,
                                value: `${r.join_role_id}`
                            }
                        })),
                        customId: 'jrSelectMenu'
                    }
                ]
            }),
            new MessageActionRow({
                components: [
                    {
                        type: 'BUTTON',
                        label: 'CANCEL',
                        style: 'DANGER',
                        customId: 'jrSelectMenuCancel'
                    }
                ]
            })
        ];
    };

    private async fetchjoinRoles(guild: Guild): Promise<JoinRole[]> {
        return this.joinRoles = await this.db.getJoinRoles(guild)
    }
};