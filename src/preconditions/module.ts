import type { Command } from '#structures/Command';
import { Precondition } from '#structures/Precondition';
import type { PieceContext, PreconditionOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {

    constructor(context: PieceContext, { ...options }: PreconditionOptions) {
        super(context, { name: 'module', ...options });
    };

    public module = this.client.modules.get('base') || null;

    public async run(message: Message, command: Command) {

        // No module, ok by default.
        if (!command.module) return this.ok();

        // By default all modules are enabled outside of guilds
        if (!message.guild) return this.ok();

        // Get manager
        let manager = this.client.guildModuleManagers.get(message.guild.id) ?? await this.client.newModuleManager(message.guild);

        return manager.enabled.has(command.module.name) ? this.ok() : this.error({
            message: `Module \`${command.module.name}\` disabled.`
        });
    };
}