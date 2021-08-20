import { Argument } from "#structures/Argument";
import type { ArgumentContext, AsyncArgumentResult, PieceContext } from "@sapphire/framework";
import type { GuildMember } from "discord.js";

export default class extends Argument<GuildMember[]> {
    constructor(context: PieceContext) {
        super(context, { name: 'members' });
    };

    public async run(parameter: string, { message }: ArgumentContext): AsyncArgumentResult<GuildMember[]> {
        
        let arr: GuildMember[] = []; let member: GuildMember | undefined;

        for (const param of parameter.split(" ")) {

            member = this.client.util.resolveMember(param, message.guild!.members.cache);

            if (member) arr.push(member);

        };

        return arr.length > 0 ? this.ok(arr) : this.error({ parameter, message: 'Unable to resolve members' })

    };
};