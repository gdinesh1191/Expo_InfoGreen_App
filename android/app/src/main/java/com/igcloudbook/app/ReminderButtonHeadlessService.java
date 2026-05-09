package com.igcloudbook.app;

import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

/**
 * Runs JS when the user taps a reminder button but {@link com.facebook.react.bridge.ReactContext} is null (app not running).
 * Task name must match {@code AppRegistry.registerHeadlessTask("ReminderButtonHeadlessTask", ...)} in index.js.
 */
public class ReminderButtonHeadlessService extends HeadlessJsTaskService {

    public static final String TASK_NAME = "ReminderButtonHeadlessTask";

    @Override
    protected @Nullable HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent != null && intent.getExtras() != null
            ? intent.getExtras()
            : new Bundle();
        return new HeadlessJsTaskConfig(
            TASK_NAME,
            Arguments.fromBundle(extras),
            60_000,
            true
        );
    }
}
