import { Command } from "#structures/Command";
import { colors } from "#util/config";
import type { Args, PieceContext } from "@sapphire/framework";
import type { Message } from "discord.js";

export default class extends Command {
    constructor(context: PieceContext) {
        super(context, {
            name: 'query',
            description: 'Query the database',
            usage: [],
            aliases: ['q'],
            preconditions: ['owner']
        });
    };

    public async run(message: Message, args: Args) {

        const query = (await args.rest('string').catch(() => '')).split('```')[1];

        if (!query) return;

        this.db.query(query, async (err, res) => {

            try {

                if (err) {

                    console.log(err);

                    return message.channel.send({ embeds: [
                        {
                            title: 'ERROR',
                            description: `\`\`\`${query}\`\`\``,
                            fields: [
                                {
                                    name: 'ERROR',
                                    value: `\`\`\`${err}\`\`\``
                                }
                            ],
                            color: colors.red
                        }
                    ]})
                }

                else if (res) {

                    console.log(res)

                    return message.channel.send({ embeds: [
                        {
                            title: 'QUERY',
                            description: `\`\`\`json\n${JSON.stringify(res.rows[0], null, 2)}\n${res.rowCount > 1 ? `... ${res.rowCount - 1} more` : ''}\`\`\``,
                            fields: [
                                {
                                    name: 'RESULT',
                                    value: `\`\`\`js\n{\n   command: '${res.command}',\n    rowCount: ${res.rowCount},\n    oid: ${res.oid}\n}\`\`\``
                                }
                            ],
                            color: await this.client.util.guildColor(message.guild!)
                        }
                    ]})

                };
            } catch(e) {
                return console.error(e)
            }
        })
        

    };
};