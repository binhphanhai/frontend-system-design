# Simple Interpreter: Building a Vietnamese Programming Language

## Table of Contents

- [Introduction](#introduction)
- [Project Overview](#project-overview)
- [Interpreter Architecture](#interpreter-architecture)
- [Lexical Analysis (Tokenization)](#lexical-analysis-tokenization)
- [Parsing and AST Generation](#parsing-and-ast-generation)
- [Interpreter Execution](#interpreter-execution)
- [Language Features](#language-features)
- [Implementation Details](#implementation-details)
- [Browser Integration](#browser-integration)
- [Best Practices](#best-practices)
- [Conclusion](#conclusion)

## Introduction

The Simple Interpreter project is a Vietnamese programming language interpreter built with Next.js and TypeScript that runs entirely in the browser. As shown in the [newbie-interpreter GitHub repository](https://github.com/binhphanhai/newbie-interpreter), this project demonstrates how to create a complete programming language interpreter from scratch, featuring an interactive code editor, real-time interpretation, and client-side execution.

### Project Goals

- **Educational**: Demonstrate interpreter construction principles
- **Accessible**: Vietnamese language keywords for local developers
- **Interactive**: Real-time code execution in the browser
- **Portable**: No server required, fully client-side implementation

## Project Overview

### Technology Stack

```javascript
// Project configuration from package.json perspective
const projectStack = {
  frontend: "Next.js with TypeScript",
  ui: "React components with CSS modules",
  deployment: "Static export for GitHub Pages",
  interpreter: {
    lexer: "TypeScript-based tokenization",
    parser: "Recursive descent parser",
    ast: "Abstract Syntax Tree representation",
    executor: "Tree-walking interpreter",
  },
};
```

### Project Structure

```
newbie-interpreter/
├── component/          # React UI components
├── helper/            # Core interpreter logic ⭐
│   ├── lexer.ts       # Tokenization
│   ├── parser.ts      # AST generation
│   ├── ast.ts         # AST node definitions
│   └── interpreter.ts # Execution engine
├── examples/          # Sample programs
├── pages/            # Next.js pages
└── public/           # Static assets
```

## Interpreter Architecture

### Three-Phase Compilation Pipeline

```javascript
// Simplified interpreter pipeline
class InterpreterPipeline {
  constructor() {
    this.lexer = new Lexer();
    this.parser = new Parser();
    this.interpreter = new Interpreter();
  }

  execute(sourceCode) {
    // Phase 1: Lexical Analysis (Text → Tokens)
    const tokens = this.lexer.tokenize(sourceCode);

    // Phase 2: Syntax Analysis (Tokens → AST)
    const ast = this.parser.parse(tokens);

    // Phase 3: Execution (AST → Result)
    const result = this.interpreter.evaluate(ast);

    return result;
  }
}

// Example Vietnamese code execution
const code = `
gán a = 10
gán b = 20
in (a + b)
`;

const interpreter = new InterpreterPipeline();
const output = interpreter.execute(code); // → 30
```

### Component Relationships

```javascript
// Interpreter component architecture
const interpreterArchitecture = {
  input: "Vietnamese source code",

  lexer: {
    input: "Raw text",
    output: "Token stream",
    responsibility: "Character-by-character analysis",
  },

  parser: {
    input: "Token stream",
    output: "Abstract Syntax Tree",
    responsibility: "Syntax validation and structure building",
  },

  interpreter: {
    input: "Abstract Syntax Tree",
    output: "Execution result",
    responsibility: "Tree traversal and evaluation",
  },
};
```

## Lexical Analysis (Tokenization)

### Token Definition System

```typescript
// Token types for Vietnamese programming language
enum TokenType {
  // Literals
  NUMBER = "NUMBER",
  STRING = "STRING",
  BOOLEAN = "BOOLEAN",

  // Identifiers
  IDENTIFIER = "IDENTIFIER",

  // Keywords (Vietnamese)
  GAN = "GAN", // gán (assign)
  NEU = "NEU", // nếu (if)
  KHAC = "KHAC", // khác (else)
  LAP = "LAP", // lặp (loop)
  HAM = "HAM", // hàm (function)
  TRA_VE = "TRA_VE", // trả về (return)
  IN = "IN", // in (print)

  // Operators
  PLUS = "PLUS", // +
  MINUS = "MINUS", // -
  MULTIPLY = "MULTIPLY", // *
  DIVIDE = "DIVIDE", // /
  ASSIGN = "ASSIGN", // =
  EQUAL = "EQUAL", // ==
  NOT_EQUAL = "NOT_EQUAL", // !=

  // Delimiters
  LPAREN = "LPAREN", // (
  RPAREN = "RPAREN", // )
  LBRACE = "LBRACE", // {
  RBRACE = "RBRACE", // }
  SEMICOLON = "SEMICOLON", // ;
  NEWLINE = "NEWLINE", // \n

  // Special
  EOF = "EOF",
}

interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}
```

### Lexer Implementation

```typescript
class Lexer {
  private text: string;
  private position: number;
  private currentChar: string | null;
  private line: number;
  private column: number;

  constructor(text: string) {
    this.text = text;
    this.position = 0;
    this.currentChar = this.text[0] || null;
    this.line = 1;
    this.column = 1;
  }

  // Character navigation
  private advance(): void {
    if (this.currentChar === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }

    this.position++;
    this.currentChar =
      this.position < this.text.length ? this.text[this.position] : null;
  }

  private peek(): string | null {
    const peekPos = this.position + 1;
    return peekPos < this.text.length ? this.text[peekPos] : null;
  }

  // Skip whitespace and comments
  private skipWhitespace(): void {
    while (
      this.currentChar &&
      /\s/.test(this.currentChar) &&
      this.currentChar !== "\n"
    ) {
      this.advance();
    }
  }

  private skipComment(): void {
    if (this.currentChar === "/" && this.peek() === "/") {
      while (this.currentChar && this.currentChar !== "\n") {
        this.advance();
      }
    }
  }

  // Number tokenization
  private readNumber(): Token {
    const start = { line: this.line, column: this.column };
    let value = "";

    while (this.currentChar && /[\d.]/.test(this.currentChar)) {
      value += this.currentChar;
      this.advance();
    }

    return {
      type: TokenType.NUMBER,
      value,
      line: start.line,
      column: start.column,
    };
  }

  // String tokenization
  private readString(): Token {
    const start = { line: this.line, column: this.column };
    let value = "";

    this.advance(); // Skip opening quote

    while (this.currentChar && this.currentChar !== '"') {
      if (this.currentChar === "\\") {
        this.advance();
        // Handle escape sequences
        switch (this.currentChar) {
          case "n":
            value += "\n";
            break;
          case "t":
            value += "\t";
            break;
          case "\\":
            value += "\\";
            break;
          case '"':
            value += '"';
            break;
          default:
            value += this.currentChar;
        }
      } else {
        value += this.currentChar;
      }
      this.advance();
    }

    this.advance(); // Skip closing quote

    return {
      type: TokenType.STRING,
      value,
      line: start.line,
      column: start.column,
    };
  }

  // Identifier and keyword tokenization
  private readIdentifier(): Token {
    const start = { line: this.line, column: this.column };
    let value = "";

    while (this.currentChar && /[a-zA-ZÀ-ỹ0-9_]/.test(this.currentChar)) {
      value += this.currentChar;
      this.advance();
    }

    // Check for Vietnamese keywords
    const keywordMap = new Map([
      ["gán", TokenType.GAN],
      ["nếu", TokenType.NEU],
      ["khác", TokenType.KHAC],
      ["lặp", TokenType.LAP],
      ["hàm", TokenType.HAM],
      ["trả_về", TokenType.TRA_VE],
      ["in", TokenType.IN],
      ["đúng", TokenType.BOOLEAN],
      ["sai", TokenType.BOOLEAN],
    ]);

    const tokenType = keywordMap.get(value) || TokenType.IDENTIFIER;

    return {
      type: tokenType,
      value,
      line: start.line,
      column: start.column,
    };
  }

  // Main tokenization method
  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.currentChar) {
      this.skipWhitespace();

      if (!this.currentChar) break;

      // Handle newlines
      if (this.currentChar === "\n") {
        tokens.push({
          type: TokenType.NEWLINE,
          value: "\n",
          line: this.line,
          column: this.column,
        });
        this.advance();
        continue;
      }

      // Handle comments
      if (this.currentChar === "/" && this.peek() === "/") {
        this.skipComment();
        continue;
      }

      // Handle numbers
      if (/\d/.test(this.currentChar)) {
        tokens.push(this.readNumber());
        continue;
      }

      // Handle strings
      if (this.currentChar === '"') {
        tokens.push(this.readString());
        continue;
      }

      // Handle identifiers and keywords
      if (/[a-zA-ZÀ-ỹ_]/.test(this.currentChar)) {
        tokens.push(this.readIdentifier());
        continue;
      }

      // Handle operators and delimiters
      const char = this.currentChar;
      const nextChar = this.peek();

      switch (char) {
        case "+":
          tokens.push({
            type: TokenType.PLUS,
            value: "+",
            line: this.line,
            column: this.column,
          });
          this.advance();
          break;
        case "-":
          tokens.push({
            type: TokenType.MINUS,
            value: "-",
            line: this.line,
            column: this.column,
          });
          this.advance();
          break;
        case "*":
          tokens.push({
            type: TokenType.MULTIPLY,
            value: "*",
            line: this.line,
            column: this.column,
          });
          this.advance();
          break;
        case "/":
          tokens.push({
            type: TokenType.DIVIDE,
            value: "/",
            line: this.line,
            column: this.column,
          });
          this.advance();
          break;
        case "=":
          if (nextChar === "=") {
            tokens.push({
              type: TokenType.EQUAL,
              value: "==",
              line: this.line,
              column: this.column,
            });
            this.advance();
            this.advance();
          } else {
            tokens.push({
              type: TokenType.ASSIGN,
              value: "=",
              line: this.line,
              column: this.column,
            });
            this.advance();
          }
          break;
        case "!":
          if (nextChar === "=") {
            tokens.push({
              type: TokenType.NOT_EQUAL,
              value: "!=",
              line: this.line,
              column: this.column,
            });
            this.advance();
            this.advance();
          } else {
            throw new Error(
              `Unexpected character: ${char} at line ${this.line}, column ${this.column}`
            );
          }
          break;
        case "(":
          tokens.push({
            type: TokenType.LPAREN,
            value: "(",
            line: this.line,
            column: this.column,
          });
          this.advance();
          break;
        case ")":
          tokens.push({
            type: TokenType.RPAREN,
            value: ")",
            line: this.line,
            column: this.column,
          });
          this.advance();
          break;
        case "{":
          tokens.push({
            type: TokenType.LBRACE,
            value: "{",
            line: this.line,
            column: this.column,
          });
          this.advance();
          break;
        case "}":
          tokens.push({
            type: TokenType.RBRACE,
            value: "}",
            line: this.line,
            column: this.column,
          });
          this.advance();
          break;
        case ";":
          tokens.push({
            type: TokenType.SEMICOLON,
            value: ";",
            line: this.line,
            column: this.column,
          });
          this.advance();
          break;
        default:
          throw new Error(
            `Unexpected character: ${char} at line ${this.line}, column ${this.column}`
          );
      }
    }

    tokens.push({
      type: TokenType.EOF,
      value: "",
      line: this.line,
      column: this.column,
    });

    return tokens;
  }
}
```

## Parsing and AST Generation

### AST Node Definitions

```typescript
// Abstract base class for all AST nodes
abstract class ASTNode {
  abstract accept<T>(visitor: ASTVisitor<T>): T;
}

// Expression nodes
class NumberLiteral extends ASTNode {
  constructor(public value: number) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitNumberLiteral(this);
  }
}

class StringLiteral extends ASTNode {
  constructor(public value: string) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitStringLiteral(this);
  }
}

class BooleanLiteral extends ASTNode {
  constructor(public value: boolean) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitBooleanLiteral(this);
  }
}

class Identifier extends ASTNode {
  constructor(public name: string) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitIdentifier(this);
  }
}

class BinaryExpression extends ASTNode {
  constructor(
    public left: ASTNode,
    public operator: Token,
    public right: ASTNode
  ) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitBinaryExpression(this);
  }
}

// Statement nodes
class AssignmentStatement extends ASTNode {
  constructor(public identifier: Identifier, public value: ASTNode) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitAssignmentStatement(this);
  }
}

class PrintStatement extends ASTNode {
  constructor(public expression: ASTNode) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitPrintStatement(this);
  }
}

class IfStatement extends ASTNode {
  constructor(
    public condition: ASTNode,
    public thenBranch: ASTNode[],
    public elseBranch?: ASTNode[]
  ) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitIfStatement(this);
  }
}

class Program extends ASTNode {
  constructor(public statements: ASTNode[]) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitProgram(this);
  }
}
```

### Parser Implementation

```typescript
class Parser {
  private tokens: Token[];
  private current: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.current = 0;
  }

  // Utility methods
  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Error(
      `${message}. Got ${this.peek().type} at line ${this.peek().line}`
    );
  }

  // Grammar rules
  public parse(): Program {
    const statements: ASTNode[] = [];

    while (!this.isAtEnd()) {
      if (this.match(TokenType.NEWLINE)) continue;
      statements.push(this.statement());
    }

    return new Program(statements);
  }

  private statement(): ASTNode {
    if (this.match(TokenType.GAN)) return this.assignmentStatement();
    if (this.match(TokenType.IN)) return this.printStatement();
    if (this.match(TokenType.NEU)) return this.ifStatement();

    throw new Error(
      `Unexpected token: ${this.peek().value} at line ${this.peek().line}`
    );
  }

  private assignmentStatement(): AssignmentStatement {
    const identifier = this.consume(
      TokenType.IDENTIFIER,
      "Expected identifier after 'gán'"
    );
    this.consume(TokenType.ASSIGN, "Expected '=' after identifier");
    const value = this.expression();

    return new AssignmentStatement(new Identifier(identifier.value), value);
  }

  private printStatement(): PrintStatement {
    this.consume(TokenType.LPAREN, "Expected '(' after 'in'");
    const expression = this.expression();
    this.consume(TokenType.RPAREN, "Expected ')' after expression");

    return new PrintStatement(expression);
  }

  private ifStatement(): IfStatement {
    this.consume(TokenType.LPAREN, "Expected '(' after 'nếu'");
    const condition = this.expression();
    this.consume(TokenType.RPAREN, "Expected ')' after condition");

    this.consume(TokenType.LBRACE, "Expected '{' before if body");
    const thenBranch: ASTNode[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      if (this.match(TokenType.NEWLINE)) continue;
      thenBranch.push(this.statement());
    }

    this.consume(TokenType.RBRACE, "Expected '}' after if body");

    let elseBranch: ASTNode[] | undefined;
    if (this.match(TokenType.KHAC)) {
      this.consume(TokenType.LBRACE, "Expected '{' before else body");
      elseBranch = [];

      while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
        if (this.match(TokenType.NEWLINE)) continue;
        elseBranch.push(this.statement());
      }

      this.consume(TokenType.RBRACE, "Expected '}' after else body");
    }

    return new IfStatement(condition, thenBranch, elseBranch);
  }

  private expression(): ASTNode {
    return this.equality();
  }

  private equality(): ASTNode {
    let expr = this.comparison();

    while (this.match(TokenType.EQUAL, TokenType.NOT_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  private comparison(): ASTNode {
    return this.term();
  }

  private term(): ASTNode {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  private factor(): ASTNode {
    let expr = this.unary();

    while (this.match(TokenType.DIVIDE, TokenType.MULTIPLY)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new BinaryExpression(expr, operator, right);
    }

    return expr;
  }

  private unary(): ASTNode {
    if (this.match(TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new BinaryExpression(new NumberLiteral(0), operator, right);
    }

    return this.primary();
  }

  private primary(): ASTNode {
    if (this.match(TokenType.BOOLEAN)) {
      return new BooleanLiteral(this.previous().value === "đúng");
    }

    if (this.match(TokenType.NUMBER)) {
      return new NumberLiteral(parseFloat(this.previous().value));
    }

    if (this.match(TokenType.STRING)) {
      return new StringLiteral(this.previous().value);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new Identifier(this.previous().value);
    }

    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, "Expected ')' after expression");
      return expr;
    }

    throw new Error(
      `Unexpected token: ${this.peek().value} at line ${this.peek().line}`
    );
  }
}
```

## Interpreter Execution

### Visitor Pattern for AST Traversal

```typescript
interface ASTVisitor<T> {
  visitProgram(node: Program): T;
  visitAssignmentStatement(node: AssignmentStatement): T;
  visitPrintStatement(node: PrintStatement): T;
  visitIfStatement(node: IfStatement): T;
  visitBinaryExpression(node: BinaryExpression): T;
  visitNumberLiteral(node: NumberLiteral): T;
  visitStringLiteral(node: StringLiteral): T;
  visitBooleanLiteral(node: BooleanLiteral): T;
  visitIdentifier(node: Identifier): T;
}

class Interpreter implements ASTVisitor<any> {
  private environment: Map<string, any>;
  private output: string[];

  constructor() {
    this.environment = new Map();
    this.output = [];
  }

  public interpret(program: Program): {
    output: string[];
    environment: Map<string, any>;
  } {
    this.visitProgram(program);
    return {
      output: this.output,
      environment: new Map(this.environment),
    };
  }

  visitProgram(node: Program): void {
    for (const statement of node.statements) {
      statement.accept(this);
    }
  }

  visitAssignmentStatement(node: AssignmentStatement): void {
    const value = node.value.accept(this);
    this.environment.set(node.identifier.name, value);
  }

  visitPrintStatement(node: PrintStatement): void {
    const value = node.expression.accept(this);
    const output = this.stringify(value);
    this.output.push(output);
  }

  visitIfStatement(node: IfStatement): void {
    const condition = node.condition.accept(this);

    if (this.isTruthy(condition)) {
      for (const statement of node.thenBranch) {
        statement.accept(this);
      }
    } else if (node.elseBranch) {
      for (const statement of node.elseBranch) {
        statement.accept(this);
      }
    }
  }

  visitBinaryExpression(node: BinaryExpression): any {
    const left = node.left.accept(this);
    const right = node.right.accept(this);

    switch (node.operator.type) {
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" || typeof right === "string") {
          return this.stringify(left) + this.stringify(right);
        }
        throw new Error(`Cannot add ${typeof left} and ${typeof right}`);

      case TokenType.MINUS:
        this.checkNumberOperands(node.operator, left, right);
        return left - right;

      case TokenType.MULTIPLY:
        this.checkNumberOperands(node.operator, left, right);
        return left * right;

      case TokenType.DIVIDE:
        this.checkNumberOperands(node.operator, left, right);
        if (right === 0) throw new Error("Division by zero");
        return left / right;

      case TokenType.EQUAL:
        return this.isEqual(left, right);

      case TokenType.NOT_EQUAL:
        return !this.isEqual(left, right);

      default:
        throw new Error(`Unknown binary operator: ${node.operator.type}`);
    }
  }

  visitNumberLiteral(node: NumberLiteral): number {
    return node.value;
  }

  visitStringLiteral(node: StringLiteral): string {
    return node.value;
  }

  visitBooleanLiteral(node: BooleanLiteral): boolean {
    return node.value;
  }

  visitIdentifier(node: Identifier): any {
    if (this.environment.has(node.name)) {
      return this.environment.get(node.name);
    }
    throw new Error(`Undefined variable: ${node.name}`);
  }

  // Helper methods
  private isTruthy(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === "boolean") return value;
    return true;
  }

  private isEqual(a: any, b: any): boolean {
    return a === b;
  }

  private checkNumberOperands(operator: Token, left: any, right: any): void {
    if (typeof left !== "number" || typeof right !== "number") {
      throw new Error(`Operands must be numbers for ${operator.value}`);
    }
  }

  private stringify(value: any): string {
    if (value === null || value === undefined) return "nil";
    if (typeof value === "boolean") return value ? "đúng" : "sai";
    return value.toString();
  }
}
```

## Language Features

### Example Programs

```javascript
// Example 1: Basic arithmetic and variables
const example1 = `
gán a = 10
gán b = 20
gán sum = a + b
in (sum)  // Output: 30
`;

// Example 2: String operations
const example2 = `
gán firstName = "Nguyễn"
gán lastName = "Văn A"
gán fullName = firstName + " " + lastName
in (fullName)  // Output: Nguyễn Văn A
`;

// Example 3: Conditional statements
const example3 = `
gán age = 18
nếu (age >= 18) {
  in ("Đủ tuổi bầu cử")
} khác {
  in ("Chưa đủ tuổi bầu cử")
}
`;

// Example 4: Complex expressions
const example4 = `
gán x = 5
gán y = 3
gán result = (x + y) * 2 - 1
in (result)  // Output: 15
`;
```

### Error Handling

```typescript
class InterpreterError extends Error {
  constructor(message: string, public line?: number, public column?: number) {
    super(message);
    this.name = "InterpreterError";
  }
}

class RuntimeError extends InterpreterError {
  constructor(message: string, line?: number, column?: number) {
    super(`Runtime Error: ${message}`, line, column);
    this.name = "RuntimeError";
  }
}

class SyntaxError extends InterpreterError {
  constructor(message: string, line?: number, column?: number) {
    super(`Syntax Error: ${message}`, line, column);
    this.name = "SyntaxError";
  }
}

// Usage in interpreter
try {
  const result = interpreter.interpret(program);
  console.log("Output:", result.output.join("\n"));
} catch (error) {
  if (error instanceof InterpreterError) {
    console.error(`${error.name} at line ${error.line}: ${error.message}`);
  } else {
    console.error("Unexpected error:", error.message);
  }
}
```

## Implementation Details

### Memory Management

```typescript
class Environment {
  private variables: Map<string, any>;
  private parent: Environment | null;

  constructor(parent: Environment | null = null) {
    this.variables = new Map();
    this.parent = parent;
  }

  define(name: string, value: any): void {
    this.variables.set(name, value);
  }

  get(name: string): any {
    if (this.variables.has(name)) {
      return this.variables.get(name);
    }

    if (this.parent) {
      return this.parent.get(name);
    }

    throw new RuntimeError(`Undefined variable: ${name}`);
  }

  set(name: string, value: any): void {
    if (this.variables.has(name)) {
      this.variables.set(name, value);
      return;
    }

    if (this.parent) {
      this.parent.set(name, value);
      return;
    }

    throw new RuntimeError(`Undefined variable: ${name}`);
  }
}
```

### Performance Optimization

```typescript
class OptimizedInterpreter extends Interpreter {
  private cache: Map<string, any>;

  constructor() {
    super();
    this.cache = new Map();
  }

  // Memoization for repeated expressions
  private memoize(key: string, computation: () => any): any {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const result = computation();
    this.cache.set(key, result);
    return result;
  }

  // Optimized binary expression evaluation
  visitBinaryExpression(node: BinaryExpression): any {
    const cacheKey = `${node.left.constructor.name}_${node.operator.value}_${node.right.constructor.name}`;

    return this.memoize(cacheKey, () => {
      return super.visitBinaryExpression(node);
    });
  }
}
```

## Browser Integration

### Web Integration Layer

```typescript
// Browser-specific interpreter wrapper
class BrowserInterpreter {
  private interpreter: Interpreter;
  private outputElement: HTMLElement;

  constructor(outputElementId: string) {
    this.interpreter = new Interpreter();
    this.outputElement = document.getElementById(outputElementId)!;
  }

  public execute(code: string): void {
    try {
      // Clear previous output
      this.outputElement.innerHTML = "";

      // Lexical analysis
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      // Parsing
      const parser = new Parser(tokens);
      const program = parser.parse();

      // Execution
      const result = this.interpreter.interpret(program);

      // Display output
      this.displayOutput(result.output);
      this.displayEnvironment(result.environment);
    } catch (error) {
      this.displayError(error);
    }
  }

  private displayOutput(output: string[]): void {
    const outputDiv = document.createElement("div");
    outputDiv.className = "interpreter-output";
    outputDiv.textContent = output.join("\n");
    this.outputElement.appendChild(outputDiv);
  }

  private displayEnvironment(env: Map<string, any>): void {
    const envDiv = document.createElement("div");
    envDiv.className = "interpreter-environment";

    const title = document.createElement("h4");
    title.textContent = "Variables:";
    envDiv.appendChild(title);

    env.forEach((value, name) => {
      const varDiv = document.createElement("div");
      varDiv.textContent = `${name}: ${value}`;
      envDiv.appendChild(varDiv);
    });

    this.outputElement.appendChild(envDiv);
  }

  private displayError(error: any): void {
    const errorDiv = document.createElement("div");
    errorDiv.className = "interpreter-error";
    errorDiv.textContent = error.message;
    this.outputElement.appendChild(errorDiv);
  }
}

// Usage in React component
const InterpreterComponent: React.FC = () => {
  const [code, setCode] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const interpreterRef = useRef<BrowserInterpreter>();

  useEffect(() => {
    if (outputRef.current) {
      interpreterRef.current = new BrowserInterpreter(outputRef.current.id);
    }
  }, []);

  const handleExecute = () => {
    if (interpreterRef.current) {
      interpreterRef.current.execute(code);
    }
  };

  return (
    <div className="interpreter-container">
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Nhập mã Vietnamese ở đây..."
        className="code-editor"
      />
      <button onClick={handleExecute}>Chạy mã</button>
      <div
        id="interpreter-output"
        ref={outputRef}
        className="output-container"
      />
    </div>
  );
};
```

## Best Practices

### Code Organization

```typescript
// Modular interpreter design
interface InterpreterModule {
  name: string;
  version: string;
  dependencies: string[];
}

class ModularInterpreter {
  private modules: Map<string, InterpreterModule>;
  private lexer: Lexer;
  private parser: Parser;
  private interpreter: Interpreter;

  constructor() {
    this.modules = new Map();
    this.initializeCore();
  }

  private initializeCore(): void {
    this.lexer = new Lexer("");
    this.parser = new Parser([]);
    this.interpreter = new Interpreter();
  }

  public registerModule(module: InterpreterModule): void {
    this.modules.set(module.name, module);
  }

  public execute(code: string, options: { debug?: boolean } = {}): any {
    if (options.debug) {
      console.log("Executing code:", code);
    }

    const tokens = this.lexer.tokenize();
    const ast = this.parser.parse();
    const result = this.interpreter.interpret(ast);

    return result;
  }
}
```

### Testing Strategy

```typescript
// Unit tests for interpreter components
describe("Vietnamese Interpreter", () => {
  let interpreter: Interpreter;

  beforeEach(() => {
    interpreter = new Interpreter();
  });

  test("should handle basic arithmetic", () => {
    const code = "gán result = 10 + 5\nin (result)";
    const result = interpreter.execute(code);
    expect(result.output).toContain("15");
  });

  test("should handle string concatenation", () => {
    const code = 'gán greeting = "Xin " + "chào"\nin (greeting)';
    const result = interpreter.execute(code);
    expect(result.output).toContain("Xin chào");
  });

  test("should handle conditional statements", () => {
    const code = `
      gán age = 20
      nếu (age >= 18) {
        in ("Người lớn")
      } khác {
        in ("Trẻ em")
      }
    `;
    const result = interpreter.execute(code);
    expect(result.output).toContain("Người lớn");
  });
});
```

## Conclusion

The Simple Interpreter project demonstrates the complete process of building a programming language interpreter from scratch. By implementing lexical analysis, parsing, and execution phases, this project showcases how to create a functional programming language with Vietnamese keywords that runs entirely in the browser.

### Key Achievements

1. **Complete Interpreter Pipeline**: Lexer → Parser → AST → Interpreter
2. **Vietnamese Language Support**: Localized keywords and error messages
3. **Browser Integration**: Client-side execution with real-time feedback
4. **Educational Value**: Clear demonstration of interpreter construction principles
5. **Extensible Architecture**: Modular design for adding new language features

### Technical Highlights

- **TypeScript Implementation**: Type-safe interpreter with excellent developer experience
- **Visitor Pattern**: Clean AST traversal and evaluation
- **Error Handling**: Comprehensive error reporting with line/column information
- **Performance Optimization**: Memoization and efficient parsing strategies
- **Web Integration**: Seamless browser execution without server dependencies

As shown in the [newbie-interpreter repository](https://github.com/binhphanhai/newbie-interpreter), this project serves as an excellent foundation for understanding interpreter design and implementation, while providing a practical tool for Vietnamese-speaking developers to learn programming concepts in their native language.

### Further Development

- **Function Definitions**: Add support for user-defined functions
- **Loop Constructs**: Implement `lặp` (loop) statements
- **Array Operations**: Support for list data structures
- **Module System**: Import/export functionality
- **Standard Library**: Built-in functions for common operations

The project demonstrates that building a programming language interpreter is an achievable goal with proper architectural design and systematic implementation of each component.
