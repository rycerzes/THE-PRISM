import type { WordFilter } from "#lib/types/db";
import { Command } from "#structures/Command";
import type { PieceContext } from "@sapphire/framework";
import { Guild, Message, MessageActionRow, MessageComponentInteraction, MessageEmbedOptions } from "discord.js";

export default class extends Command {

    constructor(context: PieceContext) {
        super(context, {
            name: 'wordfilter',
            description: 'Modify/View the wordfilter',
            usage: [''],
            preconditions: ['guild', 'admin'],
            aliases: ['wf']
        });

        this.module = this.client.modules.get('text-mod')!;
    };

    getComponents(disabled: boolean = false): MessageActionRow[] {
        return [
            new MessageActionRow({
                type: 'ACTION_ROW',
                components: [
                    {
                        type: 'BUTTON',
                        label: 'ADD',
                        style: 'SUCCESS',
                        customId: 'wfAdd',
                        emoji: '➕',
                        disabled: disabled
                    },
                    {
                        type: 'BUTTON',
                        label: 'REMOVE',
                        style: 'DANGER',
                        customId: 'wfRemove',
                        emoji: '➖',
                        disabled: disabled
                    }
                ]
            })
        ]
    };

    public async messageRun(message: Message) {

        // Get Guild
        const guild = message.guild!

        // Get current words
        const words = (await this.db.getWords(guild));

        // Send main message to display wordfilter
        let displayMsg = await message.reply({ allowedMentions: { repliedUser: false } , embeds: [ await this.embed(words, guild) ], components: this.getComponents() });

        // Collector
        const collector = displayMsg.createMessageComponentCollector({ filter: (interaction: MessageComponentInteraction) => interaction.componentType === 'BUTTON' && interaction.user.id === message.author.id, time: 300 * 1000 });

        collector.on('collect', async interaction => {

            let sent: Message | undefined;

            // Disable buttons
            interaction.update({ components: this.getComponents(true) });

            switch (interaction.customId) {

                // Add
                case 'wfAdd':

                    // Ask
                    sent = await interaction.channel?.send('Type the text you would like the word filter to match:');
                    const res = await interaction.channel?.awaitMessages({ filter: msg => msg.author.id === message.author.id, max: 1, time: 30*1000 }).catch(() => undefined);

                    const text = res?.first()?.content;
            
                    // If response
                    if (text) {

                        await res?.first()?.delete();
                        await sent?.edit({ content: `What type of match would you lieke?\`\`\`md\n* "${text}"\`\`\``, components: [
                            {
                                type: 'ACTION_ROW',
                                components: [
                                    {
                                        type: 'BUTTON',
                                        style: 'SECONDARY',
                                        label: 'ANY',
                                        customId: 'matchAny'
                                    },
                                    {
                                        type: 'BUTTON',
                                        style: 'SECONDARY',
                                        label: 'EXACT',
                                        customId: 'matchExact'
                                    }
                                ]
                            }
                        ]});

                        // Defer update to stop error throwing
                        const filter = (i: MessageComponentInteraction) => {
                            if (i.user.id === message.author.id && i.componentType === 'BUTTON') {
                                i.deferUpdate();
                                return true;
                            } else return false
                        };
                        
                        // Get interaction or undefined
                        const int = await sent?.awaitMessageComponent({ filter, time: 30*1000 }).catch(() => undefined);

                        // If no interactino, it will delete the message.
                        if (int) {

                            if (int.customId === 'matchAny') {

                                await displayMsg.edit({ embeds: [ await this.embed(await this.db.addWord(guild, text, true), guild)], components: this.getComponents() })
                                
                            } else if (int.customId === 'matchExact') {

                                await displayMsg.edit({ embeds: [ await this.embed(await this.db.addWord(guild, text, false), guild)], components: this.getComponents() })

                            };

                        };

                    };

                    // Always delete the message at the end
                    sent?.delete();

                    return;

                case 'wfRemove':

                    sent = await interaction.channel?.send('Select the ID of the word you\'d like to remove');
                    const response = await interaction.channel?.awaitMessages({ filter: msg => msg.author.id === message.author.id, max: 1, time: 30*1000 }).catch(() => undefined);

                    const id = Number(response?.first()?.content);
                    
                    // Delete message
                    response?.first()?.delete();

                    if (!isNaN(id) && (await this.db.getWords(guild)).map(w => w.word_filter_id).includes(id)) {

                        await displayMsg.edit({ embeds: [ await this.embed(await this.db.removeWord(id, guild), guild)], components: this.getComponents() })
                        // Delete sent
                        await sent?.delete();
                    } else {
                        // Warn user
                        message.channel.send({ content: `Invalid ID: \`${response?.first()?.content}\`` }).then(async msg => {
                            setTimeout(async () => {
                                msg.delete()                        
                                // Delete sent
                                sent?.delete();

                                await displayMsg.edit({ embeds: [ await this.embed(await this.db.removeWord(id, guild), guild)], components: this.getComponents() })
                            }, 5000);
                        });
                    };

                    

                    return;
            };

        });

        collector.on('end', async () => {
            displayMsg.edit({ components: [] });
        });

    };

    async embed(words: WordFilter[], guild: Guild): Promise<MessageEmbedOptions> {
        return {
            title: 'WORD FILTER',
            description: `\`\`\`md\n${words.length < 1 ? `None` : words.map(word => `${word.word_filter_id}. > "${word.text}" | [${word.match_any ? 'any' : 'exact'}]`).join("\n")}\`\`\``,
            color: await this.client.util.guildColor(guild)
        }
    };
};