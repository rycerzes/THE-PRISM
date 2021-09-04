import Canvas from "canvas";
import type { GuildMember, Message } from "discord.js";
import { Board } from "#structures/chess/board";
import { Piece } from "#chess/piece";
import { Player } from "#chess/player";

const { createCanvas, registerFont } = Canvas;

const file_headers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const rank_headers = ['1', '2', '3', '4', '5', '6', '7', '8'];

export interface Game {
    board: Board;
    players: Player[];
    state: {
        turn: number;
        castling: {
            white: {
                kingside: boolean;
                queenside: boolean;
            };
            black: {
                kingside: boolean;
                queenside: boolean;
            }
        };
        passant: number | undefined;
        halfMoves: number;
        fullMoves: number;
    };
    end: number;
}

export class Game {

    constructor(members: GuildMember[], message: Message, fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {

        let split = fen.split(' ');

        this.board = new Board(this, split[0], message);
        this.players = [new Player(members[0], 'w'), new Player(members[1], 'b')]

        this.state = {
            turn: {'w': 0, 'b': 1}[split[1]] ?? 0,
            castling: {
                white: {
                    kingside: split[2].includes('K'),
                    queenside: split[2].includes('Q')
                },
                black: {
                    kingside: split[2].includes('k'),
                    queenside: split[2].includes('q')
                }
            },
            passant: this.algToNumSquare(split[3]),
            halfMoves: Number(split[4]),
            fullMoves: Number(split[5])
        };

            // "end" is the win condition
            // 0 - In progress
            // 1 - White wins
            // 2 - Black wins
            // 3 - Tie

        this.end = 0; 

    };

    get fen(): string {

        // FEN is separated by spaces, and so building the fen as an array and joining it with spaces seems good.
        let fen = [];

        // Using a dictionary for pieces, makes the most sense.
        const pieceTypeDict: { [key: number]: string } = {

            1: 'k',
            2: 'q',
            3: 'b',
            4: 'n',
            5: 'r',
            6: 'p'

        };

        // Initialising variables
        let fenBoard = []; let arr = []; let piece; let spaces = 0;

        // Start at the top rank, increment down by 1 each time.
        for (let rank = 7; rank >= 0; rank--) {
            // Reset variables
            spaces = 0; 
            arr = [];

            // Start at the leftmost file, incremement up from 0 to 7.
            for (let file = 0; file < 8; file++) {

                piece = this.board.squares[file + rank * 8];

                if (piece) {
                    // Push current amount of spaces, if any
                    if (spaces) arr.push(spaces); spaces = 0;
                    // Append the correct notation. Using colorInt (0 or 1) to determine case.
                    arr.push(piece.colorInt ? pieceTypeDict[piece.typeInt] : pieceTypeDict[piece.typeInt].toUpperCase());
                } else {
                    // Increment spaces
                    spaces++;
                };

            };
            if (spaces) arr.push(spaces);
            fenBoard.push(arr.join(''));

        };

        fen.push(fenBoard.join('/')); // Add rank breaks

        fen.push(['w', 'b'][this.state.turn]); // Add turn

        // Not sure if there's a better way of doing this, but here we are...
        let castling = [];
        if (this.state.castling.white.kingside) castling.push('K');
        if (this.state.castling.white.queenside) castling.push('Q');
        if (this.state.castling.black.kingside) castling.push('k');
        if (this.state.castling.black.queenside) castling.push('q');
        fen.push(castling.length > 0 ? castling.join('') : '-');

        // SImple use of premade functions
        fen.push(this.state.passant ? this.numToAlgSquare(this.state.passant) : '-');
        fen.push(this.state.halfMoves); fen.push(this.state.fullMoves);

        return fen.join(' ');

    };

    algToNumSquare(str: string): number | undefined {
        let arr = str.toUpperCase().split("");
        let file = file_headers.indexOf(arr[0]);
        let rank = rank_headers.indexOf(arr[1]);

        if (file !== -1 && rank !== -1) {
            return file + rank * 8;
        } else {
            return undefined
        }
    };

    numToAlgSquare(num: number): string {
        let file = num % 8;
        let rank = Math.floor(num / 8);

        return file_headers[file].toLowerCase() + rank_headers[rank];
    };

    updateCastling(): void {

        // White King
        if (!this.board.squares[4] || this.board.squares[4].id !== 9) {
            this.state.castling.white = { queenside: false, kingside: false }
        }

        // White Queenside
        if (!this.board.squares[0] || this.board.squares[0].id !== 13) {
            this.state.castling.white.queenside = false;
        };

        // White Kingside
        if (!this.board.squares[7] || this.board.squares[7].id !== 13) {
            this.state.castling.white.kingside = false;
        };

        // Black King
        if (!this.board.squares[60] || this.board.squares[60].id !== 17) {
            this.state.castling.black = { queenside: false, kingside: false }
        }

        // Black Queenside
        if (!this.board.squares[56] || this.board.squares[56].id !== 21) {
            this.state.castling.black.queenside = false;
        };

        // Black Kingside
        if (!this.board.squares[63] || this.board.squares[63].id !== 21) {
            this.state.castling.black.kingside = false;
        };

    };

    draw() {

        // Function to draw the current chess board

        registerFont('./src/assets/fonts/bahnschrift-main.ttf', {family: 'impact'});

        const canvas = createCanvas(512, 512) // Create Canvas
        const ctx = canvas.getContext('2d');

            // Creating the Board
            // This should work for any size canvas.
            // Non-square canvas will stretch the board.

        let [x, y] = [0, 0];
        let cell_size = canvas.width/8;

        for (let rank = 0; rank < 8; rank++) { // Loop for each row

            for (let file = 0; file < 8; file++) { // Loop for each cell in row

                    // This determines the colour of the cell (proud I figured this ^^)
                    
                ctx.fillStyle = (rank + file) % 2 ? '#F7F7F7' : '#7E7E7E' // '#7289DA' : '#202225';
                ctx.fillRect(x, y, cell_size, cell_size);

                x += cell_size; // Increment
            };
            y += cell_size; // Increment
            x = 0 // Reset
        };

            // Draw Pieces

        for (let rank = 0; rank < 8; rank++) { // Loop for each row

            for (let file = 0; file < 8; file++) { // Loop for each cell in row

                this.board.squares[rank * 8 + file] ? ctx.drawImage(this.board.squares[rank * 8 + file]!.sprite, file * cell_size, (7 - rank) * cell_size, cell_size, cell_size) : null; // Draw sprite if cell is taken up.

            };
        };

            // Add labels and borders
            // New Canvas...

        const _canvas = createCanvas(9*canvas.width/8, 9*canvas.height/8)
        const _ctx = _canvas.getContext('2d');

        _ctx.strokeStyle = '#202225'; _ctx.lineWidth = canvas.width/100;
        _ctx.strokeRect(canvas.width/16, canvas.height/16, canvas.width, canvas.height);

        _ctx.drawImage(canvas, canvas.width/16, canvas.height/16, canvas.width, canvas.height);

        _ctx.textAlign = 'center';
        _ctx.font = `${canvas.height/18}px "impact"`
        _ctx.fillStyle = '#F7F7F7'

        let str = '';
        for (let yi = 0; yi < 8; yi++) {
            str = file_headers[yi];

            _ctx.strokeText(str, (yi + 1)*canvas.width/8, canvas.height/22);
            _ctx.strokeText(str, (yi + 1)*canvas.width/8, canvas.height + canvas.height/18 + canvas.height/16);
            _ctx.fillText(str, (yi + 1)*canvas.width/8, canvas.height/22);
            _ctx.fillText(str, (yi + 1)*canvas.width/8, canvas.height + canvas.height/18 + canvas.height/16);
        };

        rank_headers.reverse();
        for (let xi = 0; xi < 8; xi++) {
            str = rank_headers[xi];

            _ctx.strokeText(str, canvas.width/32, canvas.height/48 + (xi + 1)*canvas.height/8);
            _ctx.strokeText(str, 3*canvas.width/32 + canvas.width, canvas.height/48 + (xi + 1)*canvas.height/8);
            _ctx.fillText(str, canvas.width/32, canvas.height/48 + (xi + 1)*canvas.height/8);
            _ctx.fillText(str, 3*canvas.width/32 + canvas.width, canvas.height/48 + (xi + 1)*canvas.height/8);
        };
        rank_headers.reverse();

        const __canvas = createCanvas(5*_canvas.width/4, _canvas.height);
        const __ctx = __canvas.getContext('2d');

        __ctx.drawImage(_canvas, _canvas.width/8, 0, _canvas.width, _canvas.height);

        const takens = this.board.takenPieces;

        let spriteSizeW = takens.white.length <= 8 ? __canvas.height/8 : __canvas.height/takens.white.length;
        let spriteSizeB = takens.black.length <= 8 ? __canvas.height/8 : __canvas.height/takens.black.length;

        let yi = 0; let sprite;
        for (let typeInt of takens.white) {
            sprite = new Piece(8, typeInt).sprite;
            __ctx.drawImage(sprite, 15*__canvas.width/16 - spriteSizeW/2, yi, spriteSizeW, spriteSizeW)
            yi += spriteSizeW
        };

        yi = 0;
        for (let typeInt of takens.black) {
            sprite = new Piece(16, typeInt).sprite
            __ctx.drawImage(sprite, __canvas.width/16 - spriteSizeB/2, yi, spriteSizeB, spriteSizeB)
            yi += spriteSizeB
        }

        return __canvas.toBuffer();
    };

};