# La Pino'z Pizza US - Mobile Application

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React Navigation](https://img.shields.io/badge/React_Navigation-8a2bba?style=for-the-badge&logo=react&logoColor=white)

A high-performance React Native application for **La Pino'z Pizza US**. This application allows users to discover local stores, view menus, manage their orders, track refunds, and manage their address and profile information. 

## 🍕 Key Features

- **Store Discovery & Geolocation**: Utilizes real-time geolocation to find the nearest La Pino'z Pizza stores.
- **SkyTab POS Redirection**: Seamless web redirection to external SkyTab Point-of-Sale links for placing orders per store.
- **Authentication System**: Secure Login and Signup flows managed via a robust Context API setup.
- **In-App WebView**: Integrated webviews for FAQ and Privacy Policy, removing the need for external browser redirects.
- **Order & Refund Tracking**: Dedicated screens (Track Order, Track Refund, Raise Concern) to seamlessly follow up on previous interactions.
- **Profile & Address Management**: Comprehensive user data management including adding new delivery locations, editing addresses, and updating profile info.
- **Skeleton Loaders**: Modern skeleton loading states (Home, Menu, Orders) for enhanced User Experience (UX).

## 🛠️ Technology Stack

- **Framework**: [React Native CLI](https://reactnative.dev/docs/environment-setup) (v0.83.1)
- **Language**: TypeScript
- **Navigation**: React Navigation v7 (Native Stack & Bottom Tabs)
- **State Management**: React Context API (`AuthProvider`, `StoreProvider`, `AddressProvider`)
- **Networking/API**: Axios & `apiClient` configurations
- **Styling**: Native StyleSheet & SafeArea support
- **Icons**: Lucide React Native / React Native Vector Icons
- **Testing**: Jest & React Test Renderer

## 📂 Project Structure

```
.
├── android/                   # Android native code
├── ios/                       # iOS native code
├── src/
│   ├── assets/                # Images, fonts, and static resources
│   ├── components/            # Reusable UI components & Skeletons
│   ├── context/               # Global Context Providers (Auth, Address, Store)
│   ├── navigation/            # Routers (AuthNavigator, TabNavigator)
│   ├── screens/               # Main application screens (Home, Profile, TrackRefund, etc.)
│   │   └── auth/              # Auth-specific screens (Login, Signup)
│   ├── services/              # API interaction layers (apiClient, authService, etc.)
│   ├── types/                 # TypeScript global interfaces & definitions
│   └── utils/                 # Helper functions & utility methods
├── App.tsx                    # Application entry point
└── package.json               # Dependencies and scripts definitions
```

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have the React Native CLI setup completed:
- **Node.js**: `v20` or higher
- **Package Manager**: `npm`
- **Android Studio** (for Android) or **Xcode** (for iOS, Requires MacOS)

### Installation

1. **Clone the repository and install dependencies:**
   ```sh
   # Install dependencies
   npm install
   ```

2. **iOS dependencies installation:**
   If you intend to run on iOS, remember to install CocoaPods dependencies:
   ```sh
   cd ios
   bundle install
   bundle exec pod install
   cd ..
   ```

## 🏃‍♂️ Running the Application

### 1. Start Metro Bundler
Start the Metro JavaScript build tool:
```sh
npm start
```

### 2. Run on Device/Simulator
Keep the Metro bundler running in its terminal and open a new terminal window to build the app for Android or iOS:

**For Android:**
```sh
npm run android
```

**For iOS:**
```sh
npm run ios
```

## ⚙️ Backend API Connection (Troubleshooting Localhost)

If you are encountering network errors connecting to a local backend API (e.g. running on `localhost:7100`) via a physical Android device, use `adb reverse` to bridge the connection:

```sh
adb reverse tcp:7100 tcp:7100
```
*Make sure your `apiClient.ts` base URL is appropriately pointing to `http://localhost:7100/api` or `http://10.0.2.2:7100/api` (for Android emulators).*

## 🧪 Testing

This project uses **Jest** alongside **React Test Renderer** for unit testing. Setup includes native module mocks configured in `jest.setup.js`.

To run the test suite:
```sh
npm test
```

## 📱 State & Data Flow Overview

The app's top-level state is defined in `App.tsx` through a robust provider hierarchy:

```tsx
<SafeAreaProvider>
  <AuthProvider>
    <StoreProvider>
      <AddressProvider>
        <NavigationContainer>
          <AuthNavigator />
        </NavigationContainer>
      </AddressProvider>
    </StoreProvider>
  </AuthProvider>
</SafeAreaProvider>
```

- **AuthProvider**: Manages Access/Refresh tokens securely, and maintains the current user's profile state.
- **StoreProvider**: Holds data about local stores, manages store context, and the SkyTab menu redirections.
- **AddressProvider**: Stores all user postal addresses, caching current active delivery locations.
