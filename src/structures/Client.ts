import { SapphireClient, LogLevel } from '@sapphire/framework';
import { DBClient } from '#root/structures/DBClient';

export interface Client {
    db: any
};

export class Client extends SapphireClient {

    constructor() {

        super({
            intents: [ // For a list: https://discord.com/developers/docs/topics/gateway#list-of-intents
                'GUILDS',
                'GUILD_MESSAGES',
                'GUILD_MEMBERS',
                'GUILD_VOICE_STATES',
                'GUILD_MESSAGE_REACTIONS',
                'DIRECT_MESSAGES',
                'DIRECT_MESSAGE_REACTIONS'
            ],
            partials: ['MESSAGE', 'REACTION'],

            logger: {
                level: LogLevel.Trace
            }
        });

        this.db = new DBClient();
    };

    connectDB() {
        console.log('Connecting to DB...');
        try {
            this.db.connect();
            console.log('Connection to DB established.')
        } catch (err) {
            this.logger.fatal(err);
            this.destroy();
            process.exit(1);
        }
    }
};