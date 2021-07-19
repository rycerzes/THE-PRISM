console.clear()
import { Client } from '#lib/Client';
import { LogLevel } from '@sapphire/framework';
(await import ('dotenv')).config();	

console.log('Initializing...')

let client: Client = new Client('227848397447626752', {

	intents: [ // For a list: https://discord.com/developers/docs/topics/gateway#list-of-intents
		'GUILDS',
		'GUILD_MESSAGES',
		'GUILD_MEMBERS',
		'GUILD_VOICE_STATES',
		'GUILD_MESSAGE_REACTIONS',
		'GUILD_PRESENCES',
		'DIRECT_MESSAGES',
		'DIRECT_MESSAGE_REACTIONS',
	],
	partials: ['MESSAGE', 'REACTION'],

	logger: {
		level: LogLevel.Trace
	}
});

await client.connectDB();
await client.loadModules('./src/modules');

try {
	client.logger.info('Logging in...');
	await client.login(process.env.TOKEN);
	client.loggedIn = true;
	client.logger.info('Logged in');

} catch (error) {
	client.logger.fatal(error);
	client.destroy();
	process.exit(1);
};