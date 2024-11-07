import { Token } from './tokens.js';

export class Lexer {
  private source: string;
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(source: string) {
    this.source = source;
  }

  lex(): { type: Token; lexeme: string; line: number }[] {
    const tokens = [];

    while (!this.isAtEnd()) {
      this.start = this.current;
      const token = this.scanToken();
      if (token) {
        tokens.push(token);
      }
    }

    return tokens;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private scanToken() {
    const char = this.advance();

    switch (char) {
      case '(': return { type: Token.LeftParen, lexeme: char, line: this.line };
      case ')': return { type: Token.RightParen, lexeme: char, line: this.line };
      case '{': return { type: Token.LeftBrace, lexeme: char, line: this.line };
      case '}': return { type: Token.RightBrace, lexeme: char, line: this.line };
      case ',': return { type: Token.Comma, lexeme: char, line: this.line };
      case '.': return { type: Token.Dot, lexeme: char, line: this.line };
      case '-': return { type: Token.Minus, lexeme: char, line: this.line };
      case '+': return { type: Token.Plus, lexeme: char, line: this.line };
      case ';': return { type: Token.Semicolon, lexeme: char, line: this.line };
      case '*': return { type: Token.Star, lexeme: char, line: this.line };
      // Handle multi-character tokens like `==`, `!=`, etc.
      case '!': return this.match('=') ? { type: Token.BangEqual, lexeme: '!=', line: this.line } : { type: Token.Bang, lexeme: '!', line: this.line };
      case '=': return this.match('=') ? { type: Token.EqualEqual, lexeme: '==', line: this.line } : { type: Token.Equal, lexeme: '=', line: this.line };
      case '<': return this.match('=') ? { type: Token.LessEqual, lexeme: '<=', line: this.line } : { type: Token.Less, lexeme: '<', line: this.line };
      case '>': return this.match('=') ? { type: Token.GreaterEqual, lexeme: '>=', line: this.line } : { type: Token.Greater, lexeme: '>', line: this.line };

      // Skip whitespace and handle new lines
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n':
        this.line++;
        break;

      // Numbers, strings, and identifiers will go here
      default:
        if (this.isDigit(char)) {
          return this.number();
        } else if (this.isAlpha(char)) {
          return this.identifier();
        } else {
          // Handle unknown characters
          return { type: Token.Unknown, lexeme: char, line: this.line };
        }
    }
  }

  private advance(): string {
    return this.source[this.current++];
  }

  private match(expected: string): boolean {
    if (this.isAtEnd() || this.source[this.current] !== expected) {
      return false;
    }
    this.current++;
    return true;
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_';
  }

  private number() {
    while (this.isDigit(this.peek())) this.advance();

    return {
      type: Token.Number,
      lexeme: this.source.substring(this.start, this.current),
      line: this.line
    };
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const lexeme = this.source.substring(this.start, this.current);
    const type = this.keywordType(lexeme);

    return { type, lexeme, line: this.line };
  }

  private keywordType(lexeme: string): Token {
    switch (lexeme) {
      case 'and': return Token.And;
      case 'class': return Token.Class;
      case 'else': return Token.Else;
      case 'false': return Token.False;
      case 'for': return Token.For;
      case 'fun': return Token.Fun;
      case 'if': return Token.If;
      case 'nil': return Token.Nil;
      case 'or': return Token.Or;
      // Add other keywords as needed
      default: return Token.Identifier;
    }
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.current];
  }
}
