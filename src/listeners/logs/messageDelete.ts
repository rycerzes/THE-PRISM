import { Listener } from "#structures/Listener";
import { colors } from "#util/config";
import { logsEmbed } from "#util/functions";
import type { PieceContext } from "@sapphire/framework";
import type { Message, TextChannel } from "discord.js";

export default class extends Listener {

    constructor(context: PieceContext) {
        super(context, {
            name: 'logs-messageDelete',
            event: 'messageDelete'
        });
    };

    public async run(message: Message) {

        const member = message.member;

        if (!member) return;

        if (!this.checkModule(member.guild, 'logs')) return;

        const channelID = (await this.db.fetchConfig(member.guild)).logs_channel_id;

        if (channelID) {

            (await this.client.channels.fetch(channelID) as TextChannel).send({ embeds: [ logsEmbed({
                member: member,
                title: 'MESSAGE DELETED',
                fields: message.content ? [
                    {
                        name: 'CONTENT',
                        value: message.content ,
                        inline: true
                    }
                ] : [],
                color: colors.red
            })]});

        };

    };

};