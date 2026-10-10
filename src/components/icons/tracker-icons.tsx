import { Image, View, type ImageSourcePropType } from 'react-native';

type TrackerIconProps = {
  size?: number;
};

export type { TrackerIconProps };

type ArtworkBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type TrackerIconImageProps = TrackerIconProps & {
  source: ImageSourcePropType;
  sourceWidth: number;
  sourceHeight: number;
  artworkBounds: ArtworkBounds;
};

// The exported PNGs have large transparent borders; fit only their artwork bounds to size.
function TrackerIconImage({
  size = 32,
  source,
  sourceWidth,
  sourceHeight,
  artworkBounds,
}: TrackerIconImageProps) {
  const scale = size / Math.max(artworkBounds.width, artworkBounds.height);
  const imageWidth = sourceWidth * scale;
  const imageHeight = sourceHeight * scale;
  const left = (size - artworkBounds.width * scale) / 2 - artworkBounds.x * scale;
  const top = (size - artworkBounds.height * scale) / 2 - artworkBounds.y * scale;

  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image
        source={source}
        resizeMode="contain"
        style={{ position: 'absolute', width: imageWidth, height: imageHeight, left, top }}
      />
    </View>
  );
}

export function WaterIcon({ size }: TrackerIconProps) {
  return (
    <TrackerIconImage
      size={size}
      source={require('../../../assets/icons/water.png')}
      sourceWidth={132}
      sourceHeight={132}
      artworkBounds={{ x: 42, y: 40, width: 30, height: 39 }}
    />
  );
}

export function SleepIcon({ size }: TrackerIconProps) {
  return (
    <TrackerIconImage
      size={size}
      source={require('../../../assets/icons/sleep.png')}
      sourceWidth={143}
      sourceHeight={143}
      artworkBounds={{ x: 40, y: 43, width: 49, height: 47 }}
    />
  );
}

export function WeightIcon({ size }: TrackerIconProps) {
  return (
    <TrackerIconImage
      size={size}
      source={require('../../../assets/icons/weight.png')}
      sourceWidth={153}
      sourceHeight={154}
      artworkBounds={{ x: 45, y: 49, width: 49, height: 46 }}
    />
  );
}

export function StepsIcon({ size }: TrackerIconProps) {
  return (
    <TrackerIconImage
      size={size}
      source={require('../../../assets/icons/step.png')}
      sourceWidth={132}
      sourceHeight={132}
      artworkBounds={{ x: 41, y: 38, width: 36, height: 41 }}
    />
  );
}

export function DietIcon({ size }: TrackerIconProps) {
  return (
    <TrackerIconImage
      size={size}
      source={require('../../../assets/icons/calorie.png')}
      sourceWidth={132}
      sourceHeight={132}
      artworkBounds={{ x: 41, y: 36, width: 35, height: 39 }}
    />
  );
}
