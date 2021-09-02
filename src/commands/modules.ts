import { Command } from "#structures/Command";
import type { GuildModuleManager } from "#structures/GuildModuleManager";
import type { PieceContext } from "@sapphire/framework";
import type { Message, MessageComponentInteraction } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'modules',
            description: 'View enabled modules',
            usage: [''],
            preconditions: ['guild', 'admin']
        })
    }

    public async run(message: Message) {

        let manager: GuildModuleManager = this.client.guildModuleManagers.get(message.guild!.id) ?? await this.client.newModuleManager(message.guild!);

        // Find longest length
        const max = [...this.client.modules.values()].sort((a, b) => b.name.length - a.name.length)[0].name.length;

        function whitespace(n: number) {
            let arr = [];
            for (let i = 0; i < n; i++) {
                arr.push('─');
            }
            return arr.join('');
        }

        const embed = async () => {
            return {
                title: 'MODULES',
                description: `\`\`\`ml\n${[...this.client.modules.values()].map(m => `${m.name.toUpperCase()}: ${whitespace(max-m.name.length + 6)}${manager.enabled.get(m.name) != null ? '─ enabled': ' disabled'}`).join('\n')}\`\`\``,
                color: await this.client.util.guildColor(message.guild!)
            }
        }

        let sent = await message.reply({ allowedMentions: { repliedUser: false }, embeds: [
            await embed()
        ], components: [
            {
                type: 'ACTION_ROW',
                components: [
                    {
                        customId: 'modulesRevert',
                        label: 'REVERT TO DEFAULTS',
                        style: 'SECONDARY',
                        type: 'BUTTON'
                    }
                ]
            }
        ]})

        const collector = sent.createMessageComponentCollector({ filter: (interaction: MessageComponentInteraction) => interaction.user.id === message.author.id, time: 60000 });

        collector.on('collect', async interaction => {
            if (!interaction.isButton()) return;
            if (interaction.customId === 'modulesRevert') {
                await manager.revert()
                return interaction.update({ embeds: [await embed()]})
            };
        });

        collector.on('end', () => {
            sent.edit({ components: [] })
        });

    };
};