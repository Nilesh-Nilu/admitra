import { useEffect, useRef } from "react";
import { Animated, Easing, ViewStyle } from "react-native";

type ShimmerProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
};

const Shimmer = ({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}: ShimmerProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => {
      loop.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#E9E9E9",
          opacity,
        },
        style as any,
      ]}
    />
  );
};

export default Shimmer;



