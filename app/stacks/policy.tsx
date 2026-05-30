import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemeHeader from "@/components/headers/ThemeHeader";
import { COLORS } from "@/constants/Colors";
import { SIZES } from "@/constants/Sizes";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { BackHandler, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import RenderHtml from "react-native-render-html";

export default function PolicyScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { title = "Policy", data: policyData, pageType } = useLocalSearchParams();

  // Parse the policy data from params
  const parsedData = useMemo(() => {
    if (!policyData) return null;
    try {
      // Handle both string and object formats
      if (typeof policyData === "string") {
        return JSON.parse(policyData);
      }
      return policyData;
    } catch (error) {
      console.error("Error parsing policy data:", error);
      return null;
    }
  }, [policyData]);

  const htmlContent = useMemo(() => {
    // If we have pageType and an array of policies, find the matching one
    if (Array.isArray(parsedData) && pageType) {
      const matchedPolicy = parsedData.find(
        (item: any) => item.page_type === pageType
      );
      if (matchedPolicy?.content) {
        return matchedPolicy.content;
      }
    }

    // Handle paginated API response: { data: [{ content: "..." }] }
    if (parsedData?.data && Array.isArray(parsedData.data) && parsedData.data.length > 0) {
      // If pageType is provided, find matching policy in data array
      if (pageType) {
        const matchedPolicy = parsedData.data.find(
          (item: any) => item.page_type === pageType
        );
        if (matchedPolicy?.content) {
          return matchedPolicy.content;
        }
      }
      // Fallback to first item if no match
      return parsedData.data[0].content || "";
    }

    // Handle direct content: { content: "..." }
    if (parsedData?.content) {
      return parsedData.content;
    }

    // Fallback static content
    return `<h1>${title}</h1><p>Content not available.</p>`;
  }, [parsedData, title, pageType]);

  const handleBackPress = useCallback(() => {
    router.replace("/(tabs)/profile");
    return true;
  }, [router]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  // Custom HTML rendering styles
  const htmlStyles = {
    body: {
      color: COLORS.text,
      fontSize: SIZES.fontSize14,
      lineHeight: SIZES.lineHeight14,
    },
    h1: {
      fontSize: SIZES.fontSize20,
      fontWeight: "700" as const,
      color: COLORS.text,
      marginBottom: SIZES.padding,
      marginTop: SIZES.padding,
    },
    h2: {
      fontSize: SIZES.fontSize18,
      fontWeight: "600" as const,
      color: COLORS.text,
      marginBottom: SIZES.padding * 0.6,
      marginTop: SIZES.padding * 0.8,
    },
    h3: {
      fontSize: SIZES.fontSize16,
      fontWeight: "600" as const,
      color: COLORS.text,
      marginBottom: SIZES.padding * 0.4,
      marginTop: SIZES.padding * 0.6,
    },
    p: {
      fontSize: SIZES.fontSize14,
      color: COLORS.text,
      marginBottom: SIZES.padding * 0.4,
      lineHeight: SIZES.lineHeight14,
    },
    ul: {
      marginLeft: SIZES.padding,
      marginBottom: SIZES.padding * 0.6,
    },
    ol: {
      marginLeft: SIZES.padding,
      marginBottom: SIZES.padding * 0.6,
    },
    li: {
      fontSize: SIZES.fontSize14,
      color: COLORS.text,
      marginBottom: SIZES.padding * 0.2,
      lineHeight: SIZES.lineHeight14,
    },
    strong: {
      fontWeight: "700" as const,
      color: COLORS.text,
    },
    a: {
      color: COLORS.primary,
      textDecorationLine: "underline" as const,
    },
  };

  const renderersProps = {
    a: {
      onPress: (_: any, url: string) => {
        // Handle link presses if needed
        console.log("Link pressed:", url);
      },
    },
  };

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={handleBackPress} title={(title as string) || "Policy"} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Image
              source={require("../../assets/images/splashImage.png")}
              style={styles.logo}
            />
          </View>
        </View>

        {/* Render HTML Content */}
        <View style={styles.htmlContainer}>
          <RenderHtml
            contentWidth={width - SIZES.padding * 6}
            source={{ html: htmlContent }}
            tagsStyles={htmlStyles}
            renderersProps={renderersProps}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: SIZES.padding16,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding2 * 1.4,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: SIZES.padding16,
  },
  logo: {
    width: 100,
    height: 100,
  },
  htmlContainer: {
    flex: 1,
    paddingHorizontal: SIZES.padding*5,
  },
});
