import { Listener } from "#structures/Listener";
import { logsEmbed } from "#util/functions";
import type { PieceContext } from "@sapphire/framework";
import type { EmbedField, GuildMember, TextChannel } from "discord.js";

export default class extends Listener {

    constructor(context: PieceContext) {
        super(context, {
            name: 'logs-guildMemberUpdate',
            event: 'guildMemberUpdate'
        });
    };

    public async run(oldMember: GuildMember, newMember: GuildMember) {

        if (!await this.checkModule(newMember.guild, 'logs')) return;

        const channelID = (await this.db.fetchConfig(newMember.guild)).logs_channel_id;

        if (channelID) {

            // Find changes
            let fields: EmbedField[] = [];

            // If roles aren't the same
            if ([...oldMember.roles.cache.keys()].join("") !== [...newMember.roles.cache.keys()].join("")) {
                let [added, removed] = [ newMember.roles.cache.filter(r => ![...oldMember.roles.cache.keys()].includes(r.id)), oldMember.roles.cache.filter(r => ![...newMember.roles.cache.keys()].includes(r.id)) ];
                
                // If roles are added
                if (added.size > 0) fields.push({
                    name: added.size === 1 ? 'ADDED ROLE' : 'ADDED ROLES',
                    value: [...added.values()].map(r => `<@&${r.id}>`).join("\n"),
                    inline: true
                })

                // If roles are removed
                if (removed.size > 0) fields.push({
                    name: removed.size === 1 ? 'REMOVED ROLE' : 'REMOVED ROLES',
                    value: [...removed.values()].map(r => `<@&${r.id}>`).join("\n"),
                    inline: true
                })

            };

            // If nickname changed
            if (oldMember.nickname !== newMember.nickname) {
                fields.push({
                    name: 'OLD NICK',
                    value: oldMember.nickname || '`null`',
                    inline: true,
                });
                fields.push({
                    name: 'NEW NICK',
                    value: newMember.nickname || '`null`',
                    inline: true
                });
            };

            (await this.client.channels.fetch(channelID) as TextChannel).send({ embeds: [ logsEmbed({
                member: newMember,
                title: 'MEMBER UPDATED',
                fields: fields,
                color: await this.client.util.guildColor(newMember.guild)
            })]});

        };

    };

};