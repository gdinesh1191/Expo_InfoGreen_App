import { submitReminderButtonAction } from "./reminderButtonApi";
import type { ReminderButtonPayload } from "./ReminderModule";

/**
 * Runs as soon as the user taps a button on ReminderActivity when ReactContext
 * was null (e.g. app killed). Executes the same API as the foreground path.
 */
export default async function reminderButtonHeadlessTask(data: {
  action?: string;
  message?: string;
  remindme_url?: string;
  dismiss_url?: string;
  timestamp?: number;
}) {
  const payload: ReminderButtonPayload = {
    action: data?.action === "dismiss" ? "dismiss" : "snooze",
    message: String(data?.message ?? ""),
    remindmeUrl: String(data?.remindme_url ?? ""),
    dismissUrl: String(data?.dismiss_url ?? ""),
  };

  await submitReminderButtonAction(payload);
}
