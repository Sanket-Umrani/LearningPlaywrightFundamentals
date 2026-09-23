# Session State

> Concept notes for interview preparation. Beginner-friendly, with the Selenium vs Playwright comparison and a ready-to-say interview answer.

## 1. What is session state? (beginner version)

Think of a website like a **concert venue**.

- When you log in, the bouncer gives you a **wristband** (a cookie + token).
- For the rest of the night you just show the wristband — you never show your ID again.
- The wristband **expires** (session ends) or you **leave** (close the browser).

That wristband is the **session state**. Technically it is the small data a website stores in your browser **after login** so it remembers you:

- **Cookies** — `sessionid`, auth tokens
- **localStorage** — tokens apps (React/Angular SPAs) save
- **sessionStorage** — tab-only data
- **IndexedDB** — bigger application data

So: **session state = the saved proof that you are already logged in.**

## 2. Why do testers care? (the point of it)

Without it, every single test does this:

```
open browser -> go to login page -> type email -> type password -> click login -> THEN start the real test
```

With 100 tests you log in 100 times. Slow, flaky, and a nightmare if login has OTP or CAPTCHA.

With session state you **log in once, save the wristband to a file, and reuse it** — tests jump straight to the page they care about.

**The use:** skip the login UI, speed up tests, and remove login flakiness.

## 3. Playwright's version (built-in)

Playwright calls it **`storageState`** and it is a first-class feature.

Step 1 — log in once and save it to a JSON file:

```ts
// auth.setup.ts
import { test as setup, expect } from '@playwright/test';

setup('login and save state', async ({ page }) => {
  await page.goto('https://myapp.com/login');
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/dashboard/);

  // saves cookies + localStorage + sessionStorage to this file
  await page.context().storageState({ path: 'auth/user.json' });
});
```

Step 2 — tell the other tests to reuse it, in `playwright.config.ts`:

```ts
projects: [
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  {
    name: 'chromium',
    use: { storageState: 'auth/user.json' }, // <-- the magic line
    dependencies: ['setup'],                 // run setup first
  },
]
```

You can also do it on the fly inside one test:

```ts
const context = await browser.newContext({ storageState: 'auth/user.json' });
const page = await context.newPage(); // already logged in
```

**Key point:** `storageState` is a **context-level** setting. A browser context is like a fresh incognito window — the perfect box for one user's session.

## 4. Selenium's version (manual)

Selenium has **no single built-in feature** for this. You build it yourself.

Save after login:

```java
driver.manage().getCookies(); // grab cookies
// serialize to a file, e.g. via Jackson/Gson -> cookies.json
```

Reuse before tests:

```java
Set<Cookie> cookies = /* read from cookies.json */;
for (Cookie c : cookies) {
    driver.manage().addCookie(c); // add back one by one
}
driver.navigate().refresh();      // needed for them to take effect
```

Caveats:

- Cookies **only** — no localStorage/sessionStorage out of the box, so modern SPA apps are painful.
- Cookies have **expiry**, so a saved file can go stale.
- You handle serialization, domain matching, and expiry yourself.
- Alternative: a persistent **Chrome user-data-dir**, which is clunky and breaks parallel runs.

## 5. Selenium vs Playwright — the comparison

| Aspect | Selenium | Playwright |
| --- | --- | --- |
| Built-in session reuse | No, you code it | Yes, `storageState` |
| What it saves | Cookies (manual) | Cookies + localStorage + sessionStorage |
| Format | Whatever you build | One clean JSON file |
| Effort | High (serialize, add cookies, refresh) | About 2 lines |
| Parallel users | Hard (shared profile issues) | Easy (one file per user, one context each) |
| Handles modern SPAs | Poorly | Well |

## 6. Which is more powerful?

**Playwright** — in one line: it is built in, it captures all three storage types (not just cookies), and it replays cleanly in parallel runs. Selenium can *technically* achieve similar results, but only after you write and maintain the plumbing yourself, and it still misses localStorage/sessionStorage for SPAs.

Fair nuance to mention in an interview: Selenium's power is **breadth** — more languages, more browsers, a huge ecosystem, and older enterprise adoption. But for *session state specifically*, Playwright wins clearly.

## 7. Ready-to-say interview answer

> "Session state is the saved data — cookies, localStorage, sessionStorage — that a site stores after you log in so it remembers you. Testers use it so we log in once and reuse that saved state across all tests, which removes login flakiness and speeds everything up.
>
> In Selenium there is no built-in feature — you manually extract cookies, serialize them to a file, add them back with `addCookie`, and refresh. It is cookies-only, so it struggles with modern SPAs.
>
> In Playwright it is a first-class feature called `storageState`. You log in once in a setup test and call `page.context().storageState({ path: 'auth/user.json' })`, then point `use: { storageState: ... }` in the config. It captures cookies plus localStorage and sessionStorage automatically, as one JSON file, and works cleanly with parallel tests.
>
> So for session state, Playwright is more powerful — it is built in and complete, while Selenium needs custom code and still misses browser storage beyond cookies. Selenium's strengths are elsewhere, like language and browser breadth."

That framing usually ends the question, because it answers the *what*, the *why*, the *how*, and the *trade-off* — which is exactly what interviewers listen for.

## Related files

- `tests/03_Locator_Commands/240_Project3.spec.ts` — locator practice, no session state used yet.
