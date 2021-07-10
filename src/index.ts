import { Client } from '#structures/Client';
import { TOKEN } from '#root/credentials'

console.log('Initializing...')
const client = new Client();
client.connectDB();

const main = async () => {
	try {
		client.logger.info('Logging in...');
		client.login(TOKEN)
		client.logger.info('Logged in');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();