import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

export const TRACKER_MASCOT_STAGE_HEIGHT = 240;
export const TRACKER_MASCOT_SIZE = 232;
export const TRACKER_HERO_BACKGROUND_HEIGHT = 380;

type TrackerMascotProps = {
  source: ImageSourcePropType;
  accessibilityLabel: string;
};

export function TrackerMascot({ source, accessibilityLabel }: TrackerMascotProps) {
  return (
    <View style={styles.stage}>
      <Image
        accessibilityLabel={accessibilityLabel}
        accessible
        resizeMode="contain"
        source={source}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: TRACKER_MASCOT_STAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    position: 'relative',
    zIndex: 2,
  },
  image: {
    width: TRACKER_MASCOT_SIZE,
    height: TRACKER_MASCOT_SIZE,
    transform: [{ translateY: 24 }],
  },
});
