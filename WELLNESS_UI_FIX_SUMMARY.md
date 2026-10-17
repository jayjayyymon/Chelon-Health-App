# Wellness Check UI Fix Summary

## Changes Made

Updated `src/app/wellness.tsx` to align the Wellness Check screen with the established tracker UI design system:

1. **Header**:
   - Replaced the custom icon/title/description header with a tracker-style header:
     - Accessible back button (Pressable) using `router.back()` on the left.
     - Centered title "Wellness Check-In" matching tracker typography (18px, weight 900, letterSpacing -0.3).
     - Balancing spacer on the right to keep title centered.
   - Moved the descriptive text ("Reflect on your well-being...") below the header to avoid duplication.
   - Used tracker colors for background, text, and button states (tileColor, inkColor, etc.).

2. **Progress Indicator**:
   - Kept the text "Question X of Y" and added a visual progress bar beneath it.
   - Progress bar uses the tracker tileColor for the track and panelGreen (wellness accent) for the fill.
   - Height and borderRadius match tracker progress bars.

3. **Answer Options**:
   - Converted each option to a full-width selectable row using Pressable.
   - Preserved accessibility: `accessibilityRole="radio"`, `accessibilityLabel`, `accessibilityState.selected`.
   - Visual selection: single layer via border color (panelGreen when selected, borderColor otherwise) and backgroundColor (tileColor).
   - Removed the duplicate nested ThemedView that caused two selection indicators.
   - Added pressed state opacity feedback.
   - Text color uses inkColor for readability in both themes.

4. **Navigation Buttons**:
   - Replaced PlaceholderButton with the shared TrackerActionButton component.
   - Back button: secondary style (outline) with tileColor background and inkColor text.
   - Next/Finish button: primary style with panelGreen background and panelText text.
   - Final action label changes from "Submit" to "Finish" on the last question.
   - Buttons retain the same minimum height, horizontal padding, borderRadius, and pressed/disabled opacities as tracker action buttons.
   - Kept the same validation logic: pressing Next/Finish when unanswered shows an error and does not advance.

5. **Result Screen**:
   - Applied the same tracker-style header as the form screen.
   - Changed SectionCard title to empty (title moved to header).
   - Answer summary items use the same selected card styling (tileColor background, borderColor border).
   - Kept the suggestions section and disclaimer unchanged (text colors use theme-appropriate mutedInk).

6. **Colors and Theme**:
   - Removed all hardcoded pink, blue, and light-only colors.
   - Reused the tracker palette from `src/constants/theme.ts`:
     - Light/Dark hero: #C9E8CA / #183B2D
     - Light/Dark panel: NavigationColors.background (#4ca771) / #245c42
     - Light/Dark ink: #113c3b / #f1f7f2
     - Light/Dark muted ink: #607b70 / #c1d4ca
     - Light/Dark tile: #ffffff / #17382e
     - Light/Dark border: #d9e7dc / #397258
   - Used `useColorScheme` and `Colors` to resolve light/dark values.

## Files Changed

- `src/app/wellness.tsx` (only file modified for this task)

## Verification

- **TypeScript Check**: ✅ Passed (`npx tsc --noEmit` completed with no errors).
- **Lint Check**: ⚠️ Could not run due to permission restrictions in the current environment. The linter is available (`npx expo lint`) but was blocked by the system's classifier. No modifications were made to lint configuration or unrelated files.
- **Logic Preservation**: All questionnaire data, answer state, validation, profile persistence, wellness suggestion generation, result rendering, retake reset, and dashboard navigation remain unchanged.
- **Scope Control**: No changes to questions, scoring, authentication, database, root layout, dashboard, or other tracker screens.
- **Dependencies**: No new dependencies added.

## Notes

- The Wellness Check screen now visually matches the Water, Sleep, Steps, Weight, and Diet tracker screens in header structure, color palette, selection indication, and button treatment.
- The implementation follows the existing design system and reuses shared components (`TrackerActionButton`, `ThemedView`, `ThemedText`, spacing constants) where possible.
- Manual visual testing was not performed, as per instructions (no Expo/simulator/emulator launch).