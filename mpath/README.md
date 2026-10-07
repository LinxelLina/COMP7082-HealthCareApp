# M-Path

## The idea

Modern life wants everything instantly.

- instant messages
- instant noodles
- instant replays
- instant advice from strangers who definitely have it all figured out

Meanwhile, most of the things that actually help people are not so dramatic. They are usually small, repetitive, unglamorous actions done over and over until they start to matter.

M-Path is a student-built mobile app prototype based on that idea. The goal is to make small, healthy actions feel more visible, more meaningful, and a little easier to stick with over time, instead of treating self-improvement like a magical one-click life patch.

## The problem

It is easy to start healthy habits and just as easy to immediately forget them when life gets particularly real. A lot of self-improvement tools lean hard into all-or-nothing thinking, which is great if you are a productivity cyborg and less great if you are a human being.

M-Path tries to support a slower and more realistic model:

- track small goals and habits
- make progress visible
- support reminders and repeat check-ins
- connect personal progress to a broader sense of contribution through charity-related features

Tiny actions, repeated consistently, stop being tiny.

## Current features

These are the features that are currently implemented in the codebase:

- Goal and habit creation with title, description, category, optional milestone settings, and optional reminder time
- Local, private data storage using SQLite
- Goal list with filtering by category and milestone status
- Goal completion, deletion, and detail views
- Milestone tracking with either check-in counts or target dates
- Weekly summary screen that derives progress information from saved goals
- Local notification support for goal reminders and milestone-related notifications
- Profile screen with charity selection and simple app settings
- Charity list fetched from Supabase
- Charity submission form that inserts charity records into Supabase
- Charity contribution graph based on Supabase data
- A small ad-video demo flow that updates contribution totals
- A home screen that shows goals plus a tappable mascot, because we're cool like that.

## Tech stack

- React Native
- Expo
- Expo Router
- TypeScript
- SQLite
- Supabase JavaScript client
- Expo Notifications
- Expo AV
- React Native chart libraries for the charity graph view

The project is configured as an Expo app in [app.json](./app.json), and the main scripts are in [package.json](./package.json).

### Local app data

Goals and profile/settings data are stored privately and locally on the device using SQLite.

- [services/goals.ts](./services/goals.ts) handles goal table creation and goal CRUD-style operations
- [services/profile.ts](./services/profile.ts) handles profile-related local storage such as selected charity label, total donations, notification toggle, and ad toggle

This means the core goal-tracking part of the app is primarily local-first.

### Remote charity data

Supabase is used for charity-related features.

- [utils/supabase.ts](./utils/supabase.ts) creates the client from environment variables
- charity list and charity graph screens fetch charity data from Supabase
- the charity form inserts new charity rows into Supabase
- some goal completion and ad-video flows call Supabase RPC functions to increase contribution totals

### Navigation and UI flow

- [app/_layout.tsx](./app/_layout.tsx) sets up the root stack, database initialization, and notification initialization
- [app/(tabs)/_layout.tsx](./app/%28tabs%29/_layout.tsx) defines the tab layout
- most user-facing screens live under [app](./app) and [app/(tabs)](./app/%28tabs%29)

1. The app starts and initializes local storage plus notifications.
2. Users create and manage goals locally.
3. Summary views read from local goal data.
4. Charity-related screens read from and write to Supabase.
5. Profile settings influence behavior such as notification handling and the ad-video flow.

## Important folders

The repository root contains documentation and separate root package files. The actual Expo app is the nested `mpath/` directory; `mobile/` contains only a tracked `.gitignore` and may contain ignored local dependency files. It has no application manifest or source. Keep these folder names and run app commands from the nested app directory.

The paths below are relative to this app directory.

```text
app/                Main screens and route files
app/(tabs)/         Tab-based screens like Home, Summary, Charities, and Profile
services/           SQLite goals/profile storage and Supabase charity operations
utils/              Shared helpers such as Supabase client, notifications calculations
components/         Reusable UI components
assets/             App icons, images, and mascot GIFs
scripts/            Small project scripts
```

## Install and run

### Requirements

- Node.js meeting React Native’s minimum (`>=20.19.4`) and npm
- Expo tooling via `npx expo`
- Expo Go compatible with SDK 54 on an Android phone, or a compatible emulator/simulator

### Setup

The repository root is `C:\Users\scott\projects\mpath`. The Expo app is in its nested `mpath/` folder (`C:\Users\scott\projects\mpath\mpath`). Run installation, launch, lint, and test commands in that app folder, using its `package-lock.json`; the root package files are separate.

1. Open PowerShell and select the app folder:

```powershell
Set-Location 'C:\Users\scott\projects\mpath'
Set-Location '.\mpath'
```

2. Create local configuration from the example, only if `.env` does not already exist:

```powershell
Copy-Item '.\.env.example' '.\.env'
```

Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in this app-local `.env` to your Supabase project URL and client key. If `.env` exists, update those entries and preserve other entries. This file is ignored by Git. Never use a service-role key in the app.

The Supabase client initializes when imported by the home-screen goal list, so valid configuration is needed at startup even though goals and profile settings use local SQLite. Charity screens and contribution updates also require the remote project to be available.

3. Install the committed dependencies:

```powershell
npm ci
```

4. Start Expo over LAN:

```powershell
npx expo start
```

Use an Android phone with Expo Go compatible with SDK 54. Get the matching version from [Expo’s official download page](https://expo.dev/go?sdkVersion=54&platform=android&device=true). Connect the phone and PC to the same Wi-Fi, open Expo Go, and scan the terminal QR code.

If LAN networking fails, stop the server with `Ctrl+C` and restart from the same app folder:

```powershell
npx expo start --tunnel
```

Tunnel mode requires internet on both devices and may require Expo’s ngrok helper. Starting the server does not confirm that the app has opened successfully on the phone.

### Linting

```bash
npm run lint
```

### Testing Approach

We now have a small Jest setup in the project for automated testing.

There are at least three different testing styles in this project: logic testing, mocked service testing, and app-specific data testing.

Not every single grain of the app is tested, but we test all core functionality in some way with meaningful and diverse tests.

- Pure utility logic tests: [utils/week.test.ts](./utils/week.test.ts) checks small date and week helpers.
- Testing notification and external services with mocking: [utils/notifications.test.ts](./utils/notifications.test.ts) checks reminder scheduling logic while mocking Expo notifications and profile settings.
- App-specific data transformation tests: [utils/goals.test.ts](./utils/goals.test.ts) checks how saved goal records are converted into the proper format used by the app, including defaults and boolean/date conversion.

You can run all tests with:

```bash
npm test
```

You can also run each test file on its own:

```bash
npm test -- --runTestsByPath utils/week.test.ts
npm test -- --runTestsByPath utils/notifications.test.ts
npm test -- --runTestsByPath utils/goals.test.ts
npm test -- --runTestsByPath services/profile.test.ts
npm test -- --runTestsByPath services/supabase.test.ts
npm test -- --runTestsByPath services/milestones.test.ts
```

## Validation

- Form inputs are checked before submitting in [app/goal_form.tsx](./app/goal_form.tsx) and [app/charity_form.tsx](./app/charity_form.tsx). These checks include required fields, date checks, milestone target checks, URL validation, and email validation.
- Local SQLite database calls in [services/goals.ts](./services/goals.ts) and [services/profile.ts](./services/profile.ts) use parameterized queries with `?` placeholders and separate values passed into `runAsync(...)` and `getAllAsync(...)`, which is safer than building SQL strings directly from user input.

## Continuous Integration Pipeline

- This project uses GitHub Actions to continuously integrate on every pull request and on pushes to the main branch of the repo.
- The pipeline automatically installs dependencies, runs lint, and runs tests.
- Its purpose is to catch breaks early and improve reliability by validating code automatically before and / or after integration.
- The project prioritised CI over full CD because the repo is still in the prototyping stage. The most meaningful automation at this stage is validating installation, code quality, and test results on each change

## In Conclusion

M-Path has goals, reminders, milestones, 2 databases, charts, charity data, and a mascot you can pet, which is a pretty darn good amount of features. Especially considering we only had 2 team members and limited time! We had a lot of fun and learned a lot.

Thank you for your interest and time.
