import { AppRegistry } from "react-native";
import { getApp } from "@react-native-firebase/app";
import {
  getMessaging,
  setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
// import { Data } from "./App";

AppRegistry.registerHeadlessTask("ReminderButtonHeadlessTask", () =>
  require("./hooks/BackgroundReminder/reminderButtonHeadlessTask").default,
);

try {
  const app = getApp();
  const messagingInstance = getMessaging(app);

  setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
    const { extractReminderFromFcmMessage } = require("./hooks/BackgroundReminder/fcmReminderPayload");
    const { message, remindmeUrl, dismissUrl } =
      extractReminderFromFcmMessage(remoteMessage);
    showReminder(message, { remindmeUrl, dismissUrl });
  });
} catch (e) {
  console.warn(
    "Firebase default app not available (background handler not set):",
    e,
  );
}

// Let Expo load the actual app entry.
import "expo/AppEntry";
import { showReminder } from "./hooks/BackgroundReminder/ReminderModule";

