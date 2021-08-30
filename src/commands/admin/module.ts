import { Command } from "#structures/Command";
import { colors } from "#util/constants";
import type { GuildModuleManager } from "#structures/GuildModuleManager";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message, ReplyMessageOptions } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'module',
            description: 'Configure modules.',
            usage: ['[module]', '[module] (enable|disable)'],
            preconditions: ['guild', 'admin'],
        })

        this.module = this.client.modules.get('admin')!
    }

    public async run(message: Message, args: Args) {

        const module = await args.pick('module').catch(() => undefined);

        if (!module) {
            return message.reply({ content: 'Invalid module.', allowedMentions: { repliedUser: false }});
        } else if (module.required) {
            return message.reply({ content: 'You can\'t modify this module.', allowedMentions: { repliedUser: false }});
        } else {

            const option = await args.pick('moduleoption').catch(() => 'INFO');

            let manager: GuildModuleManager = this.client.guildModuleManagers.get(message.guild!.id) ?? await this.client.newModuleManager(message.guild!);

            switch (option) {

                default:
                case 'INFO':

                    let msg = async (buttons: boolean = true): Promise<ReplyMessageOptions> => {
                        return { allowedMentions: { repliedUser: false }, embeds: [
                            {
                                title: module.name.toUpperCase(),
                                description: module.description,
                                fields: [
                                    {
                                        name: 'CURRENTLY',
                                        value: `${manager.isEnabled(module.id) ? ' `ENABLED`' : '`DISABLED`'}`,
                                        inline: true
                                    },
                                ],
                                color: await this.client.util.guildColor(message.guild!)
                            }
                        ], components: buttons ? [
                            {
                                type: 'ACTION_ROW',
                                components: [
                                    {
                                        customId: 'moduleEnable',
                                        type: 'BUTTON',
                                        label: 'ENABLE',
                                        style: 'SUCCESS',
                                        disabled: manager.isEnabled(module.id)
                                    },
                                    {
                                        customId: 'moduleDisable',
                                        type: 'BUTTON',
                                        label: 'DISABLE',
                                        style: 'DANGER',
                                        disabled: !manager.isEnabled(module.id)
                                    }
                                ]
                            }
                        ] : []}
                    }

                    let sent = await message.reply(await msg())

                    const collector = sent.createMessageComponentCollector({ filter: interaction => interaction.user.id === message.author.id, time: 60000 });

                    collector.on('collect', async interaction => {
                        if (!interaction.isButton()) return;
                        
                        switch (interaction.customId) {
                            case 'moduleEnable':
                                await manager.enable(module.id)
                                return await interaction.update(await msg());
                            case 'moduleDisable':
                                await manager.disable(module.id)
                                return await interaction.update(await msg())
                        }
                    });

                    collector.on('end', async () => {
                        await sent.edit(await msg(false))
                    })

                    return;

                case 'ENABLE':

                    let enabled = await manager.enable(module.id);

                    return enabled ? message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                        {
                            description: `🟩 • \`${module.name.toUpperCase()}\` has been enbabled.`,
                            color: colors.green
                        }
                    ]}) : message.reply({ content: `An error occurred.` });

                case 'DISABLE':

                    let disabled = await manager.disable(module.id);

                    return disabled ? message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                        {
                            description: `🟥 • \`${module.name.toUpperCase()}\` has been disabled.`,
                            color: colors.red
                        }
                    ]}) : message.reply({ content: `An error occurred.` });
            };

        };
    };
};