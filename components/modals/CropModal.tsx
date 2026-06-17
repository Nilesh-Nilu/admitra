import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";

const { width: SW, height: SH } = Dimensions.get("window");

const HEADER_H = 100;
const RATIO_BAR_H = 72;
const AVAIL_W = SW - 32;
const AVAIL_H = SH - HEADER_H - RATIO_BAR_H;

const RATIOS = [
  { label: "1:1",  icon: "square-outline",   rw: 1,  rh: 1  },
  { label: "3:4",  icon: "phone-portrait-outline", rw: 3,  rh: 4  },
  { label: "9:16", icon: "phone-portrait-outline", rw: 9,  rh: 16 },
] as const;

function getBox(rw: number, rh: number) {
  const ratio = rw / rh;
  let w = AVAIL_W;
  let h = w / ratio;
  if (h > AVAIL_H) { h = AVAIL_H; w = h * ratio; }
  const l = (SW - w) / 2;
  const t = HEADER_H + (AVAIL_H - h) / 2;
  return { w, h, l, t };
}

type Props = {
  visible: boolean;
  imageUri: string;
  imageWidth: number;
  imageHeight: number;
  onClose: () => void;
  onCrop: (base64Uri: string) => void;
};

export default function CropModal({
  visible, imageUri, imageWidth, imageHeight, onClose, onCrop,
}: Props) {
  const [isCropping, setIsCropping] = useState(false);
  const [ratioIdx, setRatioIdx] = useState(0);

  const { rw, rh } = RATIOS[ratioIdx];
  const { w: BOX_W, h: BOX_H, l: BOX_L, t: BOX_T } = getBox(rw, rh);

  // Base scale: fit image width to screen
  const baseScale = SW / imageWidth;
  const dispH = imageHeight * baseScale;
  const initY = (SH - dispH) / 2;

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const savedScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      tx.value = 0; ty.value = 0; scale.value = 1;
      savedTx.value = 0; savedTy.value = 0; savedScale.value = 1;
    }
  }, [visible, imageUri, ratioIdx]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(6, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const gesture = Gesture.Simultaneous(pan, pinch);

  const imgStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  const doCrop = async () => {
    setIsCropping(true);
    try {
      const s = scale.value;
      const scaledW = SW * s;
      const scaledH = dispH * s;

      const imgLeft = (SW - scaledW) / 2 + tx.value;
      const imgTop = initY + (dispH - scaledH) / 2 + ty.value;

      const relX = BOX_L - imgLeft;
      const relY = BOX_T - imgTop;

      const totalScale = baseScale * s;
      const originX = Math.max(0, Math.round(relX / totalScale));
      const originY = Math.max(0, Math.round(relY / totalScale));
      const cropW = Math.min(Math.round(BOX_W / totalScale), imageWidth - originX);
      const cropH = Math.min(Math.round(BOX_H / totalScale), imageHeight - originY);

      if (cropW <= 0 || cropH <= 0) { runOnJS(setIsCropping)(false); return; }

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ crop: { originX, originY, width: cropW, height: cropH } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      onCrop(`data:image/jpeg;base64,${result.base64}`);
    } catch (e) {
      console.log("Crop error:", e);
    }
    setIsCropping(false);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        {/* Pannable + Zoomable image */}
        <GestureDetector gesture={gesture}>
          <Animated.View style={StyleSheet.absoluteFill}>
            <Animated.Image
              source={{ uri: imageUri }}
              style={[styles.img, { width: SW, height: dispH, top: initY }, imgStyle]}
              resizeMode="cover"
            />
          </Animated.View>
        </GestureDetector>

        {/* Overlay — 4 dark panels around crop box */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={[styles.dim, { top: 0, left: 0, right: 0, height: BOX_T }]} />
          <View style={[styles.dim, { top: BOX_T + BOX_H, left: 0, right: 0, bottom: 0 }]} />
          <View style={[styles.dim, { top: BOX_T, left: 0, width: BOX_L, height: BOX_H }]} />
          <View style={[styles.dim, { top: BOX_T, left: BOX_L + BOX_W, right: 0, height: BOX_H }]} />

          {/* Crop border */}
          <View style={[styles.border, { top: BOX_T, left: BOX_L, width: BOX_W, height: BOX_H }]} />

          {/* Grid (rule of thirds) */}
          <View style={[styles.grid, { top: BOX_T + BOX_H / 3,       left: BOX_L, width: BOX_W, height: 1 }]} />
          <View style={[styles.grid, { top: BOX_T + (BOX_H * 2) / 3, left: BOX_L, width: BOX_W, height: 1 }]} />
          <View style={[styles.grid, { top: BOX_T, left: BOX_L + BOX_W / 3,       width: 1, height: BOX_H }]} />
          <View style={[styles.grid, { top: BOX_T, left: BOX_L + (BOX_W * 2) / 3, width: 1, height: BOX_H }]} />

          {/* Corner L-brackets */}
          <C t={BOX_T}          l={BOX_L}          />
          <C t={BOX_T}          l={BOX_L + BOX_W}  fh />
          <C t={BOX_T + BOX_H}  l={BOX_L}          fv />
          <C t={BOX_T + BOX_H}  l={BOX_L + BOX_W}  fh fv />
        </View>

        {/* Header */}
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity onPress={onClose} style={styles.btn}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
          <ThemedText style={styles.hint}>Pan & pinch to adjust</ThemedText>
          <TouchableOpacity onPress={doCrop} style={styles.btn} disabled={isCropping}>
            {isCropping
              ? <ActivityIndicator color="#fff" size="small" />
              : <ThemedText style={styles.done}>Done</ThemedText>}
          </TouchableOpacity>
        </View>

        {/* Ratio selector */}
        <View style={styles.ratioBar}>
          {RATIOS.map((r, i) => (
            <TouchableOpacity
              key={r.label}
              style={[styles.ratioBtn, i === ratioIdx && styles.ratioBtnActive]}
              onPress={() => setRatioIdx(i)}
            >
              <RatioIcon rw={r.rw} rh={r.rh} active={i === ratioIdx} />
              <ThemedText style={[styles.ratioLabel, i === ratioIdx && styles.ratioLabelActive]}>
                {r.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

/** Tiny visual icon representing the aspect ratio box */
function RatioIcon({ rw, rh, active }: { rw: number; rh: number; active: boolean }) {
  const maxW = 22, maxH = 22;
  const r = rw / rh;
  let w = maxW, h = maxW / r;
  if (h > maxH) { h = maxH; w = h * r; }
  return (
    <View style={{
      width: w, height: h,
      borderWidth: 2,
      borderColor: active ? '#fff' : 'rgba(255,255,255,0.45)',
      borderRadius: 2,
      marginBottom: 4,
    }} />
  );
}

const LEN = 24;
const THK = 3;
function C({ t, l, fh = false, fv = false }: { t: number; l: number; fh?: boolean; fv?: boolean }) {
  return (
    <>
      <View style={{
        position: "absolute",
        top: fv ? t - THK : t,
        left: fh ? l - LEN : l,
        width: LEN, height: THK,
        backgroundColor: "#fff",
      }} />
      <View style={{
        position: "absolute",
        top: fv ? t - LEN : t,
        left: fh ? l - THK : l,
        width: THK, height: LEN,
        backgroundColor: "#fff",
      }} />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  img: { position: "absolute" },
  dim: { position: "absolute", backgroundColor: "rgba(0,0,0,0.58)" },
  border: { position: "absolute", borderWidth: 1, borderColor: "rgba(255,255,255,0.9)" },
  grid: { position: "absolute", backgroundColor: "rgba(255,255,255,0.22)" },
  header: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  btn: { width: 52, alignItems: "center" },
  hint: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "500" },
  done: { color: "#fff", fontSize: 17, fontWeight: "700" },
  ratioBar: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: RATIO_BAR_H,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingBottom: 12,
  },
  ratioBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratioBtnActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  ratioLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  ratioLabelActive: {
    color: "#fff",
  },
});
