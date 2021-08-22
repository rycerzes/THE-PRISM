export const RegEx = {
    mentions: {
        user: /^(?:<@!?)?(\d{17,19})>?$/,
        role: /^(?:<@&)?(\d{17,19})>?$/,
        channel: /^(?:<#)?(\d{17,19})>?$/
    },

    emoji: /<?(a)?:?(\w{2,32}):(\d{17,19})>?/i,

    times: /([1-9][0-9]*(d|h|m))\s*/gi,
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