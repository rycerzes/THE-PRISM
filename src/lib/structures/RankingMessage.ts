import type { ColorResolvable, Message, MessageComponentOptions, MessageEmbedOptions, TextChannel, User } from "discord.js";
import { pad } from '#util/functions';
import type { Client } from "#lib/Client";

export interface RankingMessage {

    client: Client;
    message: Message;
    author: User;
    channel: TextChannel;
    array: unknown[];
    page: number;
    perPage: number;
    title: string | undefined;
    color: ColorResolvable | undefined;
    buttons: Boolean | undefined;

    display(element: any): string | Promise<string>;
    sort(a: any, b: any): number;
}

export class RankingMessage {

    constructor(client: Client, {perPage = 10, ...options }: {
        channel: TextChannel,
        author: User,
        page?: number,
        perPage?: number,
        title?: string,
        color?: ColorResolvable,
        buttons?: Boolean,
        array: unknown[],

        display(element: any): string | Promise<string>,
        sort(a: any, b: any): number,
        
    }) {

        const {

            channel,
            author,
            array,
            page = 1,
            title,
            color,
            buttons,

            display,
            sort

        } = options;

        this.display = display;
        this.sort = sort;
        
        this.client = client;
        this.channel = channel;
        this.author = author;
        this.array = array.sort(this.sort)
        this.page = page;
        this.perPage = perPage;
        this.title = title;
        this.color = color;
        this.buttons = buttons;

    };

    public async send(page?: number): Promise<void> {

        this.message = await this.channel.send({ embeds: [ await this.embed(page || this.page)], components: this.buttons ? this.components : [] });

        const collector = this.message.createMessageComponentCollector({ filter: interaction => interaction.user.id === this.author.id, componentType: 'BUTTON', time: 60000 });

        collector.on('collect', async interaction => {
            if (!interaction.isButton()) return;
            switch (interaction.customId) {
                case 'rankUp':
                    this.page--;
                    interaction.update({ embeds: [await this.embed()], components: this.components });
                    break;
                case 'rankDown':
                    this.page++;
                    interaction.update({ embeds: [await this.embed()], components: this.components });
                    break;
                case 'rankExit':
                    interaction.update({ components: [] });
                    break;
            };
        });

        collector.on('end', () => {
            this.exit();
        });

        return;

    };

    /**
     * Generates the embed.
     * @param page - Page to display
     * @returns {MessageEmbedOptions}
     */
    public async embed(page: number = this.page): Promise<MessageEmbedOptions> {

        let start = this.perPage * (page - 1); let i = start;
        let elements = [...this.array].splice(start, this.perPage);

        let arr = [];

        for (const item of elements) {
            arr.push(`\`${pad(i+1, 2)}.\` • ${await this.display(item)}`)
            i++;
        };

        return {
            title: this.title,
            description: arr.join('\n'),
            color: this.color || await this.client.util.guildColor(this.channel.guild),
            footer: {
                text: `Page: ${page} of ${this.maxPages}`
            }
        };
    };

    public async edit(page?: number): Promise<Message> {
        return this.message.edit({ embeds: [await this.embed(page || this.page)], components: this.buttons ? this.components : [] })
    }

    public async exit() {
        this.buttons = false;
        return this.edit();
    }

    get maxPages() {
        return Math.ceil(this.array.length / this.perPage)
    }

    get components() {
        return [
            [
                {
                    customId: 'rankUp',
                    type: 'BUTTON',
                    emoji: '867081880834146385',
                    style: 'SECONDARY',
                    disabled: this.page === 1
                },
                {
                    customId: 'rankDown',
                    type: 'BUTTON',
                    emoji: '867081881185943612',
                    style: 'SECONDARY',
                    disabled: this.page === this.maxPages
                },
                {
                    customId: 'rankExit',
                    type: 'BUTTON',
                    emoji: '✖️',
                    style: 'DANGER'
                }
            ]
        ] as MessageComponentOptions[][];
    }
};