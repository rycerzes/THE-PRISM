import type { Guild, Member } from "#lib/types/db";
import { Command } from "#structures/Command";
import { RankingMessage } from "#structures/RankingMessage";
import { groupDigits } from "#util/functions";
import type { Args, CommandContext, PieceContext } from "@sapphire/framework";
import type { Message, TextChannel } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'top',
            description: 'View the statistic leaderboards',
            aliases: ['leaderboard', 'lb'],
            preconditions: ['guild']
        });
    };

    public module = this.client.modules.get('stats')!;

    public async run(message: Message, args: Args, context: CommandContext) {

        const category = await args.pick('lbcategory').catch(() => 'MESSAGES');

        let display: (member: Member) => string | Promise<string> ; let sort: (a: Member, b: Member) => number;

        switch (category) {

            default:
            case 'MESSAGES':
            
                display = async (member: Member) => {
                    return `${await this.client.util.mention(member, message.guild!)} • \`${groupDigits(member.messages!)}\``
                };

                sort = (a: Member, b: Member) => {
                    return b.messages! - a.messages!
                };
                
                break;
            
            case 'VOICE':

                display = async (member: Member) => {
                    let minutes = member.voice_minutes!;
                    let val = minutes > 60000 ? `${groupDigits(Math.round(minutes/60))} hours` : minutes > 120 ? `${Math.round(minutes/6)/10} hours` : `${groupDigits(minutes)} minutes`;
                    return `${await this.client.util.mention(member, message.guild!)} • \`${val}\``
                };

                sort = (a: Member, b: Member) => {
                    return b.voice_minutes! - a.voice_minutes!
                };

                break;

            case 'MUTED':

                display = async (member: Member) => {
                    let minutes = member.mute_minutes!;
                    let val = minutes > 60000 ? `${groupDigits(Math.round(minutes/60))} hours` : minutes > 120 ? `${Math.round(minutes/6)/10} hours` : `${groupDigits(minutes)} minutes`;
                    return `${await this.client.util.mention(member, message.guild!)} • \`${val}\``
                };

                sort = (a: Member, b: Member) => {
                    return b.mute_minutes! - a.mute_minutes!
                };

                break;

            case 'COUNTING':

                display = async (member: Member) => {
                    let { counting_count } = (await this.client.db.query(`SELECT counting_count FROM guilds WHERE guild_id = ${message.guild!.id}`)).rows[0] as Guild
                    return `${await this.client.util.mention(member, message.guild!)} • \`${groupDigits(member.counting_counts!)}\` • \`${Math.round(member.counting_counts!*100/counting_count!)/100}%\``
                };

                sort = (a: Member, b: Member) => {
                    return b.counting_counts! - a.counting_counts!
                };

                break;

            case 'AFK':

                display = async (member: Member) => {
                    return `${await this.client.util.mention(member, message.guild!)} • \`${groupDigits(member.afk_count!)}\``
                };

                sort = (a: Member, b: Member) => {
                    return b.afk_count! - a.afk_count!
                };

                break;

            case 'LEVELS':

                return this.client.stores.get('commands').get('levels')?.run(message, args, context);

        };

        let lb = new RankingMessage(this.client, {
            channel: message.channel as TextChannel, author: message.author, title: `*${category.toUpperCase()} LEADERBOARD*`, buttons: true,

            array: (await this.client.db.query(`SELECT * FROM members WHERE guild_id = ${message.guild!.id}`)).rows,

            display: display,

            sort: sort

        });

        lb.page = await args.pick('rankpage', { rankingMessage: lb, resolve: ({parameter, array}: { parameter: string, array: Member[] }): Member | undefined => {

            const member = this.client.util.resolveMember(parameter, message.guild!.members.cache);
            return member ? array.find(m => m.user_id === member.id) : undefined;

        }}).catch(() => 1);

        lb.send();

    };
};