import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import { ButtonInteraction, GuildMember, Interaction, Message, MessageActionRow, MessageEmbed } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'avatar',
            description: 'View a users avatar',
            usage: ['(member)'],
            preconditions: ['guild'],
            aliases: ['av']
        });

        this.module = this.client.modules.get('info')!
    };

    public async messageRun(message: Message, args: Args) {

        const member = await args.pick('member').catch(() => message.member!);

        let bool = true;

        let sent = await message.reply({ allowedMentions: { repliedUser: false }, embeds: [ await this.getEmbed(member, bool) ], components: member.avatar ? this.getComponents(bool) : []});

        const collector = sent.createMessageComponentCollector({ filter: (interaction: Interaction) => interaction.user.id === message.author.id });

        collector.on('collect', async (int: ButtonInteraction) => {
            if (int.customId === 'switch') {
                bool = !bool;
                return int.update({ embeds: [ await this.getEmbed(member, bool) ], components: this.getComponents(bool)})
            } else return;
        })

    };

    async getEmbed(member: GuildMember, bool: boolean): Promise<MessageEmbed> {
        return new MessageEmbed({
            color: await this.client.util.guildColor(member.guild!),
            image: {
                url: bool ? member.displayAvatarURL({ size: 1024 }) : member.user.displayAvatarURL({ size: 1024})
            }
        })
    }

    getComponents(bool: boolean): MessageActionRow[] {

        return [new MessageActionRow({
            type: 'ACTION_ROW',
            components: [
                {
                    type: 'BUTTON',
                    label: bool ? 'VIEW USER AVATAR' : 'VIEW SERVER AVATAR',
                    customId: 'switch',
                    style: 'SECONDARY',
                }
            ]
        })]

    }
};