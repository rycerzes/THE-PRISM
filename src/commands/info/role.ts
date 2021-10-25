import { Command } from "#structures/Command";
import { RankingMessage } from "#structures/RankingMessage";
import { blankFieldInline } from "#util/constants";
import type { Args, PieceContext } from "@sapphire/framework"
import type { ColorResolvable, GuildMember, Message, NewsChannel, TextChannel, ThreadChannel } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'role',
            description: 'View info and members for a role',
            usage: ['[role] (page)'],
            preconditions: ['guild'],
            aliases: ['roleinfo', 'rinfo']
        });

        this.module = this.client.modules.get('info')!;

    };

    public async messageRun(message: Message, args: Args): Promise<any> {

        const role = (await args.pickResult('role')).value;

        if (!role) return this.client.emit('help', message, { command: this });

        let lb = new RankingMessage(this.client, {
            channel: message.channel as TextChannel | NewsChannel | ThreadChannel,
            author: message.author,
            perPage: 15,
            array: [...role.members.values()],
            buttons: true,

            title: 'ROLE INFORMATION',
            thumbnailURL: role.iconURL(),
            color: role.color as ColorResolvable,
            description: `${role}\n\n**MEMBERS (${role.members.size})**`,
            fields: [
                //blankField,
                {
                    name: 'ID',
                    value: `\` ${role.id} \``,
                    inline: true
                },
                blankFieldInline,
                {
                    name: 'MENTIONABLE',
                    value: `\` ${role.mentionable} \``,
                    inline: true
                },
                {
                    name: 'CREATED',
                    value: `<t:${Math.floor(role.createdTimestamp/1000)}:D>`,
                    inline: true
                },
                blankFieldInline,
                {
                    name: 'COLOR',
                    value: `\` ${role.hexColor.toUpperCase()} \``,
                    inline: true
                }
            ],
            footerDesc: true,

            display: async (member: GuildMember) => {
                return `${member}`
            }, 
            sort: (a: GuildMember, b: GuildMember) => {
                return a.joinedTimestamp! - b.joinedTimestamp!
            }
        });

        lb.page = await args.pick('rankpage', { rankingMessage: lb, resolve: ({ parameter, array }: { parameter: string, array: GuildMember[] }): GuildMember | undefined => {

            const member = this.client.util.resolveMember(parameter, message.guild!.members.cache);
            return member ? array.find(m => m.id === member.id) : undefined;
            
        } }).catch(() => 1);

        return lb.send()

    };
};