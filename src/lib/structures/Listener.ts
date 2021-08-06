import Sapphire from '@sapphire/framework';
import type { Guild } from 'discord.js';
import type { BaseModule } from './BaseModule';

export abstract class Listener extends Sapphire.Listener {

    public async checkModule(guild: Guild, moduleResolveable: string | number | BaseModule): Promise<boolean> {

        return (await this.client.getModuleManager(guild)).isEnabled(moduleResolveable)

    };

    get client() {
        return this.container.client;
    }

    get db() {
        return this.container.client.db;
    }
};