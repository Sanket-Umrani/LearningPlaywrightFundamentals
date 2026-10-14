# Concept Analysis

> A beginner-friendly analysis of the concepts represented by the current repository changes.

Generated: 2026-10-14.

## Analyzed files

- package-lock.json — M
- package.json — M
- README.md — M
- tests/19_Data_Driven_Testing/290_DataDrivenTest.spec.ts — ??
- tests/19_Data_Driven_Testing/291_Users.json — ??
- tests/19_Data_Driven_Testing/292_TestData.json — ??
- tests/19_Data_Driven_Testing/293_LoginDDT.spec.ts — ??
- tests/19_Data_Driven_Testing/294_ReadWriteFS.ts — ??
- tests/19_Data_Driven_Testing/295_DDT_JSONARRAY.spec.ts — ??
- tests/19_Data_Driven_Testing/296_DDT_CSV.spec.ts — ??
- tests/19_Data_Driven_Testing/297_DDT_JSON.spec.ts — ??
- tests/19_Data_Driven_Testing/298_DDT_EXCEL.spec.ts — ??
- tests/19_Data_Driven_Testing/299_DDT_YAML.spec.ts — ??
- tests/19_Data_Driven_Testing/300_DDT_MYSQL.spec.ts — ??
- tests/19_Data_Driven_Testing/301_DDT_FAKER_JS.spec.ts — ??
- tests/19_Data_Driven_Testing/test-data/login-data.csv — ??
- tests/19_Data_Driven_Testing/test-data/login-data.yaml — ??
- tests/19_Data_Driven_Testing/test-data/login.json — ??
- tests/19_Data_Driven_Testing/test-data/registration-data.json — ??
- tests/19_Data_Driven_Testing/test-data/seed.sql — ??
- tests/19_Data_Driven_Testing/util/csvReader.ts — ??
- tests/19_Data_Driven_Testing/util/dbReader.ts — ??
- tests/19_Data_Driven_Testing/util/excelReader.ts — ??
- tests/19_Data_Driven_Testing/util/generateExcel.js — ??
- tests/19_Data_Driven_Testing/util/yamlReader.ts — ??
- tsconfig.json — M

---

### Data-Driven Testing (DDT) with Playwright

#### What it is (beginner version)
Data-Driven Testing separates test logic from test data. Instead of hardcoding values in test scripts, you store test inputs and expected outcomes in external files (JSON, CSV, Excel, YAML, databases) or generate them programmatically. The same test code runs multiple times with different data sets.

#### Why do testers care?
- **Maintainability**: Update test data without touching test code
- **Coverage**: Run the same scenario with many data combinations (valid, invalid, edge cases)
- **Reusability**: Share test data across test suites
- **Collaboration**: Non-technical stakeholders can edit CSV/Excel files
- **Scalability**: Add new test cases by adding rows, not writing new tests

#### Repository implementation
The repository adds a complete `tests/19_Data_Driven_Testing/` module demonstrating 7 data source patterns:

| File | Data Source | Pattern |
|------|-------------|---------|
| `290_DataDrivenTest.spec.ts` | JSON import | Direct ES module import of `.json` |
| `293_LoginDDT.spec.ts` | JSON file | Import structured object with `validUser`/`invalidUser` |
| `295_DDT_JSONARRAY.spec.ts` | Inline array | Hardcoded array of test case objects |
| `296_DDT_CSV.spec.ts` | CSV file | Synchronous `csvReader.ts` utility |
| `297_DDT_JSON.spec.ts` | JSON array file | Import array of registration objects |
| `298_DDT_EXCEL.spec.ts` | Excel (.xlsx) | Async `excelReader.ts` using `exceljs` |
| `299_DDT_YAML.spec.ts` | YAML file | Sync `yamlReader.ts` using `js-yaml` |
| `300_DDT_MYSQL.spec.ts` | MySQL database | Async `dbReader.ts` using `mysql2/promise` |
| `301_DDT_FAKER_JS.spec.ts` | Faker.js | Programmatic synthetic data generation |

**Key implementation patterns:**

1. **Synchronous sources (JSON, CSV, YAML)** — Data available at test collection time; each row becomes a separate `test()`:
```typescript
// 299_DDT_YAML.spec.ts
const loginData = readYAML<LoginRow>(YAML_PATH);  // sync
for (const data of loginData) {
    test(`Login with : ${data.description}`, async ({ page }) => { ... });
}
```

2. **Asynchronous sources (Excel, MySQL)** — Data loaded in `beforeAll`, replayed as `test.step()` inside a single test:
```typescript
// 298_DDT_EXCEL.spec.ts
test.beforeAll(async () => {
    rows = await readLoginDataFromExcel(XLSX_PATH);
});
test('login with every row from the spreadsheet', async ({ page }) => {
    for (const data of rows) {
        await test.step(`Login with : ${data.description}`, async () => { ... });
    }
});
```

3. **Shared type definition** (`util/yamlReader.ts`):
```typescript
export interface LoginRow {
    description: string;
    username: string;
    password: string;
    shouldPass: boolean;
    expectedError: string;
}
```

4. **CSV reader** (`util/csvReader.ts`) — Simple header-based parsing:
```typescript
export function readCSV(filePath: string): TestDataRow[] {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.trim().split("\n");
    const headers = lines[0].split(",");
    // ... map each line to object
}
```

5. **Excel reader** (`util/excelReader.ts`) — Uses `exceljs` for `.xlsx`:
```typescript
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(path.resolve(filePath));
const sheet = workbook.getWorksheet(sheetName) || workbook.worksheets[0];
```

6. **MySQL reader** (`util/dbReader.ts`) — Parameterized query with env config:
```typescript
export async function readLoginDataFromDB(): Promise<LoginRow[]> {
    const rows = await query<LoginDataRecord>(
        'SELECT ... FROM login_data WHERE is_active = ? ORDER BY id', [1]
    );
    return rows.map(r => ({ ... }));
}
```

7. **Faker.js** (`301_DDT_FAKER_JS.spec.ts`) — Seeded synthetic data:
```typescript
faker.seed(123);
const users = faker.helpers.multiple(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
}), { count: 5 });
```

#### Playwright usage
- **`test.describe`** — Groups related data-driven tests
- **`test.beforeEach` / `test.afterEach`** — Per-test navigation and logging
- **`test.beforeAll`** — One-time async data loading (Excel, MySQL)
- **`test.step()`** — Reports each data iteration separately in HTML report
- **`page.getByRole()` / `page.getByTestId()` / `page.locator()`** — Resilient selectors with fallbacks via `.or()`
- **`expect(page).toHaveURL()`** — URL-based outcome verification

#### Selenium or alternative approach
| Aspect | Playwright (this repo) | Selenium (traditional) |
|--------|------------------------|------------------------|
| Data loading | Sync imports + async hooks | TestNG `@DataProvider`, JUnit `@ParameterizedTest` |
| Parallel execution | Built-in (each `test()` runs in parallel) | Requires TestNG `parallel="methods"` or JUnit `ExecutionMode.CONCURRENT` |
| Reporting | Each `test()` / `test.step()` appears separately | Requires Allure/ExtentReports integration |
| Selectors | `getByRole`, `getByTestId`, auto-waiting | `findElement(By.xpath)`, explicit waits |
| Excel reading | `exceljs` (async) | Apache POI (sync, verbose) |
| CSV reading | Custom `csvReader.ts` (50 lines) | OpenCSV / Jackson |
| YAML reading | `js-yaml` (sync) | SnakeYAML |
| Database | `mysql2/promise` (async/await) | JDBC (blocking, verbose) |
| Fake data | `@faker-js/faker` (tree-shakable) | Java Faker / DataFaker |

#### Comparison
| Data Source | Sync/Async | Test Collection | Best For |
|-------------|------------|-----------------|----------|
| JSON (import) | Sync | ✅ Separate tests | Small, static datasets |
| JSON (array file) | Sync | ✅ Separate tests | Structured test cases |
| CSV | Sync | ✅ Separate tests | Spreadsheet export, stakeholder editing |
| YAML | Sync | ✅ Separate tests | Human-readable, comments, types |
| Excel | Async | ❌ Single test + steps | Complex formatting, existing .xlsx assets |
| MySQL | Async | ❌ Single test + steps | Large datasets, shared test DB |
| Faker.js | Sync (generation) | ✅ Separate tests | Synthetic data, no file maintenance |

**Trade-off**: Sync sources (JSON, CSV, YAML) give better reporting (one test per row, independent retries). Async sources (Excel, MySQL) require `test.step()` workaround but handle larger/complex data.

#### Interview-ready answer
> "Data-Driven Testing in Playwright separates test logic from test data. I've implemented it with 7 data sources: JSON (direct import and file), CSV, YAML, Excel, MySQL, and Faker.js. 
>
> For synchronous sources like JSON, CSV, and YAML, I read data at module load time so each row becomes its own `test()` — this gives separate reporting, retries, and parallel execution. For asynchronous sources like Excel (`exceljs`) and MySQL (`mysql2/promise`), I load data in `test.beforeAll()` and replay rows as `test.step()` inside one test, since Playwright collects tests synchronously.
>
> I use a shared `LoginRow` interface across all readers for consistency. Selectors use `getByRole` with `.or()` fallbacks for resilience. Faker.js with a fixed seed generates reproducible synthetic data for exploratory testing."

#### Related files
- `package.json` — Added dependencies: `@faker-js/faker`, `@types/js-yaml`, `exceljs`, `js-yaml`
- `tsconfig.json` — Added `"allowSyntheticDefaultImports": true` for JSON imports
- `tests/19_Data_Driven_Testing/290_DataDrivenTest.spec.ts` — Basic JSON import demo
- `tests/19_Data_Driven_Testing/291_Users.json` — Simple credentials JSON
- `tests/19_Data_Driven_Testing/292_TestData.json` — Complex nested JSON structure
- `tests/19_Data_Driven_Testing/293_LoginDDT.spec.ts` — JSON object with valid/invalid users
- `tests/19_Data_Driven_Testing/294_ReadWriteFS.ts` — Node.js `fs` read/write JSON example
- `tests/19_Data_Driven_Testing/295_DDT_JSONARRAY.spec.ts` — Inline array of test cases
- `tests/19_Data_Driven_Testing/296_DDT_CSV.spec.ts` — CSV-driven tests with custom reader
- `tests/19_Data_Driven_Testing/297_DDT_JSON.spec.ts` — JSON array file import
- `tests/19_Data_Driven_Testing/298_DDT_EXCEL.spec.ts` — Excel-driven tests (async, steps)
- `tests/19_Data_Driven_Testing/299_DDT_YAML.spec.ts` — YAML-driven tests (sync, separate tests)
- `tests/19_Data_Driven_Testing/300_DDT_MYSQL.spec.ts` — MySQL-driven tests (async, steps)
- `tests/19_Data_Driven_Testing/301_DDT_FAKER_JS.spec.ts` — Faker.js synthetic data
- `tests/19_Data_Driven_Testing/test-data/login-data.csv` — 7-row CSV dataset
- `tests/19_Data_Driven_Testing/test-data/login-data.yaml` — 7-row YAML dataset (with comments)
- `tests/19_Data_Driven_Testing/test-data/login.json` — Valid/invalid user object
- `tests/19_Data_Driven_Testing/test-data/registration-data.json` — 5 registration test cases
- `tests/19_Data_Driven_Testing/test-data/seed.sql` — MySQL schema + 8-row seed (1 inactive)
- `tests/19_Data_Driven_Testing/util/csvReader.ts` — Synchronous CSV parser
- `tests/19_Data_Driven_Testing/util/dbReader.ts` — MySQL reader with env config
- `tests/19_Data_Driven_Testing/util/excelReader.ts` — ExcelJS async reader
- `tests/19_Data_Driven_Testing/util/generateExcel.js` — Spreadsheet generator script
- `tests/19_Data_Driven_Testing/util/yamlReader.ts` — Sync YAML reader + `LoginRow` type
- `README.md` — Updated with module 19 documentation and new dependencies
