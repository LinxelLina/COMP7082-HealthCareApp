# M-Path

## Thesis

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

## High-level architecture / data flow

NOT SURE WHAT TO PUT HERE YET

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


TOO HONEST BELOW?!

Note: Supabase usage exists, but it is not cleanly wrapped in a nice back-end architecture or service layer or anything. Supabase is sometimes called directly. That is less about purposeful design and more about shipping a working demo.

### Navigation and UI flow

- [app/_layout.tsx](./app/_layout.tsx) sets up the root stack, database initialization, and notification initialization
- [app/(tabs)/_layout.tsx](./app/(tabs)/_layout.tsx) defines the tab layout
- most user-facing screens live under [app](./app) and [app/(tabs)](./app/%28tabs%29)

At a high level, the flow is:

1. The app starts and initializes local storage plus notifications.
2. Users create and manage goals locally.
3. Summary views read from local goal data.
4. Charity-related screens read from and write to Supabase.
5. Profile settings influence behavior such as notification handling and the ad-video flow.

## Important folders

```text
app/                Main screens and route files
app/(tabs)/         Tab-based screens like Home, Summary, Charities, and Profile
services/           SQLite data logic for goals and profile data
utils/              Shared helpers such as Supabase client, notifications calculations
components/         Reusable UI components
assets/             App icons, images, and mascot GIFs
scripts/            Small project scripts
```

## Install and run

### Requirements

- Node.js and npm
- Expo tooling via `npx expo`
- Expo Go on a phone, or an emulator/simulator

### Setup

1. Install dependencies:

npm install

2. Create a local environment file, a .env

3. Add your Supabase values to `.env`:

EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key


These values are needed for the charity-related screens and remote contribution features.

4. Start the Expo dev server:

npx expo start

We would also often run:

npx expo start --tunnel

to solve networking issues.

### Linting

npm run lint


## Known limitations / rough edges

- Some charity features depend on a matching Supabase project, tables, and RPC functions already existing
- Supabase access is handled directly in some screens instead of through a dedicated abstraction layer
- The app mixes local-only data and remote charity data, so the overall data model is functional but not fully streamlined


## In Conclusion

This project is trying to take a pretty unglamorous idea seriously: that improving your life is less about hacks and more about repeating good, boring decisions.

M-Path has goals, reminders, milestones, 2 databases, charts, charity data, and a mascot you can pet, which is a pretty darn good amount of features. Especially considering we only had 2 team members and limited time!

Thank you for your interest and time.
