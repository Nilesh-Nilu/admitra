import { HapticTab } from '@/components/HapticTab';
import { COLORS } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPosition = Math.max(insets.bottom, 10) + 12;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateIcon = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const AnimatedIcon = ({ focused, name }: { focused: boolean, name: any }) => (
    <Animated.View
      style={[
        styles.iconContainer,
        focused && styles.iconContainerActive,
        { transform: [{ scale: focused ? scaleAnim : 1 }] },
      ]}
    >
      <Ionicons
        name={name}
        size={22}
        color={focused ? COLORS.white : 'rgba(255,255,255,0.6)'}
      />
    </Animated.View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => (
          <View style={styles.backgroundWrapper}>
            <BlurView intensity={90} tint="dark" style={styles.blur} />
            <View style={styles.gradientOverlay} />
          </View>
        ),
        tabBarStyle: [styles.tabBar, { bottom: bottomPosition }],
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => {
            if (focused) animateIcon();
            return <AnimatedIcon focused={focused} name={focused ? "home" : "home-outline"} />;
          },
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => {
            if (focused) animateIcon();
            return <AnimatedIcon focused={focused} name={focused ? "search" : "search-outline"} />;
          },
        }}
      />

      <Tabs.Screen
        name="post"
        options={{
          title: 'Sell',
          tabBarIcon: ({ focused }) => (
            <View style={styles.postButtonWrapper}>
              <View style={[styles.postButton, focused && styles.postButtonActive]}>
                <Ionicons name="add" size={28} color={COLORS.white} />
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => {
            if (focused) animateIcon();
            return <AnimatedIcon focused={focused} name={focused ? "chatbubbles" : "chatbubbles-outline"} />;
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => {
            if (focused) animateIcon();
            return (
              <AnimatedIcon
                focused={focused}
                name={focused ? "person" : "person-outline"}
              />
            );
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    height: 74,
    borderRadius: 36,
    backgroundColor: COLORS.secondary,
    borderTopWidth: 0,
    elevation: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    paddingBottom: 2,
    overflow: 'hidden',
  },
  backgroundWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
    overflow: 'hidden',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tabItem: {
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
    color: COLORS.white,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  postButtonWrapper: {
    position: 'absolute',
    top: -20,
  },
  postButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accentOrange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accentOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  postButtonActive: {
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.05 }],
  },
});
