import { Command } from "#structures/Command";
import { RankingMessage } from "#structures/RankingMessage";
import type { GuildTextBasedChannelTypes } from "@sapphire/discord.js-utilities";
import type { Args, PieceContext } from "@sapphire/framework";
import type { GuildMember, Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'joinlist',
            description: 'View the join order of the server',
            detailedDescription: 'View the join order of the server.\nLeaving and rejoining will reset your position',
            usage: ['(page)'],
            aliases: ['joins', 'joinorder'],
            preconditions: ['guild']
        });

        this.module = this.client.modules.get('info')!;

    };

    public async run(message: Message, args: Args): Promise<any> {

        let lb = new RankingMessage(this.client, {
            channel: message.channel as GuildTextBasedChannelTypes,
            author: message.author,
            array: [...(await message.guild!.members.fetch()).values()],
            perPage: 10,
            buttons: true,

            title: `${message.guild!.name.toUpperCase()} JOIN RANKINGS`,

            display: (member: GuildMember) => {
                return `${member}`
            },
            sort: (a: GuildMember, b: GuildMember) => {
                return a.joinedTimestamp! - b.joinedTimestamp!
            },
        });

        lb.page = await args.pick('rankpage', { rankingMessage: lb, resolve: async ({ parameter, array }: { parameter: string, array: GuildMember[] }): Promise<GuildMember | undefined> => {

            const member = this.client.util.resolveMember(parameter, await message.guild!.members.fetch());
            return member ? array.find(m => m.id === member.id) : undefined;

        }}).catch(() => 1);

        return lb.send();

    };
};