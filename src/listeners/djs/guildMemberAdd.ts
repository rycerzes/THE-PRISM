import { Listener } from "#structures/Listener";
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

        await this.db.fetchMember(member);

    }
}