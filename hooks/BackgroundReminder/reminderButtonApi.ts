import axios from "axios";
import type { ReminderButtonPayload } from "./ReminderModule";

/**
 * Picks URL from payload by button: snooze → remindmeUrl, dismiss → dismissUrl.
 */
export async function submitReminderButtonAction(
  payload: ReminderButtonPayload,
): Promise<void> {
  const url =
    payload.action === "dismiss"
      ? payload.dismissUrl.trim()
      : payload.remindmeUrl.trim();

  if (!url) {
    console.warn(
      "submitReminderButtonAction: no URL for action",
      payload.action,
    );
    return;
  }

  const body = {
    name: "b",
    mobileNumber: "1234567890",
  };

  const body1 = {
    name: "a",
    mobileNumber: "1234567890",
  };

  if (payload.action === "snooze") {
    await axios.post(url, body);
  } else {
    await axios.post(url, body1);
  }
}
