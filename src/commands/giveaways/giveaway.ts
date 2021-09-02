// import type { duration } from "#lib/types/util";
// import { Command } from "#structures/Command";
// import { RegEx } from "#util/constants";
// import type { Args, PieceContext } from "@sapphire/framework";
// import type { Message } from "discord.js";

// export default class extends Command {
//     constructor(context: PieceContext) {
//         super(context, {
//             name: 'giveaway',
//             description: 'Start a giveaway',
//             usage: ['giveaway [item]', 'giveawy [item] (duration)'],
//             aliases: ['give', 'g']
//         });

//         this.module = this.client.modules.get('giveaways')!;
//     };

//     public async run(message: Message, args: Args) {

//         const { duration, rest: prize } = this.parseStr(await args.rest('string').catch(() => ''));

        

//     };

//     private parseStr(str: string): { duration: duration, rest: string } {

//         const reg = RegEx.times

//         // Duration
//         let times = str.match(reg);

//         let duration: duration = { d: 0, h: 0, m: 0 }

//         times?.forEach(t => { // Inputs could be anything from "1d" to "999h" or "25m" etc.

//             let [n, unit]: [number, string] = [ Number(t.match(/\d+/gi)![0]), t.match(/(d|m|h)/gi)![0] ];
//             return Reflect.set(duration, unit, n > 999 ? 999 : n)

//         });

//         // Reason
//         let rest = str.replace(reg, '').trim();

//         return { duration, rest }

//     };
// };