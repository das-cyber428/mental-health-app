import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../components/GradientBackground';
import { GlassCard } from '../components/GlassCard';
import { useTheme } from '../theme/ThemeContext';

const WEEK_DATA = [
  { day: 'Mon', value: 0.6, emoji: '😊' },
  { day: 'Tue', value: 0.4, emoji: '😔' },
  { day: 'Wed', value: 0.7, emoji: '😊' },
  { day: 'Thu', value: 0.8, emoji: '😁' },
  { day: 'Fri', value: 0.3, emoji: '😰' },
  { day: 'Sat', value: 0.9, emoji: '🥰' },
  { day: 'Sun', value: 0.7, emoji: '😊' },
];

const AnimatedBar = ({ value, label, emoji, delay }) => {
  const { theme, typography } = useTheme();
  const heightProgress = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      heightProgress.value = withTiming(value * 150, {
        duration: 1000,
        easing: Easing.out(Easing.exp),
      });
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightProgress.value,
  }));

  return (
    <View style={styles.barContainer}>
      <Text style={[typography.small, { marginBottom: 8 }]}>{emoji}</Text>
      <View style={[styles.barBackground, { backgroundColor: theme.border }]}>
        <Animated.View style={[styles.barFill, { backgroundColor: theme.primary }, animatedStyle]} />
      </View>
      <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 8 }]}>{label}</Text>
    </View>
  );
};

export const MoodTrackerScreen = () => {
  const { theme, typography } = useTheme();

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        <Animated.View entering={FadeInUp.duration(600)}>
          <Text style={[typography.h1, { color: theme.text, marginBottom: 8 }]}>Your Weekly Insights</Text>
          <Text style={[typography.body, { color: theme.textSecondary, marginBottom: 32 }]}>
            Understanding your emotional patterns.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(200)}>
          <GlassCard style={styles.chartCard} intensity={80}>
            <View style={styles.chartRow}>
              {WEEK_DATA.map((item, index) => (
                <AnimatedBar 
                  key={index} 
                  value={item.value} 
                  label={item.day} 
                  emoji={item.emoji}
                  delay={400 + index * 100} 
                />
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(800)}>
          <Text style={[typography.h3, { color: theme.text, marginTop: 32, marginBottom: 16 }]}>Key Insights</Text>
          
          <GlassCard style={styles.insightCard} intensity={60}>
            <View style={[styles.iconBox, { backgroundColor: theme.secondary }]}>
              <Ionicons name="sunny" size={24} color="#FFF" />
            </View>
            <View style={styles.insightText}>
              <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Morning Energy</Text>
              <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
                You generally feel more positive when you log your mood before 10 AM.
              </Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.insightCard} intensity={60}>
            <View style={[styles.iconBox, { backgroundColor: theme.accent }]}>
              <Ionicons name="fitness" size={24} color="#FFF" />
            </View>
            <View style={styles.insightText}>
              <Text style={[typography.body, { color: theme.text, fontWeight: '600' }]}>Movement Helps</Text>
              <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
                You felt instantly better on Thursday and Saturday after completing a walk.
              </Text>
            </View>
          </GlassCard>

        </Animated.View>

      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  chartCard: {
    padding: 20,
    paddingTop: 30,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barBackground: {
    width: 12,
    height: 150,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightText: {
    flex: 1,
  },
});
