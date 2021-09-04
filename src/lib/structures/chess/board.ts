import type { Message } from "discord.js";
import type { Game } from "#chess/game";
import { Piece } from "#chess/piece";

export interface Board {
    game: Game;
    squares: (Piece | undefined | null)[];
    message: Message
}

export class Board {

    constructor(game: Game, fenBoard: string, message: Message) {
        this.game = game
        this.squares = new Array(64);
        this.loadFen(fenBoard);
        this.message = message;
    }

    get takenPieces() {

        // THe pieces that each player will start with.
        const startingPieces = [

            1, 2,
            3, 3,
            4, 4,
            5, 5,

            6, 6,
            6, 6,
            6, 6,
            6, 6,
        ];

        let white = [...startingPieces]; let black = [...startingPieces]; // Copy array

        this.squares.forEach(p => { // Loop over all squares

            if (!p) return;

            if (p.colorInt) { // Black

                // If there is a piece on the baord, remove that piece from the taken pieces array
                let i = black.indexOf(p.typeInt); 
                black.splice(i, 1);


            } else { // White

                // Same as before
                let i = white.indexOf(p.typeInt);
                white.splice(i, 1);

            };

        });

        // This method assumes that the game is setup properly,
        // but if people mess around and load improper FEN then that's their problem.

        return { white, black };
    };

    loadFen(fenBoard: string) {

        const pieceTypeDict: { [key: string]: number } = {

            'k': 1,
            'q': 2,
            'b': 3,
            'n': 4,
            'r': 5,
            'p': 6

        };

        let file = 0; let rank = 7;
        let color; let type;

        for (let i = 0; i < fenBoard.length; i++) {

            const symbol = fenBoard.charAt(i);

            if (symbol === '/') {
                file = 0;
                rank--;
            } else {
                if (/^\d+$/.test(symbol)) {
                    file += Number(symbol);
                } else {
                    color = symbol === symbol.toUpperCase() ? 8 : 16;
                    type = pieceTypeDict[symbol.toLowerCase()];

                    this.squares[rank * 8 + file] = new Piece(color, type)
                    file++;
                }
            }

        }

    };

    getFileRank(square: number): { file: number, rank: number } {
        let file = square % 8;
        let rank = Math.floor(square / 8);

        return {file, rank};
    };

    check(squares: (Piece | undefined | null)[], colorInt: number) {

        let check = false;
        
        // Find king
        let kingSquare = squares.findIndex(p => p && p.typeInt === 1 && p.colorInt === colorInt);
        let kingFileRank = this.getFileRank(kingSquare);
        
        // Check for knights
        
        let movesL = [-17, -10, 6, 15];
        let movesR = [-15, -6, 10, 17];

        let current = this.getFileRank(kingSquare);

        let target;

        // For all the moves that go left
        // check it doesnt loop around the left of the board.

        movesL.forEach(m => {
            target = this.getFileRank(kingSquare + m);

            if (target.file < current.file && target.rank < 8 && target.rank >= 0) { // Check no loop & rank is within boundries.
                let targetPiece = squares[kingSquare + m]
                if (targetPiece && targetPiece.typeInt === 4 && targetPiece.colorInt !== colorInt) { // Check for knight of opposite color
                    return check = true;
                };
            };

            return;
        });

        if (check) return check; // REturn to avoid checking anymore.

        // For all the moves that go right
        // check it doesn't loop around the right of the board.

        movesR.forEach(m => {
            target = this.getFileRank(kingSquare + m);

            if (target.file > current.file && target.rank < 8 && target.rank >= 0) { // Check no loop & rank is within boundries.
                let targetPiece = squares[kingSquare + m]
                if (targetPiece && targetPiece.typeInt === 4 && targetPiece.colorInt !== colorInt) { // Check for knight of opposite color
                    return check = true;
                };
            };

            return;
        });

        if (check) return check; // Return to avoid checking anymore

        // Check for pawns
        if (colorInt === 0) {
            if (squares[kingSquare + 7] && squares[kingSquare + 7]?.id === 22) return check = true;
            if (squares[kingSquare + 9] && squares[kingSquare + 9]?.id === 22) return check = true;
        } else if (colorInt === 1) {
            if (squares[kingSquare - 7] && squares[kingSquare - 7]?.id === 14) return check = true;
            if (squares[kingSquare - 9] && squares[kingSquare - 9]?.id === 14) return check = true;
        };

        // Check for other pieces

        // N
        for (let i = kingSquare + 8; this.getFileRank(i).rank < 8; i += 8) {

            if (!squares[i]) continue; // Empty, next square
            
            if (squares[i]?.colorInt === colorInt) {

                break; // Own piece blocking
            
            } else if (squares[i]?.typeInt === 6 && squares[i]?.colorInt !== colorInt) {

                break; // Pawn blocking (If the pawn is putting the king in check it would have already been found earlier and returned)

            } else if (squares[i]?.colorInt !== colorInt) {
                // If different color AND
                // Either rook/queen OR king 1 space above
                check = [2, 5].includes(squares[i]!.typeInt) || (squares[i]?.typeInt === 1 && i === kingSquare + 8);
                break;
            };
        };

        if (check) return check;

        // S
        for (let i = kingSquare - 8; this.getFileRank(i).rank >= 0; i -= 8) {

            if (!squares[i]) continue; // Empty, next square

            if (squares[i]?.colorInt === colorInt) {

                break; // Own piece blocking

            } else if (squares[i]?.typeInt === 6 && squares[i]?.colorInt !== colorInt) {

                break; // Pawn blocking (If the pawn is putting the king in check it would have already been found earlier and returned)

            } else if (squares[i]?.colorInt !== colorInt) {
                // If different color AND
                // Either rook/queen OR king 1 space below
                check = [2, 5].includes(squares[i]!.typeInt) || (squares[i]?.typeInt === 1 && i === kingSquare + 8);
                break;
            };
        };

        if (check) return check;

        // E
        for (let i = kingSquare + 1; this.getFileRank(i).file > kingFileRank.file && this.getFileRank(i).rank < 8; i++) {

            if (!squares[i]) continue; // Empty, next square.

            if (squares[i]!.colorInt === colorInt) {
                break; // Own piece blocking
            } else if (squares[i]!.typeInt === 6 && squares[i]!.colorInt !== colorInt) {

                break; // Pawn blocking (If the pawn is putting the king in check it would have already been found earlier and returned)

            } else if (squares[i]!.colorInt !== colorInt) {
                // If different color AND
                // Either rook/queen OR king 1 space below
                check = [2, 5].includes(squares[i]!.typeInt) || (squares[i]!.typeInt === 1 && i === kingSquare + 8);
                break;
            };
        };

        if (check) return check;

        // W
        for (let i = kingSquare - 1; this.getFileRank(i).file < kingFileRank.file && this.getFileRank(i).rank >= 0; i--) {

            if (!squares[i]) continue; // Empty, next square.

            if (squares[i]!.colorInt === colorInt) {
                break; // Own piece blocking
            } else if (squares[i]!.typeInt === 6 && squares[i]!.colorInt !== colorInt) {

                break; // Pawn blocking (If the pawn is putting the king in check it would have already been found earlier and returned)

            } else if (squares[i]!.colorInt !== colorInt) {
                // If different color AND
                // Either rook/queen OR king 1 space below
                check = [2, 5].includes(squares[i]!.typeInt) || (squares[i]!.typeInt === 1 && i === kingSquare + 8);
                break;
            };
        };
        if (check) return check;

        // NW
        for (let i = kingSquare + 9; this.getFileRank(i).rank < 8 && this.getFileRank(i).file > kingFileRank.file; i += 9) {

            if (!squares[i]) continue; // Empty, next square.

            if (squares[i]!.colorInt === colorInt) {
                break; // Own piece blocking
            } else if (squares[i]!.typeInt === 6 && squares[i]!.colorInt !== colorInt) {

                break; // Pawn blocking (If the pawn is putting the king in check it would have already been found earlier and returned)

            } else if (squares[i]!.colorInt !== colorInt) {
                // If different color AND
                // Either rook/queen OR king 1 space below
                check = [2, 3].includes(squares[i]!.typeInt) || (squares[i]!.typeInt === 1 && i === kingSquare + 9);
                break;
            };
        }

        if (check) return check;

        // SW
        for (let i = kingSquare - 7; this.getFileRank(i).rank >= 0 && this.getFileRank(i).file > kingFileRank.file; i -= 7) {

            if (!squares[i]) continue; // Empty, next square.

            if (squares[i]!.colorInt === colorInt) {
                break; // Own piece blocking
            } else if (squares[i]!.typeInt === 6 && squares[i]!.colorInt !== colorInt) {

                break; // Pawn blocking (If the pawn is putting the king in check it would have already been found earlier and returned)

            } else if (squares[i]!.colorInt !== colorInt) {
                // If different color AND
                // Either rook/queen OR king 1 space below
                check = [2, 3].includes(squares[i]!.typeInt) || (squares[i]!.typeInt === 1 && i === kingSquare + 9);
                break;
            };
        }

        if (check) return check;

        // SE
        for (let i = kingSquare - 9; this.getFileRank(i).rank >= 0 && this.getFileRank(i).file < kingFileRank.file; i -= 9) {

            if (!squares[i]) continue; // Empty, next square.

            if (squares[i]!.colorInt === colorInt) {
                break; // Own piece blocking
            } else if (squares[i]!.typeInt === 6 && squares[i]!.colorInt !== colorInt) {

                break; // Pawn blocking (If the pawn is putting the king in check it would have already been found earlier and returned)

            } else if (squares[i]!.colorInt !== colorInt) {
                // If different color AND
                // Either rook/queen OR king 1 space below
                check = [2, 3].includes(squares[i]!.typeInt) || (squares[i]!.typeInt === 1 && i === kingSquare + 9);
                break;
            };
        }

        if (check) return check;

        // NE
        for (let i = kingSquare + 7; this.getFileRank(i).rank < 8 && this.getFileRank(i).file < kingFileRank.file; i += 7) {

            if (!squares[i]) continue; // Empty, next square.

            if (squares[i]!.colorInt === colorInt) {
                break; // Own piece blocking
            } else if (squares[i]!.typeInt === 6 && squares[i]!.colorInt !== colorInt) {

                break; // Pawn blocking (If the pawn is putting the king in check it would have already been found earlier and returned)

            } else if (squares[i]!.colorInt !== colorInt) {
                // If different color AND
                // Either rook/queen OR king 1 space below
                check = [2, 3].includes(squares[i]!.typeInt) || (squares[i]!.typeInt === 1 && i === kingSquare + 9);
                break;
            };
        }

        if (check) return check;

        return check;

    };

    checkMate(colorInt: number): boolean {
        
        let check = true; // Assume check is true initially
        let newSquares: (Piece | undefined | null)[];
        // Loop over every piece
        for (let i = 0; i < this.squares.length; i++) {
            if (this.squares[i]?.colorInt !== colorInt) continue; // Avoid checking empty/opponent squares

            // Loop over each pieces
            for (const targetSquare of this.legalSquares(i)) {

                newSquares = [...this.squares];
                newSquares[targetSquare] = newSquares[i];
                newSquares[i] = null;
                check = this.check(newSquares, colorInt);

                if (!check) return check;
            };
        };

        return check;

    }

    async move(startSquare: number, targetSquare: number, move = true): Promise<boolean> {

        const oldSquares = [...this.squares];
        const piece: Piece = this.squares[startSquare]!;

        let legalMoves = this.legalSquares(startSquare); let legal = false;

        // If target square is legal
        if (legalMoves.includes(targetSquare)) {

            // Take En Passant
            if (targetSquare === this.game.state.passant) {

                let rank = Math.floor(targetSquare / 8);

                if (rank === 2) { // Black takes White
                    this.squares[targetSquare + 8] = null
                } else if (rank === 5) { // White takes Black
                    this.squares[targetSquare - 8] = null
                };
            };
            
            // Reset En Passant squares
            this.game.state.passant = undefined;

            // Check if en passant is possible
            if (this.squares[startSquare]!.id % 8 === 6 && Math.abs(targetSquare - startSquare) === 16) {
                
                this.game.state.passant = this.squares[startSquare]!.colorInt ? startSquare - 8 : startSquare + 8;

            };

            // Halfmove Counter
            if (this.squares[targetSquare] || this.squares[startSquare]!.typeInt === 6) {
                this.game.state.halfMoves = 0;
            } else {
                this.game.state.halfMoves ++;
            };

            // Fullmove Counter
            if (this.squares[startSquare]!.colorInt === 1) {
                this.game.state.fullMoves ++;
            };

            // Check for Check
            let newSquares = [...this.squares];
            newSquares[targetSquare] = newSquares[startSquare];
            newSquares[startSquare] = null;
            let check = this.check(newSquares, this.squares[startSquare]!.colorInt);

            if (check) return legal = false; // Stop here if check

            // Move piece
            if (move) {
                this.squares[targetSquare] = this.squares[startSquare];
                this.squares[startSquare] = null;
                legal = true;
            }

            if (!legal) return legal; // Stop here if illegal

            // Promotion
            if (piece.id === 22 && this.getFileRank(targetSquare).rank === 0) {

                // Check if there are any taken pieces that can be swapped
                let swappable = [...new Set(this.takenPieces.black.filter(p => p !== 6))]; // This removes duplicates and filters out pawns
                
                if (swappable.length > 0) {
                    
                    let names = ['queen', 'bishop', 'knight', 'rook']
                    
                    // Neat trick to map current swappables by the name :D
                    await this.message.channel.send(`What would you like to promote to:\n**${swappable.map(p => names[p - 2].toUpperCase()).join(', ')}**`);

                    let promotionChoice;
                    
                    try {
                        
                        let filter = (m: Message) => {
                            return m.author.id === this.game.players[this.game.state.turn].member.id && swappable.map(p => names[p - 2]).includes(m.content.toLowerCase())
                        };

                        promotionChoice = names.indexOf((await this.message.channel.awaitMessages({filter, max: 1, time: 15000, errors: ['time'] }))!.first()!.content.toLowerCase()) + 2

                    } catch { // It will catch if time runs out, defaulting to the "most powerful" piece.
                        promotionChoice = swappable[0];
                    };

                    this.squares[targetSquare] = new Piece(16, promotionChoice)
                };

            } else

            if (piece.id === 14 && this.getFileRank(targetSquare).rank === 7) {
                
                // Check if there are any taken pieces that can be swapped
                let swappable = [...new Set(this.takenPieces.white.filter(p => p !== 6))]; // This removes duplicates and filters out pawns
                
                if (swappable.length > 0) {
                    
                    // Same as above, just for white
                    let names = ['queen', 'bishop', 'knight', 'rook']
                    await this.message.channel.send(`What would you like to promote to:\n**${swappable.map(p => names[p - 2].toUpperCase()).join(', ')}**`);

                    let promotionChoice;
                    
                    try {
                        let filter = (m: Message) => {
                            return m.author.id === this.game.players[this.game.state.turn].member.id && swappable.map(p => names[p - 2]).includes(m.content.toLowerCase())
                        };

                        promotionChoice = names.indexOf((await this.message.channel.awaitMessages({filter, max: 1, time: 15000, errors: ['time'] }))!.first()!.content.toLowerCase()) + 2

                    } catch {
                        promotionChoice = swappable[0];
                    };

                    this.squares[targetSquare] = new Piece(8, promotionChoice);
                };
            }

            // If move was castle, move rook
            if (move && oldSquares[startSquare]!.typeInt === 1 && Math.abs(targetSquare - startSquare) === 2) {

                let side = (targetSquare - startSquare)/Math.abs(targetSquare - startSquare);

                if (side === 1) {
                    this.squares[startSquare + 1] = this.squares[startSquare + 3];
                    this.squares[startSquare + 3] = null;
                } else if (side === -1) {
                    this.squares[startSquare - 1] = this.squares[startSquare - 4];
                    this.squares[startSquare - 4] = null;
                }

            }

        } else {
            legal = false;
        };

        return legal;
    };

    genericSlidingLegalSquares(square: number, piece: Piece, directions: ('N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW')[], king = false) {

        // Directions can be anything from
        // []
        // to
        // ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

        let legalSquares = [];

        // North
        if (directions.includes('N')) {
            for (let i = square + 8; i < this.squares.length; i += 8) {
                if (!this.squares[i]) {
                    legalSquares.push(i)
                } else {
                    if (this.squares[i]!.color !== piece.color) legalSquares.push(i);
                    break;
                };
                if (king) break;
            };
        };

        // North East
        if (directions.includes('NE')) {
            for (let i = square + 9; i % 8 !== 0 && i < 64; i += 9) {
                if (!this.squares[i]) {
                    legalSquares.push(i)
                } else {
                    if (this.squares[i]!.color !== piece.color) legalSquares.push(i);
                    break;
                };
                if (king) break;
            };
        };

        // East
        if (directions.includes('E')) {
            for (let i = square + 1; i < Math.ceil((square + 1)/8) * 8; i++) {
                if (!this.squares[i]) {
                    legalSquares.push(i);
                } else {
                    if (this.squares[i]!.color !== piece.color) legalSquares.push(i);
                    break;
                };
                if (king) break;
            };
        };

        // South East
        if (directions.includes('SE')) {
            for (let i = square - 7; i % 8 !== 0 && i >= 0; i -= 7) {
                if (!this.squares[i]) {
                    legalSquares.push(i)
                } else {
                    if (this.squares[i]!.color !== piece.color) legalSquares.push(i);
                    break;
                };
                if (king) break;
            };
        };

        // South
        if (directions.includes('S')) {
            for (let i = square - 8; i >= 0; i -= 8) {
                if (!this.squares[i]) {
                    legalSquares.push(i)
                } else {
                    if (this.squares[i]!.color !== piece.color) legalSquares.push(i);
                    break;
                };
                if (king) break;
            };
        };

        // South west
        if (directions.includes('SW')) {
            for (let i = square - 9; i % 8 !== 8 && i >= 0; i -= 9) {
                if (!this.squares[i]) {
                    legalSquares.push(i)
                } else {
                    if (this.squares[i]!.color !== piece.color) legalSquares.push(i);
                    break;
                };
                if (king) break;
            };
        };

        // West
        if (directions.includes('W')) {
            for (let i = square - 1; i >= Math.floor(square/8) * 8; i--) {
                if (!this.squares[i]) {
                    legalSquares.push(i);
                } else {
                    if (this.squares[i]!.color !== piece.color) legalSquares.push(i);
                    break;
                };
                if (king) break;
            };
        };

        // North west
        if (directions.includes('NW')) {
            for (let i = square + 7; i % 8 !== 8 && i < 64; i += 7) {
                if (!this.squares[i]) {
                    legalSquares.push(i)
                } else {
                    if (this.squares[i]!.color !== piece.color) legalSquares.push(i);
                    break;
                };
                if (king) break;
            };
        };

        return legalSquares;

    };

    legalSquares(square: number): number[] {

            // This method checks a given square,
            // And returns an array of all the squares
            // the piece in that square could move to.

        let piece = this.squares[square]!;
        if (!piece) return [];

        let legalSquares: number[] = [];
        
            // Different pieces have different moves, so using a switch statement to handle this.
            // Probably a better way but im noob

        switch (piece.id % 8) {

            case 1: // King
                legalSquares = this.genericSlidingLegalSquares(square, piece, ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'], true);

                // Castling
                let castling = this.game.state.castling
                if (piece.colorInt === 1) {

                    // Queenside
                    if (castling.black.queenside && !this.squares[square - 3] && !this.squares[square - 2] && !this.squares[square - 1]) {
                        
                        let newSquares = [...this.squares];
                        newSquares[square - 1] = newSquares[square];
                        newSquares[square] = null;

                        // Ensure the king does not pass through check, repeat for all.
                        if (!this.check(newSquares, piece.colorInt)) legalSquares.push(square - 2);
                    };

                    // Kingside
                    if (castling.black.kingside && !this.squares[square + 1] && !this.squares[square + 2]) {
                        
                        let newSquares = [...this.squares];
                        newSquares[square + 1] = newSquares[square];
                        newSquares[square] = null;

                        if (!this.check(newSquares, piece.colorInt)) legalSquares.push(square + 2);
                    };

                    
                } else if (piece.colorInt === 0 && this.game.state.castling.white) {

                    // Queenside
                    if (castling.white.queenside && !this.squares[square - 3] && !this.squares[square - 2] && !this.squares[square - 1]) {
                        
                        let newSquares = [...this.squares];
                        newSquares[square - 1] = newSquares[square];
                        newSquares[square] = null;

                        if (!this.check(newSquares, piece.colorInt)) legalSquares.push(square - 2);
                    }

                    // Kingside
                    if (castling.white.kingside && !this.squares[square + 1] && !this.squares[square + 2]) {
                        
                        let newSquares = [...this.squares];
                        newSquares[square + 1] = newSquares[square];
                        newSquares[square] = null;

                        if (!this.check(newSquares, piece.colorInt)) legalSquares.push(square + 2);
                    };

                };
                break;

            case 2: // Queen
                legalSquares = this.genericSlidingLegalSquares(square, piece, ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'])
                break;

            case 3: // Bishop
                legalSquares = this.genericSlidingLegalSquares(square, piece, ['NE', 'SE', 'SW', 'NW']);
                break;

            case 4: // Knight

                // N 23, 25
                // E 10, -6
                // S -23, -25
                // W -10, 6

                    // Split moves into left and right.

                let movesL = [-17, -10, 6, 15];
                let movesR = [-15, -6, 10, 17];

                let current = this.getFileRank(square);

                let target;

                // For all the moves that go left
                // check it doesnt loop around the left of the board.

                movesL.forEach(m => {
                    target = this.getFileRank(square + m);

                    if (target.file < current.file && target.rank < 8 && target.rank >= 0) { // Check no loop & rank is within boundries.
                        if (!this.squares[square + m] || this.squares[square + m]!.colorInt !== piece.colorInt) { // Check its empty or different colour.
                            legalSquares.push(square + m);
                        };
                    };
                });
                
                // For all the moves that go right
                // check it doesn't loop around the right of the board.

                movesR.forEach(m => {
                    target = this.getFileRank(square + m);

                    if (target.file > current.file && target.rank < 8 && target.rank >= 0) { // Check no loop & rank is within boundries.
                        if (!this.squares[square + m] || this.squares[square + m]!.colorInt !== piece.colorInt) { // Check its empty or different colour.
                            legalSquares.push(square + m);
                        };
                    };
                });

                break;

            case 5: // Rook
                legalSquares = (this.genericSlidingLegalSquares(square, piece, ['N', 'E', 'S', 'W']));
                break;
        
            case 6: // Pawn

                if (piece.id > 16) { // If black, move down.

                    if (square < 8) return [];

                    if (!this.squares[square - 8]) {
                        legalSquares.push(square - 8);
                        if (square/8 >= 6 && square/8 < 7 && !this.squares[square - 16]) legalSquares.push(square - 16);
                    };
                    
                    if (this.squares[square - 7]) {
                        if (this.squares[square - 7]!.color === 'white') legalSquares.push(square - 7)
                    } else {
                        if (this.game.state.passant === square - 7) legalSquares.push(square - 7);
                    };
                    if (this.squares[square - 9]) {
                        if (this.squares[square - 9]!.color === 'white') legalSquares.push(square - 9);
                    } else {
                        if (this.game.state.passant === square - 9) legalSquares.push(square - 9);
                    };                         

                } else { // Else move up

                    if (square >= 56) return [];

                    if (!this.squares[square + 8]) {
                        legalSquares.push(square + 8);
                        if (square/8 >= 1 && square/8 < 2 && !this.squares[square + 16]) legalSquares.push(square + 16);
                    };

                    if (this.squares[square + 7]) {
                        if (this.squares[square + 7]!.color === 'black') legalSquares.push(square + 7)
                    } else {
                        if (this.game.state.passant === square + 7) legalSquares.push(square + 7);
                    };
                    if (this.squares[square + 9]) {
                        if (this.squares[square + 9]!.color === 'black') legalSquares.push(square + 9);
                    } else {
                        if (this.game.state.passant === square + 9) legalSquares.push(square + 9);
                    };

                }

                break;
                
        };

        return legalSquares;

    }
};