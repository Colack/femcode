import { FemError } from './femError.js';
import { Token } from './tokens.js'
import { Expr, Literal, Binary, Grouping, FunctionExpr } from './expression.js';
import { Lexer } from './lexer.js';

export class Parser {
  private current = 0;
  private tokens: Array<{ type: Token; lexeme: string; line: number; column: number }> = [];

  constructor(tokens: Array<{ type: Token; lexeme: string; line: number; column: number }>) {
    this.tokens = tokens;
  }

  private peek(): { type: Token; lexeme: string; line: number; column: number } {
    return this.tokens[this.current];
  }

  private previous(): { type: Token; lexeme: string; line: number; column: number } {
    return this.tokens[this.current - 1];
  }

  private consume(type: Token, message: string): { type: Token; lexeme: string; line: number; column: number } {
    if (this.check(type)) {
      return this.advance();
    }

    throw new FemError(message, this.peek().line, this.peek().column);
  }

  private match(...types: Token[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: Token): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): { type: Token; lexeme: string; line: number; column: number } {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === Token.Eof;
  }

  // Start parsing the program (or expression)
  public parse(): Expr[] {
    const expressions: Expr[] = [];
    while (!this.isAtEnd()) {
      expressions.push(this.expression());
    }
    return expressions;
  }

  // Expression handling: evaluates the given tokens into expressions
  private expression(): Expr {
    return this.assignment();
  }

  // Handles assignments (a = b)
  private assignment(): Expr {
    let expr = this.equality();

    if (this.match(Token.Equal)) {
      const equals = this.previous();
      const value = this.assignment(); // Right-hand side of the assignment
      if (expr instanceof Variable) {
        return new Assignment(expr, value);
      } else {
        throw new FemError("Invalid assignment target.", equals.line, equals.column);
      }
    }

    return expr;
  }

  // Handles equality (==, !=)
  private equality(): Expr {
    let expr = this.comparison();

    while (this.match(Token.EqualEqual, Token.BangEqual)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  // Handles comparison (<, <=, >, >=)
  private comparison(): Expr {
    let expr = this.term();

    while (this.match(Token.Less, Token.LessEqual, Token.Greater, Token.GreaterEqual)) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  // Handles addition and subtraction (+, -)
  private term(): Expr {
    let expr = this.factor();

    while (this.match(Token.Plus, Token.Minus)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  // Handles multiplication and division (*, /)
  private factor(): Expr {
    let expr = this.primary();

    while (this.match(Token.Star, Token.Slash)) {
      const operator = this.previous();
      const right = this.primary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  // Primary expression handling (numbers, identifiers, parentheses, functions)
  private primary(): Expr {
    if (this.match(Token.Number)) {
      return new Literal(this.previous().lexeme); // Handle number literals
    }
    if (this.match(Token.Identifier)) {
      return new Literal(this.previous().lexeme); // Handle identifiers like variable names
    }
    if (this.match(Token.LeftParen)) {
      const expr = this.expression();
      this.consume(Token.RightParen, "Expect ')' after expression.");
      return new Grouping(expr);
    }

    // Handle functions
    if (this.match(Token.Fun)) {
      const name = this.consume(Token.Identifier, "Expect function name.");
      this.consume(Token.LeftParen, "Expect '(' after function name.");

      // Parse function parameters (this would need more detailed implementation)
      let parameters: Array<{ type: Token; lexeme: string; line: number }> = [];
      while (!this.check(Token.RightParen) && !this.isAtEnd()) {
        parameters.push(this.consume(Token.Identifier, "Expect parameter name."));
        if (!this.match(Token.Comma)) break;
      }

      this.consume(Token.RightParen, "Expect ')' after parameters.");
      this.consume(Token.LeftBrace, "Expect '{' before function body.");
      const body = this.block();

      return new FunctionExpr(name, parameters, body);
    }

    throw new FemError("Expect expression.", this.peek().line, this.peek().column);
  }

  private block(): Expr[] {
    const statements: Expr[] = [];
    while (!this.check(Token.RightBrace) && !this.isAtEnd()) {
      statements.push(this.expression()); // You may want to parse full statements instead of just expressions here
    }
    this.consume(Token.RightBrace, "Expect '}' after block.");
    return statements;
  }
}
