import { SapphireClient } from '@sapphire/framework';
import { DBClient } from '#lib/DBClient';
import { ClientUtil } from '#util/ClientUtil'
import { promises as fsp } from 'fs';
import { colors, defaults } from '#util/constants';
import type { BaseModule } from './structures/BaseModule';
import type { ClientOptions, Guild, Message } from 'discord.js';
import { GuildModuleManager } from '#structures/GuildModuleManager';

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
        this.fetchPrefix = async (message: Message) => {
            if (!message.guild) return defaults.prefix;
            return (await this.db.query(`SELECT prefix FROM guilds WHERE guild_id = ${message.guild!.id}`)).rows[0].prefix;
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

    public async newModuleManager(guild: Guild): Promise<GuildModuleManager> {

        const manager = new GuildModuleManager(guild, this);

        await manager.init();

        this.guildModuleManagers.set(guild.id, manager);

        return manager;

        //return await this.guildModuleManagers.set(guild.id, new GuildModuleManager(guild, this)).get(guild.id)!.init();

    };

    public async getModuleManager(guild: Guild): Promise<GuildModuleManager> {
        let manager = this.guildModuleManagers.get(guild.id);
        if (!manager) manager =  await this.newModuleManager(guild);
        return manager;
    }

    public async checkModule(module: string | number | BaseModule, guild: Guild): Promise<boolean> {

        const manager = await this.getModuleManager(guild);

        return manager.isEnabled(module)

    };

    get invite() {
        return `https://discord.com/oauth2/authorize?client_id=${this.user!.id}&permissions=8&scope=bot`
    }

};