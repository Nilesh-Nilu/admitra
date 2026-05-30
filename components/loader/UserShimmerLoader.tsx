import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import { COLORS } from "@/constants/Colors";

const ShimmerBlock = ({
  style,
  animatedValue,
}: {
  style: any;
  animatedValue: Animated.Value;
}) => {
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });
  return (
    <View style={[style, { overflow: "hidden", backgroundColor: COLORS.border }]}>
      <Animated.View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255,255,255,0.5)",
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

export const UserShimmerLoader = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [animatedValue]);

  return (
    <View>
      <ShimmerBlock
        style={{ height: 48, borderRadius: 12, marginBottom: 20 }}
        animatedValue={animatedValue}
      />
      <View style={{ marginBottom: 24 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={{ marginRight: 16, alignItems: "center" }}>
              <ShimmerBlock
                style={{ width: 52, height: 52, borderRadius: 14 }}
                animatedValue={animatedValue}
              />
              <ShimmerBlock
                style={{ width: 40, height: 10, borderRadius: 5, marginTop: 6 }}
                animatedValue={animatedValue}
              />
            </View>
          ))}
        </ScrollView>
      </View>
      <ShimmerBlock
        style={{ height: 140, borderRadius: 14, marginBottom: 24 }}
        animatedValue={animatedValue}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 24 }}>
        <View style={{ width: "48%" }}>
          <ShimmerBlock
            style={{ height: 160, borderRadius: 12, marginBottom: 12 }}
            animatedValue={animatedValue}
          />
          <ShimmerBlock
            style={{ height: 16, width: "70%", borderRadius: 4 }}
            animatedValue={animatedValue}
          />
        </View>
        <View style={{ width: "48%" }}>
          <ShimmerBlock
            style={{ height: 160, borderRadius: 12, marginBottom: 12 }}
            animatedValue={animatedValue}
          />
          <ShimmerBlock
            style={{ height: 16, width: "70%", borderRadius: 4 }}
            animatedValue={animatedValue}
          />
        </View>
      </View>
    </View>
  );
};

export default UserShimmerLoader;
