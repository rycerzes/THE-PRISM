import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'user',
            description: 'View user info',
            usage: ['(user)']
        });

        this.module = this.client.modules.get('info')!
    };

    public async run(message: Message, args: Args) {

        const user = await args.pick('user').catch(() => message.author);

        return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
            {
                fields: [
                    {
                        name: 'Username',
                        value: `\` ${user.username} \``,
                        inline: true
                    },
                    {
                        name: 'Discrim',
                        value: `\` ${user.discriminator} \``,
                        inline: true
                    },
                    {
                        name: 'Registered',
                        value: `<t:${Math.floor(user.createdTimestamp/1000)}:R>`,
                        inline: true
                    },
                    {
                        name: 'ID',
                        value: `\`\`\`${user.id}\`\`\``,
                    }
                ],
                color: await this.client.util.guildColor(message.guild!) || undefined,
                thumbnail: {
                    url: user.displayAvatarURL({ size: 128 })
                }
            }
        ]})

    };
};