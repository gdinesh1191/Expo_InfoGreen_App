import store from "@/redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp } from "@react-native-firebase/app";
import { getMessaging, onMessage } from "@react-native-firebase/messaging";
import {
  CommonActions,
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from "@react-navigation/native";
import { ShareIntentProvider } from "expo-share-intent";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Text, TextInput, useColorScheme, View } from "react-native";
import { LogLevel, OneSignal } from "react-native-onesignal";
import "react-native-reanimated";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Provider, useSelector } from "react-redux";
import AuthStackNavigator from "./app/AuthStackNavigator";
import MainNavigator from "./app/MainNavigator";
import {
  ensureBatteryOptimizationExemption,
  ensureExactAlarmPermission,
  ensureOverlayPermission,
  listenReminderButtonAction,
  showReminder,
} from "./hooks/BackgroundReminder/ReminderModule";
import { submitReminderButtonAction } from "./hooks/BackgroundReminder/reminderButtonApi";
import { extractReminderFromFcmMessage } from "./hooks/BackgroundReminder/fcmReminderPayload";
// You can remove this if you don't need to wait for any assets
// SplashScreen.preventAutoHideAsync();

// Disable system font scaling globally to ensure consistent typography
// across devices; use scale utilities for predictable sizing
if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
(Text as any).defaultProps.allowFontScaling = false;
(Text as any).defaultProps.maxFontSizeMultiplier = 1;
if ((TextInput as any).defaultProps == null)
  (TextInput as any).defaultProps = {};
(TextInput as any).defaultProps.allowFontScaling = false;
(TextInput as any).defaultProps.maxFontSizeMultiplier = 1;

export default function RootLayout() {
  // const requestPermissions = async () => {
  //   await ensureOverlayPermission();
  //   await ensureExactAlarmPermission();
  //   await ensureNotificationPermission();
  // }
  // useEffect(() => {
  //   requestPermissions();
  // }, []);
  return (
    <Provider store={store}>
      <ShareIntentProvider>
        <SafeAreaProvider>
          <Root />
        </SafeAreaProvider>
      </ShareIntentProvider>
    </Provider>
  );
}

function Root() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const navigationRef = useRef<any>(null);
  const userData = useSelector((state: any) => state.user.userData);

  // useEffect(() => {
  //   OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  //   OneSignal.initialize("0e92107b-915a-41d3-9570-bb3d3430ab72");
  //   OneSignal.User.pushSubscription
  //     .getIdAsync()
  //     .then((subscriptionId: any) => {
  //       AsyncStorage.setItem("subscriptionId", subscriptionId);
  //     })
  //     .catch((error) => {
  //       console.log("Failed to get subscription ID:", error);
  //     });
  //   OneSignal.Notifications.addEventListener("click", (event: any) => {
  //     const navigationData = event.notification.additionalData.navigation;
  //     const userId = event.notification.additionalData.userId;
  //     const sessionId = event.notification.additionalData.sessionID;
  //     const URL = event.notification.additionalData.url;
  //     const Name = event.notification.additionalData.UserName;
  //     if (navigationData && navigationData.screen) {
  //       const { screen } = navigationData;
  //       navigateToScreen(screen, userId, sessionId, URL, Name);
  //     } else {
  //       console.log("Navigation data is missing or incomplete.");
  //     }
  //   });
  // }, []);

  useEffect(() => {
    const sub = listenReminderButtonAction((payload) => {
      void submitReminderButtonAction(payload);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    // Ask native permissions/capabilities when app opens (Android only).
    // Each helper checks first and opens settings only if required.
    (async () => {
      try {
        await ensureOverlayPermission();
        await ensureExactAlarmPermission();
        await ensureBatteryOptimizationExemption();
      } catch (e) {
        console.log("Reminder permissions check failed:", e);
      }
    })();

    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    OneSignal.initialize("d0b54663-0ad5-496b-b89b-424bbb883bea");

    OneSignal.User.pushSubscription
      .getIdAsync()
      .then((subscriptionId: any) => {
        AsyncStorage.setItem("subscriptionId", subscriptionId);
      })
      .catch((error) => {
        console.log("Failed to get subscription ID:", error);
      });

    let unsubscribeOnMessage: undefined | (() => void);
    try {
      const app = getApp();
      console.log(app.name);

      const messagingInstance = getMessaging(app);
      unsubscribeOnMessage = onMessage(
        messagingInstance,
        async (remoteMessage) => {
          const { message, remindmeUrl, dismissUrl } =
            extractReminderFromFcmMessage(remoteMessage);
          showReminder(message, { remindmeUrl, dismissUrl });
        },
      );
    } catch (e) {
      console.warn("Firebase default app not available:", e);
    }

    (async () => {
      try {
        // Android 13+ requires runtime POST_NOTIFICATIONS permission.
        const granted = await OneSignal.Notifications.requestPermission(true);
        console.log("OneSignal: permission granted=", granted);

        // Give the SDK a moment to register and obtain subscription id/token.
        setTimeout(async () => {
          try {
            const subId = await OneSignal.User.pushSubscription.getIdAsync();

            console.log("OneSignal: pushSubscription=", { subId });
          } catch (e) {
            console.log("OneSignal: failed to read pushSubscription state:", e);
          }
        }, 1500);
      } catch (e) {
        console.log("OneSignal: requestPermission failed:", e);
      }
    })();

    const onNotificationClick = (event: any) => {
      const navigationData = event.notification.additionalData.navigation;
      const userId = event.notification.additionalData.userId;
      const sessionId = event.notification.additionalData.sessionID;
      const URL = event.notification.additionalData.url;
      const Name = event.notification.additionalData.UserName;
      if (navigationData && navigationData.screen) {
        const { screen } = navigationData;
        navigateToScreen(screen, userId, sessionId, URL, Name);
      } else {
        console.log("Navigation data is missing or incomplete.");
      }
    };

    // API key = "os_v2_app_2c2umyyk2vewxoe3ijf3xcb35l5vk3nettguldm5izlij7szwm3tujadxcaseioh7undahnnvcays3665elipzn3rs46qhok7wgyouy"

    const onForegroundWillDisplay = (event: any) => {
      const notification = event.getNotification();
      console.log(
        "OneSignal: foreground notification:",
        notification?.additionalData,
      );

      // For normal notifications in foreground, show the banner/panel.
      event.preventDefault();
      event.getNotification().display();
    };

    const onPermissionChange = (granted: boolean) => {
      console.log("OneSignal: permissionChange=", granted);
    };

    OneSignal.Notifications.addEventListener("click", onNotificationClick);
    OneSignal.Notifications.addEventListener(
      "foregroundWillDisplay",
      onForegroundWillDisplay,
    );
    OneSignal.Notifications.addEventListener(
      "permissionChange",
      onPermissionChange,
    );

    return () => {
      unsubscribeOnMessage?.();
      OneSignal.Notifications.removeEventListener("click", onNotificationClick);
      OneSignal.Notifications.removeEventListener(
        "foregroundWillDisplay",
        onForegroundWillDisplay,
      );
      OneSignal.Notifications.removeEventListener(
        "permissionChange",
        onPermissionChange,
      );
    };
  }, []);

  useEffect(() => {
    console.log("userData in app.tsx", userData);
  }, [userData]);
  const navigateToScreen = (
    screenName: any,
    userId: any,
    sessionId: any,
    URL: any,
    Name: any,
  ) => {
    const navigation = navigationRef.current;
    if (navigation) {
      navigation.dispatch(CommonActions.navigate(screenName));
      navigation.navigate("VerificationScreen", {
        userId,
        sessionId,
        URL,
        Name,
      });
    } else {
      console.error("Navigation object is undefined.");
    }
  };
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <StatusBar style="light" />
        <View style={{ height: insets.top, backgroundColor: "#008541" }} />
        <NavigationContainer>
          {userData === null || userData === undefined ? (
            <AuthStackNavigator />
          ) : (
            <MainNavigator />
          )}
        </NavigationContainer>
        <View style={{ height: insets.bottom }} />
      </View>
    </ThemeProvider>
  );
}
