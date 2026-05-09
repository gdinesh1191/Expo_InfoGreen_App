package com.igcloudbook.app;

import android.os.Build;
import android.content.Intent;
import android.media.MediaPlayer;
import android.os.Bundle;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;
import android.widget.LinearLayout;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import androidx.appcompat.app.AppCompatActivity;
import android.view.Window;
import android.app.KeyguardManager;
import android.content.Context;
import android.util.Log;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class ReminderActivity extends AppCompatActivity {

    /** JS event name — subscribe via ReminderModule.ts listenReminderButtonAction */
    public static final String REMINDER_BUTTON_EVENT = "ReminderButtonAction";

    private TextView titleText;
    private TextView messageText;
    private Button dismissButton;
    private Button snoozeButton;
    private MediaPlayer mediaPlayer;
    private SharedPreferences sharedPreferences;
    /** Per-notification API URLs from FCM; forwarded to JS on button tap */
    private String remindmeUrl = "";
    private String dismissUrl = "";

    @Override
    public void onBackPressed() {
        // Prevent back button from closing
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
            KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            keyguardManager.requestDismissKeyguard(this, null);
        }

        Window window = getWindow();
        window.addFlags(
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
        );

        setContentView(R.layout.activity_reminder);

        GradientDrawable gradientDrawable = new GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            new int[] {
                Color.parseColor("#006666"),
                Color.parseColor("#000000")
            }
        );

        LinearLayout rootLayout = findViewById(R.id.rootLayout);
        rootLayout.setBackground(gradientDrawable);

        titleText = findViewById(R.id.titleText);
        messageText = findViewById(R.id.messageText);
        dismissButton = findViewById(R.id.dismissButton);
        snoozeButton = findViewById(R.id.snoozeButton);

        applyIntentExtras(getIntent());

        startAlarmSound();

        snoozeButton.setOnClickListener(v -> {
            handleReminderAction("onSnooze", "snooze");
            stopAlarmSound();
            finish();
        });

        dismissButton.setOnClickListener(v -> {
            handleReminderAction("onDismiss", "dismiss");
            stopAlarmSound();
            finish();
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mediaPlayer == null || !mediaPlayer.isPlaying()) {
            startAlarmSound();
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        applyIntentExtras(intent);
    }

    private void applyIntentExtras(Intent intent) {
        if (intent == null) return;
        String message = intent.getStringExtra("message");
        if (message == null) message = "Reminder Message";
        titleText.setText("Reminder!");
        messageText.setText(message);
        String ru = intent.getStringExtra("remindme_url");
        String du = intent.getStringExtra("dismiss_url");
        remindmeUrl = ru != null ? ru : "";
        dismissUrl = du != null ? du : "";
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopAlarmSound();
    }

    /**
     * @param prefAction stored for native/legacy readers: onSnooze / onDismiss
     * @param jsAction   sent to JS: "snooze" | "dismiss"
     */
    private void handleReminderAction(String prefAction, String jsAction) {
        String msg = messageText.getText().toString();
        try {
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putString("last_reminder_action", prefAction);
            editor.putString("last_reminder_message", msg);
            editor.putLong("last_reminder_timestamp", System.currentTimeMillis());
            editor.apply();

            Log.d("ReminderActivity", "Saved reminder action: " + prefAction + " for message: " + msg);
        } catch (Exception e) {
            Log.e("ReminderActivity", "Error saving reminder action: " + e.getMessage());
        }

        emitToJs(jsAction, msg);
    }

    private void emitToJs(String action, String message) {
        try {
            ReactApplication app = (ReactApplication) getApplication();
            ReactInstanceManager rim = app.getReactNativeHost().getReactInstanceManager();
            ReactContext reactContext = rim.getCurrentReactContext();
            WritableMap payload = Arguments.createMap();
            payload.putString("action", action);
            payload.putString("message", message != null ? message : "");
            payload.putString("remindme_url", remindmeUrl != null ? remindmeUrl : "");
            payload.putString("dismiss_url", dismissUrl != null ? dismissUrl : "");

            if (reactContext != null) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(REMINDER_BUTTON_EVENT, payload);
                return;
            }

            // App / JS not running: wake Headless JS with the same payload
            Log.d("ReminderActivity", "No ReactContext — starting Headless JS for reminder button");
            Intent headless = new Intent(this, ReminderButtonHeadlessService.class);
            headless.putExtra("action", action);
            headless.putExtra("message", message != null ? message : "");
            headless.putExtra("remindme_url", remindmeUrl != null ? remindmeUrl : "");
            headless.putExtra("dismiss_url", dismissUrl != null ? dismissUrl : "");
            headless.putExtra("timestamp", System.currentTimeMillis());
            startService(headless);
        } catch (Exception e) {
            Log.e("ReminderActivity", "emitToJs failed: " + e.getMessage());
        }
    }

    private void startAlarmSound() {
        try {
            if (mediaPlayer == null) {
                mediaPlayer = MediaPlayer.create(this, R.raw.notification_sound1);
                mediaPlayer.setLooping(true);
            }
            if (!mediaPlayer.isPlaying()) {
                mediaPlayer.start();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void stopAlarmSound() {
        if (mediaPlayer != null) {
            if (mediaPlayer.isPlaying()) {
                mediaPlayer.stop();
            }
            mediaPlayer.release();
            mediaPlayer = null;
        }
    }
}
