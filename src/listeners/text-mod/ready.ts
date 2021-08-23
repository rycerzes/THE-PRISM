import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'text-mod-ready',
            event: 'ready'
        });
    };

    public async run() {

        const active = await this.db.getActiveMutes();

        for (const { mute_id, member_id } of active) {

            this.db.trackMute({ mute_id, member_id });
            
        };
    };
};