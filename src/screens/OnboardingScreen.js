import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../components/GradientBackground';
import { CustomButton } from '../components/CustomButton';
import { useTheme } from '../theme/ThemeContext';

const MOODS = [
  { emoji: '😊', label: 'Great' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😡', label: 'Angry' },
];

export const OnboardingScreen = ({ navigation }) => {
  const { theme, typography } = useTheme();
  const [selectedMood, setSelectedMood] = useState(null);

  const handleMoodSelect = (mood) => {
    Haptics.selectionAsync();
    setSelectedMood(mood);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app we would save the mood to AsyncStorage here
    navigation.replace('MainTabs');
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.duration(800).delay(200)} style={styles.header}>
          <Text style={[typography.h1, { color: theme.text, textAlign: 'center' }]}>
            Hi, I'm here for you.
          </Text>
          <Text style={[typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 12 }]}>
            How are you feeling today?
          </Text>
        </Animated.View>

        <View style={styles.moodContainer}>
          {MOODS.map((mood, index) => {
            const isSelected = selectedMood === mood.label;
            return (
              <Animated.View 
                key={mood.label} 
                entering={FadeInUp.duration(500).delay(400 + index * 100)}
              >
                <TouchableOpacity
                  style={[
                    styles.moodButton,
                    { 
                      backgroundColor: isSelected ? theme.primary : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => handleMoodSelect(mood.label)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emoji}>{mood.emoji}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View 
          entering={FadeInUp.duration(800).delay(1000)}
          style={styles.footer}
        >
          {selectedMood && (
            <CustomButton 
              title="Continue" 
              onPress={handleContinue} 
              style={{ width: '100%' }}
            />
          )}
        </Animated.View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 48,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 60,
  },
  moodButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: {
    fontSize: 28,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
});
