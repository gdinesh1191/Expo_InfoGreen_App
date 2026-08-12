import * as Location from "expo-location";

/** Check only — does not show a permission dialog. */
export const hasLocationPermissions = async (): Promise<boolean> => {
  const { status: foregroundStatus } =
    await Location.getForegroundPermissionsAsync();
  if (foregroundStatus !== "granted") return false;

  const { status: backgroundStatus } =
    await Location.getBackgroundPermissionsAsync();
  return backgroundStatus === "granted";
};

export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== "granted") {
      console.log("Foreground location permission denied");
      return false;
    }

    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus !== "granted") {
      console.log("Background location permission denied");
      return false;
    }

    return true;
  } catch (error) {
    console.log("Location permission error:", error);
    return false;
  }
};

/** Get current position only — do not request permissions from a background task. */
export const getLocation = async () => {
  try {
    const { status: foregroundStatus } =
      await Location.getForegroundPermissionsAsync();

    if (foregroundStatus !== "granted") {
      console.log("Foreground location permission not granted");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.log("Location Error:", error);
    return null;
  }
};
