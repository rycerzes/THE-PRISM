import type { BaseModule } from "#structures/BaseModule";
import type { Command } from "#structures/Command";
import { Listener } from "#structures/Listener";
import { blankFieldInline, colors } from "#util/constants";
import type { PieceContext, PreconditionContainerSingle } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'help',
            event: 'help'
        });
    };

    public async run(message: Message, piece?: { command?: Command, module?: BaseModule }) {

        const prefix = await this.client.fetchPrefix(message);

        if (piece?.module) {

            const module = piece.module;

            const commands = [...module.getCommands().values()];

            let fields: { name: string; value: string; inline: boolean }[] = [];

            for (let i = 0; i < commands.length; i++) {

                fields.push({
                    name: commands[i].name.toUpperCase(),
                    value: `${commands[i].description}\n\u200b`,
                    inline: true
                });

                if (i % 2 === 0 ) fields.push(blankFieldInline)

            };

            return await message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                {
                    title: `${module.name.toUpperCase()} COMMANDS`,
                    description: `Type \`${prefix}help [command]\` for more information on a command.\n\u200b`,
                    fields: fields,
                    color: message.guild ? await this.client.util.guildColor(message.guild) : colors.default
                }
            ]});

        } else if (piece?.command) {

            const command = piece.command;
            
            let fields: { name: string; value: string; inline: boolean }[] = [];

            if (command.usage.length > 0) fields.push({
                name: 'USAGE',
                value: command.usage.map(u => `\`${prefix}${command.name} ${u}\``).join('\n'),
                inline: false
            });

            if (command.aliases.length > 0) fields.push({
                    name: 'ALIASES',
                    value: command.aliases.map(a => `\`"${a}"\``).join('\n'),
                    inline: false
            });

            return await message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                {
                    title: `COMMAND: ${command.name.toUpperCase()}`,
                    description: command.detailedDescription || command.description,
                    fields: fields,
                    color: message.guild ? await this.client.util.guildColor(message.guild) : colors.default
                }
            ]});

        } else {

            const modules = [...this.client.modules.values()];
            const manager = message.guild ? await this.client.getModuleManager(message.guild) : undefined;

            modules.forEach(m => m.getCommands());

            let fields = modules.filter(m => m.commands.size !== 0 && (!manager || (manager && manager.isEnabled(m.id)))).sort((a: BaseModule, b: BaseModule) => b.commands.size - a.commands.size).map(m => {

                return {
                    name: m.name.toUpperCase(),
                    value: `${[...m.commands.values()].map(c => {

                        let flags: string[] = [];

                        const preconditions = c.preconditions.entries.flat(3) as PreconditionContainerSingle[];

                        if (preconditions.some(p => p.name === 'admin')) flags.push('`[A]`');
                        if (preconditions.some(p => p.name === 'moderator')) flags.push('`[M]`');
                        if (preconditions.some(p => p.name === 'owner')) flags.push('`[O]`');


                        return `${flags.length > 0 ? `${flags.join(' ')} ` : ''}${prefix}${c.name}`
                    }).join('\n')}\n\u200b`,
                    inline: true
                }
            });

            if (fields.length % 3 !== 0) {
                for (let i = fields.length % 3; i < 3; i++) {
                    fields.push(blankFieldInline)
                }
            };

            return await message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                {
                    title: `${this.client.user?.username.toUpperCase()} COMMANDS`,
                    description: `A list of all available commands. Some may not be enabled.\n\`[A]\` - Admin only commands\n\`[M]\` - Moderator only commands\n\`[O]\` - Owner only commands\n\u200b`,
                    fields: fields,
                    color: message.guild ? await this.client.util.guildColor(message.guild) : colors.default,
                    thumbnail: {
                        url: this.client.user?.displayAvatarURL()
                    }
                }
            ]});

        };

    };
};