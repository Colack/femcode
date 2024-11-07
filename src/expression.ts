// expression.ts

import { Token } from './tokens.js';

export interface Expr {}

export class Binary implements Expr {
  constructor(
    public left: Expr,
    public operator: { type: Token; lexeme: string; line: number },
    public right: Expr
  ) {}
}

// Other expression classes
export class Literal implements Expr {
  constructor(public value: any) {}
}

export class Grouping implements Expr {
  constructor(public expression: Expr) {}
}

export class FunctionExpr implements Expr {
  constructor(
    public name: { type: Token; lexeme: string; line: number },
    public parameters: Array<{ type: Token; lexeme: string; line: number }>,
    public body: Expr
  ) {}
}
