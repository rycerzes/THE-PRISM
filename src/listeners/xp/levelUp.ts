import { Listener } from "#structures/Listener";
import { messages } from "#util/constants";
import type { PieceContext } from "@sapphire/framework";
import type { GuildMember, TextChannel } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'xp-levelUp',
            event: 'xp-levelUp'
        });
    };

    public async run(member: GuildMember, level: number) {

        const { levels_channel_id: channelId, level_up_text: text, levels_message_embed: isEmbed } = await this.db.fetchConfig(member.guild);

        // Send Message
        if (channelId) {

            const channel = await member.guild.channels.fetch(channelId) as TextChannel;

            if (channel) {

                if (isEmbed) {

                    channel.send({ embeds: [
                        {
                            title: 'LEVEL UP!',
                            description: await this.client.util.parseText(text ?? messages.levelup, { member: member, level: level }),
                            color: await this.client.util.guildColor(member.guild),
                            footer: {
                                text: member.user.tag
                            },
                            timestamp: Date.now()
                        }
                    ]});

                } else {

                    channel.send({ content: await this.client.util.parseText(text ?? messages.levelup, { member: member, level: level }) })

                }

            }

        };



    };
};