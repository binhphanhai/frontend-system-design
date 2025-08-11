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

```bash
# Install Node.js (LTS version recommended)
# Download from https://nodejs.org/

# Install React Native CLI
npm install -g @react-native-community/cli

# For iOS development (macOS only)
# Install Xcode from App Store
# Install CocoaPods
sudo gem install cocoapods

# For Android development
# Install Android Studio
# Set up Android SDK and emulator
```

### Creating Your First App

```bash
# Create a new React Native project
npx react-native init MyAwesomeApp

# Navigate to project directory
cd MyAwesomeApp

# Start Metro bundler
npx react-native start

# Run on iOS (macOS only)
npx react-native run-ios

# Run on Android
npx react-native run-android
```

### Basic Component Structure

```javascript
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";

const App = () => {
  const handlePress = () => {
    Alert.alert("Hello", "Welcome to React Native!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.body}>
          <Text style={styles.title}>My Awesome App</Text>
          <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>Press Me</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  body: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default App;
```

## React Native Architecture Deep Dive

### Thread Architecture

React Native operates on multiple threads to ensure smooth performance:

```
┌─────────────────────────────────────────────────────────┐
│                  React Native App                       │
├─────────────────────────────────────────────────────────┤
│  JavaScript Thread          │    Native Thread         │
│  ├─── React Components      │    ├─── UI Components    │
│  ├─── Business Logic        │    ├─── Native APIs      │
│  ├─── State Management      │    ├─── Platform APIs    │
│  └─── Event Handling        │    └─── Hardware APIs    │
├─────────────────────────────────────────────────────────┤
│                    Bridge Layer                         │
│  ├─── Message Serialization                            │
│  ├─── Async Communication                              │
│  └─── Batched Updates                                  │
├─────────────────────────────────────────────────────────┤
│            Native Platform Layer                       │
│  ├─── iOS (Objective-C/Swift)                         │
│  └─── Android (Java/Kotlin)                           │
└─────────────────────────────────────────────────────────┘
```

### JavaScript Engine Integration

#### Hermes JavaScript Engine

```javascript
// Hermes optimizations can be verified
const isHermesEnabled = !!global.HermesInternal;
console.log("Hermes enabled:", isHermesEnabled);

// Hermes provides specific APIs
if (global.HermesInternal) {
  // Access Hermes-specific functionality
  const hermesVersion =
    global.HermesInternal.getRuntimeProperties()["OSS Release Version"];
  console.log("Hermes version:", hermesVersion);
}
```

#### Engine Configuration (android/app/build.gradle)

```gradle
project.ext.react = [
    enableHermes: true,  // Enable Hermes JS engine
    hermesCommand: "../../node_modules/hermes-engine/%OS-BIN%/hermes",
    bundleInDebug: false,
    bundleInRelease: true,
]
```

## The Bridge System

### Legacy Bridge Architecture

The React Native bridge is responsible for communication between JavaScript and native code:

```javascript
// Bridge communication example
import { NativeModules } from "react-native";

// Accessing native module through bridge
const { CalendarModule } = NativeModules;

// Asynchronous bridge call
CalendarModule.createCalendarEvent("Party", "My House")
  .then((eventId) => {
    console.log("Event created with ID:", eventId);
  })
  .catch((error) => {
    console.error("Failed to create event:", error);
  });
```

### Bridge Message Flow

```javascript
// JavaScript side - sending message to native
const sendBridgeMessage = (module, method, args) => {
  // 1. Message is serialized to JSON
  const message = JSON.stringify({
    module,
    method,
    args,
    callId: Math.random(),
  });

  // 2. Message is queued for batch processing
  MessageQueue.enqueueNativeCall(message);

  // 3. Bridge flushes messages asynchronously
  Bridge.flushQueue();
};

// Native side receives and processes messages
// Platform-specific implementation handles deserialization
// and method invocation on native modules
```

### Bridge Performance Considerations

```javascript
// ❌ Avoid frequent bridge calls
setInterval(() => {
  NativeModules.LocationManager.getCurrentPosition(); // Called every 100ms
}, 100);

// ✅ Batch operations and use efficient patterns
const batchOperations = async () => {
  const operations = [
    NativeModules.DatabaseManager.getUser(1),
    NativeModules.DatabaseManager.getUser(2),
    NativeModules.DatabaseManager.getUser(3),
  ];

  const results = await Promise.all(operations);
  return results;
};
```

## Build Process: From JavaScript to Native Apps

### Metro Bundler

Metro is React Native's JavaScript bundler that transforms and bundles your code:

```javascript
// metro.config.js
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true, // Optimize require() calls
      },
    }),
  },
  resolver: {
    alias: {
      "@components": "./src/components",
      "@utils": "./src/utils",
    },
  },
  serializer: {
    createModuleIdFactory: function () {
      return function (path) {
        // Custom module ID generation for better caching
        return path.substr(1).replace(/\//g, "_");
      };
    },
  },
};
```

### iOS Build Process

#### Xcode Integration

```bash
# iOS build process steps
cd ios

# 1. Install CocoaPods dependencies
pod install

# 2. Build for device/simulator
xcodebuild -workspace MyApp.xcworkspace \
  -scheme MyApp \
  -configuration Release \
  -destination 'platform=iOS Simulator,name=iPhone 14' \
  build

# 3. Archive for App Store
xcodebuild -workspace MyApp.xcworkspace \
  -scheme MyApp \
  -configuration Release \
  archive \
  -archivePath MyApp.xcarchive
```

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

### Setting Up Push Notifications

#### Install Dependencies

```bash
# Install push notification library
npm install @react-native-async-storage/async-storage
npm install @react-native-firebase/app @react-native-firebase/messaging

# For iOS
cd ios && pod install
```

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
