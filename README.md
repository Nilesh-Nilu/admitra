# Admitra

Admitra is a mobile marketplace built with Expo and React Native. Users post and browse classified ads in three ad types (Normal, Featured and Banner), manage matrimony profiles, chat with sellers, save favourites, report content, and pay for plans through Razorpay.

- Bundle ID / package: `com.admitra.app`
- Backend API: `https://admastermarketplace.in/api` (Swagger: https://admastermarketplace.in/api/documentation)
- Stack: Expo SDK 53, React Native 0.79, React 19, expo-router 5, TypeScript, Redux Toolkit, axios

For the full developer handover (setup from scratch, every feature flow, API reference, open issues, release steps and QA checklist), read **[docs/admitra-handover-guide.docx](docs/admitra-handover-guide.docx)**.

## Requirements

- Node.js 20 LTS
- Yarn Classic **1.22.22** (pinned in `package.json`)
- Android: Android Studio, JDK 17, Android SDK Platform 36
- iOS (macOS only): Xcode and CocoaPods

> Use **yarn** only. `npm install` and `pnpm i` are not supported: pnpm stops with `ERR_PNPM_OTHER_PM_EXPECTED`.

## Getting started

```bash
git clone <repository-url> admitra
cd admitra
git checkout devUi
yarn install
yarn start
```

Then run on a device or emulator:

```bash
yarn android   # builds the native app from the android/ folder
yarn ios       # needs ios/ first: npx expo prebuild --platform ios
```

Before you start work, check the types:

```bash
npx tsc --noEmit
```

### Private files (not in Git)

The `android/` folder is listed in `.gitignore`. Get these from the project owner and place them as described:

- `android/app/google-services.json`: Firebase, required for push notifications.
- `android/keystore.properties` and the keystore file it names: release signing.

Never commit these files.

## Scripts

| Command | What it does |
|---|---|
| `yarn start` | Starts the Metro bundler (Expo dev server) |
| `yarn android` | Builds and runs the Android app |
| `yarn ios` | Builds and runs the iOS app (after `npx expo prebuild --platform ios`) |
| `yarn web` | Runs the web build |
| `yarn lint` | Runs ESLint through `expo lint` |

Do not run `npm run reset-project`. It moves the current `app/` folder away and replaces it with starter code.

## Configuration

| File | What to change |
|---|---|
| `constants/config.js` | `baseUrl`, the backend API base URL |
| `constants/functions.js` | Endpoint paths, `ImageUrl`, and `RAZORPAY_KEY` (the live key should move to environment configuration) |
| `app.json` | App name, scheme `admitra`, bundle and package IDs, permissions, plugins |
| `android/app/build.gradle` | `versionCode` (increase on every Play Store upload) and `versionName` |

## Project layout

```
app/                  Screens (expo-router file-based routing)
  (auth)/             Startup redirect, login, profile completion, forgot password
  (tabs)/             Home, Chat, Create Ad (post), My Listing, Profile
  stacks/             Details screens, search, categories, See All lists, chat detail,
                      notifications, change password, policies, verification
  notification/       Push notification setup
components/           Cards, buttons, modals, filters, Create Ad form, home sections
constants/            config.js, functions.js (all API calls), colours, sizes, data
store/                Redux Toolkit store, reducers and API middleware
hooks/                Colour scheme, screen security, wake lock
plugins/              Android security config plugin
docs/                 Ad post backend reference and the handover guide
```

## Main flows

- **Login:** email or phone OTP, then profile completion for new users. The token is stored in AsyncStorage under `authToken`.
- **Home and See All:** 26 ads per page with a Load More button on every ad list. Home and See All Fresh fetch the next page from the server.
- **Create Ad:** free or paid posting. Free status and plan rules are in `docs/ad-post-api.md`. Paid posts go through Razorpay, then `payment/verify-and-store`.
- **My Listing:** tabs for Normal, Featured, Banner, Pending, Renewed, Favourites and Matrimony, with Edit Price, Delete and Renew actions.
- **Contact rules:** Featured and Banner show Call and Chat. Normal shows Chat (Call only when the admin setting is on). Matrimony shows Chat.
- **Reports:** ads, users and matrimony profiles, through `ReportButton` and `ReportModal`.

The guide covers each flow step by step.

## Working on the project

- Branch from `devUi`. Pull requests target `master`.
- Run `npx tsc --noEmit` and `yarn lint` before a pull request.
- There are no automated tests. Test on a device and follow the QA checklist in the handover guide.
- Remove temporary `console.log` lines before release.
- Shell `sed` fails on paths with parentheses such as `app/(tabs)`. Use the editor or a script for those files.

## Release

Android: bump `versionCode` and `versionName` in `android/app/build.gradle`, then run `cd android && ./gradlew bundleRelease` and upload the `.aab` to Google Play Console. iOS is not set up in this repository. See section 12 of the handover guide.

## Known open items

The open items and their owners are listed in section 11 of the handover guide. The main ones are the backend fix for Edit Price on normal ads (a foreign-key error on `child_category_id`), the banner Visit Website flag from the backend, matrimony favourites (no endpoint yet), and moving the Razorpay key out of the code.
