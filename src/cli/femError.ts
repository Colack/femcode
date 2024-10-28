import chalk from 'chalk';

export class FemError {
    constructor(public message: string, public line: number, public column: number) {
        this.message = message;
        this.line = line;
        this.column = column;
    }

    public returnError(): string {
        return chalk.red(`Error: ${this.message} at line ${this.line}, column ${this.column}`);
    }

    public returnErrorNoLine(): string {
        return chalk.red(`Error: ${this.message}`);
    }

    public returnWarning(): string {
        return chalk.yellow(`Warning: ${this.message} at line ${this.line}, column ${this.column}`);
    }

    public returnWarningNoLine(): string {
        return chalk.yellow(`Warning: ${this.message}`);
    }
}