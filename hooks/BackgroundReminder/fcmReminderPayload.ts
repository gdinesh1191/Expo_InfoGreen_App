/**
 * Normalize FCM / data-message shapes so we can open ReminderActivity with message + URLs.
 */
export function extractReminderFromFcmMessage(remoteMessage: any): {
  message: string;
  remindmeUrl: string;
  dismissUrl: string;
} {
  const data = remoteMessage?.data ?? {};

  const rawA =
    remoteMessage?.a ??
    data?.a ??
    data?.custom?.a ??
    data?.custom;

  const a =
    typeof rawA === "string"
      ? (() => {
          try {
            return JSON.parse(rawA);
          } catch {
            return rawA;
          }
        })()
      : rawA;

  const inner = a?.a ?? a ?? {};
  const msgRaw = inner?.message ?? data?.message ?? "Reminder Message";
  const message =
    typeof msgRaw === "object" && msgRaw !== null
      ? JSON.stringify(msgRaw, null, 2)
      : String(msgRaw);

  const remindmeUrl = String(
    inner?.remindme_url ?? data?.remindme_url ?? "",
  ).trim();
  const dismissUrl = String(
    inner?.dismiss_url ?? data?.dismiss_url ?? "",
  ).trim();

  return { message, remindmeUrl, dismissUrl };
}
