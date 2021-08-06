import { Listener } from "#structures/Listener";
import { colors } from "#util/config";
import { logsEmbed } from "#util/functions";
import type { PieceContext } from "@sapphire/framework";
import type { ColorResolvable, EmbedField, TextChannel, VoiceState } from "discord.js";

export default class extends Listener {

    constructor(context: PieceContext) {
        super(context, {
            name: 'logs-voiceStateUpdate',
            event: 'voiceStateUpdate'
        });
    };

    public async run(oldState: VoiceState, newState: VoiceState) {

        const member = newState.member;

        if (!member || !this.checkModule(member.guild, 'logs')) return;

        const channelID = (await this.db.fetchConfig(member.guild)).logs_channel_id;

        if (channelID) {

            let state: string; let color: ColorResolvable; let fields: EmbedField[];

            // Find leave-join-switch
            if (oldState.channelId && newState.channelId) {
                state = 'SWITCHED';
                color = await this.client.util.guildColor(member.guild);
                fields = [
                    {
                        name: 'FROM',
                        value: `${oldState.channel}`,
                        inline: true
                    },
                    {
                        name: 'TO',
                        value: `${newState.channel}`,
                        inline: true
                    }
                ];
            }

            else if (!oldState.channelId && newState.channelId) {
                state = 'JOINED';
                color = colors.green;
                fields = [
                    {
                        name: 'CHANNEL',
                        value: `${newState.channel}`,
                        inline: true
                    }
                ];
            }

            else if (oldState.channelId && !newState.channelId) {
                state = 'LEFT';
                color = colors.red;
                fields = [
                    {
                        name: 'CHANNEL',
                        value: `${oldState.channel}`,
                        inline: true
                    }
                ];
            }

            else return;

            (await this.client.channels.fetch(channelID) as TextChannel).send({ embeds: [ logsEmbed({
                member: member,
                title: `MEMBER ${state} CHANNEL`,
                fields: fields,
                color: color
            })]});

        };

    };

};