import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import { Message, MessageAttachment } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'handgrab',
            description: 'Trap someone in a handgrab',
            usage: ['', 'thanos | lazer'],
            aliases: ['hand']
        });

        this.module = this.client.modules.get('fun')!;

    };

    public async run(message: Message, args: Args) {

        const type = await args.pick('string').catch(() => '');

        let urls: { top: string | undefined, bottom: string | undefined } = { top: undefined, bottom: undefined }

        if (type.toLowerCase() === 'thanos') {

            urls.top = 'https://i.imgur.com/7kjMLYJ.png',
            urls.bottom = 'https://i.imgur.com/d5TxlJo.png'

        } else if (type.toLowerCase() === 'laser' || type.toLowerCase() === 'lazer') {
            
            urls.top = 'https://i.imgur.com/Ngx8zDt.png',
            urls.bottom = 'https://i.imgur.com/iyyggjV.png'

        } else {
            urls.top = 'https://i.imgur.com/Sv6kz8f.png',
            urls.bottom = 'https://i.imgur.com/wvUPp3d.png'
        };

        let top = await message.channel.send('\u200b');

        message.delete();

        try {
            await message.channel.awaitMessages({ filter: m => !m.author.bot, max: 1, time: 1200*1000, errors: ['time'] });
            await top.edit(urls.top);
            return await message.channel.send({ files: [new MessageAttachment(urls.bottom, 'bottom.png')] });
        } catch (e) {
            return top.delete();
        };

    };

};