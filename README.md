# La Pino'z Pizza US - Mobile Application

![React Native](https://img.shields.io/badge/React_Native-0.83.1-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Node 20](https://img.shields.io/badge/Node->=20-brightgreen?style=for-the-badge&logo=node.js)

The official **La Pino'z Pizza US** mobile application. This repository contains the frontend React Native code built for both Android and iOS platforms. It allows users to browse menus, find stores, manage their profiles, track orders, and raise concerns securely.

## 🛠 Tech Stack

- **Framework:** React Native (`v0.83.1`)
- **Language:** TypeScript
- **Navigation:** React Navigation (`v7`) - Stack & Bottom Tabs
- **Network / API:** Axios
- **Local Storage:** AsyncStorage
- **Components & Icons:** Lucide React Native, React Native Vector Icons, React Native SVG
- **Core Features/Integrations:** React Native Maps/Geolocation, React Native WebView, React Native Permissions
- **Testing:** Jest & React Test Renderer

## 📂 Project Structure

```text
src/
├── assets/       # Static files like images, fonts, and icons
├── components/   # Reusable UI components (Buttons, Inputs, Cards)
├── context/      # React Context providers for global state (AuthContext, etc.)
├── navigation/   # Navigators (AppNavigator, AuthNavigator)
├── screens/      # Full view screens (HomeScreen, ProfileScreen, Auth screens)
├── services/     # API clients (axios setup) and business logic
├── types/        # TypeScript interfaces and global types
└── utils/        # Helper functions, formatters, and constants
```

## ⚙️ Prerequisites

Before you can build and run this application, ensure your development environment is properly configured.

1. **Node.js**: Require version `>= 20`
2. **Package Manager**: `npm`
3. **React Native Environment**:
   - **Android Development**: Android Studio, Android SDK, and Java JDK 17+ installed.
   - **iOS Development (macOS only)**: Xcode and CocoaPods installed.

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository_url>
cd la-pinoz-pizza-us
```

### 2. Install Dependencies
```bash
npm install
```

### 3. iOS Setup (Mac Only)
Install the required CocoaPods for iOS compilation:
```bash
cd ios
pod install
cd ..
```

### 4. Environment Variables
Create a `.env` file in the root directory. Consult with the DevOps/Lead team to get the proper keys for your environment. Expected keys include:
- `API_BASE_URL` (e.g., local server or production endpoint)
- *Any map or analytics API keys as required by services*

### 5. Running the Application

To start the Metro Bundler:
```bash
npm run start
```

**Run on Android:**
```bash
npm run android
```

**Run on iOS (Mac Only):**
```bash
npm run ios
```

## 🧪 Testing and Linting

Run the test suite using Jest:
```bash
npm run test
```

Run ESLint to check for code issues:
```bash
npm run lint
```

## 📦 Build & Release (Production)

### Android
To build a production AAB (Android App Bundle) for the Google Play Store:
1. Ensure the production keystore is placed in `android/app/`.
2. Update the `gradle.properties` with keystore passwords.
3. Run:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
The output will be found at `android/app/build/outputs/bundle/release/app-release.aab`.

### iOS
To build a production IPA for the Apple App Store:
1. Open `ios/frontend.xcworkspace` in Xcode.
2. Select the "Any iOS Device" target.
3. Go to `Product > Archive`.
4. Wait for the archive process to complete and distribute via the Xcode Organizer.

## 🤝 Contribution Guidelines
1. Do not push directly to the `main` or `production` branches.
2. Ensure you branch off `main` for any new feature (`feature/feature-name`) or bug fix (`bugfix/issue-description`).
3. Make sure all tests and linting pass before submitting a Pull Request.

---
*Maintained by the La Pino'z Pizza US Engineering Team.*
