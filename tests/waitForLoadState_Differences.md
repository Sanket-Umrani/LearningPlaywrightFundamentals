# waitForLoadState Differences

Playwright's `page.waitForLoadState()` method waits for a specific load state to be reached. There are three primary states.

## 1. `domcontentloaded`

- **Triggered when**: The `DOMContentLoaded` event fires on the page.
- **What it means**: The HTML document has been completely parsed and the DOM tree is built. No stylesheets, images, or subframes are guaranteed to be loaded yet.
- **When to use**: When your test only interacts with static DOM elements that exist immediately after parsing. This is the fastest option.
- **Caveat**: JavaScript-heavy apps or elements injected after asset load may not be ready yet.

```typescript
await page.waitForLoadState('domcontentloaded');
```

## 2. `load`

- **Triggered when**: The `load` event fires on the page.
- **What it means**: The `DOMContentLoaded` event has fired **plus** all dependent resources (stylesheets, scripts, images, subframes) have finished loading.
- **When to use**: When your test relies on resources (CSS, images, scripts) being fully downloaded. A good default for pages that mostly use static assets.
- **Caveat**: Does not wait for network activity that happens **after** the initial load (e.g., XHR/fetch requests triggered by page scripts).

```typescript
await page.waitForLoadState('load');
```

## 3. `networkidle`

- **Triggered when**: There are **no more than 0 network connections** for at least **500ms**.
- **What it means**: The page has settled — no network activity (XHR, fetch, WebSocket, etc.) is occurring. Playwright tracks all network activity, not just initial resource loading.
- **When to use**: When your page uses lots of asynchronous requests (AJAX, fetch API, GraphQL) and you need to wait until all data is fetched before interacting.
- **Caveat**: Can slow down tests significantly if the app has long-polling or periodic polling requests, since Playwright will keep waiting.

```typescript
await page.waitForLoadState('networkidle');
```

## Comparison Table

| Load State         | Fires When                                        | Waits for Resources | Waits for Async Requests | Speed     |
|--------------------|---------------------------------------------------|---------------------|--------------------------|-----------|
| `domcontentloaded` | DOM tree is fully parsed                          | No                  | No                       | Fastest   |
| `load`             | DOM + all dependent resources loaded              | Yes                 | No                       | Medium    |
| `networkidle`      | No network connections for 500ms                  | Yes                 | Yes                      | Slowest   |

## Usage Example

In the context of this project's SVG test (`tests/12_Handle_SVG/266_SVG_TestCase.spec.ts`), `networkidle` is used after clicking the search SVG because Flipkart results are loaded asynchronously via XHR/fetch requests. Using only `load` could fail because the search results would still be fetching.

```typescript
await page.locator('svg').first().click();
await page.waitForLoadState('networkidle');
// At this point, all search-result XHR/fetch calls have completed.
```

## Defaults

If you call `page.goto(url)` or `page.waitForLoadState()` without specifying a state, Playwright **defaults to `'load'`**.
