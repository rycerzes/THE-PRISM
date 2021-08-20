import type { LevelRole } from "#lib/types/db";
import { Listener } from "#structures/Listener";
import { messages } from "#util/constants";
import type { PieceContext } from "@sapphire/framework";
import type { GuildMember, TextChannel } from "discord.js";

export default class extends Listener {
    constructor(context: PieceContext) {
        super(context, {
            name: 'xp-levelUp',
            event: 'xp-levelUp'
        });
    };

    public async run(member: GuildMember, level: number, broadcast: boolean = true) {

        const { levels_channel_id: channelId, level_up_text: text, levels_message_embed: isEmbed, level_role_stack: stack } = await this.db.fetchConfig(member.guild);

        // Send Message
        if (channelId && broadcast) {

            const channel = await member.guild.channels.fetch(channelId) as TextChannel;

            if (channel) {

                if (isEmbed) {

                    channel.send({ embeds: [
                        {
                            title: 'LEVEL UP!',
                            description: await this.client.util.parseText(text ?? messages.levelup, { member: member, level: level }),
                            color: await this.client.util.guildColor(member.guild),
                            footer: {
                                text: member.user.tag
                            },
                            timestamp: Date.now()
                        }
                    ]});

                } else {

                    channel.send({ content: await this.client.util.parseText(text ?? messages.levelup, { member: member, level: level }) })

                }

            }

        };

        let levelRoles = (await this.db.getLevelRoles(member.guild)).sort((a, b) => b.level - a.level)//.filter(r => r.level <= level);

        let add: LevelRole[] = []; let rem: LevelRole[] = [];

        if (stack) {

            add = levelRoles.filter(r => r.level <= level && !member.roles.cache.has(r.role_id));
            rem = levelRoles.filter(r => r.level > level);

        } else {

            const max = levelRoles.filter(r => r.level <= level)[0].level;

            add = levelRoles.filter(r => r.level === max && !member.roles.cache.has(r.role_id))
            rem = levelRoles.filter(r => r.level !== max)

        };
        
        await member.roles.remove(rem.map(r => r.role_id))
        await member.roles.add(add.map(r => r.role_id));

    };
};