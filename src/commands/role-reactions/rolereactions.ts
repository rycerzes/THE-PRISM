import type { Reaction, ReactionMessage } from "#lib/types/db";
import { Command } from "#structures/Command";
import { RegEx } from "#util/constants";
import type { Args, PieceContext } from "@sapphire/framework";
import { ButtonInteraction, Guild, GuildEmoji, Message, MessageActionRow, MessageComponentInteraction, MessageEmbedOptions, Role, SelectMenuInteraction } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'rolereactions',
            description: 'Manage the role reactions for a role reaciton message',
            usage: ['[message url | reaction message ID]'],
            preconditions: ['guild', 'admin'],
            aliases: ['rr']
        });

        this.module = this.client.modules.get('role-reactions')!
    };

    private reactions: Reaction[] = [];
    private rm: ReactionMessage | undefined

    public async messageRun(message: Message, args: Args) {

        const guild = message.guild!
    
        this.rm = (await args.pickResult('reactionMessage')).value;

        if (!this.rm || this.rm.guild_id !== guild.id) return message.reply({ allowedMentions: { repliedUser: false }, content: 'Please provide a valid message link' });

        await this.fetchReactions(this.rm);

        const list = await message.channel.send({ embeds: await this.embeds(guild), components: this.components() });

        const collector = list.createMessageComponentCollector({ time: 300*1000, filter: (interaction: MessageComponentInteraction) => interaction.user.id === message.author.id && interaction.isButton() });

        let sent: Message | undefined; let res: Message | undefined; let int: SelectMenuInteraction | undefined;

        collector.on('collect', async (interaction: ButtonInteraction) => {

            await interaction.update({ components: this.components(true) });

            switch (interaction.customId) {

                case 'rrAdd':

                    let role: Role | undefined; let emoji: string;

                    sent = await interaction.channel?.send({ content: 'Provide a role:' });
                    res = (await interaction.channel?.awaitMessages({ filter: msg => msg.author.id === message.author.id, max: 1, time: 30*1000 }).catch(() => undefined))?.first();

                    if (res?.content) {

                        role = await this.client.util.resolveRole(res.content, await guild.roles.fetch());
                        if (!role) break;

                    } else break;

                    await res?.delete();
                    await sent?.edit({ content: 'Provide an emoji:', embeds: [
                        {
                            fields: [{ name: 'ROLE', value: `${role}` }],
                            color: await this.client.util.guildColor(guild)
                        }
                    ] });
                    res = (await interaction.channel?.awaitMessages({ filter: msg => msg.author.id === message.author.id, max: 1, time: 30*1000 }).catch(() => undefined))?.first();
                
                    if (res?.content) {

                        try {
                            await res.react(res.content);
                        } catch {
                            break;
                        }

                        if (RegEx.mentions.emoji.test(res.content)) {
                            
                            const id = res.content.replace(/\D/gmi, '');
                            const ee = (await guild.emojis.fetch(id));

                            if (ee) emoji = ee.id
                            else break;

                        } else if (RegEx.snowflake.test(res.content)) {
                            const ee = (await guild.emojis.fetch(res.content));
                            if (ee) emoji = ee.id
                            else break;
                        } else emoji = res.content;

                    } else break;

                    await this.db.addReaction(this.rm!, role, emoji);

                    break;

                case 'rrRemove':

                    sent = await interaction.channel?.send({ content: 'Select which reactions to remove:', components: await this.selectMenu(guild) });
                    int = await sent?.awaitMessageComponent({ filter: (interaction: MessageComponentInteraction) => interaction.user.id === message.author.id && interaction.customId === 'rrSelectMenu' && interaction.isSelectMenu(), time: 60*1000 }).catch(() => undefined) as SelectMenuInteraction;

                    if (!int) break;

                    for (const id of int.values) {
                        await this.db.deleteReaction(Number(id));
                    };

                    break;
            };

            if (res) await res.delete();
            if (sent) await sent?.delete();
            await this.fetchReactions(this.rm!);
            await list.edit({ embeds: await this.embeds(guild), components: this.components() });
        
        });

        collector.on('end', async () => {
            await  list.edit({ components: this.components(true) })
        });

        return;

    };

    private async embeds(guild: Guild): Promise<MessageEmbedOptions[]> {

        return [
            {
                title: 'ROLE REACTIONS',
                description: this.reactions.length > 0 ? (await Promise.all(this.reactions.map(async r => {

                    let emoji: GuildEmoji | string;
                    if (RegEx.snowflake.test(r.emoji)) {
                        try {
                            emoji = await guild.emojis.fetch(r.emoji);
                        } catch {
                            emoji = `\`${r.emoji}\``
                        }

                    } else emoji = r.emoji;

                    return `\`ID: ${r.reaction_id}.\` • ${emoji} • <@&${r.role_id}>`
                }))).join('\n') : '`none`',
                color: await this.client.util.guildColor(guild),
                url: this.rm?.message_url
            }
        ]
    };

    private components(disabled = false): MessageActionRow[] {
        return [
            new MessageActionRow({
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'BUTTON',
                        customId: 'rrAdd',
                        label: 'ADD',
                        style: 'SUCCESS',
                        emoji: '➕',
                        disabled: disabled
                    },
                    {
                        type: 'BUTTON',
                        customId: 'rrRemove',
                        label: 'REMOVE',
                        style: 'DANGER',
                        emoji: '➖',
                        disabled: disabled,
                    }
                ]
            })
        ];
    };

    private async selectMenu(guild: Guild): Promise<MessageActionRow[]> {

        return [
            new MessageActionRow({
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'SELECT_MENU',
                        customId: 'rrSelectMenu',
                        options: await Promise.all(this.reactions.map(async r => {

                            const role = this.client.util.resolveRole(r.role_id, await guild.roles.fetch());
                            
                            return {
                                label: `ID: ${r.reaction_id}`,
                                description: `Role: ${role ? role.name : r.role_id} | Emoji: ${r.emoji}`,
                                value: `${r.reaction_id}`
                            }
                        })),
                        minValues: 1,
                        maxValues: this.reactions.length
                    }
                ]
            })
        ]
    };

    private async fetchReactions(rm: ReactionMessage): Promise<Reaction[]> {
        return this.reactions = await this.db.getReactions(rm.reaction_message_id);
    };
};