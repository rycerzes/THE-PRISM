import type { Guild } from "discord.js";
import type { Client } from '#lib/Client'
import type { BaseModule } from "#structures/BaseModule";

export type ModuleResolvable = string | number | BaseModule

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
    private resolveModule(resolveable: ModuleResolvable) {
        if (typeof resolveable === 'string') {
            return this.client.modules.get(resolveable)
        } else if (typeof resolveable === 'number') {
            return [...this.client.modules.values()].find(m => m.id === resolveable)
        } else {
            return resolveable;
        };
    };

    /**
     * Returns default modules.
     * @returns Default modules.
     */
    private getDefault() {
        return new Map([...this.client.modules.entries()].filter(m => m[1].default));
    };

    public async init(): Promise<GuildModuleManager> {

        let bitfield = Number((await this.client.db.query(`SELECT enabled_modules FROM guilds WHERE guild_id = ${this.guild.id}`)).rows[0].enabled_modules)

        if (!bitfield) {
            this.enabled = this.getDefault();
            await this.save();
        } else {
            await this.set(bitfield);
        }
        return this
    };

    public async set(bitfield: number, save: Boolean = true) {
        let map = this.resolveModules(bitfield);
        this.enabled = map;
        return save ? await this.save() : true;
    };

    /**
     * Enables a module
     * @param resolveable 
     * @returns Boolean
     */
    public async enable(resolveable: ModuleResolvable, save: Boolean = true): Promise<boolean> {
        let module = this.resolveModule(resolveable);
        if (module) {
            this.enabled.set(module.name, module);
            return save ? await this.save() : true;
        } else throw new Error('Module unresolved');
    };

    /**
     * Disables a module
     * @param resolveable 
     * @returns Boolean
     */
    public async disable(resolveable: ModuleResolvable, save: Boolean = true): Promise<boolean> {
        let module = this.resolveModule(resolveable);
        if (module) {
            this.enabled.delete(module.name);
            return save ? await this.save() : true;
        } else throw new Error('Module unresolved');
    };

    /**
     * Saves the current setup to the DB.
     */
    private async save() {
        const bf = this.bitfield;
        const newBf = Number((await this.client.db.query(`UPDATE guilds SET enabled_modules = ${this.bitfield} WHERE guild_id = ${this.guild.id} RETURNING enabled_modules`)).rows[0].enabled_modules);
        return bf === newBf;
    }

    public async revert(save: Boolean = true): Promise<boolean> {
        this.enabled = this.getDefault();
        return save ? await this.save() : true;
    };

    public isEnabled(resolveable: ModuleResolvable): any {
        const module = this.resolveModule(resolveable);

        return !!this.enabled.get(module!.name)
    };

};