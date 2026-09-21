import { COLORS } from '@/constants/Colors';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE_COLOR = COLORS.blue;
const INACTIVE_COLOR = '#404040';
const PILL_HEIGHT = 46;
const PILL_MARGIN = 6;
// Routes rendered as a raised action button instead of a regular tab
const ACTION_ROUTES = ['post'];

/**
 * Tab bar with a highlight pill that slides between tabs
 * (same behaviour as react-native-animated-nav-tab-bar, built on RN Animated).
 */
export default function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = barWidth / state.routes.length;

  const activeRoute = state.routes[state.index];
  const pillVisible = !ACTION_ROUTES.includes(activeRoute.name);

  const translateX = useRef(new Animated.Value(0)).current;
  const pillOpacity = useRef(new Animated.Value(pillVisible ? 1 : 0)).current;
  const hasLaidOut = useRef(false);

  useEffect(() => {
    if (!tabWidth) return;
    const toValue = state.index * tabWidth + PILL_MARGIN;
    if (!hasLaidOut.current) {
      // First layout: place the pill without animating from 0
      translateX.setValue(toValue);
      hasLaidOut.current = true;
    } else {
      Animated.spring(translateX, {
        toValue,
        useNativeDriver: true,
        speed: 14,
        bounciness: 8,
      }).start();
    }
    Animated.timing(pillOpacity, {
      toValue: pillVisible ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [state.index, tabWidth, pillVisible, translateX, pillOpacity]);

  return (
    <View
      style={[styles.bar, { bottom: Math.max(insets.bottom, 10) }]}
      onLayout={(e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width)}
    >
      {tabWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            {
              width: tabWidth - PILL_MARGIN * 2,
              opacity: pillOpacity,
              transform: [{ translateX }],
            },
          ]}
        />
      )}

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label = typeof options.title === 'string' ? options.title : route.name;
        const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
        const isAction = ACTION_ROUTES.includes(route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onPressIn = () => {
          if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            onPress={onPress}
            onPressIn={onPressIn}
            android_ripple={{ color: 'transparent' }}
            hitSlop={isAction ? { top: 30 } : undefined}
            style={styles.item}
          >
            <TabIcon
              icon={options.tabBarIcon?.({ focused, color, size: 22 })}
              focused={focused}
              isAction={isAction}
            />
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Small pop animation on the icon when its tab becomes active
function TabIcon({
  icon,
  focused,
  isAction,
}: {
  icon: React.ReactNode;
  focused: boolean;
  isAction: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAction || !focused) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.18, duration: 120, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }),
    ]).start();
  }, [focused, isAction, scale]);

  if (isAction) {
    // Fixed 24x24 slot so the raised button (absolute inside) stays centred over the tab
    return <View style={styles.actionSlot}>{icon}</View>;
  }

  return <Animated.View style={{ transform: [{ scale }] }}>{icon}</Animated.View>;
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  pill: {
    position: 'absolute',
    left: 0,
    top: (66 - PILL_HEIGHT) / 2,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    backgroundColor: 'rgba(31,60,136,0.10)',
  },
  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  actionSlot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
