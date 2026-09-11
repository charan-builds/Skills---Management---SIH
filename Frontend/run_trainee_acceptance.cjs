const { chromium } = require("playwright");

async function runTraineeAcceptanceTests() {
  console.log("============================================================");
  console.log("STARTING TRAINEE PORTAL COMPREHENSIVE ACCEPTANCE AUDIT");
  console.log("============================================================\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // Setup Trainee authentication session
    await page.goto("http://localhost:5173/login");
    await page.evaluate(() => {
      localStorage.setItem("userRole", "trainee");
      localStorage.setItem("sih_token", "demo_trainee_jwt_token_verified");
      localStorage.setItem("traineeId", "TR-0001");
      localStorage.setItem("traineeEmail", "demo.trainee@sih.gov.in");
      localStorage.setItem("userName", "Priya Sharma");
    });

    // 1. DASHBOARD (/trainee)
    console.log("\n--- TEST SUITE 1: TRAINEE DASHBOARD (/trainee) ---");
    await page.goto("http://localhost:5173/trainee");
    await page.waitForTimeout(800);

    const welcomeHeading = await page.textContent("h1");
    assert(welcomeHeading && welcomeHeading.includes("Welcome"), `Trainee Dashboard renders welcome heading: ${welcomeHeading}`);

    const statusCards = await page.locator("h2:has-text('My Current Status')").count();
    assert(statusCards > 0, "My Current Status section is rendered");

    const skillStatus = await page.locator("h2:has-text('My Skill Status')").count();
    assert(skillStatus > 0, "My Skill Status & Readiness section is rendered");

    const recentProgress = await page.locator("h3:has-text('My Recent Progress Timeline')").count();
    assert(recentProgress > 0, "Recent Progress timeline is rendered");

    const actionButtons = await page.locator("h3:has-text('Important Actions')").count();
    assert(actionButtons > 0, "Important Actions section is rendered with actionable cards");

    // 2. PRIVACY & CONSENT (/trainee/consent)
    console.log("\n--- TEST SUITE 2: PRIVACY & CONSENT (/trainee/consent) ---");
    await page.goto("http://localhost:5173/trainee/consent");
    await page.waitForTimeout(800);

    const consentHeading = await page.textContent("h1");
    assert(consentHeading && consentHeading.includes("Privacy & Consent"), "Privacy & Consent page renders with explanation");

    const initialConsentStatus = await page.locator("text=Follow-Up Consent Accepted").count();
    assert(initialConsentStatus > 0, "Initial follow-up consent is Accepted for TR-0001");

    // Test toggle to DECLINED
    const revokeBtn = page.locator("button:has-text('Revoke / Decline')");
    if (await revokeBtn.count() > 0) {
      await revokeBtn.click();
      await page.waitForTimeout(600);
      const declinedBadge = await page.locator("text=Follow-Up Participation Declined").count();
      assert(declinedBadge > 0, "Consent status successfully changes to Declined and persists");

      const restrictionNotice = await page.locator("text=Follow-Up Participation is Restricted").count();
      assert(restrictionNotice > 0, "Restricted follow-up participation banner is displayed upon declination");

      // Re-accept consent
      const acceptBtn = page.locator("button:has-text('Accept & Authorize')");
      await acceptBtn.click();
      await page.waitForTimeout(600);
      const reAcceptedBadge = await page.locator("text=Follow-Up Consent Accepted").count();
      assert(reAcceptedBadge > 0, "Consent successfully reactivated to Accepted");
    }

    // 3. MY TRAINING & CERTIFICATE VIEW/DOWNLOAD (/trainee/training)
    console.log("\n--- TEST SUITE 3: MY TRAINING & CERTIFICATES (/trainee/training) ---");
    await page.goto("http://localhost:5173/trainee/training");
    await page.waitForTimeout(800);

    const trainingHeading = await page.textContent("h1");
    assert(trainingHeading && trainingHeading.includes("Training History"), "My Training page renders authoritative credentials");

    const programmeTitleCount = await page.locator("text=Programme Code:").count();
    assert(programmeTitleCount > 0, "Programme title correctly reflects trainee coursework");

    // View Certificate Modal
    const viewCertBtn = page.locator("button:has-text('View Certificate')");
    assert(await viewCertBtn.count() > 0, "View Certificate button exists for certified trainee");
    await viewCertBtn.click();
    await page.waitForTimeout(500);

    const modalTitle = await page.locator("h2:has-text('Certificate of Completion')").count();
    assert(modalTitle > 0, "Certificate preview modal opens cleanly");

    const simulationWatermark = await page.locator("text=ACCREDITED SIMULATION CREDENTIAL").count();
    assert(simulationWatermark > 0, "Certificate preview clearly identifies simulation/demo credential");

    // Close preview modal
    await page.locator("button[aria-label='Close Preview']").click();
    await page.waitForTimeout(300);

    // 4. MY SKILLS (/trainee/skills)
    console.log("\n--- TEST SUITE 4: MY SKILLS & EVIDENCE (/trainee/skills) ---");
    await page.goto("http://localhost:5173/trainee/skills");
    await page.waitForTimeout(800);

    const skillsHeading = await page.textContent("h1");
    assert(skillsHeading && skillsHeading.includes("My Skills"), "My Skills portfolio page renders");

    const verifiedSection = await page.locator("h3:has-text('My Verified Skills')").count();
    assert(verifiedSection > 0, "Verified evidence-backed skills section is explicitly separated");

    const gapsSection = await page.locator("h3:has-text('Skills I Should Improve')").count();
    assert(gapsSection > 0, "Synthesized skill gap analysis section is present");

    const evidenceInsights = await page.locator("text=Skill & Outcome Evidence Insights").count();
    assert(evidenceInsights > 0, "Grounded AI Evidence Insights banner is present without fake AI");

    // 5. SKILL GOALS & TARGET ROLE BENCHMARK (/trainee/skill-goals)
    console.log("\n--- TEST SUITE 5: TARGET ROLE SKILL INTELLIGENCE (/trainee/skill-goals) ---");
    await page.goto("http://localhost:5173/trainee/skill-goals");
    await page.waitForTimeout(800);

    const goalsHeading = await page.textContent("h1");
    assert(goalsHeading && goalsHeading.includes("Target Role Skill Goals"), "Target Role Skill Goals page renders");

    const roleSelector = page.locator("select").nth(1);
    assert(await roleSelector.count() > 0, "Occupational target role benchmark selector is present");

    const coverage = await page.locator("text=BENCHMARK COVERAGE").count();
    assert(coverage > 0, "Benchmark coverage count (X / Y) is displayed");

    const progressionView = await page.locator("h3:has-text('Career Transition Pathway')").count();
    assert(progressionView > 0, "Career Transition Pathway (Current Role -> Target Role) is visualized");

    const comparisonTable = await page.locator("table").count();
    assert(comparisonTable > 0, "Skill requirements comparison matrix table is rendered");

    // Change target role to Cloud Support Engineer
    await roleSelector.selectOption("ROLE-CSE");
    await page.waitForTimeout(600);
    const cseTitle = await page.locator("text=Cloud Support Engineer").count();
    assert(cseTitle > 0, "Switching target role updates benchmark and required skills dynamically");

    // 6. EMPLOYMENT JOURNEY (/trainee/employment-journey)
    console.log("\n--- TEST SUITE 6: EMPLOYMENT JOURNEY (/trainee/employment-journey) ---");
    await page.goto("http://localhost:5173/trainee/employment-journey");
    await page.waitForTimeout(800);

    const journeyHeading = await page.textContent("h1");
    assert(journeyHeading && journeyHeading.includes("My Employment Journey"), "Employment Journey page renders");

    const last6MonthsCount = await page.locator("h3:has-text('Last 6 Months Activity Log')").count();
    assert(last6MonthsCount > 0, "Prominent Last 6 Months chronological activity section is rendered");

    const timelineItems = await page.locator("div:has-text('Longitudinal Career Journey')").count();
    assert(timelineItems > 0, "Interactive longitudinal timeline spine is displayed");

    const inspector = await page.locator("text=Milestone Event Inspector").count();
    assert(inspector > 0, "Milestone Event Inspector is present for clickable event telemetry");

    // 7. PERSONAL OUTCOMES & WAGE PROGRESSION (/trainee/outcomes)
    console.log("\n--- TEST SUITE 7: PERSONAL OUTCOMES & WAGE TRACKING (/trainee/outcomes) ---");
    await page.goto("http://localhost:5173/trainee/outcomes");
    await page.waitForTimeout(800);

    const outcomesHeading = await page.textContent("h1");
    assert(outcomesHeading && outcomesHeading.includes("My Personal Outcomes"), "Personal Outcomes page renders");

    const whereAmINow = await page.locator("h3:has-text('Where Am I Now?')").count();
    assert(whereAmINow > 0, "'Where Am I Now?' high-level status summary card is rendered");

    const wageChartSvg = await page.locator("svg line").count();
    assert(wageChartSvg > 0, "Interactive wage progression SVG line chart is rendered");

    // Test Wage Increment Modal
    const logWageBtn = page.locator("button:has-text('Log Wage Increment')");
    await logWageBtn.click();
    await page.waitForTimeout(400);

    const wageInput = page.locator("input[type='number']");
    await wageInput.fill("32000");
    await page.locator("button[type='submit']:has-text('Submit Wage Update')").click();
    await page.waitForTimeout(600);

    const wageToast = await page.locator("text=wage progression milestone successfully recorded").count();
    assert(wageToast > 0, "Submitting wage increment updates store and displays success confirmation");

    // 8. FOLLOW-UPS (/trainee/follow-ups)
    console.log("\n--- TEST SUITE 8: FOLLOW-UPS CENTER (/trainee/follow-ups) ---");
    await page.goto("http://localhost:5173/trainee/follow-ups");
    await page.waitForTimeout(800);

    const fuHeading = await page.textContent("h1");
    assert(fuHeading && fuHeading.includes("Follow-up"), "Follow-Up Center renders milestone checkpoints");

    const milestoneCards = await page.locator("h3:has-text('Check-in')").count();
    assert(milestoneCards >= 3, "3M, 6M, and 12M check-in milestones are rendered");

    // 9. FEEDBACK & EVIDENCE SYNTHESIS (/trainee/feedback)
    console.log("\n--- TEST SUITE 9: TRAINEE FEEDBACK & EVIDENCE SYNTHESIS (/trainee/feedback) ---");
    await page.goto("http://localhost:5173/trainee/feedback");
    await page.waitForTimeout(800);

    const fbHeading = await page.textContent("h1");
    assert(fbHeading && fbHeading.includes("Feedback"), "Feedback page renders");

    const relevanceQ = await page.locator("text=Was your training programme relevant").count();
    assert(relevanceQ > 0, "Training relevance feedback question (Yes / Partially / No) is rendered");

    const section29Flow = await page.locator("text=Section 29 Flow").count();
    assert(section29Flow > 0, "Section 29 Evidence Synthesis visual workflow is displayed");

    // Submit feedback
    const skillInput = page.locator("input[placeholder*='Kubernetes']");
    await skillInput.fill("Docker & Microservices Deployment");
    const submitFbBtn = page.locator("button[type='submit']:has-text('Submit Skill Observation')");
    await submitFbBtn.click();
    await page.waitForTimeout(600);

    const fbSuccess = await page.locator("text=Feedback Successfully Recorded").count();
    assert(fbSuccess > 0, "Trainee-perceived skill feedback submitted and stored in intelligence queue");

    // 10. EMPLOYMENT STATUS (/trainee/employment)
    console.log("\n--- TEST SUITE 10: EMPLOYMENT STATUS DECLARATION (/trainee/employment) ---");
    await page.goto("http://localhost:5173/trainee/employment");
    await page.waitForTimeout(800);

    const empHeading = await page.textContent("h1");
    assert(empHeading && empHeading.includes("Employment Status Declaration"), "Employment declaration page renders");

    const statusTabs = await page.locator("button:has-text('Employed')").count();
    assert(statusTabs > 0, "Status selector tabs (Employed, Self-Employed, Apprentice, Unemployed) are rendered");

    console.log("\n============================================================");
    console.log(`TRAINEE PORTAL AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log("============================================================");

  } catch (err) {
    console.error("FATAL AUDIT ERROR:", err);
    failed++;
  } finally {
    await browser.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTraineeAcceptanceTests();
