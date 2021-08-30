import { Command } from "#structures/Command";
import { colors } from "#util/constants";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'unmute',
            description: 'Unmute a member',
            usage: ['[member]'],
            preconditions: ['guild', 'moderator'],
        });

        this.module = this.client.modules.get('text-mod')!
    };

    public async run(message: Message, args: Args) {

        const member = (await args.pickResult('member')).value;

        if (!member) return;

        if (!await this.db.isMuted(member)) return message.reply({ allowedMentions: { repliedUser: false }, content: 'This member is not muted.' })

        else {

            await this.db.unmute(member);

            const { mute_role_id } = await this.db.fetchGuild(message.guild!);

            if (mute_role_id) member.roles.remove(mute_role_id);

            return message.reply({ allowedMentions: { repliedUser: false }, embeds: [
                {
                    title: 'MEMBER UNMUTED',
                    description: `${member} has been unmuted.`,
                    color: colors.green
                }
            ]});

        };
    };
};