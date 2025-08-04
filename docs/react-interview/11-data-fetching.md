# Data Fetching in React Interviews

_A comprehensive guide to efficiently fetching data in React, covering client-side and server-side techniques, dynamic queries, error handling, caching, and advanced optimizations with query libraries_

---

Fetching data is a fundamental part of building web applications. In React, managing data fetching efficiently is crucial to creating responsive and performant applications. Whether retrieving data from an API, database, or another source, React provides multiple approaches to handle data fetching effectively.

Data can be fetched either on the server (server-side rendering) or on the client via `fetch` and then rendered in the browser (client-side rendering).

---

## Client-side Data Fetching

The built-in `fetch` API is a straightforward way to make HTTP requests in JavaScript. Here's a simple example using the `useEffect` hook to fetch data from an API:

```jsx
import { useState, useEffect } from "react";

function Page() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error response");
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error.message}</p>;
  }
  return (
    <ul>
      {data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

This component calls an API on mount, fetches the data, and renders it to the screen. It also shows a loading message while the data is being fetched and an error message if an error was encountered. These are all great for user experience.

---

## Dynamic Client-side Data Fetching

Often you will need to fetch data based on a dynamic parameter, such as a blog post slug or an autocomplete search query.

The following "live search" example fetches data based on a user-provided search term as you type:

```jsx
import { useState } from "react";
import axios from "axios";

function SearchResults() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchData(query) {
    if (!query) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?q=${encodeURIComponent(
          query
        )}`
      );
      if (!response.ok) {
        throw new Error("Error response");
      }
      const data = await response.json();
      setData(data);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData(query);
  }, [query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Enter search term"
      />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <ul>
          {data.map((result) => (
            <li key={result.id}>{result.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Problems and Improvements

#### 1. A `fetch` request is made per keystroke

- Every keystroke triggers a new request. Typing 'tomato' results in 6 requests.
- **Solution:** Debounce the query so the API request is only made after the user has stopped typing for a specific duration.

#### 2. Race conditions

- Multiple requests can return out of order, so the displayed results may not match the current search term.
- **Solutions:**
  - **Debouncing**: Reduces the chance of race conditions but is not foolproof.
  - **Cancelling previous requests**: Use `AbortController` to cancel in-flight API requests when a new one is made.
  - **Ignore/discard outdated responses**: Only display results for the latest query.

#### 3. Setting state after unmount

- If the user navigates away before a response returns, calling `setData` on an unmounted component causes a React warning.
- **Solution:** Use a cleanup function in `useEffect` to set an `isMounted` flag to `false` or use `AbortController` to cancel fetch requests.

```jsx
useEffect(() => {
  let isMounted = true;
  fetch("https://jsonplaceholder.typicode.com/posts/1")
    .then((response) => response.json())
    .then((data) => {
      if (isMounted) {
        setData(data);
      }
    });
  return () => {
    isMounted = false;
  };
}, []);
```

#### 4. Redundant duplicate requests

- Typing, deleting, and retyping the same query triggers duplicate requests.
- **Solution:** Use a cache (e.g., `Map<query, results>`) to avoid refetching data for queries that have already been fetched.

---

## Data Mutations

Data fetching isn't only limited to querying; there's also mutations. A data mutation refers to any operation that modifies data on the server, such as creating, updating, or deleting records in a database via an API.

### Optimistic Updates

Optimistic updates are a technique where the UI updates before receiving a response from the server, making the application feel faster and more responsive.

**Typical mutation flow:**

1. Trigger the API request (POST, PUT, DELETE)
2. Show a loading state while the request is in progress
3. Wait for the response from the server
4. On success, update the UI
5. On error, show an error message

**Optimistic update flow:**

1. Update the UI immediately with the assumed successful change
2. Send the API request in the background
3. If the request succeeds, keep the UI as is
4. If the request fails, rollback the UI to its previous state and show an error message

```js
const handleLike = async () => {
  setLike((count) => count + 1); // Update UI optimistically
  try {
    await fetch("/api/posts/4/like", { method: "POST" });
  } catch (error) {
    setLike((count) => count - 1); // Rollback on failure
  }
};
```

Optimistic updates can be used for mutations where the success scenario is known beforehand, such as liking a post, adding an item to a cart, or editing a comment.

### Invalidating Cache

If the UI relies on cached data, the cache should be invalidated either by refetching the data or merging the mutation response with the cached data (not possible for certain mutations).

---

## Query Libraries

Query libraries are designed to handle data fetching, caching, synchronization, and state management in front end applications. They simplify making API requests while optimizing performance and user experience. Popular examples include [TanStack Query](https://tanstack.com/query/latest), [useSWR](https://swr.vercel.app/), and [Apollo Client](https://www.apollographql.com/) (for GraphQL).

**Example with TanStack Query:**

```jsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function DataFetchingComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await axios.get("/api/posts");
      return response.data;
    },
    staleTime: 5000, // Cache data for 5 seconds
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error.message}</p>;
  }
  return (
    <ul>
      {data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

**Advantages:**

| Feature            | `useEffect` + `fetch` | Query Libraries       |
| ------------------ | --------------------- | --------------------- |
| Caching            | No caching            | Automatic caching     |
| Error handling     | Needs try/catch       | Built-in retries      |
| Optimistic updates | Manual rollback       | Automatic rollback    |
| Pagination         | Manual logic          | Built-in support      |
| Background updates | Manual polling        | Handles automatically |
| Refetching         | Manual                | Automatic             |

---

## Server-side Data Fetching and Server-side Rendering (SSR)

Server-side data fetching is a technique where data is retrieved from a database or API before rendering the page on the server (SSR), rather than fetching it on the client after the initial load. SSR improves performance, SEO, and user experience by delivering pre-rendered, data-filled pages to the client.

Metaframeworks like Next.js make server-side data fetching easy with functions like `getServerSideProps` / server components, which run on the server before sending the HTML to the browser. Unlike client-side fetching, where a loading state is visible while waiting for data, server-side fetching ensures that the user sees the fully rendered page immediately.

This is particularly useful for performance-sensitive pages, SEO-sensitive pages, personalized dashboards, and dynamic content that depends on request-specific data (e.g., authentication or geolocation).

With the exception of take-home assignments, most React coding interview questions will be using client-side data fetching rather than server-side data fetching.

However, CSR vs SSR is a common discussion topic during system design rounds and you should know the benefits of each and when to use which.

---

## What You Need to Know for Interviews

- **Basic data fetching:**
  - Using `useEffect` and `useState` for fetching data in functional components
  - Handling loading and error states
  - Understanding dependency arrays (`[]` for on-mount fetch, `[query]` for fetch-on-change)
  - Avoiding infinite loops due to missing dependencies
  - Cleaning up side effects (e.g., aborting fetch requests to prevent setting state on unmount)
- **Issues with basic data fetching approach:** Although you probably won't be asked to implement optimized data fetching approaches, you should know what the issues are and how to fix them on a high level

---

## Key Interview Questions

1. How do you fetch data in React?
2. What are the benefits of using TanStack Query over `useState` and `useEffect`?
3. How do you prevent redundant API requests in a live search?
4. What are optimistic updates, and how do they improve performance?
5. How do you handle errors and retries in API calls?
6. How do you cancel an API request if a component unmounts?

---

## Practice Questions

**Quiz:**

- [How do you handle asynchronous data loading in React applications?](/questions/quiz/how-do-you-handle-asynchronous-data-loading-in-react-applications?framework=react&tab=quiz)
- [Explain server-side rendering of React applications and its benefits?](/questions/quiz/explain-server-side-rendering-of-react-applications-and-its-benefits?framework=react&tab=quiz)
- [What are some common pitfalls when doing data fetching in React?](/questions/quiz/what-are-some-common-pitfalls-when-doing-data-fetching-in-react?framework=react&tab=quiz)

**Coding:**

- [Like Button](/questions/user-interface/like-button/react?framework=react&tab=coding)
- [Birth Year Histogram](/questions/user-interface/birth-year-histogram/react?framework=react&tab=coding)
- [Job Board](/questions/user-interface/job-board/react?framework=react&tab=coding)
