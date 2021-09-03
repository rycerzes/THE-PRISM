import type { duration } from "#lib/types/util";
import { Command } from "#structures/Command";
import { RegEx } from "#util/constants";
import { durationToMilli, durationToString } from "#util/functions";
import type { Args, PieceContext } from "@sapphire/framework";
import { ButtonInteraction, Message, MessageActionRow, MessageComponentInteraction } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'giveaway',
            description: 'Start a giveaway',
            detailedDescription: 'Start a giveaway. The time can be in minutes, hours, or days. Specify the time unit with an, "m", "h", or "d", for example `30m` or `2h`.',
            usage: ['[prize] [time]', '[time] [prize]'],
            preconditions: ['guild'],
            aliases: ['give', 'g']
        });

        this.module = this.client.modules.get('giveaways')!;
    };

    public async run(message: Message, args: Args): Promise<any> {

        const { duration, rest: prize } = this.parseStr(await args.rest('string').catch(() => ''));

        if (!prize || !durationToMilli(duration)) return this.client.emit('help', message, { command: this });

        let sent = await message.channel.send({ embeds: [
            {
                title: 'GIVEAWAY',
                description: `Prize: \`\`\`${prize}\`\`\`\nDuration:\`\`\`${durationToString(duration)}\`\`\``,
                color: await this.client.util.guildColor(message.guild!)
            }
        ], components: [
            new MessageActionRow({
                components: [
                    {
                        type: 'BUTTON',
                        label: 'START',
                        customId: 'giveawayStart',
                        style: 'DANGER'
                    }, {
                        type: 'BUTTON',
                        label: 'CANCEL', 
                        customId: 'giveawayCancel',
                        style: 'SECONDARY'
                    }
                ]
            })
        ]});

        const int = await sent.awaitMessageComponent({ filter: async (interaction: MessageComponentInteraction) => {
            await interaction.deferUpdate();
            return interaction.isButton() && interaction.user.id === message.author.id
        }, time: 30*1000 }).catch(() => undefined) as ButtonInteraction | undefined;

        if (!int || int.customId === 'giveawayCancel') return sent.delete();

        await this.db.startGiveaway(message.author, sent, prize, durationToMilli(duration)!);

        return message.delete();

    };

    private parseStr(str: string): { duration: duration, rest: string } {

        const reg = RegEx.times

        // Duration
        let times = str.match(reg);

        let duration: duration = { d: 0, h: 0, m: 0 }

        times?.forEach(t => { // Inputs could be anything from "1d" to "999h" or "25m" etc.

            let [n, unit]: [number, string] = [ Number(t.match(/\d+/gi)![0]), t.match(/(d|m|h)/gi)![0] ];
            return Reflect.set(duration, unit, n > 999 ? 999 : n)

        });

        // Reason
        let rest = str.replace(reg, '').trim();

        return { duration, rest }

    };
};