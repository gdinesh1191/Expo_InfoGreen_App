# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# R8 (release): expo-asset must match Expo SDK (54 -> expo-asset ~12). If a stale SDK 55+ AAR is on the
# classpath, it references these types; they are not in expo-modules-core 3.0.x. AGP suggests:
-dontwarn expo.modules.kotlin.services.FilePermissionService$Permission
-dontwarn expo.modules.kotlin.services.FilePermissionService
