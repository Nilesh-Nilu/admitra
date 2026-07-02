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
} from "react-native-reanimated";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";

const { width: SW, height: SH } = Dimensions.get("window");

const HEADER_H = 100;
const RATIO_BAR_H = 72;
const AVAIL_H = SH - HEADER_H - RATIO_BAR_H;
const HANDLE = 32;   // touch target for corner handles
const MIN_SIZE = 60;

const RATIOS = [
  { label: "Free", rw: 0, rh: 0 },
  { label: "1:1",  rw: 1, rh: 1 },
  { label: "3:4",  rw: 3, rh: 4 },
  { label: "9:16", rw: 9, rh: 16 },
] as const;

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

  // Fit image within the available area
  const baseScale = Math.min(SW / imageWidth, AVAIL_H / imageHeight);
  const imgW = imageWidth * baseScale;
  const imgH = imageHeight * baseScale;
  const imgL = (SW - imgW) / 2;
  const imgT = HEADER_H + (AVAIL_H - imgH) / 2;

  const { rw, rh } = RATIOS[ratioIdx];
  const ratioLocked = rw > 0;
  const aspectRatio = ratioLocked ? rh / rw : 1; // height per unit width

  function getInitBox() {
    if (!ratioLocked) return { x: imgL, y: imgT, w: imgW, h: imgH };
    const r = rw / rh;
    let w = imgW, h = w / r;
    if (h > imgH) { h = imgH; w = h * r; }
    return { x: imgL + (imgW - w) / 2, y: imgT + (imgH - h) / 2, w, h };
  }

  // Crop box shared values
  const bx = useSharedValue(imgL);
  const by = useSharedValue(imgT);
  const bw = useSharedValue(imgW);
  const bh = useSharedValue(imgH);

  // Saved start values for gestures
  const sx = useSharedValue(imgL);
  const sy = useSharedValue(imgT);
  const sw = useSharedValue(imgW);
  const sh = useSharedValue(imgH);

  const resetBox = (idx: number) => {
    const { rw: rw2, rh: rh2 } = RATIOS[idx];
    const locked = rw2 > 0;
    let x = imgL, y = imgT, w = imgW, h = imgH;
    if (locked) {
      const r = rw2 / rh2;
      w = imgW; h = w / r;
      if (h > imgH) { h = imgH; w = h * r; }
      x = imgL + (imgW - w) / 2;
      y = imgT + (imgH - h) / 2;
    }
    bx.value = x; by.value = y; bw.value = w; bh.value = h;
    sx.value = x; sy.value = y; sw.value = w; sh.value = h;
  };

  useEffect(() => { if (visible) resetBox(ratioIdx); }, [visible, imageUri]);

  const handleRatioChange = (idx: number) => {
    setRatioIdx(idx);
    resetBox(idx);
  };

  // ── Move gesture (drag inside box) ──
  const moveGesture = Gesture.Pan()
    .onBegin(() => { sx.value = bx.value; sy.value = by.value; })
    .onUpdate((e) => {
      bx.value = Math.max(imgL, Math.min(imgL + imgW - bw.value, sx.value + e.translationX));
      by.value = Math.max(imgT, Math.min(imgT + imgH - bh.value, sy.value + e.translationY));
    });

  // ── Bottom-right corner ──
  const brGesture = Gesture.Pan()
    .onBegin(() => { sw.value = bw.value; sh.value = bh.value; })
    .onUpdate((e) => {
      let nw = Math.max(MIN_SIZE, Math.min(imgL + imgW - bx.value, sw.value + e.translationX));
      let nh = ratioLocked ? nw * aspectRatio : Math.max(MIN_SIZE, Math.min(imgT + imgH - by.value, sh.value + e.translationY));
      if (ratioLocked && by.value + nh > imgT + imgH) { nh = imgT + imgH - by.value; nw = nh / aspectRatio; }
      bw.value = nw; bh.value = nh;
    });

  // ── Bottom-left corner ──
  const blGesture = Gesture.Pan()
    .onBegin(() => { sx.value = bx.value; sw.value = bw.value; sh.value = bh.value; })
    .onUpdate((e) => {
      const rightEdge = sx.value + sw.value;
      let nw = Math.max(MIN_SIZE, Math.min(rightEdge - imgL, sw.value - e.translationX));
      let nh = ratioLocked ? nw * aspectRatio : Math.max(MIN_SIZE, Math.min(imgT + imgH - by.value, sh.value + e.translationY));
      if (ratioLocked && by.value + nh > imgT + imgH) { nh = imgT + imgH - by.value; nw = nh / aspectRatio; }
      bx.value = rightEdge - nw;
      bw.value = nw; bh.value = nh;
    });

  // ── Top-right corner ──
  const trGesture = Gesture.Pan()
    .onBegin(() => { sy.value = by.value; sw.value = bw.value; sh.value = bh.value; })
    .onUpdate((e) => {
      const bottomEdge = sy.value + sh.value;
      let nw = Math.max(MIN_SIZE, Math.min(imgL + imgW - bx.value, sw.value + e.translationX));
      let nh = ratioLocked ? nw * aspectRatio : Math.max(MIN_SIZE, Math.min(bottomEdge - imgT, sh.value - e.translationY));
      if (ratioLocked && bottomEdge - nh < imgT) { nh = bottomEdge - imgT; nw = nh / aspectRatio; }
      by.value = bottomEdge - nh;
      bw.value = nw; bh.value = nh;
    });

  // ── Top-left corner ──
  const tlGesture = Gesture.Pan()
    .onBegin(() => { sx.value = bx.value; sy.value = by.value; sw.value = bw.value; sh.value = bh.value; })
    .onUpdate((e) => {
      const rightEdge = sx.value + sw.value;
      const bottomEdge = sy.value + sh.value;
      let nw = Math.max(MIN_SIZE, Math.min(rightEdge - imgL, sw.value - e.translationX));
      let nh = ratioLocked ? nw * aspectRatio : Math.max(MIN_SIZE, Math.min(bottomEdge - imgT, sh.value - e.translationY));
      if (ratioLocked && bottomEdge - nh < imgT) { nh = bottomEdge - imgT; nw = nh / aspectRatio; }
      bx.value = rightEdge - nw;
      by.value = bottomEdge - nh;
      bw.value = nw; bh.value = nh;
    });

  // ── Animated styles ──
  const boxStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: bx.value, top: by.value,
    width: bw.value, height: bh.value,
  }));

  const overlayTop = useAnimatedStyle(() => ({
    position: "absolute", top: 0, left: 0, right: 0, height: by.value,
  }));
  const overlayBottom = useAnimatedStyle(() => ({
    position: "absolute", top: by.value + bh.value, left: 0, right: 0, bottom: 0,
  }));
  const overlayLeft = useAnimatedStyle(() => ({
    position: "absolute", top: by.value, left: 0, width: bx.value, height: bh.value,
  }));
  const overlayRight = useAnimatedStyle(() => ({
    position: "absolute", top: by.value, left: bx.value + bw.value, right: 0, height: bh.value,
  }));

  const gridV1 = useAnimatedStyle(() => ({ position: "absolute", top: by.value, left: bx.value + bw.value / 3,       width: 1, height: bh.value }));
  const gridV2 = useAnimatedStyle(() => ({ position: "absolute", top: by.value, left: bx.value + (bw.value * 2) / 3, width: 1, height: bh.value }));
  const gridH1 = useAnimatedStyle(() => ({ position: "absolute", top: by.value + bh.value / 3,       left: bx.value, width: bw.value, height: 1 }));
  const gridH2 = useAnimatedStyle(() => ({ position: "absolute", top: by.value + (bh.value * 2) / 3, left: bx.value, width: bw.value, height: 1 }));

  // Border
  const borderStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: bx.value, top: by.value,
    width: bw.value, height: bh.value,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
  }));

  // Corner handle positions
  const tlStyle = useAnimatedStyle(() => ({ position: "absolute", top: by.value - HANDLE / 2, left: bx.value - HANDLE / 2, width: HANDLE, height: HANDLE }));
  const trStyle = useAnimatedStyle(() => ({ position: "absolute", top: by.value - HANDLE / 2, left: bx.value + bw.value - HANDLE / 2, width: HANDLE, height: HANDLE }));
  const blStyle = useAnimatedStyle(() => ({ position: "absolute", top: by.value + bh.value - HANDLE / 2, left: bx.value - HANDLE / 2, width: HANDLE, height: HANDLE }));
  const brStyle = useAnimatedStyle(() => ({ position: "absolute", top: by.value + bh.value - HANDLE / 2, left: bx.value + bw.value - HANDLE / 2, width: HANDLE, height: HANDLE }));

  const doCrop = async () => {
    setIsCropping(true);
    try {
      const originX = Math.max(0, Math.round((bx.value - imgL) / baseScale));
      const originY = Math.max(0, Math.round((by.value - imgT) / baseScale));
      const cropW   = Math.min(Math.round(bw.value / baseScale), imageWidth - originX);
      const cropH   = Math.min(Math.round(bh.value / baseScale), imageHeight - originY);

      if (cropW <= 0 || cropH <= 0) { setIsCropping(false); return; }

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

        {/* Fixed image */}
        <Animated.Image
          source={{ uri: imageUri }}
          style={{ position: "absolute", left: imgL, top: imgT, width: imgW, height: imgH }}
          resizeMode="cover"
        />

        {/* Dark overlays around crop box */}
        <Animated.View pointerEvents="none" style={[overlayTop,    styles.dim]} />
        <Animated.View pointerEvents="none" style={[overlayBottom, styles.dim]} />
        <Animated.View pointerEvents="none" style={[overlayLeft,   styles.dim]} />
        <Animated.View pointerEvents="none" style={[overlayRight,  styles.dim]} />

        {/* Grid lines */}
        <Animated.View pointerEvents="none" style={[gridV1, styles.grid]} />
        <Animated.View pointerEvents="none" style={[gridV2, styles.grid]} />
        <Animated.View pointerEvents="none" style={[gridH1, styles.grid]} />
        <Animated.View pointerEvents="none" style={[gridH2, styles.grid]} />

        {/* Crop border */}
        <Animated.View pointerEvents="none" style={borderStyle} />

        {/* Move gesture — interior of box */}
        <GestureDetector gesture={moveGesture}>
          <Animated.View style={boxStyle} />
        </GestureDetector>

        {/* Corner handles (on top so they take gesture priority) */}
        <GestureDetector gesture={tlGesture}>
          <Animated.View style={tlStyle}>
            <View style={[styles.cornerH, styles.cornerTL_H]} />
            <View style={[styles.cornerV, styles.cornerTL_V]} />
          </Animated.View>
        </GestureDetector>

        <GestureDetector gesture={trGesture}>
          <Animated.View style={trStyle}>
            <View style={[styles.cornerH, styles.cornerTR_H]} />
            <View style={[styles.cornerV, styles.cornerTR_V]} />
          </Animated.View>
        </GestureDetector>

        <GestureDetector gesture={blGesture}>
          <Animated.View style={blStyle}>
            <View style={[styles.cornerH, styles.cornerBL_H]} />
            <View style={[styles.cornerV, styles.cornerBL_V]} />
          </Animated.View>
        </GestureDetector>

        <GestureDetector gesture={brGesture}>
          <Animated.View style={brStyle}>
            <View style={[styles.cornerH, styles.cornerBR_H]} />
            <View style={[styles.cornerV, styles.cornerBR_V]} />
          </Animated.View>
        </GestureDetector>

        {/* Header */}
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity onPress={onClose} style={styles.btn}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
          <ThemedText style={styles.hint}>Drag corners to crop</ThemedText>
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
              onPress={() => handleRatioChange(i)}
            >
              <RatioIcon rw={r.rw || 1} rh={r.rh || 1} active={i === ratioIdx} />
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

function RatioIcon({ rw, rh, active }: { rw: number; rh: number; active: boolean }) {
  const maxW = 22, maxH = 22;
  const r = rw / rh;
  let w = maxW, h = maxW / r;
  if (h > maxH) { h = maxH; w = h * r; }
  return (
    <View style={{
      width: w, height: h,
      borderWidth: 2,
      borderColor: active ? "#fff" : "rgba(255,255,255,0.45)",
      borderRadius: 2,
      marginBottom: 4,
    }} />
  );
}

const LEN = 20;
const THK = 3;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  dim:  { backgroundColor: "rgba(0,0,0,0.58)" },
  grid: { backgroundColor: "rgba(255,255,255,0.22)" },

  // Corner bracket pieces
  cornerH: { position: "absolute", width: LEN, height: THK, backgroundColor: "#fff" },
  cornerV: { position: "absolute", width: THK, height: LEN, backgroundColor: "#fff" },
  cornerTL_H: { top: HANDLE / 2 - THK / 2, left: HANDLE / 2 },
  cornerTL_V: { top: HANDLE / 2,            left: HANDLE / 2 - THK / 2 },
  cornerTR_H: { top: HANDLE / 2 - THK / 2, right: HANDLE / 2 },
  cornerTR_V: { top: HANDLE / 2,            right: HANDLE / 2 - THK / 2 },
  cornerBL_H: { bottom: HANDLE / 2 - THK / 2, left: HANDLE / 2 },
  cornerBL_V: { bottom: HANDLE / 2,            left: HANDLE / 2 - THK / 2 },
  cornerBR_H: { bottom: HANDLE / 2 - THK / 2, right: HANDLE / 2 },
  cornerBR_V: { bottom: HANDLE / 2,            right: HANDLE / 2 - THK / 2 },

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
  btn:  { width: 52, alignItems: "center" },
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
  ratioBtnActive: { backgroundColor: "rgba(255,255,255,0.15)" },
  ratioLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
  ratioLabelActive: { color: "#fff" },
});
