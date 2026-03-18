import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  Easing 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../components/GradientBackground';
import { useTheme } from '../theme/ThemeContext';

export const BreathingExerciseScreen = ({ navigation }) => {
  const { theme, typography } = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('Ready to start?');
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  const startBreathing = () => {
    setIsActive(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Breathing cycle: 4s inhale, 4s exhale
    scale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000 }),
        withTiming(0.7, { duration: 4000 })
      ),
      -1,
      true
    );

    // Synchronize text with animation (very basic sync for mockup)
    let isBreatheIn = true;
    setPhase('Breathe In...');
    const interval = setInterval(() => {
      isBreatheIn = !isBreatheIn;
      setPhase(isBreatheIn ? 'Breathe In...' : 'Breathe Out...');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 4000);

    return () => clearInterval(interval);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <GradientBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: theme.text, flex: 1, textAlign: 'center', marginRight: 40 }]}>
          Guided Breathing
        </Text>
      </View>

      <View style={styles.container}>
        <Text style={[typography.h1, { color: theme.text, marginBottom: 60, textAlign: 'center' }]}>
          {phase}
        </Text>

        <View style={styles.circleContainer}>
          <Animated.View 
            style={[
              styles.circle, 
              { backgroundColor: theme.secondary }, 
              animatedStyle
            ]} 
          />
          <View style={[styles.innerCircle, { backgroundColor: theme.primary }]} />
        </View>

        {!isActive && (
          <TouchableOpacity 
            style={[styles.startButton, { backgroundColor: theme.primary }]}
            onPress={startBreathing}
          >
            <Text style={[typography.h3, { color: '#FFF' }]}>Start Exercise</Text>
          </TouchableOpacity>
        )}
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  circleContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 80,
  },
  circle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  startButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    position: 'absolute',
    bottom: 50,
  },
});
