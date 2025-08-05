# 09-forms: Summary

---

**Interviewer’s Intention**  
Goal: Assess your understanding of form handling in React and your ability to build robust, accessible forms.

Want to see:

- If you can explain controlled vs. uncontrolled components.
- How you handle validation, error messages, and accessibility.
- If you can manage form state, performance, and edge cases.

---

✅ **Answer Framework**

1. **Controlled vs. Uncontrolled**

   - Controlled: value managed by React state, onChange handler
   - Uncontrolled: value managed by DOM, useRef to access
   - Controlled preferred for most cases (predictable, testable)

2. **Validation & Error Handling**

   - Client-side: validate on change/blur/submit
   - Show error messages, link to fields (aria-describedby)
   - Use libraries: Formik, React Hook Form, Yup, Zod
   - Accessibility: labels, ARIA, keyboard navigation

3. **Form State Management**

   - useState/useReducer for form state
   - Field-level vs. form-level validation
   - Debounce validation for performance
   - Reset, clear, and persist form state as needed

4. **Actionable Checklist**
   - Use controlled components for most forms
   - Validate and show errors accessibly
   - Test with keyboard and screen readers
   - Optimize for performance (debounce, memoize)
   - Handle edge cases (async validation, dynamic fields)

---

✅ **Example Content / Model Answer**

> “I use controlled components for forms, manage state with useState or useReducer, and validate on change/blur/submit. I show accessible error messages and test with keyboard/screen readers. I use Formik or React Hook Form for complex forms and optimize validation for performance.”

---

**Pro Tips / Common Pitfalls**

- Don’t forget ARIA and error message linking.
- Avoid uncontrolled components unless needed for performance.
- Test with real users and assistive tech.
