# Simple Interpreter: Vietnamese Programming Language Cheatsheet

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

- Vietnamese programming language interpreter (Next.js + TypeScript)
- Runs fully in browser (client-side)
- Based on [newbie-interpreter GitHub](https://github.com/binhphanhai/newbie-interpreter)
- Features: interactive code editor, real-time execution
- Goals:
  - Educational: Show interpreter construction
  - Accessible: Vietnamese keywords
  - Interactive: Real-time browser execution
  - Portable: No server needed

## Project Overview

### Technology Stack
- Next.js + TypeScript frontend
- React components + CSS modules
- Static export (GitHub Pages)
- Interpreter core:
  - Lexer: TypeScript tokenization
  - Parser: Recursive descent
  - AST: Abstract Syntax Tree
  - Executor: Tree-walking interpreter

```javascript
// Project configuration from package.json perspective
// This object maps out the entire technical ecosystem of the interpreter
const projectStack = {
  // Frontend framework choice - Next.js provides excellent developer experience
  // with built-in TypeScript support and optimized bundling
  frontend: "Next.js with TypeScript",

  // UI layer - React components with CSS modules for scoped styling
  // CSS modules prevent style conflicts and improve maintainability
  ui: "React components with CSS modules",

  // Deployment strategy - Static export enables hosting on GitHub Pages
  // No server required, making the interpreter fully client-side
  deployment: "Static export for GitHub Pages",

  // Core interpreter components - each serves a specific role in the compilation pipeline
  interpreter: {
    // Lexer: Converts raw text into meaningful tokens (words, operators, etc.)
    lexer: "TypeScript-based tokenization",

    // Parser: Builds a tree structure (AST) from the stream of tokens
    // Uses recursive descent parsing for readable and maintainable code
    parser: "Recursive descent parser",

    // AST: Intermediate representation that captures program structure
    // Makes it easy to traverse and manipulate the program before execution
    ast: "Abstract Syntax Tree representation",

    // Executor: Walks through the AST and actually runs the program
    // Tree-walking is simple to implement and debug
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
- 1. Lexical Analysis: Text → Tokens
- 2. Syntax Analysis: Tokens → AST
- 3. Execution: AST → Results
- Input: Vietnamese code string (e.g. "gán a = 10")
- Output: Program output + variable states

```javascript
// Simplified interpreter pipeline
// This class orchestrates the entire interpretation process from source code to execution
class InterpreterPipeline {
  constructor() {
    // Initialize the three core components of the interpreter
    // Each component handles a specific phase of the compilation process
    this.lexer = new Lexer(); // Phase 1: Text → Tokens
    this.parser = new Parser(); // Phase 2: Tokens → AST
    this.interpreter = new Interpreter(); // Phase 3: AST → Results
  }

  execute(sourceCode) {
    // Phase 1: Lexical Analysis (Text → Tokens)
    // Convert raw Vietnamese text into a stream of meaningful tokens
    // Example: "gán a = 10" becomes [GAN, IDENTIFIER(a), ASSIGN, NUMBER(10)]
    const tokens = this.lexer.tokenize(sourceCode);

    // Phase 2: Syntax Analysis (Tokens → AST)
    // Build an Abstract Syntax Tree that represents the program's structure
    // This validates syntax and creates a tree-like representation of the code
    const ast = this.parser.parse(tokens);

    // Phase 3: Execution (AST → Result)
    // Walk through the AST and actually execute the program
    // Variables are stored, expressions are evaluated, and output is generated
    const result = this.interpreter.evaluate(ast);

    return result;
  }
}

// Example Vietnamese code execution
// This demonstrates a simple program with variable assignment and arithmetic
const code = `
gán a = 10    // Assign value 10 to variable 'a'
gán b = 20    // Assign value 20 to variable 'b'
in (a + b)    // Print the sum of a and b (should output 30)
`;

// Create interpreter instance and execute the Vietnamese code
const interpreter = new InterpreterPipeline();
const output = interpreter.execute(code); // → 30

// The execution flow:
// 1. Lexer converts text into tokens: [GAN, IDENTIFIER(a), ASSIGN, NUMBER(10), ...]
// 2. Parser builds AST with assignment and print statement nodes
// 3. Interpreter executes: creates variables a=10, b=20, then prints 30
```

### Component Relationships
- Data flow: Source code → Lexer → Parser → Interpreter
- Lexer: Text → Token stream (keywords, operators, etc.)
- Parser: Token stream → AST (program structure)
- Interpreter: AST → Execution result (output, variables)

```javascript
// Interpreter component architecture
// This object defines the clear separation of concerns and data flow between components
const interpreterArchitecture = {
  // Starting point: Vietnamese source code as plain text
  input: "Vietnamese source code",

  // LEXER COMPONENT: First phase of interpretation
  lexer: {
    // Takes raw Vietnamese text character by character
    input: "Raw text",

    // Produces a sequence of tokens (keywords, operators, literals, etc.)
    // Example: "gán x = 5" → [GAN_TOKEN, IDENTIFIER_TOKEN(x), ASSIGN_TOKEN, NUMBER_TOKEN(5)]
    output: "Token stream",

    // Primary job: Convert text into meaningful symbols that the parser can understand
    // Handles: keyword recognition, string parsing, number parsing, operator detection
    responsibility: "Character-by-character analysis",
  },

  // PARSER COMPONENT: Second phase of interpretation
  parser: {
    // Consumes the stream of tokens produced by the lexer
    input: "Token stream",

    // Builds a hierarchical tree structure representing program logic
    // Each node represents a language construct (statement, expression, etc.)
    output: "Abstract Syntax Tree",

    // Primary job: Ensure syntax is correct and build meaningful program structure
    // Handles: Grammar validation, precedence rules, AST node creation
    responsibility: "Syntax validation and structure building",
  },

  // INTERPRETER COMPONENT: Third phase of interpretation
  interpreter: {
    // Works with the structured AST built by the parser
    input: "Abstract Syntax Tree",

    // Produces actual program results: printed output, variable values, etc.
    // Example: Final result might be { output: ["30"], variables: {a: 10, b: 20} }
    output: "Execution result",

    // Primary job: Actually run the program by walking through the AST
    // Handles: Variable storage, expression evaluation, statement execution
    responsibility: "Tree traversal and evaluation",
  },
};
```

## Lexical Analysis (Tokenization)

### Token Definition System
- Enum for all token types (literals, identifiers, keywords, operators, delimiters, special)
- Token interface: type, value, line, column
- Example: "gán x = 10" → [GAN, IDENTIFIER(x), ASSIGN, NUMBER(10)]

```typescript
// Token types for Vietnamese programming language
// This enum defines every possible type of token our lexer can recognize
enum TokenType {
  // LITERALS: Raw values that appear directly in code
  NUMBER = "NUMBER", // Numeric literals: 42, 3.14, -7
  STRING = "STRING", // Text literals: "Xin chào", "Hello World"
  BOOLEAN = "BOOLEAN", // Boolean literals: đúng (true), sai (false)

  // IDENTIFIERS: User-defined names for variables, functions, etc.
  IDENTIFIER = "IDENTIFIER", // Variable names: myVar, userName, tổng

  // KEYWORDS (Vietnamese): Reserved words that have special meaning
  GAN = "GAN", // gán (assign) - for variable assignment
  NEU = "NEU", // nếu (if) - conditional statements
  KHAC = "KHAC", // khác (else) - alternative branch in conditionals
  LAP = "LAP", // lặp (loop) - for iteration constructs
  HAM = "HAM", // hàm (function) - function definitions
  TRA_VE = "TRA_VE", // trả về (return) - return statements
  IN = "IN", // in (print) - output statements

  // OPERATORS: Symbols that perform operations on values
  PLUS = "PLUS", // + (addition or string concatenation)
  MINUS = "MINUS", // - (subtraction or negation)
  MULTIPLY = "MULTIPLY", // * (multiplication)
  DIVIDE = "DIVIDE", // / (division)
  ASSIGN = "ASSIGN", // = (assignment operator)
  EQUAL = "EQUAL", // == (equality comparison)
  NOT_EQUAL = "NOT_EQUAL", // != (inequality comparison)

  // DELIMITERS: Symbols that structure and separate code elements
  LPAREN = "LPAREN", // ( (left parenthesis - grouping, function calls)
  RPAREN = "RPAREN", // ) (right parenthesis)
  LBRACE = "LBRACE", // { (left brace - code blocks)
  RBRACE = "RBRACE", // } (right brace)
  SEMICOLON = "SEMICOLON", // ; (statement terminator)
  NEWLINE = "NEWLINE", // \n (line breaks - statement separators)

  // SPECIAL: Control tokens for parsing state
  EOF = "EOF", // End of file marker - signals completion
}

// Token interface: Structure that holds token information
// Every token created by the lexer must conform to this interface
interface Token {
  type: TokenType; // What kind of token this is (from enum above)
  value: string; // The actual text content (e.g., "gán", "42", "myVar")
  line: number; // Line number where token appears (1-based)
  column: number; // Column position where token starts (1-based)
}

// Example tokens that would be created:
// Input: "gán x = 10"
// Tokens: [
//   { type: TokenType.GAN, value: "gán", line: 1, column: 1 },
//   { type: TokenType.IDENTIFIER, value: "x", line: 1, column: 5 },
//   { type: TokenType.ASSIGN, value: "=", line: 1, column: 7 },
//   { type: TokenType.NUMBER, value: "10", line: 1, column: 9 }
// ]
```

### Lexer Implementation
- Converts Vietnamese code to tokens (character by character)
- Tracks line/column for errors
- Handles Unicode, escape sequences, whitespace, comments, lookahead

```typescript
class Lexer {
  // Core state variables for tracking position in the source code
  private text: string; // The complete source code being tokenized
  private position: number; // Current character index (0-based)
  private currentChar: string | null; // Character at current position (null if EOF)
  private line: number; // Current line number (1-based for human-readable errors)
  private column: number; // Current column position (1-based)

  constructor(text: string) {
    // Initialize lexer with source code
    this.text = text;
    this.position = 0;

    // Set current character to first character, or null if empty string
    this.currentChar = this.text[0] || null;

    // Start position tracking at line 1, column 1 (human-readable coordinates)
    this.line = 1;
    this.column = 1;
  }

  // CHARACTER NAVIGATION METHODS
  // These methods handle moving through the source code while maintaining position tracking

  private advance(): void {
    // Move to the next character in the source code
    // This method is crucial for maintaining accurate line/column tracking

    if (this.currentChar === "\n") {
      // When encountering a newline, increment line and reset column
      this.line++;
      this.column = 1;
    } else {
      // For any other character, just move to the next column
      this.column++;
    }

    // Move to next position in the source code
    this.position++;

    // Update currentChar to the new character, or null if we've reached the end
    this.currentChar =
      this.position < this.text.length ? this.text[this.position] : null;
  }

  private peek(): string | null {
    // Look at the next character without advancing position
    // This is essential for recognizing multi-character operators like "==" and "!="
    const peekPos = this.position + 1;
    return peekPos < this.text.length ? this.text[peekPos] : null;
  }

  // WHITESPACE AND COMMENT HANDLING
  // These methods skip over characters that don't contribute to the program logic

  private skipWhitespace(): void {
    // Skip over spaces, tabs, and other whitespace characters
    // NOTE: We preserve newlines because they can be significant in our language
    while (
      this.currentChar &&
      /\s/.test(this.currentChar) && // Match any whitespace character
      this.currentChar !== "\n" // But preserve newlines for statement separation
    ) {
      this.advance();
    }
  }

  private skipComment(): void {
    // Handle single-line comments that start with "//"
    // Comments extend to the end of the line and are completely ignored
    if (this.currentChar === "/" && this.peek() === "/") {
      // Skip the entire comment line
      while (this.currentChar && this.currentChar !== "\n") {
        this.advance();
      }
      // Note: The newline character is left for the main tokenizer to handle
    }
  }

  // TOKEN CONSTRUCTION METHODS
  // These methods build specific types of tokens from character sequences

  private readNumber(): Token {
    // Parse numeric literals (integers and floating-point numbers)
    // Examples: 42, 3.14, 0, 999.999
    const start = { line: this.line, column: this.column };
    let value = "";

    // Keep reading digits and decimal points
    while (this.currentChar && /[\d.]/.test(this.currentChar)) {
      value += this.currentChar;
      this.advance();
    }

    // Return the complete number token with position information
    return {
      type: TokenType.NUMBER,
      value, // String representation: "42", "3.14"
      line: start.line, // Line where number starts
      column: start.column, // Column where number starts
    };
  }

  private readString(): Token {
    // Parse string literals enclosed in double quotes
    // Supports escape sequences for special characters
    // Examples: "Hello", "Xin chào", "Line 1\nLine 2"
    const start = { line: this.line, column: this.column };
    let value = "";

    this.advance(); // Skip opening quote character

    // Read characters until we find the closing quote
    while (this.currentChar && this.currentChar !== '"') {
      if (this.currentChar === "\\") {
        // Handle escape sequences (backslash followed by special character)
        this.advance(); // Skip the backslash

        // Process the escaped character
        switch (this.currentChar) {
          case "n":
            value += "\n"; // \n becomes actual newline
            break;
          case "t":
            value += "\t"; // \t becomes actual tab
            break;
          case "\\":
            value += "\\"; // \\ becomes single backslash
            break;
          case '"':
            value += '"'; // \" becomes literal quote mark
            break;
          default:
            // For unknown escape sequences, include the character as-is
            value += this.currentChar;
        }
      } else {
        // Regular character - add directly to string value
        value += this.currentChar;
      }
      this.advance();
    }

    this.advance(); // Skip closing quote character

    return {
      type: TokenType.STRING,
      value, // Processed string content (escape sequences resolved)
      line: start.line,
      column: start.column,
    };
  }

  private readIdentifier(): Token {
    // Parse identifiers and Vietnamese keywords
    // Supports Vietnamese Unicode characters, which is crucial for our language
    // Examples: myVar, userName, tổng, gán, nếu, khác
    const start = { line: this.line, column: this.column };
    let value = "";

    // Read all valid identifier characters
    // Regex includes: a-z, A-Z, Vietnamese characters (À-ỹ), digits (0-9), underscore (_)
    while (this.currentChar && /[a-zA-ZÀ-ỹ0-9_]/.test(this.currentChar)) {
      value += this.currentChar;
      this.advance();
    }

    // VIETNAMESE KEYWORD RECOGNITION
    // Check if the identifier is actually a reserved Vietnamese keyword
    const keywordMap = new Map([
      ["gán", TokenType.GAN], // Assignment keyword
      ["nếu", TokenType.NEU], // If conditional keyword
      ["khác", TokenType.KHAC], // Else keyword
      ["lặp", TokenType.LAP], // Loop keyword
      ["hàm", TokenType.HAM], // Function keyword
      ["trả_về", TokenType.TRA_VE], // Return keyword
      ["in", TokenType.IN], // Print/output keyword
      ["đúng", TokenType.BOOLEAN], // Boolean true keyword
      ["sai", TokenType.BOOLEAN], // Boolean false keyword
    ]);

    // Determine token type: keyword if found in map, otherwise it's an identifier
    const tokenType = keywordMap.get(value) || TokenType.IDENTIFIER;

    return {
      type: tokenType,
      value, // The actual text: "gán", "myVar", etc.
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
- AST = tree structure for program
- Node types: NumberLiteral, StringLiteral, BooleanLiteral, Identifier, BinaryExpression, AssignmentStatement, PrintStatement, IfStatement, Program
- Uses Visitor pattern for traversal

```typescript
// ABSTRACT BASE CLASS FOR ALL AST NODES
// This ensures all nodes can be visited by the interpreter using the visitor pattern
abstract class ASTNode {
  // Every AST node must implement the accept method for visitor pattern
  // This allows different visitors (interpreter, pretty-printer, etc.) to process nodes
  abstract accept<T>(visitor: ASTVisitor<T>): T;
}

// EXPRESSION NODES
// These represent values and computations that produce results

class NumberLiteral extends ASTNode {
  constructor(public value: number) {
    // Store the actual numeric value (e.g., 42, 3.14)
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    // Delegate to visitor's number literal handler
    return visitor.visitNumberLiteral(this);
  }
}

class StringLiteral extends ASTNode {
  constructor(public value: string) {
    // Store string content (e.g., "Hello", "Xin chào")
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitStringLiteral(this);
  }
}

class BooleanLiteral extends ASTNode {
  constructor(public value: boolean) {
    // Store true/false value (đúng/sai in Vietnamese)
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitBooleanLiteral(this);
  }
}

class Identifier extends ASTNode {
  constructor(public name: string) {
    // Store variable name (e.g., "x", "userName", "tổng")
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitIdentifier(this);
  }
}

class BinaryExpression extends ASTNode {
  constructor(
    public left: ASTNode, // Left operand (can be any expression)
    public operator: Token, // Operator token (+, -, *, /, ==, !=)
    public right: ASTNode // Right operand (can be any expression)
  ) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitBinaryExpression(this);
  }
}

// STATEMENT NODES
// These represent actions or declarations that don't produce values directly

class AssignmentStatement extends ASTNode {
  constructor(
    public identifier: Identifier, // Variable being assigned to (e.g., "x", "sum")
    public value: ASTNode // Expression that produces the value to assign
  ) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitAssignmentStatement(this);
  }
}

class PrintStatement extends ASTNode {
  constructor(public expression: ASTNode) {
    // Expression to evaluate and print
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitPrintStatement(this);
  }
}

class IfStatement extends ASTNode {
  constructor(
    public condition: ASTNode, // Boolean expression to test
    public thenBranch: ASTNode[], // Statements to execute if condition is true
    public elseBranch?: ASTNode[] // Optional statements for else branch
  ) {
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitIfStatement(this);
  }
}

// ROOT NODE
// This represents the entire program as a sequence of statements
class Program extends ASTNode {
  constructor(public statements: ASTNode[]) {
    // All top-level statements in the program
    super();
  }

  accept<T>(visitor: ASTVisitor<T>): T {
    return visitor.visitProgram(this);
  }
}
```

### Parser Implementation
- Consumes tokens, builds AST
- Grammar: assignment, print, if/else, expressions, precedence
- Throws errors for unexpected tokens

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
- Interpreter implements ASTVisitor
- Walks AST, evaluates nodes
- Handles: assignment, print, if/else, binary ops, literals, identifiers
- Helper: isTruthy, isEqual, checkNumberOperands, stringify

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
- Example 1: Arithmetic, variables
- Example 2: String operations, concatenation
- Example 3: If/else with Vietnamese keywords
- Example 4: Operator precedence, parentheses

```javascript
// EXAMPLE 1: Basic arithmetic and variables
// This example demonstrates variable assignment and arithmetic operations
// Execution flow: create variables → perform calculation → store result → print output
const example1 = `
gán a = 10        // Assign 10 to variable 'a'
gán b = 20        // Assign 20 to variable 'b'  
gán sum = a + b   // Calculate sum: 10 + 20 = 30, assign to 'sum'
in (sum)          // Print the value of sum
`;
// Expected output: 30
// Variables after execution: {a: 10, b: 20, sum: 30}

// EXAMPLE 2: String operations and concatenation
// Shows how strings work with Vietnamese text and concatenation operator
const example2 = `
gán firstName = "Nguyễn"               // Vietnamese first name
gán lastName = "Văn A"                 // Vietnamese last name
gán fullName = firstName + " " + lastName  // Concatenate with space
in (fullName)                          // Print complete name
`;
// Expected output: "Nguyễn Văn A"
// Demonstrates: String literals, concatenation, Vietnamese Unicode support

// EXAMPLE 3: Conditional statements with Vietnamese keywords
// Shows if-else logic using Vietnamese conditional keywords
const example3 = `
gán age = 18                    // Set age variable
nếu (age >= 18) {              // If age is 18 or greater
  in ("Đủ tuổi bầu cử")        // Print voting age message
} khác {                       // Else (otherwise)
  in ("Chưa đủ tuổi bầu cử")   // Print underage message  
}
`;
// Expected output: "Đủ tuổi bầu cử" (Old enough to vote)
// Shows: Comparison operators, conditional branching, Vietnamese text output

// EXAMPLE 4: Complex expressions with operator precedence
// Demonstrates arithmetic operator precedence and parentheses grouping
const example4 = `
gán x = 5                          // Base value
gán y = 3                          // Second value
gán result = (x + y) * 2 - 1       // Complex calculation with precedence
in (result)                        // Print final result
`;
// Expected output: 15
// Calculation breakdown: (5 + 3) * 2 - 1 = 8 * 2 - 1 = 16 - 1 = 15
// Shows: Operator precedence, parentheses grouping, multi-step calculations
```

### Error Handling
- Hierarchical error system: InterpreterError (base), RuntimeError, SyntaxError
- Tracks line/column for precise messages
- Usage: try/catch, print error with location
- Common errors: undefined variable, division by zero, type mismatch, syntax issues

```typescript
// BASE ERROR CLASS
// All interpreter errors inherit from this class to provide consistent error handling
class InterpreterError extends Error {
  constructor(
    message: string, // Human-readable error description
    public line?: number, // Line number where error occurred (optional)
    public column?: number // Column position where error occurred (optional)
  ) {
    super(message);
    this.name = "InterpreterError";
  }
}

// RUNTIME ERROR CLASS
// Errors that occur during program execution (division by zero, undefined variables, etc.)
class RuntimeError extends InterpreterError {
  constructor(message: string, line?: number, column?: number) {
    super(`Runtime Error: ${message}`, line, column);
    this.name = "RuntimeError";
  }
}

// SYNTAX ERROR CLASS
// Errors in program structure detected during parsing phase
class SyntaxError extends InterpreterError {
  constructor(message: string, line?: number, column?: number) {
    super(`Syntax Error: ${message}`, line, column);
    this.name = "SyntaxError";
  }
}

// ERROR HANDLING IN PRACTICE
// This shows how to use the error system when executing Vietnamese code
try {
  // Attempt to interpret the Vietnamese program
  const result = interpreter.interpret(program);
  console.log("Output:", result.output.join("\n"));
} catch (error) {
  if (error instanceof InterpreterError) {
    // Handle known interpreter errors with detailed location info
    console.error(`${error.name} at line ${error.line}: ${error.message}`);

    // Example output: "Runtime Error at line 3: Undefined variable: tổng"
    // Example output: "Syntax Error at line 1: Expected ')' after expression"
  } else {
    // Handle unexpected system errors
    console.error("Unexpected error:", error.message);
  }
}

// COMMON ERROR SCENARIOS:
// 1. Runtime Errors:
//    - "Undefined variable: myVar" (using undefined variable)
//    - "Division by zero" (mathematical error)
//    - "Cannot add string and number" (type mismatch)
//
// 2. Syntax Errors:
//    - "Expected '=' after identifier" (missing assignment operator)
//    - "Unexpected token: }" (mismatched braces)
//    - "Expected ')' after expression" (unclosed parentheses)
```

## Implementation Details

### Memory Management
- Environment class: variable storage, supports parent scopes
- Methods: define, get, set

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
- OptimizedInterpreter: memoization for repeated expressions
- Caches results of binary expressions

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
- BrowserInterpreter: wraps core interpreter for web
- Handles DOM, error display, real-time feedback
- Methods: execute, displayOutput, displayEnvironment, displayError
- Example React component usage

```typescript
// BROWSER-SPECIFIC INTERPRETER WRAPPER
// This class bridges the gap between the core interpreter and web browser environment
class BrowserInterpreter {
  private interpreter: Interpreter; // Core interpreter instance
  private outputElement: HTMLElement; // DOM element for displaying results

  constructor(outputElementId: string) {
    // Initialize the core interpreter
    this.interpreter = new Interpreter();

    // Get reference to output DOM element (throws if not found)
    this.outputElement = document.getElementById(outputElementId)!;
  }

  public execute(code: string): void {
    try {
      // STEP 1: Clear previous execution results
      // This ensures clean state for each execution
      this.outputElement.innerHTML = "";

      // STEP 2: Lexical analysis - Convert text to tokens
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      // STEP 3: Parsing - Build Abstract Syntax Tree
      const parser = new Parser(tokens);
      const program = parser.parse();

      // STEP 4: Execution - Run the program and collect results
      const result = this.interpreter.interpret(program);

      // STEP 5: Display results in web interface
      this.displayOutput(result.output); // Show program output
      this.displayEnvironment(result.environment); // Show variable states
    } catch (error) {
      // Handle and display any errors that occurred during execution
      this.displayError(error);
    }
  }

  // DISPLAY METHODS FOR WEB INTERFACE
  // These methods create DOM elements to show execution results to users

  private displayOutput(output: string[]): void {
    // Create a container for program output (from 'in' statements)
    const outputDiv = document.createElement("div");
    outputDiv.className = "interpreter-output";

    // Join all output lines with newlines for display
    outputDiv.textContent = output.join("\n");

    // Add to the main output container
    this.outputElement.appendChild(outputDiv);
  }

  private displayEnvironment(env: Map<string, any>): void {
    // Create a container to show current variable states
    const envDiv = document.createElement("div");
    envDiv.className = "interpreter-environment";

    // Add a title for the variables section
    const title = document.createElement("h4");
    title.textContent = "Variables:";
    envDiv.appendChild(title);

    // Display each variable and its current value
    env.forEach((value, name) => {
      const varDiv = document.createElement("div");
      varDiv.textContent = `${name}: ${value}`; // Format: "variableName: value"
      envDiv.appendChild(varDiv);
    });

    // Add the variables display to the main output
    this.outputElement.appendChild(envDiv);
  }

  private displayError(error: any): void {
    // Create a container for error messages with distinct styling
    const errorDiv = document.createElement("div");
    errorDiv.className = "interpreter-error"; // CSS class for error styling (red text, etc.)

    // Display the error message
    errorDiv.textContent = error.message;

    // Add error to the output (errors are shown prominently)
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
- Modular interpreter design: InterpreterModule, ModularInterpreter
- Register modules, execute code, debug option

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
- Unit tests for interpreter: arithmetic, string concat, conditionals

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

- Full interpreter pipeline: Lexer → Parser → AST → Interpreter
- Vietnamese keywords, localized errors
- Browser-based, real-time feedback
- Modular, extensible, educational
- TypeScript, Visitor pattern, error handling, memoization
- See [newbie-interpreter repo](https://github.com/binhphanhai/newbie-interpreter) for more
- Further: functions, loops, arrays, modules, stdlib
