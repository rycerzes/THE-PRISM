import type { GuildMember } from "discord.js";

export interface Player {
    member: GuildMember;
    color: number;
}

export class Player {
    constructor(member: GuildMember, color: 'w' | 'b') {
        this.member = member;
        this.color = ['w', 'b'].indexOf(color);
    }
}