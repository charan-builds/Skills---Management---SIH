import asyncio
from playwright.async_api import async_playwright
import os
import time

BASE_URL = "http://localhost:5173"
OUT_DIR = "docs/screenshots"

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()

        print("1. Capturing Login...")
        await page.goto(f"{BASE_URL}/login")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{OUT_DIR}/authentication/01_login.png")

        print("Logging in as Admin...")
        try:
            # Type something if required, or click Admin
            await page.get_by_role("button", name="Admin").click(timeout=2000)
            await page.wait_for_timeout(1000)
        except Exception as e:
            print(f"Could not click Admin button: {e}")
        
        print("Navigating to Admin Dashboard...")
        await page.goto(f"{BASE_URL}/admin/dashboard")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{OUT_DIR}/admin/02_dashboard_initial.png")

        print("Capturing Impact Intelligence...")
        await page.goto(f"{BASE_URL}/admin/intelligence")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{OUT_DIR}/intelligence/03_impact_intelligence.png")

        print("Capturing Trainee Management...")
        await page.goto(f"{BASE_URL}/admin/trainees")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{OUT_DIR}/admin/04_trainee_management.png")

        print("Navigating to Trainee Portal...")
        await page.goto(f"{BASE_URL}/trainee/dashboard")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{OUT_DIR}/trainee/05_trainee_dashboard.png")

        print("Capturing Trainee Explore Jobs...")
        await page.goto(f"{BASE_URL}/trainee/explore")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{OUT_DIR}/trainee/06_explore_jobs.png")

        print("Navigating to Employer Portal...")
        await page.goto(f"{BASE_URL}/employer/dashboard")
        await page.wait_for_timeout(2000)
        await page.screenshot(path=f"{OUT_DIR}/employer/07_employer_dashboard.png")

        print("Done!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(capture())
