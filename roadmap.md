# Project Roadmap: Guide - Math Learning App

This document outlines the potential development phases and features for the Guide application.

## Phase 0: UI/UX Overhaul & Core Improvements (Completed)

*   **Modern App-like UI:**
    *   Redesigned homepage with dashboard elements (Welcome, Streak, Quick Resume, Categories, Daily Challenge). (`Completed`)
    *   Implemented bottom navigation bar for primary navigation. (`Completed`)
    *   Created dedicated "Exercises" screen with tabbed categories. (`Completed`)
    *   Improved styling, cards, icons (FontAwesome), and animations. (`Completed`)
*   **Enhanced Level Completion Screen:**
    *   Converted modal to a full-screen view. (`Completed`)
    *   Improved display of stats (Accuracy, Avg Time, Stars). (`Completed`)
    *   Added social sharing buttons. (`Completed`)
*   **Practice Screen Ergonomics:**
    *   Redesigned keypad layout (1-2-3 top row). (`Completed`)
    *   Fixed keypad to the bottom of the screen. (`Completed`)
    *   Integrated "Check" button into the fixed keypad area. (`Completed`)
    *   Improved button styling and touch feedback. (`Completed`)
*   **Haptic Feedback:** Implemented vibration for correct/incorrect answers and level completion. (`Completed`)
*   **Bug Fixes & PWA Improvements:**
    *   Fixed rapid input bug (double digits) using throttling. (`Completed`)
    *   Improved PWA caching strategy (Network-first for dynamic assets, cache-first for static) and auto-update mechanism. (`Completed`)

## Phase 1: Foundational Enhancements

1.  **Add Multiplication:**
    *   Modify `levels.js` to include multiplication problems/levels.
    *   Update `gameLogic.js` to handle multiplication operations.
    *   Adjust `ui.js` if needed for displaying multiplication problems (e.g., using 'x' symbol).
    *   *Estimated Effort: Medium*
2.  **Add Division:**
    *   Similar to multiplication, modify `levels.js`, `gameLogic.js`, and `ui.js`. Ensure division problems result in whole numbers initially, or decide how to handle remainders/decimals.
    *   *Estimated Effort: Medium*
3.  **Refine UI/UX:** (`Partially Completed`)
    *   Review existing animations and transitions for smoothness.
    *   Add settings (e.g., toggle sound effects, toggle haptics).
    *   Improve profile screen/integration.
4.  **Code Quality & Testing:**
    *   Add basic unit tests (using a framework like Jest or Vitest) for `gameLogic.js` and utility functions.
    *   Refactor `ui.js` into smaller, more focused modules if possible.
    *   Add comments and documentation where needed.
    *   *Estimated Effort: Medium*

## Phase 2: Gamification and Engagement

5.  **Timed Challenge Mode:**
    *   Add a new game mode accessible from the UI (e.g., via Daily Challenge card or navbar).
    *   Implement timer logic in `gameLogic.js` or a new module.
    *   Display timer and high scores in `ui.js`.
    *   Update `state.js` to store high scores for timed modes.
    *   *Estimated Effort: Medium*
6.  **Enhanced Gamification:**
    *   Implement daily streak logic and display. (`Partially Completed` - Display added)
    *   Implement Daily Challenge functionality. (`Partially Completed` - UI added)
    *   Introduce badges or achievements beyond stars (e.g., "Accuracy Ace", "Speed Demon", "Completionist").
    *   Implement more engaging visual effects or sound effects.
    *   *Estimated Effort: Medium-High*
7.  **Statistics Dashboard:**
    *   Create a new section/page accessible from the bottom navbar. (`Partially Completed` - Navbar link added)
    *   Track metrics like accuracy per stage/level, time per problem, overall progress trends.
    *   Visualize data using simple charts (could use a lightweight charting library or pure CSS/SVG).
    *   Requires extending `state.js` to store more detailed historical data.
    *   *Estimated Effort: High*

## Phase 3: Advanced Features

8.  **Multiple User Profiles:**
    *   Significant change to state management (`state.js`).
    *   Add UI for profile selection/creation/switching (link added in header). (`Partially Completed`)
    *   Requires careful handling of local storage to separate profile data.
    *   *Estimated Effort: High*
9.  **Custom Level Creator:**
    *   Allow users (or teachers/parents) to create custom sets of problems or levels.
    *   Requires UI for level definition and storage mechanism.
    *   *Estimated Effort: High*
10. **Accessibility Improvements:**
    *   Thorough review based on WCAG guidelines.
    *   Ensure proper ARIA attributes, keyboard navigation, and screen reader compatibility.
    *   Add high-contrast mode option.
    *   *Estimated Effort: Medium*
