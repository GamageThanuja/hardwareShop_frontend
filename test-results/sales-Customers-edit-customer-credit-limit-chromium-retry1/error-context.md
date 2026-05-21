# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sales.spec.ts >> Customers >> edit customer credit limit
- Location: tests/e2e/sales.spec.ts:83:2

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: click: Test timeout of 45000ms exceeded.
Call log:
  - waiting for locator('tbody tr').filter({ hasText: 'Roshan' }).first().locator('button').filter({ hasText: /edit/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e5]:
      - list [ref=e7]:
        - listitem [ref=e8]:
          - link "BoltForge Hardware" [ref=e9] [cursor=pointer]:
            - /url: /dashboard/default
            - img [ref=e10]
            - generic [ref=e12]: BoltForge Hardware
      - generic [ref=e13]:
        - generic [ref=e14]:
          - generic [ref=e15]: Overview
          - list [ref=e17]:
            - listitem [ref=e18]:
              - link "Dashboard" [ref=e19] [cursor=pointer]:
                - /url: /dashboard/default
                - img [ref=e20]
                - generic [ref=e25]: Dashboard
        - generic [ref=e26]:
          - generic [ref=e27]: Inventory
          - list [ref=e29]:
            - listitem [ref=e30]:
              - link "Products" [ref=e31] [cursor=pointer]:
                - /url: /dashboard/products
                - img [ref=e32]
                - generic [ref=e36]: Products
            - listitem [ref=e37]:
              - link "Categories" [ref=e38] [cursor=pointer]:
                - /url: /dashboard/categories
                - img [ref=e39]
                - generic [ref=e42]: Categories
            - listitem [ref=e43]:
              - link "Warehouses" [ref=e44] [cursor=pointer]:
                - /url: /dashboard/warehouses
                - img [ref=e45]
                - generic [ref=e48]: Warehouses
            - listitem [ref=e49]:
              - link "Stock" [ref=e50] [cursor=pointer]:
                - /url: /dashboard/stock
                - img [ref=e51]
                - generic [ref=e55]: Stock
        - generic [ref=e56]:
          - generic [ref=e57]: Procurement
          - list [ref=e59]:
            - listitem [ref=e60]:
              - link "Suppliers" [ref=e61] [cursor=pointer]:
                - /url: /dashboard/suppliers
                - img [ref=e62]
                - generic [ref=e67]: Suppliers
            - listitem [ref=e68]:
              - link "Purchase Orders" [ref=e69] [cursor=pointer]:
                - /url: /dashboard/purchase-orders
                - img [ref=e70]
                - generic [ref=e74]: Purchase Orders
            - listitem [ref=e75]:
              - link "Purchase Returns" [ref=e76] [cursor=pointer]:
                - /url: /dashboard/purchase-returns
                - img [ref=e77]
                - generic [ref=e80]: Purchase Returns
        - generic [ref=e81]:
          - generic [ref=e82]: Sales
          - list [ref=e84]:
            - listitem [ref=e85]:
              - link "Customers" [ref=e86] [cursor=pointer]:
                - /url: /dashboard/customers
                - img [ref=e87]
                - generic [ref=e92]: Customers
            - listitem [ref=e93]:
              - link "Sales Orders" [ref=e94] [cursor=pointer]:
                - /url: /dashboard/sales-orders
                - img [ref=e95]
                - generic [ref=e98]: Sales Orders
            - listitem [ref=e99]:
              - link "Sales Returns" [ref=e100] [cursor=pointer]:
                - /url: /dashboard/sales-returns
                - img [ref=e101]
                - generic [ref=e104]: Sales Returns
            - listitem [ref=e105]:
              - link "Payments" [ref=e106] [cursor=pointer]:
                - /url: /dashboard/payments
                - img [ref=e107]
                - generic [ref=e109]: Payments
        - generic [ref=e110]:
          - generic [ref=e111]: Analytics
          - list [ref=e113]:
            - listitem [ref=e114]:
              - link "Reports" [ref=e115] [cursor=pointer]:
                - /url: /dashboard/reports
                - img [ref=e116]
                - generic [ref=e118]: Reports
        - generic [ref=e119]:
          - generic [ref=e120]: Admin
          - list [ref=e122]:
            - listitem [ref=e123]:
              - link "Users" [ref=e124] [cursor=pointer]:
                - /url: /dashboard/users
                - img [ref=e125]
                - generic [ref=e137]: Users
      - list [ref=e139]:
        - listitem [ref=e140]:
          - button "AU Admin User admin@example.com" [ref=e141]:
            - generic [ref=e143]: AU
            - generic [ref=e144]:
              - generic [ref=e145]: Admin User
              - generic [ref=e146]: admin@example.com
            - img [ref=e147]
    - main [ref=e151]:
      - generic [ref=e153]:
        - generic [ref=e154]:
          - button "Toggle Sidebar" [ref=e155]:
            - img
            - generic [ref=e156]: Toggle Sidebar
          - button "Search ⌘ J" [ref=e157]:
            - img
            - text: Search
            - generic [ref=e158]:
              - generic [ref=e159]: ⌘
              - text: J
          - generic [ref=e160]:
            - heading "Command Palette" [level=2] [ref=e161]
            - paragraph [ref=e162]: Search for a command to run...
        - generic [ref=e163]:
          - button [ref=e164]:
            - img
          - 'button "Current theme: light. Click to cycle themes" [ref=e165]':
            - img
      - generic [ref=e167]:
        - generic [ref=e168]:
          - generic [ref=e169]:
            - heading "Customers" [level=1] [ref=e170]
            - paragraph [ref=e171]: Manage customer records
          - button "New Customer" [ref=e173]:
            - img
            - text: New Customer
        - textbox "Search customers…" [ref=e175]
        - table [ref=e178]:
          - rowgroup [ref=e179]:
            - row "Name Email Phone Type Credit Limit Status" [ref=e180]:
              - columnheader "Name" [ref=e181]
              - columnheader "Email" [ref=e182]
              - columnheader "Phone" [ref=e183]
              - columnheader "Type" [ref=e184]
              - columnheader "Credit Limit" [ref=e185]
              - columnheader "Status" [ref=e186]
              - columnheader [ref=e187]
          - rowgroup [ref=e188]:
            - row "Chamara Bandara chamara.bandara@email.com +94771111111 Retail $50,000.00 Active Edit Delete" [ref=e189]:
              - cell "Chamara Bandara" [ref=e190]
              - cell "chamara.bandara@email.com" [ref=e191]
              - cell "+94771111111" [ref=e192]
              - cell "Retail" [ref=e193]
              - cell "$50,000.00" [ref=e194]
              - cell "Active" [ref=e195]:
                - generic [ref=e196]: Active
              - cell "Edit Delete" [ref=e197]:
                - generic [ref=e198]:
                  - button "Edit" [ref=e199]
                  - button "Delete" [ref=e200]
            - row "Chamara Bandara chamara.bandara@email.com +94771111111 Retail $50,000.00 Active Edit Delete" [ref=e201]:
              - cell "Chamara Bandara" [ref=e202]
              - cell "chamara.bandara@email.com" [ref=e203]
              - cell "+94771111111" [ref=e204]
              - cell "Retail" [ref=e205]
              - cell "$50,000.00" [ref=e206]
              - cell "Active" [ref=e207]:
                - generic [ref=e208]: Active
              - cell "Edit Delete" [ref=e209]:
                - generic [ref=e210]:
                  - button "Edit" [ref=e211]
                  - button "Delete" [ref=e212]
            - row "Chamara Bandara chamara.bandara@email.com +94771111111 Retail $50,000.00 Active Edit Delete" [ref=e213]:
              - cell "Chamara Bandara" [ref=e214]
              - cell "chamara.bandara@email.com" [ref=e215]
              - cell "+94771111111" [ref=e216]
              - cell "Retail" [ref=e217]
              - cell "$50,000.00" [ref=e218]
              - cell "Active" [ref=e219]:
                - generic [ref=e220]: Active
              - cell "Edit Delete" [ref=e221]:
                - generic [ref=e222]:
                  - button "Edit" [ref=e223]
                  - button "Delete" [ref=e224]
            - row "Chamara Bandara chamara.bandara@email.com +94771111111 Retail $50,000.00 Active Edit Delete" [ref=e225]:
              - cell "Chamara Bandara" [ref=e226]
              - cell "chamara.bandara@email.com" [ref=e227]
              - cell "+94771111111" [ref=e228]
              - cell "Retail" [ref=e229]
              - cell "$50,000.00" [ref=e230]
              - cell "Active" [ref=e231]:
                - generic [ref=e232]: Active
              - cell "Edit Delete" [ref=e233]:
                - generic [ref=e234]:
                  - button "Edit" [ref=e235]
                  - button "Delete" [ref=e236]
            - row "Chamara Bandara chamara.bandara@email.com +94771111111 Retail $50,000.00 Active Edit Delete" [ref=e237]:
              - cell "Chamara Bandara" [ref=e238]
              - cell "chamara.bandara@email.com" [ref=e239]
              - cell "+94771111111" [ref=e240]
              - cell "Retail" [ref=e241]
              - cell "$50,000.00" [ref=e242]
              - cell "Active" [ref=e243]:
                - generic [ref=e244]: Active
              - cell "Edit Delete" [ref=e245]:
                - generic [ref=e246]:
                  - button "Edit" [ref=e247]
                  - button "Delete" [ref=e248]
            - row "Chamara Bandara chamara.bandara@email.com +94771111111 Retail $50,000.00 Active Edit Delete" [ref=e249]:
              - cell "Chamara Bandara" [ref=e250]
              - cell "chamara.bandara@email.com" [ref=e251]
              - cell "+94771111111" [ref=e252]
              - cell "Retail" [ref=e253]
              - cell "$50,000.00" [ref=e254]
              - cell "Active" [ref=e255]:
                - generic [ref=e256]: Active
              - cell "Edit Delete" [ref=e257]:
                - generic [ref=e258]:
                  - button "Edit" [ref=e259]
                  - button "Delete" [ref=e260]
            - row "Chamara Bandara chamara.bandara@email.com +94771111111 Retail $50,000.00 Active Edit Delete" [ref=e261]:
              - cell "Chamara Bandara" [ref=e262]
              - cell "chamara.bandara@email.com" [ref=e263]
              - cell "+94771111111" [ref=e264]
              - cell "Retail" [ref=e265]
              - cell "$50,000.00" [ref=e266]
              - cell "Active" [ref=e267]:
                - generic [ref=e268]: Active
              - cell "Edit Delete" [ref=e269]:
                - generic [ref=e270]:
                  - button "Edit" [ref=e271]
                  - button "Delete" [ref=e272]
            - row "Nimal Fernando nimal.fernando@buildcorp.lk +94772222222 Wholesale $500,000.00 Active Edit Delete" [ref=e273]:
              - cell "Nimal Fernando" [ref=e274]
              - cell "nimal.fernando@buildcorp.lk" [ref=e275]
              - cell "+94772222222" [ref=e276]
              - cell "Wholesale" [ref=e277]
              - cell "$500,000.00" [ref=e278]
              - cell "Active" [ref=e279]:
                - generic [ref=e280]: Active
              - cell "Edit Delete" [ref=e281]:
                - generic [ref=e282]:
                  - button "Edit" [ref=e283]
                  - button "Delete" [ref=e284]
            - row "Nimal Fernando nimal.fernando@buildcorp.lk +94772222222 Retail $500,000.00 Active Edit Delete" [ref=e285]:
              - cell "Nimal Fernando" [ref=e286]
              - cell "nimal.fernando@buildcorp.lk" [ref=e287]
              - cell "+94772222222" [ref=e288]
              - cell "Retail" [ref=e289]
              - cell "$500,000.00" [ref=e290]
              - cell "Active" [ref=e291]:
                - generic [ref=e292]: Active
              - cell "Edit Delete" [ref=e293]:
                - generic [ref=e294]:
                  - button "Edit" [ref=e295]
                  - button "Delete" [ref=e296]
            - row "Nimal Fernando nimal.fernando@buildcorp.lk +94772222222 Retail $500,000.00 Active Edit Delete" [ref=e297]:
              - cell "Nimal Fernando" [ref=e298]
              - cell "nimal.fernando@buildcorp.lk" [ref=e299]
              - cell "+94772222222" [ref=e300]
              - cell "Retail" [ref=e301]
              - cell "$500,000.00" [ref=e302]
              - cell "Active" [ref=e303]:
                - generic [ref=e304]: Active
              - cell "Edit Delete" [ref=e305]:
                - generic [ref=e306]:
                  - button "Edit" [ref=e307]
                  - button "Delete" [ref=e308]
            - row "Nimal Fernando nimal.fernando@buildcorp.lk +94772222222 Retail $500,000.00 Active Edit Delete" [ref=e309]:
              - cell "Nimal Fernando" [ref=e310]
              - cell "nimal.fernando@buildcorp.lk" [ref=e311]
              - cell "+94772222222" [ref=e312]
              - cell "Retail" [ref=e313]
              - cell "$500,000.00" [ref=e314]
              - cell "Active" [ref=e315]:
                - generic [ref=e316]: Active
              - cell "Edit Delete" [ref=e317]:
                - generic [ref=e318]:
                  - button "Edit" [ref=e319]
                  - button "Delete" [ref=e320]
            - row "Nimal Fernando nimal.fernando@buildcorp.lk +94772222222 Wholesale $500,000.00 Active Edit Delete" [ref=e321]:
              - cell "Nimal Fernando" [ref=e322]
              - cell "nimal.fernando@buildcorp.lk" [ref=e323]
              - cell "+94772222222" [ref=e324]
              - cell "Wholesale" [ref=e325]
              - cell "$500,000.00" [ref=e326]
              - cell "Active" [ref=e327]:
                - generic [ref=e328]: Active
              - cell "Edit Delete" [ref=e329]:
                - generic [ref=e330]:
                  - button "Edit" [ref=e331]
                  - button "Delete" [ref=e332]
            - row "Nimal Fernando nimal.fernando@buildcorp.lk +94772222222 Retail $500,000.00 Active Edit Delete" [ref=e333]:
              - cell "Nimal Fernando" [ref=e334]
              - cell "nimal.fernando@buildcorp.lk" [ref=e335]
              - cell "+94772222222" [ref=e336]
              - cell "Retail" [ref=e337]
              - cell "$500,000.00" [ref=e338]
              - cell "Active" [ref=e339]:
                - generic [ref=e340]: Active
              - cell "Edit Delete" [ref=e341]:
                - generic [ref=e342]:
                  - button "Edit" [ref=e343]
                  - button "Delete" [ref=e344]
            - row "Nimal Fernando nimal.fernando@buildcorp.lk +94772222222 Retail $500,000.00 Active Edit Delete" [ref=e345]:
              - cell "Nimal Fernando" [ref=e346]
              - cell "nimal.fernando@buildcorp.lk" [ref=e347]
              - cell "+94772222222" [ref=e348]
              - cell "Retail" [ref=e349]
              - cell "$500,000.00" [ref=e350]
              - cell "Active" [ref=e351]:
                - generic [ref=e352]: Active
              - cell "Edit Delete" [ref=e353]:
                - generic [ref=e354]:
                  - button "Edit" [ref=e355]
                  - button "Delete" [ref=e356]
            - row "Walk In Customer — +94775555555 Retail $0.00 Active Edit Delete" [ref=e357]:
              - cell "Walk In Customer" [ref=e358]
              - cell "—" [ref=e359]
              - cell "+94775555555" [ref=e360]
              - cell "Retail" [ref=e361]
              - cell "$0.00" [ref=e362]
              - cell "Active" [ref=e363]:
                - generic [ref=e364]: Active
              - cell "Edit Delete" [ref=e365]:
                - generic [ref=e366]:
                  - button "Edit" [ref=e367]
                  - button "Delete" [ref=e368]
            - row "Walk In Customer — +94775555555 Retail $0.00 Active Edit Delete" [ref=e369]:
              - cell "Walk In Customer" [ref=e370]
              - cell "—" [ref=e371]
              - cell "+94775555555" [ref=e372]
              - cell "Retail" [ref=e373]
              - cell "$0.00" [ref=e374]
              - cell "Active" [ref=e375]:
                - generic [ref=e376]: Active
              - cell "Edit Delete" [ref=e377]:
                - generic [ref=e378]:
                  - button "Edit" [ref=e379]
                  - button "Delete" [ref=e380]
            - row "Walk In Customer — +94775555555 Retail $0.00 Active Edit Delete" [ref=e381]:
              - cell "Walk In Customer" [ref=e382]
              - cell "—" [ref=e383]
              - cell "+94775555555" [ref=e384]
              - cell "Retail" [ref=e385]
              - cell "$0.00" [ref=e386]
              - cell "Active" [ref=e387]:
                - generic [ref=e388]: Active
              - cell "Edit Delete" [ref=e389]:
                - generic [ref=e390]:
                  - button "Edit" [ref=e391]
                  - button "Delete" [ref=e392]
            - row "Walk In Customer — +94775555555 Retail $0.00 Active Edit Delete" [ref=e393]:
              - cell "Walk In Customer" [ref=e394]
              - cell "—" [ref=e395]
              - cell "+94775555555" [ref=e396]
              - cell "Retail" [ref=e397]
              - cell "$0.00" [ref=e398]
              - cell "Active" [ref=e399]:
                - generic [ref=e400]: Active
              - cell "Edit Delete" [ref=e401]:
                - generic [ref=e402]:
                  - button "Edit" [ref=e403]
                  - button "Delete" [ref=e404]
            - row "Walk In Customer — +94775555555 Retail $0.00 Active Edit Delete" [ref=e405]:
              - cell "Walk In Customer" [ref=e406]
              - cell "—" [ref=e407]
              - cell "+94775555555" [ref=e408]
              - cell "Retail" [ref=e409]
              - cell "$0.00" [ref=e410]
              - cell "Active" [ref=e411]:
                - generic [ref=e412]: Active
              - cell "Edit Delete" [ref=e413]:
                - generic [ref=e414]:
                  - button "Edit" [ref=e415]
                  - button "Delete" [ref=e416]
            - row "Sanduni Rathnayake sanduni@homehardware.lk +94773333333 Wholesale $250,000.00 Active Edit Delete" [ref=e417]:
              - cell "Sanduni Rathnayake" [ref=e418]
              - cell "sanduni@homehardware.lk" [ref=e419]
              - cell "+94773333333" [ref=e420]
              - cell "Wholesale" [ref=e421]
              - cell "$250,000.00" [ref=e422]
              - cell "Active" [ref=e423]:
                - generic [ref=e424]: Active
              - cell "Edit Delete" [ref=e425]:
                - generic [ref=e426]:
                  - button "Edit" [ref=e427]
                  - button "Delete" [ref=e428]
        - generic [ref=e429]:
          - generic [ref=e430]: 1–20 of 30
          - generic [ref=e431]:
            - generic [ref=e432]:
              - generic [ref=e433]: Rows per page
              - combobox [ref=e434]:
                - generic: "20"
                - img
            - generic [ref=e435]: Page 1 of 2
            - generic [ref=e436]:
              - button [disabled]:
                - img
              - button [ref=e437]:
                - img
  - region "Notifications alt+T"
  - alert [ref=e438]
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | 
  3   | async function waitForTable(page: Page) {
  4   |   await page.waitForFunction(
  5   |     () => !document.querySelector('[data-slot="skeleton"]') && !document.querySelector(".animate-pulse"),
  6   |     { timeout: 15_000 },
  7   |   );
  8   |   await page.waitForTimeout(300);
  9   | }
  10  | 
  11  | async function expectToast(page: Page) {
  12  |   await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({ timeout: 12_000 });
  13  |   await page.waitForTimeout(300);
  14  | }
  15  | 
  16  | // ─── Customers ────────────────────────────────────────────────────────────────
  17  | 
  18  | test.describe("Customers", () => {
  19  |   const customers = [
  20  |     { firstName: "Chamara", lastName: "Bandara", email: "chamara.bandara@email.com", phone: "+94771111111", address: "12 Main St", city: "Colombo", country: "Sri Lanka", creditLimit: "50000" },
  21  |     { firstName: "Nimal", lastName: "Fernando", email: "nimal.fernando@buildcorp.lk", phone: "+94772222222", address: "45 Industry Blvd", city: "Gampaha", country: "Sri Lanka", creditLimit: "500000" },
  22  |     { firstName: "Sanduni", lastName: "Rathnayake", email: "sanduni@homehardware.lk", phone: "+94773333333", address: "7 Park Rd", city: "Kandy", country: "Sri Lanka", creditLimit: "250000" },
  23  |     { firstName: "Roshan", lastName: "Wickrama", email: "roshan@gmail.com", phone: "+94774444444", address: "99 Beach Rd", city: "Galle", country: "Sri Lanka", creditLimit: "25000" },
  24  |   ];
  25  | 
  26  |   test("customers page loads", async ({ page }) => {
  27  |     await page.goto("/dashboard/customers");
  28  |     await expect(page.locator("h1, h2").filter({ hasText: /customers/i }).first()).toBeVisible();
  29  |   });
  30  | 
  31  |   test("create multiple customers with different types", async ({ page }) => {
  32  |     test.setTimeout(120_000);
  33  |     await page.goto("/dashboard/customers");
  34  | 
  35  |     for (const cust of customers) {
  36  |       await page.locator("button").filter({ hasText: /new customer/i }).click();
  37  |       const dialog = page.locator('[role="dialog"]');
  38  |       await expect(dialog).toBeVisible();
  39  | 
  40  |       const inputs = dialog.locator("input");
  41  |       await inputs.nth(0).fill(cust.firstName);
  42  |       await inputs.nth(1).fill(cust.lastName);
  43  |       await inputs.nth(2).fill(cust.email);
  44  |       await inputs.nth(3).fill(cust.phone);
  45  |       await inputs.nth(4).fill(cust.address);
  46  |       await inputs.nth(5).fill(cust.city);
  47  |       await inputs.nth(6).fill(cust.country);
  48  | 
  49  |       // Select customer type
  50  |       const combos = dialog.locator('[role="combobox"]');
  51  |       if (await combos.count() > 0) {
  52  |         await combos.first().click();
  53  |         await page.locator('[role="option"]').first().click();
  54  |       }
  55  | 
  56  |       // Credit limit
  57  |       const numInput = dialog.locator('input[type="number"]').first();
  58  |       if (await numInput.isVisible({ timeout: 1_000 }).catch(() => false)) {
  59  |         await numInput.fill(cust.creditLimit);
  60  |       }
  61  | 
  62  |       await dialog.locator('button[type="submit"]').click();
  63  |       await expectToast(page);
  64  |       const custClosed = await dialog.waitFor({ state: "hidden", timeout: 5_000 }).then(() => true).catch(() => false);
  65  |       if (!custClosed) {
  66  |         await page.keyboard.press("Escape");
  67  |         await dialog.waitFor({ state: "hidden", timeout: 3_000 }).catch(() => {});
  68  |       }
  69  |     }
  70  |   });
  71  | 
  72  |   test("search customers", async ({ page }) => {
  73  |     await page.goto("/dashboard/customers");
  74  |     await waitForTable(page);
  75  | 
  76  |     await page.locator('input[placeholder*="Search"]').fill("Nimal");
  77  |     await page.waitForTimeout(700);
  78  | 
  79  |     const rows = page.locator("tbody tr");
  80  |     await expect(rows.first()).toContainText(/nimal/i);
  81  |   });
  82  | 
  83  |   test("edit customer credit limit", async ({ page }) => {
  84  |     await page.goto("/dashboard/customers");
  85  |     await waitForTable(page);
  86  | 
  87  |     const row = page.locator("tbody tr").filter({ hasText: "Roshan" }).first();
> 88  |     await row.locator("button").filter({ hasText: /edit/i }).click();
      |                                                             ^ Error: click: Test timeout of 45000ms exceeded.
  89  | 
  90  |     const dialog = page.locator('[role="dialog"]');
  91  |     await expect(dialog).toBeVisible();
  92  | 
  93  |     const numInput = dialog.locator('input[type="number"]').first();
  94  |     if (await numInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
  95  |       await numInput.clear();
  96  |       await numInput.fill("30000");
  97  |     }
  98  |     await dialog.locator('button[type="submit"]').click();
  99  |     await expectToast(page);
  100 |   });
  101 | 
  102 |   test("create walk-in customer (no email)", async ({ page }) => {
  103 |     await page.goto("/dashboard/customers");
  104 | 
  105 |     await page.locator("button").filter({ hasText: /new customer/i }).click();
  106 |     const dialog = page.locator('[role="dialog"]');
  107 |     await expect(dialog).toBeVisible();
  108 | 
  109 |     const inputs = dialog.locator("input");
  110 |     await inputs.nth(0).fill("Walk");
  111 |     await inputs.nth(1).fill("In Customer");
  112 |     await inputs.nth(3).fill("+94775555555");
  113 | 
  114 |     await dialog.locator('button[type="submit"]').click();
  115 |     await expectToast(page);
  116 |   });
  117 | });
  118 | 
  119 | // ─── Sales Orders ─────────────────────────────────────────────────────────────
  120 | 
  121 | test.describe("Sales Orders", () => {
  122 |   async function createSalesOrder(page: Page, opts: { customerFilter?: string; itemCount: number }) {
  123 |     await page.goto("/dashboard/sales-orders");
  124 |     await page.locator("button").filter({ hasText: /new sales order/i }).click();
  125 | 
  126 |     const dialog = page.locator('[role="dialog"]');
  127 |     await expect(dialog).toBeVisible({ timeout: 8_000 });
  128 | 
  129 |     const dateInputs = dialog.locator('input[type="date"]');
  130 |     if (await dateInputs.count() > 0) {
  131 |       await dateInputs.first().fill("2026-05-21");
  132 |     }
  133 | 
  134 |     if (opts.customerFilter) {
  135 |       const combos = dialog.locator('[role="combobox"]');
  136 |       await combos.first().click();
  137 |       const opt = page.locator('[role="option"]').filter({ hasText: opts.customerFilter }).first();
  138 |       if (await opt.isVisible({ timeout: 2_000 }).catch(() => false)) {
  139 |         await opt.click();
  140 |       } else {
  141 |         await page.locator('[role="option"]').first().click();
  142 |       }
  143 |     }
  144 | 
  145 |     const addBtn = dialog.locator("button").filter({ hasText: /add item/i }).first();
  146 |     if (await addBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
  147 |       for (let i = 0; i < opts.itemCount; i++) {
  148 |         await addBtn.click();
  149 |         const allCombos = dialog.locator('[role="combobox"]');
  150 |         await allCombos.last().click();
  151 |         // Guard: skip if no products in stock
  152 |         const hasOpts = await page.locator('[role="option"]').first().isVisible({ timeout: 4_000 }).catch(() => false);
  153 |         if (!hasOpts) { await page.keyboard.press("Escape"); return; }
  154 |         await page.locator('[role="option"]').nth(i).click().catch(async () => {
  155 |           await page.locator('[role="option"]').first().click();
  156 |         });
  157 | 
  158 |         const numInputs = dialog.locator('input[type="number"]');
  159 |         const count = await numInputs.count();
  160 |         await numInputs.nth(count >= 4 ? count - 4 : 0).fill(String(2 + i));
  161 |         await numInputs.nth(count >= 3 ? count - 3 : 1).fill("12500");
  162 |       }
  163 |     }
  164 | 
  165 |     await dialog.locator('button[type="submit"]').click();
  166 |     await expectToast(page);
  167 |   }
  168 | 
  169 |   test("sales orders page loads", async ({ page }) => {
  170 |     await page.goto("/dashboard/sales-orders");
  171 |     await expect(page.locator("h1, h2").filter({ hasText: /sales orders/i }).first()).toBeVisible();
  172 |   });
  173 | 
  174 |   test("create sales order for a named customer (retail)", async ({ page }) => {
  175 |     test.setTimeout(90_000);
  176 |     await createSalesOrder(page, { customerFilter: "Chamara", itemCount: 1 });
  177 |   });
  178 | 
  179 |   test("create sales order for wholesale customer with multiple items", async ({ page }) => {
  180 |     test.setTimeout(90_000);
  181 |     await createSalesOrder(page, { customerFilter: "Nimal", itemCount: 2 });
  182 |   });
  183 | 
  184 |   test("create walk-in (no customer) sales order", async ({ page }) => {
  185 |     test.setTimeout(90_000);
  186 |     await createSalesOrder(page, { itemCount: 1 });
  187 |   });
  188 | 
```