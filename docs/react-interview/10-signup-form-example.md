# Signup Form Example in React

_A step-by-step guide to building an accessible React signup form with uncontrolled inputs, proper labeling, browser validation, and client-side submission_

---

Building a form with great user experience and accessibility isn't all that easy—but it also isn't that hard once you know the things to pay attention to.

This guide demonstrates the basics of building a good, accessible simple signup form with uncontrolled inputs. Since the inputs are uncontrolled, most of the points aren't specific to React, but are best practices for web forms in general.

---

## 1. Input Field

Start with an `<input>` field. `<input>` elements are the backbone of HTML forms and, depending on the `type` attribute value, browsers render these controls differently to assist the user in filling up the form. Common values include `text`, `email`, `number`, `url`, `checkbox`, `file`, etc.

```html
<input type="email" />
```

---

## 2. Add Label to Input Field

All `<input>` tags should have an associated `<label>` for accessibility purposes. This is necessary so that users of assistive technologies can tell what the input is for. Clicking or touching a label will also focus on the label's associated form control.

The `<label>` and the `<input>` are linked using `for` (`htmlFor` in React) and `id` attributes respectively.

```jsx
<label htmlFor="email-input">Email</label>
<input id="email-input" type="email" />
```

Alternatively, you can use `aria-label` on `<input>`, but it is better to have a visible label using `<label>`.

---

## 3. Wrap Within a Form

Next, the elements should be wrapped within a `<form>`. This enables the browser's enter-to-submit behavior, so users can hit Enter to submit the form.

```jsx
<form>
  <label htmlFor="email-input">Email</label>
  <input id="email-input" type="email" />
</form>
```

---

## 4. Form Attributes

The `<form>` tag accepts these attributes:

- `action`: Specifies the URL of the server that will receive the submitted form data.
- `method`: Defines the HTTP method used to send the form data. Common values are:
  - `POST`: Form data is sent as part of the request body.
  - `GET`: Form data is appended to the URL as search/query parameters.
- `enctype`: Specifies how the form data should be encoded when submitting it to the server. This is particularly important when you're uploading files.

```html
<form method="POST" action="/users/signup">
  <label htmlFor="email-input">Email</label>
  <input id="email-input" type="email" />
</form>
```

---

## 5. Submit Button

While not all users are aware they can hit Enter to submit the form, submit buttons are universally understood mechanisms for form submissions. If the `type` attribute of the `<button>` is not specified, the default value used is `<button type="submit">`.

When such `<button>`s are used within a `<form>`, triggering them will cause form submissions.

```html
<form method="POST" action="/users/signup">
  <label htmlFor="email-input">Email</label>
  <input id="email-input" type="email" />
  <button>Sign up</button>
</form>
```

An alternative way to create a submit button is by using the `<input>` tag with `type="submit"`.

```html
<form method="POST" action="/users/signup">
  <label htmlFor="email-input">Email</label>
  <input id="email-input" type="email" />
  <input type="submit" value="Sign up" />
</form>
```

---

## 6. Input Field `name` Attribute

`<input>` elements with a `name` attribute defined will be included in the form submission data as part of the name/value pairs.

```html
<form method="POST" action="/users/signup">
  <label htmlFor="email-input">Email</label>
  <input id="email-input" name="userEmail" type="email" />
  <button>Sign up</button>
</form>
```

With the `name` attribute specified, when the form is submitted:

- For `<form method="GET">`, a HTTP GET request will be made to `/users/signup?userEmail=john.doe@gmail.com`.
- For `<form method="POST">`, a HTTP POST request will be made to `/users/signup` with the body as `userEmail=john.doe@gmail.com`.

If there are more form fields, the key-value pairs are concatenated with `&` as the delimiter, e.g. `userEmail=john.doe@gmail.com&password=securepassword123`.

The value of an `<input>` element without a `name` attribute is not included in the data submitted to the server. The `name` attribute acts as a key for the form data, pairing it with the `value` attribute of the input element. If the `name` attribute is missing, the form data associated with that input will not be part of the HTTP request when the form is submitted.

**All form control input elements should have the `name` attribute specified.**

---

## 7. Other Attributes for Input Field (e.g. `autocomplete`)

By adding the `autocomplete` attribute, browsers will offer suggestions based on the value and the user's autofill data such as addresses and payment methods.

```html
<form method="POST" action="/users/signup">
  <label htmlFor="email-input">Email</label>
  <input autocomplete="email" id="email-input" name="userEmail" type="email" />
  <button>Sign up</button>
</form>
```

Possible values include `email`, `family-name`, `new-password`, `street-address`, etc. Refer to the [full list of values on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete#values). Specifying the `autocomplete` attribute is especially useful for shipping and billing address forms on checkout pages.

---

## 8. Browser Validation

Add a password field using `<input type="password" />`.

By specifying attributes like `required`, `minlength`, `pattern` on `<input>`, the browser can help to validate that the user's input matches these requirements before the form is submitted to the server.

```html
<form method="POST" action="/users/signup">
  <label htmlFor="email-input">Email</label>
  <input
    autocomplete="email"
    id="email-input"
    name="userEmail"
    required
    type="email"
  />
  <label htmlFor="password-input">Password</label>
  <input
    autocomplete="new-password"
    id="password-input"
    minlength="8"
    name="userPassword"
    required
    type="password"
  />
  <button>Sign up</button>
</form>
```

> **Note:** Browser validation alone is insufficient! Malicious personnel can directly hit your server endpoints without using your HTML form. You should still validate and sanitize all user input on the server.

---

## 9. Link Form Control Descriptions Using `aria-describedby`

For `<input>`s which benefit from additional descriptions or hint text, they can be associated with the element that contains the descriptive text, which could be a `<span>`, `<div>`, or any other suitable HTML element.

```html
<form method="POST" action="/users/signup">
  <label htmlFor="email-input">Email</label>
  <input
    autocomplete="email"
    id="email-input"
    name="userEmail"
    required
    type="email"
  />
  <label htmlFor="password-input">Password</label>
  <input
    aria-describedby="password-hint"
    autocomplete="new-password"
    id="password-input"
    minlength="8"
    name="userPassword"
    required
    type="password"
  />
  <div id="password-hint">
    Your password must be at least 8 characters long.
  </div>
  <button>Sign up</button>
</form>
```

When a user focuses on the password input field, assistive technologies like screen readers will read the input label along with the additional instructions provided in the `<div>`. This helps users understand the requirements for the password field more clearly.

---

## 10. Submission via `fetch()`

The current form will make a HTTP POST request to `/users/signup` upon submission, which causes a full page navigation and that might not always be desirable.

We can modify the form to make a client-side HTTP POST request via `fetch()`. The main changes to make are:

- Call `event.preventDefault()` to prevent the browser from navigating away
- Use `new FormData(formElement)` to get the input fields data from the form element
- Send the data to the server API endpoint via `fetch()`

```jsx
function SignupForm() {
  async function handleSubmit(event) {
    // Prevent default behavior, which is a navigation
    event.preventDefault();
    const formElement = event.target;
    const formData = new FormData(formElement);
    const response = await fetch("/users/signup", {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("userEmail"),
        password: formData.get("userPassword"),
      }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) {
      // Handle error response
      return;
    }
    // Handle success flow
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email-input">Email</label>
      <input
        autocomplete="email"
        id="email-input"
        name="userEmail"
        required
        type="email"
      />
      <label htmlFor="password-input">Password</label>
      <input
        aria-describedby="password-hint"
        autocomplete="new-password"
        id="password-input"
        minlength="8"
        name="userPassword"
        required
        type="password"
      />
      <div id="password-hint">
        Your password must be at least 8 characters long.
      </div>
      <button>Sign up</button>
    </form>
  );
}
```

There you have it, a fully-accessible sign up form in React.

---

## What You Need to Know for Interviews

- How to independently build an accessible form in React with validation and submission.
