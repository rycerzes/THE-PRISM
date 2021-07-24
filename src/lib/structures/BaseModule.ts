// import type { Command } from '#structures/Command';
// import type { Listener } from '#structures/Listener'
// import type { Precondition } from '#structures/Precondition';
import type { Client } from '#lib/Client';

export interface BaseModule {
    name: string;
    client: Client;
    
    // I cant get these types to work
    commands: any;
    listeners: any;
    preconditions: any;
};

export abstract class BaseModule {

    public abstract id: number;
    public abstract default: boolean;

    constructor(name: string, client: Client) {

        this.name = name;
        this.client = client;
        this.commands = new Map();
        this.listeners = new Map();
        this.preconditions = new Map();

    };

    public init() {
        if (!this.client.loggedIn) throw new Error('Client is not ready.');
        this.getCommands();
        this.getListeners();
        this.getPreconditions();
    };

    private getCommands() {
        this.client.stores.get('commands').forEach(c => {
            if (c.module?.name === this.name) return this.commands.set(c.name, c);
        });
    };

    private getListeners() {
        this.client.stores.get('events').forEach(l => {
            if (l.module?.name === this.name) return this.listeners.set(l.name, l);
        });
    };

    private getPreconditions() {
        this.client.stores.get('preconditions').forEach(p => {
            if (p.module?.name === this.name) return this.preconditions.set(p.name, p);
        });
    };

};