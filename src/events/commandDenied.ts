import { Listener } from "#structures/Listener";
import type { CommandDeniedPayload, PieceContext, UserError } from "@sapphire/framework";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'commandDenied',
            event: 'commandDenied'
        });
    };

    public module = null;

    public run({ message: content }: UserError, { message, command }: CommandDeniedPayload) {
        message.channel.send({ embeds: [
            {
                description: `🛑 Command denined: \`${command.name}\``,
                fields: [{ name: 'REASON', value: content}],
                color: this.client.colors.red
            }
        ]})
    }
}