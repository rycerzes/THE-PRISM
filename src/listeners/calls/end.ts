import type { Call } from "#lib/types/db";
import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { TextChannel } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'calls-end',
            event: 'calls-end'
        });
    };

    public async run(channel: TextChannel, call: Call) {

        let sent = await channel.send({ content: 'This call will be deleted in `15` seconds.', components: [
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

        let timeout = setTimeout(async () => {

            (await this.client.channels.fetch(call.voice_channel_id))?.delete();
            (await this.client.channels.fetch(call.text_channel_id))?.delete();
    
            await this.db.deleteCall(call.call_id);

        }, 15000);

        const collector = sent.createMessageComponentCollector({ filter: interaction => interaction.componentType === 'BUTTON' && interaction.customId === 'cancelEnd', max: 1, time: 15000 });

        collector.on('collect', interaction => {
            interaction.deferUpdate();
            clearTimeout(timeout);   
        });

    };
};