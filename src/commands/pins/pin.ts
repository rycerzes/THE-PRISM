import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'pin',
            description: 'Manually pin a message.',
            usage: ['[message URL]'],
            preconditions: ['moderator', 'guild'],
        });

        this.module = this.client.modules.get('pins')!;

    };

    public async run(message: Message, args: Args): Promise<any> {

        const msg = (await args.pickResult('guildMsg')).value;

        if (!msg) return this.client.emit('help', message, { command: this });

        const { pins_channel_id } = await this.db.fetchConfig(message.guild!);
        
        if (!pins_channel_id) return message.reply({ allowedMentions: { repliedUser: false }, content: 'You need a pins channel first! Set one using the `setchannel` command.'});

        const channel = await message.guild!.channels.fetch(pins_channel_id);

        if (!channel) {
             
            await this.db.updateConfig(message.guild!, `SET pins_channel_id = null`);
            return message.reply({ allowedMentions: { repliedUser: false }, content: 'You need a pins channel first! Set one using the `setchannel` command.'});

        } else return this.client.emit('pinCreate', msg, channel)

    };
};