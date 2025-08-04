# Answering Problem Solving Behavioral Questions

_Learn how to answer "Tell me about a time..." styled questions for evaluating your problem solving skills._

---

As mentioned in our [behavioral interview preparation overview](/behavioral-interview-playbook/introduction), **problem solving and drive for results** is one of the 8 main categories of questions to prepare for.

**In this guide, you will learn how to tackle them:**

1. Evaluation criteria in detail
2. Abstracting possible questions into common themes
3. Suggested answer framework
4. Possible nature of follow-up questions
5. Sample questions and answers

---

## Evaluation Criteria in Detail

Problem solving and drive for results are grouped together into one category as they are highly related in nature. When describing one's experience in solving problems or achieving certain results/objectives, their mindset or drive to do so can also be inferred.

When rating candidates under this category, interviewers are often looking at the following criteria:

- **Identifying best solutions and executing on them**
  - Identifying the right problems
  - Identifying the most critical objectives
  - Resourcefulness and data-driven mindset
  - Creativity and innovation
  - Identifying tradeoffs and sustainable solutions
  - Measuring results, iterating and following through
- **Impact-driven mindset**
  - Proactivity to make progress despite obstacles or roadblocks
  - Influencing others to deliver against objectives
  - Balancing analysis with decisive action

---

## Abstracting Possible Questions into Common Themes

It is impractical to prepare answers specifically for every behavioral question out there. However, by batching specific questions into similar themes and preparing stories that cover a large number of question requirements, you can reduce the number of stories to prepare to around 3-5 stories.

There are many types of problem solving and drive for results behavioral questions, such as:

- Can you tell me about a time when you had to **use data to drive engineering decisions**?
- Can you provide an example of a time when you had to **troubleshoot and fix a complex issue** in a project?
- Can you describe a time you **creatively solved** an engineering problem or achieved meaningful metric improvement?
- Can you describe a time when you had to make an important engineering decision and how you decided **between tradeoffs**?

However, 80% of questions under this category typically ask how a problem was solved or a specific trait required for effective problem solving, such as creativity, using data, or trade-off evaluation. The source of the problem or objective, as well as whether the candidate was resilient in the face of obstacles, can be inferred from answers to these questions as well.

---

## Suggested Answer Framework

As always, the [STAR format](https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique) is the simplest and most effective framework to structure your story.

Despite the large number of question possibilities, you can abstract all the requirements for problem solving behavioral questions by thinking about a robust problem solving process:

1. **Problem identification:** Identifying the correct root cause or root problem to focus on from surface level symptoms
2. **Metrics/target setting:** Identify key metrics that would signify success in solving the problem (if any)
3. **Information gathering:** Resourcefulness in gathering information from different sources and a data-driven mindset (using data to drive decisions)
4. **Solution brainstorming:** Creatively generate solutions that solve the root cause
5. **Solution evaluation:** Evaluate trade-offs of each solution and select the most optimal one
6. **Monitoring and adjustment:** Monitor effectiveness of the solution by measuring key metrics. Adjust strategy if needed

You just have to ensure that at least one of your [prepared stories or projects](/behavioral-interview-playbook/introduction) covers all of the above steps. In doing so, the story could be reused for all affiliated traits under problem solving, such as data-driven mindset, resourcefulness, creativity, and working with feedback from users.

You might need to tailor the details of your story to focus on the specific aspect asked in the specific question.

We recommend you also pick problem solving stories that can doubly serve to get signals on the following:

- **Proactivity/initiative-taking:** You took the initiative to look into the problem, gather information, and solve it
- **Leadership:** You led the problem solving process
- **Teamwork:** You had to work as part of a team to solve the problem

---

## Sample Story

Here's a sample story using the STAR format.

**Situation:**

> I was the tech lead for an e-commerce website selling luxury goods. The website was built as an Angular 1.5 single-page application. In recent years, the product was showing its age – developer experience was not great and the website performance was poor. Initial loading speed was over 3 seconds and the conversion rate was around 0.8%.

**Task:**

> I was tasked with improving the performance and conversion of the website.

**Actions:**

1. **Problem identification**
   - Conversion is tied to website performance and UX
   - Website performance has been on a gradual decline over the past few years as there wasn't a person to oversee the overall architecture of the website and track performance metrics
   - UX hasn't been looked at in a while
2. **Information gathering**
   - Looked at nature of bugs in the past year, categorized them according to their root causes to identify hotspots and major problematic areas
   - Gathered feedback from team regarding areas of improvements
   - Ran a brainstorming session with the team to think of ways to improve
   - Double checked that performance and conversion tracking was working correctly
   - Started tracking new metrics from Lighthouse and Core Web Vitals
   - Worked with Data Scientists to come up with dashboards for performance and conversion and gained insights (e.g., some countries had lower conversion rates, mobile users had lower conversion rates)
   - Worked with UX Designers and UX Researchers to identify problems in the end-to-end shopping experience (e.g., UI elements too spaced apart, required a lot of scrolling)
3. **Solution brainstorming**
   - **User interface:** Considered SSR for performance and SEO. Evaluated frameworks (Angular 17, Next.js, Svelte)
   - **Styling:** Stylesheet was bloated. Considered Tailwind CSS and Styled Components
   - **Performance-centric mindset:** Set performance budgets, lazy loaded components, split JS bundles, used WebP images, hosted images on CDN, adaptive image loading, consolidated JS libraries, removed unused features
   - **SEO:** Used tools like Ahrefs, worked with marketing, adjusted URLs
   - **UX improvements:** Single page checkout, reduced UI element height, fixed checkout button
   - **Payment improvements:** Analyzed Stripe data, added country-specific address fields, added PayPal, Google Pay, Apple Pay
4. **Solution evaluation**
   - Chose Next.js for metaframework, Tailwind for styling
5. **Monitoring and adjustment**
   - Rolled out new website behind an A/B test, monitored performance and conversion rates
   - Countries with lower conversion rates saw nearly 50% improvement

**Results:**

- Lighthouse score improved to 92
- Loading speed improved to 1.5 seconds
- Conversion improved to 2.5%
- Developer velocity improved, easier to hire for React

> Obviously the entire story is too detailed as a response for a single question; you shouldn't list all the specific performance improvements like a laundry list! Aim to achieve both breadth and depth by briefly covering each phase within the "Action" section and going deep into the parts that showcase the signals required for that specific scenario.

---

## Possible Nature of Follow-Up Questions

Interviewers are encouraged to rely more on follow-up questions to really understand the candidate's thought process and motivations, which typically fall under these categories:

- Why do you think you did (insert action)?
- Why did you not do (insert action)?
- How would you do things differently in hindsight?

For questions on problem solving or drive for results, interviewers will most likely probe for questions to help them understand more about:

- **The source of the task/problem/objective** (proactivity/initiative):
  - Was the project or task initiated by you? To what extent?
  - Was the underlying idea from you, or just the plan to execute?
  - How did you get buy-in from stakeholders?
- **Role and actual contribution by candidate:**
  - Was there a team involved? What did you do vs. others?
  - How did you help others achieve the goal?
- **Prioritizing the problem/objective:**
  - Why was this problem prioritized?
  - Was there another more important problem?
  - Was this problem already solved elsewhere?
- **Selection of appropriate metrics/objectives, and if they were measured post-launch:**
  - Were targets set? How were they decided?
  - How were they measured post-launch? What was the result?
  - What measures were put in place to prevent recurrence?
- **Using sufficient information to drive decisions:**
  - What research/data did you rely on?
  - How much time did you spend on research?
  - How did you balance research/planning and execution?
- **Choosing the right solution:**
  - What other solutions were considered? Pros/cons?
  - Why was the final solution chosen?
  - Who came up with the ideas? How were they derived?

---

## Sample Problem Solving Questions and Answers

The sample story above can be tailored to answer specific questions by extracting relevant portions:

> **Can you tell me about a time when you had to use data to drive engineering decisions?**

Elaborate on the section about conversion performance.

> **Can you provide an example of a time when you had to troubleshoot and fix a complex issue in a project?**

Elaborate on the section about investigating the reason for poor conversion.

> **Can you describe a time you solved an engineering problem or achieved meaningful metric improvement?**

Elaborate on the section about moving to server-side rendering and applying modern performance techniques.

> **Can you describe a time when you had to make an important engineering decision and how you decided between tradeoffs?**

Elaborate on the section about choosing which frameworks to migrate to and the reasons behind the decisions.
