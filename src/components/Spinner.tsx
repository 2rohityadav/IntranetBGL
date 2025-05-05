import React from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';

interface SpinnerProps {
  visible: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({visible}) => {
  const animatedValues = React.useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  React.useEffect(() => {
    if (visible) {
      const animations = animatedValues.map((value, _index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        );
      });

      animations.forEach((animation, index) => {
        setTimeout(() => {
          animation.start();
        }, index * 500);
      });

      return () => {
        animations.forEach(animation => animation.stop());
      };
    }
  }, [visible, animatedValues]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.spinnerWrapper}>
      <View style={styles.spinner}>
        {animatedValues.map((value, index) => (
          <Animated.View
            key={index}
            style={[
              styles.circle,
              {
                transform: [
                  {
                    scale: value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1.3],
                    }),
                  },
                ],
                opacity: value.interpolate({
                  inputRange: [0, 0.8, 1],
                  outputRange: [1, 0.2, 0],
                }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  spinnerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  spinner: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderWidth: 3,
    borderColor: 'rgba(102, 102, 102, 0.5)',
    borderRadius: 30,
  },
});

export default Spinner;
