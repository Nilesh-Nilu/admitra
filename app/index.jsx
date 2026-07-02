import { COLORS } from "@/constants/Colors";
import { setUser } from "@/store/reducers/authReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function Index() {
  const [initialized, setInitialized] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.entities.authReducer);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        const user = JSON.parse(userString);
        if (user) {
          await AsyncStorage.setItem("user", JSON.stringify(user));
          dispatch(setUser(user));
        } else {
          console.log("No stored user found");
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setInitialized(true);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (user) {
    if (user.name) {
      return <Redirect href="/(tabs)" />;
    } else {
      return (
        <Redirect
          href={{
            pathname: "/(auth)/loginFields",
            params: {
              user: JSON.stringify(user),
            },
          }}
        />
      );
    }
  }

  return <Redirect href="/(auth)" />;
}
