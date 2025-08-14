# JavaScript Coding Exercises

This section contains simple exercises to help you practice JavaScript fundamentals.

---

## Debounce (Cheatsheet)

**Debounce** is a technique to limit how often a function is called. It ensures a function is only executed after a specified delay has elapsed since the last time it was invoked. Commonly used for input events (e.g., search boxes, window resizing).

### Key Points
- Only runs the function after `wait` ms have passed since the last call.
- Cancels previous scheduled calls if invoked again within the wait period.
- Preserves the correct `this` context and arguments.

### Implementation (Final Version)
```js
/**
 * @param {Function} func - The function to debounce
 * @param {number} wait - Delay in milliseconds
 * @return {Function} Debounced function
 */
export default function debounce(func, wait = 0) {
  let timeoutID = null;
  return function (...args) {
    const context = this;
    clearTimeout(timeoutID);
    timeoutID = setTimeout(function () {
      timeoutID = null; // Not strictly necessary but good practice
      func.apply(context, args);
    }, wait);
  };
}
```

#### Alternative (using arrow function for setTimeout callback)
```js
export default function debounce(func, wait = 0) {
  let timeoutID = null;
  return function (...args) {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      timeoutID = null;
      func.apply(this, args); // 'this' is lexically scoped
    }, wait);
  };
}
```

### Edge Cases
- **Preserving `this`:** Use a variable (`context = this`) or an arrow function in `setTimeout` to ensure the correct `this` value.
- **Do not use an arrow function for the returned function**: The returned function's `this` should be dynamic.
- **clearTimeout is safe:** Calling `clearTimeout` with an invalid ID does nothing (no error).

### Notes
- Debounce is often paired with [throttle](./throttle) in interviews.
- Useful for optimizing performance on high-frequency events.

### Resources
- [Debouncing and Throttling Explained Through Examples (CSS-Tricks)](https://css-tricks.com/debouncing-throttling-explained-examples/)
- [Implementing Debounce in JavaScript (Medium)](https://medium.com/@griffinmichl/implementing-debounce-in-javascript-eab51a12311e)
- [MDN: clearTimeout](https://developer.mozilla.org/en-US/docs/Web/API/clearTimeout)yarn start

---

## Array.prototype.reduce (Cheatsheet)

**Array.prototype.reduce** is a method that executes a reducer function on each element of the array, resulting in a single output value. Understanding its nuances is key for interviews and robust code.

### Key Points
- The reducer callback receives four arguments: `accumulator`, `currentValue`, `currentIndex`, and the `array` itself.
- If no `initialValue` is provided, the first array element is used as the initial accumulator, and iteration starts from index 1.
- If `initialValue` is provided, iteration starts from index 0.
- Handles sparse arrays: skips missing elements.

### Implementation (Final Version)
```js
/**
 * @template T, U
 * @param {(previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U} callbackFn
 * @param {U} [initialValue]
 * @return {U}
 */
Array.prototype.myReduce = function(callbackFn, initialValue) {
  const noInitialValue = initialValue === undefined;
  const len = this.length;
  if (noInitialValue && len === 0) {
    throw new TypeError('Reduce of empty array with no initial value');
  }
  let acc = noInitialValue ? this[0] : initialValue;
  let startingIndex = noInitialValue ? 1 : 0;
  for (let k = startingIndex; k < len; k++) {
    if (Object.hasOwn(this, k)) {
      acc = callbackFn(acc, this[k], k, this);
    }
  }
  return acc;
};
```

#### One-liner Solution
```js
Array.prototype.myReduce = Array.prototype.reduce;
```

#### Spec-compliant Solution
```js
Array.prototype.myReduce = function(callbackFn, initialValue) {
  const len = this.length;
  if (
    typeof callbackFn !== 'function' ||
    !callbackFn.call ||
    !callbackFn.apply
  ) {
    throw new TypeError(`${callbackFn} is not a function`);
  }
  if (len === 0 && initialValue === undefined) {
    throw new TypeError('Reduce of empty array with no initial value');
  }
  let k = 0;
  let accumulator;
  if (initialValue !== undefined) {
    accumulator = initialValue;
  } else {
    let kPresent = false;
    while (!kPresent && k < len) {
      kPresent = Object.hasOwn(this, k);
      if (kPresent) {
        accumulator = this[k];
      }
      k = k + 1;
    }
    if (!kPresent) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
  }
  while (k < len) {
    const kPresent = Object.hasOwn(this, k);
    if (kPresent) {
      const kValue = this[k];
      accumulator = callbackFn(accumulator, kValue, k, this);
    }
    k = k + 1;
  }
  return accumulator;
};
```

### Edge Cases
- Empty array, with and without `initialValue`.
- Single-value array, with and without `initialValue`.
- Passing `index` and `array` to the reducer callback.
- Sparse arrays (e.g., `[1, 2, , 4]`): skips missing values.

### Notes
- Mutating the array during reduction is possible but discouraged.
- The range of elements processed is set before the first callback.
- Elements added after reduction starts are not visited.
- If elements are changed, the value at the time of visit is used.
- Deleted elements before being visited are not visited.

### Resources
- [Array.prototype.reduce | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
- [Array.prototype.reduce ECMAScript specification](https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.reduce)

---

## Classnames (Cheatsheet)

**Classnames** is a utility function to conditionally join class names together. It is commonly used in React and other frontend frameworks to handle dynamic class assignment.

### Clarification Questions
- Can there be duplicated classes in the input? Should the output contain duplicated classes?
  - Yes, but usually not tested for.
- What if a class was added and then later turned off? E.g. `classNames('foo', { foo: false })`?
  - The result is `'foo'` (the string remains), but this is not usually tested for.

### Key Points
- Handles strings, numbers, arrays, and objects as arguments.
- Recursively flattens arrays.
- For objects, only keys with truthy values are included.
- Ignores falsey values (false, null, undefined, 0, '').

---

### Approach 1: Pure Recursive Function
**Cheatsheet:**
- The function calls itself recursively and returns a string.
- Each call processes its arguments and composes the result from child calls.
- No external state is modified.

```js
/**
 * @param {...(any|Object|Array<any|Object|Array>)} args
 * @return {string}
 */
export default function classNames(...args) {
  const classes = [];
  args.forEach(arg => {
    if (!arg) return;
    const argType = typeof arg;
    if (argType === 'string' || argType === 'number') {
      classes.push(arg);
      return;
    }
    if (Array.isArray(arg)) {
      classes.push(classNames(...arg));
      return;
    }
    if (argType === 'object') {
      for (const key in arg) {
        if (Object.hasOwn(arg, key) && arg[key]) {
          classes.push(key);
        }
      }
      return;
    }
  });
  return classes.join(' ');
}
```

---

### Approach 2: Inner Recursive Helper (Modifies External Value)
**Cheatsheet:**
- Uses an inner helper function that modifies a top-level `classes` array.
- The helper is called recursively for arrays and objects.
- The main function returns the joined result.

```ts
export type ClassValue = ClassArray | ClassDictionary | string | number | null | boolean | undefined;
export type ClassDictionary = Record<string, any>;
export type ClassArray = Array<ClassValue>;

export default function classNames(...args: Array<ClassValue>): string {
  const classes: string[] = [];
  function classNamesImpl(...args: Array<ClassValue>) {
    args.forEach(arg => {
      if (!arg) return;
      const argType = typeof arg;
      if (argType === 'string' || argType === 'number') {
        classes.push(String(arg));
        return;
      }
      if (Array.isArray(arg)) {
        for (const cls of arg) classNamesImpl(cls);
        return;
      }
      if (argType === 'object') {
        const objArg = arg as ClassDictionary;
        for (const key in objArg) {
          if (Object.hasOwn(objArg, key) && objArg[key]) {
            classes.push(key);
          }
        }
        return;
      }
    });
  }
  classNamesImpl(...args);
  return classes.join(' ');
}
```

---

### Approach 3: Inner Recursive Helper (Modifies Argument)
**Cheatsheet:**
- Uses an inner helper function that takes a `classesArr` argument.
- The helper is called recursively, always passing the same array.
- The main function returns the joined result.

```ts
export type ClassValue = ClassArray | ClassDictionary | string | number | null | boolean | undefined;
export type ClassDictionary = Record<string, any>;
export type ClassArray = Array<ClassValue>;

export default function classNames(...args: Array<ClassValue>): string {
  const classes: string[] = [];
  function classNamesImpl(classesArr: string[], ...args: Array<ClassValue>) {
    args.forEach(arg => {
      if (!arg) return;
      const argType = typeof arg;
      if (argType === 'string' || argType === 'number') {
        classesArr.push(String(arg));
        return;
      }
      if (Array.isArray(arg)) {
        for (const cls of arg) classNamesImpl(classesArr, cls);
        return;
      }
      if (argType === 'object') {
        const objArg = arg as ClassDictionary;
        for (const key in objArg) {
          if (Object.hasOwn(objArg, key) && objArg[key]) {
            classesArr.push(key);
          }
        }
        return;
      }
    });
  }
  classNamesImpl(classes, ...args);
  return classes.join(' ');
}
```

---

### Follow-up: De-duplicating Classes
- The above solutions do not de-duplicate classes. For de-duplication, use a `Set` instead of an array.
- De-duplication is usually out of scope for interviews but is a possible follow-up.

---

### Edge Cases
- Ignores falsey values (false, null, undefined, 0, '').
- Handles nested arrays and objects.
- Does not de-duplicate classes by default.
- Stack overflow or circular references are possible with deeply nested or self-referential input.

### Notes
- `typeof []` is `'object'`, so check for arrays before objects.
- Mutating input is not recommended.
- De-duplication is not handled by default (see Classnames II for that).
- Stack overflow and circular references are possible with deep or cyclic input.

### Techniques
- Type checking (`typeof`, `Array.isArray`)
- Recursion
- Handling variadic arguments
- Converting arrays to sets for unique classes (for follow-up)

---

### Library Implementation
The popular [classnames](https://github.com/JedWatson/classnames) npm package uses a similar approach:
```js
var hasOwn = {}.hasOwnProperty;
export default function classNames() {
  var classes = [];
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (!arg) continue;
    var argType = typeof arg;
    if (argType === 'string' || argType === 'number') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        var inner = classNames.apply(null, arg);
        if (inner) {
          classes.push(inner);
        }
      }
    } else if (argType === 'object') {
      if (arg.toString === Object.prototype.toString) {
        for (var key in arg) {
          if (hasOwn.call(arg, key) && arg[key]) {
            classes.push(key);
          }
        }
      } else {
        classes.push(arg.toString());
      }
    }
  }
  return classes.join(' ');
}
```

### Resources
- [classnames library on GitHub](https://github.com/JedWatson/classnames)
- [clsx library on GitHub](https://github.com/lukeed/clsx): A newer, faster, smaller drop-in replacement for classnames.

---

## Array Flatten (Cheatsheet)

Flattening an array means converting a nested array into a single-level array. This is a common interview question that tests your knowledge of recursion, iteration, array methods, and JavaScript type checking.

### Clarification Questions
- What type of data does the array contain? (Numbers, objects, mixed?)
- How many levels of nesting can the array have?
- Should we return a new array or mutate the existing one?
- Can we assume valid input (always an array)?
- Is ES6+ supported in the environment?

---

### Approach 1: Iterative (while loop, no mutation)
**Cheatsheet:**
- Uses a while loop and a copy of the input array.
- Uses `Array.isArray` to check for arrays.
- Does not mutate the original array.

```ts
type ArrayValue = any | Array<ArrayValue>;

export default function flatten(value: Array<ArrayValue>): Array<any> {
  const res = [];
  const copy = value.slice();
  while (copy.length) {
    const item = copy.shift();
    if (Array.isArray(item)) {
      copy.unshift(...item);
    } else {
      res.push(item);
    }
  }
  return res;
}
```

---

### Approach 2: Iteration using Array.prototype.some
**Cheatsheet:**
- Uses `Array.prototype.some` to check for nested arrays.
- Uses `concat(...value)` to flatten one level at a time.
- Repeats until no nested arrays remain.

```ts
type ArrayValue = any | Array<ArrayValue>;

export default function flatten(value: Array<ArrayValue>): Array<any> {
  while (value.some(Array.isArray)) {
    value = [].concat(...value);
  }
  return value;
}
```

---

### Approach 3: Recursion using Array.prototype.reduce
**Cheatsheet:**
- Uses recursion and `reduce` to flatten arrays.
- Concatenates recursively flattened subarrays.

```js
/**
 * @param {Array<*|Array>} value
 * @return {Array}
 */
export default function flatten(value) {
  return value.reduce(
    (acc, curr) => acc.concat(Array.isArray(curr) ? flatten(curr) : curr),
    []
  );
}
```

---

### Approach 4: In-place flatten (mutates input)
**Cheatsheet:**
- Flattens the array in-place using `splice`.
- Constant O(1) space, but mutates the input array.

```ts
type ArrayValue = any | Array<ArrayValue>;

export default function flatten(value: Array<ArrayValue>): Array<any> {
  for (let i = 0; i < value.length;) {
    if (Array.isArray(value[i])) {
      value.splice(i, 1, ...value[i]);
    } else {
      i++;
    }
  }
  return value;
}
```

---

### Approach 5: Recursion using flatMap
**Cheatsheet:**
- Uses `flatMap` recursively to flatten arrays.
- Only available in ES2019+ environments.

```ts
type ArrayValue = any | Array<ArrayValue>;

export default function flatten(value: Array<ArrayValue>): Array<any> {
  return Array.isArray(value)
    ? value.flatMap(item => flatten(item))
    : value;
}
```

---

## Bonus Solutions

### Bonus 1: Generator (for very deep arrays)
**Cheatsheet:**
- Uses a generator to yield flattened items lazily.
- Avoids stack overflow for very deep arrays.
- Returns an iterator, not an array.

```js
/**
 * @param {Array<*|Array>} value
 * @return {Iterable}
 */
export default function* flatten(value) {
  for (const item of value) {
    if (Array.isArray(item)) {
      yield* flatten(item);
    } else {
      yield item;
    }
  }
}
```

---

### Bonus 2: Regex and JSON.stringify
**Cheatsheet:**
- Flattens by converting to a string and removing brackets.
- Only works for JSON-safe data.

```ts
type ArrayValue = any | Array<ArrayValue>;

export default function flatten(value: Array<ArrayValue>): Array<any> {
  return JSON.parse('[' + JSON.stringify(value).replace(/(\[|\])/g, '') + ']');
}
```

---

### Bonus 3: toString (numbers only)
**Cheatsheet:**
- Flattens arrays of numbers using `toString` and `split`.
- Only works if all elements are numbers.

```js
function flattenOnlyNumbers(array) {
  return array
    .toString()
    .split(',')
    .map(numStr => Number(numStr));
}
```

---

### One-liner: Array.prototype.flat
**Cheatsheet:**
- Uses the native `flat(Infinity)` method (ES2019+).
- Easiest and most robust, but not always allowed in interviews.

```js
export default function flatten(arr) {
  return arr.flat(Infinity);
}
```

---

### Techniques
- Type checking (`Array.isArray`, `instanceof Array`)
- Recursion
- Iteration
- Array methods: `reduce`, `concat`, `flatMap`, `flat`, `splice`, `some`, `toString`
- Generators
- Regex and JSON

### Edge Cases & Notes
- Deeply nested arrays may cause stack overflow with recursion.
- In-place solutions mutate the input array.
- Some solutions only work for specific data types (e.g., numbers only).
- Native `flat` is the most robust but not always available.
- Always clarify requirements and constraints in interviews.

### Resources
- [Jake Archibald: Arrays, Symbols, and Realms](https://jakearchibald.com/2017/arrays-symbols-realms/)
- [MDN: Array.prototype.flat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat)
- [MDN: Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)

---

## Throttle (Cheatsheet)

**Throttle** is a technique to limit how often a function is called. It ensures a function is only executed at most once every `wait` milliseconds, no matter how many times it is triggered. This is commonly used for scroll, resize, and mousemove events.

### Key Points
- Throttled function can be in two states: Idle (can call) or Active (waiting for next call).
- Uses a timer (`setTimeout`) and a boolean lock to control invocation.
- Preserves the correct `this` context and arguments.
- Many variations exist (e.g., leading/trailing, flush/cancel, etc.).

### Clarification Questions
- Should the function be called immediately on the first trigger (leading), or only after the wait (trailing)?
- Should trailing calls be queued or dropped?
- Is cancellation or flush required?

---

### Approach 1: Basic Throttle (Leading, Dropping Calls)
**Cheatsheet:**
- Calls the function immediately, then ignores further calls until `wait` ms have passed.
- Ignores all calls during the wait period.
- No trailing call.

```js
/**
 * @param {Function} func
 * @param {number} wait
 * @return {Function}
 */
export default function throttle(func, wait = 0) {
  let shouldThrottle = false;
  return function (...args) {
    if (shouldThrottle) return;
    shouldThrottle = true;
    setTimeout(function () {
      shouldThrottle = false;
    }, wait);
    func.apply(this, args);
  };
}
```

---

### Approach 2: Throttle with Timestamp (Alternative)
**Cheatsheet:**
- Uses timestamps to determine if enough time has passed since the last call.
- Calls the function immediately if enough time has passed.

```js
export default function throttle(func, wait = 0) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      func.apply(this, args);
    }
  };
}
```

---

### Approach 3: Throttle with Trailing Call (Lodash-style)
**Cheatsheet:**
- Calls the function at the start (leading) and also at the end (trailing) if calls were made during the wait.
- More complex, but covers most real-world use cases.

```js
export default function throttle(func, wait = 0) {
  let timeout = null;
  let lastArgs = null;
  let lastContext = null;
  let lastCallTime = 0;
  return function (...args) {
    const now = Date.now();
    lastContext = this;
    lastArgs = args;
    const remaining = wait - (now - lastCallTime);
    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastCallTime = now;
      func.apply(lastContext, lastArgs);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCallTime = Date.now();
        timeout = null;
        func.apply(lastContext, lastArgs);
      }, remaining);
    }
  };
}
```

---

### Techniques
- Using `setTimeout` and/or timestamps
- Closures
- Preserving `this` context
- Using `Function.prototype.apply()`/`call()`

### Edge Cases & Notes
- Arrow functions should not be used for the returned function if `this` is important.
- Many libraries (like Lodash) offer advanced throttle options (leading/trailing, flush, cancel, etc.).
- The basic version drops all calls during the wait period; more advanced versions can queue or merge them.

### Resources
- [Debouncing and Throttling Explained Through Examples (CSS-Tricks)](https://css-tricks.com/debouncing-throttling-explained-examples/)
- [Lodash throttle docs](https://lodash.com/docs/4.17.15#throttle)

---

## Type Utilities II (Cheatsheet)

Type utilities are helper functions to check the type or structure of a value. These are common in utility libraries and are often tested in interviews.

### Key Points
- `isArray`: Checks if a value is an array.
- `isFunction`: Checks if a value is a function.
- `isObject`: Checks if a value is an object (but not null/undefined).
- `isPlainObject`: Checks if a value is a plain object (object literal or `Object.create(null)`).
- Always consider edge cases: `null`, `undefined`, objects with no prototype, etc.

---

### isArray
**Cheatsheet:**
- Use `Array.isArray()` if available (ES5+).
- For older environments, check the constructor, but handle `null`/`undefined`.

```js
export function isArray(value) {
  return Array.isArray(value);
}

// Alternative for old browsers
export function isArrayAlt(value) {
  if (value == null) return false;
  return value.constructor === Array;
}
```

---

### isFunction
**Cheatsheet:**
- Use `typeof value === 'function'`.

```js
export function isFunction(value) {
  return typeof value === 'function';
}
```

---

### isObject
**Cheatsheet:**
- Checks for non-null objects and functions.
- `typeof null` is `'object'`, so check for null/undefined.

```js
export function isObject(value) {
  if (value == null) return false;
  const type = typeof value;
  return type === 'object' || type === 'function';
}
```

---

### isPlainObject
**Cheatsheet:**
- Checks for objects created by `{}` or `Object.create(null)`.
- Uses `Object.getPrototypeOf`.

```js
export function isPlainObject(value) {
  if (value == null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}
```

---

### isPlainObject (Lodash-style, robust)
**Cheatsheet:**
- Traverses the prototype chain to check for plain objects.
- Handles objects created with `Object.create(null)`.

```js
export function isPlainObjectAlternative(value) {
  if (!isObject(value)) return false;
  if (Object.getPrototypeOf(value) === null) return true;
  let proto = value;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(value) === proto;
}
```

---

### Techniques
- Familiarity with JavaScript types and type coercion.
- Understanding of prototypes and constructor properties.
- Defensive programming for `null`/`undefined`.

### Edge Cases & Notes
- `typeof null` is `'object'`, so always check for null.
- Functions are objects in JavaScript.
- Objects with no prototype (`Object.create(null)`) are plain objects.
- Arrays are objects, but not plain objects.
- Always clarify requirements in interviews.

### Resources
- [MDN: Array.isArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
- [MDN: typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
- [MDN: Object.getPrototypeOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf)
- [Lodash isPlainObject source](https://github.com/lodash/lodash/blob/master/isPlainObject.js)

---

## Promise.all (Cheatsheet)

**Promise.all** is a utility that takes an iterable of promises (or values) and returns a single promise that resolves when all of the input promises resolve, or rejects as soon as one of them rejects. Understanding how it works is key for async programming interviews.

### Key Points
- Returns a promise that resolves to an array of resolved values (in order).
- If any input rejects, the returned promise rejects immediately with that reason.
- Handles non-promise values by treating them as resolved promises.
- If the input is empty, resolves to an empty array.

---

### Approach 1: Using async/await and unresolved counter
**Cheatsheet:**
- Returns a new Promise.
- Uses an unresolved counter to track completion.
- Uses async/await for each item.
- Rejects immediately on the first error.

```js
/**
 * @param {Array} iterable
 * @return {Promise<Array>}
 */
export default function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const results = new Array(iterable.length);
    let unresolved = iterable.length;
    if (unresolved === 0) {
      resolve(results);
      return;
    }
    iterable.forEach(async (item, index) => {
      try {
        const value = await item;
        results[index] = value;
        unresolved -= 1;
        if (unresolved === 0) {
          resolve(results);
        }
      } catch (err) {
        reject(err);
      }
    });
  });
}
```

---

### Approach 2: Using Promise.then (no async/await)
**Cheatsheet:**
- Returns a new Promise.
- Uses Promise.resolve().then() for each item.
- Tracks unresolved count and order.
- Rejects immediately on the first error.

```js
/**
 * @param {Array} iterable
 * @return {Promise<Array>}
 */
export default function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const results = new Array(iterable.length);
    let unresolved = iterable.length;
    if (unresolved === 0) {
      resolve(results);
      return;
    }
    iterable.forEach((item, index) => {
      Promise.resolve(item).then(
        value => {
          results[index] = value;
          unresolved -= 1;
          if (unresolved === 0) {
            resolve(results);
          }
        },
        reason => {
          reject(reason);
        }
      );
    });
  });
}
```

---

### Edge Cases
- Empty input array: resolves to an empty array.
- Non-promise values: treated as resolved promises.
- First rejection: promise rejects with that reason.

### Techniques
- Promise construction and chaining
- Async/await and .then()
- Order preservation
- Error handling

### Notes
- The input array is resolved concurrently, not sequentially.
- Only the first rejection is reported.
- The returned promise settles as soon as any input rejects.

### Resources
- [Promise.all() - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

---

## Data Merging (Cheatsheet)

Merging data by a key (e.g., user) is a common interview and real-world problem. The goal is to merge sessions with the same user, summing durations and combining equipment, while preserving the order of first occurrence. The input objects should not be mutated.

### Key Points
- Merge sessions with the same user.
- The merged row should take the place of the earliest occurrence of that user.
- Do not mutate the input objects.
- Combine equipment arrays (unique, sorted).
- Use a hash map for O(1) lookups and O(n) time.

---

### Approach 1: Using Map for O(n) Merging
**Cheatsheet:**
- Use a `Map` to track the first occurrence and merged data for each user.
- Use a `Set` to collect unique equipment for each user.
- At the end, convert equipment sets back to sorted arrays.
- Preserves order and does not mutate input.

```js
/**
 * @param {Array<{user: number, duration: number, equipment: Array<string>}>} sessions
 * @return {Array<{user: number, duration: number, equipment: Array<string>}>}
 */
export default function mergeData(sessions) {
  const results = [];
  const sessionsForUser = new Map();
  sessions.forEach(session => {
    if (sessionsForUser.has(session.user)) {
      const userSession = sessionsForUser.get(session.user);
      userSession.duration += session.duration;
      session.equipment.forEach(equipment => {
        userSession.equipment.add(equipment);
      });
    } else {
      const clonedSession = {
        ...session,
        equipment: new Set(session.equipment),
      };
      sessionsForUser.set(session.user, clonedSession);
      results.push(clonedSession);
    }
  });
  // Convert equipment sets to sorted arrays
  return results.map(session => ({
    ...session,
    equipment: Array.from(session.equipment).sort(),
  }));
}
```

---

### Approach 2: Naive O(n^2) (for completeness)
**Cheatsheet:**
- For each session, search the results array for an existing user.
- If found, merge; if not, add a new entry.
- Simpler, but less efficient for large data.

```js
export default function mergeData(sessions) {
  const results = [];
  sessions.forEach(session => {
    const existing = results.find(r => r.user === session.user);
    if (existing) {
      existing.duration += session.duration;
      session.equipment.forEach(e => {
        if (!existing.equipment.includes(e)) existing.equipment.push(e);
      });
      existing.equipment.sort();
    } else {
      results.push({
        user: session.user,
        duration: session.duration,
        equipment: [...session.equipment].sort(),
      });
    }
  });
  return results;
}
```

---

### Techniques
- Arrays, Map, Set
- Cloning objects to avoid mutation
- Order preservation
- Efficient lookups

### Edge Cases & Notes
- If a user appears only once, their session is unchanged (except equipment sorted).
- If a user appears multiple times, durations are summed and equipment is merged (unique, sorted).
- Input objects are not mutated.
- Order of first occurrence is preserved.

### Resources
- [MDN: Array.prototype.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)

---

## Deep Clone (Cheatsheet)

Deep cloning is the process of creating a new object that is a recursive copy of the original, so that changes to the clone do not affect the original. This is a classic interview problem and is important for understanding object references in JavaScript.

### Key Points
- Deep clone means recursively copying all nested objects/arrays.
- Shallow copy only copies the first level (e.g., `Object.assign`, spread `...`).
- Edge cases: circular references, non-enumerable properties, symbol keys, property descriptors, prototypes, special objects (Date, RegExp, etc.).

---

### Approach 1: JSON.stringify/parse (Simple, but flawed)
**Cheatsheet:**
- Easiest way for simple objects (no functions, symbols, undefined, Date, etc.).
- Only works for JSON-safe data.
- Ignores non-enumerable, symbol-keyed, and unsupported types.

```js
export default function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}
```

---

### Approach 2: Recursion (Handles objects/arrays)
**Cheatsheet:**
- Recursively clones arrays and objects.
- Uses `Object.entries` and `Array.isArray`.
- Ignores non-enumerable, symbol-keyed, and circular references.

```js
/**
 * @template T
 * @param {T} value
 * @return {T}
 */
export default function deepClone(value) {
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(item => deepClone(item));
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [key, deepClone(val)])
  );
}
```

---

### Approach 3: One-liner with structuredClone (Modern, robust)
**Cheatsheet:**
- Native deep clone for most built-in types (including Date, Map, Set, etc.).
- Handles circular references.
- Not supported in all environments (Node 17+, modern browsers).

```js
const clonedObj = structuredClone(obj);
```

---

### Techniques
- Recursion
- Type checking (`typeof`, `Array.isArray`)
- Object traversal (`Object.entries`, `Object.keys`, `for...in`)
- Native APIs (`structuredClone`)

### Edge Cases & Notes
- JSON method loses functions, undefined, symbols, special objects, and has surprising behaviors (e.g., Date to string, NaN/Infinity to null).
- Recursion method does not handle circular references, non-enumerable, symbol-keyed, or property descriptors.
- `structuredClone` is the most robust, but not always available.
- For full support (including circular refs, symbols, etc.), see libraries like Lodash's `cloneDeep` or implement Deep Clone II.

### Resources
- [MDN: JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
- [MDN: Object.fromEntries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries)
- [MDN: structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)
- [web.dev: Deep-copying in JavaScript using structuredClone](https://web.dev/structured-clone/)

---

## Deep Clone II (Cheatsheet)

This is an advanced version of the deep clone problem, covering symbol-keyed properties, non-enumerable properties, property descriptors, prototypes, and circular references. This is the kind of deep clone you might find in a library implementation.

### Key Points
- Handles symbol-keyed and non-enumerable properties (via `Reflect.ownKeys`).
- Preserves property descriptors (if implemented fully).
- Preserves object prototypes.
- Handles circular references using a cache (Map).
- Handles special objects (Date, RegExp, Set, Map, etc.).
- Does not clone functions (returns the same reference).

---

### Approach 1: Full-featured Deep Clone with Cache
**Cheatsheet:**
- Uses a cache (Map) to handle circular references.
- Uses `Reflect.ownKeys` to copy all own properties (including symbols and non-enumerable).
- Uses `Object.getOwnPropertyDescriptors` and `Object.create` to preserve property descriptors and prototype (not shown in code below, but can be added).
- Handles Set, Map, Date, RegExp, Array, Object, and primitives.

```js
function isPrimitiveTypeOrFunction(value) {
  return (
    typeof value !== 'object' ||
    typeof value === 'function' ||
    value === null
  );
}

function getType(value) {
  const type = typeof value;
  if (type !== 'object') return type;
  return Object.prototype.toString.call(value)
    .replace(/^\[object (\S+)]$/, '$1')
    .toLowerCase();
}

function deepCloneWithCache(value, cache) {
  if (isPrimitiveTypeOrFunction(value)) return value;
  const type = getType(value);
  if (type === 'set') {
    const cloned = new Set();
    value.forEach(item => cloned.add(deepCloneWithCache(item, cache)));
    return cloned;
  }
  if (type === 'map') {
    const cloned = new Map();
    value.forEach((v, k) => cloned.set(k, deepCloneWithCache(v, cache)));
    return cloned;
  }
  if (type === 'function') return value;
  if (type === 'array') {
    return value.map(item => deepCloneWithCache(item, cache));
  }
  if (type === 'date') {
    return new Date(value);
  }
  if (type === 'regexp') {
    return new RegExp(value);
  }
  if (cache.has(value)) return cache.get(value);
  const cloned = Object.create(Object.getPrototypeOf(value));
  cache.set(value, cloned);
  for (const key of Reflect.ownKeys(value)) {
    const item = value[key];
    cloned[key] = isPrimitiveTypeOrFunction(item)
      ? item
      : deepCloneWithCache(item, cache);
  }
  return cloned;
}

/**
 * @template T
 * @param {T} value
 * @return {T}
 */
export default function deepClone(value) {
  return deepCloneWithCache(value, new Map());
}
```

---

### Approach 2: One-liner with structuredClone (Modern, robust)
**Cheatsheet:**
- Native deep clone for most built-in types (including Date, Map, Set, etc.).
- Handles circular references.
- Not supported in all environments (Node 17+, modern browsers).

```js
const clonedObj = structuredClone(obj);
```

---

### Techniques
- Type detection (`Object.prototype.toString`)
- Recursion
- Caching for circular references
- Traversing all own properties (`Reflect.ownKeys`)
- Preserving prototype (`Object.create`)

### Edge Cases & Notes
- Property descriptors are not copied in the above code, but can be with `Object.getOwnPropertyDescriptors` and `Object.defineProperties`.
- Functions are not cloned (reference is kept).
- For a truly robust solution, see libraries like Lodash's `cloneDeep`.
- `structuredClone` is the most robust, but not always available.

### Resources
- [MDN: Reflect.ownKeys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys)
- [MDN: Object.getOwnPropertyDescriptors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptors)
- [web.dev: Deep-copying in JavaScript using structuredClone](https://web.dev/structured-clone/)
- [A Complete Guide To Check Data Types In JavaScript (zhenghao.io)](https://www.zhenghao.io/posts/js-data-type)

---

## Event Emitter (Cheatsheet)

An event emitter is a pattern for managing event-driven programming, allowing you to register, remove, and emit events with listeners. This is foundational for UI frameworks, Node.js, and more.

### Clarification Questions
- Can `emit()` be called with no arguments? (Yes)
- Can the same listener be added multiple times? (Yes, called in order)
- What happens if a listener is removed once but added multiple times? (Only one instance is removed)
- Can non-existent events be emitted? (Yes, nothing happens)
- What is the `this` value for listeners? (Can be `null`)
- What if listeners throw? (Should be caught, but not required here)

---

### Approach 1: Class-based EventEmitter (Object.create(null) for events)
**Cheatsheet:**
- Uses an object with no prototype for event storage to avoid key collisions.
- Supports `on`, `off`, and `emit` methods.
- Listeners are called in order of registration.
- Only the first matching listener is removed by `off`.

```js
export default class EventEmitter {
  constructor() {
    this._events = Object.create(null);
  }
  on(eventName, listener) {
    if (!Object.hasOwn(this._events, eventName)) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(listener);
    return this;
  }
  off(eventName, listener) {
    if (!Object.hasOwn(this._events, eventName)) return this;
    const listeners = this._events[eventName];
    const index = listeners.findIndex(l => l === listener);
    if (index < 0) return this;
    this._events[eventName].splice(index, 1);
    return this;
  }
  emit(eventName, ...args) {
    if (!Object.hasOwn(this._events, eventName) || this._events[eventName].length === 0) {
      return false;
    }
    const listeners = this._events[eventName].slice();
    listeners.forEach(listener => {
      listener.apply(null, args);
    });
    return true;
  }
}
```

---

### Approach 2: Prototype-based EventEmitter (Function constructor)
**Cheatsheet:**
- Uses a function constructor and prototype methods.
- Same event storage and logic as the class version.
- Useful for ES5 or interview settings.

```js
export default function EventEmitter() {
  this._events = Object.create(null);
}
EventEmitter.prototype.on = function(eventName, listener) {
  if (!Object.hasOwn(this._events, eventName)) {
    this._events[eventName] = [];
  }
  this._events[eventName].push(listener);
  return this;
};
EventEmitter.prototype.off = function(eventName, listener) {
  if (!Object.hasOwn(this._events, eventName)) return this;
  const listeners = this._events[eventName];
  const index = listeners.findIndex(l => l === listener);
  if (index < 0) return this;
  this._events[eventName].splice(index, 1);
  return this;
};
EventEmitter.prototype.emit = function(eventName, ...args) {
  if (!Object.hasOwn(this._events, eventName) || this._events[eventName].length === 0) {
    return false;
  }
  const listeners = this._events[eventName].slice();
  listeners.forEach(listener => {
    listener.apply(null, args);
  });
  return true;
};
```

---

### Techniques
- Object-oriented programming
- Using the right data structures (object with no prototype)
- Handling variadic arguments
- Chaining methods

### Edge Cases & Notes
- The same listener can be added more than once; removal is in order of adding.
- `emit()` can be called with no arguments.
- Methods are called with non-existing event names (no error).
- Event names can be built-in object properties (e.g., `toString`).
- Arrow functions should not be used for methods if `this` is needed.
- Node.js EventEmitter allows symbol event names, but this version does not.

### Resources
- [Node.js EventEmitter docs](https://nodejs.org/api/events.html#class-eventemitter)

---

## getElementsByStyle (Cheatsheet)

This problem tests your knowledge of DOM traversal, recursion, CSS, and the use of `getComputedStyle`. The goal is to collect all descendant elements of a root element that match a given computed style property and value.

### Key Points
- Use `getComputedStyle(element)` to get the resolved style of an element.
- Use `element.children` to traverse only element nodes (not text/comments).
- Recursively traverse the DOM tree.
- The root element itself is not included in the results, even if it matches.
- Value matching must use the resolved value (e.g., colors as `rgb()`, font sizes as `px`).

---

### Approach 1: Recursive Depth-First Traversal
**Cheatsheet:**
- Recursively traverse all descendants of the root element.
- For each element, check if its computed style matches the given property and value.
- Collect matching elements in an array.

```js
/**
 * @param {Element} element
 * @param {string} property
 * @param {string} value
 * @return {Array<Element>}
 */
export default function getElementsByStyle(element, property, value) {
  const elements = [];
  function traverse(el) {
    if (el == null) return;
    const computedStyles = getComputedStyle(el);
    if (computedStyles.getPropertyValue(property) === value) {
      elements.push(el);
    }
    for (const child of el.children) {
      traverse(child);
    }
  }
  for (const child of element.children) {
    traverse(child);
  }
  return elements;
}
```

---

### Approach 2: Iterative (Breadth-First Traversal)
**Cheatsheet:**
- Uses a queue to traverse the DOM tree level by level.
- For each element, check if its computed style matches.
- Collect matching elements in an array.

```js
export default function getElementsByStyle(element, property, value) {
  const elements = [];
  const queue = Array.from(element.children);
  while (queue.length) {
    const el = queue.shift();
    const computedStyles = getComputedStyle(el);
    if (computedStyles.getPropertyValue(property) === value) {
      elements.push(el);
    }
    queue.push(...el.children);
  }
  return elements;
}
```

---

### Techniques
- Recursion
- DOM APIs: `getComputedStyle`, `element.children`
- Breadth-first and depth-first traversal

### Edge Cases & Notes
- The root element is not included in the results, even if it matches.
- Value arguments must be in the resolved format (e.g., `rgb()`, `px`).
- `HTMLCollection` does not have `.forEach`, so use `for...of` or convert to array.
- Matching is strict equality on the resolved value.

### Resources
- [MDN: Window.getComputedStyle](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle)

---

## Function.prototype.call (Cheatsheet)

`Function.prototype.call` allows you to invoke a function with a specified `this` value and arguments provided individually. It's a fundamental part of JavaScript's function context manipulation.

### Key Points
- `call` lets you specify the `this` context and pass arguments one by one.
- Similar to `apply`, but `apply` takes arguments as an array.
- Used for explicit context binding and function borrowing.

---

### Approach 1: Using bind
**Cheatsheet:**
- Use `bind` to create a new function with the desired `this` and arguments, then invoke it.
- Simple, but not the most efficient for every call.

```js
Function.prototype.myCall = function(thisArg, ...argArray) {
  return this.bind(thisArg)(...argArray);
};
// Or, with arguments bound up front:
Function.prototype.myCall = function(thisArg, ...argArray) {
  return this.bind(thisArg, ...argArray)();
};
```

---

### Approach 2: Using apply
**Cheatsheet:**
- Use `apply` to call the function with the desired `this` and arguments as an array.
- Most direct and idiomatic.

```js
Function.prototype.myCall = function(thisArg, ...argArray) {
  return this.apply(thisArg, argArray);
};
```

---

### Approach 3: Using Symbol (manual context binding)
**Cheatsheet:**
- Attach the function to the context object as a temporary property (using a unique Symbol), call it, then remove it.
- Mimics how native `call` works internally.

```js
Function.prototype.myCall = function(thisArg, ...argArray) {
  const sym = Symbol();
  const wrapperObj = Object(thisArg);
  Object.defineProperty(wrapperObj, sym, {
    enumerable: false,
    value: this,
  });
  const result = wrapperObj[sym](...argArray);
  delete wrapperObj[sym];
  return result;
};
```

---

### Techniques
- Context binding (`this`)
- Using `bind`, `apply`, or manual property assignment
- Variadic arguments (`...args`)
- Symbol for unique property keys

### Edge Cases & Notes
- If `thisArg` is `null` or `undefined`, the global object (or `undefined` in strict mode) is used.
- Primitive values for `thisArg` are boxed (e.g., `Number`, `String`).
- Functions can be called with any number of arguments.
- The Symbol approach avoids property name collisions.

### Resources
- [MDN: Function.prototype.call](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
- [MDN: Function.prototype.apply](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
- [MDN: Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)

---

## List Format (Cheatsheet)

Formatting lists in a human-readable way is a common UI/UX task. This problem is inspired by `Intl.ListFormat.prototype.format()` and tests your ability to process, filter, and format arrays with options.

### Key Points
- Remove empty values, sort, and de-duplicate as needed.
- Format the list with commas and "and" for the last item, or show "X others" if a length option is specified.
- Hardcoded separators (English only) in this implementation.

---

### Approach 1: Full-featured List Formatter
**Cheatsheet:**
- Filter out falsey values.
- Optionally sort and de-duplicate.
- If `length` is specified and less than the number of items, show the first N and "X other(s)".
- Otherwise, join with commas and "and" for the last item.

```js
const SEPARATOR = ', ';
const OTHERS_SEPARATOR = ' and ';
const OTHERS_LABEL = 'other';

/**
 * @param {Array<string>} itemsParam
 * @param {{sorted?: boolean, length?: number, unique?: boolean}} [options]
 * @return {string}
 */
export default function listFormat(itemsParam, options = {}) {
  let items = itemsParam.filter(item => !!item);
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (options.sorted) items.sort();
  if (options.unique) items = Array.from(new Set(items));
  if (
    options.length &&
    options.length > 0 &&
    options.length < items.length
  ) {
    const firstSection = items.slice(0, options.length).join(SEPARATOR);
    const count = items.length - options.length;
    const secondSection = `${count} ${OTHERS_LABEL + (count > 1 ? 's' : '')}`;
    return [firstSection, secondSection].join(OTHERS_SEPARATOR);
  }
  const firstSection = items.slice(0, items.length - 1).join(SEPARATOR);
  const secondSection = items[items.length - 1];
  return [firstSection, secondSection].join(OTHERS_SEPARATOR);
}
```

---

### Approach 2: Simple Join (No options)
**Cheatsheet:**
- Just joins the array with commas and "and" for the last item.
- No filtering, sorting, or de-duplication.

```js
export default function simpleListFormat(items) {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  const firstSection = items.slice(0, items.length - 1).join(', ');
  const secondSection = items[items.length - 1];
  return [firstSection, secondSection].join(' and ');
}
```

---

### Techniques
- Array filtering, sorting, and de-duplication
- String joining and formatting
- Handling options and edge cases

### Edge Cases & Notes
- If the list is empty, return an empty string.
- If the list has one item, return that item.
- If `length` is specified and less than the number of items, show "X other(s)".
- This implementation is English-only; for i18n, use `Intl.ListFormat`.
- For production, allow customization of separators.

### Resources
- [MDN: Intl.ListFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat)

---

## Map Async Limit (Cheatsheet)

This problem tests your ability to process an array asynchronously with a concurrency limit. It's a common real-world scenario for batching API calls or heavy computations.

### Key Points
- Limit the number of concurrent async operations to `size`.
- Return a promise that resolves to an array of results in order.
- Several approaches: sequential, chunked, and fully concurrent (chunkless).

---

### Approach 1: Sequential (Bad! Ignores concurrency)
**Cheatsheet:**
- Processes each item one-by-one, ignoring the concurrency limit.
- Simple, but not efficient.

```js
export default function mapAsyncLimit(iterable, callbackFn, size = Infinity) {
  return new Promise((resolve, reject) => {
    const results = [];
    function processItem(index) {
      if (index === iterable.length) {
        resolve(results);
        return;
      }
      return callbackFn(iterable[index])
        .then(result => {
          results.push(result);
          processItem(index + 1);
        })
        .catch(reject);
    }
    processItem(0);
  });
}
```

---

### Approach 2: Chunked Recursion (Processes in batches)
**Cheatsheet:**
- Processes items in chunks of `size` using `Promise.all`.
- Recursively processes the next chunk after the current one finishes.
- Results are merged in order.

```js
export default function mapAsyncLimit(iterable, callbackFn, size = Infinity) {
  if (iterable.length === 0) return Promise.resolve([]);
  const currentChunk = iterable.slice(0, size);
  const remainingItems = iterable.slice(size);
  return Promise.all(currentChunk.map(callbackFn)).then(results =>
    mapAsyncLimit(remainingItems, callbackFn, size).then(rest => [
      ...results,
      ...rest,
    ])
  );
}
```

---

### Approach 3: Chunked with async/await (Cleaner, modern)
**Cheatsheet:**
- Uses `async`/`await` and a for-loop to process chunks.
- Each chunk is processed with `Promise.all`.
- Results are merged in order.

```js
export default async function mapAsyncLimit(iterable, callbackFn, size = Infinity) {
  const results = [];
  for (let i = 0; i < iterable.length; i += size) {
    const chunk = iterable.slice(i, i + size);
    const chunkResults = await Promise.all(chunk.map(callbackFn));
    results.push(...chunkResults);
  }
  return results;
}
```

---

### Approach 4: Chunkless (Max concurrency, always fills available slots)
**Cheatsheet:**
- Always keeps up to `size` concurrent tasks running.
- As soon as one finishes, starts the next.
- Most efficient for real-world use.

```js
export default function mapAsyncLimit(iterable, callbackFn, size = Infinity) {
  return new Promise((resolve, reject) => {
    const results = [];
    let nextIndex = 0;
    let resolved = 0;
    if (iterable.length === 0) {
      resolve(results);
      return;
    }
    function processItem(index) {
      nextIndex++;
      callbackFn(iterable[index])
        .then(result => {
          results[index] = result;
          resolved++;
          if (resolved === iterable.length) {
            resolve(results);
            return;
          }
          if (nextIndex < iterable.length) {
            processItem(nextIndex);
          }
        })
        .catch(reject);
    }
    for (let i = 0; i < Math.min(iterable.length, size); i++) {
      processItem(i);
    }
  });
}
```

---

### Techniques
- Promise chaining and async/await
- Array chunking
- Recursion
- Managing concurrency with counters and indices

### Edge Cases & Notes
- If the input array is empty, resolve to an empty array.
- If `size` is greater than or equal to the array length, all items are processed concurrently.
- If any promise rejects, the returned promise rejects immediately.
- The chunkless approach is the most efficient and robust.

### Resources
- [MDN: Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

---

## Deep Equal (Cheatsheet)

Deep equality checks whether two values are "structurally" equal, not just referentially equal. This is a classic interview and real-world problem for comparing objects, arrays, and primitives.

### Key Points
- `===` checks reference for objects/arrays, not structure.
- `Object.is` is more robust than `===` (handles NaN, +0/-0).
- Deep equality means recursively comparing all properties/entries.
- Use `Object.prototype.toString` to distinguish types.

---

### Approach 1: Handle Arrays/Objects First (Type-based)
**Cheatsheet:**
- Use `Object.prototype.toString` to get type.
- Recursively compare arrays/objects by entries.
- Use `Object.is` for primitives and non-objects.

```js
function shouldDeepCompare(type) {
  return type === '[object Object]' || type === '[object Array]';
}
function getType(value) {
  return Object.prototype.toString.call(value);
}
/**
 * @param {*} valueA
 * @param {*} valueB
 * @return {boolean}
 */
export default function deepEqual(valueA, valueB) {
  const typeA = getType(valueA);
  const typeB = getType(valueB);
  if (typeA === typeB && shouldDeepCompare(typeA) && shouldDeepCompare(typeB)) {
    const entriesA = Object.entries(valueA);
    const entriesB = Object.entries(valueB);
    if (entriesA.length !== entriesB.length) return false;
    return entriesA.every(([k, v]) => Object.hasOwn(valueB, k) && deepEqual(v, valueB[k]));
  }
  return Object.is(valueA, valueB);
}
```

---

### Approach 2: Handle Primitives First (Short-circuit)
**Cheatsheet:**
- Use `Object.is` to check for primitive equality first.
- If not equal, check if both are arrays or both are objects.
- Recursively compare keys and values.

```js
/**
 * @param {*} valueA
 * @param {*} valueB
 * @return {boolean}
 */
export default function deepEqual(valueA, valueB) {
  if (Object.is(valueA, valueB)) return true;
  const bothObjects =
    Object.prototype.toString.call(valueA) === '[object Object]' &&
    Object.prototype.toString.call(valueB) === '[object Object]';
  const bothArrays = Array.isArray(valueA) && Array.isArray(valueB);
  if (!bothObjects && !bothArrays) return false;
  if (Object.keys(valueA).length !== Object.keys(valueB).length) return false;
  for (const key in valueA) {
    if (!deepEqual(valueA[key], valueB[key])) return false;
  }
  return true;
}
```

---

### Techniques
- Type detection (`Object.prototype.toString`)
- Recursion
- Short-circuiting for primitives
- Comparing object/array entries

### Edge Cases & Notes
- +0 and -0 are equal; NaN is equal to NaN (with `Object.is`).
- Cyclic objects (circular references) are not handled.
- Property descriptors, non-enumerable, and symbol-keyed properties are not compared.
- For full robustness, see libraries like Lodash's `isEqual`.

### Resources
- [MDN: Object.is](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
- [MDN: Object.prototype.toString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString)
- [A Complete Guide To Check Data Types In JavaScript (zhenghao.io)](https://www.zhenghao.io/posts/js-data-type)

---

## Promise.any (Cheatsheet)

`Promise.any` returns a promise that resolves as soon as any input promise resolves, or rejects with an `AggregateError` if all input promises reject. This is a key async pattern for "first success wins" scenarios.

### Key Points
- Returns a promise that resolves with the first fulfilled value.
- If all input promises reject, rejects with an `AggregateError` of all errors.
- Handles non-promise values as resolved promises.
- If input is empty, rejects with `AggregateError([])`.

---

### Approach 1: Using async/await in forEach
**Cheatsheet:**
- Uses an errors array to track rejections by index.
- Uses a pending counter to know when all have rejected.
- Resolves immediately on first fulfillment.

```js
/**
 * @param {Array} iterable
 * @return {Promise}
 */
export default function promiseAny(iterable) {
  return new Promise((resolve, reject) => {
    if (iterable.length === 0) {
      reject(new AggregateError([]));
      return;
    }
    let pending = iterable.length;
    const errors = new Array(iterable.length);
    iterable.forEach(async (item, index) => {
      try {
        const value = await item;
        resolve(value);
      } catch (err) {
        errors[index] = err;
        pending--;
        if (pending === 0) {
          reject(new AggregateError(errors));
        }
      }
    });
  });
}
```

---

### Approach 2: Using Promise.then (no async/await)
**Cheatsheet:**
- Uses `Promise.resolve(item).then(...)` for each item.
- Tracks errors and pending count.
- Resolves on first fulfillment, rejects with `AggregateError` if all reject.

```js
/**
 * @param {Array} iterable
 * @return {Promise}
 */
export default function promiseAny(iterable) {
  return new Promise((resolve, reject) => {
    if (iterable.length === 0) {
      reject(new AggregateError([]));
      return;
    }
    let pending = iterable.length;
    const errors = new Array(iterable.length);
    iterable.forEach((item, index) =>
      Promise.resolve(item).then(
        value => {
          resolve(value);
        },
        reason => {
          errors[index] = reason;
          pending--;
          if (pending === 0) {
            reject(new AggregateError(errors));
          }
        }
      )
    );
  });
}
```

---

### Techniques
- Promise construction and chaining
- Async/await and .then()
- Error aggregation and order preservation

### Edge Cases & Notes
- If the input array is empty, reject with `AggregateError([])`.
- If all promises reject, reject with `AggregateError(errors)`.
- Only the first fulfillment resolves the returned promise.
- The evaluator does not check for concurrency.

### Resources
- [MDN: Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)

---

## Deep Omit (Cheatsheet)

Deep omit removes specified keys from an object (and all nested objects/arrays) recursively. This is useful for data sanitization, privacy, or API response shaping.

### Clarification Questions
- Can values like Date, Symbol, RegExp appear? (Yes)
- Should we recurse into Map/Set? (No, for simplicity)

### Key Points
- Recursively traverse arrays and plain objects.
- Omit keys at any depth.
- Use a helper to detect plain objects (not Date, RegExp, etc.).
- Do not mutate the original input.

---

### Approach 1: Recursive, Array/Object Split
**Cheatsheet:**
- If value is an array, map recursively.
- If value is a plain object, build a new object omitting specified keys, recursing on values.
- Otherwise, return value as-is.

```js
function isPlainObject(value) {
  if (value == null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}
/**
 * @param {any} val
 * @param {Array<string>} keys
 * @returns any
 */
export default function deepOmit(val, keys) {
  if (Array.isArray(val)) {
    return val.map(item => deepOmit(item, keys));
  }
  if (isPlainObject(val)) {
    const newObj = {};
    for (const key in val) {
      if (!keys.includes(key)) {
        newObj[key] = deepOmit(val[key], keys);
      }
    }
    return newObj;
  }
  return val;
}
```

---

### Approach 2: Recursive, Unified for...in (Arrays/Objects)
**Cheatsheet:**
- Use a single for...in loop for both arrays and objects.
- Use Array.isArray to decide output type.
- Not recommended for TypeScript or clarity, but works for string keys.

```js
function isPlainObject(value) {
  if (value == null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}
export default function deepOmit(val, keys) {
  if (!Array.isArray(val) && !isPlainObject(val)) {
    return val;
  }
  const newObj = Array.isArray(val) ? [] : {};
  for (const key in val) {
    if (!keys.includes(key)) {
      newObj[key] = deepOmit(val[key], keys);
    }
  }
  return newObj;
}
```

---

## Promisify (Cheatsheet)

Promisify is a utility that converts a callback-based function (error-first, Node.js style) into a function that returns a Promise. This is useful for modernizing legacy APIs and working with async/await.

### Key Points
- Takes a function expecting a callback as its last argument.
- Returns a function that returns a Promise.
- The callback must be error-first: (err, result) => ...
- Preserves `this` context by using `call`.

---

### Approach 1: Standard Promisify (with this preservation)
**Cheatsheet:**
- Returns a function that wraps the original with a Promise.
- Uses `func.call(this, ...args, callback)` to preserve context.
- Callback resolves or rejects the Promise.

```js
/**
 * @param {Function} func
 * @returns {Function}
 */
export default function promisify(func) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      func.call(this, ...args, (err, result) =>
        err ? reject(err) : resolve(result)
      );
    });
  };
}
```

---

### Approach 2: Simple Promisify (no this preservation)
**Cheatsheet:**
- Returns a function that wraps the original with a Promise.
- Does not preserve `this` context (useful for standalone functions).

```js
export default function promisify(func) {
  return (...args) =>
    new Promise((resolve, reject) => {
      func(...args, (err, result) =>
        err ? reject(err) : resolve(result)
      );
    });
}
```

---

### Techniques
- Promise construction
- Callback to Promise conversion
- Context (`this`) preservation
- Variadic arguments

### Edge Cases & Notes
- Only works for functions that call the callback once (not for repeated-callback APIs like setInterval).
- Assumes callback is last argument and is error-first.
- For custom callback signatures, see Node.js `util.promisify.custom`.
- Not all callback APIs can/should be promisified.

### Resources
- [Node.js util.promisify](https://nodejs.org/api/util.html#utilpromisifyoriginal)
- [javascript.info: Promisification](https://javascript.info/promisify)

---

## Memoize (Cheatsheet)

Memoization is a technique to cache the results of expensive function calls and return the cached result when the same inputs occur again. This is especially useful for pure functions and recursive algorithms.

### Key Points
- Use a cache (usually a Map) to store results by input argument.
- For single-argument functions, the argument can be used directly as the cache key.
- For multi-argument or complex input, a serialization or hashing strategy is needed.
- The returned function closes over its own cache.
- Preserves `this` context using `call`.

---

### Approach 1: Single-argument Memoize (Map, preserves this)
**Cheatsheet:**
- Uses a Map for O(1) lookups.
- Only works for single-argument functions with primitive or reference-stable arguments.
- Preserves `this` context.

```js
/**
 * @param {Function} func
 * @returns Function
 */
export default function memoize(func) {
  const cache = new Map();
  return function(arg) {
    if (cache.has(arg)) {
      return cache.get(arg);
    }
    const result = func.call(this, arg);
    cache.set(arg, result);
    return result;
  };
}
```

---

### Approach 2: Multi-argument Memoize (using JSON.stringify as key)
**Cheatsheet:**
- Serializes arguments to a string for use as a cache key.
- Works for functions with multiple arguments, but only for JSON-safe values.
- Does not handle functions, symbols, or circular references.

```js
export default function memoize(func) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
```

---

### Techniques
- Closures
- Map for fast cache lookup
- Context (`this`) preservation
- Argument serialization (for multi-argument memoization)

### Edge Cases & Notes
- For objects/functions as arguments, reference equality is used in Map; different objects with same content are not equal.
- JSON.stringify-based keys do not work for all types (functions, symbols, circular refs).
- Memoization is only safe for pure functions (no side effects, same output for same input).
- The cache is per-memoized function instance.
- For more robust solutions, see libraries like Lodash's `_.memoize`.

### Resources
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)

---

## Squash Object (Cheatsheet)

Squashing (flattening) an object means converting a nested object into a single-level object with dot-separated keys representing the path. This is useful for form serialization, config flattening, and more.

### Key Points
- Recursively traverse the object, keeping track of the path.
- When a primitive value is reached, join the path with `.` to form the new key.
- Use `Object.entries` for own enumerable properties.
- Symbol-keyed and non-enumerable properties are ignored.

---

### Approach 1: Recursive Helper with Output Object
**Cheatsheet:**
- Use an inner helper that takes the current path and output object.
- On reaching a primitive, join the path and assign the value.
- On object, recurse for each key.

```js
/**
 * @param {Object} obj
 * @return {Object}
 */
export default function squashObject(obj) {
  function squashImpl(obj_, path, output) {
    for (const [key, value] of Object.entries(obj_)) {
      if (typeof value !== 'object' || value === null) {
        output[path.concat(key).filter(Boolean).join('.')] = value;
      } else {
        squashImpl(value, path.concat(key), output);
      }
    }
  }
  const out = {};
  squashImpl(obj, [], out);
  return out;
}
```

---

### Approach 2: Array/Entries/FlatMap with Object.fromEntries
**Cheatsheet:**
- Use a recursive function that returns an array of [key, value] pairs.
- Use `Object.fromEntries` to build the final object.
- Use `flatMap` to flatten nested arrays of entries.

```js
function traverse(object, path = []) {
  if (typeof object !== 'object' || object === null) {
    return [[path.join('.'), object]];
  }
  return Object.entries(object).flatMap(([key, value]) => {
    const newPath = key === '' ? [...path] : [...path, key];
    return traverse(value, newPath);
  });
}
export default function squashObject(object) {
  return Object.fromEntries(traverse(object));
}
```

---

### Techniques
- Recursion
- Path tracking with arrays
- Object.entries and Object.fromEntries
- Array flattening

### Edge Cases & Notes
- Input must be an object, not a primitive.
- Symbol-keyed and non-enumerable properties are ignored.
- Cyclic objects are not handled.
- Conflicting keys (e.g., `{ a: { b: 1 }, 'a.b': 2 }`) are not resolved.
- Keys can be empty strings.

### Resources
- [MDN: Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
- [MDN: Object.fromEntries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries)

---

## getElementsByClassName (Cheatsheet)

This problem tests your knowledge of DOM traversal, recursion, and class name matching. The goal is to collect all descendant elements of a root element that match a given set of class names.

### Key Points
- Use `element.classList` for class name checks (preferred over `className`).
- Use `element.children` to traverse only element nodes (not text/comments).
- Recursively traverse the DOM tree.
- The root element itself is not included in the results, even if it matches.
- Matching is case-sensitive and ignores duplicate class names.

---

### Approach 1: Recursive Depth-First Traversal
**Cheatsheet:**
- Recursively traverse all descendants of the root element.
- For each element, check if its classList contains all class names in the input.
- Collect matching elements in an array.

```js
function isSubset(a, b) {
  return Array.from(a).every(value => b.contains(value));
}
/**
 * @param {Element} element
 * @param {string} classNames
 * @return {Array<Element>}
 */
export default function getElementsByClassName(element, classNames) {
  const elements = [];
  const classNamesSet = new Set(classNames.trim().split(/\s+/));
  function traverse(el) {
    if (el == null) return;
    if (isSubset(classNamesSet, el.classList)) {
      elements.push(el);
    }
    for (const child of el.children) {
      traverse(child);
    }
  }
  for (const child of element.children) {
    traverse(child);
  }
  return elements;
}
```

---

### Approach 2: Iterative (Breadth-First Traversal)
**Cheatsheet:**
- Uses a queue to traverse the DOM tree level by level.
- For each element, check if its classList contains all class names in the input.
- Collect matching elements in an array.

```js
function isSubset(a, b) {
  return Array.from(a).every(value => b.contains(value));
}
export default function getElementsByClassName(element, classNames) {
  const elements = [];
  const classNamesSet = new Set(classNames.trim().split(/\s+/));
  const queue = Array.from(element.children);
  while (queue.length) {
    const el = queue.shift();
    if (isSubset(classNamesSet, el.classList)) {
      elements.push(el);
    }
    queue.push(...el.children);
  }
  return elements;
}
```

---

### Techniques
- Recursion
- DOM APIs: `classList`, `element.children`
- Breadth-first and depth-first traversal
- Set and DOMTokenList subset checking

### Edge Cases & Notes
- The root element is not included in the results, even if it matches.
- Duplicate class names in input or on the element's class are ignored.
- Whitespace in input and on the element's class are handled.
- Matching is strict subset (all input classes must be present).

### Resources
- [MDN: Element.getElementsByClassName](https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName)
- [MDN: Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)

---

## Curry (Cheatsheet)

Currying transforms a function of N arguments into a sequence of N functions, each taking a single argument. It's a classic functional programming technique and a common interview question.

### Key Points
- Arity: the number of arguments a function expects (`func.length`).
- Use closures to accumulate arguments.
- When enough arguments are collected, call the original function.
- Preserves `this` context using `apply`, `call`, or `bind`.

---

### Approach 1: Basic Curry with apply (single-argument at a time)
**Cheatsheet:**
- Returns a function that accumulates arguments.
- When enough arguments are collected, calls the original function.
- Uses `apply` to preserve `this`.

```js
/**
 * @param {Function} func
 * @return {Function}
 */
export default function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args);
    }
    return (arg) =>
      arg === undefined
        ? curried.apply(this, args)
        : curried.apply(this, [...args, arg]);
  };
}
```

---

### Approach 2: Curry with call (single-argument at a time)
**Cheatsheet:**
- Same as above, but uses `call` for invocation.

```js
export default function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.call(this, ...args);
    }
    return (arg) =>
      arg === undefined
        ? curried.call(this, ...args)
        : curried.call(this, ...args, arg);
  };
}
```

---

### Approach 3: Curry with bind (multiple arguments at a time)
**Cheatsheet:**
- Uses `bind` to accumulate arguments and preserve `this`.
- Allows passing multiple arguments at each step.

```js
export default function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args);
    }
    return curried.bind(this, ...args);
  };
}
```

---

### Techniques
- Closures
- Function arity (`func.length`)
- Function.prototype.apply/call/bind
- Argument accumulation

### Edge Cases & Notes
- Calling with no arguments does nothing unless the function expects zero arguments.
- Functions that use `this` are supported (test with methods).
- Intermediate curried functions are reusable.
- For more robust currying (e.g., supporting placeholders), see Lodash's `curry`.

### Resources
- [LogRocket: Understanding JavaScript currying](https://blog.logrocket.com/understanding-javascript-currying)
- [Lodash curry](https://lodash.com/docs/4.17.15#curry)

---

## HTML Serializer (Cheatsheet)

Serializing a tree-like object structure into an HTML string is a classic recursion and tree traversal problem. This is useful for custom renderers, static site generators, and more.

### Key Points
- Recursively traverse the tree.
- For each node, if it's a string, return as-is (text node).
- For element nodes, wrap children in opening/closing tags.
- Indentation and formatting can be parameterized.

---

### Approach 1: Recursive, Array Join (no indentation)
**Cheatsheet:**
- Recursively build an array of lines.
- For element nodes, wrap children in tags.
- For text nodes, return as-is.
- Join lines with `\n` at the end.

```js
function serializeHTML(element) {
  function traverse(node) {
    if (typeof node === 'string') return node;
    return [
      `<${node.tag}>`,
      ...node.children.flatMap(traverse),
      `</${node.tag}>`
    ];
  }
  return traverse(element).join('\n');
}
```

---

### Approach 2: Recursive with Indentation (final version)
**Cheatsheet:**
- Adds indentation based on depth.
- Parameterizes indentation character (tab or spaces).
- Uses `flatMap` to flatten children arrays.

```js
/**
 * @param {Object} element
 * @param {string} indent
 * @return {string}
 */
export default function serializeHTML(element, indent = '\t') {
  function traverse(element, depth = 0) {
    if (typeof element === 'string') {
      return `${indent.repeat(depth)}${element}`;
    }
    return [
      `${indent.repeat(depth)}<${element.tag.toLowerCase()}>`,
      ...element.children.flatMap(child => traverse(child, depth + 1)),
      `${indent.repeat(depth)}</${element.tag.toLowerCase()}>`
    ].join('\n');
  }
  return traverse(element);
}
```

---

### Techniques
- Recursion
- Tree traversal (depth-first)
- Array flattening (`flatMap`)
- String joining and formatting

### Edge Cases & Notes
- Only works for tree objects with `tag` and `children` properties.
- Does not handle DOM trees with only text nodes at the root.
- Does not handle attributes or self-closing tags.
- Indentation is customizable.
- For more robust solutions, see libraries like React's server-side renderer.

### Resources
- [MDN: Array.prototype.flatMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap)

---

## JSON.stringify (Cheatsheet)

Implementing a simplified version of `JSON.stringify` is a classic recursion and type-checking problem. It tests your understanding of value types, recursion, and string formatting.

### Key Points
- Recursively traverse objects and arrays.
- Handle primitives, arrays, and objects differently.
- Strings must be wrapped in double quotes.
- Use `Array.isArray` for arrays, `typeof` for primitives, and `Object.entries` for objects.

---

### Approach 1: Recursive Type Checks (if/else)
**Cheatsheet:**
- Recursively stringify arrays and objects.
- Strings are wrapped in double quotes.
- Primitives are stringified with `String()`.

```js
/**
 * @param {*} value
 * @return {string}
 */
export default function jsonStringify(value) {
  if (Array.isArray(value)) {
    const arrayValues = value.map(item => jsonStringify(item));
    return `[${arrayValues.join(',')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    const objectEntries = Object.entries(value).map(
      ([key, value]) => `"${key}":${jsonStringify(value)}`
    );
    return `{${objectEntries.join(',')}}`;
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return String(value);
}
```

---

### Approach 2: Recursive Type Switch (cleaner type handling)
**Cheatsheet:**
- Use a helper to get the type, then switch on type.
- Handles null, array, object, string, and default (number, boolean).

```js
function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}
/**
 * @param {*} value
 * @return {string}
 */
export default function jsonStringify(value) {
  const type = getType(value);
  switch (type) {
    case 'array': {
      const arrayValues = value.map(item => jsonStringify(item)).join(',');
      return `[${arrayValues}]`;
    }
    case 'object': {
      const objectValues = Object.entries(value)
        .map(([key, value]) => `"${key}":${jsonStringify(value)}`)
        .join(',');
      return `{${objectValues}}`;
    }
    case 'string':
      return `"${value}"`;
    default:
      // Handles null, boolean, numbers
      return String(value);
  }
}
```

---

### Techniques
- Recursion
- Type checking (typeof, Array.isArray, null)
- Object.entries and array mapping
- String formatting

### Edge Cases & Notes
- Cyclic references are not handled (will cause stack overflow).
- Does not handle undefined, functions, Map, Set, Symbol, RegExp, Date, etc.
- Strings are not escaped (quotes, backslashes, etc.).
- For full compatibility, see the real `JSON.stringify` or libraries.

### Resources
- [MDN: JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)