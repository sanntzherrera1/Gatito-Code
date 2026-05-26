/**
 * Program domain model — an immutable sequence of commands.
 */
export class Program {
    constructor(commands = []) {
        this.commands = commands.slice();
    }
}
