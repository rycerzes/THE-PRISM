import type { LevelRole } from "#lib/types/db";
import { Command } from "#structures/Command";
import type { PieceContext } from "@sapphire/framework";
import { ButtonInteraction, MessageActionRow, MessageComponentInteraction } from "discord.js";
import type { Collection, Guild, Message, MessageEmbedOptions, Role, Snowflake } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'levelrole',
            description: 'Configure the level roles.',
            usage: ['add [level] [role]', 'remove [id]'],
            aliases: ['levelroles', 'lr'],
            preconditions: ['admin', 'guild']
        })

        this.module = this.client.modules.get('xp')!
        
    };

    public levelRoles: LevelRole[] = [];

    public async run(message: Message) {

        await this.fetchLevelRoles(message.guild!);
        await message.guild!.roles.fetch();

        const list = await message.reply({ allowedMentions: { repliedUser: false }, embeds: [ await this.listEmbed(message.guild!) ], components: [ this.components() ] });

        // Button Collector
        const collector = list.createMessageComponentCollector({ filter: (interaction: MessageComponentInteraction) => interaction.isButton() && interaction.user.id === message.author.id, time: 300*1000 });

        collector.on('collect', async (interaction: ButtonInteraction) => {

            interaction.update({ components: [ this.components(true) ] })

            let sent: Message | undefined;

            switch (interaction.customId) {

                case 'lrAdd':

                    if ((await this.fetchLevelRoles(message.guild!)).length >= 25) break;

                    sent = await interaction.channel?.send({ content: 'Which please select a level.' });

                    const res = (await interaction.channel?.awaitMessages({ filter: msg => msg.author.id === message.author.id, max: 1, time: 30*1000 }).catch(() => undefined))?.first();
                    const level = Number(res?.content);
                    // If number can be resolved
                    if (!isNaN(level)) {

                        await res?.delete();
                        await sent?.edit({ content: 'Select a role' })

                        const roleRes = (await interaction.channel?.awaitMessages({ filter: msg => msg.author.id === message.author.id, max: 1, time: 30*1000 }).catch(() => undefined))?.first();

                        const role = roleRes ? this.client.util.resolveRole(roleRes?.content, await message.guild!.roles.fetch()) : undefined;

                        if (role) {
                            await this.db.addLevelRole(level, role);
                            
                        };

                        await roleRes?.delete();
                    }
                
                    break;

                case 'lrRemove':

                    sent = await interaction.channel?.send({ content: 'Select which level roles to remove', components: await this.selectMenu(await message.guild!.roles.fetch()) });

                    const int = await sent?.awaitMessageComponent({ filter: (interaction: MessageComponentInteraction) => (interaction.isButton() || interaction.isSelectMenu()) && interaction.user.id === message.author.id, time: 60*1000 }).catch(() => undefined);

                    if (!int || !int.isSelectMenu()) break;

                    for await (const value of int.values) {
                        await this.db.deleteLevelRole(Number(value));
                    };
                
                    break;

                case 'lrToggleStack':

                    await this.db.toggleStackLevelRoles(message.guild!);

                    break;
            };

            await this.fetchLevelRoles(message.guild!);
            await sent?.delete();
            await list.edit({ embeds: [ await this.listEmbed(message.guild!) ], components: [ this.components(false) ] })
        });

        collector.on('end', async () => {
            await list.edit({ components: [ this.components(true) ] })
        });

    };

    private async fetchLevelRoles(guild: Guild): Promise<LevelRole[]> {
        return this.levelRoles = await this.db.getLevelRoles(guild);
    }

    private components(disabled: boolean = false) {

        return new MessageActionRow(
            {
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'BUTTON',
                        label: 'ADD',
                        style: 'SUCCESS',
                        customId: 'lrAdd',
                        emoji: '➕',
                        disabled: this.levelRoles.length >= 25 ? true : disabled
                    },
                    {
                        type: 'BUTTON',
                        label: 'REMOVE',
                        style: 'DANGER',
                        customId: 'lrRemove',
                        emoji: '➖',
                        disabled: disabled
                    },
                    {
                        type: 'BUTTON',
                        label: 'TOGGLE TYPE',
                        style: 'SECONDARY',
                        customId: 'lrToggleStack',
                    }
                ]
            }
        )
    };

    private async selectMenu(roles: Collection<Snowflake, Role>, disabled: boolean = false): Promise<MessageActionRow[]> {

        if (this.levelRoles.length < 1) return [];

        return [
            new MessageActionRow({
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'SELECT_MENU',
                        options: [...this.levelRoles].sort((a, b) => a.level - b.level).splice(0, 24).map(r => {

                            const option = {
                                label: `ID: ${r.level_role_id} | ${roles.find(role => role.id === r.role_id)?.name}`,
                                description: `Lvl [${r.level}]`,
                                value: String(r.level_role_id)
                            };
                            return option;
                        }),
                        customId: 'lrSelectMenu',
                        placeholder: 'Select Level Roles to remove...',
                        minValues: 1,
                        maxValues: this.levelRoles.length
                    }
                ]
            }),
            new MessageActionRow({
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'BUTTON',
                        label: 'CANCEL',
                        style: 'SECONDARY',
                        customId: 'lrRemCancel',
                        disabled: disabled
                    }
                ]
            })
        ];
    };

    private async listEmbed(guild: Guild): Promise<MessageEmbedOptions> {

        return {
            title: 'LEVEL ROLES',
            description: this.desc,
            fields: [
                {
                    name: 'TYPE',
                    value:  `When a member reaches a new level role:\n${await this.getTypeField(guild)}`
                }
            ],
            color: await this.client.util.guildColor(guild)
        }

    };

    private async getTypeField(guild: Guild): Promise<string> {

        const i = await this.db.stackLevelRoles(guild) ? 0 : 1

        return [
            `☑ - Stack previous level roles\n⬛ - Remove previous level roles`,
            `⬛ - Stack previous level roles\n☑ - Remove previous level roles`,
        ][i]

    };

    private get desc() {

        const arr = [...this.levelRoles].sort((a, b) => a.level - b.level);

        return arr.length > 0 ? `\`${arr.length}\` level roles.\n\n${arr.map(r => `\`ID: ${r.level_role_id}.\` **|** \` Lvl [${r.level}]\` **|** <@&${r.role_id}>`).join('\n')}` : 'none'
    }
};