import { Listener } from "#structures/Listener";
import type { PieceContext } from "@sapphire/framework";
import type { Message, TextChannel } from "discord.js";

export default class extends Listener {
    
    constructor(context: PieceContext) {
        super(context, {
            name: 'whitelist',
            event: 'messageCreate'
        })
    }

    public async run(message: Message) {

        if (!message.guild) return;
        if (message.channel.id !== '920401004820832306') return;
        if (message.author.id === this.client.user!.id) return;

        try {

            const username: string = message.content;

            if (!/^([a-z]|[0-9]|\_){3,16}$/gi.test(username)) return message?.delete();

            const { mc_username, mc_username_url } = (await this.client.db.query(`SELECT mc_username, mc_username_url FROM members WHERE user_id = ${message.author.id} AND guild_id = ${message.guild!.id}`)).rows[0];

            if (mc_username) {
                if (mc_username.toLowerCase() === username.toLowerCase()) return message?.delete();
            };

            if (mc_username_url) {
                let old = await this.client.util.resolveMessage(mc_username_url);
                if (old) old.delete();
            }

            await this.client.db.query(`UPDATE members SET mc_username = '${username}', mc_username_url = '${message.url}' WHERE user_id = ${message.author.id} AND guild_id = ${message.guild!.id}`)

            const serverConsole: TextChannel = await message.guild!.channels.fetch('792244138178248735') as TextChannel;

            if (serverConsole) {

                serverConsole.send(`whitelist add ${username}`);
                if (mc_username) serverConsole.send(`whitelist remove ${mc_username}`);

                let sent: Message | undefined;
                if (mc_username === null) {
                    sent = await message.channel.send(`Added \`${username}\` to the whitelist.`)
                } else {
                    sent = await message.channel.send(`Added \`${username}\` to the whitelist.\nRemoved \`${mc_username}\`.`)
                };

                setTimeout(() => sent?.delete(), 7500)

            } else {
                message.reply('No server console found.')
            }

        } catch {

        }

        return;

    }
}