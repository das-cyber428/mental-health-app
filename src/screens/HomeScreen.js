import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '../components/GradientBackground';
import { GlassCard } from '../components/GlassCard';
import { CustomButton } from '../components/CustomButton';
import { useTheme } from '../theme/ThemeContext';

const DashboardAction = ({ iconName, title, onPress, delay }) => {
  const { theme, typography } = useTheme();
  return (
    <Animated.View entering={FadeInRight.duration(500).delay(delay)} style={styles.actionContainer}>
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name={iconName} size={28} color={theme.primary} />
        <Text style={[typography.small, { color: theme.text, marginTop: 12, textAlign: 'center' }]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const HomeScreen = ({ navigation }) => {
  const { theme, typography } = useTheme();

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <Text style={[typography.h2, { color: theme.textSecondary }]}>Good Morning,</Text>
          <Text style={[typography.h1, { color: theme.text, marginTop: 4 }]}>Friend 👋</Text>
        </Animated.View>

        {/* Motivational Quote */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.section}>
          <GlassCard intensity={80} style={{ padding: 20 }}>
            <Ionicons name="leaf" size={24} color={theme.accent} style={{ marginBottom: 12 }} />
            <Text style={[typography.body, { color: theme.text, fontStyle: 'italic', lineHeight: 28 }]}>
              "You don't have to control your thoughts. You just have to stop letting them control you."
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Primary CTA */}
        <Animated.View entering={FadeInUp.duration(600).delay(400)} style={styles.section}>
          <CustomButton 
            title="Talk to AI Companion" 
            icon={<Ionicons name="chatbubbles" size={20} color="#FFF" />}
            onPress={() => navigation.navigate('Chat')}
            style={styles.mainCta}
          />
        </Animated.View>

        {/* Daily Mood Snippet */}
        <Animated.View entering={FadeInUp.duration(600).delay(500)} style={styles.section}>
          <Text style={[typography.h3, { color: theme.text, marginBottom: 16 }]}>Today's Mood</Text>
          <View style={[styles.moodBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.moodFill, { backgroundColor: theme.secondary, width: '70%' }]} />
          </View>
          <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 8 }]}>
            Feeling 'Great' earlier at 9:00 AM
          </Text>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.duration(600).delay(600)} style={[styles.section, { marginBottom: 40 }]}>
          <Text style={[typography.h3, { color: theme.text, marginBottom: 16 }]}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <DashboardAction 
              iconName="water" 
              title="Breathe" 
              delay={700}
              onPress={() => navigation.navigate('Breathing')}
            />
            <DashboardAction 
              iconName="journal" 
              title="Journal" 
              delay={800}
              onPress={() => navigation.navigate('Journal')}
            />
            <DashboardAction 
              iconName="bar-chart" 
              title="Insights" 
              delay={900}
              onPress={() => navigation.navigate('Insights')}
            />
          </View>
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
  },
  header: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  mainCta: {
    paddingVertical: 18,
    borderRadius: 16,
  },
  moodBar: {
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  moodFill: {
    height: '100%',
    borderRadius: 6,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionContainer: {
    width: '31%',
  },
  actionButton: {
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});
