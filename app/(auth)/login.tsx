import GmailPasswordScreen from "@/components/login/GmailPassword";
import OtpIllustration from "@/components/login/OtpIllustration";
import PrimaryBtn from "@/components/login/PrimaryButton";
import SecurityNote from "@/components/login/SecurityNote";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { COLORS } from "@/constants/Colors";
import { getAuthManagementListApi, handleSendmailOtp, handleSendPhoneOtp, handleVerifymailOtp, handleVerifyPhoneOtp } from "@/constants/functions";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

// ─── Types ────────────────────────────────────────────────────────────────────
type LoginType = "selection" | "mobile" | "gmail_otp" | "gmail_password";
type MobileStep = "phone" | "otp";
type GmailOtpStep = "email" | "otp";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const PURPLE = "#7C6FCD";
const PURPLE_DARK = "#5C6BC0";
const GOOGLE_RED = "#EA4335";

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [loginType, setLoginType] = useState<LoginType>("selection");
  const [authManagementList, setAuthManagementList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    getAuthManagementListApi()
      .then((res) => {
        if (res) {
          const list = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []);
          setAuthManagementList(list);
        }
      })
      .catch((err) => {
        console.log("Error in getAuthManagementListApi:", err);
      })
      .finally(() => {
        setLoadingList(false);
      });
  }, []);


  if (loginType === "selection")
    return (
      <SelectionScreen
        onSelect={setLoginType}
        authManagementList={authManagementList}
        loadingList={loadingList}
      />
    );
  if (loginType === "mobile")
    return <MobileLoginScreen onBack={() => setLoginType("selection")} />;
  if (loginType === "gmail_otp")
    return <GmailOtpScreen onBack={() => setLoginType("selection")} />;
    return <GmailPasswordScreen onBack={() => setLoginType("selection")} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — Selection
// ─────────────────────────────────────────────────────────────────────────────
function SelectionScreen({
  onSelect,
  authManagementList,
  loadingList,
}: {
  onSelect: (t: LoginType) => void;
  authManagementList: any[];
  loadingList: boolean;
}) {
  const isPhoneOtpActive = authManagementList.some(
    (item) => (item.auth_name === "phone_otp" || item.auth_name === "phone_otppp") && item.is_active === 1
  );
  const isEmailOtpActive = authManagementList.some(
    (item) => item.auth_name === "email_otp" && item.is_active === 1
  );
  const isEmailPasswordActive = authManagementList.some(
    (item) => item.auth_name === "email_password" && item.is_active == 1
  );

  const activeLogins: React.ReactNode[] = [];

  if (isPhoneOtpActive) {
    activeLogins.push(
      <LoginCard
        key="mobile"
        iconBg="#EEF2FF"
        icon={<Ionicons name="phone-portrait-outline" size={30} color={PURPLE_DARK} />}
        title="Mobile Login"
        sub={"Login with your mobile\nnumber and OTP"}
        onPress={() => onSelect("mobile")}
      />
    );
  }

  if (isEmailOtpActive) {
    activeLogins.push(
      <LoginCard
        key="gmail_otp"
        iconBg="#FFF0EE"
        icon={<ThemedText style={sel.gLogo}>G</ThemedText>}
        title="Gmail OTP Login"
        sub={"Login with your Gmail\naccount via OTP"}
        onPress={() => onSelect("gmail_otp")}
      />
    );
  }

  if (isEmailPasswordActive) {
    activeLogins.push(
      <LoginCard
        key="gmail_password"
        iconBg="#EEF2FF"
        icon={<Ionicons name="mail-outline" size={30} color={PURPLE} />}
        title="Gmail Password Login"
        sub={"Login with your Gmail\naccount and password"}
        onPress={() => onSelect("gmail_password")}
      />
    );
  }

  return (
    <ThemedView style={sel.container}>
      <View style={sel.blobTopLeft} />
      <View style={sel.blobBottomRight} />

      <ScrollView contentContainerStyle={sel.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={sel.logoWrap}>
          <Image source={require("../../assets/images/splashImage.png")} style={sel.logoImage} />
          {/* <ThemedText style={sel.logoText}>
            <ThemedText style={{ color: "#4285F4" }}>G</ThemedText>
            <ThemedText style={{ color: GOOGLE_RED }}>A</ThemedText>
            <ThemedText style={{ color: "#FBBC04" }}>X</ThemedText>
            <ThemedText style={{ color: "#34A853" }}>A</ThemedText>
            <ThemedText style={{ fontSize: 36 }}> 📣</ThemedText>
          </ThemedText> */}
          <ThemedText style={sel.logoTagline}>AN ADVERTISEMENTS PLATFORM</ThemedText>
        </View>

        {/* Tagline card */}
        <View style={sel.taglineCard}>
          <ThemedText style={sel.taglineLine}>
            <ThemedText style={sel.taglineBold}>GAXA</ThemedText>
            {" एक विज्ञापन प्लेटफॉर्म है जहाँ सभी यूज़र\nअपना सही जानकारी के साथ अपने "}
            <ThemedText style={{ fontWeight: "700", color: "#4285F4" }}>Ads</ThemedText>
            {" पोस्ट कर सकते हैं।"}
          </ThemedText>
        </View>

        {loadingList ? (
          <ActivityIndicator size="large" color={PURPLE} style={{ marginVertical: 40 }} />
        ) : activeLogins.length > 0 ? (
          activeLogins.reduce((acc: React.ReactNode[], element, index) => {
            if (index > 0) {
              acc.push(<OrDivider key={`divider-${index}`} />);
            }
            acc.push(element);
            return acc;
          }, [])
        ) : (
          <ThemedText style={{ textAlign: "center", color: COLORS.gray, marginVertical: 20 }}>
            No login methods available.
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function LoginCard({
  iconBg, icon, title, sub, onPress,
}: { iconBg: string; icon: React.ReactNode; title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [sel.loginCard, pressed && sel.loginCardPressed]}
      onPress={onPress}
    >
      <View style={[sel.loginCardIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={sel.loginCardText}>
        <ThemedText style={sel.loginCardTitle}>{title}</ThemedText>
        <ThemedText style={sel.loginCardSub}>{sub}</ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </Pressable>
  );
}

function OrDivider() {
  return (
    <View style={sel.orRow}>
      <View style={sel.orLine} />
      <ThemedText style={sel.orText}>OR</ThemedText>
      <View style={sel.orLine} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Mobile OTP Login
// ─────────────────────────────────────────────────────────────────────────────
function MobileLoginScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<MobileStep>("phone");
  // const [phone, setPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(28);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (step !== "otp") return;
    setTimer(28);
    const iv = setInterval(() => {
      setTimer((t) => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(iv);
  }, [step]);


  const handleOtpChange = (v: string, i: number) => {
    if (v.length > 1) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleKey = (k: string, i: number) => {
    if (k === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };


  return (
    <OtpShell accentColor={PURPLE} blobColor="rgba(124,111,205,0.10)" onBack={step === "otp" ? () => setStep("phone") : onBack}>
      {step === "phone" ? (
        <>
          <OtpIllustration bg="#EEE8FF" accent={PURPLE} icon="📱" />
          <ThemedText style={shared.heading}>Enter Your Number</ThemedText>
          <ThemedText style={shared.subHeading}>We'll send a 6-digit OTP to verify your number</ThemedText>
          <View style={shared.phoneRow}>
            <View style={shared.cc}><ThemedText style={shared.ccText}>🇮🇳 +91</ThemedText></View>
            <TextInput
              style={shared.phoneInput}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.gray}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, "").slice(0, 10))}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
          <PrimaryBtn label="Send OTP" loading={loading} disabled={phone.trim().length < 10} color={PURPLE} onPress={() => handleSendPhoneOtp(phone, setLoading, setStep)} />
          <SecurityNote accent={PURPLE} />
        </>
      ) : (
        <>
          <OtpIllustration bg="#EEE8FF" accent={PURPLE} icon="📱" />
          <ThemedText style={shared.heading}>Verify Your Number</ThemedText>
          <ThemedText style={shared.subHeading}>Enter the 6-digit OTP sent to</ThemedText>
          <EditRow value={`+91 ${phone}`} color={PURPLE} onEdit={() => { setStep("phone"), setOtp(["", "", "", "", "", ""]) }} />
          <OtpBoxes otp={otp} refs={otpRefs} accent={PURPLE} accentBg="#F0EEFF" onChange={handleOtpChange} onKey={handleKey} />
          <ResendRow timer={timer} color={PURPLE} onResend={() => { setOtp(["", "", "", "", "", ""]); setStep("phone"); setTimeout(() => setStep("otp"), 100); }} />
          <PrimaryBtn label="Verify & Login" loading={loading} disabled={otp.join("").length < 6} color={PURPLE} onPress={() => handleVerifyPhoneOtp(phone, otp, setLoading, router,dispatch)} />
          <SecurityNote accent={PURPLE} />
        </>
      )}
    </OtpShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — Gmail OTP Login
// ─────────────────────────────────────────────────────────────────────────────
function GmailOtpScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<GmailOtpStep>("email");
  const [email, setEmail] = useState("");
  // const [email, setEmail] = useState("arv12@gmail.com");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(28);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (step !== "otp") return;
    setTimer(28);
    const iv = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(iv); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [step]);

  // ── OTP box handlers ──────────────────────────────────────────────────────
  const handleOtpChange = (v: string, i: number) => {
    if (v.length > 1) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleKey = (k: string, i: number) => {
    if (k === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""]);
    setStep("email");
    // small delay so useEffect re-fires when going back to "otp"
    setTimeout(() => handleSendmailOtp(email), 100);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <OtpShell
      accentColor={GOOGLE_RED}
      blobColor="rgba(234,67,53,0.08)"
      onBack={step === "otp" ? () => setStep("email") : onBack}
    >
      {step === "email" ? (
        <>
          <OtpIllustration bg="#FFF0EE" accent={GOOGLE_RED} icon="✉️" />
          <ThemedText style={shared.heading}>Enter Your Email</ThemedText>
          <ThemedText style={shared.subHeading}>We'll send a 6-digit OTP to your Gmail</ThemedText>

          <View style={[shared.fieldWrap, email.includes("@") && { borderColor: GOOGLE_RED }]}>
            <Ionicons name="mail-outline" size={20} color={COLORS.gray} />
            <TextInput
              style={shared.fieldInput}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.gray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {email.includes("@") && (
              <Ionicons name="checkmark-circle" size={20} color={GOOGLE_RED} />
            )}
          </View>

          <PrimaryBtn
            label="Send OTP"
            loading={loading}
            color={GOOGLE_RED}
            onPress={() => handleSendmailOtp(email, setLoading, setStep)}
          />
          <SecurityNote accent={GOOGLE_RED} />
        </>
      ) : (
        <>
          <OtpIllustration bg="#FFF0EE" accent={GOOGLE_RED} icon="✉️" />
          <ThemedText style={shared.heading}>Verify Your Email</ThemedText>
          <ThemedText style={shared.subHeading}>Enter the 6-digit OTP sent to</ThemedText>

          <EditRow
            value={email}
            color={GOOGLE_RED}
            onEdit={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); }}
          />

          <OtpBoxes
            otp={otp}
            refs={otpRefs}
            accent={GOOGLE_RED}
            accentBg="#FFF0EE"
            onChange={handleOtpChange}
            onKey={handleKey}
          />

          <ResendRow
            timer={timer}
            color={GOOGLE_RED}
            onResend={handleResend}
          />

          <PrimaryBtn
            label="Verify & Login"
            loading={loading}
            disabled={otp.join("").length < 6}
            color={GOOGLE_RED}
            onPress={() => handleVerifymailOtp(email, otp, setLoading, router,dispatch)}
          />
          <SecurityNote accent={GOOGLE_RED} />
        </>
      )}
    </OtpShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function OtpShell({
  accentColor, blobColor, onBack, children,
}: { accentColor: string; blobColor: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <ThemedView style={shared.container}>
      <View style={[shared.topBlob, { backgroundColor: blobColor }]} />
      <View style={shared.headerRow}>
        <Pressable style={shared.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </Pressable>
        <View style={shared.langPill}>
          <Ionicons name="globe-outline" size={14} color={accentColor} />
          <ThemedText style={[shared.langText, { color: accentColor }]}>English</ThemedText>
          <Ionicons name="chevron-down" size={12} color={accentColor} />
        </View>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={shared.scroll} keyboardShouldPersistTaps="handled">
          <View style={shared.innerPad}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}


function EditRow({ value, color, onEdit }: { value: string; color: string; onEdit: () => void }) {
  return (
    <View style={shared.editRow}>
      <ThemedText style={[shared.accentText, { color }]}>{value}</ThemedText>
      <Pressable onPress={onEdit} style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="pencil" size={13} color={color} />
        <ThemedText style={[shared.editBtnText, { color }]}> Edit</ThemedText>
      </Pressable>
    </View>
  );
}

function OtpBoxes({
  otp, refs, accent, accentBg, onChange, onKey,
}: {
  otp: string[]; refs: React.RefObject<(TextInput | null)[]>;
  accent: string; accentBg: string;
  onChange: (v: string, i: number) => void;
  onKey: (k: string, i: number) => void;
}) {
  return (
    <View style={shared.otpRow}>
      {otp.map((digit, i) => (
        <TextInput
          key={i}
          ref={(r) => { refs.current[i] = r; }}
          style={[shared.otpBox, digit ? { borderColor: accent, backgroundColor: accentBg } : null]}
          value={digit}
          onChangeText={(v) => onChange(v, i)}
          onKeyPress={({ nativeEvent }) => onKey(nativeEvent.key, i)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
        />
      ))}
    </View>
  );
}

function ResendRow({ timer, color, onResend }: { timer: number; color: string; onResend: () => void }) {
  return (
    <View style={shared.resendRow}>
      <ThemedText style={shared.resendLabel}>Didn't receive OTP?  </ThemedText>
      <Pressable onPress={timer === 0 ? onResend : undefined} disabled={timer > 0}>
        <ThemedText style={[shared.resendBtn, { color: timer > 0 ? "#CBD5E1" : color }]}>Resend OTP</ThemedText>
      </Pressable>
      {timer > 0 && (
        <ThemedText style={[shared.timerText, { color }]}>{"  "}00:{timer.toString().padStart(2, "0")}</ThemedText>
      )}
    </View>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// STYLES — Shared
// ─────────────────────────────────────────────────────────────────────────────
const shared = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F4FF" },
  topBlob: { position: "absolute", width: 320, height: 320, borderRadius: 160, top: -120, left: -80 },
  headerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 56 : 36, paddingBottom: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  langPill: {
    flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  langText: { fontSize: 13, fontWeight: "600" },
  scroll: { paddingBottom: 40 },
  innerPad: { paddingHorizontal: 24, paddingTop: 16, alignItems: "center" },

  // illustration
  illuWrap: { width: 130, height: 130, justifyContent: "center", alignItems: "center", marginBottom: 24, position: "relative" },
  illuBox: { width: 96, height: 96, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  illuBubble: { position: "absolute", top: 4, right: -8, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  illuDots: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  illuLock: { position: "absolute", bottom: 2, right: -4, width: 26, height: 26, borderRadius: 13, justifyContent: "center", alignItems: "center" },

  heading: { fontSize: 24, fontWeight: "800", color: "#1E293B", textAlign: "center", marginBottom: 8 },
  subHeading: { fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 6 },

  editRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 26 },
  accentText: { fontSize: 16, fontWeight: "700" },
  editBtnText: { fontSize: 13, fontWeight: "600" },

  // phone
  phoneRow: { flexDirection: "row", width: "100%", marginBottom: 26, gap: 10 },
  cc: { paddingHorizontal: 14, paddingVertical: 16, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0" },
  ccText: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  phoneInput: {
    flex: 1, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "#FFFFFF",
    borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0", fontSize: 16, fontWeight: "600", color: "#1E293B",
  },

  // generic field (email / password)
  fieldWrap: {
    flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 26,
    backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0",
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
  },
  fieldInput: { flex: 1, fontSize: 15, fontWeight: "500", color: "#1E293B" },

  // OTP boxes
  otpRow: { flexDirection: "row", gap: 10, marginBottom: 18, justifyContent: "center", width: "100%" },
  otpBox: {
    width: 48, height: 56, borderRadius: 14, borderWidth: 2, borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF", textAlign: "center", fontSize: 22, fontWeight: "700", color: "#1E293B",
  },

  // resend
  resendRow: { flexDirection: "row", alignItems: "center", marginBottom: 26 },
  resendLabel: { fontSize: 13, color: "#64748B" },
  resendBtn: { fontSize: 13, fontWeight: "700" },
  timerText: { fontSize: 13, fontWeight: "700" },

  // button
  primaryBtn: { width: "100%", borderRadius: 16, overflow: "hidden", marginBottom: 22 },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnGrad: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
  arrowCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
});

// ─────────────────────────────────────────────────────────────────────────────
// STYLES — Selection
// ─────────────────────────────────────────────────────────────────────────────
const sel = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFBFF" },
  blobTopLeft: { position: "absolute", width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(124,111,205,0.12)", top: -90, left: -80 },
  blobBottomRight: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(92,107,192,0.08)", bottom: -60, right: -60 },
  scroll: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 40, alignItems: "center" },
  logoWrap: { alignItems: "center", marginBottom: 20 },
  logoText: { fontSize: 42, fontWeight: "900", letterSpacing: 2 },
  logoTagline: { fontSize: 11, fontWeight: "700", letterSpacing: 2, color: "#64748B", marginTop: 4 },
  taglineCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, marginBottom: 32,
    shadowColor: "#7C6FCD", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, width: "100%",
  },
  logoImage: { width: 150, height: 140, resizeMode: "contain" },
  taglineLine: { fontSize: 14, color: "#475569", textAlign: "center", lineHeight: 22 },
  taglineBold: { fontWeight: "700", color: "#1E293B" },
  loginCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 18,
    paddingHorizontal: 18, paddingVertical: 18, width: "100%",
    shadowColor: "#7C6FCD", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 14, elevation: 5,
    gap: 14, borderWidth: 1.5, borderColor: "transparent",
  },
  loginCardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  loginCardIcon: { width: 56, height: 56, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  loginCardText: { flex: 1 },
  loginCardTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 3 },
  loginCardSub: { fontSize: 13, color: "#64748B", lineHeight: 18 },
  gLogo: { fontSize: 28, fontWeight: "900", color: GOOGLE_RED },
  orRow: { flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 16, gap: 12 },
  orLine: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  orText: { fontSize: 13, fontWeight: "600", color: "#94A3B8" },
});