import type { Client } from '#lib/Client';
import type { Command } from './Command';

export interface BaseModule {
    name: string;
    client: Client;
    commands: Map<string, Command>;
    required: boolean;
    hidden?: boolean;
};

export abstract class BaseModule {

    public abstract id: number;
    public abstract default: boolean;
    public abstract description: string;

    constructor(name: string, client: Client, required: boolean = false) {

        this.name = name;
        this.client = client;
        this.commands = new Map();
        this.required = required

    };

    public getCommands(): Map<string, Command> {
        this.client.stores.get('commands').forEach(c => {
            if (c.module?.name === this.name) return this.commands.set(c.name, c);
            return;
        });

        return this.commands;
    };

};