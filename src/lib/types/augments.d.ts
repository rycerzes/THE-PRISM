import type { GuildMember, Snowflake } from 'discord.js'
import type {  } from '@sapphire/framework';
import type { BaseModule } from '#structures/BaseModule';
import type { DBClient } from '#lib/DBClient';
import type { GuildModuleManager } from '#structures/GuildModuleManager';
import type { ClientUtil } from '#util/ClientUtil';

declare module 'discord.js' {
    interface Client {

        // Properties
        ownerID: string | undefined;
        modules: Map<string, BaseModule>;
        util: ClientUtil;
        loggedIn: Boolean;
        guildModules: Map<Snowflake, GuildModuleManager>
        db: DBClient;
        colors: {
            red: ColorResolvable,
            amber: ColorResolvable,
            green: ColorResolvable
        };
        defaults: unknown;

        // Methods
        connectDB(): Promise<void>;
        loadModules(path: string): Promise<Map<string, BaseModule>>;
        removeSuffix(fileName: string): string;

    }
}

declare module '@sapphire/framework' {
    interface Command {
        module: BaseModule | null;
    }

    interface Event {
        module: BaseModule | null;
    }

    interface Precondition {
        module: BaseModule | null;
    }
}