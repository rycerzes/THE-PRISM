import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'responder-messageCreate',
            event: 'messageCreate'
        });
    };

    public async run(message: Message) {

        if (message.author.bot) return;
        
        const guild = message.guild;
        if (!guild || !await this.checkModule(guild, 'responder')) return;

        const responders = await this.db.fetchResponders(guild);

        for (const responder of responders) {

            const reg = responder.match_any ? new RegExp(`${responder.regex}`, 'gmi') : new RegExp(`^${responder.regex}$`, 'gi');

            if (reg.test(message.content)) {
                if (responder.reaction_response) message.react(responder.reaction_response);
                if (responder.text_response) message.channel.send(await this.client.util.parseText(responder.text_response, { member: message.member! }));
            }
        };
    };
};