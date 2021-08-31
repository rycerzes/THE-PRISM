import { Listener } from "#structures/Listener";
import { levelCalc } from "#util/functions";
import type { PieceContext } from "@sapphire/framework";
import type { GuildMember } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'guildMemberAdd',
            event: 'guildMemberAdd'
        });
    };

    public async run(member: GuildMember) {

        const data = await this.db.fetchMember(member);
        this.client.emit('guildMemberLevelUp', member, levelCalc(data.xp));

    }
}