import type { Responder } from "#lib/types/db";
import { Command } from "#structures/Command";
import { RegEx } from "#util/constants";
import type { PieceContext } from "@sapphire/framework";
import { ButtonInteraction, Guild, Message, MessageActionRow, MessageComponentInteraction, MessageEmbedOptions, SelectMenuInteraction, Snowflake } from "discord.js";

export type response = {
    text: string | null;
    reaction: string | Snowflake | null;
    matchAny: boolean
}

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'responder',
            description: 'View and modify the responder module.',
            usage: [''],
            preconditions: ['admin', 'guild'],
            aliases: ['autoresponder']
        });

        this.module = this.client.modules.get('responder')!
    };

    public responders: Responder[] = []

    public async run(message: Message) {

        await this.updateResponders(message.guild!);

        let list = await message.reply({ allowedMentions: { repliedUser: false }, embeds: await this.embeds(message.guild!), components: this.components() });

        const collector = list.createMessageComponentCollector({ filter: interaction => interaction.isButton() && interaction.user.id === message.author.id, time: 300*1000 });

        collector.on('collect', async interaction => {

            interaction.update({ components: this.components(true) })

            if (!interaction.isButton()) return;

            let sent: Message | undefined; let res: Message | undefined; let int: ButtonInteraction | SelectMenuInteraction | undefined;

            const filter = (i: MessageComponentInteraction) => {
                i.deferUpdate()
                return i.user.id === interaction.user.id && i.isButton()
            };

            switch (interaction.customId) {

                case 'rAdd':

                    sent = await interaction.channel?.send({ content: 'What text should this responder match?' });
                    res = (await interaction.channel?.awaitMessages({ filter: msg => msg.author.id === interaction.user.id, time: 30*1000, max: 1 }).catch(() => undefined))?.first();

                    if (!res?.content) break;

                    const text = res.content;

                    await res.delete();

                    await sent?.edit({ content: 'Match any part of the message or the exact content.', components: [
                        {
                            type: 'ACTION_ROW',
                            components: [
                                {
                                    type: 'BUTTON',
                                    customId: 'rAny',
                                    label: 'ANY',
                                    style: 'SECONDARY'
                                },
                                {
                                    type: 'BUTTON',
                                    customId: 'rExact',
                                    label: 'EXACT',
                                    style: 'SECONDARY'
                                }
                            ]
                        }
                    ]});

                    int = await sent?.awaitMessageComponent({ filter, time: 30*1000 }).catch(() => undefined) as ButtonInteraction | undefined;
                    if (!int) break;

                    let response: response = { text: null, reaction: null, matchAny: int.customId === 'rExact' ? false : true };

                    let confirm = false;

                    while (!confirm) {

                        
                        await sent?.edit({ embeds: [{
                            title: 'SET RESPONSES',
                            description: `TEXT: \`${response.text}\`\nREACTION: \`${response.reaction}\``,
                            color: await this.client.util.guildColor(message.guild!),
                        }], components: this.responseComponents(response) });

                        int = await sent?.awaitMessageComponent({ filter, time: 30*1000 }).catch(() => undefined) as ButtonInteraction | undefined;
                        if (!int) break;

                        switch (int.customId) {

                            case 'rText':

                                sent?.edit({ content: 'Enter the text response:', components: this.responseComponents(response, true) });
                                res = (await interaction.channel?.awaitMessages({ filter: msg => msg.author.id === interaction.user.id, time: 30*1000, max: 1 }).catch(() => undefined))?.first();

                                if (!res?.content) break;
            
                                response.text = `'${res.content}'`;
                                await res.delete();

                                break;

                            case 'rReaction':

                                sent?.edit({ content: 'Enter the text response:', components: this.responseComponents(response, true) });
                                res = (await interaction.channel?.awaitMessages({ filter: msg => msg.author.id === interaction.user.id, time: 30*1000, max: 1 }).catch(() => undefined))?.first();

                                if (!res?.content) break;

                                try {
                                    await res.react(res.content);
                                } catch {
                                    await res.delete();
                                    break;
                                };

                                response.reaction = `'${res.content}'`;
                                await res.delete();
                        
                                break;

                            case 'rConfirm':

                                confirm = true;
                                break;
                        };

                    };

                    if (!confirm) break;

                    await this.db.addResponder(message.guild!, text, response);

                    break;

                case 'rRemove':

                    sent = await interaction.channel?.send({ content: 'Select which level roles to remove', components: this.selectmenu() });
                    int = await sent?.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 30*1000 }).catch(() => undefined) as SelectMenuInteraction | ButtonInteraction | undefined;
                    
                    if (!int || int.isButton()) break;

                    for await (const value of int.values) {
                        await this.db.deleteResponder(Number(value))
                    };

                    break;
            };

            await sent?.delete();
            await this.updateResponders(message.guild!);
            await list.edit({ embeds: await this.embeds(message.guild!), components: this.components() })
        });
        
        collector.on('end', async () => {
            await list.edit({ components: this.components(true) });
        });

    };

    private async updateResponders(guild: Guild): Promise<Responder[]> {
        return this.responders = await this.db.fetchResponders(guild);
    };

    private async embeds(guild: Guild): Promise<MessageEmbedOptions[]> {
        return [
            {
                title: 'RESPONDERS',
                description: this.desc,
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
                        style: 'SUCCESS',
                        customId: 'rAdd',
                        emoji: '➕',
                        disabled
                    },
                    {
                        type: 'BUTTON',
                        label: 'REMOVE',
                        style: 'DANGER',
                        customId: 'rRemove',
                        emoji: '➖',
                        disabled
                    },
                ]
            })
        ];
    };

    private responseComponents(response: response, disabled: boolean = false): MessageActionRow[] {

        const confirmable = (!response.text && !response.reaction)

        return [
            new MessageActionRow({
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'BUTTON',
                        customId: 'rText',
                        emoji: '🔡',
                        label: 'TEXT',
                        style: 'SECONDARY',
                        disabled
                    },
                    {
                        type: 'BUTTON',
                        customId: 'rReaction',
                        emoji: '😁',
                        label: 'REACTION',
                        style: 'SECONDARY',
                        disabled
                    },
                    {
                        type: 'BUTTON',
                        customId: 'rConfirm',
                        emoji: '✅',
                        label: 'CONFIRM',
                        style: 'SUCCESS',
                        disabled: confirmable || disabled
                    }
                ]
            })
        ];

    };

    private selectmenu(): MessageActionRow[] {

        return [
            new MessageActionRow({
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'SELECT_MENU',
                        options: this.responders.map(r => {

                            let arr: string[] = [];

                            if (r.text_response) arr.push(`"${r.text_response}"`);
                            if (r.reaction_response) {

                                // If Guild Emoji
                                if (RegEx.mentions.emoji.test(r.reaction_response)) {

                                    arr.push(r.reaction_response.split(":")[2].replace('>', ''))
                                } else {
                                    arr.push(r.reaction_response);
                                };
                            };

                            return {
                                label: `ID: ${r.responder_id} | "${r.regex}"`,
                                value: `${r.responder_id}`,
                                description: `Response: ${arr.join(" | ")}`
                            };
                        }),
                        customId: 'rSelectMenu',
                        placeholder: 'Select responders to remove',
                        minValues: 1,
                        maxValues: this.responders.length
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
                        customId: 'rRemoveCancel',
                    }
                ]
            })
        ]
    };

    private get desc() {
        return this.responders.map(r => `\`ID: ${r.responder_id}.\` **|** \`"${r.regex}"\``).join('\n')
    };
};