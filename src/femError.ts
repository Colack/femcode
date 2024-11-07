// femError.ts

import chalk from 'chalk';

export enum ErrorType {
  Error,
  Warning,
}

export class FemError {
  constructor(
    public message: string,
    public line: number | null = null,
    public column: number | null = null,
    public type: ErrorType = ErrorType.Error
  ) {}

  public formatMessage(): string {
    const location = this.line !== null && this.column !== null
      ? ` at line ${this.line}, column ${this.column}`
      : '';

    const prefix = this.type === ErrorType.Error ? 'Error' : 'Warning';
    const colorFn = this.type === ErrorType.Error ? chalk.red : chalk.yellow;

    return colorFn(`${prefix}: ${this.message}${location}`);
  }

  static error(message: string, line: number | null = null, column: number | null = null) {
    return new FemError(message, line, column, ErrorType.Error);
  }

  static warning(message: string, line: number | null = null, column: number | null = null) {
    return new FemError(message, line, column, ErrorType.Warning);
  }
}
