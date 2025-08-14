# React Native: Under the Hood

## Table of Contents

- [Introduction](#introduction)
- [Getting Started with React Native](#getting-started-with-react-native)
- [React Native Architecture Deep Dive](#react-native-architecture-deep-dive)
- [The Bridge System](#the-bridge-system)
- [Build Process: From JavaScript to Native Apps](#build-process-from-javascript-to-native-apps)
- [Native Modules and Platform Integration](#native-modules-and-platform-integration)
- [Push Notifications Implementation](#push-notifications-implementation)
- [The New Architecture: Fabric and TurboModules](#the-new-architecture-fabric-and-turbomodules)
- [Performance Optimization Strategies](#performance-optimization-strategies)
- [Real-World Implementation Examples](#real-world-implementation-examples)
- [Debugging and Development Tools](#debugging-and-development-tools)
- [Best Practices and Common Pitfalls](#best-practices-and-common-pitfalls)
- [Conclusion](#conclusion)

## Introduction

React Native is a powerful framework developed by [Meta (Facebook)](https://github.com/facebook/react-native) that enables developers to build native mobile applications using JavaScript and React. Unlike hybrid frameworks that run in a WebView, React Native compiles to actual native components, providing near-native performance while maintaining the development velocity of web technologies.

### Key Advantages

- **Write Once, Run Anywhere**: Share code between iOS and Android platforms
- **Native Performance**: Direct compilation to native components
- **Fast Development Cycle**: Hot reloading and live reload capabilities
- **Large Ecosystem**: Extensive library and community support
- **Native API Access**: Full access to platform-specific APIs

## Getting Started with React Native

### Environment Setup

Setting up your React Native development environment is crucial for a smooth development experience. This process varies depending on your target platform and operating system.

**What this setup accomplishes:**

- Installs the React Native CLI for project management
- Sets up iOS development tools (macOS only)
- Configures Android development environment
- Prepares device simulators/emulators

**Prerequisites:** Node.js (LTS version), Git, and platform-specific tools

```bash
# Step 1: Install Node.js (LTS version recommended)
# Download from https://nodejs.org/
# This provides the JavaScript runtime and npm package manager

# Step 2: Install React Native CLI globally
# This tool helps create, build, and manage React Native projects
npm install -g @react-native-community/cli

# Step 3: iOS development setup (macOS only)
# Install Xcode from App Store (required for iOS compilation)
# Install CocoaPods (dependency manager for iOS projects)
sudo gem install cocoapods

# Step 4: Android development setup
# Install Android Studio from https://developer.android.com/studio
# Set up Android SDK through Android Studio SDK Manager
# Create virtual device (AVD) for testing
```

**Expected outcome:** A fully configured development environment capable of building and running React Native apps on iOS and/or Android platforms.

### Creating Your First App

This section demonstrates how to create, initialize, and run your first React Native application. The process involves setting up the project structure, starting the development server, and launching the app on your chosen platform.

**What this process does:**

- Creates a new React Native project with all necessary files and dependencies
- Initializes the Metro bundler (JavaScript packager)
- Builds and deploys the app to iOS Simulator or Android Emulator

**Input:** Project name and target platform
**Output:** A running React Native app on your device/simulator

```bash
# Step 1: Create a new React Native project
# This command scaffolds a complete project structure with:
# - JavaScript/TypeScript source files
# - Native iOS and Android project files
# - Package.json with required dependencies
# - Configuration files for Metro bundler
npx react-native init MyAwesomeApp

# Step 2: Navigate to project directory
cd MyAwesomeApp

# Step 3: Start Metro bundler (JavaScript packager)
# Metro compiles JavaScript code and serves it to the app
# Keep this terminal window open during development
npx react-native start

# Step 4: Run on iOS (macOS only)
# This command:
# - Builds the iOS project using Xcode
# - Installs the app on iOS Simulator
# - Connects the app to Metro bundler for hot reloading
npx react-native run-ios

# Alternative: Run on Android
# This command:
# - Builds the Android project using Gradle
# - Installs the app on Android Emulator or connected device
# - Enables hot reloading for development
npx react-native run-android
```

**Expected result:** Your app should launch on the simulator/emulator displaying the default React Native welcome screen with hot reloading enabled for development.

### Basic Component Structure

This example demonstrates the fundamental structure of a React Native application, showcasing essential components and styling patterns. Understanding this structure is crucial for building any React Native app.

**What this component demonstrates:**

- Import statements for core React Native components
- Functional component with hooks
- Event handling and user interaction
- StyleSheet usage for component styling
- Safe area handling for different device screens

**Key components used:**

- `SafeAreaView`: Ensures content doesn't overlap with system UI
- `ScrollView`: Provides scrollable content area
- `TouchableOpacity`: Creates touchable button with opacity feedback
- `StatusBar`: Controls the app's status bar appearance

**Input:** User touch interaction
**Output:** Visual feedback and alert dialog

```javascript
// Import React and essential React Native components
import React from "react";
import {
  SafeAreaView, // Renders content within safe area boundaries
  ScrollView, // Provides scrollable container for content
  StatusBar, // Controls status bar appearance
  StyleSheet, // Creates optimized style objects
  Text, // Displays text content
  View, // Basic container component
  TouchableOpacity, // Touchable component with opacity feedback
  Alert, // Shows native alert dialogs
} from "react-native";

const App = () => {
  // Event handler function for button press
  // Shows a native alert dialog when called
  const handlePress = () => {
    Alert.alert("Hello", "Welcome to React Native!");
  };

  return (
    // SafeAreaView ensures content doesn't overlap with notches/status bars
    <SafeAreaView style={styles.container}>
      {/* StatusBar configuration for iOS/Android */}
      <StatusBar barStyle="dark-content" />

      {/* ScrollView allows content to be scrollable if it exceeds screen height */}
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {/* Main content container */}
        <View style={styles.body}>
          {/* App title text */}
          <Text style={styles.title}>My Awesome App</Text>

          {/* Interactive button with touch feedback */}
          <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>Press Me</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// StyleSheet creates optimized style objects
// Styles are similar to CSS but use camelCase property names
const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes full available height
    backgroundColor: "#f5f5f5", // Light gray background
  },
  body: {
    padding: 20, // 20 units padding on all sides
    alignItems: "center", // Center content horizontally
  },
  title: {
    fontSize: 24, // Large text size
    fontWeight: "bold", // Bold font weight
    marginBottom: 20, // Space below title
    color: "#333", // Dark gray text color
  },
  button: {
    backgroundColor: "#007AFF", // iOS blue background
    paddingHorizontal: 20, // Horizontal padding
    paddingVertical: 10, // Vertical padding
    borderRadius: 8, // Rounded corners
  },
  buttonText: {
    color: "white", // White text color
    fontSize: 16, // Medium text size
    fontWeight: "600", // Semi-bold font weight
  },
});

// Export component as default export
export default App;
```

## React Native Architecture Deep Dive

### Thread Architecture

React Native's multi-threaded architecture is designed to maintain 60 FPS performance by separating JavaScript execution from UI rendering. Understanding this architecture is crucial for optimizing app performance and debugging issues.

**Why multiple threads matter:**

- Prevents JavaScript execution from blocking UI updates
- Enables smooth animations and user interactions
- Allows background processing without affecting the main thread
- Provides better resource utilization on multi-core devices

**Thread responsibilities:**

- **JavaScript Thread**: Handles React components, business logic, and state management
- **Native Thread**: Manages UI rendering, native API calls, and hardware interactions
- **Bridge Layer**: Facilitates communication between JavaScript and native code

**Performance implications:**

- Heavy JavaScript operations can block the JS thread
- UI animations run on the native thread for smooth performance
- Bridge communication has overhead that should be minimized

```
┌─────────────────────────────────────────────────────────┐
│                  React Native App                       │
├─────────────────────────────────────────────────────────┤
│  JavaScript Thread          │    Native Thread         │
│  ├─── React Components      │    ├─── UI Components    │
│  │     • Component rendering │    │     • View rendering│
│  │     • Props/state updates │    │     • Layout calc   │
│  ├─── Business Logic        │    ├─── Native APIs      │
│  │     • App logic          │    │     • Camera, GPS    │
│  │     • Data processing    │    │     • File system    │
│  ├─── State Management      │    ├─── Platform APIs    │
│  │     • Redux/Context      │    │     • Notifications  │
│  │     • Local storage      │    │     • Background tasks│
│  └─── Event Handling        │    └─── Hardware APIs    │
│       • Touch events        │         • Sensors        │
│       • Navigation          │         • Device info    │
├─────────────────────────────────────────────────────────┤
│                    Bridge Layer                         │
│  ├─── Message Serialization                            │
│  │     • JSON conversion of data                       │
│  ├─── Async Communication                              │
│  │     • Non-blocking message passing                 │
│  └─── Batched Updates                                  │
│       • Grouped operations for efficiency              │
├─────────────────────────────────────────────────────────┤
│            Native Platform Layer                       │
│  ├─── iOS (Objective-C/Swift)                         │
│  │     • UIKit framework integration                  │
│  └─── Android (Java/Kotlin)                           │
│       • Android View system integration               │
└─────────────────────────────────────────────────────────┘
```

### JavaScript Engine Integration

The JavaScript engine is the runtime environment that executes your React Native app's JavaScript code. React Native supports multiple engines, with Hermes being the preferred choice for its performance optimizations.

#### Hermes JavaScript Engine

Hermes is Meta's open-source JavaScript engine optimized for React Native. It provides significant performance improvements, especially for app startup time and memory usage.

**Hermes benefits:**

- Faster app startup time (50-70% improvement)
- Reduced memory footprint
- Smaller app bundle size
- Better performance on lower-end devices
- Ahead-of-time (AOT) compilation

**How to detect and use Hermes features:**

```javascript
// Check if Hermes is enabled in your app
// This is useful for conditional logic or debugging
const isHermesEnabled = !!global.HermesInternal;
console.log("Hermes enabled:", isHermesEnabled);

// Access Hermes-specific functionality when available
if (global.HermesInternal) {
  // Get runtime information and version details
  // Useful for debugging and performance monitoring
  const hermesVersion =
    global.HermesInternal.getRuntimeProperties()["OSS Release Version"];
  console.log("Hermes version:", hermesVersion);

  // Access additional Hermes runtime properties
  const runtimeProps = global.HermesInternal.getRuntimeProperties();
  console.log("Build type:", runtimeProps["Build"]);
  console.log("Bytecode version:", runtimeProps["Bytecode Version"]);
}
```

**Expected output:**

- If Hermes is enabled: "Hermes enabled: true" and version information
- If using JSC: "Hermes enabled: false"

#### Engine Configuration (android/app/build.gradle)

This configuration enables Hermes for Android builds. The settings control when Hermes is used and how it compiles your JavaScript code.

**Configuration parameters:**

- `enableHermes`: Toggles Hermes engine on/off
- `hermesCommand`: Path to Hermes compiler binary
- `bundleInDebug`: Whether to create bundles for debug builds
- `bundleInRelease`: Whether to create bundles for release builds

```gradle
// Android Hermes configuration
// Add this to android/app/build.gradle
project.ext.react = [
    enableHermes: true,  // Enable Hermes JS engine for better performance
    // Path to Hermes compiler - automatically resolves to correct binary
    hermesCommand: "../../node_modules/hermes-engine/%OS-BIN%/hermes",
    bundleInDebug: false,  // Skip bundling in debug (faster dev builds)
    bundleInRelease: true, // Always bundle for release (optimized)
]
```

**For iOS**, Hermes is enabled by default in React Native 0.70+. To manually configure:

```ruby
# ios/Podfile
use_react_native!(
  :path => config[:reactNativePath],
  :hermes_enabled => flags[:hermes_enabled]
)
```

## The Bridge System

The bridge system is React Native's core communication mechanism between JavaScript and native code. While being replaced by the new architecture (JSI), understanding the bridge is essential for working with existing apps and third-party libraries.

### Legacy Bridge Architecture

The React Native bridge enables asynchronous, serialized communication between the JavaScript thread and native platforms. All data must be JSON-serializable, and communication is batched for performance.

**Bridge characteristics:**

- **Asynchronous**: All communication is non-blocking
- **Serialized**: Data converted to JSON strings for transfer
- **Batched**: Multiple operations grouped together
- **One-way**: No direct return values, uses callbacks/promises

**When to use the bridge:**

- Accessing platform-specific APIs
- Integrating existing native libraries
- Performing computationally intensive operations
- Hardware access (camera, sensors, GPS)

**Communication flow:**

1. JavaScript calls native module method
2. Arguments serialized to JSON
3. Message queued for batch transfer
4. Native side deserializes and executes
5. Result serialized and sent back to JavaScript

```javascript
// Bridge communication example demonstrating async native module calls
import { NativeModules } from "react-native";

// Access the native calendar module through the bridge
// All native modules are available through NativeModules object
const { CalendarModule } = NativeModules;

// Asynchronous bridge call - all bridge calls return promises
// Input: Event title and location (must be JSON-serializable)
// Output: Promise resolving to event ID or rejecting with error
CalendarModule.createCalendarEvent("Party", "My House")
  .then((eventId) => {
    // Success callback - event was created successfully
    console.log("Event created with ID:", eventId);
    // You can now use this eventId for further operations
  })
  .catch((error) => {
    // Error callback - something went wrong on native side
    console.error("Failed to create event:", error);
    // Handle error appropriately (show user message, retry, etc.)
  });

// Example with multiple parameters and error handling
const createAdvancedEvent = async () => {
  try {
    const eventData = {
      title: "Team Meeting",
      location: "Conference Room A",
      startDate: new Date().toISOString(),
      duration: 3600, // 1 hour in seconds
      attendees: ["john@company.com", "jane@company.com"],
    };

    // Note: Complex objects need to be JSON-serializable
    const eventId = await CalendarModule.createAdvancedEvent(eventData);
    return eventId;
  } catch (error) {
    console.error("Advanced event creation failed:", error);
    throw error;
  }
};
```

### Bridge Message Flow

This section demonstrates how messages flow through the React Native bridge system. Understanding this flow helps optimize performance and debug communication issues.

**Message flow process:**

1. JavaScript initiates native call
2. Arguments serialized to JSON format
3. Message queued in JavaScript message queue
4. Bridge batches and transfers messages
5. Native side deserializes and processes
6. Results sent back through the same process

**Performance considerations:**

- Messages are batched to reduce overhead
- Large objects can cause serialization delays
- Frequent bridge calls can impact performance
- Use bridge calls judiciously, not in tight loops

```javascript
// JavaScript side - demonstrates internal bridge message handling
// Note: This is simplified pseudo-code showing internal bridge mechanics
const sendBridgeMessage = (module, method, args) => {
  // Step 1: Message is serialized to JSON
  // All arguments must be JSON-serializable (strings, numbers, objects, arrays)
  // Functions, class instances, and undefined values are not supported
  const message = JSON.stringify({
    module, // Name of the native module (e.g., "CalendarModule")
    method, // Method name to call (e.g., "createEvent")
    args, // Array of arguments to pass to the method
    callId: Math.random(), // Unique identifier for tracking this call
  });

  // Step 2: Message is queued for batch processing
  // React Native batches multiple calls together for efficiency
  // This prevents overwhelming the bridge with individual messages
  MessageQueue.enqueueNativeCall(message);

  // Step 3: Bridge flushes messages asynchronously
  // Messages are sent in batches during the next run loop
  // This happens automatically but can be triggered manually
  Bridge.flushQueue();
};

// Example of problematic bridge usage (avoid this pattern)
const inefficientBridgeUsage = () => {
  // ❌ Bad: Multiple individual bridge calls in a loop
  for (let i = 0; i < 100; i++) {
    NativeModules.DataModule.processItem(i);
  }
};

// Example of optimized bridge usage
const efficientBridgeUsage = () => {
  // ✅ Good: Single bridge call with batched data
  const items = Array.from({ length: 100 }, (_, i) => i);
  NativeModules.DataModule.processBatch(items);
};

// Native side receives and processes messages (conceptual flow)
// Platform-specific implementation handles:
// 1. Message deserialization from JSON
// 2. Module lookup and method resolution
// 3. Argument validation and type conversion
// 4. Method invocation on native modules
// 5. Result serialization and return to JavaScript
```

### Bridge Performance Considerations

Bridge communication has inherent overhead due to serialization, batching, and thread switching. Following performance best practices ensures your app maintains smooth performance.

**Performance bottlenecks:**

- JSON serialization/deserialization overhead
- Thread context switching delays
- Large object transfer costs
- Frequent small operations

**Optimization strategies:**

- Batch multiple operations together
- Minimize bridge call frequency
- Use native modules for heavy computations
- Cache results when possible
- Use event emitters for real-time updates

```javascript
// ❌ Avoid frequent bridge calls - causes performance issues
const inefficientLocationTracking = () => {
  // This creates excessive bridge traffic and battery drain
  setInterval(() => {
    // Called every 100ms = 10 calls per second
    NativeModules.LocationManager.getCurrentPosition();
  }, 100);
};

// ✅ Batch operations and use efficient patterns
const batchOperations = async () => {
  // Group multiple database operations into a single bridge call
  // This reduces overhead and improves performance
  const operations = [
    NativeModules.DatabaseManager.getUser(1),
    NativeModules.DatabaseManager.getUser(2),
    NativeModules.DatabaseManager.getUser(3),
  ];

  // Execute all operations concurrently
  // Results arrive together, reducing bridge round-trips
  const results = await Promise.all(operations);
  return results;
};

// ✅ Better: Use event emitters for real-time data
const efficientLocationTracking = () => {
  // Set up location tracking once
  NativeModules.LocationManager.startLocationTracking({
    interval: 1000, // 1 second intervals
    accuracy: "high",
  });

  // Listen for location updates via events (no bridge calls)
  const subscription = NativeEventEmitter.addListener(
    "LocationUpdate",
    (location) => {
      console.log("New location:", location);
      // Update UI with new location data
    }
  );

  // Clean up when done
  return () => {
    NativeModules.LocationManager.stopLocationTracking();
    subscription.remove();
  };
};

// ✅ Cache expensive operations
class BridgeCache {
  constructor() {
    this.cache = new Map();
  }

  async getDataWithCache(key) {
    // Check cache first to avoid unnecessary bridge calls
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Only make bridge call if data not in cache
    const data = await NativeModules.DataManager.getData(key);
    this.cache.set(key, data);
    return data;
  }
}
```

## Build Process: From JavaScript to Native Apps

The React Native build process transforms your JavaScript code into native mobile applications. This complex process involves multiple tools and steps that compile, bundle, and package your code for deployment.

### Metro Bundler

Metro is React Native's JavaScript bundler, similar to Webpack for web applications. It handles module resolution, code transformation, and bundle creation for both development and production builds.

**Metro's responsibilities:**

- Transforms modern JavaScript (ES6+, JSX) to compatible code
- Resolves module dependencies and creates dependency graph
- Bundles JavaScript files into single or multiple bundles
- Provides hot reloading and fast refresh for development
- Optimizes code for production builds

**Configuration benefits:**

- Custom module resolution for cleaner imports
- Performance optimizations for faster builds
- Asset handling and transformation
- Code splitting and lazy loading support

**Metro workflow:**

1. Reads entry point (usually index.js)
2. Resolves all dependencies recursively
3. Transforms each file (TypeScript, JSX, etc.)
4. Creates bundle with all modules
5. Serves bundle to React Native app

```javascript
// metro.config.js - Comprehensive Metro configuration
module.exports = {
  // Transformer configuration - how files are processed
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false, // Disable experimental features for stability
        inlineRequires: true, // Inline require() calls for better performance
      },
    }),
    // Enable additional file types
    babelTransformerPath: require.resolve(
      "metro-react-native-babel-transformer"
    ),
    assetPlugins: ["metro-asset-plugin"], // Custom asset processing
  },

  // Resolver configuration - how modules are found
  resolver: {
    // Create path aliases for cleaner imports
    // Instead of: import Button from '../../../components/Button'
    // Use: import Button from '@components/Button'
    alias: {
      "@components": "./src/components",
      "@utils": "./src/utils",
      "@screens": "./src/screens",
      "@assets": "./src/assets",
    },
    // File extensions to resolve
    sourceExts: ["js", "json", "ts", "tsx", "jsx"],
    // Asset file extensions
    assetExts: ["png", "jpg", "jpeg", "gif", "svg", "mp4", "webm"],
  },

  // Serializer configuration - how bundles are created
  serializer: {
    createModuleIdFactory: function () {
      return function (path) {
        // Custom module ID generation for better caching
        // Creates consistent IDs across builds for better caching
        return path.substr(1).replace(/\//g, "_");
      };
    },
    // Customize what gets included in the bundle
    processModuleFilter: function (module) {
      // Exclude test files and development dependencies from production bundle
      return (
        !module.path.includes("__tests__") &&
        !module.path.includes("node_modules/@testing-library")
      );
    },
  },

  // Watcher configuration for development
  watchFolders: [
    // Watch additional folders for changes during development
    path.resolve(__dirname, "shared"), // Shared code between projects
  ],
};
```

**Expected outcome:** Optimized JavaScript bundle ready for deployment, with faster builds and better development experience.

### iOS Build Process

The iOS build process transforms your React Native app into a native iOS application. This involves several steps from dependency management to final app packaging for the App Store.

#### Xcode Integration

The iOS build process leverages Xcode's build system and CocoaPods for dependency management. Understanding these steps helps troubleshoot build issues and optimize build times.

**Build process overview:**

1. Install native dependencies via CocoaPods
2. Compile native code and React Native framework
3. Bundle JavaScript code via Metro
4. Link everything into final iOS app
5. Code sign for distribution

**Common build configurations:**

- **Debug**: Faster builds, includes debugging symbols, connects to Metro
- **Release**: Optimized builds, minified JavaScript, ready for distribution

**Build outputs:**

- `.app` file for simulator/device testing
- `.xcarchive` for App Store submission
- `.ipa` file for distribution

```bash
# iOS build process steps with detailed explanations

# Step 1: Navigate to iOS project directory
cd ios

# Step 2: Install CocoaPods dependencies
# CocoaPods manages native iOS dependencies (similar to npm for JavaScript)
# This creates .xcworkspace file that includes all dependencies
pod install

# Alternative: Clean install if dependencies are corrupted
# pod deintegrate  # Remove existing integration
# pod install     # Fresh installation

# Step 3: Build for device/simulator (development/testing)
# This builds the app without archiving, useful for testing
xcodebuild -workspace MyApp.xcworkspace \
  -scheme MyApp \                                    # Build scheme to use
  -configuration Release \                           # Release or Debug configuration
  -destination 'platform=iOS Simulator,name=iPhone 14' \  # Target device
  build

# Alternative destinations:
# -destination 'platform=iOS,name=Your Device Name'  # Physical device
# -destination 'generic/platform=iOS'                # Generic iOS device

# Step 4: Archive for App Store submission
# Creates .xcarchive file needed for App Store Connect upload
xcodebuild -workspace MyApp.xcworkspace \
  -scheme MyApp \
  -configuration Release \                           # Always use Release for App Store
  archive \
  -archivePath MyApp.xcarchive                      # Output archive path

# Step 5: Export IPA for distribution (additional step)
# xcodebuild -exportArchive \
#   -archivePath MyApp.xcarchive \
#   -exportPath ./build \
#   -exportOptionsPlist exportOptions.plist

# Common troubleshooting commands:
# xcodebuild clean                                  # Clean build artifacts
# pod repo update                                   # Update CocoaPods specs
# rm -rf node_modules && npm install               # Reset JavaScript dependencies
```

**Expected results:**

- Successful build: App ready for testing or distribution
- Build artifacts: `.app`, `.xcarchive`, or `.ipa` files created
- Any build errors displayed with file/line information

#### iOS Native Bridge Setup (AppDelegate.m)

```objective-c
#import "AppDelegate.h"
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self
                                             launchOptions:launchOptions];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"MyApp"
                                            initialProperties:nil];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
```

### Android Build Process

#### Gradle Build Configuration

```gradle
// android/app/build.gradle
android {
    compileSdkVersion rootProject.ext.compileSdkVersion

    defaultConfig {
        applicationId "com.myapp"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Enable code shrinking and obfuscation
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            signingConfig signingConfigs.release
        }
    }
}

// Bundle React Native code and images
apply from: "../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"
applyNativeModulesAppBuildGradle(project)
```

#### Android Native Bridge Setup (MainApplication.java)

```java
package com.myapp;

import android.app.Application;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          // Add your custom native modules here
          new CustomNativePackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
```

## Native Modules and Platform Integration

### Creating iOS Native Modules

#### CalendarManager.h

```objective-c
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface CalendarManager : RCTEventEmitter <RCTBridgeModule>
@end
```

#### CalendarManager.m

```objective-c
#import "CalendarManager.h"
#import <EventKit/EventKit.h>

@implementation CalendarManager

// Export module to React Native
RCT_EXPORT_MODULE();

// Export method to JavaScript
RCT_EXPORT_METHOD(createEvent:(NSString *)title
                  location:(NSString *)location
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  EKEventStore *eventStore = [[EKEventStore alloc] init];

  [eventStore requestAccessToEntityType:EKEntityTypeEvent
                             completion:^(BOOL granted, NSError *error) {
    if (granted) {
      EKEvent *event = [EKEvent eventWithEventStore:eventStore];
      event.title = title;
      event.location = location;
      event.startDate = [NSDate date];
      event.endDate = [event.startDate dateByAddingTimeInterval:3600]; // 1 hour
      event.calendar = [eventStore defaultCalendarForNewEvents];

      NSError *saveError = nil;
      BOOL success = [eventStore saveEvent:event span:EKSpanThisEvent error:&saveError];

      if (success) {
        resolve(event.eventIdentifier);
      } else {
        reject(@"event_failure", @"Failed to save event", saveError);
      }
    } else {
      reject(@"permission_denied", @"Calendar access denied", error);
    }
  }];
}

// Export constants to JavaScript
- (NSDictionary *)constantsToExport
{
  return @{
    @"DEFAULT_EVENT_NAME": @"New Event",
    @"EVENT_DURATION": @3600
  };
}

// Required for event emitter
- (NSArray<NSString *> *)supportedEvents
{
  return @[@"EventCreated", @"EventDeleted"];
}

@end
```

### Creating Android Native Modules

#### CalendarModule.java

```java
package com.myapp.modules;

import android.provider.CalendarContract;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

public class CalendarModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "CalendarModule";
    private ReactApplicationContext reactContext;

    public CalendarModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("DEFAULT_EVENT_NAME", "New Event");
        constants.put("EVENT_DURATION", 3600000); // 1 hour in milliseconds
        return constants;
    }

    @ReactMethod
    public void createEvent(String title, String location, Promise promise) {
        try {
            ContentResolver contentResolver = reactContext.getContentResolver();
            ContentValues values = new ContentValues();

            values.put(CalendarContract.Events.TITLE, title);
            values.put(CalendarContract.Events.DESCRIPTION, "Created by React Native app");
            values.put(CalendarContract.Events.EVENT_LOCATION, location);
            values.put(CalendarContract.Events.DTSTART, System.currentTimeMillis());
            values.put(CalendarContract.Events.DTEND, System.currentTimeMillis() + 3600000);
            values.put(CalendarContract.Events.CALENDAR_ID, 1);
            values.put(CalendarContract.Events.EVENT_TIMEZONE, "UTC");

            Uri uri = contentResolver.insert(CalendarContract.Events.CONTENT_URI, values);

            if (uri != null) {
                String eventId = uri.getLastPathSegment();

                // Emit event to JavaScript
                WritableMap params = Arguments.createMap();
                params.putString("eventId", eventId);
                params.putString("title", title);

                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("EventCreated", params);

                promise.resolve(eventId);
            } else {
                promise.reject("CREATE_EVENT_ERROR", "Failed to create event");
            }
        } catch (Exception e) {
            promise.reject("CREATE_EVENT_ERROR", e.getMessage(), e);
        }
    }
}
```

### JavaScript Usage of Native Modules

```javascript
import { NativeModules, NativeEventEmitter } from "react-native";

const { CalendarModule } = NativeModules;

// Create event listener for native events
const calendarEventEmitter = new NativeEventEmitter(CalendarModule);

class CalendarService {
  constructor() {
    // Listen for events from native module
    this.eventSubscription = calendarEventEmitter.addListener(
      "EventCreated",
      this.handleEventCreated.bind(this)
    );
  }

  handleEventCreated = (event) => {
    console.log("Event created:", event);
    // Update UI or state based on native event
  };

  createEvent = async (title, location) => {
    try {
      const eventId = await CalendarModule.createEvent(title, location);
      console.log("Event created with ID:", eventId);
      return eventId;
    } catch (error) {
      console.error("Failed to create event:", error);
      throw error;
    }
  };

  getConstants = () => {
    return CalendarModule.getConstants();
  };

  cleanup = () => {
    if (this.eventSubscription) {
      this.eventSubscription.remove();
    }
  };
}

export default CalendarService;
```

## Push Notifications Implementation

Push notifications are critical for user engagement, allowing your app to communicate with users even when the app is closed. React Native provides robust support for both local and remote notifications across iOS and Android platforms.

### Setting Up Push Notifications

Setting up push notifications involves multiple steps across different platforms and requires proper configuration of Firebase Cloud Messaging (FCM) for Android and Apple Push Notification service (APNs) for iOS.

#### Install Dependencies

**Purpose of each dependency:**

- `@react-native-firebase/app`: Core Firebase SDK for React Native
- `@react-native-firebase/messaging`: Firebase Cloud Messaging for push notifications
- `@react-native-async-storage/async-storage`: Local storage for FCM tokens

**Installation process:**

1. Install JavaScript packages
2. Configure native iOS dependencies via CocoaPods
3. Configure Android dependencies via Gradle
4. Set up Firebase project and download config files

```bash
# Step 1: Install push notification libraries
# AsyncStorage is needed to store FCM tokens locally
npm install @react-native-async-storage/async-storage

# Firebase packages for cross-platform push notifications
# @react-native-firebase/app is the core Firebase SDK
# @react-native-firebase/messaging handles FCM notifications
npm install @react-native-firebase/app @react-native-firebase/messaging

# Step 2: Install iOS native dependencies
# CocoaPods will install Firebase iOS SDK and configure Xcode project
cd ios && pod install

# Step 3: Download Firebase configuration files
# iOS: Download GoogleService-Info.plist from Firebase Console
# Android: Download google-services.json from Firebase Console
# Place these files in the respective platform directories

# Additional setup required:
# - Enable push notifications capability in Xcode
# - Configure Firebase project with your app bundle IDs
# - Generate APNs certificates/keys for iOS
```

**Expected outcome:** All dependencies installed and native projects configured for push notification support.

#### iOS Configuration

```objective-c
// AppDelegate.m - iOS push notification setup
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Request notification permissions
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge) completionHandler:^(BOOL granted, NSError * _Nullable error){
    if (granted) {
      dispatch_async(dispatch_get_main_queue(), ^{
        [[UIApplication sharedApplication] registerForRemoteNotifications];
      });
    }
  }];

  return YES;
}

// Handle registration for remote notifications
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// Handle notification received while app is in foreground
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}

@end
```

#### Android Configuration

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />

<application>
  <!-- Firebase messaging service -->
  <service
    android:name="io.invertase.firebase.messaging.RNFirebaseMessagingService"
    android:exported="false">
    <intent-filter>
      <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
  </service>

  <!-- Notification channel for Android 8.0+ -->
  <meta-data
    android:name="com.google.firebase.messaging.default_notification_channel_id"
    android:value="default_notification_channel" />
</application>
```

#### React Native Push Notification Implementation

```javascript
import messaging from "@react-native-firebase/messaging";
import { Platform, PermissionsAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

class PushNotificationService {
  constructor() {
    this.configure();
  }

  configure = async () => {
    // Request permission (iOS automatically shows prompt, Android needs manual request)
    await this.requestPermission();

    // Get FCM token
    const token = await this.getFCMToken();
    console.log("FCM Token:", token);

    // Save token to backend
    await this.saveTokenToBackend(token);

    // Listen for token refresh
    messaging().onTokenRefresh(this.onTokenRefresh);

    // Listen for foreground messages
    messaging().onMessage(this.onForegroundMessage);

    // Listen for background/quit state messages
    messaging().setBackgroundMessageHandler(this.onBackgroundMessage);

    // Handle notification that opened the app
    messaging().getInitialNotification().then(this.onNotificationOpenedApp);
    messaging().onNotificationOpenedApp(this.onNotificationOpenedApp);
  };

  requestPermission = async () => {
    if (Platform.OS === "ios") {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("iOS notification permission granted");
      }
    } else {
      // Android permission request
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: "Notification Permission",
            message: "This app needs access to show notifications",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Android notification permission granted");
        }
      } catch (err) {
        console.warn("Permission request error:", err);
      }
    }
  };

  getFCMToken = async () => {
    try {
      let token = await AsyncStorage.getItem("fcm_token");

      if (!token) {
        token = await messaging().getToken();
        await AsyncStorage.setItem("fcm_token", token);
      }

      return token;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  };

  saveTokenToBackend = async (token) => {
    try {
      // Send token to your backend server
      const response = await fetch("https://your-api.com/api/fcm-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer your-auth-token",
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log("Token saved to backend successfully");
      }
    } catch (error) {
      console.error("Failed to save token to backend:", error);
    }
  };

  onTokenRefresh = async (token) => {
    console.log("FCM token refreshed:", token);
    await AsyncStorage.setItem("fcm_token", token);
    await this.saveTokenToBackend(token);
  };

  onForegroundMessage = async (remoteMessage) => {
    console.log("Foreground message received:", remoteMessage);

    // Show local notification when app is in foreground
    this.showLocalNotification(remoteMessage);
  };

  onBackgroundMessage = async (remoteMessage) => {
    console.log("Background message received:", remoteMessage);

    // Handle background message processing
    // Note: Limited processing time in background
    return Promise.resolve();
  };

  onNotificationOpenedApp = (remoteMessage) => {
    if (remoteMessage) {
      console.log("Notification opened app:", remoteMessage);

      // Navigate to specific screen based on notification data
      this.handleNotificationNavigation(remoteMessage.data);
    }
  };

  showLocalNotification = (remoteMessage) => {
    // Platform-specific local notification display
    if (Platform.OS === "ios") {
      // Use iOS local notification
      const { title, body } = remoteMessage.notification || {};
      // Implement iOS local notification
    } else {
      // Use Android local notification
      // Implement Android local notification
    }
  };

  handleNotificationNavigation = (data) => {
    // Navigation logic based on notification data
    const { screen, params } = data || {};

    if (screen) {
      // Use your navigation library to navigate
      // NavigationService.navigate(screen, JSON.parse(params || '{}'));
    }
  };

  // Subscribe to topic
  subscribeToTopic = async (topic) => {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Failed to subscribe to topic ${topic}:`, error);
    }
  };

  // Unsubscribe from topic
  unsubscribeFromTopic = async (topic) => {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Failed to unsubscribe from topic ${topic}:`, error);
    }
  };
}

export default new PushNotificationService();
```

## The New Architecture: Fabric and TurboModules

### JavaScript Interface (JSI)

JSI enables direct, synchronous communication between JavaScript and native code:

```cpp
// Native C++ JSI module example
#include <jsi/jsi.h>

using namespace facebook;

class JSICalculator : public jsi::HostObject {
public:
  jsi::Value get(jsi::Runtime& runtime, const jsi::PropNameID& propName) override {
    auto name = propName.utf8(runtime);

    if (name == "add") {
      return jsi::Function::createFromHostFunction(
        runtime,
        jsi::PropNameID::forAscii(runtime, "add"),
        2,
        [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
          if (count != 2) {
            throw jsi::JSError(runtime, "add() requires exactly 2 arguments");
          }

          double a = arguments[0].asNumber();
          double b = arguments[1].asNumber();
          return jsi::Value(a + b);
        }
      );
    }

    return jsi::Value::undefined();
  }
};

// Install JSI module
void installJSICalculator(jsi::Runtime& runtime) {
  auto calculator = std::make_shared<JSICalculator>();
  runtime.global().setProperty(runtime, "JSICalculator", jsi::Object::createFromHostObject(runtime, calculator));
}
```

### TurboModules Implementation

```javascript
// TurboModule spec (NativeCalculator.js)
import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  add(a: number, b: number): number;
  addAsync(a: number, b: number): Promise<number>;
  getConstants(): {
    PI: number,
    E: number,
  };
}

export default TurboModuleRegistry.getEnforcing < Spec > "NativeCalculator";
```

### Fabric Renderer

```javascript
// Fabric component spec
import type { ViewProps } from "react-native";
import type { HostComponent } from "react-native";
import codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";

type NativeProps = $ReadOnly<{
  ...ViewProps,
  value: number,
  onValueChange?: (event: { nativeEvent: { value: number } }) => void,
}>;

export default codegenNativeComponent < NativeProps > "CustomSlider";
```

## Performance Optimization Strategies

### Bundle Size Optimization

```javascript
// metro.config.js - Bundle optimization
module.exports = {
  transformer: {
    minifierConfig: {
      keepClassNames: true, // Required for some libraries
      keepFnNames: true,
      mangle: {
        keep_fnames: true,
      },
    },
  },
  serializer: {
    // Enable bundle splitting
    createModuleIdFactory: () => (path) => {
      const hash = require("crypto").createHash("md5");
      hash.update(path);
      return hash.digest("hex").substr(0, 8);
    },
  },
};
```

### Memory Management

```javascript
// Proper cleanup in components
import { useEffect, useRef } from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';

const OptimizedComponent = () => {
  const timeoutRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // Set up event listeners
    subscriptionRef.current = DeviceEventEmitter.addListener(
      'memoryWarning',
      handleMemoryWarning
    );

    // Set up timers
    timeoutRef.current = setTimeout(() => {
      console.log('Timer executed');
    }, 5000);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  const handleMemoryWarning = () => {
    // Clear caches, reduce memory usage
    console.log('Memory warning received');
  };

  return (
    // Component JSX
  );
};
```

### Image Optimization

```javascript
import { Image } from "react-native";

// Optimized image usage
const OptimizedImageComponent = () => {
  return (
    <Image
      source={{ uri: "https://example.com/image.jpg" }}
      style={{ width: 200, height: 200 }}
      resizeMode="cover"
      // Enable native caching
      cache="force-cache"
      // Reduce memory usage for large images
      fadeDuration={300}
      // Optimize for performance
      loadingIndicatorSource={{ uri: "placeholder.jpg" }}
    />
  );
};
```

## Real-World Implementation Examples

### Navigation Setup with React Navigation

```javascript
// App.js - Navigation setup
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SettingsScreen from "./screens/SettingsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
```

### State Management with Redux Toolkit

```javascript
// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/userSlice";
import notificationSlice from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    notifications: notificationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Debugging and Development Tools

### Flipper Integration

```javascript
// Install Flipper for debugging
# iOS
cd ios && pod install

# Add to AppDelegate.m
#if DEBUG
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>

- (void)initializeFlipper:(UIApplication *)application {
  FlipperClient *client = [FlipperClient sharedClient];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] init]];
  [client start];
}
#endif
```

### Performance Monitoring

```javascript
// Performance monitoring setup
import perf from '@react-native-firebase/perf';

const performanceTrace = perf().newTrace('app_startup');

const App = () => {
  useEffect(() => {
    const initializeApp = async () => {
      performanceTrace.start();

      // App initialization logic
      await initializeServices();

      performanceTrace.stop();
    };

    initializeApp();
  }, []);

  return (
    // App components
  );
};
```

## Best Practices and Common Pitfalls

### Performance Best Practices

```javascript
// ✅ Use FlatList for large lists
import { FlatList } from "react-native";

const OptimizedList = ({ data }) => {
  const renderItem = useCallback(
    ({ item }) => <ItemComponent item={item} />,
    []
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
};

// ❌ Avoid ScrollView for large datasets
const IneffientList = ({ data }) => {
  return (
    <ScrollView>
      {data.map((item) => (
        <ItemComponent key={item.id} item={item} />
      ))}
    </ScrollView>
  );
};
```

### Memory Management

```javascript
// ✅ Proper cleanup and memoization
import { useMemo, useCallback, useEffect } from 'react';

const OptimizedComponent = ({ data, onPress }) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processedValue: expensiveCalculation(item.value)
    }));
  }, [data]);

  // Memoize callback functions
  const handlePress = useCallback((item) => {
    onPress(item);
  }, [onPress]);

  // Clean up side effects
  useEffect(() => {
    const timer = setInterval(() => {
      // Some periodic task
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    // Component render
  );
};
```

## Conclusion

React Native provides a powerful platform for building cross-platform mobile applications with near-native performance. Understanding its architecture—from the bridge system to the new JSI and Fabric implementations—enables developers to create efficient, maintainable applications.

### Key Takeaways

1. **Architecture Understanding**: The bridge system, while being replaced by JSI, remains crucial for understanding React Native's communication patterns.

2. **Native Integration**: Native modules provide unlimited access to platform APIs while maintaining cross-platform code sharing.

3. **Performance Optimization**: Proper use of components like FlatList, image optimization, and memory management are essential for production apps.

4. **Build Process Mastery**: Understanding Metro bundler, Xcode, and Gradle configurations helps optimize and troubleshoot builds.

5. **Future-Proofing**: The new architecture with Fabric and TurboModules represents the future of React Native development.

### Further Resources

- [React Native GitHub Repository](https://github.com/facebook/react-native)
- [React Native Documentation](https://reactnative.dev/)
- [React Native New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [Metro Bundler Documentation](https://facebook.github.io/metro/)
- [Flipper Debugging Tool](https://fbflipper.com/)

React Native continues to evolve, bridging the gap between web and mobile development while providing developers with the tools needed to build sophisticated, high-performance mobile applications.
