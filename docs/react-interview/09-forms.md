# Forms in React Interviews

_Guide to building interactive React forms, covering controlled vs uncontrolled components, diverse input types, complex state management, and robust error handling and validation strategies_

---

Forms in React are a crucial part of building interactive applications, allowing users to input and submit data. In React, it is common to control form elements using state, making them dynamic yet predictable.

---

## Controlled vs Uncontrolled Form Components

In React, form inputs can be managed in two ways: **controlled** and **uncontrolled**. The main difference lies in how the form data is handled.

### Controlled Form Components

In a **controlled form component**, React manages the form element's state. The value of the input is stored in a state variable and updated via an `onChange` handler.

```jsx
import { useState } from "react";

function ControlledForm() {
  const [name, setName] = useState("");

  function handleChange(event) {
    setName(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    alert(`Submitted Name: ${name}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={name} onChange={handleChange} />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
```

In controlled components, the input value is stored in React state (`name`). The `onChange` handler updates the state as the user types. This ensures the value is always controlled by React.

### Uncontrolled Form Components

In an **uncontrolled form component**, the form element's value is managed by the DOM itself rather than React state.

```jsx
import { useRef } from "react";

function UncontrolledForm() {
  const nameRef = useRef();

  function handleSubmit(event) {
    event.preventDefault();
    // Access form values using `FormData`
    const formData = new FormData(event.target);
    console.log("Name:", formData.get("name"));
    // Alternatively, access the <input> via a ref
    console.log("Name:", nameRef.current.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" name="name" ref={nameRef} />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
```

In uncontrolled components, the input value is not stored in React state. To access the form data upon submission, you can either:

1. **Use `FormData`**: Access the form element directly from `event.target`, create a `FormData` instance from the form, and retrieve values using `formData.get('name')` (corresponds to the `name` attribute on `<input>`)
2. **Use refs**: Use `useRef()` to reference the `<input>` field directly. The input value can be accessed via `nameRef.current.value`

### When to Use Which?

| Feature               | Controlled form (`useState`)                                     | Uncontrolled form (DOM)                                     |
| --------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| Where state is stored | React state (`useState`)                                         | Native DOM                                                  |
| Performance           | Re-rendering needed on update, might cause issues in large forms | More performant for simple use cases                        |
| Validation            | Easy to implement                                                | Requires manual validation                                  |
| Form reset            | Easy (`setState("")`)                                            | Needs `ref.current.value = ""` or trigger a `'reset'` event |
| Use case              | Dynamic forms, validation, real-time updates                     | Simple forms, file uploads, or integrating non-React code   |

- Use **controlled form components** when you need to validate, manipulate, or track user input dynamically (e.g. toggling visibility of certain form fields based on previous responses) or nested form state
- Use **uncontrolled form components** when working with large forms, integrating with non-React code, or optimizing performance

In interviews, considering the forms usually do not have many fields, both controlled components and uncontrolled approaches are viable. Controlled components are often preferred for easier validation and state management.

---

## Handling Different Input Types

The following are code examples for various input types using the controlled approach, meaning their values are stored in state and updated via `onChange` handlers.

### Text Input

A controlled text input updates its value in state as the user types.

```jsx
import { useState } from "react";

function TextInputExample() {
  const [text, setText] = useState("");
  return (
    <div>
      <label htmlFor="name-input">Name</label>
      <input
        id="name-input"
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <p>Entered Text: {text}</p>
    </div>
  );
}
```

- The input field's value is controlled by React state (`text`)
- The `onChange` event updates state with `setText(event.target.value)`
- This ensures React manages the input value dynamically

**Other text-based input types:**

| `type`           | Purpose               | Built-in validation                               |
| ---------------- | --------------------- | ------------------------------------------------- |
| `text`           | General text input    | No                                                |
| `number`         | Numerical input       | Yes, only numbers allowed; `min`/`max` attributes |
| `email`          | Email addresses       | Yes, must contain `@`                             |
| `password`       | Secure password input | No, but input is masked                           |
| `search`         | Search field          | No                                                |
| `tel`            | Telephone numbers     | No; can use `pattern` attribute                   |
| `url`            | URLs                  | Yes, must start with `http://` or `https://`      |
| `datetime-local` | Date and time         | Yes                                               |
| `color`          | Color picker          | Yes                                               |

**Recommendations:**

- Use `text` for generic input fields
- Use `number` for numeric values
- Use `email`, `url`, and `tel` to take advantage of built-in validation
- Use `password` for secure text entry
- Use `search` for search fields
- Use `datetime-local` for date & time selection
- Use `color` for color selection

### Checkbox Input

A checkbox is a **boolean value** (checked or unchecked).

```jsx
import { useState } from "react";

function CheckboxExample() {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <div>
      <input
        id="checkbox-input"
        type="checkbox"
        checked={isChecked}
        onChange={(event) => setIsChecked(event.target.checked)}
      />
      <label htmlFor="checkbox-input">Agree to terms and conditions</label>
      <p>Checkbox is {isChecked ? "checked" : "unchecked"}</p>
    </div>
  );
}
```

- The `checked` attribute is bound to `isChecked` state
- The `onChange` event updates state with `setIsChecked(event.target.checked)`

### Radio Group

Radio buttons are used when selecting **one option from multiple choices**.

```jsx
import { useState } from "react";

function RadioGroupExample() {
  const [gender, setGender] = useState("");
  return (
    <div>
      <div>
        <input
          id="radio-male"
          type="radio"
          name="gender"
          value="male"
          checked={gender === "male"}
          onChange={(event) => setGender(event.target.value)}
        />
        <label htmlFor="radio-male">Male</label>
      </div>
      <div>
        <input
          id="radio-female"
          type="radio"
          name="gender"
          value="female"
          checked={gender === "female"}
          onChange={(event) => setGender(event.target.value)}
        />
        <label htmlFor="radio-female">Female</label>
      </div>
      <p>Selected gender: {gender}</p>
    </div>
  );
}
```

- The `name="gender"` ensures only one option can be selected
- The `checked` attribute checks if the current value matches the state
- The `onChange` updates state with the selected value

### Textarea

A `textarea` is used for multi-line text input.

```jsx
import { useState } from "react";

function TextAreaExample() {
  const [bio, setBio] = useState("");
  return (
    <div>
      <label htmlFor="bio-input">Bio:</label>
      <textarea
        id="bio-input"
        value={bio}
        onChange={(event) => setBio(event.target.value)}
      />
      <p>Bio Preview: {bio}</p>
    </div>
  );
}
```

- React uses `value` instead of setting text inside `<textarea>`
- The `onChange` updates the state, ensuring React controls the input

### Select Dropdown

A `<select>` dropdown allows users to choose one option.

```jsx
import { useState } from "react";

function SelectExample() {
  const [fruit, setFruit] = useState("apple");
  return (
    <div>
      <label htmlFor="favorite-fruit">Favorite fruit</label>
      <select
        id="favorite-fruit"
        value={fruit}
        onChange={(event) => setFruit(event.target.value)}
      >
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
        <option value="orange">Orange</option>
      </select>
      <p>Selected fruit: {fruit}</p>
    </div>
  );
}
```

- The `value` attribute is bound to the state (`fruit`)
- The `onChange` updates the state when the user selects an option

#### Summary Table

| Input type      | Key element  | Key value attribute | State update                     |
| --------------- | ------------ | ------------------- | -------------------------------- |
| Text input      | `<input>`    | `value`             | `setState(event.target.value)`   |
| Checkbox input  | `<input>`    | `checked`           | `setState(event.target.checked)` |
| Radio group     | `<input>`    | `checked`           | `setState(event.target.value)`   |
| Textarea        | `<textarea>` | `value`             | `setState(event.target.value)`   |
| Select dropdown | `<select>`   | `value`             | `setState(event.target.value)`   |

---

## Handling Complex Form State

When working with complex forms in React, managing state efficiently is crucial to ensure good performance and maintainability. Forms become complex when they include multiple input fields, dynamic field additions, nested structures, or advanced validation. Below are some strategies to handle complex form state effectively.

### Using `useReducer` for Complex Forms

For forms with multiple fields and state dependencies, `useReducer` provides a structured way to manage state updates.

```jsx
import { useReducer } from "react";

// Define reducer function
function formReducer(state, action) {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// Initial form state
const initialState = {
  name: "",
  email: "",
  age: "",
};

function ComplexFormWithReducer() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  function handleChange(event) {
    dispatch({
      type: "UPDATE_FIELD",
      field: event.target.name,
      value: event.target.value,
    });
  }

  function handleReset() {
    return dispatch({ type: "RESET" });
  }

  return (
    <form>
      <input
        type="text"
        name="name"
        value={state.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <input
        type="email"
        name="email"
        value={state.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        type="number"
        name="age"
        value={state.age}
        onChange={handleChange}
        placeholder="Age"
      />
      <button type="button" onClick={handleReset}>
        Reset
      </button>
    </form>
  );
}
```

- Keeps state updates predictable and centralized
- Useful for forms with conditional logic and dependencies
- Prevents unnecessary re-renders compared to `useState`

### Handling Dynamic Fields

When a form allows users to **add or remove fields dynamically** (e.g., multiple email inputs), state should be an array.

```jsx
import { useState } from "react";

function DynamicForm() {
  const [fields, setFields] = useState([{ id: 1, value: "" }]);

  function addField() {
    setFields([...fields, { id: fields.length + 1, value: "" }]);
  }

  function removeField(id) {
    setFields(fields.filter((field) => field.id !== id));
  }

  function handleChange(id, event) {
    const newFields = fields.map((field) =>
      field.id === id ? { ...field, value: event.target.value } : field
    );
    setFields(newFields);
  }

  return (
    <form>
      {fields.map((field) => (
        <div key={field.id}>
          <input
            type="text"
            value={field.value}
            onChange={(event) => handleChange(field.id, event)}
            placeholder="Enter value"
          />
          <button type="button" onClick={() => removeField(field.id)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addField}>
        Add Field
      </button>
    </form>
  );
}
```

- Useful for forms where users **can add multiple entries** (e.g., multiple email addresses)
- Keeps UI flexible without unnecessary predefined fields

### Using Form Libraries for Complex Forms

Instead of managing everything manually, libraries like [React Hook Form](https://react-hook-form.com/) and [Formik](https://formik.org/) (unmaintained) simplify complex form state handling.

```jsx
import { useForm, useFieldArray } from "react-hook-form";

function FormWithReactHookForm() {
  const { register, handleSubmit, control } = useForm({
    defaultValues: { emails: [{ value: "" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "emails" });

  function onSubmit(data) {
    console.log(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input {...register(`emails.${index}.value`)} placeholder="Email" />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ value: "" })}>
        Add Email
      </button>
      <button type="submit">Submit</button>
    </form>
  );
}
```

- **Reduces re-renders** by using refs instead of state
- **Easy validation** with built-in support for validation libraries like Zod, Yup, and Joi
- **Handles dynamic fields efficiently** with `useFieldArray`

### Handling Nested Form Structures

Sometimes, forms have nested objects (e.g., address with street, city, and zip code).

```jsx
import { useState } from "react";

function NestedForm() {
  const [form, setForm] = useState({
    name: "",
    address: { street: "", city: "", zip: "" },
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  }

  return (
    <form>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
      />
      <input
        type="text"
        name="street"
        placeholder="Street"
        value={form.address.street}
        onChange={handleChange}
      />
      <input
        type="text"
        name="city"
        placeholder="City"
        value={form.address.city}
        onChange={handleChange}
      />
      <input
        type="text"
        name="zip"
        placeholder="ZIP Code"
        value={form.address.zip}
        onChange={handleChange}
      />
    </form>
  );
}
```

- Helps manage related data **cleanly** in a single object
- Useful for **address, profile, or nested form sections**

#### Best Practices for Complex Form State

- Use `useReducer` for structured state updates
- Use dynamic fields for flexible input handling
- Leverage form libraries like React Hook Form or Formik to simplify validation and state management
- Use nested objects when dealing with grouped form data

---

## Error Handling and Validation Strategies

Handling errors and validating user input is essential for creating a smooth user experience in React forms. Validation ensures that users enter the correct data before submission, preventing invalid entries and reducing backend errors. Below are various strategies to handle validation and errors efficiently.

### Basic Client-Side Validation with `useState`

For simple forms, you can use **state-based validation** to check user input before submission.

```jsx
import { useState } from "react";

function BasicValidationForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    setError(""); // Clear error if validation passes
    alert(`Submitted: ${email}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

- Uses local state to track errors
- Displays error messages when validation fails
- Simple but sufficient for basic validation needs

### Validate Input Fields with Regular Expressions

For **structured input fields** like emails, phone numbers, or passwords, **regex-based validation** is useful.

```jsx
function EmailValidationForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  function handleSubmit(event) {
    event.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    alert(`Valid Email: ${email}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

- Uses regex to check if an email follows a valid format
- Provides real-time feedback to users

### Browser Built-in HTML5 Validation

Modern browsers provide built-in validation for certain input types.

```jsx
function HTML5ValidationForm() {
  return (
    <form>
      <label>
        Email:
        <input type="email" required />
      </label>
      <br />
      <label>
        Password (Min 6 characters):
        <input type="password" minLength="6" required />
      </label>
      <br />
      <label>
        Phone (Numbers only):
        <input type="tel" pattern="[0-9]{10}" required />
      </label>
      <br />
      <button type="submit">Submit</button>
    </form>
  );
}
```

- `required`: Ensures the field is filled
- `minLength`: Restricts input length
- `pattern`: Uses regex directly in HTML
- Works **without JavaScript**, improving performance

### React Hook Form for Efficient Validation

For complex forms, **React Hook Form** provides optimized validation with minimal re-renders.

```jsx
import { useForm } from "react-hook-form";

function HookFormValidation() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => alert(JSON.stringify(data));

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        Email:
        <input
          type="email"
          {...register("email", { required: "Email is required" })}
        />
      </label>
      {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
      <label>
        Password:
        <input
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
        />
      </label>
      {errors.password && (
        <p style={{ color: "red" }}>{errors.password.message}</p>
      )}
      <button type="submit">Submit</button>
    </form>
  );
}
```

- **Uses refs instead of state**, minimizing re-renders
- **Better performance** for large forms
- **Built-in error handling** with `formState.errors`

### Handle Server-Side Validation

Even with client-side validation, backend validation is necessary. You need to know how to display error messages from API responses.

```jsx
import { useState } from "react";

function ServerErrorHandlingForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setError(null);
      const response = await fetch("/api/validate-email", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      alert("Submission successful!");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

- Uses `fetch()` to validate email on the server side
- Displays API error messages if validation fails
- Prevents security risks (e.g., hackers bypassing client-side validation)

---

## Best Practices for Interviews

- For simple forms, both controlled and uncontrolled inputs are viable
- Wrap in `<form>` and leverage the browser form submit events
- Use HTML5 validation where possible to reduce re-renders for better performance
- Display clear error messages that guide users on how to fix their inputs
- Merely client-side validation is insufficient. Server-side validation is also required to prevent security loopholes
- If 3rd party libraries are allowed (e.g. in take home assignments), React Hook Form is a great addition that provides many useful features and helps you achieve better performance at the same time

---

## What You Need to Know for Interviews

- **Uncontrolled and controlled forms:** What's the difference, how to use either, and when to use
- **Form controls:** Be able to build forms that use the various input types
- **Complex forms:** How to build complex forms and the best practices
- **Error handling and validation:** How to validate forms and show errors using native browser approaches and React approaches

---

## Practice Questions

**Coding:**

- [Generate Table](/questions/user-interface/generate-table/react?framework=react&tab=coding)
- [Contact Form](/questions/user-interface/contact-form/react?framework=react&tab=coding)
- [Mortgage Calculator](/questions/user-interface/mortgage-calculator/react?framework=react&tab=coding)
- [Temperature Converter](/questions/user-interface/temperature-converter/react?framework=react&tab=coding)
- [Flight Booker](/questions/user-interface/flight-booker/react?framework=react&tab=coding)
- [Auth Code Input](/questions/user-interface/auth-code-input/react?framework=react&tab=coding)
