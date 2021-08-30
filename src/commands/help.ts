import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'help',
            description: 'Get help.',
            usage: ['', '[command]', '[module]'],
        });
    };

    public async run(message: Message, args: Args) {

        if (args.finished) return this.client.emit('help', message);

        const str = await args.rest('string')

        const commandAliases = [...this.client.stores.get('commands').values()].map((c: Command) => {
            let arr = [...c.aliases];
            arr.unshift(c.name)
            return arr;
        }).find(c => c.includes(str.toLowerCase()));

        const module = this.client.modules.get(str.toLowerCase());

        if (commandAliases) {

            const command = this.client.stores.get('commands').get(commandAliases[0]);

            return this.client.emit('help', message, { command });

        } else if (module) {

            return this.client.emit('help', message, { module })

        } else return message.reply({ allowedMentions: { repliedUser: false }, content: 'Unknown command or module.' });
    };
};