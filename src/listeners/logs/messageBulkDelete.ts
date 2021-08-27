import { Listener } from "#structures/Listener";
import { colors } from "#util/config";
import { logsEmbed } from "#util/functions";
import type { PieceContext } from "@sapphire/framework";
import type { Collection, Message, Snowflake, TextChannel } from "discord.js";

export default class extends Listener {

    constructor(context: PieceContext) {
        super(context, {
            name: 'logs-messageDeleteBulk',
            event: 'messageDeleteBulk'
        });
    };

    public async run(messages: Collection<Snowflake, Message>) {

        const guild = messages.first()?.guild;

        if (!guild || !await this.checkModule(guild, 'logs')) return;

        const channelID = (await this.db.fetchConfig(guild)).logs_channel_id;

        if (channelID) {

            (await this.client.channels.fetch(channelID) as TextChannel).send({ embeds: [ logsEmbed({
                title: 'BULK DELETE',
                fields: [
                    {
                        name: 'SIZE',
                        value: `\`${messages.size}\``,
                        inline: true
                    },
                    {
                        name: 'CHANNEL',
                        value: `${messages.first()?.channel}`,
                        inline: true
                    },
                ],
                color: colors.red
            })]});

        };

    };

};