import BackgroundService from "react-native-background-actions";
import { getAllLocationData, insertLocationData } from "./db";
import { getLocation, hasLocationPermissions } from "./getlocation";

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

/** Prevents overlapping start() calls while permissions / native start are in flight. */
let isStarting = false;

const locationTask = async (taskData?: { delay?: number }) => {
  const delay = taskData?.delay ?? 30000;
  console.log("Location background task started, delay:", delay);

  while (BackgroundService.isRunning()) {
    try {
      const location = await getLocation();
      const time =
        location?.timestamp != null
          ? new Date(location.timestamp).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })
          : undefined;
      console.log(
        "location",
        location?.latitude,
        location?.longitude,
        time,
        location?.accuracy,
      );

      if (location?.latitude != null && location?.longitude != null && time) {
        await insertLocationData({
          latitude: location.latitude,
          longitude: location.longitude,
          time,
          accuracy: location.accuracy ?? null,
        });

        const rows = await getAllLocationData();
        console.log(
          "location_data rows:",
          rows.length,
          JSON.stringify(rows, null, 2),
        );
      }
    } catch (error) {
      console.log("Background location task error:", error);
    }

    await sleep(delay);
  }
};

const taskConfig = {
  taskName: "LocationTask",
  taskTitle: "Location",
  taskDesc: "Your location is being checked",
  taskIcon: {
    name: "ic_stat_onesignal_default",
    type: "drawable",
    package: "com.igcloudbook.app",
  },
  color: "#008541",
  linkingURI: "infogreen://",
  // Required on Android 14+ / targetSdk 36 — type "none" crashes the app
  foregroundServiceType: ["location"] as "location"[],
  parameters: {
    delay: 30000,
  },
  allowExecutionInForeground: true,
};

export const startLocationService = async () => {
  try {
    if (BackgroundService.isRunning() || isStarting) {
      console.log("Background Service already running");
      return;
    }

    isStarting = true;

    const granted = await hasLocationPermissions();
    if (!granted) {
      console.log("Location permissions not granted — service not started");
      return;
    }

    // Re-check after the permission await (another caller may have started it)
    if (BackgroundService.isRunning()) {
      console.log("Background Service already running");
      return;
    }

    await BackgroundService.start(locationTask, taskConfig);
    console.log("Background location service started");
  } catch (err: unknown) {
    console.error("Failed to start location service:", err);
  } finally {
    isStarting = false;
  }
};

export const stopLocationService = async () => {
  if (BackgroundService.isRunning()) {
    await BackgroundService.stop();
    console.log("Background location service stopped");
  }
};
