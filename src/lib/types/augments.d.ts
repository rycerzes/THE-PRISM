import type { ApplicationCommandOptionData, GuildMember, Message, Snowflake } from 'discord.js'
import type { Args } from '@sapphire/framework';
import type { BaseModule } from '#structures/BaseModule';
import type { DBClient } from '#lib/DBClient';
import type { GuildModuleManager } from '#structures/GuildModuleManager';
import type { ClientUtil } from '#util/ClientUtil';
import type { RankingMessage } from '#structures/RankingMessage';

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
        setSlash(): void;
        newModuleManager(guild: Guild): Promise<GuildModuleManager>;

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

    interface Event {
        module: BaseModule | null;
    }

    interface Precondition {
        module: BaseModule | null;
    }

    interface ArgType {
        module: BaseModule;
        rankpage: number;
        lbcategory: string;
        moduleoption: string;
    }

    interface ArgumentContext {
        map: Map<any, any>;
        rankingMessage: RankingMessage;

        resolve({}: any): any;
    }
}