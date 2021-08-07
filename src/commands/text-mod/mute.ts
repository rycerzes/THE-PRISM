import type { duration } from "#lib/types/util";
import { Command } from "#structures/Command";
import { colors } from "#util/config";
import { RegEx } from "#util/constants";
import { durationToMilli } from "#util/functions";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Guild, GuildMember, Message, Role, Snowflake } from "discord.js";

export default class extends Command {

    constructor(context: PieceContext) {
        super(context, {
            name: 'mute',
            description: 'Mute a member',
            usage: ['[member]', '[member] (duration) (reason)'],
            preconditions: ['moderator', 'guild']
        });

        this.module = this.client.modules.get('text-mod')!;
    };

    public async run(message: Message, args: Args) {

        const member = (await args.pickResult('member')).value;

        if (!member) return; // No member

        let { mute_role_id } = await this.db.fetchGuild(member.guild); // Get muterole id

        // Fetch role
        const role = mute_role_id ? await member.guild.roles.fetch(mute_role_id) : undefined;

        // Create role if none
        if (!mute_role_id || !role) {
            
            const sent = await message.reply({ allowedMentions: { repliedUser: false }, content: 'No muterole found. Would you like to create one?\n(You can set an existing one with the `setmuterole` command)', components: [
                {
                    type: 'ACTION_ROW',
                    components: [
                        {
                            type: 'BUTTON',
                            customId: 'muteRoleYes',
                            label: 'YES',
                            style: 'SUCCESS'
                        },
                        {
                            type: 'BUTTON',
                            customId: 'muteRoleNo',
                            label: 'NO',
                            style: 'DANGER'
                        }
                    ]
                }
            ]});
        
            const collector = sent.createMessageComponentCollector({ filter: (interaction) => ['muteRoleYes', 'muteRoleNo'].includes(interaction.customId) && interaction.user.id === message.author.id, time: 20*1000, max: 1 });

            // "YES" creates a new role
            // "NO" simply ends the collector.

            collector.on('collect', async interaction => {

                if (!interaction.isButton()) return;

                if (interaction.customId === 'muteRoleYes') {

                    const roleId = await this.createMuteRole(member.guild); // THIS IS THE IMPORTANT BIT
                    sent.delete();
                    message.channel.send({ embeds: [
                        {
                            title: 'MUTE ROLE CREATED',
                            description: `<@&${roleId}>`,
                            color: colors.green,
                            timestamp: Date.now()
                        }
                    ]});
                    return interaction.deferUpdate();

                } else return;

            });


            // Remove buttons after 20s / Max
            collector.on('end', async () => {
                await sent.edit({ components: [] })
            });

            return;
        
        };

        const rest = await args.rest('string').catch(() => '');

        const { duration, reason } = this.parseStr(rest);

        const muted = await this.mute(member, role, reason, duration);

        if (muted) {

            const milli = durationToMilli(duration);

            if (milli && milli > 60*60*1000) {
                message.author.send({ embeds: [
                    {
                        title: 'ALERT',
                        description: `You have been muted in ${member.guild.name}`,
                        fields: [
                            {
                                name: 'REASON',
                                value: `\`${reason || 'null'}\``
                            },
                            {
                                name: 'DURATION',
                                value: `\`${durationToMilli(duration) ? `${duration.d}d, ${duration.h}h, ${duration.m}m` : 'undefined'}\``
                            }
                        ],
                        color: colors.red,
                        footer: {
                            text: 'You\'ll be unmuted'
                        },
                        timestamp: Date.now() + milli
                    }
                ]});
            }

            return message.channel.send({ embeds: [
                {
                    title: 'MEMBER MUTED',
                    description: `${member} has been muted.`,
                    fields: [
                        {
                            name: 'REASON',
                            value: `\`${reason || 'null'}\``
                        },
                        {
                            name: 'DURATION',
                            value: `\`${durationToMilli(duration) ? `${duration.d}d, ${duration.h}h, ${duration.m}m` : 'undefined'}\``
                        }
                    ],
                    color: colors.red,
                    footer: {
                        text: milli ? 'Unmuted' : ''
                    },
                    timestamp: milli ? Date.now() + milli : Date.now()
                }
            ]});



        } else return;

    };

    public async mute(member: GuildMember, role: Role, reason: string, duration: duration): Promise<boolean> {

        try {

            await member.roles.add(role);
            await this.db.mute(member, reason, duration)

            return true;

        } catch (e) {
            console.log(e)
            return false;
        }


    };

    public parseStr(str: string): { duration: duration, reason: string } {

        const reg = RegEx.times

        // Duration
        let times = str.match(reg);

        let duration: duration = { d: 0, h: 0, m: 0 }

        times?.forEach(t => { // Inputs could be anything from "1d" to "999h" or "25m" etc.

            let [n, unit]: [number, string] = [ Number(t.match(/\d+/gi)![0]), t.match(/(d|m|h)/gi)![0] ];
            return Reflect.set(duration, unit, n > 999 ? 999 : n)

        });

        // Reason
        let reason = str.replace(reg, '')

        return { duration, reason }

    };

    public async createMuteRole(guild: Guild): Promise<Snowflake> {

        const role = await guild.roles.create({ name: 'Muted', color: '#1d1d1d'});
            
        return (await this.db.updateGuild(guild, `SET mute_role_id = ${role.id}`)).mute_role_id!;

    };
};