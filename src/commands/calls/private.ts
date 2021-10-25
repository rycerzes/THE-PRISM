import { Command } from "#structures/Command";
import type { PieceContext } from "@sapphire/framework";
import type { Message, VoiceChannel } from "discord.js";

export default class extends Command {

    constructor(context: PieceContext) {
        super(context, {
            name: 'private',
            description: 'Make a temporary call private',
            usage: [],
            preconditions: ['guild'],
            aliases: ['private']
        });

        this.module = this.client.modules.get('calls')!;

    };

    public async messageRun(message: Message) {

        const call = await this.db.getCall(message.channel.id);

        if (!call) return message.reply({ allowedMentions: { repliedUser: false }, content: 'This command must be done in a call\'s text channel' });

        if (message.author.id === call.user_id) {

            let vc: VoiceChannel;

            try {

                vc = (await this.client.channels.fetch(call.voice_channel_id) as VoiceChannel);
                
            } catch {
                return message.reply({ allowedMentions: { repliedUser: false }, content: 'Voice channel not found.' })
            };

            const perm = !vc.permissionOverwrites.resolve(message.guild!.roles.everyone.id)?.allow.serialize().VIEW_CHANNEL;

            await vc.permissionOverwrites.edit(message.guild!.roles.everyone.id, { VIEW_CHANNEL: perm });

            return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                {
                    title: 'UPDATED CALL PERMISSIONS',
                    description: `\`VIEW CHANNEL\` is now set to \`${perm}\` for @everyone`,
                    color: await this.client.util.guildColor(message.guild!)
                }
            ]});
            
        } else return;
    };
};