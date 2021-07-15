import type { Guild } from "discord.js";
import type { Client } from '#lib/Client'
import type { BaseModule } from "#structures/BaseModule";

export interface GuildModuleManager {
    guild: Guild;
    client: Client;
    enabled: Map<string, BaseModule>;
}

export class GuildModuleManager {

    constructor(guild: Guild, client: Client) {

        this.guild = guild;
        this.client = client;

        this.enabled = new Map().set(this.guild.id, this.client.modules.get('base'));

    };

    public get bitfield(): number {
        let arr = new Array(this.client.modules.size).fill(0);
        this.enabled.forEach(m => {
            arr[m.id - 1] = 1;
        });
        arr.reverse();
        return parseInt(arr.join(''), 2);
    };

    /**
     * Resolves a map of modules from bitfield integer.
     * @param bitfield 
     * @returns Map
     */
    private resolveModules(bitfield: number) {
        let bin = bitfield.toString(2);
        let arr = bin.split("").reverse();
        return new Map([...this.client.modules.entries()].filter(m => arr[m[1].id - 1] === '1'));
    };

    /**
     * Resolves string or number into an existing module's name.
     * @param resolveable - Name or ID.
     * @returns Module Key
     */
    private resolveModule(resolveable: string | number) {
        if (typeof resolveable === 'string') {
            return this.client.modules.get(resolveable)
        } else {
            return [...this.client.modules.values()].find(m => m.id === resolveable)
        };
    };

    /**
     * Returns default modules.
     * @returns Default modules.
     */
    private getDefault() {
        return new Map([...this.client.modules.entries()].filter(m => m[1].default));
    };

    public async init() {

        let bitfield = Number((await this.client.db.query(`SELECT enabled_modules FROM guilds WHERE guild_id = ${this.guild.id}`)).rows[0].enabled_modules)

        if (!bitfield) {
            this.enabled = this.getDefault();
            return this.save();
        } else {
            return this.set(bitfield);
        }
    };

    public set(bitfield: number, save: Boolean = true) {
        let map = this.resolveModules(bitfield);
        this.enabled = map;
        return save ? this.save() : {};
    };

    /**
     * Enables a module
     * @param resolveable 
     * @returns Boolean
     */
    public enable(resolveable: string | number, save: Boolean = true) {
        let module = this.resolveModule(resolveable);
        if (module) {
            this.enabled.set(module.name, module);
            return save ? this.save() : {};
        } else throw new Error('Module unresolved');
    };

    /**
     * Disables a module
     * @param resolveable 
     * @returns Boolean
     */
    public disable(resolveable: string | number, save: Boolean = true) {
        let module = this.resolveModule(resolveable);
        if (module) {
            this.enabled.delete(module.name);
            return save ? this.save() : {};
        } else throw new Error('Module unresolved');
    };

    /**
     * Saves the current setup to the DB.
     */
    private save() {
        return this.client.db.query(`UPDATE guilds SET enabled_modules = ${this.bitfield} WHERE guild_id = ${this.guild.id}`);
    }

    public revert(save: Boolean = true) {
        this.enabled = this.getDefault();
        return save ? this.save() : {};
    };

};