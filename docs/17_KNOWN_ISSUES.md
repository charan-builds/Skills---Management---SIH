# Known Issues

This document tracks known bugs or UX quirks in the Skilling Impact Intelligence platform that have not yet been resolved.

## 1. Filter State Desynchronization (Minor)
- **Description**: If an administrator applies a District filter (e.g., "Hyderabad") on the Dashboard, then navigates to the "Impact Intelligence" page, the Impact Intelligence page may default back to "All Districts" rather than inheriting the global context.
- **Root Cause**: The filter state is currently managed locally within page components rather than hoisted to a global React Context provider.
- **Workaround**: The user must re-select the filters on the new page.
- **Severity**: Low.

## 2. Mock Data Mutation Limitations (Expected)
- **Description**: When adding a new trainee via the Admin portal, the trainee appears in the frontend list, but navigating away and back causes the trainee to disappear.
- **Root Cause**: The backend `/api/trainees` POST endpoint currently returns a `201 Created` success message but does not permanently mutate the static JSON files on the server (to prevent state corruption across multiple concurrent evaluators).
- **Workaround**: None required; this is the intended behavior for the stateless Demo Mode.
- **Severity**: None (By Design).

## 3. Playwright Screenshot Automation Timeout
- **Description**: Running automated browser testing/screenshot capture via Chrome CDP (`localhost:9222`) currently times out in the build environment.
- **Root Cause**: Environmental constraint preventing WebSocket attachment to the Chrome debug port.
- **Workaround**: Manual visual validation via the deployed URLs.
- **Severity**: Medium (Affects CI/CD visual regression testing only; does not impact end users).

*(Note: Major functional bugs involving Dashboard flickering, cross-filter routing, and backend CORS configuration were successfully resolved and verified in recent commits `d26060f` and `a61f5db`).*
