import type { duration } from "#lib/types/util";
import type { ColorResolvable, EmbedField, GuildMember, MessageEmbedOptions } from "discord.js";
import { RegEx } from "#util/constants";

export function xpCalc(i: number): number {
    return Math.floor(5 * Math.pow(135, 2) * ((Math.pow(10, 3) * Math.exp(-Math.pow(10, -3)* i) + i) - Math.pow(10, 3)));
};

export function levelCalc(xp: number): number {
    let level = 0;
    while (xp > xpCalc(level + 1)) {
        level++;
    };
    return level;
};

export function groupDigits(n: number): string {
    let arr = Math.abs(n).toString().split('').reverse();
    for (let i = 3; i < arr.length; i += 4) {
        arr.splice(i, 0, ',');
    }
    n < 0 ? arr.push('-') : {};
    return arr.reverse().join("");
};

export function pad(number: number, digits: number): string {

    if(number < 0) return number.toString();
    let n = number;
    if(n === 0) {
        ++n;
    }
    let count = 0;
    if(n >= 1) ++count;
    while (n/10 >= 1) {
        n /= 10;
        ++count;
    }
    let diff;
    diff = digits - count;
    if (diff < 0 ) return number.toString();
    let numArray = number.toString().split("");
    for (let i = 0; i < diff; i++) {

        numArray.unshift('0');
    }
    return numArray.join('')
};

export function rng(min: number = 0, max: number = 1): number {
    return Math.floor(Math.random() * ((1+max)-min)) + min;
};

export function logsEmbed({ member, description = '', title, fields = [], color }: { 
    member?: GuildMember, 
    description?: string, 
    title: string,
    fields?: EmbedField[],
    color?: ColorResolvable

}): MessageEmbedOptions {
    
    return {
        title: title,
        description: `${member || ''} at <t:${Math.floor(Date.now()/1000)}:T>\n\u200b\n${description}`,
        fields: fields,
        color: color,
        author: {
            icon_url: member?.user.displayAvatarURL(),
            name: member?.user.tag
        },
        timestamp: Date.now()
    };
};

export function durationToMilli(duration: duration): number | null {
    let n = 0;
    n += duration.d * 24*60*60*1000;
    n += duration.h * 60*60*1000;
    n += duration.m * 60*1000;
    return n || null;
};

export function milliToDuration(milli: number): duration {

    let duration = { d: 0, h: 0, m:0 };

    // Ramaining hours
    let rHours = milli % (24*60*60*1000);
    duration.d = Math.floor(milli/(24*60*60*1000));
    // remaining minutes
    let rMin = rHours % (60*60*1000);
    duration.h = Math.floor(rHours/(60*60*1000));
    duration.m = Math.floor(rMin/(60*1000));

    return duration
};

export function durationToString(duration: duration): string {
    return `${duration.d}d, ${duration.h}h, ${duration.m}m`
};

export function milliRelative(milli: number): string {

    let duration: duration = { d: 0, h: 0, m:0, s:0 };

    // Nearest second
    milli = Math.round(milli/1000)*1000

    // Ramaining hours
    let rHours = milli % (24*60*60*1000);
    duration.d = Math.floor(milli/(24*60*60*1000));
    // remaining minutes
    let rMin = rHours % (60*60*1000);
    duration.h = Math.floor(rHours/(60*60*1000));
    // Remaining Seconds
    let rSec = rMin % (60*1000)
    duration.m = Math.floor(rMin/(60*1000))

    duration.s = Math.round(rSec/1000);

    let arr: string[] = [];

    if (duration.d > 0) arr.push(`**${duration.d}** day${duration.d > 1 ? 's' : ''}`);
    if (duration.h > 0) arr.push(`**${duration.h}** hour${duration.h > 1 ? 's' : ''}`);
    if (duration.m > 0) arr.push(`**${duration.m}** minute${duration.m > 1 ? 's' : ''}`);
    if (duration.s > 0) arr.push(`**${duration.s}** second${duration.s > 1 ? 's' : ''}`);

    return arr.join(', ')
};

export function mentionToSnowflake(mention: string): string | undefined {

    const match = mention.match(RegEx.mentions.role);

    return match ? match[1] : undefined
    
}

// //     UCT: function UCT(date = Date.now(), milliseconds = false) {
// //         let arr = []
// //         date = new Date(date)
// //         arr.push(client.functions.pad(date.getUTCHours(), 2));
// //         arr.push(client.functions.pad(date.getUTCMinutes(), 2));
// //         arr.push(client.functions.pad(date.getUTCSeconds(), 2));
// //         if(milliseconds === true) arr.push(client.functions.pad(date.getUTCMilliseconds(), 3))
// //         return arr.join(':')
// //     },

// //     xpCalc: function xpCalc(i) {
// //         return Math.floor(5 * Math.pow(135, 2) * ((Math.pow(10, 3) * Math.exp(-Math.pow(10, -3)* i) + i) - Math.pow(10, 3)))
// //     },

// //     levelCalc: function levelCalc(xp) {
// //         let level = 0;
// //         let n = 0;
// //         for(let i = 1; n <= xp; i++) {
// //             n = client.functions.xpCalc(i); level = i-1;
// //         };
// //         return level;
// //     },

// //     rng: function rng(min = 0, max = 1) {
// //         return Math.floor(Math.random() * ((1+max)-min)) + min
// //     },

// //     toTitleCase: function toTitleCase(str) {

// //         str = str.trim(); let arr = str.split("");
// //         arr[0] = arr[0].toUpperCase();

// //         return arr.join("")
// //     },

// //     resolveHex: function resolveHex(input) {
// //         const Color = require('color');
// //         try {
// //             return Color(input.toLowerCase()).hex()
// //         } catch (e) {
// //             return undefined
// //         }
// //     },
        

    
// //     since: function since(timestamp, max = 6) {

// //         const seconds = Math.round((new Date() - timestamp)/1000);
// //         let msgArray = [];
// //         let count = 0;
        
// //         let interval = Math.floor(seconds / (3600*24*30.4375*12))
// //         if(interval === 1 && count < max) {
// //             msgArray.push(`${interval} year`);
// //             ++count;
// //         } else if (interval > 1 && count < max) {
// //             msgArray.push(`${interval} years`);
// //             ++count;
// //         }

// //         const rMonths = seconds % (3600*24*30.4375*12);
// //         interval = Math.floor(rMonths / (3600*24*30.4375))
// //         if(interval === 1 && count < max) {
// //             msgArray.push(`${interval} month`);
// //             ++count;
// //         } else if (interval > 1 && count < max) {
// //             msgArray.push(`${interval} months`);
// //             ++count;
// //         }

// //         const rDays = seconds % (3600*24*30.4375);
// //         interval = Math.floor(rDays / (3600*24));
// //         if(interval === 1 && count < max) {
// //             msgArray.push(`${interval} day`);
// //             ++count;
// //         } else if (interval > 1 && count < max) {
// //             msgArray.push(`${interval} days`);
// //             ++count;
// //         }

// //         const rHours = seconds % 3600*24;
// //         interval = Math.floor(rHours / 3600);
// //         if(interval === 1 && count < max) {
// //             msgArray.push(`${interval} hour`);
// //             ++count;
// //         } else if (interval > 1 && count < max) {
// //             msgArray.push(`${interval} hours`);
// //             ++count;
// //         }

// //         const rMinutes = seconds % 3600;
// //         interval = Math.floor(rMinutes / 60);
// //         if(interval === 1 && count < max) {
// //             msgArray.push(`${interval} minute`);
// //             ++count;
// //         } else if (interval > 1 && count < max) {
// //             msgArray.push(`${interval} minutes`);
// //             ++count;
// //         }

// //         const rSeconds = seconds % 60
// //         interval = Math.floor(rSeconds);
// //         if(interval === 1 && count < max) {
// //             msgArray.push(`${interval} second`);
// //             ++count;
// //         } else if (interval > 1 && count < max) {
// //             msgArray.push(`${interval} seconds`);
// //             ++count;
// //         }

// //         return msgArray.join(', ')
// //     },
    
// //     compareArray: function compareArray(a, b) {
// //         let valid = true
// //         if(a.length !== b.length) {
// //             valid = false
// //         } else {
// //             for(i = 0; i < a.length; i++) {
// //                 valid = a[i] === b[i] ? valid : false
// //             }
// //         }
// //         return valid;
// //     },)