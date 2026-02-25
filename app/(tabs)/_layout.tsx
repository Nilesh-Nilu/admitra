import { HapticTab } from '@/components/HapticTab';
import { COLORS } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
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
        color={focused ? COLORS.secondaryBlue : '#404040'}
      />
    </Animated.View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: COLORS.secondaryBlue,
        tabBarInactiveTintColor: '#404040',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
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
        name="post"
        options={{
          title: 'Sell',
          tabBarIcon: ({ focused }) => (
            <View style={styles.postButtonWrapper}>
              <View style={styles.postButtonOuter}>
                <View style={[styles.postButton, focused && styles.postButtonActive]}>
                  <Ionicons name="add" size={26} color={COLORS.secondaryBlue} />
                </View>
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="myListing"
        options={{
          title: 'My ads',
          tabBarIcon: ({ focused }) => {
            if (focused) animateIcon();
            return <AnimatedIcon focused={focused} name={focused ? "briefcase" : "briefcase-outline"} />;
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
    left: 0,
    right: 0,
    height: 66,
    borderRadius: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    paddingBottom: 4,
  },
  tabItem: {
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(31,60,136,0.08)',
  },
  postButtonWrapper: {
    position: 'absolute',
    top: -28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD400',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2F80ED',
    shadowColor: '#2F80ED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  postButtonActive: {
    transform: [{ scale: 1.03 }],
  },
});
