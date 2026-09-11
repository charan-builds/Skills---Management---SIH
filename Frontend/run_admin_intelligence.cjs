const { chromium } = require("playwright");

async function runAdminIntelligenceTests() {
  console.log("=== STARTING ADMIN TRAINEE INTELLIGENCE & OUTCOME DIAGNOSIS TEST SUITE ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Instant Government Login
    console.log("\n1. Testing Government Access Login...");
    await page.goto("http://localhost:5173/login");
    await page.waitForSelector("#btn-government-access", { timeout: 8000 });
    await page.click("#btn-government-access");
    await page.waitForURL("**/admin", { timeout: 8000 });
    assert(page.url().includes("/admin"), "Logged in and routed to /admin");

    // 2. Trainee Directory Navigation
    console.log("\n2. Testing Trainee Directory (/admin/trainees)...");
    await page.goto("http://localhost:5173/admin/trainees");
    await page.waitForSelector("#trainee-search-input", { timeout: 8000 });
    const directoryTitle = await page.textContent("h1");
    assert(directoryTitle.includes("Trainee Directory"), "Trainee Directory loaded successfully");

    // Wait for table rows to mount
    await page.waitForSelector("tbody tr", { timeout: 8000 });
    const tableRows = await page.$$("tbody tr");
    assert(tableRows.length >= 10, `Directory renders ${tableRows.length} trainees per page`);

    // 3. Search Trainee
    console.log("\n3. Testing Trainee Omni-Search...");
    await page.fill("#trainee-search-input", "TR-0001");
    await page.waitForTimeout(600);
    const searchRows = await page.$$("tbody tr");
    assert(searchRows.length >= 1, "Search for 'TR-0001' returned matching candidate");

    // 4. Quick Filters
    console.log("\n4. Testing Quick Filters (Outcome & Risk)...");
    await page.fill("#trainee-search-input", "");
    await page.selectOption("#outcome-filter-select", "employed");
    await page.waitForTimeout(600);
    const employedRows = await page.$$("tbody tr");
    assert(employedRows.length > 0, "Filtered by 'Employed' outcome");

    // Clear filters
    await page.click("#clear-trainee-filters-btn");
    await page.waitForTimeout(600);

    // 5. Trainee Profile Inspection (/admin/trainees/:traineeId)
    console.log("\n5. Testing Trainee Profile Screen (/admin/trainees/TR-0001)...");
    await page.goto("http://localhost:5173/admin/trainees/TR-0001");
    await page.waitForSelector("#back-to-trainees-btn", { timeout: 8000 });
    const profileHeader = await page.textContent("h1");
    assert(profileHeader.length > 0, `Loaded profile header for candidate: ${profileHeader}`);

    // Check Outcome Summary matrix
    const outcomeSummaryText = await page.textContent("body");
    assert(outcomeSummaryText.includes("Training Course"), "Outcome Summary matrix rendered");
    assert(outcomeSummaryText.includes("Wage Progression"), "Wage Progression summary rendered");
    assert(outcomeSummaryText.includes("6M Retention"), "6M Retention summary rendered");

    // Check Longitudinal Timeline
    assert(outcomeSummaryText.includes("Longitudinal Journey Timeline"), "Longitudinal Timeline rendered");
    assert(outcomeSummaryText.includes("Last 6 Months Activity"), "Last 6 Months Activity stream rendered");
    assert(outcomeSummaryText.includes("Employment History & Career Progression"), "Employment History rendered");

    // Check skills section
    assert(outcomeSummaryText.includes("Skills & Competency Evaluation"), "Skills & Competency section rendered");

    // 6. Outcomes Workspace (/admin/outcomes)
    console.log("\n6. Testing Outcomes Analysis Workspace (/admin/outcomes)...");
    await page.goto("http://localhost:5173/admin/outcomes");
    await page.waitForSelector("#np-reason-location", { timeout: 10000 });
    const outcomesTitle = await page.textContent("h1");
    assert(outcomesTitle.includes("Programme Outcomes Workspace"), "Outcomes Workspace loaded");

    // Check Headline KPIs & Funnel
    const outcomesBody = await page.textContent("body");
    assert(outcomesBody.includes("Total Trained"), "Headline KPI 'Total Trained' rendered");
    assert(outcomesBody.includes("6-Stage Outcome Funnel"), "6-Stage Outcome Funnel rendered");
    assert(outcomesBody.includes("Outcome Distribution"), "Outcome Distribution Donut chart rendered");
    assert(outcomesBody.includes("Employment Over Time"), "Employment Over Time line chart rendered");

    // 7. "Why People Don't Get Jobs" & Location Drilldown
    console.log("\n7. Testing 'Why People Don't Get Jobs' Diagnosis...");
    assert(outcomesBody.includes("Why People Don't Get Jobs"), "Non-placement section renamed to 'Why People Don't Get Jobs'");
    
    // Click Location reason pill
    await page.click("#np-reason-location");
    await page.waitForTimeout(500);
    const updatedBodyNp = await page.textContent("body");
    assert(updatedBodyNp.includes("WHY THIS AREA MAY BE LAGGING"), "Diagnosis explanation 'WHY THIS AREA MAY BE LAGGING' rendered");
    assert(updatedBodyNp.includes("SAMPLE AFFECTED CANDIDATE RECORDS"), "Sample affected candidate records rendered");

    // 8. "Why People Leave Jobs" & Salary Pattern Analysis
    console.log("\n8. Testing 'Why People Leave Jobs' Pattern Analysis...");
    assert(updatedBodyNp.includes("Why People Leave Jobs"), "Attrition section renamed to 'Why People Leave Jobs'");

    // Click Salary attrition pill
    await page.click("#att-reason-salary");
    await page.waitForTimeout(500);
    const updatedBodyAtt = await page.textContent("body");
    assert(updatedBodyAtt.includes("WHAT PATTERN ARE WE SEEING?"), "Pattern analysis 'WHAT PATTERN ARE WE SEEING?' rendered");
    assert(updatedBodyAtt.includes("Analytical Outcome Diagnosis"), "Analytical Outcome Diagnosis section rendered");

    // 9. Key Findings & Insights (/admin/interventions)
    console.log("\n9. Testing Key Findings & Insights (/admin/interventions)...");
    await page.goto("http://localhost:5173/admin/interventions");
    await page.waitForSelector("h1", { timeout: 8000 });
    const insightsTitle = await page.textContent("h1");
    assert(insightsTitle.includes("Key Findings & Insights"), "Key Findings & Insights loaded");

    // Click View Evidence
    await page.waitForSelector("#view-evidence-INS-01", { timeout: 5000 });
    await page.click("#view-evidence-INS-01");
    await page.waitForTimeout(500);
    const evidenceDrawer = await page.textContent("body");
    assert(evidenceDrawer.includes("INSIGHT TRACEABILITY AUDIT"), "Traceable Evidence Inspection Drawer opened");
    assert(evidenceDrawer.includes("Reported Gap Frequency"), "Evidence audit metrics rendered");

    // Adopt action
    await page.click("#adopt-action-INS-01");
    await page.waitForTimeout(300);
    const adoptButton = await page.$("#adopt-action-INS-01");
    const adoptText = await adoptButton.innerText();
    assert(adoptText.includes("Action Adopted"), "Action adoption mutated state reactively");

    // 10. Mobile Responsiveness Test
    console.log("\n10. Testing Mobile Responsive View (375x667)...");
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("http://localhost:5173/admin/trainees");
    await page.waitForSelector("table", { timeout: 5000 });
    const tableExists = await page.$("table");
    assert(Boolean(tableExists), "Trainee table renders properly on mobile viewport");

  } catch (err) {
    console.error("Test execution failed with error:", err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log("\n=======================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAdminIntelligenceTests();
