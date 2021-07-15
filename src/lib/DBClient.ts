import pg from 'pg';

export interface DBClient {

};

export class DBClient extends pg.Client {
    constructor() {

        super({
            connectionString: process.env.DB_URL,
            ssl: {
                rejectUnauthorized: false
            }
        })

    };
};