import type { Mute } from "#lib/types/db";
import { Command } from "#structures/Command";
import { RankingMessage } from "#structures/RankingMessage";
import { milliToDuration } from "#util/functions";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message, NewsChannel, TextChannel, ThreadChannel } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'mutes',
            description: 'View the mute history for a member',
            usage: ['[member] (page)'],
            preconditions: ['guild'],
        });

        this.module = this.client.modules.get('text-mod')!;
    };

    public async run(message: Message, args: Args) {

        const member = await args.pick('member').catch(() => message.member!);
        const page = await args.pick('integer').catch(() => 1);

        const mutes = await this.db.getMutes(member);

        let list = new RankingMessage(this.client, {
            channel: message.channel as TextChannel | NewsChannel | ThreadChannel,
            author: message.author,
            page: page,
            perPage: 5,
            buttons: true,
            title: 'MUTE HISTORY',
            description: `**Member: ${member}**\n`,
            
            array: mutes,

            sort: (a: Mute, b: Mute) => a.started - b.started,

            display: (mute: Mute) => {
                let arr = [`Muted on: <t:${Math.floor(mute.started/1000)}:d>`]
                
                if (mute.reason) {
                    arr.push(`Reason: ${mute.reason}`);
                };
                if (mute.ends) {
                    let duration = milliToDuration(mute.ends-mute.started);
                    arr.push(`Duration: ${duration.d ? `${duration.d}d, ` : ''}${duration.h ? `${duration.h}h, ` : ''}${duration.m ? `${duration.m}m`: ''}`);
                };

                if (arr.length > 1) {
                    arr.splice(1, 0, '```'); arr.push('```')
                };

                return arr.join('\n');
            }
        });

        list.send();
    };

};