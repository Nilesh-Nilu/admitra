// CourseListCard.tsx
import { COLORS } from '@/constants/Colors';
import { SIZES } from '@/constants/Sizes';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from '../ThemedText';

type Props = {
  course: any;
  onPress: () => void;
  progress?: {
    currentTime: number;
    duration: number;
    percent: number;
  };
  isSelected?: boolean;
};

export default function CourseListCard({
  course,
  onPress,
  progress,
  isSelected,
}: Props) {
  // Decide which source to use
  const imageUri = course.image || course.video; // video URL works as Image source on most platforms

  return (
    <Pressable
      style={[
        styles.container,
      ]}
      onPress={onPress}
    >
      {/* Background image / thumbnail */}
      <ImageBackground
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
        // fallback icon if load fails
        defaultSource={require('@/assets/images/icon.png')}
      >
        {/* Play icon overlay */}
        <View style={styles.playIconOverlay}>
          <View style={styles.playCircle}>
            <ThemedText style={styles.playIcon}>▶</ThemedText>
          </View>
        </View>
      </ImageBackground>

      {/* Metadata */}
      <View style={styles.textContainer}>
        <ThemedText style={styles.title} numberOfLines={2}>
          {course.name || course.video_name}
        </ThemedText>

        {/* Progress bar */}
        {progress ? (
          <View style={styles.progressRow}>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.min(progress.percent, 100)}%` },
                ]}
              />
            </View>
            <ThemedText style={styles.percentText}>
              {progress.percent}%
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius10,
    elevation: 2,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  image: {
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 2,
  },
  textContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray,
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  percentText: {
    fontSize: 10,
    color: COLORS.primary,
    marginLeft: 6,
  },
});