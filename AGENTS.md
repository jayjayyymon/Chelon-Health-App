This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

# Health App Project Instructions

## Project Goal

This is a 2-day React Native + Expo health app prototype.

The goal is approximately 40-50% functionality.

This is a school/project prototype, NOT a production medical application.

The application will be handed to another developer after the functionality is completed. That developer will focus on visual styling.

## Technology

* React Native
* Expo
* TypeScript
* Expo Router
* React state/context where appropriate
* Local/mock data

Do not introduce additional frameworks or libraries unless they are genuinely necessary.

## Main Features

The application contains:

1. Dashboard
2. Water tracker
3. Diet tracker
4. Weight tracker
5. Sleep tracker
6. Step tracker
7. Mental wellness check
8. Health chatbot
9. Nearby health centers
10. Doctor consultation
11. User profile

## Development Priorities

Prioritize in this order:

1. Working functionality
2. Clean and readable code
3. Simple architecture
4. Easy handoff to another developer
5. Visual styling

Do not over-engineer the application.

## Architecture

Keep screens separate.

Use reusable components where appropriate.

Keep mock data separate from UI when practical.

Avoid putting large amounts of unrelated logic into a single file.

Avoid duplicated state when existing application state can be reused.

Use descriptive names.

Prefer simple solutions.

## Prototype Scope

This is intentionally NOT a production application.

Use mock or simulated functionality when appropriate.

Examples:

* Simulated step counts are acceptable.
* Mock health centers are acceptable.
* Mock doctors are acceptable.
* Local appointment selection is acceptable.
* Rule-based chatbot responses are acceptable.
* Local state is acceptable.

Do not implement unless specifically requested:

* Real medical diagnosis
* Production medical systems
* Real doctor booking infrastructure
* Real payment systems
* Real health sensor integration
* Complex authentication
* Complex backend infrastructure
* External health APIs
* Real-time systems

## Styling

The application should have a clean basic UI, but do not spend excessive time on visual styling.

Another developer will handle the final visual design.

Keep functionality reasonably separated from presentation so the styling can be changed later.

Avoid unnecessary hardcoded styling inside business logic.

## AI Development Rules

Before making major architectural changes, explain the proposed approach.

Only modify files relevant to the requested task.

Do not rewrite unrelated parts of the project.

Do not add features that were not requested.

Do not install dependencies unless necessary.

After making changes, check for TypeScript, import, and navigation errors.

If an error is caused by your changes, fix it.

Prefer simple implementations suitable for a two-day prototype.

When there are multiple possible approaches, choose the simplest reliable approach.

## Important Scope Rule

Do not turn this prototype into a production application.

If a feature can be demonstrated with mock data or local state, prefer that approach.

The goal is to demonstrate the application's concept and user flow, not to build a complete commercial health platform.
