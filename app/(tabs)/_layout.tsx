import { HapticTab } from '@/components/HapticTab';
import { ThemedText } from '@/components/ThemedText';
import { COLORS } from '@/constants/Colors';
import { SIZES, SIZES_WITH_ALIASES } from '@/constants/Sizes';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPosition = Math.max(insets.bottom, 10);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [agreed, setAgreed] = useState(false);

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
        color={focused ? COLORS.blue : '#404040'}
      />
    </Animated.View>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: COLORS.blue,
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
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setAgreed(false);
              setShowWarning(true);
            },
          }}
        />

        <Tabs.Screen
          name="myListing"
          options={{
            title: 'My Ads',
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

      <Modal
        visible={showWarning}
        transparent
        animationType="slide"
        onRequestClose={() => { setShowWarning(false); setAgreed(false); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.warningModal}>
            {/* Close (X) button */}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => { setShowWarning(false); setAgreed(false); }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color="#555" />
            </TouchableOpacity>

            <ScrollView
              contentContainerStyle={styles.warningScroll}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Image
                source={require('@/assets/images/warning.png')}
                style={styles.warningImage}
              />
            </ScrollView>

            {/* Agreement checkbox */}
            <TouchableOpacity
              style={styles.agreementRow}
              onPress={() => setAgreed(v => !v)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <ThemedText style={styles.agreementText}>
                मैंने सभी नियम और शर्तों को पढ़ा और समझा है तथा मैं उनसे सहमत हूँ।{' '}
                <ThemedText style={styles.agreementTextEn}>I have read all the rules and terms and agree.</ThemedText>
              </ThemedText>
            </TouchableOpacity>

            <View style={[styles.warningActions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowWarning(false);
                  setAgreed(false);
                  router.push('/(tabs)/post');
                }}
              >
                <ThemedText style={styles.cancelBtnText}>Skip</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.proceedBtn, !agreed && styles.proceedBtnDisabled]}
                onPress={() => {
                  if (!agreed) return;
                  setShowWarning(false);
                  setAgreed(false);
                  router.push('/(tabs)/post');
                }}
                activeOpacity={agreed ? 0.8 : 1}
              >
                <ThemedText style={styles.proceedBtnText}>I Understand, Proceed</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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

  /* Warning Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  warningModal: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    width: '100%',
    overflow: 'hidden',
  },
  warningScroll: {
    padding: 16,
  },
  warningImage: {
    width: SIZES_WITH_ALIASES.width * 0.9,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  warningText: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  warningBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    marginBottom: 6,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D32F2F',
    marginTop: 7,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#424242',
    lineHeight: 20,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
    backgroundColor: '#fff',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  agreementText: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  agreementTextEn: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  proceedBtnDisabled: {
    opacity: 0.4,
  },
  warningActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  proceedBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
