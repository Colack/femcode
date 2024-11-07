// femcode.ts

import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { FemError } from './femError.js';
import { Token } from './tokens.js';

function run(source: string) {
  console.log('Running FemCode program:\n', source);

  const lexer = new Lexer(source);
  const tokens = lexer.lex();

  if (tokens.some((token: { type: Token; lexeme: string; line: number }) => token.type === Token.Unknown)) {
    tokens.forEach((token: { type: Token; lexeme: string; line: number }) => {
      if (token.type === Token.Unknown) {
        console.error(FemError.error(`Unexpected character "${token.lexeme}"`, token.line).formatMessage());
      }
    });
    return;
  }

  console.log('\nTokens:', tokens);

  const parser = new Parser(tokens);
  const expression = parser.parse();

  if (!expression) {
    console.error(FemError.error('Parsing failed due to syntax errors').formatMessage());
    return;
  }

  console.log('\nParsed Expression:', expression);
}

const sampleCode = `
let x = 10;
let y = x + 20 * 2;
fn add(a, b) {
  return a + b;
}
`;

run(sampleCode);
