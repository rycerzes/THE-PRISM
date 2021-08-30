import type { ColorResolvable } from "discord.js";

export const colors = {
    red: '#D9454F' as ColorResolvable,
    green: '#5CB85C' as ColorResolvable,
    amber: '#F0AD4E' as ColorResolvable,
    default: '#5865F2' as ColorResolvable
};

export const defaults = {
    prefix: '-'
}

export const RegEx = {
    mentions: {
        user: /^(?:<@!?)?(\d{17,19})>?$/,
        role: /^(?:<@&)?(\d{17,19})>?$/,
        channel: /^(?:<#)?(\d{17,19})>?$/,
        emoji: /<?(a)?:?(\w{2,32}):(\d{17,19})>?/gmi,
    },

    messageURL: /https:\/\/discord.com\/channels(\/\d{17,19}){3}/gmi,
    times: /([1-9][0-9]*(d|h|m))\s*/gi,
    snowflake: /^\d{17,19}$/,
    int: /^\d+$/gmi
};

export const blankField = {
    name: '\u200b',
    value: '\u200b'
};

export const blankFieldInline = {
    name: '\u200b',
    value: '\u200b',
    inline: true
};

export const messages = {
    levelup: `{member} advanced to level {level}!`
};

export const emoji: {
    [key: string]: string
} = {
    a: '🇦', b: '🇧', c: '🇨', d: '🇩',
    e: '🇪', f: '🇫', g: '🇬', h: '🇭',
    i: '🇮', j: '🇯', k: '🇰', l: '🇱',
    m: '🇲', n: '🇳', o: '🇴', p: '🇵',
    q: '🇶', r: '🇷', s: '🇸', t: '🇹',
    u: '🇺', v: '🇻', w: '🇼', x: '🇽',
    y: '🇾', z: '🇿', 0: '0⃣', 1: '1⃣',
    2: '2⃣', 3: '3⃣', 4: '4⃣', 5: '5⃣',
    6: '6⃣', 7: '7⃣', 8: '8⃣', 9: '9⃣',
    10: '🔟', '#': '#⃣', '*': '*️⃣',
    '!': '❗', '?': '❓', '+': '➕',
    '-': '➖', '$': '💲', '>': '▶️',
    '<': '◀️', ' ': ' '
};