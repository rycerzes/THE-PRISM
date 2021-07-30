import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { Guild } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'guildCreate',
            event: 'guildCreate'
        });
    };

    public async run(guild: Guild) {

        await this.db.fetchGuild(guild)

    };
};