import { Argument } from "#structures/Argument";
import type { ArgumentContext, AsyncArgumentResult, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Argument<Message> {
    constructor(context: PieceContext) {
        super(context, { name: 'guildMsg' });
    };

    public async run(parameter: string, { message }: ArgumentContext): AsyncArgumentResult<Message> {

        if (!message.guild) return this.error({ parameter, message: 'No guild' });

        const msg = await this.client.util.resolveMessage(parameter);

        return msg && msg.guild?.id === message.guild.id ? this.ok(msg) : this.error({ parameter, message: 'No guild message found' })

    };
};