import { Argument } from "#structures/Argument";
import { RegEx } from "#util/constants";
import { mentionToSnowflake } from "#util/functions";
import type { ArgumentContext, AsyncArgumentResult, PieceContext } from "@sapphire/framework";
import type { Role } from "discord.js";

export default class extends Argument<Role> {
    constructor(context: PieceContext) {
        super(context, { name: 'role' });
    };

    public async run(parameter: string, { message }: ArgumentContext): AsyncArgumentResult<Role> {

        const guild = message.guild;

        if (!guild) return this.error({ parameter, message: 'Cannot find role without a guild' });

        const roles = await guild.roles.fetch();

        let role: Role | undefined;

        // If ID
        if (RegEx.snowflake.test(parameter)) {

            role = roles.get(parameter);

        // If Mention
        } else if (RegEx.mentions.role.test(parameter)) {

            const id = mentionToSnowflake(parameter);

            role = id ? roles.get(id) : undefined;

        // Any other
        } else {

            role = [...roles.values()].find(r => r.name.toLowerCase().includes(parameter.toLowerCase()))

        }

        return role ? this.ok(role) : this.error({ parameter });

    };
};