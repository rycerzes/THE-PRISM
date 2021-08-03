import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { VoiceState } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'voiceStateUpdate',
            event: 'voiceStateUpdate'
        });
    };

    public async run(oldState: VoiceState, newState: VoiceState) {

        if (!newState.member || !oldState.member) return;

        let member = newState.member;
        const data = await this.db.fetchMember(member);

        if (member.user.bot) return;

        // Same / No channel
        if (oldState.channelId === newState.channelId) {
            console.log(1)
        }

        // Join Channel
        else if (!oldState.channelId && newState.channelId) {
            
            // If voice is false, track voice. Otherwise voice is already tracking.
            if (!data.voice) this.db.trackVoice(member);

            await this.db.updateMember(member, `SET voice = true`);

        }

        // Leave Channel
        else if (oldState.channelId && !newState.channelId) {

        }

        // Switch Channel
        else if (oldState.channelId !== newState.channelId) {
            console.log(4)
        }

    };
};