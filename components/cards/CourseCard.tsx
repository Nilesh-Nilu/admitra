import { COLORS } from "@/constants/Colors";
import { SIZES } from "@/constants/Sizes";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../ThemedText";

const CourseCard = ({
  course,
  image,
  onPress = () => {},
  isFaultCode = false,
}: {
  course: string;
  image?: string;
  onPress?: () => void;
  isFaultCode?: boolean;
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isFaultCode && styles.faultCodeContainer]}
      onPress={onPress}
    >
      {isFaultCode && <Image source={{ uri: image }} style={styles.image} />}
      <View style={styles.textContainer}>
        <ThemedText style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {course}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default CourseCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: SIZES.radius10,
    padding: SIZES.margin18,
    borderWidth: 1,
    borderColor: COLORS.primary,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    width: "60%",
  },
  title: {
    fontSize: SIZES.fontSize20,
    fontWeight: "bold",
    color: "#000",
    lineHeight: 24,
    textAlign: "center",
  },
  faultCodeContainer: {
    backgroundColor: COLORS.gray,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  image: {
    width: "40%",
    height: 100,
    alignSelf: "center",
  },
});
