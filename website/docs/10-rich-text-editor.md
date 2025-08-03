# Rich Text Editor System Design

*System design interview question: Design an extensible rich text editor component that allows users to create and edit text with various formatting options.*

---

## Overview

Rich text editors (RTEs), or WYSIWYG editors, are complex UI components that allow users to format text visually, supporting features like bold, italics, headings, and more. They are used in products like Gmail, Facebook, Medium, and collaborative tools. This document provides a deep, technical dive into designing a modern, extensible, performant, and accessible rich text editor, using Meta's [Lexical](https://lexical.dev/) as a reference architecture, and covers all major and minor aspects of such a system.

---

## 1. Real-World Examples

- [Lexical](https://lexical.dev/)
- [Tiptap](https://tiptap.dev/)
- [Slate](http://slatejs.org/)
- [Quill](https://quilljs.com/)
- [Draft.js](https://draftjs.org/) (predecessor of Lexical)

---

## 2. Requirements Exploration

### Functional Requirements
- **Block formatting:** Headings, paragraphs, blockquotes
- **Inline formatting:** Bold, underline, italics
- **Media insertion:** (Optional) Images, videos, etc.
- **Keyboard shortcuts:** Copy, cut, paste, redo, undo, formatting
- **Customizability:** Theming, extensibility, custom nodes
- **Undo/redo:** Support for reverting and reapplying changes
- **Serialization:** Save/load content as JSON or HTML
- **Collaboration:** (Advanced) Real-time multi-user editing

### Non-Functional Requirements
- **Performance:** Instant updates, even for large documents
- **Cross-browser:** Consistent experience across browsers
- **Accessibility:** Keyboard navigation, screen reader support, ARIA
- **Security:** Prevent XSS and unsafe HTML
- **Internationalization:** RTL, IME support

---

## 3. Rendering Approaches

| Approach                | Rich Formatting | Cursors      | Implementation Effort | Cross-browser |
|-------------------------|----------------|-------------|----------------------|---------------|
| `<textarea>`            | No             | Supported   | N/A                  | Same          |
| DOM with fake cursors   | Supported      | Custom      | High                 | Same          |
| `contenteditable`       | Supported      | Supported   | Moderate             | Some diffs    |
| `<canvas>`              | Custom         | Custom      | Very high            | Same          |

### Comparison
- **`<textarea>`**: Only plain text, not suitable for rich formatting.
- **DOM with fake cursors**: Complex, must manually calculate cursor position/height.
- **`contenteditable`**: Best trade-off; supports native editing, cursors, and formatting, but has browser inconsistencies and security concerns (HTML storage).
- **`<canvas>`**: Full control, but must reimplement layout, selection, accessibility, and more. Used by Google Docs for performance and consistency.

> **Most modern RTEs use `contenteditable` as the foundation, patching its limitations with custom event handling and state management.**

---

## 4. Architecture / High-Level Design

![Rich text editor architecture](https://www.gfecdn.net/img/questions/rich-text-editor/rich-text-editor-architecture.png)

### Core Components
- **Editor Core**: Handles user events, state updates, and DOM reconciliation
- **Plugins**: Extend functionality (e.g., rich formatting, collaboration)
- **Node-based Content Model**: Tree structure for blocks and inlines
- **Toolbar**: UI for formatting actions
- **Listeners & Transforms**: Hooks for reacting to state changes and transforming content
- **Headless Mode**: Editor logic can run without a UI, useful for testing and server-side manipulation

---

## 5. Data Model

### Core Entities
- **Editor**: Manages state, selection, plugins, and DOM reference
- **EditorState**: Immutable snapshot of content and selection
- **EditorNode**: Base class for all content nodes
  - **ElementNode**: Can have children (e.g., paragraphs, headings)
  - **TextNode**: Leaf node, holds text and formatting
- **Selection**: Anchor/focus nodes and offsets, direction

#### Example (TypeScript)
```ts
interface Editor {
  rootElement: HTMLElement | null;
  editorState: EditorState;
  pendingEditorState: EditorState | null;
}

interface EditorState {
  nodes: EditorNodeMap;
  rootNodeKey: NodeKey;
  selection: EditorSelection | null;
}

type NodeKey = string;
type EditorNodeMap = Record<NodeKey, EditorNode>;

interface EditorNode {
  parent: NodeKey | null;
  prev: NodeKey | null;
  next: NodeKey | null;
}

interface ElementNode extends EditorNode {
  type: 'element';
  firstChild: NodeKey | null;
  lastChild: NodeKey | null;
}

interface TextNode extends EditorNode {
  type: 'text';
  text: string;
  format?: string[];
}

interface EditorSelection {
  anchorNode: EditorNode | null;
  anchorOffset: number;
  focusNode: EditorNode | null;
  focusOffset: number;
  type: 'caret' | 'range';
}
```

#### Content Tree Example
![Rich text editor tree](https://www.gfecdn.net/img/questions/rich-text-editor/rich-text-editor-tree.png)

#### NodeMap with Linked List Pointers
![Rich text editor linked list](https://www.gfecdn.net/img/questions/rich-text-editor/rich-text-editor-linked-list.png)

#### Formatting Example
```jsx
<TextNode text="Tarzan " format={['bold']} />
<TextNode text="and" format={['bold', 'underline']} />
<TextNode text=" Jane" format={['underline']} />
```

---

## 6. State Management & Update Flow

1. **User event** (input, keypress, toolbar click)
2. **Command dispatched** (e.g., FORMAT_TEXT)
3. **Clone state** (shallow copy of NodeMap)
4. **Modify state** (update nodes, mark dirty)
5. **Transforms** (run on dirty nodes)
6. **Reconciliation** (diff old/new state, update DOM minimally)
7. **Listeners** (notify plugins/UI)

> Lexical's reconciliation is similar to React's virtual DOM diffing, but is framework-agnostic.

#### Update Loop in Detail
- **Clone state:** Editor makes a shallow clone of the content state (NodeMap).
- **Process updates:** Callback modifies nodes, marks dirty, and can queue further updates.
- **Process transforms:** All registered transforms for dirty nodes are called.
- **Reconciliation:** Dirty nodes are diffed and DOM is updated minimally.
- **Listeners:** All registered listeners are called after update.

---

## 7. API & Extensibility

### Editor APIs
- `editor.update(fn)` – Update state via callback
- `editor.setEditorState(state)` – Replace state
- `editor.getEditorState()` / `editor.getEditorStateSerialized()` – Export state
- `editor.parseEditorState(serialized)` – Import state
- `editor.dispatchCommand(command, payload)` – Dispatch command
- `editor.registerCommand(command, callback, priority)` – Listen for commands
- `editor.registerUpdateListener(callback)` – Listen for updates
- `editor.registerNodeTransform(nodeType, callback)` – Listen for node changes
- `editor.getNodeByKey(key)` – Get node by key
- `editor.getElementByKey(key)` – Get DOM element for node

### Node APIs
- `getParent()`, `getNextSibling()`, `insertAfter()`, `isSelected()`, `getTextContent()`
- `ElementNode`: `getChildren()`, `getFirstChild()`, `getLastChild()`
- `TextNode`: `setTextContent()`, `setFormat()`, `getFormat()`

---

## 8. Plugins, Listeners, and Transforms

- **Plugins**: Combine commands, transforms, and custom nodes to add features (e.g., rich formatting, collaboration)
- **Listeners**: Register callbacks for updates or specific commands
- **Transforms**: Run on dirty nodes after updates, before reconciliation (e.g., auto-linking, hashtag detection)

#### Example: Bold Command
```js
editor.registerCommand('FORMAT_BOLD_COMMAND', (payload) => {
  // Custom code to handle bold formatting
  return true; // Stop propagation
});
```

#### Example: Transform
```js
editor.registerNodeTransform(TextNode, (textNode) => {
  if (textNode.getTextContent().includes('congratulations')) {
    textNode.setFormat('bold');
  }
});
```

---

## 9. Serialization & Undo/Redo

- **Serialization**: Each node implements `exportJSON()` and `importJSON()` for persistence and copy/paste.
- **Undo/Redo**: Two-stack model (undo/redo), with immutable EditorStates and structural sharing for efficiency.
- **Granularity**: Lexical coalesces continuous typing into single undo actions for usability and performance.
- **Structural sharing**: Only changed nodes are cloned, others are shared for memory efficiency.

---

## 10. Keyboard Shortcuts & Accessibility

- **Keyboard shortcuts**: Handled via `beforeinput` and `keydown` events, mapped to normalized commands (e.g., FORMAT_BOLD_COMMAND)
- **Accessibility**:
  - ARIA roles and properties (e.g., `role="textbox"`, `role="toolbar"`)
  - Logical tab order
  - Screen reader support
  - Visible focus indicators
  - Semantic HTML for content
  - Support for speech-to-text (e.g., Dragon NaturallySpeaking)

---

## 11. Theming & Customization

- **CSS**: Style output using standard CSS or scoped selectors
- **Theme object**: Map node types to CSS classes

```js
const theme = {
  heading: 'editor-heading',
  paragraph: 'editor-paragraph',
  text: 'editor-text',
};
```

---

## 12. Custom Nodes & Extensibility

- Extend base nodes to add new features (e.g., colored text, mentions, embeds)
- Register custom nodes in the editor's config

#### Example: ColoredTextNode
```js
export class ColoredNode extends TextNode {
  __color: string;
  constructor(text, color, key) {
    super(text, key);
    this.__color = color;
  }
  static getType() { return 'colored'; }
  static clone(node) { return new ColoredNode(node.__text, node.__color, node.__key); }
  createDOM(config) {
    const element = super.createDOM(config);
    element.style.color = this.__color;
    return element;
  }
  updateDOM(prevNode, dom, config) {
    if (prevNode.__color !== this.__color) {
      dom.style.color = this.__color;
    }
    return false;
  }
}
```

---

## 13. Performance Optimizations

- **Lightweight core**: Lexical is ~22kb min+gzip
- **Modular plugins**: Only load what you need
- **Lazy loading**: Defer plugin loading until needed
- **Efficient updates**: Immutable state, batched updates, minimal DOM changes
- **Efficient reconciliation**: Virtual DOM-like diffing
- **Efficient selection model**: Mirrors browser selection, supports anchor/focus, direction, and multi-range
- **Batching and coalescing**: Group related changes for performance

---

## 14. Internationalization (i18n)

- **RTL support**: Direction property on nodes, layout adapts for right-to-left languages
- **IME support**: Works with input method editors for complex scripts (Chinese, Japanese, Korean)
- **Locale-aware shortcuts**: Customizable keyboard shortcuts for different locales

---

## 15. Real-Time Collaboration (Advanced)

- **CRDT/OT**: Use Yjs or similar for conflict-free real-time editing
- **WebSockets**: For real-time updates
- **LexicalCollaborationPlugin**: Integrates Yjs with Lexical
- **Conflict resolution**: Handles simultaneous edits, merges changes
- **Undo/redo in collaboration**: Can be scoped to user or global

---

## 16. Deep Dives & Advanced Topics

### Model and State Design
- **Why not use DOM as state?**
  - No built-in undo/redo, hard to store extra fields, DOM is bloated, prone to tampering
- **Tree vs. Map+Linked List**
  - Map+linked list enables O(1) access, efficient cloning, and parent/child/sibling navigation

### Formatting Internals
- **Nested tags**: Many ways to represent formatting in HTML; Lexical uses flat TextNodes with format arrays for simplicity and efficient editing
- **Format ranges**: Alternative is to use start/end indices, but this complicates updates

### Selection State
- **Anchor/focus, direction**: Mirrors browser selection, supports forward/backward selection
- **Selection events**: Listens to `selectionchange`, keyboard, and mouse events

### Reconciliation
- **createDOM/updateDOM**: Each node implements methods for DOM creation and update
- **Diffing**: Only dirty nodes are updated, minimizing DOM changes

### Undo/Redo Internals
- **Stack-based**: Two stacks (undo/redo), pointer to current state
- **Structural sharing**: Only changed nodes are cloned, others are shared
- **Granularity**: Coalescing of typing, batching of actions

### Plugins, Listeners, and Commands
- **Commands**: Dispatched for user actions, can be intercepted and handled by plugins
- **Listeners**: Register for updates, can persist data, update UI, etc.
- **Transforms**: Efficiently update content in response to changes (e.g., auto-linking, hashtag detection)

### Serialization & Deserialization
- **exportJSON/importJSON**: Each node serializes/deserializes itself
- **exportDOM/importDOM**: For copy/paste between editors
- **Versioning**: Serialized state can include version for backward compatibility

### Accessibility
- **ARIA roles**: `role="textbox"`, `role="toolbar"`, etc.
- **Screen reader support**: Announces formatting, structure, and changes
- **Keyboard navigation**: Logical tab order, shortcuts for formatting and navigation
- **Visible focus**: All interactive elements have visible focus indicators
- **Semantic HTML**: Use of `<strong>`, `<em>`, `<ul>`, `<li>`, etc.
- **Speech-to-text**: Integration with tools like Dragon NaturallySpeaking

### Theming
- **CSS**: Style output using standard CSS or scoped selectors
- **Theme object**: Map node types to CSS classes

### Custom Nodes
- **Extendability**: Add new node types for custom features (mentions, embeds, etc.)
- **Registration**: Pass custom nodes to editor config

### Performance
- **Immutable state**: Enables efficient undo/redo and collaboration
- **Batching**: Group related changes
- **Lazy loading**: Load plugins/features on demand
- **Efficient reconciliation**: Only update what changed

### Internationalization
- **RTL/IME**: Full support for right-to-left and complex input
- **Locale-aware**: Customizable for different languages and regions

### Real-Time Collaboration
- **CRDT/OT**: Conflict-free, real-time editing
- **WebSockets**: Real-time updates
- **Undo/redo**: Per-user or global

---

## 17. References & Further Reading

- [Lexical Documentation](https://lexical.dev/)
- [Slate.js Docs](https://docs.slatejs.org/)
- [Why ContentEditable is Terrible (Medium)](https://medium.engineering/why-contenteditable-is-terrible-122d8a40e480)
- [Rethinking Rich Text: A Deep Dive Into the Design of Lexical (YouTube)](https://www.youtube.com/watch?v=EwoS0dIx_OI)
- [Lexical API Docs](https://lexical.dev/docs/api/classes/lexical.LexicalNode)

---

This document provides a comprehensive, technical overview of the design and implementation of a modern, extensible, and performant rich text editor. It covers architectural decisions, data modeling, update flows, extensibility, accessibility, and real-world trade-offs, serving as a reference for advanced system design interviews and real-world implementations.