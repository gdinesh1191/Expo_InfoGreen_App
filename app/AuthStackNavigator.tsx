import Login from "@/pages/Login";
import Network from "@/pages/NetworkScreen";
import PermissionScreenIOS from "@/pages/PermissionScreenIOS";
import Splashscreen from "@/pages/SplashScreen";
import WelcomeScreen from "@/pages/WelcomeScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

const AuthStack = createNativeStackNavigator();

const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Splashscreen"
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name="Splashscreen" component={Splashscreen} />
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Network" component={Network} />
      <AuthStack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <AuthStack.Screen
        name="PermissionScreenIOS"
        component={PermissionScreenIOS}
      />
      {/* Add other screens here */}
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigator;
