# Codegen

> A beginner-friendly explainer on code generation for browser tests — what it is, why testers use it, and how Playwright's built-in recorder compares to Selenium's approach.

## 1. What is Codegen? (beginner version)

Think of **recording a macro in Excel**. You press "Record Macro," click around, format a few cells, press Stop — and Excel has written the VBA for you. You did the *work* by hand once; the *code* was written automatically as you went.

**Code generation (codegen)** works the same way for browser automation. A **recorder** watches your real clicks and typing in a browser, and writes the automation code for you as you go.

The technical definition: **codegen is a tool that translates your live browser interactions into test code in a chosen language and framework.**

The idea has a few moving parts, and they come in variants:

- **Recorder** — the tool that captures actions (clicks, typing, navigation) in order.
- **Selector generation** — the recorder picks a **locator** for each element (CSS, XPath, role, test-id). This is the part that decides whether your generated test is robust or brittle.
- **Export target** — the language/framework the code is written in (TypeScript + `@playwright/test`, Java + JUnit, Python + pytest, and so on).
- **Two flavours of recording** —
  - **Standalone CLI recorder**: run a command, get a browser, code appears in a window. *(Playwright codegen, Selenium IDE)*
  - **In-test live recording**: the test is already running and paused, and you record into it. *(Playwright's `page.pause()` + Inspector)*
- **Scaffolding** is a close cousin: not recording *your actions*, but generating a starter project or file skeleton for you.

## 2. Why do testers care? (the point of it)

Writing a first test by hand is slow detective work. You open DevTools, hunt for an element, guess a selector, run the test, watch it fail because the selector matched three things, guess again. That trial-and-error loop is where beginners lose hours.

Codegen collapses that loop: **you show the tool once what "correct" looks like, and it hands you working code.**

Before — hand-written, by trial and error:

```
open DevTools -> inspect email field -> guess "#email"
-> run -> fails -> try "input.email" -> run -> fails
-> try "form > div:nth-child(2) > input" -> run -> passes (until the DOM changes)
```

After — recorded, then tidied:

```
npx playwright codegen https://myapp.com/login
-> click the field, type, click Login
-> code appears immediately, with resilient locators
-> tidy it: add assertions, rename the test
```

The catch worth saying out loud: generated code is a **draft, not a finished test**. It has no assertions, no meaningful name, and it may record redundant or implementation-detail locators. You always review and harden it.

**The benefit: codegen removes the "how do I select this element?" tax, so you spend your time on what the test should actually prove.**

## 3. Playwright's version

Playwright ships a first-class recorder. The exact command is **`npx playwright codegen`**, and the generated code uses **role-based and test-id locators** rather than raw CSS/XPath.

```bash
npx playwright codegen https://app.thetestingacademy.com/playwright/multiple_element_filter -o tests/login.spec.ts
```

Useful flags: `-o <file>` to save, `--target=javascript|python|java|...` to change the output language, `--save-storage=auth.json` to capture login state, `--device="iPhone 13"` to record in an emulated device. In the Inspector window you can toggle **Record**, **Pick locator**, and **Assert visibility / text / value** to record assertions too.

Here is a runnable spec in the shape codegen produces — with the rough edges tidied (one filled field instead of a duplicate click, plus a real assertion):

```ts
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('https://app.thetestingacademy.com/playwright/multiple_element_filter');

  await page.getByRole('textbox', { name: 'Email Address' }).fill('user@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('1234567');
  await page.getByTestId('login-button').click();

  await expect(page).toHaveURL(/multiple_element_filter/);
});
```

Notice what you get for free: `getByRole` and `getByTestId` locators, `await` handling, and Playwright's **auto-waiting** on every action. The recorder writes the same style of locator the docs recommend by hand.

For recording *into* a test that is already open, add `await page.pause();` and run with `PWDEBUG=1` — the Inspector opens and you record from there.

## 4. Selenium's version

**Selenium's WebDriver bindings have no built-in recorder.** There is no `selenium codegen` equivalent in the language libraries. Recording comes from tooling *around* Selenium, historically **Selenium IDE** (a browser extension) and the Chrome DevTools Recorder panel, both of which can export a script — but what you get is a starting point, not a finished test: brittle selectors, no waits, no assertions, no structure.

The rest you build yourself — explicit waits, page objects, and selector hardening:

```java
// Hand-written and hand-hardened: Selenium gives you no recorder here.
WebDriver driver = new ChromeDriver();
driver.get("https://myapp.com/login");

WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

WebElement email = wait.until(
    ExpectedConditions.visibilityOfElementLocated(By.id("email")));
email.sendKeys("user@test.com");

driver.findElement(By.id("password")).sendKeys("1234567");
driver.findElement(By.id("login-button")).click();

// No auto-wait: you must explicitly wait for the outcome you expect.
wait.until(ExpectedConditions.urlContains("/dashboard"));
```

Caveats to know before an interview:

- **No recorder in the bindings** — you depend on a separate tool or write everything by hand.
- **Selectors are the weak point.** Exporters tend to emit absolute XPaths or positional CSS that break the moment the DOM shifts.
- **No auto-waiting.** Every generated action needs an explicit `WebDriverWait`, or the test flakes.
- **Exports need real cleanup** — rename, split into page objects, add assertions; treat exported code as a draft.
- **Device/emulation and auth-state recording** are not captured for you; you configure those separately.
- **Tooling churn.** Third-party recorders have come and gone; don't build your suite's future on a recorder's longevity.

## 5. Playwright vs Selenium — the comparison

| Aspect | Selenium | Playwright |
| --- | --- | --- |
| Built-in recorder | No — comes from a separate extension/tool | Yes — `npx playwright codegen` |
| Locator quality out of the box | Absolute XPath / positional CSS, brittle | Role, label, and test-id locators by default |
| Auto-waiting in generated code | No — you add explicit waits | Yes — every action auto-waits |
| Record assertions | Not really | Yes — Inspector records visibility/text/value checks |
| Auth / storage state while recording | Manual, not part of recording | `--save-storage` / `--load-storage` flags |
| Output languages | Whatever the external tool exports | `--target` switches language at record time |
| Extra cleanup needed | High — waits, selectors, structure | Low — mostly naming and assertions |

## 6. Which is more powerful?

**Playwright, for codegen specifically — it is the only one of the two with a recorder built into the product, and the code it writes uses the same resilient locators and auto-waiting you would write by hand.**

The honest nuance: Selenium's recorder advantage is *breadth*, not quality. Its ecosystem spans more languages and more browsers, and because recording is a separate concern, teams often plug in whatever tool fits. But you pay for that in cleanup — brittle selectors and hand-added waits — and the recording layer itself lives outside the framework, so it drifts and ages independently. Playwright's recorder is good *because* it is not a bolt-on: generated code inherits the framework's locator strategy, so the gap between "recorded" and "production-ready" is small.

## 7. Ready-to-say interview answer

> "Codegen means code generation — a recorder watches my real clicks and typing in the browser and writes the automation code for me, a bit like recording a macro in Excel. Testers use it because hand-writing locators is slow trial-and-error, and codegen removes that tax. In Selenium there's no recorder built into the WebDriver bindings — recording comes from a separate tool like Selenium IDE, and the exported code is brittle: absolute XPaths, no auto-waiting, no assertions, so you spend a lot of time hardening it. In Playwright it's built in: I run `npx playwright codegen <url>`, click through the flow, and it writes a spec using `getByRole` and `getByTestId` locators with auto-waiting, and I can even record assertions in the Inspector. The important caveat is that generated code is a draft — no assertions, no meaningful name — so I always review and tidy it. So for codegen, Playwright is more powerful because the recorder is a first-class feature and the code it produces is close to what I'd write by hand; Selenium's strength is breadth of languages and browsers, not recording."

## Related files

- `tests/01_Basics/231_CodeGen_tta-check.spec.ts` — a spec in this repo with the header comment `//This code is generated from CodeGen`, showing the characteristic codegen output shape (and its rough edges: an unrenamed `test('test', ...)`, a field clicked then filled, a duplicated click, and hard-coded credentials).
- `playwright.config.ts` — where generated specs under `testDir: './tests'` get picked up, and where `use` settings (like `headless: false`) affect what you see while recording.
- `Concept_Understanding/Session_State.md` — the companion note following the same Playwright-vs-Selenium format.
