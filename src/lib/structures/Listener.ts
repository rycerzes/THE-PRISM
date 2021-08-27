import Sapphire from '@sapphire/framework';
import type { Guild } from 'discord.js';
import type { BaseModule } from './BaseModule';

export abstract class Listener extends Sapphire.Listener {

    public async checkModule(guild: Guild, moduleResolveable: string | number | BaseModule): Promise<boolean> {
        const manager = await this.client.getModuleManager(guild);
        return manager.isEnabled(moduleResolveable);
    };

    get client() {
        return this.container.client;
    }

    get db() {
        return this.container.client.db;
    }
};