import { Command } from "#structures/Command";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message, VoiceChannel } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'userlimit',
            description: 'Change the limit to a temporary call.',
            detailedDescription: 'Change the userlimit to a temporary call.\nLimit must be between \`0-99\` (\`0\` is unlimited).',
            usage: ['[limit]'],
            preconditions: ['guild']
        });
        
        this.module = this.client.modules.get('calls')!;
    };

    public async run(message: Message, args: Args): Promise<any> {

        const call = await this.db.getCall(message.channel.id);

        if (!call) return message.reply({ allowedMentions: { repliedUser: false }, content: 'This command must be done in a call\'s text channel' });

        const limit = (await args.pickResult('integer')).value;

        if (limit === undefined || limit < 0 || limit > 99) return this.client.emit('help', message, { command: this });

        if (message.author.id === call.user_id) {

            let vc: VoiceChannel;

            try {

                vc = (await this.client.channels.fetch(call.voice_channel_id) as VoiceChannel);
                
            } catch {
                return message.reply({ allowedMentions: { repliedUser: false }, content: 'Voice channel not found.' })
            };

            await vc.setUserLimit(limit);

            return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                {
                    title: 'UPDATED CALL SETTINGS',
                    description: `User limit for ${vc} is now set to \` ${limit} \`.`,
                    color: await this.client.util.guildColor(message.guild!)
                }
            ]});
            
        } else return;

    };
};