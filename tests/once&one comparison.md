# `.once()` vs `.one()` — Playwright Dialog Handling

## Short answer

There is **no `.one()` method in Playwright**. The real sibling of `.once()` is `.on()`.

Playwright's `Page` (and `BrowserContext`) extend Node.js' `EventEmitter`. The event-handling API is:

| Method | Behaviour | Real Playwright method? |
|---|---|---|
| `.on('dialog', handler)` | **Persistent** — fires on *every* dialog event until explicitly removed. | Yes |
| `.once('dialog', handler)` | **One-shot** — fires on the *first* dialog event, then **auto-removes** itself. | Yes |
| `.one('dialog', handler)` | Does not exist in Playwright. | No |

---

## `.once('dialog', ...)` — the real method

- Registers a handler that runs **exactly once**.
- After the handler executes, Playwright removes the listener automatically — no `.off()` needed.
- This is the correct choice when a test expects **exactly one** dialog and you want to avoid the handler leaking into later dialog events.

```ts
page.once('dialog', async dialog => {
  expect(dialog.message()).toBe('I am a JS Alert');
  await dialog.accept();
});
await page.getByRole('button', { name: 'Click for JS Alert' }).click();
```

## `.on('dialog', ...)` — the persistent counterpart

- Registers a handler that runs on **every** dialog event for as long as the listener is registered (or until the page/context is closed, or until you call `.off()`).
- Useful when a test expects **multiple** dialogs.
- Dangerous if not removed: the handler can fire on unexpected later dialogs and mask bugs, or throw if the assertions don't match a different dialog kind.

```ts
page.on('dialog', async dialog => {
  await dialog.accept();
});
// ... any number of dialogs will be auto-accepted ...
page.off('dialog', handler); // must remove manually when done
```

---

## Why `.one()` is a misunderstanding

| Possible source of confusion | Reality |
|---|---|
| "I heard `.one()` is the short form of `.once()`" | Node's EventEmitter spells it `.once()`, never `.one()`. There is no shorthand. |
| Mocha's `.only()` — "run only this test" | Completely unrelated. `.only()` selects tests; it is not an event listener. |
| jQuery's `.one()` (one-time event handler) | jQuery has it, Playwright does not. Don't borrow the name. |
| Some custom wrapper or other browser library | If you see `.one()` it is from a different library, not Playwright. |

---

## When to use which (in this repo's alert tests)

The spec `tests/11_JS_Alerts/265_JS_AlertHandling.spec.ts` uses `page.once('dialog', ...)` in all three tests — one alert, one confirm, one prompt. This is correct: each test expects **exactly one** dialog, so a one-shot handler is the right tool.

- Each dialog type (alert / confirm / prompt) is expected only once per test.
- `page.once` guarantees the handler won't accidentally fire on a *second* dialog in the same test.
- No cleanup is required because `.once` removes itself after the first invocation.

If a test scenario expected multiple dialogs, you would use `page.on('dialog', ...)` and then `page.off('dialog', handler)` (or `page.removeAllListeners('dialog')`) when done. But `.one()` is not an option you can reach for.
