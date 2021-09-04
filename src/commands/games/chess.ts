import { Command } from "#structures/Command";
import { colors } from "#util/constants";
import type { Args, PieceContext } from '@sapphire/framework'
import type { ColorResolvable, Message, MessageReaction, User } from "discord.js";
import { Game } from "#chess/game";
import type { Piece } from "#chess/piece";

const instructions = `
Here is a quick explaination on how to play. This assumes you already know how to play chess.
If you don't already know, find out [here](https://www.chess.com/learn-how-to-play-chess).

Pieces are moved using algebraic notation.
e.g. \`A1\` or \`C6\`.

When asked to move a piece, type the square of the piece you'd like to move, followed by the squar to move it to.
For example: "E2E4" or "F1G3"
`

export default class extends Command {

    constructor(context: PieceContext) {
        super(context, {
            name: 'chess',
            description: 'Play chess.',
            usage: ['[opponent]', '[opponent] (fen)'],
            preconditions: ['guild'],
        });

        this.module = this.client.modules.get('games')!;

    };

    public async run(message: Message, args: Args): Promise<any> {

        const opp = (await args.pickResult('member')).value;
        const fen = (await args.pickResult('string')).value;

        if (!opp) return this.client.emit('help', message, { command: this });

        // Ask the opponent if they wish to play chess.
        let ask = await message.channel.send({ content: `${opp} you have been challenged to Chess.`, embeds: [{
            title: 'CHESS',
            description: `React with ✅ or ❌ to accept or decline\n\u200b`,
            fields: [
                {
                    name: 'HOW TO PLAY',
                    value: instructions
                }
            ],
            color: await this.client.util.guildColor(message.guild!)
        }]});

        await ask.react('✅'); ask.react('❌'); // Add reactions

        // Await reactions from the opponent to see if they wish to play.
        let res = (await ask.awaitReactions({ filter: async (reaction: MessageReaction, user: User) => {
            return ['✅', '❌'].includes(reaction.emoji.name!) && user.id === opp.id;
        }, max: 1, time: 60000})).first(); // 60s timeout

        if (!res) { // If the opponent doesnt respond.
            ask.delete();
            return message.reply('You opponent never responded.')

        } else if (res.emoji.name === '❌') { // If the opponent declines.
            ask.delete();
            return message.reply('Your opponent declined.')
        };

        // Else, Carry on!

        let game = new Game([message.member!, opp], message, fen ? fen : undefined);

        let response: string; let startSquare: number | undefined; let targetSquare: number | undefined; let validMove: boolean; let piece: Piece | null | undefined;
        let lastMove = ''; let reason = '';

        while (!game.end) {

            validMove = false;

            await message.channel.send({ content: `${game.players[game.state.turn].member} make a move.`, files: [{attachment: game.draw(), name: 'board.png'}], embeds: [{
                title: 'CHESS',
                image: {
                    url: 'attachment://board.png'
                },
                color: ['#FEFEFE', '#000000'][game.state.turn] as ColorResolvable,
                description: `${lastMove}\n\n${game.board.check(game.board.squares, game.state.turn) ? '**CHECK!**' : ''}`,
                footer: {
                    text: `Type 'quit' to save and quit • Halfmoves: ${game.state.halfMoves} | Fullmoves: ${game.state.fullMoves}`
                }
            }]});

            while (!validMove) {

                try {
                    response = (await message.channel.awaitMessages({ filter: m => m.author.id === game.players[game.state.turn].member.id && (/^([a-h][1-8]){2}$/i.test(m.content) || m.content.toLowerCase() === 'quit'), max: 1, time: 120000, errors: ['time']}))!.first()!.content;
                } catch (e) {
                    game.end = 2 - game.state.turn;
                    reason = 'time'
                    break;
                };

                if (response) {

                    if (response.toLowerCase() === 'quit') {
                        return message.channel.send({ embeds: [{
                            title: 'CHESS',
                            color: colors.red,
                            description: `${['◻️', '◼️'][game.state.turn]} •  ${game.players[game.state.turn].member} quit.\n\nYou can continue the game at any time using the FEN below.`,
                            fields: [
                                {name: 'FEN', value: `\`${game.fen}\``}
                            ]
                        }]})
                    }

                    startSquare = game.algToNumSquare(response.slice(0, response.length/2));

                    if (!startSquare) await message.channel.send('There is no piece to be moved.');

                    if (startSquare && game.board.squares[startSquare!]) {

                        if (game.board.squares[startSquare]!.colorInt === game.players[game.state.turn].color) {
                                
                            targetSquare = game.algToNumSquare(response.slice(response.length/2));

                            if (targetSquare && startSquare >= 0 && startSquare < 64 && targetSquare >= 0 && targetSquare < 64) {

                                piece = game.board.squares[startSquare];

                                validMove = await game.board.move(startSquare, targetSquare);
                            };

                            if (targetSquare && piece && validMove) { 

                                game.updateCastling();
                                lastMove = `${['◻️', '◼️'][game.state.turn]} • ${game.players[game.state.turn].member} moved **${piece.type.toUpperCase()}** from **${game.numToAlgSquare(startSquare).toUpperCase()}** to **${game.numToAlgSquare(targetSquare).toUpperCase()}**`

                            } else {
                                await message.channel.send('Illegal move.');
                            };
                        
                        } else {
                            await message.channel.send('This is not your piece.')
                        };
                    
                    } else {
                        await message.channel.send('There is no piece to be moved.')
                    };

                };

            };

            game.state.turn = 1 - game.state.turn;
                        
            // Checkmate
            if (game.board.checkMate(game.state.turn)) {

                game.end = 2 - game.state.turn;
                reason = 'checkmate'

            } else 

            if (game.state.halfMoves >= 50) {
                game.end = 3;
                reason = 'fifty-move rule'
            };

        };

        if (game.end === 3) { // Tie

            return message.channel.send({ files: [{ attachment: game.draw(), name: 'board.png' }], embeds: [{

                title: 'TIE',
                description: reason.toUpperCase(),
                color: colors.amber,
                image: {
                    url: 'attachment://board.png'
                },
                footer: {
                    text: `Halfmoves: ${game.state.halfMoves} | Fullmoves: ${game.state.fullMoves}`
                }

            }]});
        
        } else { // For either win states

            return message.channel.send({ files: [{ attachment: game.draw(), name: 'board.png' }], embeds: [{
                
                title: `${['WHITE', 'BLACK'][game.end - 1]} WINS`,
                description: `\u200b\n${['◻️', '◼️'][game.end - 1]} •${game.players[game.end - 1].member} won by ${reason}`,
                fields: reason === 'time' ? [{
                    name: 'FEN',
                    value: `\`${game.fen}\``,
                    inline: true
                }] : [],
                color: colors.green,
                thumbnail: {
                    url: game.players[game.end - 1].member.user.displayAvatarURL()
                },
                image: {
                    url: 'attachment://board.png'
                },
                footer: {
                    text: `Halfmoves: ${game.state.halfMoves} | Fullmoves: ${game.state.fullMoves}`
                }

            }]});
        };
    };
}