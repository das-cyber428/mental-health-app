import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GradientBackground } from '../components/GradientBackground';
import { useTheme } from '../theme/ThemeContext';

const PROMPTS = [
  "What made you feel happy today?",
  "What is worrying you right now?",
  "List three things you are grateful for.",
  "Write a letter to your past self."
];

export const JournalScreen = () => {
  const { theme, typography } = useTheme();
  const [entry, setEntry] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPTS[0]);

  const handleSave = () => {
    // Save logic goes here
    setEntry('');
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Text style={[typography.h1, { color: theme.text, marginBottom: 24 }]}>Daily Journal</Text>
          
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={[typography.caption, { color: theme.textSecondary, marginBottom: 8 }]}>Writing Prompt</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptList} contentContainerStyle={{ paddingRight: 24 }}>
              {PROMPTS.map((prompt, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.promptChip, 
                    { 
                      backgroundColor: selectedPrompt === prompt ? theme.primary : theme.surface,
                      borderColor: selectedPrompt === prompt ? theme.primary : theme.border
                    }
                  ]}
                  onPress={() => setSelectedPrompt(prompt)}
                >
                  <Text style={[typography.small, { color: selectedPrompt === prompt ? '#FFF' : theme.text }]}>
                    {prompt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          <View style={[styles.editorContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[typography.h3, { color: theme.text, marginBottom: 16 }]}>{selectedPrompt}</Text>
            <TextInput
              style={[styles.input, typography.body, { color: theme.text }]}
              placeholder="Start writing here..."
              placeholderTextColor={theme.textSecondary}
              multiline
              textAlignVertical="top"
              value={entry}
              onChangeText={setEntry}
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: entry.trim() ? theme.primary : theme.border }]}
            onPress={handleSave}
            disabled={!entry.trim()}
          >
            <Ionicons name="checkmark" size={24} color="#FFF" />
            <Text style={[typography.h3, { color: '#FFF', marginLeft: 8 }]}>Save Entry</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  promptList: {
    marginBottom: 24,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  promptChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  editorContainer: {
    flex: 1,
    minHeight: 300,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    minHeight: 200,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
});
