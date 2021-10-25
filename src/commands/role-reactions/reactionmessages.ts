import type { ReactionMessage } from "#lib/types/db";
import { Command } from "#structures/Command";
import type { PieceContext } from "@sapphire/framework";
import { ButtonInteraction,  Guild, Message, MessageActionRow, MessageComponentInteraction, MessageEmbedOptions, NewsChannel, SelectMenuInteraction, TextChannel, ThreadChannel } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'rmessages',
            description: 'View and manage role-reaction messages.',
            usage: [''],
            preconditions: ['admin', 'guild'],
            aliases: ['rrmessages', 'reactionmessages'],
        });

        this.module = this.client.modules.get('role-reactions')!
    };

    public messages: ReactionMessage[] = [];

    public async messageRun(message: Message) {

        const guild = message.guild!; const channel = message.channel;

        await this.fetchMessages(guild);

        let list = await channel.send({ embeds: await this.embeds(guild), components: this.components() });

        const collector = list.createMessageComponentCollector({ time: 300*1000, filter: (interaction: MessageComponentInteraction) => interaction.user.id === message.author.id && interaction.isButton() });

        collector.on('collect', async (interaction: ButtonInteraction) => {

            await interaction.update({ components: this.components(true) });

            let sent: Message | undefined; let res: Message | undefined; let int: SelectMenuInteraction | undefined;

            switch (interaction.customId) {

                case 'rmAdd':

                    sent = await channel.send('Message URL');
                    res = (await channel.awaitMessages({ filter: msg => msg.author.id === interaction.user.id, time: 30*1000, max: 1 }).catch(() => undefined))?.first();

                    if (res?.content) {

                        let msg = await this.client.util.resolveMessage(res.content);

                        if (msg && msg.guild?.id === guild.id) {

                            await this.db.addReactionMessage(guild, res.content);

                        } else break;

                    } else break;

                    break;

                case 'rmRemove':

                    sent = await channel.send({ content: 'Select which reaction messages to remove', components: await this.selectMenu() });
                    int = await sent.awaitMessageComponent({ filter: (i: MessageComponentInteraction) => i.user.id === interaction.user.id, time: 30*1000 }).catch(() => undefined) as SelectMenuInteraction;

                    for (const value of int.values) {
                        await this.db.deleteReactionMessage(Number(value));
                    };

                    break;
            };

            await sent?.delete();
            await res?.delete();
            await this.fetchMessages(guild);
            await list.edit({ embeds: await this.embeds(guild), components: this.components() })

        });

        collector.on('end', async () => {
            await list.edit({ embeds: await this.embeds(guild), components: this.components(true) })
        })

    };
    
    private async fetchMessages(guild: Guild) {
        return this.messages = await this.db.getReactionMessages(guild);
    };

    private async embeds(guild: Guild): Promise<MessageEmbedOptions[]> {

        return [
            {
                title: 'ROLE REACTION MESSAGES',
                description: await this.desc(),
                color: await this.client.util.guildColor(guild)
            }
        ];

    };

    private components(disabled: boolean = false): MessageActionRow[] {
      
        return [
            new MessageActionRow({
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'BUTTON',
                        label: 'ADD',
                        emoji: '➕',
                        style: 'SUCCESS',
                        customId: 'rmAdd',
                        disabled: disabled || this.messages.length >= 25
                    },
                    {
                        type: 'BUTTON',
                        label: 'REMOVE',
                        emoji: '➖',
                        style: 'DANGER',
                        customId: 'rmRemove',
                        disabled: disabled
                    }
                ]
            })
        ];

    };

    private async selectMenu(): Promise<MessageActionRow[]> {

        return [
            new MessageActionRow({
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'SELECT_MENU',
                        options: await Promise.all(this.messages.map(async m => {
                            return {
                                label: `ID: ${m.reaction_message_id}`,
                                description: await (async (m: ReactionMessage) => {
                                    const msg = await this.client.util.resolveMessage(m.message_url);
                                    if (msg) {
                                        return `#${(msg.channel as TextChannel | NewsChannel | ThreadChannel).name}`
                                    } else return `DELETED`
                                })(m),
                                value: `${m.reaction_message_id}`
                            }
                        })),
                        maxValues: this.messages.length,
                        minValues: 1,
                        customId: 'rmSelectMenu'
                    }
                ]
            })
        ];

    };

    private async displayMsg(m: ReactionMessage): Promise<string> {

        const msg = await this.client.util.resolveMessage(m.message_url);
        if (msg) {
            return (`\`ID: ${m.reaction_message_id}.\` • ${msg.channel} • [\`\[JUMP\]\`](${m.message_url})`)
        } else return `\`ID: ${m.reaction_message_id}.\` • \`DELETED\``

    }

    private async desc(): Promise<string> {

        return this.messages.length > 0 ? (await Promise.all(this.messages.map(async m => await this.displayMsg(m)))).join('\n') : '`none`'
    };
};