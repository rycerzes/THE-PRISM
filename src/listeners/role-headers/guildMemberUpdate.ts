import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { GuildMember, Snowflake } from "discord.js";

export default class extends Listener {

    constructor(context: PieceContext) {
        super(context, {
            name: 'role-headers-guildMemberUpdate',
            event: 'guildMemberUpdate'
        });
    };

    public async run(oldMember: GuildMember, newMember: GuildMember) {

        if (!await this.checkModule(newMember.guild, 'role-headers') || [...oldMember.roles.cache.keys()].join("") === [...newMember.roles.cache.keys()].join("")) return;

        const member = newMember; const guild = member.guild;

        // Initiate roles to remove
        let [ add, remove ]: Snowflake[][] = [[], []];

        const roleHeaders = (await Promise.all((await this.db.getRoleHeaders(guild)).map(async r => {

            return {
                role: await guild.roles.fetch(r.role_id),
                roleHeader: r
            };

        }))).filter(r => r.role).sort((a, b) => a.role!.rawPosition - b.role!.rawPosition);

        // Map roles by pos
        const roleIndex = member.roles.cache.filter(r => r.id !== member.guild.roles.everyone.id).map(r => r.rawPosition);

        // Iterate
        for (let i = 0; i < roleHeaders.length; i++) {

            // Get pos
            const roleHeaderPos = roleHeaders[i].role!.rawPosition;
            // Get pos of lower header, if not take 0
            const prevRoleHeaderPos = i > 0 ? roleHeaders[i-1].role!.rawPosition : 0;
            
            if (roleIndex.some(r => r < roleHeaderPos && r > prevRoleHeaderPos)) {
                if (!member.roles.cache.has(roleHeaders[i].role!.id)) add.push(roleHeaders[i].role!.id)
            } else {
                if (member.roles.cache.has(roleHeaders[i].role!.id)) remove.push(roleHeaders[i].role!.id)
            }

        };

        if (add.length > 0) member.roles.add(add);
        if (remove.length > 0) member.roles.remove(remove)

        return;

    };

};