import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { TextChannel, VoiceState } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'calls-voiceStateUpdate',
            event: 'voiceStateUpdate'
        });
    };

    public async run(oldState: VoiceState, newState: VoiceState) {

        if (!newState.member || !oldState.member) return;

        // Leave Channel
        if (oldState.channelId && !newState.channelId) {

            const call = await this.db.getCall(oldState.channelId);

            if (call && oldState.channel?.members.size === 0) {

                const channel = await this.client.channels.fetch(call.text_channel_id) as TextChannel;

                let sent = await channel.send({ content: 'Everyone has left. This call will be deleted in `15` seconds.', components: [
                    {
                        type: 'ACTION_ROW',
                        components: [
                            {
                                type: 'BUTTON',
                                customId: 'cancelEnd',
                                label: 'CANCEL',
                                style: 'DANGER'
                            }
                        ]
                        
                    }
                ] });
        
                let n = 0;
                let interval = setInterval(async () => {

                    n++;

                    if (oldState.channel!.members.size > 0) {
                        clearInterval(interval)
                        sent.edit({ components: [
                            {
                                type: 'ACTION_ROW',
                                components: [
                                    {
                                        type: 'BUTTON',
                                        customId: 'cancelEnd',
                                        label: 'CANCELED',
                                        style: 'SECONDARY',
                                        disabled: true
                                    }
                                ]
                                
                            }
                        ]});
                        setTimeout(() => sent.delete(), 5000);
                        return;
                    }

                    if (n === 15) {
        
                        (await this.client.channels.fetch(call.voice_channel_id))?.delete();
                        (await this.client.channels.fetch(call.text_channel_id))?.delete();
                
                        await this.db.deleteCall(call.call_id);

                        clearInterval(interval);
                        return;
                    };
        
                }, 1000);
        
                const collector = sent.createMessageComponentCollector({ filter: interaction => interaction.componentType === 'BUTTON' && interaction.customId === 'cancelEnd', max: 1, time: 15000 });
        
                collector.on('collect', interaction => {
                    interaction.update({ components: [
                        {
                            type: 'ACTION_ROW',
                            components: [
                                {
                                    type: 'BUTTON',
                                    customId: 'cancelEnd',
                                    label: 'CANCELED',
                                    style: 'SECONDARY',
                                    disabled: true
                                }
                            ]
                            
                        }
                    ]});
                    setTimeout(() => sent.delete(), 5000);
                    clearTimeout(interval);   
                });

            };
        };
    };
};