import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemeHeader from "@/components/headers/ThemeHeader";
import { COLORS } from "@/constants/Colors";
import { SIZES } from "@/constants/Sizes";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getPolicyApi } from "@/constants/functions";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RenderHtml from "react-native-render-html";

export default function PolicyScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { title = "Policy", data: policyData, pageType } = useLocalSearchParams();
  const [fetched, setFetched] = useState<any>(null);
  const [loading, setLoading] = useState(!policyData);

  useEffect(() => {
    if (policyData) return;
    let active = true;
    getPolicyApi()
      .then((res: any) => active && setFetched(res))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [policyData]);

  // Parse the policy data from params
  const parsedData = useMemo(() => {
    if (!policyData) return fetched;
    try {
      // Handle both string and object formats
      if (typeof policyData === "string") {
        return JSON.parse(policyData);
      }
      return policyData;
    } catch (error) {
      return null;
    }
  }, [policyData, fetched]);

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
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/profile");
    return true;
  }, [router]);

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
      marginBottom: 12,
      marginTop: 12,
    },
    h2: {
      fontSize: SIZES.fontSize18,
      fontWeight: "600" as const,
      color: COLORS.text,
      marginBottom: 8,
      marginTop: 12,
    },
    h3: {
      fontSize: SIZES.fontSize16,
      fontWeight: "600" as const,
      color: COLORS.text,
      marginBottom: 6,
      marginTop: 8,
    },
    p: {
      fontSize: SIZES.fontSize14,
      color: COLORS.text,
      marginBottom: 6,
      lineHeight: SIZES.lineHeight14,
    },
    ul: {
      marginLeft: 8,
      marginBottom: 8,
    },
    ol: {
      marginLeft: 8,
      marginBottom: 8,
    },
    li: {
      fontSize: SIZES.fontSize14,
      color: COLORS.text,
      marginBottom: 4,
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
        if (url) Linking.openURL(url).catch(() => {});
      },
    },
  };

  return (
    <ThemedView style={styles.container}>
      <ThemeHeader onBackPress={handleBackPress} title={(title as string) || "Policy"} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
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
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
          <RenderHtml
            contentWidth={width - 40}
            source={{ html: htmlContent }}
            tagsStyles={htmlStyles}
            renderersProps={renderersProps}
          />
          )}
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
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },
  htmlContainer: {
    flex: 1,
  },
});
