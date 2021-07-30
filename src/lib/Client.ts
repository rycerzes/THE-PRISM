import { SapphireClient } from '@sapphire/framework';
import { DBClient } from '#lib/DBClient';
import { ClientUtil } from '#util/ClientUtil'
import { promises as fsp } from 'fs';
import { colors, defaults } from '#util/config';
import type { BaseModule } from './structures/BaseModule';
import type { ApplicationCommandData, ClientOptions, Guild } from 'discord.js';
import { GuildModuleManager } from '#structures/GuildModuleManager';

const PREFIX = '-';

export class Client extends SapphireClient {

    constructor(ownerID: string, options: ClientOptions) {

        super(options);
        this.ownerID = ownerID

        this.loggedIn = false;
        this.stores.registerPath('../');
        this.db = new DBClient(this);
        this.util = new ClientUtil(this);
        this.guildModuleManagers = new Map();
        this.colors = colors;
        this.defaults = defaults;
        this.fetchPrefix = () => {
            return PREFIX;
        };

    };

    public async connectDB() {
        console.log('Connecting to DB...');
        try {
            await this.db.connect();
            console.log('Connection to DB established.')
        } catch (err) {
            this.logger.fatal(err);
            this.destroy();
            process.exit(1);
        }
    };

    public removeSuffix(fileName: string) {
        let arr = fileName.split('.');
        arr.pop();
        return arr.join('.');
    };

    public async loadModules(path: string) {

        let map = new Map(); let module: BaseModule;

        const dir = await fsp.opendir(path);
        for await (const file of dir) {

            // Initiate new class from file
            module = new (await import(`../modules/${this.removeSuffix(file.name)}.js`)).Module(this);

            // Check for duplicate IDs
            map.forEach(m => {
                if (m.id === module.id) throw new Error('Modules cannot have duplicate IDs')
            })

            map.set(module.name, module);

        };

        return this.modules = new Map([...map.entries()].sort((a: [string, BaseModule], b: [string, BaseModule]) => a[1].id - b[1].id));
    };

    public setSlash() {
        
        this.application?.commands.set(this.stores.get('commands')?.map(c => {
            const { name, description, options, defaultPermission = true } = c.slash;
            return {
                name,
                description,
                options,
                defaultPermission
            } as ApplicationCommandData
        }))
    };

    public async newModuleManager(guild: Guild): Promise<GuildModuleManager> {

        return await this.guildModuleManagers.set(guild.id, new GuildModuleManager(guild, this)).get(guild.id)!.init();

    };

    public async getModuleManager(guild: Guild): Promise<GuildModuleManager> {
        return this.guildModuleManagers.get(guild.id) || await this.newModuleManager(guild);
    }

    public async checkModule(module: string | number | BaseModule, guild: Guild): Promise<boolean> {

        const manager = await this.getModuleManager(guild);

        return manager.isEnabled(module)

    };

    get invite() {
        return `https://discord.com/oauth2/authorize?client_id=${this.user!.id}&permissions=8&scope=bot`
    }

};