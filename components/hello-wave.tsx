import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export function HelloWave() {
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Animate back and forth
    rotate.value = withRepeat(
      withTiming(25, { duration: 300 }),
      4, // number of iterations
      true // reverse direction
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotate.value}deg`,
        },
      ],
    };
  });

  return (
    <Animated.Text style={[{ fontSize: 28, lineHeight: 32, marginTop: -6 }, animatedStyle]}>
      👋
    </Animated.Text>
  );
}
