import { Listener } from "#structures/Listener";
import { blankFieldInline } from "#util/constants";
import type { PieceContext } from "@sapphire/framework";
import type { Message, MessageEmbedOptions, TextChannel } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'pins-pinCreate',
            event: 'pinCreate'
        });
    };

    public async run(message: Message, channel: TextChannel) {

        if (!message.guild) return;

        let embed: MessageEmbedOptions = {
            description: message.content !== '' ? `\u200b\n${message.content}\n\u200b` : undefined,
            fields: [
                {
                    name: 'AUTHOR',
                    value: `${message.member}`,
                    inline: true
                },
                {
                    name: 'CHANNEL',
                    value: `${message.channel}  [\`\[JUMP\]\`](${message.url})`,
                    inline: true
                },
            ],
            author: {
                name: message.author.tag,
                icon_url: message.author.displayAvatarURL()
            },
            image: {
                url: undefined
            },
            timestamp: message.createdTimestamp,
            color: await this.client.util.guildColor(message.guild),
        };

        if (message.attachments.first()) {
            try{
                if(message.attachments.first()!.name?.split('.').pop() !== ('png' || 'jpg')) throw '';
                embed.image!.url = message.attachments.first()!.url;
            } catch {
                embed.fields!.unshift({
                    name: 'ATTACHMENT',
                    value: `[${message.attachments.first()!.name}](${message.attachments.first()!.url})`,
                    inline: true
                })
            }
        }

        if (embed.fields!.length % 3 !== 0) {
            for (let i = embed.fields!.length % 3; i < 3; i++) {
                embed.fields!.push(blankFieldInline)
            }
        };

        channel.send({embeds: [ embed ]});
        message.react('📌')
        return message.channel.send(`***${message.member}'s message has been pinned in ${channel}.***`)
    };

};