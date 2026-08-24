import { scaleFont } from "@/constants/ScaleFont";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { OneSignal } from "react-native-onesignal";
import { styles } from "./style";

export default function PermissionScreenIOS() {
  const navigation = useNavigation<any>();

  //   useEffect(()=>{
  // checkPermission
  //   },[])

  async function checkPermission() {
    try {
      const granted = await OneSignal.Notifications.requestPermission(true);
      if (!granted) {
        navigation.navigate("Login");
      } else {
        navigation.navigate("Login");
      }
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Failed to request permissions");
    }
  }

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View style={{ marginTop: scaleFont(120) }}>
        <Image
          source={require("../../assets/images/Logo.png")}
          style={styles.Logo}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.text1}>Permission Needed</Text>
        <Text style={styles.text2}>
          Please allow the app to function properly by granting the required
          permissions. Thanks!
        </Text>
      </View>
      <View style={{ marginTop: 40 }}>
        <TouchableOpacity style={styles.btn} onPress={() => checkPermission()}>
          <Text style={styles.btnText}>Allow</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
