# Concept Analysis

> A beginner-friendly analysis of the concepts represented by the current repository changes.

Generated: 2026-09-28.

## Analyzed files

- README.md — M
- tests/06_Multiple_Element_Filter/246_MultipleElement.spec.ts — ??
- tests/06_Multiple_Element_Filter/247_MultipleElement.spec.ts — ??
- tests/07_WebTables/247_WebTables.spec.ts — ??
- tests/07_WebTables/248_TestCase.spec.ts — ??
- tests/07_WebTables/249_TestCase.spec.ts — ??
- tests/07_WebTables/250_TestCase.spec.ts — ??

## Skipped files

- .commandcode/taste/communication/taste.md — excluded generated, private, or backup path
- .commandcode/taste/taste/taste.md — excluded generated, private, or backup path
- reports/runs/run-20260928_073232.json — excluded generated, private, or backup path
- reports/runs/run-20260928_073514.json — excluded generated, private, or backup path
- reports/runs/run-20260928_073909.json — excluded generated, private, or backup path
- reports/runs/run-20260928_074010.json — excluded generated, private, or backup path
- reports/runs/run-20260928_074150.json — excluded generated, private, or backup path
- reports/runs/run-20260928_075345.json — excluded generated, private, or backup path
- reports/runs/run-20260928_075624.json — excluded generated, private, or backup path
- reports/runs/run-20260928_075808.json — excluded generated, private, or backup path
- reports/runs/run-20260928_081226.json — excluded generated, private, or backup path
- reports/runs/run-20260928_081357.json — excluded generated, private, or backup path
- reports/runs/run-20260928_081501.json — excluded generated, private, or backup path
- reports/runs/run-20260928_082325.json — excluded generated, private, or backup path
- reports/runs/run-20260928_082538.json — excluded generated, private, or backup path
- reports/runs/run-20260928_105937.json — excluded generated, private, or backup path
- reports/runs/run-20260928_112237.json — excluded generated, private, or backup path
- reports/runs/run-20260928_112642.json — excluded generated, private, or backup path
- reports/runs/run-20260928_115446.json — excluded generated, private, or backup path
- reports/runs/run-20260928_120958.json — excluded generated, private, or backup path
- reports/runs/run-20260928_121206.json — excluded generated, private, or backup path
- reports/runs/run-20260928_121317.json — excluded generated, private, or backup path
- reports/runs/run-20260928_121411.json — excluded generated, private, or backup path
- tta-report/history.html — excluded generated, private, or backup path
- tta-report/index.html — excluded generated, private, or backup path
- tta-report/report_20260928_073232.html — excluded generated, private, or backup path
- tta-report/report_20260928_073514.html — excluded generated, private, or backup path
- tta-report/report_20260928_073909.html — excluded generated, private, or backup path
- tta-report/report_20260928_074010.html — excluded generated, private, or backup path
- tta-report/report_20260928_074150.html — excluded generated, private, or backup path
- tta-report/report_20260928_075345.html — excluded generated, private, or backup path
- tta-report/report_20260928_075624.html — excluded generated, private, or backup path
- tta-report/report_20260928_075808.html — excluded generated, private, or backup path
- tta-report/report_20260928_081226.html — excluded generated, private, or backup path
- tta-report/report_20260928_081357.html — excluded generated, private, or backup path
- tta-report/report_20260928_081501.html — excluded generated, private, or backup path
- tta-report/report_20260928_082325.html — excluded generated, private, or backup path
- tta-report/report_20260928_082538.html — excluded generated, private, or backup path
- tta-report/report_20260928_105937.html — excluded generated, private, or backup path
- tta-report/report_20260928_112237.html — excluded generated, private, or backup path
- tta-report/report_20260928_112642.html — excluded generated, private, or backup path
- tta-report/report_20260928_115446.html — excluded generated, private, or backup path
- tta-report/report_20260928_120958.html — excluded generated, private, or backup path
- tta-report/report_20260928_121206.html — excluded generated, private, or backup path
- tta-report/report_20260928_121317.html — excluded generated, private, or backup path
- tta-report/report_20260928_121411.html — excluded generated, private, or backup path

---

### Locator Bulk APIs — Getting All Matching Elements at Once

#### What it is (beginner version)

A page usually has *many* links in a list. Instead of clicking them one by one with separate locator calls, Playwright gives you "bulk" methods that return **all** matching elements in a single call. Two flavours appear in the new files:

- `allInnerTexts()` → returns a `string[]`, one string per matching element.
- `all()` → returns `Locator[]`, so you keep a handle to each element and can call methods like `getAttribute()` on it.

`all()` returns a **lazy promise** resolved once at call time, so `.length` is a real number you can loop over.

#### Why do testers care?

Reading a whole list in one round trip is dramatically faster than N separate round trips, and it produces a single snapshot of the data. Bulk APIs are the idiomatic way to scrape a repeating list, a results grid, or a nav menu.

#### Repository implementation

`tests/06_Multiple_Element_Filter/246_MultipleElement.spec.ts` does both in one test:

```ts
const InnerTexts: string[] = await page.locator('a.list-group-item').allInnerTexts();
console.log(InnerTexts.length);

const allLinks = await page.locator('a.list-group-item').all();
console.log(allLinks.length);
for (const link of allLinks) {
    console.log(await link.getAttribute('href'));
}
```

`tests/06_Multiple_Element_Filter/247_MultipleElement.spec.ts` is the cleaned-up version that keeps only the `all()` path, with an explicit `Locator[]` annotation:

```ts
import {test, expect, Locator} from '@playwright/test'

const allLinksText: Locator[] = await page.locator('a.list-group-item').all();
console.log(allLinksText.length);
for (const link of allLinksText) {
    console.log(await link.getAttribute('href'));
}
```

#### Playwright usage

- `locator.allInnerTexts()` — bulk text, resolved on the caller's side.
- `locator.all()` — bulk handles, each still a `Locator`, so all per-element methods remain available.
- Both are awaited; the result is a normal JS array, so `for...of`, `.length`, and `.map()` work.

Note that in these files the two APIs are used side by side, but the *files do not assert anything* about the values — output goes to `console.log`.

#### Selenium or alternative approach

Selenium's equivalent is `findElements(By.css(...))` which returns `List<WebElement>`. Text extraction is a separate loop calling `getText()` per element. Selenium has no `allInnerTexts()`; the closest is a stream/map over the list. So the mapping is:

| Playwright | Selenium |
| --- | --- |
| `locator.all()` | `driver.findElements(By...)` |
| `locator.allInnerTexts()` | list `.stream().map(WebElement::getText)` |

#### Comparison

| Aspect | Playwright bulk API | Selenium bulk API |
| --- | --- | --- |
| Return type | `Locator[]` or `string[]` | `List<WebElement>` |
| Staleness | Locators are lazy; re-resolve at use time | Elements are static handles, can go stale |
| Extra round trip | None for text | One per element |
| Language | TS/JS async | JVM list (still a blocking find) |

#### Interview-ready answer

> "Playwright offers bulk locator APIs. `locator.all()` returns an array of Locators so you keep a handle per element, while `locator.allInnerTexts()` returns a `string[]` directly. In Selenium the equivalent is `findElements()` returning `List<WebElement>`, and getting all text requires an extra per-element `getText()` loop. I prefer Playwright's version for fewer round trips and lazy re-resolution, but I always `await` the bulk call and iterate the resolved array."

#### Related files

- tests/06_Multiple_Element_Filter/246_MultipleElement.spec.ts
- tests/06_Multiple_Element_Filter/247_MultipleElement.spec.ts

---

### Strict Locator Resolution and Disambiguating with `.first()` / `.nth()`

#### What it is (beginner version)

Playwright locators are *strict*: if a selector matches more than one element, an action like `click()` fails because it refuses to guess. To disambiguate you chain `.first()`, `.nth(0)`, `.last()`, or `.filter(...)`. `nth()` is **0-based**.

#### Why do testers care?

Strict mode is a feature, not a bug: it catches ambiguous selectors that silently click the wrong element in other tools. Learning to disambiguate explicitly is the core skill of reliable Playwright locators.

#### Repository implementation

`tests/06_Multiple_Element_Filter/246_MultipleElement.spec.ts` locates by text and explicitly picks the first match, with the alternative commented:

```ts
page.getByText(linkText).first().click();
// page.getByText(linkText).nth(2).click();  // select the second element
```

The file's own comment notes `.first()` "is not mandatory but if getByText has multiple elements then I want to click on first element."

#### Playwright usage

- `getByText(...)` — text-based locator.
- `.first()` — first match in DOM order.
- `.nth(2)` — third match (0-based index).
- A strict-mode violation would surface as a "resolved to N elements" error if `.first()`/`.nth()` were omitted.

#### Selenium or alternative approach

Selenium's `findElements` returns all matches and you index the list yourself (`list.get(0)`), or use `findElement` which in older drivers returns the *first* match silently rather than erroring on ambiguity. So Selenium's default is permissive; Playwright's default is strict.

#### Comparison

| Aspect | Playwright | Selenium |
| --- | --- | --- |
| Ambiguous selector | Throws strict-mode error | `findElement` silently takes first |
| "Give me the Nth" | `.nth(N)` (0-based) | index the returned list (0-based) |
| "Give me the first" | `.first()` | `list.get(0)` |

#### Interview-ready answer

> "Playwright locators are strict — if a selector matches multiple elements, an action fails instead of picking one. I resolve that with `.first()`, `.nth(i)` (0-based), or `.filter()`. Selenium's `findElement` just returns the first match, so ambiguity goes unnoticed; Playwright turns that class of bug into a loud failure. The new spec shows the explicit `.first()` disambiguation and the commented `.nth(2)` alternative."

#### Related files

- tests/06_Multiple_Element_Filter/246_MultipleElement.spec.ts

---

### TypeScript Type Annotation vs. Inference on Locator Arrays

#### What it is (beginner version)

`const allLinks = await ...` and `const allLinks: Locator[] = await ...` produce the **same runtime value**. The second just *states* the type so the editor and compiler can check it; the first lets TypeScript *infer* it. The difference is compile-time only.

#### Why do testers care?

Explicit annotations on locator arrays catch refactors early and make intent obvious to reviewers, but they are stylistic. It is a good talking point that "explicit type ≠ different behaviour."

#### Repository implementation

`246_MultipleElement.spec.ts` documents the distinction in a trailing block comment and contrasts the two declarations; `247_MultipleElement.spec.ts` applies the annotated form in live code:

```ts
const allLinksText: Locator[] = await page.locator('a.list-group-item').all();
```

To make `Locator` available as a type, the spec imports it explicitly:

```ts
import {test, expect, Locator} from '@playwright/test'
```

#### Playwright usage

- `Locator` is exported as a **type** from `@playwright/test`.
- The value flowing in is the awaited array from `all()`; the annotation is a static promise to the compiler about that value.

#### Selenium or alternative approach

Selenium's Java API is fully typed, so the list type (`List<WebElement>`) is fixed by the return signature — there is no inference-vs-annotation choice to make at the call site. In Playwright, Playwright also infers the concrete array type, so the annotation is optional documentation.

#### Comparison

| Aspect | Annotated | Inferred |
| --- | --- | --- |
| Runtime value | Identical | Identical |
| Compile-time check | Yes (explicit) | Yes (inferred) |
| Refactor safety | Signals intent to reviewer | Silent but still checked |

#### Interview-ready answer

> "These two lines are runtime-equivalent. `const allLinks: Locator[] = await ...` just adds a compile-time annotation; without it TypeScript infers the same array type from `all()`. The annotation is documentation and refactor safety, not different behaviour. To use the type you import `Locator` from `@playwright/test`."

#### Related files

- tests/06_Multiple_Element_Filter/246_MultipleElement.spec.ts
- tests/06_Multiple_Element_Filter/247_MultipleElement.spec.ts

---

### Web Table Traversal — Counting Rows/Columns Then Iterating

#### What it is (beginner version)

To read a whole HTML table you first count the rows and columns, then loop over the indexes and pull each cell's text. The key idea: **count first, then loop**, rather than hard-coding a fixed number of rows.

#### Why do testers care?

Tables are everywhere in admin panels and reports. Learning "count → loop → nth → cell text" is a reusable pattern for verifying grid data.

#### Repository implementation

`tests/07_WebTables/248_TestCase.spec.ts` counts rows, then loops 0-based reading each row's cell texts:

```ts
const rows = page.locator('table[summary="Sample Table"] tbody tr');
const rowCount = await rows.count();
console.log(rowCount);
for (let i = 0; i <= rowCount - 1; i++) {
    const rowsData = await rows.nth(i).locator('td').allInnerTexts();
    console.log(`Row ${i + 1}:`, rowsData);
}
```

It uses a **CSS attribute selector** `table[summary="Sample Table"]`, and a file comment contrasts the XPath (`table[@summary=...]`) with the CSS form (no `//`, no `@`).

#### Playwright usage

- `locator.count()` — how many rows match.
- `locator.nth(i)` — pick the i-th row (0-based).
- `.locator('td')` — scope to cells *within* that row.
- `.allInnerTexts()` — bulk-read the cell texts of that one row.

Note the loop re-scopes `td` under each `nth(i)` row, so each iteration reads exactly one row's cells.

#### Selenium or alternative approach

In Selenium you'd do `driver.findElements(By.xpath("//table[@summary='Sample Table']/tbody/tr"))`, get `.size()`, then for each index `row.findElements(By.tagName("td"))` and `.getText()` per cell. The structure is identical — count, index, re-scope, read — only the API names and the await style differ.

#### Comparison

| Step | Playwright (TS) | Selenium (Java) |
| --- | --- | --- |
| Find rows | `page.locator(...)` | `driver.findElements(...)` |
| Count | `.count()` | `.size()` |
| Pick nth | `.nth(i)` | `list.get(i)` |
| Cells in that row | `.locator('td')` under `nth(i)` | `row.findElements(By.tagName("td"))` |
| Cell text (bulk) | `.allInnerTexts()` | loop `cell.getText()` |

#### Interview-ready answer

> "For web tables I count first with `count()`, then loop the indexes and read each row with `nth(i).locator('td').allInnerTexts()`. The key re-usable idea is scoping cells under a specific row via `nth(i)` so each iteration returns that row's cells. Selenium follows the same count-index-read pattern with `findElements`/`size()`/list indexing. One gotcha: this is a `console.log` demo, not an assertion — production would wrap the data in an `expect` check."

#### Related files

- tests/07_WebTables/248_TestCase.spec.ts

---

### Dynamic XPath Construction and the 1-based vs 0-based Index Mismatch

#### What it is (beginner version)

To grab a specific cell you build an XPath like `//table[@id="customers"]/tbody/tr[5]/td[2]`. Because row/column counts vary, you construct the XPath **as a string** with the loop variables inside. The catch: **XPath indexes start at 1**, but Playwright's `nth()` starts at 0 — so the loops do not line up.

#### Why do testers care?

Off-by-one errors are the classic web-table bug. Recognising the 1-based (XPath) vs 0-based (Playwright `nth`) split is exactly what distinguishes a passing scrape from a silently wrong one.

#### Repository implementation

`tests/07_WebTables/249_TestCase.spec.ts` assembles a dynamic XPath from three constant parts and the loop counters:

```ts
const firstPart = '//table[@id="customers"]/tbody/tr[';
const secondPart = ']/td[';
const thirdPart = ']';

const rows = await page.locator('//table[@id="customers"]/tbody/tr').count();
const cols = await page.locator('//table[@id="customers"]/tbody/tr[2]/td').count();

for (let i = 2; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
        const dynamicXpath = `${firstPart}${i}${secondPart}${j}${thirdPart}`;
        const data = await page.locator(dynamicXpath).innerText();
        // ...
    }
}
```

The loops start at `i = 2` and `j = 1` (1-based, matching XPath) rather than at 0, which is the author explicitly reconciling the two index bases. The file's sibling doc-comment in `247_WebTables.spec.ts` states the rule directly: *"XPath Table Indexes starts with 1 and Playwright nth index start with 0."*

#### Playwright usage

- `page.locator(dynamicXpath)` — Playwright accepts an XPath string when it starts with `//` or `..`.
- `innerText()` — read one cell.
- Building the selector as a template literal lets the row/col counters vary without a fixed selector.

#### Selenium or alternative approach

Selenium takes XPath the same way (`By.xpath("...")`), so the dynamic-string technique transfers directly. The index bases are the same 1-based XPath convention; Playwright's `nth()` is the only 0-based part, and Selenium has no `nth` — you index a 0-based list instead.

#### Comparison

| Aspect | Playwright | Selenium |
| --- | --- | --- |
| XPath selector | `page.locator("//tr[5]/td[2]")` | `By.xpath("//tr[5]/td[2]")` |
| Element index | `.nth(n)` — 0-based | list `[n]` — 0-based |
| XPath index | 1-based | 1-based |
| Mixing bases | Must offset (the 1-vs-0 issue) | Same risk when pairing XPath with list indexing |

#### Interview-ready answer

> "I build dynamic XPath by concatenating a prefix, the loop indices, and a suffix, then pass the result to the locator. The subtle bug here is index base: XPath `tr[5]` is 1-based, but Playwright `nth()` is 0-based. The spec handles this by starting the row loop at 2 and the column loop at 1, matching XPath's 1-based convention. When mixing XPath with `nth()` you must offset, or you read the wrong cell."

#### Related files

- tests/07_WebTables/249_TestCase.spec.ts
- tests/07_WebTables/247_WebTables.spec.ts

---

### XPath Axes — Reading a Related Cell in the Same Row

#### What it is (beginner version)

An **axis** is a way to move relative to the node you are on. `following-sibling::td` means "the `<td>` cells that come after this one in the same row." So if you land on a person's name cell, the axis grabs the country cell next to it — without hard-coding a column number.

#### Why do testers care?

Axes make selectors resilient to layout change. If a table gains or loses a column, a fixed `td[5]` breaks, but "the cell after the name in the same row" still works.

#### Repository implementation

`tests/07_WebTables/249_TestCase.spec.ts` uses the axis to pull the country that belongs to a matched name:

```ts
if (data.includes('Helen Bennett')) {
    const countryPath = `${dynamicXpath}/following-sibling::td`;
    const countryText = await page.locator(countryPath).innerText();
    console.log(`Helen Bennett is In ${countryText}`);
}
```

The `//tr[i]/td[j]/following-sibling::td` path finds the cells after the matched one in the same row.

#### Playwright usage

- The axis syntax (`following-sibling::td`) is appended to the dynamic XPath and handed to `page.locator()`.
- The match is content-based (`data.includes('Helen Bennett')`), so it finds the row by its data, then navigates relative to it.

#### Selenium or alternative approach

XPath axes work identically in Selenium (`By.xpath(.../following-sibling::td)`), since the axis is part of the XPath language, not of the browser automation tool. So this is one area where Selenium and Playwright are functionally the same.

#### Comparison

| Aspect | XPath axis | Fixed index (`td[5]`) |
| --- | --- | --- |
| Survives column reordering | Yes (relative) | No (breaks) |
| Readability | Descriptive ("sibling of name") | Positional ("column 5") |
| Tool support | Same in Playwright & Selenium | Same in both |

#### Interview-ready answer

> "An XPath axis navigates relative to a node. In the web-table spec I find a cell whose text matches the target person, then append `/following-sibling::td` to read the country cell in the same row. This is layout-resilient — unlike a fixed `td[5]`, it survives column changes. Axes are part of XPath itself, so Selenium's `By.xpath` supports them identically."

#### Related files

- tests/07_WebTables/249_TestCase.spec.ts

---

### Using `page.pause()` as a Learning / Debugging Aid

#### What it is (beginner version)

`await page.pause()` freezes the test and opens the Playwright Inspector, so you can look at the live page, run locators one at a time, and step forward. It's meant for interactive learning and debugging, not for CI.

#### Why do testers care?

Pausing lets you *see* what a locator actually resolves to before you commit to an assertion — invaluable when learning table traversal or strict-mode issues.

#### Repository implementation

`page.pause()` appears at the end of several new specs:
- `tests/06_Multiple_Element_Filter/246_MultipleElement.spec.ts`
- `tests/06_Multiple_Element_Filter/247_MultipleElement.spec.ts`
- `tests/07_WebTables/247_WebTables.spec.ts` (a scaffold whose only body is `goto` + `pause`)
- `tests/07_WebTables/249_TestCase.spec.ts`

`247_WebTables.spec.ts` is essentially a placeholder — it navigates and pauses, with a `// Code` marker, and a doc-comment listing the techniques to implement (count rows/cols, dynamic XPath, axes, `nth` vs `allInnerTexts`, 1-vs-0 index). It acts as the lesson plan that `248` and `249` then implement.

#### Playwright usage

- `await page.pause()` — suspend execution and open the inspector.
- Intended for local/interactive runs; the config and README show headed and `--ui` workflows for this kind of exploration.

#### Selenium or alternative approach

Selenium has no single built-in "pause" primitive. You approximate it with a long `Thread.sleep()` (bad — it wastes time) or by stepping through in an IDE debugger with the browser visible. Playwright's `pause()` is a first-class, intended debugging feature.

#### Comparison

| Aspect | Playwright `page.pause()` | Selenium equivalent |
| --- | --- | --- |
| Intent | Built-in inspect & step | Manual sleep or IDE debugger |
| Shows resolved locators | Yes (inspector) | No (only screenshots) |
| CI-safe | No (blocks) | `Thread.sleep` also blocks |

#### Interview-ready answer

> "`await page.pause()` suspends the test and opens the Playwright Inspector so I can see what a locator resolves to and step through interactively. In the new specs it's a learning aid — `247_WebTables.spec.ts` is basically a scaffold that navigates and pauses, acting as the lesson plan the next two files implement. Selenium has no first-class pause; you'd use a long `Thread.sleep()` or an IDE debugger, both of which are worse for this."

#### Related files

- tests/06_Multiple_Element_Filter/246_MultipleElement.spec.ts
- tests/06_Multiple_Element_Filter/247_MultipleElement.spec.ts
- tests/07_WebTables/247_WebTables.spec.ts
- tests/07_WebTables/249_TestCase.spec.ts

---

### Learning-Scaffold Specs and the Iteration-Plan Comment

#### What it is (beginner version)

Some spec files are deliberately incomplete — a "scaffold." They contain the setup (navigate to the page) plus a written plan of the techniques to practise, without a finished implementation. They exist to be filled in as the concept is learned.

#### Why do testers care?

It shows a deliberate learning workflow: outline the approach, implement incrementally across numbered files, and keep the reasoning in comments. Useful for a study repository.

#### Repository implementation

- `tests/07_WebTables/247_WebTables.spec.ts` — navigates, has a `// Code` marker and a long doc-comment enumerating the plan (count rows/cols, dynamic XPath, axes, prefer `locator('table,tbody,tr',{hasText})`, use `nth`/`allInnerTexts`, remember 1-vs-0 indexing). No table logic implemented.
- `tests/07_WebTables/250_TestCase.spec.ts` — an **empty file** (no imports, no tests). The auto-generated README even renders it as `_No top-level test(...) blocks found in this file._`

The numbered files (`247` → `248` → `249` → `250`) and the two new folders (`06_Multiple_Element_Filter`, `07_WebTables`) show the numbered, incremental style carried over from earlier suites.

#### Playwright usage

- A scaffold still uses the standard `import { test, expect } from '@playwright/test'` and a `test(...)` wrapper.
- Because these files print rather than assert, they demonstrate navigation and reading without introducing failure conditions.

#### Selenium or alternative approach

The concept is tool-agnostic — a scaffold or "spike" test is a common practice in Selenium projects too. The Playwright-specific part is just the `test()` wrapper and `page` fixture.

#### Comparison

| Aspect | Playwright scaffolds here | Typical alternative |
| --- | --- | --- |
| Structure | `test()` + `goto` + comment plan | Same in Selenium |
| Value | Forces the plan before the code | Same |
| Asserts? | No | No (it's a spike) |

#### Interview-ready answer

> "Some of these specs are deliberate scaffolds: `247_WebTables.spec.ts` navigates and pauses with a written plan in comments but no implemented logic, and `250_TestCase.spec.ts` is an empty placeholder. That's a learning workflow — outline the techniques (count, dynamic XPath, axes, index base), then implement across numbered files. In the new folders the numbered files show that incremental style."

#### Related files

- tests/07_WebTables/247_WebTables.spec.ts
- tests/07_WebTables/250_TestCase.spec.ts
- tests/07_WebTables/248_TestCase.spec.ts
- tests/07_WebTables/249_TestCase.spec.ts

---

### Auto-Generated README Synchronisation from the Working Tree

#### What it is (beginner version)

The README is not written by hand — a script regenerates it by walking the repository, reading the config and package files, and scanning every `*.spec.ts` for its test titles, target URLs, and hard-coded secrets.

#### Why do testers care?

It shows a documentation-as-code practice: the README always reflects the current tree, and the generator can even flag credentials that were hard-coded in a `fill()` call — a lightweight secret-leak guard.

#### Repository implementation

The `README.md` diff is almost entirely generated churn: new `allure-results/` entries, a new `tta-report/report_2026…html` per run, the new `06_…` and `07_…` folders appearing in the tree, and per-spec sections. It ends with a generated notice to not edit it by hand. The generator is `scripts/readme-sync.js`, run via `npm run readme:sync` (per `package.json`).

The `README.md` section for `250_TestCase.spec.ts` renders as:

> `_No top-level test(...) blocks found in this file._`

which is exactly the empty-file case, confirming the README reflects real scan output. The generator reads `playwright.config.ts` for the config table, `package.json` for scripts/dependencies, and every `tests/**/*.spec.ts` for test titles and `page.goto` URLs.

#### Playwright usage

- The script is plain Node (`fs`/`path`) and does not depend on Playwright at runtime; it regex-parses the spec files for `test(...)` titles and `page.goto(...)` URLs.
- Spec files must be named `*.spec.[jt]s` under `tests/` to be picked up.

#### Selenium or alternative approach

There is no Selenium analogue — this is repository tooling, independent of the automation framework. The same generator would document a Selenium (Java/Python) project just as easily, since it only scans file text.

#### Comparison

| Aspect | Generated README (here) | Hand-written README |
| --- | --- | --- |
| Freshness | Always matches tree | Drifts over time |
| Test inventory | Auto-listed titles + URLs | Manually curated |
| Secret check | Flags hard-coded `fill()` values | Manual review |
| Edit policy | Edit the script, not the README | Edit directly |

#### Interview-ready answer

> "The README is generated by `scripts/readme-sync.js` (`npm run readme:sync`), not written by hand. It walks the tree, reads `playwright.config.ts` and `package.json`, and regex-scans every `tests/**/*.spec.ts` to list test titles and `page.goto` target URLs. The huge diff in this change is just generated churn from the new run artifacts and the two new folders. A nice touch: the generator flags any hard-coded `fill()` credential as a secret warning."

#### Related files

- README.md
- scripts/readme-sync.js
- package.json

---

## Summary of new concepts

The changes introduce two new test folders — `06_Multiple_Element_Filter` and `07_WebTables` — plus a regenerated README. The new testing concepts are:

1. **Locator bulk APIs** — `all()` and `allInnerTexts()` to read many elements at once (`246`, `247`).
2. **Strict locators + `.first()` / `.nth()`** — explicit disambiguation of multi-match selectors (`246`).
3. **TypeScript annotation vs inference** on `Locator[]` (`246` comment, `247` code).
4. **Web-table traversal** — count rows/columns then loop with `nth` and `allInnerTexts` (`248`).
5. **Dynamic XPath + 1-based vs 0-based index mismatch** (`249`, explained in `247` comment).
6. **XPath axes** — `following-sibling::td` to read related cells in the same row (`249`).
7. **`page.pause()`** as a learning/debugging aid (`246`, `247`, `247_WebTables`, `249`).
8. **Learning-scaffold specs** — incomplete/empty placeholder files as an implementation plan (`247_WebTables`, `250`).
9. **Auto-generated README synchronisation** — a docs-as-code generator reflecting the working tree (`README.md`, `scripts/readme-sync.js`).

All new specs print via `console.log` rather than asserting — they are exploration/learning demos, not pass/fail checks.
