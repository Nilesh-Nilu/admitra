import { ThemedText } from "@/components/ThemedText";
import { COLORS } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import { useState, useEffect } from "react";

interface ImageZoomModalProps {
  visible: boolean;
  images: Array<{ url: string } | { image_path: string } | { image: string }>;
  initialIndex?: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export default function ImageZoomModal({
  visible,
  images,
  initialIndex = 0,
  onClose,
  onIndexChange,
}: ImageZoomModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setSelectedIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  const handleIndexChange = (index?: number) => {
    const newIndex = index || 0;
    setSelectedIndex(newIndex);
    onIndexChange?.(newIndex);
  };

  const zoomImages = images.map((img: any) => ({
    url: img.url || img.image_path || img.image,
  }));

  if (zoomImages.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color={COLORS.white} />
        </TouchableOpacity>

        {/* Image Counter */}
        {zoomImages.length > 1 && (
          <View style={styles.imageCounter}>
            <ThemedText style={styles.counterText}>
              {selectedIndex + 1} / {zoomImages.length}
            </ThemedText>
          </View>
        )}

        {/* Zoomable Image Viewer */}
        <ImageViewer
          imageUrls={zoomImages}
          index={selectedIndex}
          onChange={handleIndexChange}
          onCancel={onClose}
          enableSwipeDown={true}
          onSwipeDown={onClose}
          saveToLocalByLongPress={false}
          renderIndicator={() => <></>}
          backgroundColor="transparent"
          style={styles.viewer}
        />

        {/* Zoom Hint */}
        <View style={styles.hintContainer}>
          <ThemedText style={styles.hintText}>
            Pinch to zoom • Swipe to navigate • Swipe down to close
          </ThemedText>
        </View>

        {/* Dots Indicator */}
        {zoomImages.length > 1 && (
          <View style={styles.dotsRow}>
            {zoomImages.map((_: any, i: number) => (
              <View
                key={i}
                style={[styles.dot, i === selectedIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCounter: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  counterText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  viewer: {
    flex: 1,
  },
  hintContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  hintText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dotsRow: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    backgroundColor: COLORS.white,
    width: 20,
  },
});
