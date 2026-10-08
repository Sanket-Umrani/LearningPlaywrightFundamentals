# Concept Analysis

> A beginner-friendly analysis of the concepts represented by the current repository changes.
> Scope: 2 modified files (`playwright.config.ts`, `README.md`) and 14 new spec files covering dropdowns, iframes, keyboard input, drag-and-drop, hover menus, and JavaScript dialogs.

---

## How to read this document

Each concept below separates three things:

- **What the code demonstrably does** — read directly from the snapshots.
- **What is likely intended but not exercised** — flagged as inference, not fact.
- **What is missing** — e.g. a test named "Verify…" that never asserts.

Snippets are trimmed from the real files. Line numbers are not shown, but the sequence of calls is preserved exactly as written.

---

### Concept 1: Native `<select>` elements and programmatic option selection

#### What it is (beginner version)

A plain HTML dropdown is a single `<select>` tag containing `<option>` children. Because the browser renders it as a native widget, a test can jump straight to "set this dropdown to this value" without clicking through a list — you never have to open it and you never have to see the options on screen.

#### Why do testers care?

Native selects are stable, keyboard-accessible, and identical across sites. A test that drives them directly is far less flaky than a test that clicks the dropdown open and then tries to find the right option by coordinates. Knowing when a control *is* native is the first step in choosing the right strategy.

#### Repository implementation

`tests/08_WebSelect_Dropdowns/254_SimpleDropdown.spec.ts` targets a page with a single native dropdown identified by `#dropdown`. The sequence is: click the element, set the value by label, then dismiss with `Escape`.

```ts
await page.locator('#dropdown').click();
await page.selectOption('#dropdown', 'Option 2');
await page.keyboard.press('Escape');
```

This is a demonstration of the call, not a verification. There is **no assertion in the file** — nothing proves the dropdown ended up on "Option 2". The `expect` import is present but unused.

#### Playwright usage

- `page.selectOption(locator, value)` sets the value directly. Here the value is a visible label (`'Option 2'`), not a `value` attribute.
- The `click()` before it is optional. Some apps only populate or enable the select after a click, so learners often keep it, but it is an extra step that can introduce a flake.
- `press('Escape')` closes any open popover — the same call reappears in the custom-dropdown specs, where the widget is a real rendered listbox.

#### Selenium or alternative approach

In Selenium the equivalent is the `Select` class from `org.openqa.selenium.support.ui`, constructed from the `WebElement` and driven with `selectByVisibleText` / `selectByValue` / `selectByIndex`. The same file also commonly uses `new Select(element).selectByVisibleText("Option 2")`. In Cypress the same idea is `.select('Option 2')`.

#### Comparison

| Aspect | Playwright `selectOption` | Selenium `Select` |
| --- | --- | --- |
| Opens the widget visually | No | No |
| Works on non-`<select>` widgets | No | No |
| Implicit waiting | Automatic (Playwright auto-waits and retries the action) | None — needs `WebDriverWait` |
| Return value | No useful return | `Select` can return the selected option |

The practical difference: Playwright auto-retries until the element is actionable, so Selenium equivalents usually need an explicit `wait.until(ExpectedConditions.visibilityOf(element))` first.

#### Interview-ready answer

> "For a native `<select>` I use Playwright's `selectOption`, which sets the value without opening the dropdown, and it's more stable than simulating a click plus option click. But `selectOption` only works on native selects — for a custom widget that renders its own listbox, I have to open the trigger and click the option by role or text. In Selenium the native equivalent is the `Select` class, and the difference in my experience is that Playwright auto-waits for actionability, while Selenium needs explicit `ExpectedConditions` waits."

#### Related files

- `tests/08_WebSelect_Dropdowns/254_SimpleDropdown.spec.ts`
- `playwright.config.ts`

---

### Concept 2: Custom dropdown widgets — trigger, then option

#### What it is (beginner version)

Many modern sites do not use `<select>` at all. They use a "div that looks like a dropdown": you click a **trigger** (the box you see), the site opens a list of options built from `div`/`li`/`span` elements, and you click one of them. There is no select element for a tool to set.

#### Why do testers care?

This is the most common real-world dropdown shape. The test has to mirror the human interaction exactly: open it first, *then* find the option. The difficulty is not the click — it's reliably identifying which option you mean when several lists of options may exist on the page at once.

#### Repository implementation

`tests/08_WebSelect_Dropdowns/255_CustomDropdown.spec.ts` handles three different custom dropdowns on one page, each with a different locator strategy:

- language dropdown — trigger found by `getByTestId('lang-trigger')`, option by `getByRole('option', { name: 'JavaScript' })`
- framework dropdown — trigger found by `locator('#framework-trigger')`, option again by role
- experience dropdown — trigger by test id, but the option found by `getByText(..., { exact: true })`

```ts
await page.getByTestId('lang-trigger').click();
await page.getByRole('option', { name: 'JavaScript' }).click();
await page.locator('#framework-trigger').click();
await page.getByRole('option', { name: 'Svelte' }).click();
```

The file again has **no assertion** — the pattern shown is "how to open and pick", not "how to confirm the pick stuck".

#### Playwright usage

- `getByRole('option', { name })` is the strongest selector available here. The role comes from the widget marking its items as options, so it is resilient to CSS class churn.
- `getByText(name, { exact: true })` is the fallback when the option is not exposed as a proper ARIA option — the third dropdown in this file uses it, with `exact: true` to prevent matching a nearby label that merely contains the same words.
- Mixing two selector styles in one file is a real learning signal: the author reached for `getByRole` first and fell back to text when the DOM did not cooperate.

#### Selenium or alternative approach

Selenium has no role-based query. The same step becomes an XPath or CSS locator such as `//div[@role='option'][text()='JavaScript']` or a `By.xpath("//*[contains(text(),'JavaScript')]")`, then a plain `click()`. In Cypress, the equivalent readable form is `cy.get('[role=option]').contains('JavaScript')` or `cy.findByRole('option', { name: 'JavaScript' })` via Testing Library.

#### Comparison

| Aspect | `getByRole('option', { name })` | Selenium XPath | `getByText(..., { exact: true })` |
| --- | --- | --- | --- |
| Survives CSS class rename | Yes | Yes | Yes |
| Survives markup restructure | Yes | No | Partly |
| Requires correct ARIA in the app | Yes | No | No |
| Strictness | Fails if it matches >1 element | May match many silently | Limited by `exact` |

`getByRole` also enforces uniqueness — if two elements both look like the option named "JavaScript", the call fails loudly instead of silently clicking the first one. That strictness is a feature, not a bug.

#### Interview-ready answer

> "For custom dropdowns I always split the interaction into two steps: click the trigger, then click the option. I prefer `getByRole('option', { name })` because the widget already exposes the ARIA role, which survives restyling. If the component doesn't set the role correctly, I fall back to `getByText` with `exact: true` to avoid matching a wrapper element. In Selenium this would be an XPath on `role='option'`, which is more brittle, and I would wrap the click in an explicit wait for the option to become visible because the option doesn't exist in the DOM until the dropdown opens."

#### Related files

- `tests/08_WebSelect_Dropdowns/255_CustomDropdown.spec.ts`
- `tests/08_WebSelect_Dropdowns/254_SimpleDropdown.spec.ts`

---

### Concept 3: Rich select widgets — search, creatable, multi-chip, grouped, and async options

#### What it is (beginner version)

Newer select components (the kind built by libraries such as React Select or Select2) add behaviours on top of "pick one item": you can **type to search**, you can **type a value that doesn't exist** and create it, you can **pick several items at once** which then show up as removable chips, options can be **grouped under headings**, and the option list can be **fetched from a server** while you type.

#### Why do testers care?

Each of these is a different failure mode. Search needs an assertion that the list actually filtered. Creatable needs a keyboard commit. Multi-select needs a way to get *all* selected values. Async needs a wait for a network round trip. A single "select the option" helper never covers all five.

#### Repository implementation

`tests/08_WebSelect_Dropdowns/256_AdvancedCustomDropdown.spec.ts` walks through five variants on one page, each commented with a numbered label:

1. **Single searchable** — open `#rs-single`, click the option named `Playwright`.
2. **Multi-chip with remove** — open `#rs-multi`, click `Pytest` and `Cucumber` (both with `exact: true`), then `Escape`.
3. **Creatable multi, committed with Enter** — open `#rs-creatable`, `fill('Selenium')` into the inner input, then `press('Enter')`, then `Escape`.
4. **Grouped options** — open `#rs-grouped`, click the option named `Cloudflare Workers`.
5. **Async, fetched on type** — open `#rs-async`, fill `'MU'` into the inner input, then assert the menu contains Mumbai.

The async case is the only one in the whole dropdown folder that actually asserts:

```ts
await expect(page.getByTestId('rs-async-menu')).toContainText(/Mumbai/i);
await page.getByRole('option', { name: /Mumbai/i }).click();
```

The file's own comment records the learning: a regex was passed to `toContainText` to avoid a case-sensitivity failure. A commented-out `await expect(...)` line directly above shows the strict version that presumably failed first.

#### Playwright usage

- `fill()` on a widget's inner input is how you "type into" a custom select — you target the input element the widget renders, e.g. `getByTestId('rs-creatable-input')`.
- `press('Enter')` commits a typed value. This is the one interaction in these specs that a mouse-only test cannot replicate, and it's the reason the creatable case can't collapse into "click the option".
- `toContainText(/Mumbai/i)` — Playwright accepts a regular expression for text matching, which removes whole classes of casing/prefix mismatch failures.
- `expect(...)` is a **retrying** assertion: it re-checks until it passes or the test times out. That is why it is safe to use right after a search without an explicit sleep — the assertion *is* the wait.
- `.first()` is not used here, so if the widget ever renders a duplicate option the strict locator will fail — which is a useful early warning.

#### Selenium or alternative approach

Selenium would need the same two-step click plus `sendKeys` into the inner input, but the *search* behaviour has no equivalent — there is no `selectByTextMatching` in the `Select` class, because the `Select` class only works on native `<select>`. You would drop to `Actions` + `sendKeys` + an explicit `WebDriverWait` on the filtered result. Cypress handles this area better than plain Selenium, with `.type()` plus `cy.get('@results')` and `.type('{enter}')`.

#### Comparison

| Variant | Key call | What breaks if you get it wrong |
| --- | --- | --- |
| Searchable | `fill()` then `expect` on the filtered list | Asserting before results arrive |
| Creatable | `fill()` + `press('Enter')` | Value typed but never committed |
| Multi-chip | repeated option clicks + `Escape` | Leaving the list open swallows the next click |
| Grouped | `getByRole('option', { name })` | Group heading matched instead of the item |
| Async | `expect(...).toContainText(/re/)` | Fixed sleep instead of a real wait |

The single most transferable lesson is the last row: an async dropdown should be handled by a retrying assertion, not by `waitForTimeout`.

#### Interview-ready answer

> "I treat advanced select widgets as five separate patterns rather than one 'select' helper: searchable needs a type-then-assert-the-filtered-list, creatable needs a type-then-Enter commit, multi-select needs repeated option clicks and a way to read back all chips, grouped needs a role-based option locator so I don't grab the heading, and async needs a retrying assertion rather than a fixed sleep. In Playwright `expect(...).toContainText(/Mumbai/i)` is doing the waiting for me — it re-evaluates until it matches or times out — which is the biggest practical difference from Selenium, where I'd need an explicit `WebDriverWait` on the results container."

#### Related files

- `tests/08_WebSelect_Dropdowns/256_AdvancedCustomDropdown.spec.ts`
- `tests/08_WebSelect_Dropdowns/255_CustomDropdown.spec.ts`

---

### Concept 4: Iframes — addressing elements inside embedded documents, including nested frames

#### What it is (beginner version)

An iframe is a whole second document embedded in the page. Its elements are not children of the main page, so `page.locator(...)` cannot see them. A test has to first say *which* document to look inside, then search that document — and if the iframe is inside another iframe, you repeat the step at each level.

#### Why do testers care?

Frames appear in ads, payment widgets, video players, and legacy enterprise pages. A test that forgets to switch frames will "not find" an element that is plainly visible to a human, which is one of the most common beginner confusion points. Nested frames add a second level of the same problem.

#### Repository implementation

The new `tests/09_Frame_IFrames/` folder contains three files that escalate in difficulty:

**Single frame, full form workflow** — `257_Iframe_TestCase.spec.ts` declares a typed locator:

```ts
let vehicleFrame: FrameLocator = page.frameLocator('#frame-one');
await vehicleFrame.locator('#RESULT_TextField-1').fill('Maruti Suzuki 800');
await vehicleFrame.locator('#RESULT_RadioButton-1').selectOption('Sedan');
```

Every subsequent call in the file — more text fields, a `<select>`, a textarea, a submit click, and reading the result — reuses the same `vehicleFrame` variable. The result is read with `innerText()` and printed. **The form data is hard-coded, and the result is only logged, not asserted.**

**Multiple sibling frames** — `258_Iframe_TestCase.spec.ts` selects frames by their `name` attribute, reads a heading from each with `innerText()`, and also tries to enumerate the raw frame elements with:

```ts
let allFrames = await page.locator('//frames').all();
```

This is worth flagging honestly: `//frames` is XPath syntax, but the CSS-engine `locator()` does not accept XPath. A more plausible intent was a tag selector such as `page.locator('frame, iframe')`. The `FrameLocator` calls that follow (`[name="main"]`, `[name="side"]`) are unaffected — those are attribute selectors and work as written. So the frame-interaction concept is demonstrated correctly; only the inventory line looks defective.

**Nested frames** — `259_Nested_Iframe.spec.ts` chains the abstraction, which is the key idea:

```ts
let frame1: FrameLocator = page.frameLocator('#pact1').first();
let frame2: FrameLocator = frame1.frameLocator('#pact2').first();
let frame3: FrameLocator = frame2.frameLocator('#pact3').first();
```

Filling `#inp_val` inside frame 1, `#jex` inside frame 2, and `#glaf` inside frame 3 works with no `switchTo` calls at all.

#### Playwright usage

- `page.frameLocator(selector)` returns a `FrameLocator`, which is a *locator factory*, not a frame handle. It is chained, never "entered".
- Nesting falls out naturally: `frame1.frameLocator('#pact2')` means "the frame matching `#pact2` **inside** frame 1".
- `innerText()` returns rendered, visible text; `textContent()` returns raw text including hidden content. The specs use `innerText()` for frame output and `textContent()` for columns and menu output.
- `getAttribute('name')` / `getAttribute('src')` is the way to inspect a frame element itself.
- `FrameLocator` is imported as a *type* alongside `test` and `expect` in all three files — a purely compile-time detail, and a common point of confusion for beginners.

#### Selenium or alternative approach

Selenium requires imperative switching: `driver.switchTo().frame(elementOrIndex)` to enter, and `driver.switchTo().defaultContent()` to come back. Nesting means calling it once per level, and forgetting a `defaultContent()` between tests is a classic source of "element not found in frame" failures — usually why suites keep a fresh driver per test. Selenium also has a hard limit of frame nesting, whereas Playwright's chained locators have no equivalent constraint in practice.

#### Comparison

| Aspect | Playwright `frameLocator` | Selenium `switchTo().frame()` |
| --- | --- | --- |
| Model | Chained, declarative locator factory | Mutable "current frame" state |
| Nesting | Natural chaining | Repeated calls, in order |
| Reset between tests | Not needed | Needs `defaultContent()` |
| Parallel safety | Safe — no shared state | Shared mutable state on the driver |
| Post-navigation frame loss | Handled by re-resolution | Can throw stale-element errors |

The architectural difference is the important one: Selenium mutates *where the driver currently is*, while a Playwright `FrameLocator` is just a value that says *where to look*. There is no "current frame" to get out of sync.

#### Interview-ready answer

> "I never use `switchTo().frame` in Playwright — I use `page.frameLocator(...)`, which returns a locator factory I can chain. So a three-level nested frame is just `page.frameLocator('#pact1').frameLocator('#pact2').frameLocator('#pact3')`, and because it's a locator rather than a stateful cursor there's nothing to reset between tests and it's safe to use in parallel. Selenium is the opposite: it's imperative and mutable, so you have to enter each level in order and call `switchTo().defaultContent()` to get back, and getting that wrong is why stale-element and 'not found' errors are so common there. One extra thing I'd add: `frameLocator` re-resolves after navigation, so it doesn't break the way a raw frame handle does."

#### Related files

- `tests/09_Frame_IFrames/257_Iframe_TestCase.spec.ts`
- `tests/09_Frame_IFrames/258_Iframe_TestCase.spec.ts`
- `tests/09_Frame_IFrames/259_Nested_Iframe.spec.ts`
- `tests/08_WebSelect_Dropdowns/257_Iframe_TestCase.spec.ts` (naming overlap only — not a distinct file)

---

### Concept 5: Keyboard input, modifier keys, and screenshot-based evidence

#### What it is (beginner version)

Real users type and navigate with the keyboard. A test that only uses mouse clicks misses keyboard-only flows and accessibility regressions. This means sending single keys, sending a key *with* a modifier held down, and controlling whether a modifier stays pressed afterwards.

#### Why do testers care?

Keyboard paths exercise different code from mouse paths — autocomplete, submit-on-Enter, Escape-to-close, and capitalisation all behave differently. A keyboard regression in a search box or a shortcut is invisible to a mouse-only suite.

#### Repository implementation

`tests/10_Keyboard_Hover_DragDrop_Calender/260_KeyboardInputHandling.spec.ts` targets a page that displays the key code of the last key pressed, then captures the rendered result as a PNG after each keystroke:

```ts
await page.keyboard.press('A');
await page.screenshot({ path: 'A.png' });
await page.keyboard.press('ArrowLeft');
await page.screenshot({ path: 'ArrowLeft.png' });
await page.keyboard.press('Shift+O');
await page.screenshot({ path: 'O.png' });
```

Two things stand out. First, `press('A')` is issued twice with both screenshots written to the same `'A.png'` path, so the second overwrites the first. Second, the last two lines leave the modifier in an unexpected state:

```ts
await page.keyboard.up("Shift");
await page.keyboard.down("Shift");
```

`down()` is called *last* and never released, so Shift is held down when the test pauses. That looks like a deliberate demonstration of the difference between `up` and `down`, but it is not asserted or cleaned up.

#### Playwright usage

- `page.keyboard.press(key)` = key down immediately followed by key up — a complete tap.
- `press('Shift+O')` sends both the modifier and the letter as one action, producing an uppercase character. This is different from `keyboard.down('Shift')` followed by `press('O')`, which is the manual equivalent.
- `page.keyboard.down(key)` / `page.keyboard.up(key)` are for holding a modifier across several actions — e.g. `Shift` + click to multi-select, or `Control` + `a` to select all text in a field.
- `page.screenshot({ path })` is a debugging/evidence tool here, not an assertion. With a relative path, files land beside the working directory and are not cleaned up by the test runner.

#### Selenium or alternative approach

Selenium's `Actions` class exposes `keyDown(WebElement)`, `keyUp(WebElement)`, and `sendKeys(...)` on `WebElement`, and a bare `sendKeys` on the active element. The manual-hold pattern is `new Actions(driver).keyDown(Key.SHIFT).perform()`. The behavioural difference is in *focus*: Selenium keys go to whatever the browser currently has focused, and locating that element can be awkward; Playwright keys are dispatched to the page as a whole and are often combined with `locator.press('Enter')` when you want the key to go to a specific field.

#### Comparison

| Aspect | Playwright `press` | Selenium `sendKeys` |
| --- | --- | --- |
| Modifier combos | `press('Shift+O')` inline | `keyDown` then `sendKeys` then `keyUp` |
| Target | Page-level, or `locator.press(...)` on an element | Active element, or `element.sendKeys(...)` |
| Repeatable demo | Needs a screenshot or assertion | Needs a screenshot or assertion |
| Held modifier cleanup | `up()` must be called explicitly | `keyUp()` must be called explicitly |

Neither framework gives you "the key was received" as a return value. The observable effect is always in the DOM, so a real test must assert on the resulting text rather than trust the call.

#### Interview-ready answer

> "For keyboard testing I use `page.keyboard.press` for a tap and `down`/`up` when I need to hold a modifier across actions — for example a Shift-click for multi-select. `press('Shift+O')` sends both in one call, which is cleaner than manually holding Shift. The important discipline is that these calls don't return anything, so the proof has to be an assertion on the DOM afterwards; in this repo that step is captured as screenshots rather than assertions, which is fine for exploration but would be a gap in CI. In Selenium the same thing is `Actions.keyDown(Key.SHIFT)` / `keyUp`, and the main practical difference is that Selenium's keys go to the currently focused element, so I often have to focus the field first."

#### Related files

- `tests/10_Keyboard_Hover_DragDrop_Calender/260_KeyboardInputHandling.spec.ts`
- `playwright.config.ts`

---

### Concept 6: Drag and drop — three escalating techniques

#### What it is (beginner version)

Drag and drop means: press the mouse on a source element, move it to a target, and release. Some pages implement this with a simple HTML5 drag attribute that a tool can satisfy in one call; others build a custom widget that ignores a one-call drag and needs raw mouse events with intermediate movement steps.

#### Why do testers care?

Drag and drop is where "click an element" abstractions break down. A test can appear to run without error and still have done nothing, because there is no exception when a drop lands on the wrong place. **Verification is not optional here** — it is the only way to know the drag happened.

#### Repository implementation

The four new files under `tests/10_Keyboard_Hover_DragDrop_Calender/` deliberately walk up that difficulty ladder, and the commented-out code is the most instructive part of the folder.

**Level 1 — one-call drag, no verification.** `261_DragDropHandling1.spec.ts`:

```ts
await columnA.dragTo(columnB, { force:  true});
```

`{ force: true }` skips the actionability checks (visible, stable, receives events) and performs the drag regardless. The test title is "Verify Hover for Drag and Drop", but **there is no hover call and no assertion in the file**. Both the title and the flag are worth calling out: the name promises verification the code does not do, and `force: true` is a last resort, not a default.

**Level 2 — same drag, with verification.** `262_DragDropHandling2.spec.ts` drops the `force` flag and adds the missing proof:

```ts
await page.locator('#column-a').dragTo(page.locator('#column-b'));
await expect(page.locator('#column-b')).toContainText('A');
await expect(page.locator('#column-a')).toContainText('B');
```

This is the correct shape: the swap is confirmed by checking that the text moved between columns. It also overrides the timeout for this test with `test.setTimeout(60000)`, with a comment noting 60 seconds.

**Level 3 — manual mouse events.** `263_AdvanceDragDropHandling.spec.ts` is the advanced case. Roughly thirty lines are commented out showing the repeated attempts at the high-level `dragTo` with test-id and column locators, each followed by `expect(...).toBeVisible()`. Those attempts were evidently unsuccessful — the visible code is the fallback, and the file's own comment states the reason:

> "Cards are made of multiple elements, so we need to make use of boundingbox() to get the coordinates… Then we can use mouse events to perform the drag and drop action."

```ts
const sBox = (await source.boundingBox())!;
const tBox = (await target.boundingBox())!;
await page.mouse.move(sBox.x + sBox.width / 2, sBox.y + sBox.height / 2);
await page.mouse.down();
await page.mouse.move(tBox.x + tBox.width / 2, tBox.y + tBox.height / 2, { steps: 10 });
await page.mouse.up();
```

The `steps: 10` option is the critical detail: the move is delivered as ten intermediate positions so the widget receives the move events it expects, rather than one teleport.

#### Playwright usage

- `locator.dragTo(target, options)` — the high-level path. Try this first; it handles the mouse down, the move, and the up.
- `{ force: true }` bypasses actionability. Reach for it only when a legitimate drag starts on a non-obvious element, and always pair it with an assertion, because it removes the safety net too.
- `locator.boundingBox()` returns the element's position and size, or `null` if it is not rendered. The non-null assertion `!` in the snapshot is the author telling TypeScript "I know this is visible."
- `page.mouse.move/down/up` with `{ steps: N }` is the manual path for widgets that need real intermediate movement.
- Center-point arithmetic (`x + width / 2`) is the standard way to aim at an element's middle rather than its corner.

#### Selenium or alternative approach

Selenium's `Actions` class is the direct analogue: `dragAndDrop(source, target)` for the simple case, and `moveToElement(source).clickAndHold().moveToElement(target).release()` for the manual one. `clickAndHoldAndRelease`, `moveByOffset`, and `keyDown/keyUp` cover the variations. In Selenium, mid-move interpolation is the trickier part — a single `moveToElement` can miss custom widgets, so developers often chain several `moveByOffset` calls, which is manually what `steps: 10` does in one option.

#### Comparison

| Approach | When it works | Risk |
| --- | --- | --- |
| `dragTo(target)` | Simple, well-behaved widgets | Fails on composite cards |
| `dragTo(target, { force: true })` | Legit but unusual hit targets | Silently drops on wrong element |
| `mouse.move/down/up` + `steps` | Custom, event-sensitive widgets | Coordinates are scroll-position dependent |
| `boundingBox()` on a scrolled-out element | — | Returns `null`; the `!` will not save you |

The progression in this folder is the honest real-world answer: **start with `dragTo`, verify, and only fall back to manual mouse events when the widget demonstrably ignores the high-level call.**

#### Interview-ready answer

> "I always try `dragTo` first because it handles press, move, and release in one call, and I never leave it unverified — a drag that doesn't happen produces no error, so I assert that the source and target contents actually swapped. When `dragTo` doesn't work on a composite card, I drop to `boundingBox()` plus `mouse.move` / `down` / `move(..., { steps: 10 })` / `up`; the `steps` option matters because custom widgets need intermediate move events, not one teleport. I'd also flag that `{ force: true }` should be a last resort — it disables actionability checks, so it removes exactly the safety net that would have told you the drag was bogus. In Selenium the equivalent is `Actions.dragAndDrop`, or `clickAndHold().moveToElement().release()` for the manual version."

#### Related files

- `tests/10_Keyboard_Hover_DragDrop_Calender/261_DragDropHandling1.spec.ts`
- `tests/10_Keyboard_Hover_DragDrop_Calender/262_DragDropHandling2.spec.ts`
- `tests/10_Keyboard_Hover_DragDrop_Calender/263_AdvanceDragDropHandling.spec.ts`
- `playwright.config.ts`

---

### Concept 7: Right-click context menus

#### What it is (beginner version)

A right-click on an element opens a custom menu that is usually built from ordinary `span` elements, not from a native browser menu. To test it, you press the right mouse button, then click the menu item you want.

#### Why do testers care?

Context menus are the standard interaction for row-level actions in tables, file lists, and cards — delete, rename, copy, move. They are also the classic "works on Windows, untested elsewhere" path, because the test only runs against one browser in one platform here.

#### Repository implementation

`tests/10_Keyboard_Hover_DragDrop_Calender/264_ContextMenuDragDrop.spec.ts` opens a menu on a Kanban-style board. Note that the filename says "DragDrop", but the test performs **no drag operation** — the accurate description is right-click → read options → click one:

```ts
await page.locator('span.context-menu-one').first().click({ button: 'right' });

const allOptions: string[] = await page
    .locator('ul.context-menu-list span')
    .allInnerTexts();
console.log(allOptions);

await page.getByText('Copy', { exact: true }).first().click();
```

Three locator techniques appear here, and each solves a specific problem:

- `.first()` on the trigger — there are several `span.context-menu-one` elements on the board, and the strict locator would refuse to act on an ambiguous match.
- `allInnerTexts()` — a bulk read that returns every matching element's visible text as a `string[]` in one call, rather than calling `innerText()` in a loop. The result is only logged, not asserted.
- `getByText('Copy', { exact: true }).first()` — `exact: true` avoids matching a card that merely contains the word, and `.first()` disambiguates if the menu item text appears more than once.

#### Playwright usage

- `click({ button: 'right' })` is the entire right-click. There is no separate `rightClick()` in this snapshot; the button option is how it is done.
- `allInnerTexts()` is the batch counterpart of `innerText()` — one round trip for N elements.
- `.first()` is the standard escape hatch for a strict-locator ambiguity. It should be a deliberate choice with a comment, not a reflex.

#### Selenium or alternative approach

Selenium uses `new Actions(driver).contextClick(element).perform()`. Reading the menu options is then a locator + a loop over `getText()`, since there is no bulk equivalent. In Cypress, `cy.get(el).click({ button: 'right' })` is nearly identical to the Playwright form.

#### Comparison

| Aspect | Playwright | Selenium |
| --- | --- | --- |
| Right click | `click({ button: 'right' })` | `Actions.contextClick(el).perform()` |
| Read all texts | `allInnerTexts()` | loop over `getText()` |
| Handle duplicates | `.first()` / `.nth()` | index in XPath, or list index |
| Auto-wait for menu to appear | Yes (assertions retry) | Needs `WebDriverWait` |

The same `.first()` ambiguity risk exists in both tools. The difference is that Playwright's retrying assertions remove the timing half of the problem, while Selenium still needs an explicit wait between the right-click and the menu-item click.

#### Interview-ready answer

> "A context menu is just a right-click followed by a normal click on a rendered option, so I open it with `click({ button: 'right' })` and then treat the items as regular elements. I read all the options with `allInnerTexts()` for debugging, and I use `.first()` deliberately when the board has several matching triggers, because Playwright's locators are strict and would otherwise fail rather than pick one. The one thing I'd add before this went into CI is an assertion on the resulting state — in this repo the options are only logged and the final click isn't verified. In Selenium this is `Actions.contextClick(element).perform()` plus an explicit wait, since the menu doesn't exist in the DOM until the click lands."

#### Related files

- `tests/10_Keyboard_Hover_DragDrop_Calender/264_ContextMenuDragDrop.spec.ts`

---

### Concept 8: Hover-driven menus and the hover → click → verify pattern

#### What it is (beginner version)

Some navigation is invisible until you point at it. You move the mouse over a menu title, a submenu appears, you click an item, and the page confirms what you chose. Nothing is clickable until the hover happens first.

#### Why do testers care?

Hover is the most commonly skipped interaction in test suites, and the most commonly broken in real applications. A menu that only opens on hover is also where focus/keyboard accessibility bugs live, and it is the step that silently stops working when a banner shifts the page layout.

#### Repository implementation

`tests/PracticePrograms/Hover&Click&Verify.spec.ts` is the one spec in the new set that demonstrates the complete pattern, and the file name states it — hover, click, verify:

```ts
await page.getByTestId('nav-add-ons').hover();
await page.getByRole('menuitem', { name: 'Wi-Fi', exact: false }).click();
await expect(page.getByTestId('hover-output')).toBeVisible();
await expect(page.getByTestId('hover-output')).toContainText('Wi-Fi');
console.log(await page.getByTestId('hover-output').textContent());
```

Notice what makes this a good example rather than a demo:

- The trigger is found by **test id** and the item by **ARIA role** (`menuitem`) — two different strategies for two different element kinds, which is the correct split: stable identifier for the app's own hook, semantic role for a generated menu item.
- `{ name: 'Wi-Fi', exact: false }` deliberately loosens matching. This is a departure from the `exact: true` used everywhere in the dropdown folder, and it is the only place in the new files that does so — likely because the rendered menu item carries extra decoration text.
- Two assertions follow: **visibility** first (the output only exists after the click), then **content**. Checking both matters, because a panel can be visible while still showing stale content.
- `textContent()` is then logged for debugging.

The README also records a test titled "Hover and Click and Verify" inside `262_DragDropHandling2.spec.ts`, but that file's body contains only drag-and-drop steps — so the name appears to be a copy-paste artefact. The genuine hover example is this practice file.

#### Playwright usage

- `locator.hover()` moves the mouse over the element. Like other actions, it auto-waits for the element to be visible, stable, and to receive events.
- The subtlety worth knowing: Playwright auto-waits for the *trigger*, but the *submenu* is created by the hover. The click on the submenu is therefore the first place a timing problem can surface. The retrying `expect` after the click is what absorbs the animation delay.
- `toBeVisible()` and `toContainText()` are both retrying assertions, so they can be called immediately after the click with no sleep.
- The configured viewport matters here — see the next concept. A submenu that renders off-screen at a narrow width produces a real failure, not a flake.

#### Selenium or alternative approach

Selenium uses `new Actions(driver).moveToElement(element).perform()`, and the same auto-wait problem appears: the submenu does not exist until the move completes, so a WebDriver recipe is typically `moveToElement` → explicit wait for the submenu to be visible → click. Cypress is the weakest of the three here, because real hover is awkward and `cy.click({ force: true })` is often reached for, which can bypass the visibility the menu depends on.

#### Comparison

| Aspect | Playwright `.hover()` | Selenium `Actions.moveToElement` |
| --- | --- | --- |
| Auto-wait on trigger | Yes | No |
| Submenu appearance | Absorbed by retrying assertions after the click | Needs an explicit `WebDriverWait` |
| Menu built for keyboard | Same code path as a user would hit | Same |
| Viewport sensitivity | Fails visibly if the submenu renders off-screen | Same |

The pattern generalises: **hover to reveal → act on the revealed element → assert on the resulting state.** The assert is what turns an interaction into a test.

#### Interview-ready answer

> "Hover-driven navigation needs three steps, and people usually only write the first one: hover the trigger, click the item in the submenu, then assert on the result. The reason the assertion isn't optional is that the submenu is created by the hover itself, so a click on a menu that didn't open either fails confusingly or silently does nothing. In Playwright I can call `expect(...).toBeVisible()` right after the click because it retries until it matches, which removes the need for a sleep. In Selenium the same flow needs an explicit `WebDriverWait` for the submenu to appear between `moveToElement` and the click. I'd also test the same menu with keyboard, because hover-only menus are where accessibility regressions hide."

#### Related files

- `tests/PracticePrograms/Hover&Click&Verify.spec.ts`
- `playwright.config.ts`

---

### Concept 9: JavaScript dialogs — alert, confirm, and prompt

#### What it is (beginner version)

`alert()`, `confirm()`, and `prompt()` are browser-native popups that block the page. A click on a button can trigger one, and until the test answers it, the click never completes and every later call fails. JavaScript events with no registered handler are auto-dismissed — which is why an unhandled dialog usually does not hang the run.

#### Why do testers care?

These are the one interaction where a test can pass while asserting nothing. If a dialog appears and is auto-dismissed, the "accept" path is never exercised and the test still reports success. Confirm and prompt are also two-way choices with genuinely different application behaviour behind Ok vs Cancel and OK vs empty input.

#### Repository implementation

`tests/11_JS_Alerts/265_JS_AlertHandling.spec.ts` is the only new file using a suite structure, and the only one with a real arrange/act/assert shape for every case:

```ts
test.describe('Javascript Alerts', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://the-internet.herokuapp.com/javascript_alerts');
    });
```

**Alert** — logs type and message, asserts the message, accepts:

```ts
page.once('dialog', async dialog => {
    console.log('Alert type:', dialog.type());
    expect(dialog.message()).toBe('I am a JS Alert');
    await dialog.accept();
});
```

**Confirm** — asserts the type is `'confirm'`, accepts, then verifies the page's result element. A `dismiss()` line is present but commented out, so the reject path is demonstrated as an alternative but not executed:

```ts
expect(dialog.type()).toBe('confirm');
await dialog.accept();
await expect(page.locator('#result')).toHaveText('You clicked: Ok');
```

**Prompt** — asserts an empty default, accepts with a supplied value, and verifies the page echoed it:

```ts
const inputText = 'Hello from The Testing Academy';
expect(dialog.type()).toBe('prompt');
expect(dialog.defaultValue()).toBe('');
await dialog.accept(inputText);
await expect(page.locator('#result')).toHaveText(`You entered: ${inputText}`);
```

`toHaveText` with a template literal is the strongest assertion in the whole new set — the test's input value flows into the expected output, so a mismatch anywhere in the prompt round trip fails the test.

#### One honest caveat on ordering

In the alert test, the click happens *before* the handler is registered:

```ts
await page.getByRole('button', { name: "Click for JS Alert" }).click();
page.once('dialog', async dialog => { /* ... */ });
await page.pause();
```

The confirm and prompt tests do it the other way round — handler first, then click. This is a real inconsistency in the file, and the likely intent was to register first in all three. Since an unhandled dialog is auto-dismissed, the dialog event may already have fired by the time the listener is attached, which would mean the `dialog.type()` / `dialog.message()` assertions in that first test never execute. That is an inference about runtime behaviour, not something the snapshot proves — but the ordering difference between the three tests is plainly visible and is the kind of detail worth fixing.

#### Playwright usage

- `page.once('dialog', handler)` registers a one-shot handler. Register it **before** the click that triggers the dialog.
- `dialog.type()` returns a string such as `'alert'`, `'confirm'`, or `'prompt'` — asserting it confirms which kind of dialog you are actually handling.
- `dialog.message()` returns the text; `dialog.defaultValue()` returns a prompt's prefilled text.
- `dialog.accept()` dismisses the dialog; for a prompt it optionally takes a value to submit. `dialog.dismiss()` is the decline path.
- `await` inside the handler matters when the callback is async — the page should not be considered handled until the accept or dismiss resolves.
- The handler is where the assertions about the dialog itself live; the assertions about the page's `#result` element happen after the click, in the normal test flow.

#### Selenium or alternative approach

Selenium exposes a `switchTo().alert()` object with `getText()`, `accept()`, and `dismiss()`, plus `sendKeys(...)` to answer a prompt. The classic pattern is click → `switchTo().alert()` → assert text → `accept()` → `switchTo().defaultContent()`. The structural difference: Selenium requires a manual switch, and if the driver never switches, the click itself may throw — so a missing alert handler is loud in Selenium and quiet in Playwright. That invertibility is the practical trap worth remembering.

#### Comparison

| Aspect | Playwright `page.once('dialog')` | Selenium `switchTo().alert()` |
| --- | --- | --- |
| Model | Event handler registered up front | Imperative switch after the click |
| Dialog auto-dismissed if unhandled | Yes | Click throws if not switched to |
| Getting the message | `dialog.message()` | `alert.getText()` |
| Answering a prompt | `dialog.accept(text)` | `alert.sendKeys(text)` then `accept()` |
| Returning to the page | Nothing to do | `switchTo().defaultContent()` |
| Missed handler failure mode | Silent | Loud |

| Dialog kind | Assertion made in this repo | Confirms |
| --- | --- | --- |
| `alert` | `dialog.message()` equals the expected text | A message-only popup was shown |
| `confirm` | `dialog.type()` is `'confirm'`, result is `You clicked: Ok` | The affirmative branch ran |
| `prompt` | `defaultValue()` is `''`, result echoes the typed value | Text made the full round trip |

#### Interview-ready answer

> "Playwright handles JS dialogs through an event: I register `page.once('dialog', ...)` **before** the click, then inspect `type()`, `message()`, and `defaultValue()`, and answer with `accept()` or `dismiss()`. The critical detail is registration order — a dialog with no listener is auto-dismissed, so a test that registers after the click can silently assert nothing. I also assert the page's result element after the dialog, not just the dialog text, because that proves the app reacted correctly. The contrast with Selenium is the interesting part: `switchTo().alert()` is imperative and a missing switch makes the click throw loudly, so the failure mode there is noise, while in Playwright it's silence. I'd also cover the dismiss path — the repo has the `dismiss()` lines commented out, so the Cancel branch is untested."

#### Related files

- `tests/11_JS_Alerts/265_JS_AlertHandling.spec.ts`

---

### Concept 10: Run configuration and test-determinism choices

#### What it is (beginner version)

`playwright.config.ts` is the file that decides how every test in the project runs: which browser, whether the window is visible, how big the window is, and what output is produced. Some of these settings exist for a human watching the test; some exist to make tests behave the same on every machine.

#### Why do testers care?

A test that only passes at one window size is not a test, it's an observation. And a project that depends on a custom reporter for its results has a single point of failure that can break the whole run for reasons unrelated to the tests.

#### Repository implementation

The diff to `playwright.config.ts` makes three changes:

**1. Fixed viewport.** `viewport: { width: 1920, height: 1080 }` is added to the shared `use` block, applying to every test in every project. This is a deliberate reproducibility choice: without it, the default window size depends on the host, and a nav menu or dropdown positioned relative to the viewport can render differently on different machines. The hover-menu spec in the previous concept is a direct beneficiary.

**2. Headed mode retained.** `headless: false` is kept. This pairs with the many `page.pause()` calls in the new specs — the browser stays open and the test stops at the pause so a learner can inspect the page. Headless would be the CI-appropriate setting, but it would make those pauses behave differently.

**3. Custom reporter disabled.** The custom reporter entry is commented out, leaving only the built-in `line` reporter active:

```ts
reporter: [
    ['line'],
    // ['allure-playwright'],
    // ['./utils/CustomReporter.ts']
],
```

Allure was already commented out before this change; the custom reporter is what changed. The visible effect is the dozens of new `reports/runs/run-*.json` and `tta-report/report_*.html` files, which `README.md` now enumerates — 40-odd new report artifacts from repeated local runs.

The `README.md` diff is the other half of this concept: it registers the four new test folders (`08_WebSelect_Dropdowns/`, `09_Frame_IFrames/`, `10_Keyboard_Hover_DragDrop_Calender/`, `11_JS_Alerts/`), adds an entry for each new spec with its target URL and test titles, and adds the hover practice program. That is a documentation-as-inventory practice: the README doubles as an index of what the suite covers.

#### Playwright usage

- `viewport` in `use` is inherited by all projects, so one setting changes the whole suite's geometry.
- `headless: false` plus `page.pause()` is a debugging workflow, not a CI workflow. The two are complementary, and the new specs are consistently written for the first.
- The `reporter` array is order-sensitive and additive; commenting out an entry changes output format without touching test code.
- `trace: 'on-first-retry'` was already set and is left unchanged — it captures a trace only for tests that fail and get retried, which is the low-cost setting for a learning repo.

#### Selenium or alternative approach

Selenium Grid has no equivalent single config file; the equivalent decisions are spread across `DesiredCapabilities` / `Options` (headless flag, window size), the `RemoteWebDriver` construction, and the runner's own reporting configuration. There is no `switchTo().frame`-style equivalent of the reporter array either — Selenium relies on the test framework (TestNG, JUnit) and its listeners for reporting, and Allure attaches through that ecosystem rather than through the driver.

#### Comparison

| Setting | Playwright | Selenium equivalent |
| --- | --- | --- |
| Window size | `use.viewport` in config | `Options.addArguments("--window-size=...")` |
| Visible browser | `headless: false` | Non-headless `ChromeOptions` |
| Pause for inspection | `page.pause()` | Debugger breakpoint / Thread.sleep |
| Custom reporting | `reporter` array | TestNG/JUnit listener, or Allure agent |
| Failure artefacts | `trace: 'on-first-retry'` | Screenshot/`getPageSource()` in `@After` |

The single biggest practical difference: in Playwright, window size, browser mode, reporting, and retry artefacts are all declared in one file that a reviewer can read. In Selenium the same decisions are scattered, which is why Selenium suites tend to have inconsistent environments across machines.

#### Interview-ready answer

> "The change I'd highlight in the config is the fixed 1920x1080 viewport. Once you start testing hover menus and dropdowns, element geometry stops being a browser detail and starts being a test dependency — a submenu that renders off-screen at a smaller window fails in a way that looks like an app bug but isn't. Pinning the viewport in the shared `use` block makes the suite reproducible across machines without touching any test. I also notice the custom reporter is now commented out in favour of the built-in `line` reporter, which is a reasonable trade during development: fewer moving parts, and the risk of a custom reporter taking down a run disappears. The `headless: false` and the many `page.pause()` calls fit together as a debugging workflow, so when this goes to CI I'd flip headless on, remove the pauses, and rely on `trace: 'on-first-retry'` for failure diagnosis."

#### Related files

- `playwright.config.ts`
- `README.md`
- `tests/PracticePrograms/Hover&Click&Verify.spec.ts`
- `tests/10_Keyboard_Hover_DragDrop_Calender/260_KeyboardInputHandling.spec.ts`

---

## Cross-cutting observations

These patterns span several of the concepts above and are worth naming separately.

### `page.pause()` appears in 8 of the 14 new specs

It appears in 254, 257, 259, 261, 262, 263, 264, and the hover practice file. It is a legitimate exploration tool, but it requires headed mode to be useful and it makes the specs unsuitable for unattended CI. This is consistent with `headless: false` in the config, so the intent is clearly local learning rather than automation.

### Verification is present in only some specs

| Spec | Assertion present? |
| --- | --- |
| 254 Simple Dropdown | No |
| 255 Custom Dropdown | No |
| 256 Advanced Custom Dropdown | Yes — async case only |
| 257 / 258 / 259 Iframes | No (results logged) |
| 260 Keyboard Input | No (screenshots only) |
| 261 Drag and Drop 1 | No |
| 262 Drag and Drop 2 | Yes — two `toContainText` checks |
| 263 Advanced Drag and Drop | No (`toBeVisible` assertions are commented out) |
| 264 Context Menu | No (options logged) |
| 265 JS Alerts | Yes — strongest coverage in the set |
| Hover practice file | Yes — visibility + content |

The folder is therefore better read as a technique catalogue than a passing regression suite. The three specs that do assert — 256's async case, 262, and 265 — show the target shape.

### Two anti-patterns worth calling out by name

- **`waitForTimeout` in 259** — a fixed 5-second sleep before the pause. Every other wait in the new set uses a retrying assertion, which is the better approach; this one is the exception.
- **`{ force: true }` in 261** — bypasses actionability checks *and* comes with no assertion, so a drag that did nothing would still pass.

### The commented-out code is documentation

Several files retain failed attempts as comments — the `toContainText` string vs regex in 256, the repeated `dragTo` attempts in 263, the `dismiss()` alternatives in 265. For a learning repository this is a feature: the commented block in 263 in particular documents *why* the manual `boundingBox` + mouse approach was needed.

### Naming is not always accurate

Three names promise more than the code delivers: `261` is titled "Verify Hover for Drag and Drop" but performs no hover and no verification; `264` is named `ContextMenuDragDrop` but contains no drag; and `262` is titled "Hover and Click and Verify" but contains drag-and-drop steps. The genuine hover example is `tests/PracticePrograms/Hover&Click&Verify.spec.ts`.

### One likely defect

In `258_Iframe_TestCase.spec.ts`, `page.locator('//frames').all()` mixes XPath syntax with the CSS-engine locator API, so the frame-inventory loop most likely matches nothing. The `FrameLocator` calls in the same file use attribute selectors and are correct, so only the inventory line is affected.

---

## What the snapshots do not show

To keep the claims above honest, these points are **not** evidenced by the files:

- **Pass/fail results.** No run output is present, so it is not possible to say which of these tests currently succeed against the live sites. Several target third-party demo pages that can change or go offline.
- **Cross-browser coverage.** `playwright.config.ts` has a "Configure projects for major browsers" section, but the diff does not change it, so the new specs are not demonstrated across browsers.
- **CI execution.** No workflow files are among the changes, and the headed mode plus the `page.pause()` calls would need addressing before these run unattended.
- **Credentials or session data.** The new files are read carefully and contain no hard-coded secrets, tokens, or session state. The only personal data present is filler text typed into demo forms — vehicle registration fields, name inputs, and a prompt string — none of it a credential.
- **The `258` frame-count output.** Whether the inventory loop printed a meaningful count cannot be determined from the file alone.
- **Data-driven or BDD patterns.** The new specs are all hard-coded. No `test.step`, fixture, parameterised table, or external data file appears in this change set.
