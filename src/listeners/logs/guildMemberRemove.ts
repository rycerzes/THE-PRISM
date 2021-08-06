import { Listener } from "#structures/Listener";
import { colors } from "#util/config";
import { logsEmbed } from "#util/functions";
import type { PieceContext } from "@sapphire/framework";
import type { GuildMember, TextChannel } from "discord.js";

export default class extends Listener {

    constructor(context: PieceContext) {
        super(context, {
            name: 'logs-guildMemberRemove',
            event: 'guildMemberRemove'
        });
    };

    public async run(member: GuildMember) {

        if (!this.checkModule(member.guild, 'logs')) return;

        const channelID = (await this.db.fetchConfig(member.guild)).logs_channel_id;

        if (channelID) {

            (await this.client.channels.fetch(channelID) as TextChannel).send({ embeds: [ logsEmbed({
                member: member,
                title: 'MEMBER LEFT',
                color: colors.red
            })]});

        };

    };

};