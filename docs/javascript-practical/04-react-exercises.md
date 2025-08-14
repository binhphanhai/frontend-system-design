# React Exercises

Explore these project ideas to apply your JavaScript knowledge in real-world scenarios.

---

## Cheatsheet: React Todo List Solution

**A classic React coding problem: implement a Todo List with add and delete functionality, accessibility, and safe handling of user input.**

### Key Concepts
- **State:**
  - `tasks`: Array of task objects, each with a unique `id` and `label`.
  - `newTask`: String for the current input value.
- **Unique IDs:**
  - Use a module-level `id` counter to ensure each task has a unique key (important for React list rendering).
- **Controlled Input:**
  - The input field is controlled by React state (`newTask`).
- **Accessibility:**
  - Input uses `aria-label` for screen readers.
  - (Bonus) Consider `aria-live` for announcing new tasks.
- **Security:**
  - React escapes user input by default, preventing XSS.

---

### Test Cases
- Add a new task.
- Add multiple tasks.
- Add tasks with HTML or script tags (should not execute, no XSS).
- Input is cleared after adding a task.
- Delete an existing task.
- Delete multiple tasks.
- Delete newly-added tasks.

---

### Full React Code
```jsx
import { useState } from 'react';

let id = 0;

const INITIAL_TASKS = [
  { id: id++, label: 'Walk the dog' },
  { id: id++, label: 'Water the plants' },
  { id: id++, label: 'Wash the dishes' },
];

export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [newTask, setNewTask] = useState('');

  return (
    <div>
      <h1>Todo List</h1>
      <div>
        <input
          aria-label="Add new task"
          type="text"
          placeholder="Add your task"
          value={newTask}
          onChange={(event) => {
            setNewTask(event.target.value);
          }}
        />
        <div>
          <button
            onClick={() => {
              setTasks(
                tasks.concat({
                  id: id++,
                  label: newTask.trim(),
                })
              );
              setNewTask('');
            }}
          >
            Submit
          </button>
        </div>
      </div>
      <ul>
        {tasks.map(({ id, label }) => (
          <li key={id}>
            <span>{label}</span>
            <button
              onClick={() => {
                setTasks(tasks.filter((task) => task.id !== id));
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Accessibility & UX Notes
- All form inputs should be labeled (`aria-label` or `<label>`).
- For bonus accessibility, use an `aria-live` region to announce new tasks to screen readers.
- Input is cleared after adding a task for a smooth user experience.

---

### Further Reading
- [React Docs: Forms](https://react.dev/learn/forms)
- [React Docs: Lists and Keys](https://react.dev/learn/rendering-lists)
- [MDN: ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [React Security](https://react.dev/learn/security)

---

## Cheatsheet: React Contact Form Solution

**A classic React coding problem: implement a Contact Form using semantic HTML, proper labeling, and native form submission.**

### Key Concepts
- **Semantic HTML:** Use `<form>`, `<label>`, `<input>`, and `<textarea>` for accessibility and browser compatibility.
- **Form Submission:**
  - Use the `action` attribute to specify the API endpoint.
  - Use `method="post"` for POST requests.
  - No JavaScript is required for basic form submission; the browser handles it natively.
- **Field Naming:**
  - The `name` attribute on each field determines the key in the submitted form data.
- **Accessibility:**
  - Use `<label htmlFor="...">` and matching `id` on inputs for proper screen reader support.
  - Avoid nesting `<input>` inside `<label>` for maximum compatibility.

---

### Test Cases
- All fields (`name`, `email`, `message`) can be updated.
- Clicking the submit button triggers form submission.
- Pressing Enter in a field (except `<textarea>`) submits the form if valid.
- Success alert is shown if all fields are filled.

---

### Full React Code
```jsx
import submitForm from './submitForm';

export default function App() {
  return (
    <form
      // Ignore the onSubmit prop, it's used by GFE to
      // intercept the form submit event to check your solution.
      onSubmit={submitForm}
      action="https://questions.greatfrontend.com/api/questions/contact-form"
      method="post"
    >
      <div>
        <label htmlFor="name-input">Name</label>
        <input id="name-input" name="name" type="text" />
      </div>
      <div>
        <label htmlFor="email-input">Email</label>
        <input id="email-input" name="email" type="email" />
      </div>
      <div>
        <label htmlFor="message-input">Message</label>
        <textarea id="message-input" name="message"></textarea>
      </div>
      <div>
        <button>Send</button>
      </div>
    </form>
  );
}
```

---

### Accessibility & UX Notes
- Always link `<label>` to `<input>`/`<textarea>` using `htmlFor` and `id`.
- Do not nest `<input>` inside `<label>` for best assistive tech support.
- Use semantic elements for best browser and accessibility support.

---

### Follow Up
- Try implementing a signup form with AJAX submission and client-side validation for more advanced practice.

---

### Further Reading
- [MDN: HTML forms](https://developer.mozilla.org/en-US/docs/Learn/Forms)
- [MDN: Labeling controls](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label)
- [React Docs: Forms](https://react.dev/learn/forms)

---

## Cheatsheet: React Tabs Solution

**A classic React coding problem: implement a Tabs component with state, API design, and basic styling.**

### Key Concepts
- **State:**
  - Only one state value is needed: the currently active tab (`value`).
- **Props (API Design):**
  - `items`: Array of tab objects, each with `value` (unique id), `label` (tab text), and `panel` (tab content).
  - `defaultValue`: The value of the tab to show by default (falls back to the first item if not provided).
- **Uncontrolled Component:**
  - State is managed internally by the Tabs component.
- **UI:**
  - Render a list of tab buttons and a panel for the active tab.
  - Active tab is styled differently.

---

### Test Cases
- All provided items are displayed as tabs.
- The default active tab is shown on mount.
- Clicking a tab updates the active panel.
- Multiple Tabs components can be used independently.

---

### Accessibility Notes
- This implementation is not fully accessible (no ARIA roles, keyboard navigation, or focus management).
- For production, follow [ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

---

### Full React Code
```jsx
import { useState } from 'react';

export default function Tabs({ defaultValue, items }) {
  const [value, setValue] = useState(
    defaultValue ?? items[0].value,
  );

  return (
    <div className="tabs">
      <div className="tabs-list">
        {items.map(({ label, value: itemValue }) => {
          const isActiveValue = itemValue === value;

          return (
            <button
              key={itemValue}
              type="button"
              className={[
                'tabs-list-item',
                isActiveValue && 'tabs-list-item--active',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                setValue(itemValue);
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div>
        {items.map(({ panel, value: itemValue }) => (
          <div key={itemValue} hidden={itemValue !== value}>
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Further Reading & Resources
- [ARIA Tabs Pattern (WAI-ARIA)](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [Tabs – Radix Primitives](https://www.radix-ui.com/primitives/docs/components/tabs)
- [Tabs – React Aria](https://react-spectrum.adobe.com/react-aria/Tabs.html)
- [Tabs – Headless UI](https://headlessui.com/react/tabs)
- [Tab – Ariakit](https://ariakit.org/components/tab)
- [Tabs | Reach UI](https://reach.tech/tabs)

---

## Cheatsheet: React Job Board Solution

**A classic React coding problem: implement a Job Board with paginated data fetching, state management, and robust UI.**

### High-Level Approach
1. Fetch the list of all job IDs from the API.
2. Fetch job details for the current page of job IDs.
3. Render jobs as cards in a grid layout.
4. Fetch more jobs when the "Load more jobs" button is pressed.

---

### State Variables
- `fetchingJobDetails`: Boolean, tracks if job details are being fetched (disables the button, shows loading state).
- `page`: Current page number (increments on "Load more").
- `jobIds`: Array of all job IDs from the API (null until loaded).
- `jobs`: Array of job detail objects for the current board.
- `isMounted`: Ref to prevent state updates after unmount (avoids React warnings).

---

### Data Fetching
- **`fetchJobIds(currPage)`**: Fetches all job IDs once, slices the array for the current page.
- **`fetchJobs(currPage)`**: Fetches job details for the current page's job IDs, appends to `jobs` state.
- **`useEffect`**: Triggers `fetchJobs` when `page` changes. Cleans up on unmount to avoid race conditions.

---

### Rendering
- Uses CSS Grid for job cards.
- "Load more jobs" button is disabled while fetching.
- Shows a loading message until job IDs are loaded.

---

### Test Cases
1. **Initial Loading:** "Loading..." is shown until job IDs are fetched.
2. **Job Postings:** Job cards display title, poster, and timestamp.
3. **Job Links:** Clicking a job title opens the correct URL in a new tab (if present).
4. **Pagination:** "Load more" fetches and displays more jobs.
5. **Button State:** Button is disabled while fetching.
6. **Keyboard Navigation:** All interactive elements are accessible by keyboard.

---

### Notes
- This solution does not handle API errors—consider adding error handling for production.
- Handles race conditions and unmounting with a ref.
- Uses `Promise.all` for parallel job detail fetching.

---

### Full React Code
```jsx
import { useEffect, useRef, useState } from 'react';
import JobPosting from './JobPosting';

const PAGE_SIZE = 6;

export default function App() {
  const [fetchingJobDetails, setFetchingJobDetails] = useState(false);
  const [page, setPage] = useState(0);
  const [jobIds, setJobIds] = useState(null);
  const [jobs, setJobs] = useState([]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    fetchJobs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchJobIds(currPage) {
    let jobsList = jobIds;
    if (!jobsList) {
      const res = await fetch(
        'https://hacker-news.firebaseio.com/v0/jobstories.json',
      );
      jobsList = await res.json();
      if (!isMounted.current) return;
      setJobIds(jobsList);
    }
    const start = currPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return jobsList.slice(start, end);
  }

  async function fetchJobs(currPage) {
    const jobIdsForPage = await fetchJobIds(currPage);
    setFetchingJobDetails(true);
    const jobsForPage = await Promise.all(
      jobIdsForPage.map((jobId) =>
        fetch(
          `https://hacker-news.firebaseio.com/v0/item/${jobId}.json`,
        ).then((res) => res.json()),
      ),
    );
    if (!isMounted.current) return;
    setFetchingJobDetails(false);
    const combinedJobs = [...jobs, ...jobsForPage];
    setJobs(combinedJobs);
  }

  return (
    <div className="app">
      <h1 className="title">Hacker News Jobs Board</h1>
      {jobIds == null ? (
        <p className="loading">Loading...</p>
      ) : (
        <div>
          <div className="jobs" role="list">
            {jobs.map((job) => (
              <JobPosting key={job.id} {...job} />
            ))}
          </div>
          {jobs.length > 0 &&
            page * PAGE_SIZE + PAGE_SIZE < jobIds.length && (
              <button
                className="load-more-button"
                disabled={fetchingJobDetails}
                onClick={() => setPage(page + 1)}
              >
                {fetchingJobDetails ? 'Loading...' : 'Load more jobs'}
              </button>
            )}
        </div>
      )}
    </div>
  );
}
```

---

### Further Reading
- [React Docs: useEffect](https://react.dev/reference/react/useEffect)
- [React Docs: Managing State](https://react.dev/learn/state-a-components-memory)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

## Cheatsheet: React Accordion Solution

**A classic React coding problem: implement an Accordion component with expand/collapse functionality and independent state.**

### Key Concepts
- **State:**
  - Use a `Set` to track which sections are expanded (multiple can be open at once).
- **Props (API Design):**
  - `sections`: Array of section objects, each with:
    - `value`: Unique identifier for the section.
    - `title`: The text label for the section header.
    - `contents`: The content to show when expanded.
- **UI:**
  - Render a list of section headers as buttons.
  - Clicking a header toggles its expanded/collapsed state.
  - Each section can be expanded/collapsed independently.

---

### Test Cases
- All provided sections are displayed.
- Clicking a collapsed section expands it.
- Clicking an expanded section collapses it.
- All sections can be expanded/collapsed independently.
- Multiple Accordion components can be used independently.

---

### Accessibility Notes
- Section headers are rendered as `<button>` for keyboard accessibility.
- This implementation is not fully accessible (no ARIA roles, states, or keyboard navigation beyond button focus).
- For production, follow [ARIA Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion).

---

### Full React Code
```jsx
import { useState } from 'react';

export default function Accordion({ sections }) {
  const [openSections, setOpenSections] = useState(new Set());

  return (
    <div className="accordion">
      {sections.map(({ value, title, contents }) => {
        const isExpanded = openSections.has(value);
        return (
          <div className="accordion-item" key={value}>
            <button
              className="accordion-item-title"
              type="button"
              onClick={() => {
                const newOpenSections = new Set(openSections);
                newOpenSections.has(value)
                  ? newOpenSections.delete(value)
                  : newOpenSections.add(value);
                setOpenSections(newOpenSections);
              }}
            >
              {title}
              <span
                aria-hidden={true}
                className={[
                  'accordion-icon',
                  isExpanded && 'accordion-icon--rotated',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            </button>
            <div
              className="accordion-item-contents"
              hidden={!isExpanded}
            >
              {contents}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

### Further Reading & Resources
- [ARIA Accordion Pattern (WAI-ARIA)](https://www.w3.org/WAI/ARIA/apg/patterns/accordion)
- [Accordion – Radix Primitives](https://www.radix-ui.com/primitives/docs/components/accordion)
- [Accordion – Headless UI](https://headlessui.com/react/accordion)
- [Accordion – React Aria](https://react-spectrum.adobe.com/react-aria/Accordion.html)

---

## Cheatsheet: React Star Rating Solution

**A classic React coding problem: implement a Star Rating component with interactive highlighting and selection.**

### Key Concepts
- **Component Structure:**
  - `Star`: Renders a single SVG star, filled or outlined based on the `filled` prop.
  - `StarRating`: Renders a row of stars, manages selection and hover state.
- **State:**
  - `hoveredIndex`: Tracks which star is currently hovered (for highlight effect).
- **Highlight Logic:**
  - If a star is hovered, all stars up to and including that index are highlighted.
  - If not hovered, all stars up to the current value are highlighted.
- **Props:**
  - `value`: Current rating value (number of filled stars).
  - `max`: Maximum number of stars.
  - `onChange`: Callback when a star is clicked (sets new value).

---

### Test Cases
- Clicking a star sets the rating and highlights the correct number of stars.
- Hovering over a star highlights all stars up to that one; moving the cursor away restores the previous state.
- Multiple StarRating components can be rendered independently.

---

### Improvement Notes
- To allow form submission, embed a hidden `<input>` with the value.
- Add keyboard support for accessibility (e.g., arrow keys, Enter/Space to select).
- Add RTL (right-to-left) support for internationalization.

---

### Full React Code
```jsx
import { useState } from 'react';

function Star({ filled }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={[
        'star-icon',
        filled ? 'star-icon-filled' : '',
      ].join(' ')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

export default function StarRating({ value, max, onChange }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div>
      {Array.from({ length: max }).map((_, index) => (
        <span
          key={index}
          tabIndex={0}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => onChange(index + 1)}
        >
          <Star
            filled={
              hoveredIndex != null
                ? index <= hoveredIndex
                : index < value
            }
          />
        </span>
      ))}
    </div>
  );
}
```

---

### Further Reading & Resources
- [Building a Star Rating Component in React (freeCodeCamp)](https://www.freecodecamp.org/news/building-a-star-rating-component-with-react/)
- [MDN: SVG Element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)

---

## Cheatsheet: React Image Carousel Solution

**A classic React coding problem: implement an Image Carousel with navigation, cycling, and accessibility.**

### Key Concepts
- **Rendering:**
  - Carousel container with fixed height (400px) and max width (600px or 100vw).
  - Image displayed with `object-fit: contain` to preserve aspect ratio.
  - Prev/Next buttons are absolutely positioned and vertically centered.
  - Page buttons are centered below the image for direct navigation.
- **State:**
  - `currIndex`: The index of the currently displayed image.
- **Navigation:**
  - Prev/Next buttons cycle through images (wrap around at ends).
  - Page buttons jump directly to a specific image.
- **Classnames:**
  - Utility function `clsx` for conditional class names.

---

### Test Cases
1. Carousel displays the first image on load.
2. Prev/Next buttons navigate images and cycle at ends.
3. Page buttons jump to the correct image.
4. All images are accessible through navigation.
5. Carousel is centered, max size is 600x400px, images maintain aspect ratio.
6. Empty space is filled with black.

---

### Accessibility Notes
- All images have descriptive `alt` text.
- All buttons have `aria-label` for screen readers.
- (Bonus) For full accessibility, add an `aria-live` region to announce image changes.

---

### Full React Code
```jsx
import { useState } from 'react';

function clsx(...classnames) {
  return classnames.filter(Boolean).join(' ');
}

export default function ImageCarousel({ images }) {
  const [currIndex, setCurrIndex] = useState(0);
  const currImage = images[currIndex];

  return (
    <div className="image-carousel">
      <img
        alt={currImage.alt}
        src={currImage.src}
        key={currImage.src}
        className="image-carousel__image"
      />
      <button
        aria-label="Previous image"
        className="image-carousel__button image-carousel__button--prev"
        onClick={() => {
          const nextIndex = (currIndex - 1 + images.length) % images.length;
          setCurrIndex(nextIndex);
        }}
      >
        &#10094;
      </button>
      <div className="image-carousel__pages">
        {images.map(({ alt, src }, index) => (
          <button
            className={clsx(
              'image-carousel__pages__button',
              index === currIndex && 'image-carousel__pages__button--active',
            )}
            aria-label={`Navigate to ${alt}`}
            key={src}
            onClick={() => {
              setCurrIndex(index);
            }}
          />
        ))}
      </div>
      <button
        aria-label="Next image"
        className="image-carousel__button image-carousel__button--next"
        onClick={() => {
          const nextIndex = (currIndex + 1) % images.length;
          setCurrIndex(nextIndex);
        }}
      >
        &#10095;
      </button>
    </div>
  );
}
```

---

### Further Reading & Resources
- [MDN: object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)
- [Accessible Carousels (Deque)](https://www.deque.com/blog/creating-accessible-carousels/)

---

## Cheatsheet: React Progress Bars Solution

**A classic React coding problem: implement animated progress bars that fill independently when added.**

### Key Concepts
- **State:**
  - The number of bars is tracked in a single state variable (`bars`).
  - Each `ProgressBar` manages its own animation state (`startTransition`).
- **Styling:**
  - Use CSS `transform: scaleX()` for the fill animation (GPU-accelerated, smooth).
  - `transform-origin: left` ensures the bar fills from left to right.
- **Animation:**
  - Each bar animates from empty to full using a CSS transition.
  - Animation is triggered after the bar is mounted (using `useEffect`).

---

### Test Cases
- Clicking "Add" appends a new progress bar that animates from empty to full.
- Multiple bars can be added and animate independently.

---

### Full React Code
```jsx
import { useEffect, useState } from 'react';

function ProgressBar() {
  const [startTransition, setStartTransition] = useState(false);

  // Start transition after first render and never apply this effect again.
  useEffect(() => {
    if (!startTransition) {
      setStartTransition(true);
    }
  }, [startTransition]);

  return (
    <div className="bar">
      <div
        className={[
          'bar-contents',
          startTransition && 'bar-contents--filled',
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </div>
  );
}

export default function App() {
  const [bars, setBars] = useState(0);

  return (
    <div className="wrapper">
      <div>
        <button
          onClick={() => {
            setBars(bars + 1);
          }}
        >
          Add
        </button>
      </div>
      <div className="bars">
        {Array(bars)
          .fill(null)
          .map((_, index) => (
            <ProgressBar key={index} />
          ))}
      </div>
    </div>
  );
}
```

---

### CSS for Progress Bars
```css
body {
  font-family: sans-serif;
}

.wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
}

.bars {
  display: flex;
  flex-direction: column;
  row-gap: 8px;
}

.bar {
  background-color: #ccc;
  height: 8px;
}

.bar-contents {
  background-color: green;
  height: 100%;
  transform: scaleX(0);
  transform-origin: left;
  transition-duration: 2000ms;
  transition-property: transform;
  transition-timing-function: linear;
}

.bar-contents--filled {
  transform: scaleX(1);
}
```

---

### Further Reading & Resources
- [MDN: CSS Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [MDN: CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)

---

## Cheatsheet: React Like Button Solution

**A classic React coding problem: implement a Like Button with loading, error, and toggling states, including API request handling.**

### Key Concepts
- **State:**
  - `liked`: Boolean, tracks if the button is in the liked state.
  - `isPending`: Boolean, tracks if an API request is in progress (disables the button, shows spinner).
  - `errorMessage`: String, error message from the API if the request fails.
- **API Request Flow:**
  1. Set loading state and clear error.
  2. Make a POST request to the API with the action (`like` or `unlike`).
  3. If successful, toggle the liked state.
  4. If failed, show the error message.
  5. Always clear the loading state at the end.
- **UX:**
  - Button is disabled while loading to prevent double clicks.
  - Shows a spinner while loading.
  - Shows an error message if the request fails.

---

### Test Cases
- Hovering the button shows the hovered state (if styled).
- Clicking toggles the liked state after a successful request.
- Shows a loading spinner while the request is pending.
- Shows an error message if the request fails.
- Button is disabled while loading to prevent multiple requests.

---

### Notes
- Disabling the button during a request prevents double submissions and race conditions.
- For real-world use, consider debouncing rapid clicks and handling network errors more robustly.

---

### Full React Code
```jsx
import { useState } from 'react';
import { HeartIcon, SpinnerIcon } from './icons';

function classNames(...args) {
  return args.filter(Boolean).join(' ');
}

export default function App() {
  // Determines if the button is in the default/liked state.
  const [liked, setLiked] = useState(false);
  // Whether there's a pending background API request.
  const [isPending, setIsPending] = useState(false);
  // Error message to be shown if the API request failed.
  const [errorMessage, setErrorMessage] = useState(null);

  async function likeUnlikeAction() {
    try {
      setIsPending(true);
      setErrorMessage(null);

      const response = await fetch(
        'https://questions.greatfrontend.com/api/questions/like-button',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: liked ? 'unlike' : 'like',
          }),
        },
      );

      if (!response.ok) {
        const res = await response.json();
        setErrorMessage(res.message);
        return;
      }

      setLiked(!liked);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="button-container">
      <button
        className={classNames(
          'like-button',
          liked ? 'like-button--liked' : 'like-button--default',
        )}
        disabled={isPending}
        onClick={() => {
          likeUnlikeAction();
        }}
      >
        {isPending ? <SpinnerIcon /> : <HeartIcon />}
        {liked ? 'Liked' : 'Like'}
      </button>
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}
    </div>
  );
}
```

---

### Further Reading & Resources
- [React Docs: Handling Events](https://react.dev/learn/responding-to-events)
- [MDN: fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

## Cheatsheet: React Traffic Light Solution

**A classic React coding problem: implement a Traffic Light as a state machine with configurable states, durations, and layout.**

### Key Concepts
- **State Machine:**
  - Each color/state has a duration and a next state.
  - The current color is tracked in state and updated on a timer.
- **Configurable:**
  - The `config` object defines the states, their durations, next state, and color.
  - The component is reusable for any number of states/colors/layouts.
- **Layout:**
  - Flexbox is used for vertical or horizontal arrangement.
- **Accessibility:**
  - `aria-live="polite"` and `aria-label` announce the current light to screen readers.
  - The visual lights are hidden from screen readers with `aria-hidden="true"`.

---

### Test Cases
- Each light is shown for the specified duration.
- Lights transition to the next state correctly.
- Both vertical and horizontal layouts are supported.

---

### Full React Code
```jsx
import { useEffect, useState } from 'react';

function Light({ backgroundColor }) {
  return (
    <div
      aria-hidden={true}
      className="traffic-light"
      style={{ backgroundColor }}
    />
  );
}

export function TrafficLight({
  initialColor = 'green',
  config,
  layout = 'vertical',
}) {
  const [currentColor, setCurrentColor] = useState(initialColor);

  useEffect(() => {
    const { duration, next } = config[currentColor];
    const timerId = setTimeout(() => {
      setCurrentColor(next);
    }, duration);
    return () => {
      clearTimeout(timerId);
    };
  }, [currentColor, config]);

  return (
    <div
      aria-live="polite"
      aria-label={`Current light: ${currentColor}`}
      className={[
        'traffic-light-container',
        layout === 'vertical' && 'traffic-light-container--vertical',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {Object.keys(config).map((color) => (
        <Light
          key={color}
          backgroundColor={
            color === currentColor ? config[color].backgroundColor : undefined
          }
        />
      ))}
    </div>
  );
}

// Usage Example
const config = {
  red: {
    backgroundColor: 'red',
    duration: 4000,
    next: 'green',
  },
  yellow: {
    backgroundColor: 'yellow',
    duration: 500,
    next: 'red',
  },
  green: {
    backgroundColor: 'green',
    duration: 3000,
    next: 'yellow',
  },
};

export default function App() {
  return (
    <div className="wrapper">
      <TrafficLight config={config} />
      <TrafficLight config={config} layout="horizontal" />
    </div>
  );
}
```

---

### Accessibility Notes
- `aria-live` and `aria-label` make the current light state available to screen readers.
- Visual lights are hidden from screen readers with `aria-hidden`.

---

### Further Reading & Resources
- [MDN: setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
- [ARIA: Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [React Docs: useEffect](https://react.dev/reference/react/useEffect)

---

## Cheatsheet: React Digital Clock Solution

**A classic React coding problem: implement a Digital Clock with a segment display, accurate update loop, and accessibility support.**

### Key Concepts
- **Update Loop:**
  - Use a custom `useCurrentDate` hook with `setInterval` to update the clock every 100ms for smooth, accurate time.
  - Always clear the timer on unmount to avoid memory leaks.
- **Rendering:**
  - Use `Digit` and `Separator` components to render each digit and colon.
  - Each `Digit` is rendered using two squares and CSS borders to mimic a segment display.
  - Time is split into hours, minutes, and seconds, each rendered as two digits.
- **Accessibility:**
  - Use a `<time>` element with a `datetime` attribute for screen readers.
  - The visual digit/segment display is hidden from screen readers with `aria-hidden`.

---

### Test Cases
- Clock updates every second.
- Each digit is displayed correctly for at least 10 seconds.
- The time is accessible to screen readers.

---

### Full React Code
```jsx
import { useEffect, useState } from 'react';

const ALL_SIDES = [
  'digit-square-border-top',
  'digit-square-border-left',
  'digit-square-border-right',
  'digit-square-border-bottom',
];

const NUMBER_TO_CLASSES = {
  0: {
    top: [
      'digit-square-border-top',
      'digit-square-border-left',
      'digit-square-border-right',
    ],
    bottom: [
      'digit-square-border-bottom',
      'digit-square-border-left',
      'digit-square-border-right',
    ],
  },
  1: {
    top: ['digit-square-border-right'],
    bottom: ['digit-square-border-right'],
  },
  2: {
    top: [
      'digit-square-border-top',
      'digit-square-border-right',
      'digit-square-border-bottom',
    ],
    bottom: [
      'digit-square-border-top',
      'digit-square-border-left',
      'digit-square-border-bottom',
    ],
  },
  3: {
    top: [
      'digit-square-border-top',
      'digit-square-border-right',
      'digit-square-border-bottom',
    ],
    bottom: [
      'digit-square-border-top',
      'digit-square-border-right',
      'digit-square-border-bottom',
    ],
  },
  4: {
    top: [
      'digit-square-border-left',
      'digit-square-border-right',
      'digit-square-border-bottom',
    ],
    bottom: [
      'digit-square-border-right',
      'digit-square-border-top',
    ],
  },
  5: {
    top: [
      'digit-square-border-top',
      'digit-square-border-left',
      'digit-square-border-bottom',
    ],
    bottom: [
      'digit-square-border-top',
      'digit-square-border-right',
      'digit-square-border-bottom',
    ],
  },
  6: {
    top: [
      'digit-square-border-top',
      'digit-square-border-left',
      'digit-square-border-bottom',
    ],
    bottom: ALL_SIDES,
  },
  7: {
    top: [
      'digit-square-border-top',
      'digit-square-border-right',
    ],
    bottom: ['digit-square-border-right'],
  },
  8: {
    top: ALL_SIDES,
    bottom: ALL_SIDES,
  },
  9: {
    top: ALL_SIDES,
    bottom: [
      'digit-square-border-top',
      'digit-square-border-right',
      'digit-square-border-bottom',
    ],
  },
};

function Digit({ number }) {
  const { top, bottom } = NUMBER_TO_CLASSES[number];
  return (
    <div>
      <div
        className={[
          'digit-square',
          'digit-square-top',
          ...top,
        ].join(' ')}
        aria-hidden="true"
      />
      <div
        className={[
          'digit-square',
          'digit-square-bottom',
          ...bottom,
        ].join(' ')}
        aria-hidden="true"
      />
    </div>
  );
}

function Separator() {
  return (
    <div className="separator" aria-hidden="true">
      <div className="separator-dot" />
      <div className="separator-dot" />
    </div>
  );
}

function useCurrentDate() {
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const timer = window.setInterval(() => {
      setDate(new Date());
    }, 100);
    return () => {
      window.clearInterval(timer);
    };
  }, []);
  return date;
}

function padTwoDigit(number) {
  return number >= 10 ? String(number) : `0${number}`;
}

export default function App() {
  const date = useCurrentDate();
  let hours = date.getHours() % 12;
  hours = hours === 0 ? 12 : hours;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const dateTimeDisplay = `${padTwoDigit(date.getHours())}:${padTwoDigit(minutes)}:${padTwoDigit(seconds)}`;
  return (
    <time className="clock" dateTime={dateTimeDisplay}>
      <Digit number={parseInt(hours / 10, 10)} />
      <Digit number={hours % 10} />
      <Separator />
      <Digit number={parseInt(minutes / 10, 10)} />
      <Digit number={minutes % 10} />
      <Separator />
      <Digit number={parseInt(seconds / 10, 10)} />
      <Digit number={seconds % 10} />
    </time>
  );
}
```

---

### CSS for Digital Clock
```css
body {
  font-family: sans-serif;
}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.clock {
  --segment-width: 10px;
  --segment-size: 40px;
  --segment-color: #fff;

  background-color: #000;
  border: 10px solid #ccc;
  border-radius: 10px;
  display: flex;
  gap: 10px;
  padding: 20px;
}

.digit-square {
  border-style: solid;
  border-color: transparent;
  border-width: var(--segment-width);
  box-sizing: border-box;
  height: var(--segment-size);
  width: var(--segment-size);
}

.digit-square-top {
  border-bottom-width: calc(var(--segment-width) / 2);
}

.digit-square-bottom {
  border-top-width: calc(var(--segment-width) / 2);
}

.digit-square-border-top {
  border-top-color: var(--segment-color);
}

.digit-square-border-left {
  border-left-color: var(--segment-color);
}

.digit-square-border-right {
  border-right-color: var(--segment-color);
}

.digit-square-border-bottom {
  border-bottom-color: var(--segment-color);
}

.separator {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.separator-dot {
  background-color: var(--segment-color);
  border-radius: var(--segment-width);
  height: var(--segment-width);
  width: var(--segment-width);
}
```

---

### Further Reading & Resources
- [MDN: Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MDN: setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)
- [MDN: `<time>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time)

---

## Cheatsheet: React Stop Watch Solution

**A classic React coding problem: implement a Stop Watch with accurate timing, start/stop/reset, and accessible controls.**

### Key Concepts
- **Timer Accuracy:**
  - Do not rely on setInterval's delay for accuracy; always calculate elapsed time using Date.now() in the interval callback.
  - Use a ref (`lastTickTiming`) to store the last tick time for precise delta calculation.
- **State:**
  - `totalDuration`: Total elapsed time in ms.
  - `timerId`: The interval timer ID (null if not running).
  - `isRunning`: Derived from whether `timerId` is set.
- **Functions:**
  - `startTimer()`: Starts the timer and updates `totalDuration` based on real elapsed time.
  - `stopInterval()`: Stops the timer.
  - `resetTimer()`: Stops the timer and resets duration.
  - `toggleTimer()`: Toggles between start and stop.
- **Formatting:**
  - Time is formatted into hours, minutes, seconds, and hundredths of a second.

---

### Test Cases
- Clicking "Start" begins the timer and updates the display.
- Clicking "Stop" pauses the timer.
- Clicking "Start" again resumes from the paused time.
- Clicking "Reset" stops and resets the timer to 0.
- Clicking the time display toggles start/stop.
- All controls are accessible by keyboard (Tab, Enter, Space).

---

### Accessibility & User Experience
- The time display is rendered as a `<button>` for full keyboard and screen reader accessibility.
- `user-select: none` can be added to prevent accidental text selection.
- All interactive elements are focusable and usable with keyboard.

---

### Full React Code
```jsx
import { useRef, useState } from 'react';

const MS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const MS_IN_HOUR = MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MS_IN_SECOND;
const MS_IN_MINUTE = SECONDS_IN_MINUTE * MS_IN_SECOND;

function formatTime(timeParam) {
  let time = timeParam;
  const parts = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    ms: 0,
  };
  if (time > MS_IN_HOUR) {
    parts.hours = Math.floor(time / MS_IN_HOUR);
    time %= MS_IN_HOUR;
  }
  if (time > MS_IN_MINUTE) {
    parts.minutes = Math.floor(time / MS_IN_MINUTE);
    time %= MS_IN_MINUTE;
  }
  if (time > MS_IN_SECOND) {
    parts.seconds = Math.floor(time / MS_IN_SECOND);
    time %= MS_IN_SECOND;
  }
  parts.ms = time;
  return parts;
}

function padTwoDigit(number) {
  return number >= 10 ? String(number) : `0${number}`;
}

export default function Stopwatch() {
  const lastTickTiming = useRef(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [timerId, setTimerId] = useState(null);
  const isRunning = timerId != null;

  function startTimer() {
    lastTickTiming.current = Date.now();
    setTimerId(
      window.setInterval(() => {
        const now = Date.now();
        const timePassed = now - lastTickTiming.current;
        setTotalDuration((duration) => duration + timePassed);
        lastTickTiming.current = now;
      }, 1),
    );
  }

  function stopInterval() {
    window.clearInterval(timerId);
    setTimerId(null);
  }

  function resetTimer() {
    stopInterval();
    setTotalDuration(0);
  }

  function toggleTimer() {
    if (isRunning) {
      stopInterval();
    } else {
      startTimer();
    }
  }

  const formattedTime = formatTime(totalDuration);

  return (
    <div>
      <button
        className="time"
        onClick={toggleTimer}
        style={{ userSelect: 'none' }}
      >
        {formattedTime.hours > 0 && (
          <span>
            <span className="time-number">{formattedTime.hours}</span>
            <span className="time-unit">h</span>
          </span>
        )}{' '}
        {formattedTime.minutes > 0 && (
          <span>
            <span className="time-number">{formattedTime.minutes}</span>
            <span className="time-unit">m</span>
          </span>
        )}{' '}
        <span>
          <span className="time-number">{formattedTime.seconds}</span>
          <span className="time-unit">s</span>
        </span>{' '}
        <span className="time-number time-number--small">
          {padTwoDigit(Math.floor(formattedTime.ms / 10))}
        </span>
      </button>
      <div>
        <button onClick={toggleTimer}>{isRunning ? 'Stop' : 'Start'}</button>{' '}
        <button onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
}
```

---

### Further Reading & Resources
- [MDN: setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)
- [MDN: Date.now()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now)
- [React Docs: useRef](https://react.dev/reference/react/useRef)

---

## Cheatsheet: React File Explorer Solution

**A classic React coding problem: implement a File Explorer with expandable/collapsible directories, sorting, and recursive rendering.**

### Key Concepts
- **Component Structure:**
  - `FileExplorer`: Top-level component, receives the file tree data.
  - `FileList`: Renders a list of files/directories, sorts directories before files, and sorts alphabetically.
  - `FileObject`: Renders a single file or directory. If a directory, can be expanded/collapsed and recursively renders its children.
- **Rendering Approach:**
  - Uses a nested structure (recursive components) for intuitive indentation and easy removal of entire subtrees.
  - Each directory can be expanded/collapsed independently (state is local to each `FileObject`).
  - Indentation is managed by passing a `level` prop.
- **Sorting:**
  - Directories are listed before files at each level.
  - Both directories and files are sorted alphabetically.

---

### Test Cases
1. All file and directory names are displayed correctly.
2. Directories appear before files and are sorted alphabetically.
3. Files are sorted alphabetically.
4. Clicking a directory toggles its expanded/collapsed state.
5. Nested directories can be expanded/collapsed independently.
6. Indentation reflects directory depth.
7. Files are not expandable or interactive.
8. Empty directories can be expanded/collapsed.
9. Expanded/collapsed state persists for each directory instance.

---

### Accessibility Notes
- Directory and file names are rendered as `<button>`s for keyboard accessibility.
- For full accessibility (ARIA treeview roles, keyboard navigation), see [ARIA Tree View Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview).

---

### Full React Code
```jsx
// App.js
import FileExplorer from './FileExplorer';

export default function App() {
  const data = [
    { id: 1, name: 'README.md' },
    {
      id: 2,
      name: 'Documents',
      children: [
        { id: 3, name: 'Word.doc' },
        { id: 4, name: 'Powerpoint.ppt' },
      ],
    },
    {
      id: 5,
      name: 'Downloads',
      children: [
        { id: 6, name: 'unnamed.txt' },
        {
          id: 7,
          name: 'Misc',
          children: [
            { id: 8, name: 'foo.txt' },
            { id: 9, name: 'bar.txt' },
          ],
        },
      ],
    },
  ];
  return <FileExplorer data={data} />;
}

// FileExplorer.js
import { useState } from 'react';
import FileList from './FileList';

export default function FileExplorer({ data }) {
  return (
    <div>
      <FileList fileList={data} level={1} />
    </div>
  );
}

export function FileObject({ file, level }) {
  const [expanded, setExpanded] = useState(false);
  const { children: fileChildren, name: fileName } = file;
  const isDirectory = Boolean(fileChildren);

  return (
    <li className="file-item" style={{ paddingLeft: `${level * 16}px` }}>
      <button
        className={[
          'file-item-button',
          isDirectory && 'file-item-button--directory',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => {
          if (!isDirectory) return;
          setExpanded(!expanded);
        }}
      >
        <span>{fileName}</span>{' '}
        {isDirectory && <>[{expanded ? '-' : '+'}]</>}
      </button>
      {fileChildren && fileChildren.length > 0 && expanded && (
        <FileList fileList={fileChildren} level={level + 1} />
      )}
    </li>
  );
}

// FileList.js
import { FileObject } from './FileExplorer';

export default function FileList({ fileList, level }) {
  const directories = fileList.filter((fileItem) => fileItem.children);
  directories.sort((a, b) => a.name.localeCompare(b.name));
  const nonDirectories = fileList.filter((fileItem) => !fileItem.children);
  nonDirectories.sort((a, b) => a.name.localeCompare(b.name));
  const items = [...directories, ...nonDirectories];
  return (
    <ul className="file-list">
      {items.map((file) => (
        <FileObject key={file.id} file={file} level={level} />
      ))}
    </ul>
  );
}
```

---

### Further Reading & Resources
- [ARIA Tree View Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview)
- [GitHub File Explorer Example](https://github.com/yangshun/top-javascript-interview-questions/tree/main/questions)
- [VS Code Tree View Virtualization](https://github.dev/yangshun/top-javascript-interview-questions/)

---

## Cheatsheet: React Tic-tac-toe Solution

**A classic React coding problem: implement a responsive, accessible Tic-tac-toe game with winner/draw logic and reset.**

### Key Concepts
- **Rendering:**
  - Uses CSS Grid for a responsive 3x3 board.
  - Each cell is a `<button>` for accessibility and keyboard support.
  - Font size and aspect ratio are responsive for all screen sizes.
- **State:**
  - `board`: Array of 9 values (`'X'`, `'O'`, or `null`) representing the board.
  - `xIsPlaying`: Boolean, true if it's X's turn, false for O.
- **Winner Logic:**
  - `determineWinner(board)`: Checks all possible winning lines for three-in-a-row.
  - Returns the winner (`'X'` or `'O'`) or `null` if no winner yet.
- **Draw Logic:**
  - If all cells are filled and no winner, it's a draw.
- **Reset:**
  - Resets the board and turn to initial state. If the game is not over, asks for confirmation before resetting.

---

### Test Cases
- Initial board is empty, X goes first.
- Clicking a cell marks it with the current player's symbol and switches turn.
- Winner is detected and announced; no further moves allowed after win.
- Draw is detected and announced if all cells are filled with no winner.
- Reset button clears the board and restarts the game.
- All controls and status messages are accessible to screen readers.
- Game is responsive and playable on all screen sizes.

---

### Accessibility Notes
- Each cell button has an `aria-label` describing the action (e.g., "Mark cell 4 as X").
- Status message uses `aria-live="polite"` for screen readers.
- Cell mark is hidden from screen readers with `aria-hidden` to avoid redundancy.
- Fully keyboard accessible.

---

### Full React Code
```jsx
import { useState } from 'react';

// List of cell indices that are 3-in-a-row.
const CELLS_IN_A_LINE = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Determine if there's a winner for the board.
function determineWinner(board) {
  for (let i = 0; i < CELLS_IN_A_LINE.length; i++) {
    const [x, y, z] = CELLS_IN_A_LINE[i];
    if (
      board[x] != null &&
      board[x] === board[y] &&
      board[y] === board[z]
    ) {
      return board[x];
    }
  }
  return null;
}

function Cell({ index, disabled, mark, turn, onClick }) {
  return (
    <button
      aria-label={
        mark == null ? `Mark cell ${index} as ${turn}` : undefined
      }
      className="cell"
      disabled={disabled}
      onClick={onClick}
    >
      <span aria-hidden={true}>{mark}</span>
    </button>
  );
}

export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsPlaying, setIsXPlaying] = useState(true);
  const winner = determineWinner(board);

  function onReset() {
    setBoard(Array(9).fill(null));
    setIsXPlaying(true);
  }

  function getStatusMessage() {
    if (winner != null) {
      return `Player ${winner} wins!`;
    }
    if (!board.includes(null)) {
      return `It's a draw!`;
    }
    return `Player ${xIsPlaying ? 'X' : 'O'} turn`;
  }

  return (
    <div className="app">
      <div aria-live="polite">{getStatusMessage()}</div>
      <div className="board">
        {Array(9)
          .fill(null)
          .map((_, index) => index)
          .map((cellIndex) => {
            const turn = xIsPlaying ? 'X' : 'O';
            return (
              <Cell
                key={cellIndex}
                disabled={board[cellIndex] != null || winner != null}
                index={cellIndex}
                mark={board[cellIndex]}
                turn={turn}
                onClick={() => {
                  const newBoard = board.slice();
                  newBoard[cellIndex] = turn;
                  setBoard(newBoard);
                  setIsXPlaying(!xIsPlaying);
                }}
              />
            );
          })}
      </div>
      <button
        onClick={() => {
          if (winner == null) {
            const confirm = window.confirm(
              'Are you sure you want to reset the game?',
            );
            if (!confirm) {
              return;
            }
          }
          onReset();
        }}
      >
        Reset
      </button>
    </div>
  );
}
```

---

### Further Reading & Resources
- [React Docs: State](https://react.dev/learn/state-a-components-memory)
- [MDN: CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [Accessible Tic-tac-toe Example (WAI-ARIA)](https://www.w3.org/WAI/ARIA/apg/example-index/tic-tac-toe/tic-tac-toe.html)

---

## Cheatsheet: React Transfer List Solution

**A classic React coding problem: implement a Transfer List with selectable items, transfer buttons, and accessibility support.**

### Key Concepts
- **State/Data Structure:**
  - Use a `Map` for each list (left/right) for O(1) access, insertion, and removal.
  - The key is the item label, the value is a boolean indicating if the item is selected.
- **Transfer Logic:**
  - `transferAllItems`: Moves all items from source to destination.
  - `transferSelectedItems`: Moves only selected items from source to destination.
  - Helper: `hasNoSelectedItems` checks if any items are selected in a list.
- **Rendering:**
  - `ItemList` renders a list of checkboxes for each item.
  - `CheckboxItem` uses `useId` for unique, accessible labels.
  - Transfer buttons are disabled when not applicable.
- **Accessibility:**
  - Each checkbox is paired with a `<label>` for click/focus support.
  - Transfer buttons use `aria-label` for screen readers and hide their visual content from screen readers with `aria-hidden`.
  - All functionality is keyboard accessible.

---

### Test Cases
- Items can be checked/unchecked.
- "Transfer selected" buttons are disabled when no items are selected.
- "Transfer all" buttons are disabled when the source list is empty.
- Clicking transfer buttons moves items as expected.
- All controls are accessible by keyboard and screen reader.

---

### Full React Code
```jsx
import { useId, useState } from 'react';

function CheckboxItem({ onChange, label, checked }) {
  const id = useId();
  return (
    <div className="transfer-list__section__items__item">
      <input
        type="checkbox"
        id={id}
        checked={checked === true || checked === false ? checked : false}
        onChange={onChange}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

function ItemList({ items, setItems }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={item.id}>
          <div>
            <CheckboxItem
              checked={item.checked}
              label={item.name}
              onChange={(event) => {
                onCheck(event.target.checked, [index]);
              }}
            />
          </div>
          {item.children && item.children.length > 0 && (
            <ItemList
              items={item.children}
              onCheck={(newValue, indices) => {
                onCheck(newValue, [index, ...indices]);
              }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

const DEFAULT_ITEMS_LEFT = [
  'HTML',
  'JavaScript',
  'CSS',
  'TypeScript',
];
const DEFAULT_ITEMS_RIGHT = [
  'React',
  'Angular',
  'Vue',
  'Svelte',
];

function generateItemsMap(items) {
  return new Map(items.map((label) => [label, false]));
}

function hasNoSelectedItems(items) {
  return Array.from(items.values()).filter(Boolean).length === 0;
}

function transferAllItems(itemsSrc, setItemsSrc, itemsDst, setItemsDst) {
  setItemsDst(new Map([...itemsDst, ...itemsSrc]));
  setItemsSrc(new Map());
}

function transferSelectedItems(itemsSrc, setItemsSrc, itemsDst, setItemsDst) {
  const newItemsSrc = new Map(itemsSrc);
  const newItemsDst = new Map(itemsDst);
  itemsSrc.forEach((value, key) => {
    if (!value) return;
    newItemsDst.set(key, value);
    newItemsSrc.delete(key);
  });
  setItemsSrc(newItemsSrc);
  setItemsDst(newItemsDst);
}

export default function App() {
  const [itemsLeft, setItemsLeft] = useState(generateItemsMap(DEFAULT_ITEMS_LEFT));
  const [itemsRight, setItemsRight] = useState(generateItemsMap(DEFAULT_ITEMS_RIGHT));

  return (
    <div className="transfer-list">
      <ItemList items={itemsLeft} setItems={setItemsLeft} />
      <div className="transfer-list__actions">
        <button
          aria-label="Transfer all items to left list"
          disabled={itemsRight.size === 0}
          onClick={() => {
            transferAllItems(itemsRight, setItemsRight, itemsLeft, setItemsLeft);
          }}
        >
          <span aria-hidden={true}>&lt;&lt;</span>
        </button>
        <button
          aria-label="Transfer selected items to left list"
          disabled={hasNoSelectedItems(itemsRight)}
          onClick={() => {
            transferSelectedItems(itemsRight, setItemsRight, itemsLeft, setItemsLeft);
          }}
        >
          <span aria-hidden={true}>&lt;</span>
        </button>
        <button
          aria-label="Transfer selected items to right list"
          disabled={hasNoSelectedItems(itemsLeft)}
          onClick={() => {
            transferSelectedItems(itemsLeft, setItemsLeft, itemsRight, setItemsRight);
          }}
        >
          <span aria-hidden={true}>&gt;</span>
        </button>
        <button
          aria-label="Transfer all items to right list"
          disabled={itemsLeft.size === 0}
          onClick={() => {
            transferAllItems(itemsLeft, setItemsLeft, itemsRight, setItemsRight);
          }}
        >
          <span aria-hidden={true}>&gt;&gt;</span>
        </button>
      </div>
      <ItemList items={itemsRight} setItems={setItemsRight} />
    </div>
  );
}
```

---

### Further Reading & Resources
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [React Docs: useId](https://react.dev/reference/react/useId)
- [Accessible Transfer List Example (MUI)](https://mui.com/material-ui/react-transfer-list/)

---

## Cheatsheet: React Nested Checkboxes Solution

**A classic React coding problem: implement a tree of nested checkboxes with checked, unchecked, and indeterminate states, supporting arbitrary depth.**

### Key Concepts
- **Rendering:**
  - Use recursive components (`CheckboxList`) to render nested checkboxes of any depth.
  - Each checkbox is rendered with a label and, if it has children, recursively renders its children.
  - Indentation is handled naturally by nested `<ul>`/`<li>` structure.
- **State Management:**
  - The root component holds the full tree state as an array of objects.
  - When a checkbox is toggled, update its state, all descendants, and all ancestors as needed.
  - State is updated immutably by deep cloning the tree before mutation.
- **Indeterminate State:**
  - A checkbox is indeterminate if some (but not all) of its children are checked.
  - Indeterminate state is set via the DOM property, not an attribute.
  - Clicking an indeterminate checkbox checks it (and all descendants).
- **Event Handling:**
  - Each checkbox receives its position in the tree as an array of indices, so the root can update the correct node.

---

### Test Cases
- All checkboxes render correctly according to the data structure.
- Checking/unchecking a parent updates all descendants.
- Checking/unchecking a child updates ancestors to checked/unchecked/indeterminate as appropriate.
- Indeterminate state is visually distinct and propagates up the tree.
- All checkboxes are keyboard accessible and labeled.
- Edge cases (empty data, deep nesting) are handled gracefully.

---

### Accessibility Notes
- Each checkbox is paired with a `<label>` for click/focus support.
- Indeterminate state is visually distinct and keyboard accessible.
- All checkboxes are focusable and togglable by keyboard.

---

### Full React Code
```jsx
// App.js
import Checkboxes from './Checkboxes';

export default function App() {
  const checkboxesData = [
    {
      id: 1,
      name: 'Electronics',
      checked: false,
      children: [
        {
          id: 2,
          name: 'Mobile phones',
          checked: false,
          children: [
            { id: 3, name: 'iPhone', checked: false },
            { id: 4, name: 'Android', checked: false },
          ],
        },
        {
          id: 5,
          name: 'Laptops',
          checked: false,
          children: [
            { id: 6, name: 'MacBook', checked: false },
            { id: 7, name: 'Surface Pro', checked: false },
          ],
        },
      ],
    },
    {
      id: 8,
      name: 'Books',
      checked: false,
      children: [
        { id: 9, name: 'Fiction', checked: false },
        { id: 10, name: 'Non-fiction', checked: false },
      ],
    },
    { id: 11, name: 'Toys', checked: false },
  ];
  return (
    <div>
      <Checkboxes defaultCheckboxData={checkboxesData} />
    </div>
  );
}

// CheckboxInput.js
import { InputHTMLAttributes, useEffect, useId, useRef } from 'react';
export type CheckboxValue = boolean | 'indeterminate';
export default function CheckboxInput({ checked, label, ...props }) {
  const id = useId();
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = checked === 'indeterminate';
    }
  }, [checked]);
  return (
    <div className="checkbox">
      <input
        id={id}
        ref={ref}
        type="checkbox"
        checked={checked === true || checked === false ? checked : false}
        {...props}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

// CheckboxList.js
import CheckboxInput, { CheckboxValue } from './CheckboxInput';
export interface CheckboxItem {
  id: number;
  name: string;
  checked: CheckboxValue;
  children?: CheckboxItem[];
}
export default function CheckboxList({ items, onCheck }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={item.id}>
          <div>
            <CheckboxInput
              checked={item.checked}
              label={item.name}
              onChange={(event) => {
                onCheck(event.target.checked, [index]);
              }}
            />
          </div>
          {item.children && item.children.length > 0 && (
            <CheckboxList
              items={item.children}
              onCheck={(newValue, indices) => {
                onCheck(newValue, [index, ...indices]);
              }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

// Checkboxes.js
import { useState } from 'react';
import CheckboxList, { CheckboxItem } from './CheckboxList';
function updateCheckboxAndDescendants(checkboxItem, checked) {
  checkboxItem.checked = checked;
  if (checkboxItem.children) {
    checkboxItem.children.forEach((childItem) =>
      updateCheckboxAndDescendants(childItem, checked),
    );
  }
}
function resolveCheckboxStates(checkboxItem, indices) {
  if (indices.length > 0 && checkboxItem.children) {
    resolveCheckboxStates(
      checkboxItem.children[indices[0]],
      indices.slice(1),
    );
  }
  if (!checkboxItem.children) return;
  const checkedChildren = checkboxItem.children.reduce(
    (total, item) => total + Number(item.checked === true),
    0,
  );
  const uncheckedChildren = checkboxItem.children.reduce(
    (total, item) => total + Number(item.checked === false),
    0,
  );
  if (checkedChildren === checkboxItem.children.length) {
    checkboxItem.checked = true;
  } else if (uncheckedChildren === checkboxItem.children.length) {
    checkboxItem.checked = false;
  } else {
    checkboxItem.checked = 'indeterminate';
  }
}
export default function Checkboxes({ defaultCheckboxData }) {
  const [checkboxData, setCheckboxData] = useState(defaultCheckboxData);
  return (
    <CheckboxList
      items={checkboxData}
      onCheck={(checked, indices) => {
        const newCheckboxData = JSON.parse(JSON.stringify(checkboxData));
        const nonFirstLevelIndices = indices.slice(1);
        const modifiedCheckboxItem = nonFirstLevelIndices.reduce(
          (modifiedItem, index) => modifiedItem.children[index],
          newCheckboxData[indices[0]],
        );
        updateCheckboxAndDescendants(modifiedCheckboxItem, checked);
        resolveCheckboxStates(newCheckboxData[indices[0]], nonFirstLevelIndices);
        setCheckboxData(newCheckboxData);
      }}
    />
  );
}
```

---

### Further Reading & Resources
- [MDN: Indeterminate Checkbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#indeterminate_state_checkboxes)
- [React Docs: useId](https://react.dev/reference/react/useId)
- [Accessible Tree View Example (WAI-ARIA)](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)

---

## Cheatsheet: React Modal Dialog Solution

**A classic React coding problem: implement a Modal Dialog as a controlled component, with overlay, portal rendering, and accessibility considerations.**

### Key Concepts
- **Controlled Component:**
  - The modal's open/closed state is controlled by a parent component via the `open` prop.
  - The parent manages state and passes an `onClose` callback to the modal.
- **Props:**
  - `title`: String shown at the top of the modal.
  - `children`: Modal content (can be any React node).
  - `open`: Boolean, controls visibility (default: false).
  - `onClose`: Callback to close the modal.
- **Rendering/Layout:**
  - The modal is rendered using a React Portal to break out of the parent DOM hierarchy (avoids clipping/overflow issues).
  - The overlay covers the entire viewport (`position: fixed; inset: 0; background: rgba(0,0,0,0.7);`).
  - The modal dialog is centered using flexbox.
  - The modal title is rendered as an `<h1>` for semantic structure.
- **Accessibility:**
  - For full a11y, add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and keyboard/focus management (see follow-up questions for these features).

---

### Test Cases
- Modal opens when triggered and closes when the close button is clicked.
- Modal displays the correct title and content.
- Overlay covers the entire viewport and is semi-transparent.
- Modal is centered on all screen sizes.
- Close button is always present and functional.

---

### Full React Code
```jsx
// App.js
import { useState } from 'react';
import ModalDialog from './ModalDialog';

export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>
        Show modal
      </button>
      <ModalDialog
        open={open}
        title="Modal Title"
        onClose={() => setOpen(false)}
      >
        One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.
      </ModalDialog>
    </div>
  );
}

// ModalDialog.js
import { createPortal } from 'react-dom';

export default function ModalDialog({ children, open = false, title, onClose }) {
  if (!open) return null;
  return createPortal(
    <div className="modal-overlay">
      <div className="modal">
        <h1 className="modal-title">{title}</h1>
        <div>{children}</div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body,
  );
}
```

---

### Accessibility Notes
- For full accessibility, add:
  - `role="dialog"` to the modal container
  - `aria-modal="true"`
  - `aria-labelledby` referencing the modal title
  - Keyboard navigation (Esc to close, focus trap, return focus on close)
- See follow-up questions for advanced a11y features.

---

### Further Reading & Resources
- [React Docs: Portals](https://react.dev/reference/react-dom/createPortal)
- [MDN: Dialog Role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role)
- [Accessible Modal Dialog Example (WAI-ARIA)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog/)

---

## Cheatsheet: React Data Table Solution

**A classic React coding problem: implement a paginated, dynamic Data Table with page size selection and accessible controls.**

### Key Concepts
- **State:**
  - `page`: Current page number (starts at 1).
  - `pageSize`: Number of users per page (selectable: 5, 10, 20).
- **Pagination Logic:**
  - `paginateUsers(usersList, page, pageSize)`: Returns the users for the current page and the total number of pages.
  - Start index: `(page - 1) * pageSize`, end index: `start + pageSize`.
  - Uses `Array.prototype.slice()` to get the current page's users.
- **User Experience:**
  - Changing page size resets to page 1.
  - Prev/Next buttons are disabled at the first/last page.
  - Table updates dynamically as page or page size changes.
- **Accessibility:**
  - Page size select and page number span have `aria-label` for screen readers.
  - All controls are keyboard accessible.

---

### Test Cases
- Table displays columns: ID, Name, Age, Occupation.
- Each row represents a user.
- Pagination controls allow navigation and display current/total pages.
- Table updates when navigating pages or changing page size.
- Prev/Next buttons are disabled at the ends.
- All controls are accessible by keyboard and screen reader.

---

### Full React Code
```jsx
import { useState } from 'react';
import users from './data/users';

type User = (typeof users)[number];

const columns = [
  { label: 'ID', key: 'id' },
  { label: 'Name', key: 'name' },
  { label: 'Age', key: 'age' },
  { label: 'Occupation', key: 'occupation' },
] as const;

function paginateUsers(usersList, page, pageSize) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageUsers = usersList.slice(start, end);
  const totalPages = Math.ceil(usersList.length / pageSize);
  return { pageUsers, totalPages };
}

export default function DataTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { totalPages, pageUsers } = paginateUsers(users, page, pageSize);

  return (
    <div>
      <table>
        <thead>
          <tr>
            {columns.map(({ label, key }) => (
              <th key={key}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageUsers.map(({ id, name, age, occupation }) => (
            <tr key={id}>
              <td>{id}</td>
              <td>{name}</td>
              <td>{age}</td>
              <td>{occupation}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      <div className="pagination">
        <select
          aria-label="Page size"
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(1);
          }}
        >
          {[5, 10, 20].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
        <div className="pages">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>
          <span aria-label="Page number">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Further Reading & Resources
- [MDN: Array.prototype.slice()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
- [React Docs: Forms](https://react.dev/learn/forms)
- [Accessible Data Table Example (WAI-ARIA)](https://www.w3.org/WAI/tutorials/tables/)

---

## Cheatsheet: React Undoable Counter Solution

**A classic React coding problem: implement a counter with undo/redo functionality and a history table.**

### Key Concepts
- **State:**
  - `counter`: The current value of the counter.
  - `history`: Array of action objects (operation, old value, new value), most recent first.
  - `undoHistory`: Array of undone actions, most recent first.
- **Operations:**
  - Supported: `/2`, `-1`, `+1`, `x2` (divide, decrement, increment, multiply).
  - `performOperation(counter, operationLabel)`: Applies the operation to the counter.
- **Undo/Redo Logic:**
  - Undo: Pops the latest action from `history`, sets counter to `oldCounter`, pushes to `undoHistory`.
  - Redo: Pops the latest action from `undoHistory`, sets counter to `newCounter`, pushes to `history`.
  - Performing a new operation after undo clears the `undoHistory`.
- **User Experience:**
  - Undo/Redo buttons are disabled when not possible.
  - Reset button clears all state.
  - All controls are keyboard accessible.

---

### Test Cases
- Counter starts at 0.
- Clicking operation buttons updates the counter and adds to history.
- Undo reverts the last operation and updates the history table.
- Redo reapplies the last undone operation.
- Reset clears counter and history.
- Performing a new operation after undo disables redo.
- All controls are accessible by keyboard.

---

### Full React Code
```jsx
import { useState } from 'react';

const OPERATIONS = {
  '/2': { type: 'divide', number: 2 },
  '-1': { type: 'decrement', number: 1 },
  '+1': { type: 'increment', number: 1 },
  x2: { type: 'multiply', number: 2 },
};

function performOperation(counter, operationLabel) {
  const operation = OPERATIONS[operationLabel];
  switch (operation.type) {
    case 'increment':
      return counter + operation.number;
    case 'decrement':
      return counter - operation.number;
    case 'multiply':
      return counter * operation.number;
    case 'divide':
      return counter / operation.number;
    default:
      return counter;
  }
}

function UndoableCounterHistory({ history }) {
  if (history.length === 0) return null;
  return (
    <table>
      <thead>
        <tr>
          <th>Operation</th>
          <th>Old</th>
          <th>New</th>
        </tr>
      </thead>
      <tbody>
        {history.map((item, index) => (
          <tr key={index}>
            <td>{item.operation}</td>
            <td>{item.oldCounter}</td>
            <td>{item.newCounter}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function UndoableCounter() {
  const [counter, setCounter] = useState(0);
  const [history, setHistory] = useState([]);
  const [undoHistory, setUndoHistory] = useState([]);

  function onReset() {
    setCounter(0);
    setHistory([]);
    setUndoHistory([]);
  }

  function onUndo() {
    const [latest, ...earlierHistory] = history;
    setCounter(latest.oldCounter);
    setUndoHistory([latest, ...undoHistory]);
    setHistory(earlierHistory);
  }

  function onRedo() {
    const [latest, ...earlierUndoHistory] = undoHistory;
    setCounter(latest.newCounter);
    setUndoHistory(earlierUndoHistory);
    setHistory([latest, ...history]);
  }

  function onClickOperation(operation) {
    const oldCounter = counter;
    const newCounter = performOperation(counter, operation);
    setCounter(newCounter);
    setHistory([
      { operation, oldCounter, newCounter },
      ...history,
    ]);
    setUndoHistory([]);
  }

  return (
    <div>
      <div className="row">
        <button disabled={history.length === 0} onClick={onUndo}>
          Undo
        </button>
        <button disabled={undoHistory.length === 0} onClick={onRedo}>
          Redo
        </button>
        <button onClick={onReset}>Reset</button>
      </div>
      <hr />
      <div className="row">
        <button onClick={() => onClickOperation('/2')}>/2</button>
        <button onClick={() => onClickOperation('-1')}>-1</button>
        <div className="counter">{counter}</div>
        <button onClick={() => onClickOperation('+1')}>+1</button>
        <button onClick={() => onClickOperation('x2')}>x2</button>
      </div>
      <hr />
      <div className="row">
        <UndoableCounterHistory history={history} />
      </div>
    </div>
  );
}
```

---

### Further Reading & Resources
- [React Docs: State](https://react.dev/learn/state-a-components-memory)
- [MDN: Array.prototype.slice()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)