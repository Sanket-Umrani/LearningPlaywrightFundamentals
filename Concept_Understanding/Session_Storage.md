# Session Storage

> A beginner-friendly interview note on browser **sessionStorage**: what it is, why testers seed or reuse it, and how Playwright and Selenium each handle it.

## 1. What is Session Storage? (beginner version)

Picture an office building with two kinds of boards.

- The **noticeboard in the lobby** is shared by *everyone* and stays up for *months*. That is **localStorage**.
- Each **meeting room has its own whiteboard**. You scribble on it during your meeting, and the moment everyone leaves the room, a cleaner wipes it clean. Nobody in the *other* meeting rooms can see your whiteboard.

**sessionStorage** is that meeting-room whiteboard.

Technically, **sessionStorage** is part of the **Web Storage API**. It stores data as **string key/value pairs** that are:

- scoped to a single **browser tab** (one top-level browsing context),
- scoped to a single **origin** (scheme + host + port),
- kept for the **page session** — it survives page reloads and same-tab navigations, but is **cleared when the tab or window closes**,
- **never sent to the server automatically** (unlike cookies), and readable only from **JavaScript** in that page.

The Web Storage family and its neighbours:

- **sessionStorage** — per-tab, wiped when the tab closes.
- **localStorage** — per-origin, persists until explicitly cleared.
- **Cookies** — tiny, sent with every HTTP request, can be `httpOnly`.
- **IndexedDB** — large structured data (used by Firebase Auth, offline apps).

Typical real uses: multi-step forms/wizards, "already shown this hint" flags, and short-lived auth tokens that should die with the tab.

## 2. Why do testers care? (the point of it)

Many apps stash a token or a "step 3 of 5" flag in sessionStorage. If your test opens a **fresh tab**, that storage is **empty**, so the app bounces you to `/login` or back to step 1 — and your real assertion never runs. Replaying the whole setup flow in every test is slow, flaky, and impossible when login has OTP/CAPTCHA.

```
BEFORE (every test)
  new tab -> sessionStorage empty -> app redirects to /login
  -> type email -> type password -> wait -> THEN start the real test

AFTER (seed once)
  seed the one key the app needs (or reuse saved cookies/localStorage)
  -> app believes you are already "in" -> test starts on the page it cares about
```

**The benefit: seeding or reusing browser storage lets each test start in the state it needs, cutting runtime and killing setup flakiness.**

## 3. Playwright's version

Playwright exposes Web Storage as first-class async objects. On **Playwright 1.63+**, `page.sessionStorage` and `page.localStorage` are `WebStorage` instances with `getItem`, `setItem`, `items`, `removeItem`, and `clear`.

Important nuance: the `storageState` file that Playwright saves contains **cookies + `localStorage`** (plus optional `indexedDB`/`opfs`), but **not** `sessionStorage`. So `test.use({ storageState })` alone will **not** restore sessionStorage — you seed that separately.

```ts
import { test, expect } from '@playwright/test';

// Restores cookies + localStorage from a previously saved login. NOT sessionStorage.
test.use({ storageState: './user-session.json' });

test.beforeEach(async ({ context }) => {
  // Runs before ANY page script — the safest way to preset sessionStorage.
  await context.addInitScript(() => {
    window.sessionStorage.setItem('wizardStep', '3');
  });
});

test('app starts on step 3 without replaying the wizard', async ({ page }) => {
  await page.goto('https://app.example.com/dashboard');

  // Playwright 1.63+: typed, async access to the tab's sessionStorage.
  const step = await page.sessionStorage.getItem('wizardStep');
  expect(step).toBe('3');

  await page.reload();               // sessionStorage survives a reload
  await expect(page.getByTestId('wizard-step')).toHaveText('3');
});
```

And saving a logged-in state in the first place (exactly what this repo does) is one call on the **context**, not the page:

```ts
await context.storageState({ path: './user-session.json' });
```

## 4. Selenium's version

Selenium (in most language bindings) has **no Web Storage abstraction at all**. Everything goes through raw JavaScript and the `JavascriptExecutor` — plus cookies through `driver.manage()`.

```java
JavascriptExecutor js = (JavascriptExecutor) driver;

// You must be on the real origin first — about:blank has no sessionStorage.
driver.get("https://app.example.com/dashboard");

js.executeScript("window.sessionStorage.setItem('wizardStep', '3');");
String step = (String) js.executeScript("return window.sessionStorage.getItem('wizardStep');");
js.executeScript("window.sessionStorage.clear();");

// Cookies are a separate channel:
driver.manage().getCookies();       // save
// driver.manage().addCookie(c);    // restore, then driver.navigate().refresh()
```

Caveats you must handle yourself:

- **Origin first** — you must navigate to the app's origin before touching sessionStorage; there's nothing to write on a blank page.
- **Raw strings and casts** — `executeScript` returns `Object`, so you cast to `String`/`Long`/`Double` and own the serialization.
- **No "before scripts run" hook** — to inject before the app's own JS runs you need CDP (`Page.addScriptToEvaluateOnNewDocument`), which is Chromium-only and verbose. Selenium has no portable `addInitScript` equivalent.
- **Cookies vs Web Storage are different APIs** — `driver.manage()` covers cookies only; sessionStorage/localStorage still need JS.
- **New tab = empty storage** — every new window/tab starts a brand-new, empty session, so parallel tests can't share it.

## 5. Playwright vs Selenium — the comparison

| Aspect | Selenium | Playwright |
| --- | --- | --- |
| Reading/writing `sessionStorage` | Raw `executeScript("...")`, manual casts | Typed async `page.sessionStorage` API (1.63+), or `page.evaluate` |
| Built-in save/restore of a login | Cookies only, via `driver.manage()` | `context.storageState()` — cookies + `localStorage` (+ optional `indexedDB`/`opfs`) |
| Does it persist `sessionStorage`? | No (nothing built in) | No — `storageState` excludes it by design; you seed it yourself |
| Seeding data before the app's scripts run | Needs CDP `Page.addScriptToEvaluateOnNewDocument` (Chromium-only) | Portable `context.addInitScript()` / `page.addInitScript()` |
| Cookie handling | `getCookies()` / `addCookie()` + `refresh()` | Captured and restored automatically inside `storageState` |
| Reusing one login across many tests | Hand-rolled: serialize, add cookies, refresh | One line: `test.use({ storageState: 'user-session.json' })` |
| Parallel runs / new tabs | New window = empty storage; shared-profile clashes | One context per test; `addInitScript` reapplies cleanly |

## 6. Which is more powerful?

For session-storage work, **Playwright is the more powerful tool** — it gives you a typed async `sessionStorage`/`localStorage` API *and* a portable `addInitScript()` for early seeding, where Selenium makes you write raw JavaScript strings and reach for Chromium-only CDP for the same result.

The honest counterpoint: **neither tool auto-persists `sessionStorage`.** Playwright's `storageState` is not magic here — it deliberately saves cookies and `localStorage` only. Selenium can reach the exact same outcome; you just own the plumbing (JS, casts, cookies, refresh). And Selenium's real strengths are elsewhere — language and browser breadth, a huge ecosystem, and older enterprise adoption.

## 7. Ready-to-say interview answer

> "Session storage is the browser's `sessionStorage` — part of the Web Storage API. It's a key/value store, kept as strings, scoped to one tab and one origin, and it's cleared the moment the tab is closed. Unlike cookies it's never sent to the server automatically; it's only reachable from JavaScript. I care about it in testing because apps often keep an auth token or a wizard step there, so if my test opens a fresh tab the storage is empty and the app kicks me back to login. In Playwright I'd read or write it with the typed async `page.sessionStorage` API, and I'd preset it with `context.addInitScript()` so it's there before the app's own scripts run. One thing I always mention: Playwright's `storageState` saves cookies and `localStorage`, but not `sessionStorage`, so that still needs seeding separately. In Selenium there's no Web Storage API at all — you call `JavascriptExecutor.executeScript` with raw JS strings, cast the result, and use `driver.manage().addCookie` for cookies, and if you need to inject before the page scripts you're into CDP, which is Chromium-only. So for session storage Playwright is more powerful and complete, but Selenium can get there with more manual plumbing."

## Related files

- `tests/04_SessionStorage/243_SessionStorage.ts` — logs in once and saves state with `context.storageState({ path: './user-session.json' })`.
- `tests/04_SessionStorage/244_Test_Wingify.spec.ts` — reuses that saved state via `test.use({ storageState: './user-session.json' })`.
- `user-session.json` — the saved state file (`cookies` + `origins[].localStorage`; no `sessionStorage`).
- `Concept_Understanding/Session_State.md` — companion note on the broader session-state concept.
- `playwright.config.ts` — test config where a shared `storageState` would normally be set.
