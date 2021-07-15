import { SapphireClient } from '@sapphire/framework';
import { DBClient } from '#lib/DBClient';
import { Util } from '#util/ClientUtil';
import { promises as fsp } from 'fs';
import { colors } from '#util/config';
import type { BaseModule } from './structures/BaseModule';
import type { ClientOptions } from 'discord.js';

const PREFIX = '-';

export class Client extends SapphireClient {

    constructor(ownerID: string, options: ClientOptions) {

        super(options);
        this.ownerID = ownerID

        this.loggedIn = false;
        this.stores.registerUserDirectories('../');
        this.db = new DBClient();
        this.util = new Util(this);
        this.guildModules = new Map();
        this.colors = colors;
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

};