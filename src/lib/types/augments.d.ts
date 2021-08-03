import type { ApplicationCommandOptionData, ColorResolvable, GuildMember, Message, Snowflake, TextChannel } from 'discord.js'
import type { Args } from '@sapphire/framework';
import type { BaseModule } from '#structures/BaseModule';
import type { DBClient } from '#lib/DBClient';
import type { GuildModuleManager } from '#structures/GuildModuleManager';
import type { ClientUtil } from '#util/ClientUtil';
import type { RankingMessage } from '#structures/RankingMessage';
import { Client as BotClient} from '#lib/Client';

declare module 'discord.js' {
    interface Client {

        // Properties
        ownerID: string | undefined;
        modules: Map<string, BaseModule>;
        util: ClientUtil;
        loggedIn: Boolean;
        guildModuleManagers: Map<Snowflake, GuildModuleManager>
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
        setSlash(): void;
        newModuleManager(guild: Guild): Promise<GuildModuleManager>;
        getModuleManager(guild: Guild): Promise<GuildModuleManager>;
        checkModule(module: string | number | BaseModule, guild: Guild): Promise<boolean>;

        // Getters
        invite: string;

    }
}

declare module '@sapphire/framework' {

    interface Command {
        module: BaseModule | null;
        slash: {
            name: string
            description: string,
            options: ApplicationCommandOptionData[] | undefined,
            defaultPermission: boolean
        }
    }

    interface CommandOptions {
        usage: string[];
    }

    interface Listener {
        module: BaseModule | null;
    }

    interface Precondition {
        module: BaseModule | null;
    }

    interface Preconditions {
        module: never;
        guild: never;
        admin: never;
        owner: never;
    }

    interface ArgType {
        module: BaseModule;
        rankpage: number;
        lbcategory: string;
        moduleoption: string;
        color: ColorResolvable;
        configChannel: string;
        null: boolean;
    }

    interface ArgumentContext {
        map: Map<any, any>;
        rankingMessage: RankingMessage;

        resolve({}: any): any;
    }
}

declare module 'pg' {

    interface Client {
        client: BotClient
    }

}