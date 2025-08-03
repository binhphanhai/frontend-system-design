# Basic React Concepts for Interviews

*Get familiar with core React concepts – components, JSX, props, state, and rendering*

---

---

On this page, we'll break down fundamental React topics – components, props, state, and the render cycle.

---

## Components
At its core, React is built around **components**. Components are the foundation of modern UI development because they make interfaces modular, reusable, and scalable.

**Why components?**
- **Reusability:** Encapsulate UI logic and styling, making it easy to reuse across different parts of an application. Reduces redundancy and improves maintainability.
- **Modularity:** Encourage breaking down complex UIs into smaller, manageable parts. Each component focuses on specific functionality, making debugging and updates easier.
- **Maintainability:** Changes to a component affect only that component and its children, reducing unintended side effects. Code is easier to read and understand, improving long-term maintainability.
- **Declarative UI:** React uses a declarative approach, where the UI reflects the current application state. This makes UI development more predictable and easier to debug compared to imperative approaches.
- **Encapsulation:** Components encapsulate their styles, logic, and structure, preventing conflicts and making the UI more modular. Components manage their own state, making it easier to reason about UI behavior. When paired with encapsulated styles (e.g., CSS Modules, Styled Components), this prevents unintended overrides and enables scalable architectures.
- **Composition:** Components can be composed together to build complex UIs from smaller building blocks.
- **Easier testing:** The encapsulated nature of components makes them easily testable in isolation using unit and integration tests.

Components have revolutionized UI development by making it more scalable, maintainable, predictable, and efficient. Every modern JavaScript framework is built on the concept of components, props, and state.

Just like how programs are built from stacks of function calls, modern apps are built using components nested within components, as deeply as the app requires.

> Even mobile development has adopted the component model: iOS (Swift UI) and Android (Jetpack Compose) are "React-like".

---

## Ways of Writing React Components
There are two ways of writing React components:

### Function Components (Modern Standard)
The modern recommended way is to write JavaScript functions that return JSX. React hooks (e.g. `useState`, `useEffect`, etc.) were introduced in React 16.8 and are used for state and side effects. Prior to hooks, function components could only be used for stateless components.

Function components require less boilerplate and are preferred over class components.

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

### Class Components (Legacy)
The legacy way of writing components uses ES6 classes that extend `React.Component`. These class components use lifecycle methods (e.g. `componentDidMount()`, `componentDidUpdate()`) instead of hooks. This was the approach taken when React was first released and still appears in older codebases.

Class components can still be used in the latest React versions.

```jsx
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}
```

Although class components can still be asked in interviews, you shouldn't be faulted for not having experience with class components since it has been over half a decade that function components have been the de facto way of writing components. If you haven't used class components before, there's no need to learn about it and you can just tell your interviewer.

---

## JSX
The HTML-like syntax (`<h1>`) within the components looks like HTML but is not actually HTML, it's JSX. JSX (JavaScript XML) is a syntax extension for JavaScript that allows you to write HTML-like code within JavaScript. It is not a requirement for React but is widely used because it makes UI code more readable and expressive.

JSX provides a more intuitive and ergonomic way to define React components by visually structuring the UI. Browsers do not actually recognize JSX syntax, so compilers like [Babel](https://babeljs.io/) or [TypeScript Compiler](https://www.typescriptlang.org/tsconfig/#jsx) are needed to convert the JSX syntax into something that browsers can recognize before the code the browser runs it. Under the hood, JSX is transformed into `React.createElement()` function calls (the exact function can be configured by the compiler).

To produce the following HTML:
```html
<div>
  <h1>Hello world!</h1>
  <p>Goodbye earth!</p>
</div>
```
Without JSX, using `React.createElement()` function calls:
```js
const element = React.createElement('div', null, [
  React.createElement('h1', null, 'Hello world!'),
  React.createElement('p', null, 'Goodbye earth!'),
]);
```
With JSX, it is easier to read and write markup:
```jsx
const element = (
  <div>
    <h1>Hello world!</h1>
    <p>Goodbye earth!</p>
  </div>
);
```
This looks almost exactly like the HTML that it is meant to produce! Instead of writing complex `React.createElement()` calls, JSX allows you to write components in a simpler way.

Under the hood, `React.createElement()` creates a lightweight representation of the UI and displays it in the browser using DOM APIs like `document.createElement()`, `document.appendChild()`. This process will be covered in more detail in the [Rendering section](#rendering).

**Key points:**
- JSX is syntactic sugar for `React.createElement()` and converted before running in the browser
- Components must return a single root element
- JavaScript can be written inside JSX using curly braces (`{}`)
- Know the differences between JSX and HTML (className, style, self-closing tags, etc.)

---

## Props vs State
Props and state are data used by the components when rendering.

### Props
Props is short for "properties" and represents the data that a component receives from its parents. Props are analogous to a function's parameters.
- Passed from parent to child
- Immutable (cannot be modified by the component receiving them)
- Used for configuration and data sharing

```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```
Further reading: [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)

### State
State can be viewed as the "memory" of a component instance. Each component instance's state is isolated and cannot be directly modified from external.
- Managed within the component
- Triggers a re-render when updated

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```
Further reading: [State: A Component's Memory](https://react.dev/learn/state-a-components-memory)

---

## Rendering
Traditionally, rendering in the context of the browser is the process by which a web browser takes the raw code of a webpage – primarily HTML, CSS, and JavaScript – and converts it into the visual, interactive page you see on your screen. However, React also uses the term "rendering" to describe how React converts components into actual DOM elements to be shown on the screen.

To avoid confusion, in this guide, "rendering" will refer to React's definition and "browser rendering" will be referred to as "browser painting".

Rendering a component in React involves several steps, from writing JSX to updating the DOM. Below is a **detailed breakdown** of how React renders a component, including the internal processes and optimizations.

### 1. JSX transformation to JavaScript
React components are written using **JSX (JavaScript XML)**, which is syntactic sugar over `React.createElement`. JSX is not directly understood by the browser, hence JSX has to be compiled into JavaScript using compilers like Babel or TypeScript compiler.

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```
The JSX is transformed into `React.createElement` calls:
```js
function Greeting({ name }) {
  return React.createElement('h1', null, `Hello, ${name}!`);
}
```

### 2. `React.createElement()` generates a virtual DOM object
Once JSX is transformed, `React.createElement` produces a lightweight in-memory representation of the component called the **virtual DOM**.

```js
const vdom = {
  type: 'h1',
  props: { children: 'Hello, John!' },
};
```

### 3. React reconciles the virtual DOM
When a component is rendered for the first time:
1. React creates the initial virtual DOM
2. React then mounts the component into the actual DOM using DOM methods like `document.createElement()` and `document.appendChild()`

When a component's props or state changes, the component is re-rendered:
1. React creates a new virtual DOM tree
2. React compares the new virtual DOM tree with the previous virtual DOM
3. Only changed elements (added, removed, different HTML attributes) are updated in the real DOM. This is called reconciliation

### Recap
A React component does not directly modify the DOM. Instead:
1. JSX is compiled into `React.createElement()` calls
2. Virtual DOM is generated as a lightweight representation
3. During updates, React reconciles the new virtual DOM with the previous virtual DOM
4. Only the minimal, necessary updates are made to the real DOM

Further reading: [Render and Commit](https://react.dev/learn/render-and-commit)

---

## What You Need to Know for Interviews
- **Components:** Writing functional components, reading from props, and adding state
- **JSX:** What is JSX
- **Rendering:** How React renders components
- **Virtual DOM:** What virtual DOM is and what it is for
- **Reconciliation:** Be able to explain the reconciliation process

---

## Practice Questions
**Quiz:**
- [What is React? Describe the benefits of React](/questions/quiz/what-is-react-describe-the-benefits-of-react?framework=react&tab=quiz)
- [What is the difference between state and props in React?](/questions/quiz/what-is-the-difference-between-state-and-props-in-react?framework=react&tab=quiz)
- [What is the difference between React Node, React Element, and a React Component?](/questions/quiz/what-is-the-difference-between-react-node-react-element-and-a-react-component?framework=react&tab=quiz)
- [What is JSX and how does it work?](/questions/quiz/what-is-jsx-and-how-does-it-work?framework=react&tab=quiz)
- [What is the purpose of the `key` prop in React?](/questions/quiz/what-is-the-purpose-of-the-key-prop-in-react?framework=react&tab=quiz)
- [What is the consequence of using array indices as the value for `key`s in React?](/questions/quiz/what-is-the-consequence-of-using-array-indices-as-the-value-for-key-s-in-react?framework=react&tab=quiz)
- [What are React Fragments used for?](/questions/quiz/what-are-react-fragments-used-for?framework=react&tab=quiz)
- [What is React strict mode and what are its benefits?](/questions/quiz/what-is-react-strict-mode-and-what-are-its-benefits?framework=react&tab=quiz)
- [Explain one-way data flow of React and its benefits](/questions/quiz/explain-one-way-data-flow-of-react-and-its-benefits?framework=react&tab=quiz)
- [Explain what happens when `setState` is called in React](/questions/quiz/explain-what-happens-when-setstate-is-called-in-react?framework=react&tab=quiz)
- [Why does React recommend against mutating state?](/questions/quiz/why-does-react-recommend-against-mutating-state?framework=react&tab=quiz)
- [What does re-rendering mean in React?](/questions/quiz/what-does-re-rendering-mean-in-react?framework=react&tab=quiz)
- [What is virtual DOM in React?](/questions/quiz/what-is-virtual-dom-in-react?framework=react&tab=quiz)
- [How does virtual DOM in React work? What are its benefits and downsides?](/questions/quiz/how-does-virtual-dom-in-react-work-what-are-its-benefits-and-downsides?framework=react&tab=quiz)
- [What is React Fiber and how is it an improvement over the previous approach?](/questions/quiz/what-is-react-fiber-and-how-is-it-an-improvement-over-the-previous-approach?framework=react&tab=quiz)
- [What is reconciliation in React?](/questions/quiz/what-is-reconciliation-in-react?framework=react&tab=quiz)
- [What are some React anti-patterns?](/questions/quiz/what-are-some-react-anti-patterns?framework=react&tab=quiz)

**Coding:**
- [Counter](/questions/user-interface/counter/react?framework=react&tab=coding)
- [Holy Grail](/questions/user-interface/holy-grail/react?framework=react&tab=coding)