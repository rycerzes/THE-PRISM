import Canvas from "canvas";
const { createCanvas, loadImage } = Canvas;

const sprite_sheet = await loadImage('./src/assets/chess_pieces.png');

export interface Piece {
    id: number;
    sprite: Canvas.Canvas;
}

export class Piece {

    constructor(color: number, type: number) {

        this.id = color + type;
        this.sprite = this._sprite();

    };

    get color(): string {
        return this.id > 16 ? 'black' : 'white';
    };

    get colorInt(): number {
        return this.id > 16 ? 1 : 0;
    }

    get type(): string {
        return ['king', 'queen', 'bishop', 'knight', 'rook', 'pawn'][this.id % 8 - 1]
    }

    get typeInt(): number {
        return this.id % 8;
    }

    get name(): string {
        return this.color + ' ' + this.type
    }

    _sprite(): Canvas.Canvas {

        let [x, y] = [this.id % 8 - 1, Math.floor(this.id/16)]

            // Returns a canvas of the sprite for a piece
            // x and y are the positions on the sprite sheet

        const canvas = createCanvas(128, 128);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(sprite_sheet, x*170, y*170, 170, 170, 0, 0, canvas.width, canvas.height);

        return canvas;
    };

};