import pg from 'pg';
import { DATABASE_URL } from '#root/credentials';

export interface DBClient {

};

export class DBClient extends pg.Client {
    constructor() {

        super({
            connectionString: DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        })

    };
};