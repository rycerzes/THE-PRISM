import { Listener } from "#structures/Listener";
import { levelCalc, rng } from "#util/functions";
import type { PieceContext } from "@sapphire/framework";
import type { GuildMember } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'xp-guildMemberAddXp',
            event: 'guildMemberAddXp'
        });
    };
    
    public async run(member: GuildMember, type: string) {

        let xp: number; let oldLevel: number;

        // Message
        if (type === 'message') {
            let ran = rng(3, 7);
            ({ xp } = await this.db.updateMember(member, `SET xp = xp + ${ran}, xp_messages = xp_messages + 1, xp_last_message_timestamp = ${Date.now()}`));
            oldLevel = levelCalc(xp - ran);
        };

        // Voice
        if (type === 'voice') {
            ({ xp } = await this.db.updateMember(member, `SET xp = xp + 5, xp_minutes = xp_minutes + 5`));
            oldLevel = levelCalc(xp - 5);
        };

        let newLevel = levelCalc(xp!)

        // Check for Level Up
        if (newLevel > oldLevel!) this.client.emit('guildMemberLevelUp', member, newLevel);

        return;

    };
};