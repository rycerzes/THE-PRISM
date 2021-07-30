export const RegEx = {
    mentions: {
        user: /^(?:<@!?)?(\d{17,19})>?$/,
        role: /^(?:<@&)?(\d{17,19})>?$/,
        channel: /^(?:<#)?(\d{17,19})>?$/
    }
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
}