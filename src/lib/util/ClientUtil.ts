import type { Client } from "#lib/Client";
import type { ColorResolvable, Guild, GuildMember, Snowflake, User } from 'discord.js';
import { RegEx } from '#util/constants';
import { levelCalc, xpCalc, groupDigits } from './functions.js'
import { canvasRGBA } from "stackblur-canvas";
import { promises as fsp } from 'fs';

import Canvas from 'canvas';
import Color from 'color';
import type { Member } from "#lib/types/db.js";
const { createCanvas, loadImage, registerFont } = Canvas;

export interface ClientUtil {
    client: Client;
}

// Thanks to Akairo for a lotta inspo here :P

export class ClientUtil {

    constructor(client: Client) {
        /**
         * The Client
         * @type {Client}
         */
        this.client = client;
    };

    /**
     * Resolves a user from string.
     * @param {str} str - String to resolve
     * @param {Map<string, User>} users - Users to search through.
     * @returns {User}
     */
    public resolveUser(str: string, users: Map<Snowflake, User>) {
        return users.get(str as Snowflake) || [...users.values()].find(user => this.checkUser(str, user));
    };

    /**
     * Checks whether a string is referring to a user
     * @param str - string to check
     * @param user - user to check
     * @returns {Boolean}
     */
    public checkUser(str: string, user: User) {

        // Check for user ID
        if (str === user.id) return true;

        // Check for mention
        const match = RegEx.mentions.user.exec(str);
        if (match && match[1] === user.id) return true; 

        const username = user.username.toLowerCase(); const discrim = user.discriminator;

        str = str.toLowerCase();
        // Check for tag
        return username.includes(str) || (username.includes(str.split('#')[0]) && discrim.includes(str.split('#')[1]));
    };

    /**
     * Resolves a member from a string.
     * @param str - string to resolve from.
     * @param members - Map of GuildMembers to resolve from
     * @returns {GuildMember}
     */
    public resolveMember(str: string, members: Map<Snowflake, GuildMember>) {
        return members.get(str as Snowflake) || [...members.values()].find(member => this.checkMember(str, member));
    };

    /**
     * Checks if a string is referring to a member
     * @param str - String to check
     * @param member - GuildMember to check
     * @returns {Boolean}
     */
    public checkMember(str: string, member: GuildMember) {

        // Check for user ID
        if (str === member.id) return true;

        // Check for mention
        const match = RegEx.mentions.user.exec(str);
        if (match && match[1] === member.id) return true;

        const username = member.user.username.toLowerCase(); const discrim = member.user.discriminator; const displayName = member.displayName.toLowerCase();

        // Check for name match
        str = str.toLowerCase();
        return username.includes(str) || displayName.includes(str) || ((username.includes(str.split('#')[0]) || displayName.includes(str.split('#')[0])) && discrim.includes(str.split('#')[1]));

    };

    public async mention(member: Member, guild: Guild): Promise<string> {

        let mention;
        try {

            mention = `<@${(await guild.members.fetch(member.user_id!)).id}>`;

        } catch {

            try{
                mention = (await this.client.users.fetch(member.user_id!)).tag;
            } catch {
                mention = '`Deleted User`';
            };

        };

        return mention
    }

    /**
     * Gets a guilds "main_color".
     * @param guild Guild to get color for.
     * @returns {Promise<ColorResolvable>}
     */
    public async guildColor(guild: Guild): Promise<ColorResolvable> {
        return (await this.client.db.query(`SELECT main_color FROM guilds WHERE guild_id = ${guild.id}`)).rows[0].main_color as ColorResolvable;
    };

    public async getRankCard(member: GuildMember): Promise<Buffer> {

        const members = (await this.client.db.query(`SELECT * FROM members WHERE guild_id = ${member.guild.id}`)).rows
        const memberData = members.find(u => u.user_id === member.id);
        const backgrounds = await this.getBackgrounds();

        //Colours
        const colors = {
            bg: '#141414',
            bga: '' as any,
            highlight: '#ffffff',
            highlightDark: '#ababab',
            border: '#1c1c1c',
            main: memberData.rank_card_color || await this.guildColor(member.guild)
        }

        registerFont('./src/assets/fonts/bahnschrift-main.ttf', {family: 'bahnschrift'})

        const canvas = createCanvas(640, 192)
        const ctx = canvas.getContext('2d')

        let rank = members.sort((a, b) => b.xp - a.xp).findIndex(u => u.user_id === member.id)+1;

        const avatar = await loadImage(member.user.displayAvatarURL({size: 128, format: 'png'}));
        let statusColor;
        switch(member.presence?.status) {
            case 'online':
                statusColor = '#5cb85c'
                break;
            case 'idle':
                statusColor = '#f0ad4e'
                break;
            case 'dnd':
                statusColor = '#d9454f'
                break;
            case 'offline':
            default:
                statusColor = '#545454'
                break;
        }

        ctx.save()
        
        if (backgrounds.has(memberData.rank_card_bg_id)) {

            const bg = backgrounds.get(memberData.rank_card_bg_id);
            let img = await loadImage(`./src/assets/backgrounds/${bg.file}`);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        } else {

            //Fill BG
            ctx.fillStyle = colors.bg
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.drawImage(avatar, 180, -128, 512, 512)
            //Transparent bg colour
            colors.bga = Color(colors.bg).fade(1);
            let grd = ctx.createLinearGradient(180, 0, canvas.width+500, 0); grd.addColorStop(0, colors.bg); grd.addColorStop(1, colors.bga.rgb().string());

            ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height);

            canvasRGBA(canvas as unknown as HTMLCanvasElement, 0, 0, canvas.width, canvas.height, 15)

        }
        
        //Outline
        ctx.lineWidth = 10
        ctx.strokeStyle = colors.border
        ctx.strokeRect(0, 0, canvas.width, canvas.height)

        //Draw Avatar
        ctx.beginPath();
        ctx.arc(96, 96, 64, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 32, 32, 128, 128)

        ctx.restore()

        //Outline Avatar
        ctx.beginPath();
        ctx.arc(96, 96, 70, 0, Math.PI * 2, true);
        ctx.strokeStyle = colors.bg
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.strokeStyle = colors.highlight
        ctx.lineWidth = 2;
        ctx.stroke();

        //Status
        ctx.beginPath();
        ctx.arc(144, 144, 18, 0, Math.PI * 2, true);
        ctx.fillStyle = statusColor;
        ctx.fill();
        ctx.strokeStyle = colors.bg
        ctx.lineWidth = 4;
        ctx.stroke();

        //Calc Level
        const level = levelCalc(memberData.xp)
        
        //Bar constants
        const [barX, barY, barRad, barLen] = [192, 128, 16, 400]
        const minXP = xpCalc(level);
        const maxXP = xpCalc(level+1);
        const currentXP = memberData.xp-minXP;
        const progress = (memberData.xp - minXP)/(maxXP - minXP)

        //Outline Bar
        ctx.beginPath();
        ctx.arc(barX, barY, (barRad+2), -Math.PI/2, Math.PI/2, true);
        ctx.lineTo(barX+barLen, barY+(barRad+2));
        ctx.arc(barX+barLen, barY, (barRad+2), Math.PI/2, -Math.PI/2, true);
        ctx.lineTo(barX, barY-(barRad+2));
        ctx.strokeStyle = colors.bg
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.strokeStyle = colors.highlight;
        ctx.lineWidth = 2;
        ctx.stroke();

        //Fill Bar
        let newBarLen = barLen * progress
        ctx.beginPath();
        ctx.arc(barX, barY, (barRad-2), -Math.PI/2, Math.PI/2, true);
        ctx.lineTo(barX+newBarLen, barY+(barRad-2));
        ctx.arc(barX+newBarLen, barY, (barRad-2), Math.PI/2, -Math.PI/2, true);
        ctx.lineTo(barX, barY-(barRad-2));

        ctx.strokeStyle = colors.bg
        ctx.lineWidth = 5
        ctx.stroke();
        ctx.fillStyle = colors.main;
        ctx.fill();

        //Text
        const applyText = (canvas: any, text: string, size: number) => {
            const ctx = canvas.getContext('2d');
            let fontSize = size;
            do {
                ctx.font = `${fontSize -= 5}px "bahnschrift"`;
            } while (ctx.measureText(text).width > barLen);
            return ctx.font;
        };

        //Name
        ctx.strokeStyle = colors.bg
        ctx.lineWidth = 5

        ctx.font = applyText(canvas, member.user.tag, 32);
        ctx.fillStyle = colors.highlight;
        ctx.strokeText(member.user.tag, barX, barY-barRad-10)
        ctx.fillText(member.user.tag, barX, barY-barRad-10)

        //Progress
        const progStr = `${groupDigits(currentXP)} / ${groupDigits(maxXP - minXP)} xp`
        ctx.font = applyText(canvas, progStr, 26);
        ctx.strokeText(progStr, barX, barY+barRad+28)
        ctx.fillStyle = colors.highlightDark;
        ctx.fillText(progStr, barX, barY+barRad+28)
        
        //Level
        ctx.fillStyle = colors.main
        ctx.font = '48px "bahnschrift"';
        let numWidth = ctx.measureText(`${level}`).width;
        ctx.strokeText(`${level}`, 608-numWidth, 52)
        ctx.fillText(`${level}`, 608-numWidth, 52)
        ctx.font = '32px "bahnschrift"';
        let textWidth = ctx.measureText(`Level `).width;
        ctx.strokeText(`Level `, 608-textWidth-numWidth, 52)
        ctx.fillText(`Level `, 608-textWidth-numWidth, 52)

        const levelWidth = numWidth+textWidth;

        //Rank
        ctx.fillStyle = colors.highlightDark
        ctx.font = '48px "bahnschrift"';
        numWidth = ctx.measureText(`#${rank}`).width;
        ctx.strokeText(`#${rank}`, 592-numWidth-levelWidth, 52)
        ctx.fillText(`#${rank}`, 592-numWidth-levelWidth, 52)
        ctx.font = '32px "bahnschrift"';
        textWidth = ctx.measureText(`Rank `).width;
        ctx.strokeText(`Rank `, 592-textWidth-numWidth-levelWidth, 52)
        ctx.fillText(`Rank `, 592-textWidth-numWidth-levelWidth, 52)

        return canvas.toBuffer()

    };

    private async getBackgrounds() {

        const dir = await fsp.opendir('./src/assets/backgrounds');

        let BGs: Map<number, any> = new Map();

        for await (const { name: f } of dir) {
            BGs.set(Number(f.split('_')[0]), {
                name: f.split('_')[1].split('.')[0],
                file: f
            });
        };

        return BGs;

    };

};