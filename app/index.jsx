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

  const [hasValidToken, setHasValidToken] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        const authToken = await AsyncStorage.getItem("authToken");
        const user = JSON.parse(userString);
        const tokenIsValid = Boolean(authToken) && authToken !== "undefined" && authToken !== "null";
        if (user && tokenIsValid) {
          await AsyncStorage.setItem("user", JSON.stringify(user));
          dispatch(setUser(user));
          setHasValidToken(true);
        } else if (user && !tokenIsValid) {
          await AsyncStorage.multiRemove(["user", "authToken"]);
        } else {
        }
      } catch (error) {
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

  if (user && hasValidToken) {
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
