import { Command } from "#structures/Command";
import type { PieceContext } from "@sapphire/framework";
import {  Message,  MessageAttachment } from "discord.js";
import { promises as fsp } from "fs";
import Canvas from 'canvas';
import { colors } from "#util/constants";
const { createCanvas, registerFont } = Canvas;

export default class extends Command {

    constructor(context: PieceContext) {
        super(context, {
            name: 'wordle',
            usage: [''],
            description: 'Play a game of wordle'
        })
    }

    async messageRun(message: Message) {

        const words = (await fsp.readFile('./src/lib/util/words.txt', { encoding: 'utf-8' })) // returns a big string.
            .split('\n') // Splits string at every line break
            .filter(word => /^\w{5}$/i.test(word))
            .map(word => word.toUpperCase());

        const w = (await fsp.readFile('./src/lib/util/wordle-words.txt', { encoding: 'utf-8' }))
            .toUpperCase()
            .split('\n')
            .map(word => word.slice(0, 5));
            
        const word = w[Math.floor(Math.random() * w.length)];

        let guesses: string[][] = [
            [], [], [], [], [], []
        ];

        let end = false;
        let sent: Message | undefined;
        let guessMessage: Message | undefined;
        let guess: string | undefined;
        let numOfGuesses: number = 0;

        // const collector = sent.createMessageComponentCollector({ filter: (interaction) => interaction.user.id === message.author.id && interaction.isButton(), max: 1 });

        // collector.on('collect', async (interaction: ButtonInteraction) => {
        //     interaction.update(await this.getMessageOptions(message, guesses, true));
        //     end = true;
        // })

        while (!end) {

            sent = await message.channel.send(await this.getMessageOptions(message, guesses, word));

            guessMessage = (await message.channel.awaitMessages({ max: 1, time: 300 * 1000, filter: (msg) => msg.author.id === message.author.id })).first();
            guess = guessMessage?.content.toUpperCase();

            if (!guess || end) break;

            if (!words.includes(guess)) {
                guessMessage?.delete();
                continue;
            };

            guesses[numOfGuesses++] = guess.split('');

            if (guess === word) end = true
            if (numOfGuesses >= 6) end = true;

            sent.delete();

        }

        sent = await message.channel.send(await this.getMessageOptions(message, guesses, word, guess === word));

    }

    async getMessageOptions(message: Message, guesses: string[][], word: string, win?: boolean) {

        return {
            files: [new MessageAttachment(await this.drawCanvas(guesses, word), 'canvas.png')],
            embeds: [
                {
                    title: 'WORDLE',
                    description: win === undefined ? `🟩 Letters are in the correct spot.\n🟨 Letters are in the word, but in the wrong spot.\n⬛ Letters are not in the word at all\n\u200b` : `WORD: \`${word}\``,
                    author: {
                        icon_url: message.member?.displayAvatarURL() || message.author.displayAvatarURL(),
                        name: message.member?.displayName || message.author.tag
                    },
                    image: {
                        url: 'attachment://canvas.png'
                    },
                    color: win === true ? colors.green : win === false ? colors.red : await this.client.util.guildColor(message.guild!)
                }
            ],
            // components: quit ? [] : [
            //     new MessageActionRow({
            //         type: 'ACTION_ROW',
            //         components: [
            //             {
            //                 type: 'BUTTON',
            //                 label: 'QUIT',
            //                 style: 'DANGER',
            //                 customId: 'quit',
            //             }
            //         ]
            //     })
            // ]
        }

    }

    async drawCanvas(guesses: string[][], word: string): Promise<Buffer> {

        const canvas = createCanvas(686, 874);
        const ctx = canvas.getContext('2d');

        registerFont('./src/assets/fonts/bahnschrift-main.ttf', {family: 'bahnschrift'})

        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.font = '64px "bahnschrift"'

        // For each row
        for (let j = 3; j < canvas.height; j += 148) {

            const row = (j-3)/148;

            let compareWord = word;

            // For each cell
            for (let i = 3; i < canvas.width; i += 138) {

                const cell = (i-3)/138;
                const letter = guesses[row][cell];

                if (letter) {

                    // Background colour
                    if (compareWord.includes(letter)) {

                        ctx.fillStyle = word.charAt(cell) === letter ? '#49c453' : '#cca83d';
                        ctx.fillRect(i, j, 128, 128);

                        compareWord = compareWord.replace(letter, '');
                    }

                    ctx.fillStyle = '#FFF'
                    ctx.fillText(letter, i + 64, j + 64 + 20)

                }

                // Finally, stroke
                ctx.strokeRect(i, j, 128, 128)
                
            }

        }

        return canvas.toBuffer();

    }

}