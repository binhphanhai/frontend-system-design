# JavaScript Coding Interviews

*Question types to expect, important concepts to know, and top practice questions to do*


---

## What Makes JavaScript Coding Interviews Unique?

The difference between JavaScript coding questions and algorithmic coding questions is that the former is usually specific to the front end domain and it makes the most sense to use JavaScript (or [TypeScript](https://www.typescriptlang.org/)) to complete them. You will also probably need to make use of browser/JavaScript-specific APIs and/or utilize HTML/CSS/JavaScript knowledge.

These JavaScript coding questions tend to be practical in nature and can come in one or more of the following categories:

1. Implement standard built-in classes or methods in the JavaScript language
2. Implement a utility function/class commonly found in popular libraries

---

## Examples

### JavaScript Standard Built-in Classes/Methods

It may seem redundant to implement standard classes/methods when they are already part of the language. However, browser inconsistencies used to be a rampant problem and some language APIs are not found in older browsers. Hence, developers had to resort to polyfilling—the act of providing modern functionality on older browsers that do not natively support it by implementing these APIs in downloaded JavaScript. Being able to implement these native functions also shows good understanding of front end fundamentals.

- **`Array` methods**: [`Array.prototype.map`](/questions/javascript/array-map), [`Array.prototype.reduce`](/questions/javascript/array-reduce), [`Array.prototype.filter`](/questions/javascript/array-filter)
- **`Promise` and related functions**: [`Promise.all`](/questions/javascript/promise-all), [`Promise.any`](/questions/javascript/promise-any)
- **DOM methods**: [`document.getElementsByTagName`](/questions/javascript/get-elements-by-tag-name), [`document.getElementsByClassName`](/questions/javascript/get-elements-by-class-name)

> There's more to these functions than meets the eye. For example, with `Array.prototype.map`:
> 1. It passes 4 arguments to the callback, including the `index` and `this`.
> 2. It keeps the "holes" in sparse arrays, e.g. `[1, 2, , 4].map(val => val * val) === [1, 4, , 16]`.
> 3. The range of elements processed by `map` is set before the first call to `callbackfn`. Elements appended after the call to `map` begins will not be visited. If existing elements are changed, their value as passed to `callbackfn` will be the value at the time `map` visits them; elements deleted after the call to `map` begins and before being visited are not visited. [See the ECMAScript specification](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.map).
>
> Your implementation doesn't have to handle all of these cases, especially the array mutation one. However, it's a positive signal if you mention these cases. The closer your implementation is to the specification, the more senior/experienced you will appear to be.

### Utility Function/Class from Popular Libraries

These functions/classes are commonly needed when building software with JavaScript but aren't in the standard language (for now).

- **Lodash/Underscore functions**: [`debounce`](/questions/javascript/debounce), [`throttle`](/questions/javascript/throttle), [`flatten`](/questions/javascript/flatten), [`curry`](/questions/javascript/curry), [`cloneDeep`](/questions/javascript/deep-clone)
- **jQuery methods**: [`jQuery.css`](/questions/javascript/jquery-css), [`jQuery.toggleClass`](/questions/javascript/jquery-class-manipulation)
- **Popular libraries**:
  - [`classnames`](/questions/javascript/classnames)
  - `test`/`expect` functions from testing frameworks like [Jest](https://jestjs.io/)/[Mocha](https://mochajs.org/)/[Vitest](https://vitest.dev/)
  - [`Emitter`](/questions/javascript/event-emitter) (exists in Node.js and many third party libraries)
  - [Immutable.js](https://immutable-js.com/)
  - [Backbone.js](https://backbonejs.org/)

If you look at the source code of these libraries, you might find some implementations to be quite complex. This is because there are lots of obscure real world use cases that the library has to support. Similar to the standard functions, you're not expected to handle all of these edge cases within an interview setting but you get points for calling them out.

---

## What to Do During JavaScript Coding Interviews

JavaScript coding interviews share a lot of similarities with algorithmic coding interviews. In general, you should:

1. Find out what platform you are coding on and familiarize yourself with the coding environment:
   - The supported editor shortcuts
   - Whether you can execute code
   - Whether you can install 3rd party dependencies
2. Make your self introduction under a minute. Unless requested, do not take longer than this otherwise you might not have enough time to code.
3. Ask clarifying questions upon receiving the question. Clarify the following:
   - Can you use newer JavaScript syntax (ES2016 and beyond)?
   - Whether the code is meant to run in the browser or on the server (e.g. Node.js)
   - Browser support, as this will affect the browser APIs you can use
4. Propose a solution to your interviewer. Unlike algorithmic coding interviews, the focus of JavaScript coding interviews is usually not on complex data structures and algorithms. It's possible and likely you can jump straight to the optimal solution with the best choice of data structures and algorithms.
5. Code out your solution and explain your code to your interviewer while you are coding.
6. After coding, read through your code once and try to spot basic errors like typos, using variables before initializing them, using APIs incorrectly, etc.
7. Outline some basic test cases and some edge cases. Test your code with these cases and determine if your code passes them. If it fails, debug the issue(s) and fix them.
8. Optional: Explain the time/space complexity if the code involved algorithmic optimizations and smart choice of data structures.
9. Explain any tradeoffs you made, cases you explicitly didn't handle, and how you would improve the code if you had more time.
10. The interview might not end here; the interviewer might have follow-up questions for you on this question or give you another question. Be prepared for them.

---

## How to Prepare for JavaScript Coding Interviews

1. Be familiar with HTML, CSS, JavaScript, and DOM concepts by referring to the "Important Concepts" below. The [Quiz section](/front-end-interview-playbook/quiz) can also be a good start since you might be asked on these concepts in the form of quiz questions during coding.
2. Pick a [study plan](/interviews/get-started) and practice the [JavaScript coding questions](/questions/formats/javascript-functions) recommended for the selected study plan. It's also alright to study for a certain topic as you are doing the questions.

---

## Important Concepts

| Category         | Important topics                                                                                       |
|------------------|-------------------------------------------------------------------------------------------------------|
| Data structures  | Arrays, Maps, Stacks, Trees, Sets                                                                     |
| Algorithms       | Binary search, Breadth-first search, Depth-first search, Recursion                                    |
| JavaScript lang. | Data types (checking for types, type coercion), Scope, Closures, Callbacks, How `this` works, OOP, Arrow functions vs normal functions, `apply`/`call`, `Promise`, Variadic arguments |
| DOM              | DOM traversal, creation, manipulation, element/node properties, Event delegation                       |
| Runtime APIs     | Timer (`setTimeout()`, `setInterval()`)                                                               |

---

## Evaluation Axes

JavaScript coding interviews are similar to algorithmic coding interviews and the way to go about the interviews should be similar. Naturally, there will be some overlaps with algorithmic coding interviews regarding how candidates are evaluated during JavaScript coding interviews.

- **Problem solving**: Use a systematic and logical approach to understanding and addressing a problem. Break down the problem into smaller independent problems. Evaluate different approaches and their tradeoffs.
- **Software engineering foundation**: Familiarity with data structures, algorithms, runtime complexity analysis, use of design patterns, design solution with clean abstractions.
- **Domain expertise**: Understanding of the front end domain and the relevant languages: Browser (DOM and DOM APIs), HTML, CSS, JavaScript, Performance.
- **Communication**: Ask questions to clarify details and clearly explain your approach and considerations.
- **Verification**: Identify various scenarios to test the code against, including edge cases. Be able to diagnose and fix any issues that arise.

---

## Useful Tips

- **Wishful thinking**: JavaScript's standard library doesn't have some useful data structures and algorithms like queue, heap, binary search, which can make your life easier during JavaScript coding interviews. However, you can ask the interviewer if you can pretend such a data structure/algorithm exists and use it directly in your solution without implementing it.
- **Pure functions**: Aim to write pure functions which have the benefit of reusability and modularity, i.e., functions which don't rely on state outside of the function and don't cause side effects.
- **Choose data structures wisely**: Pay attention to your choice of data structures and be aware of the time complexities of the code. Be familiar with the time/space complexities of the basic JavaScript Array, Object, Set, Map operations should you want to use them in your solution. Some of these time/space complexities differ across languages. Don't write code that runs in O(n^2) if it can be accomplished in O(n) runtime with the use of hash maps.
- **`this` matters**: If a function accepts a callback function as a parameter, consider how the `this` variable should behave. For many built-in functions, `this` is provided as one of the arguments the callback function is invoked with.
- **Mutations within callback functions**: Beware of callback functions mutating the data structure it is operating on. You probably do not need to handle this case during interviews but you should explicitly mention such cases if it's relevant.
- **Recursion edge cases**:
  - **Clarifying input size**: If you have identified that solving the question requires recursion, ask about the input size and how to handle the case of recursion stack overflow. Usually you won't have to handle it but raising this issue demonstrates thoughtfulness.
  - **Cyclic structures**: Nested deep data structures can have recursive references to itself, which makes certain operations like serialization and traversal more tricky. Ask the interviewer if you have to handle such cases. Usually you won't have to handle it but raising this issue demonstrates thoughtfulness.

---

## Best Practice Questions

From experience, the best JavaScript coding interview questions to practice, as determined by frequency and important concepts covered, are:

- [Debounce](/questions/javascript/debounce)
- [Throttle](/questions/javascript/throttle)
- [Array.prototype.filter](/questions/javascript/array-filter)
- [Promise.all](/questions/javascript/promise-all)
- [Curry](/questions/javascript/curry)
- [Flatten](/questions/javascript/flatten)
- [getElementsByTagName](/questions/javascript/get-elements-by-class-name)
- [Deep Clone](/questions/javascript/deep-clone)
- [Data Selection](/questions/javascript/data-selection)

GreatFrontEnd has a [comprehensive list of JavaScript coding questions](/questions/formats/javascript-functions) that you can practice. There are also automated test cases you can run your code against to verify correctness, and solutions written by ex-FAANG Senior Engineers.

Note that we are intentionally vague in some of the questions and don't present the full requirements upfront in the question description. However, we'll cover as much ground as possible in the solution. It may be frustrating while reading the solutions to see that you've missed out some things, but this trains you to think ahead and consider what are the possible areas you have to take note of when working on the solution. Better to find out during practice than during actual interviews.