import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, Keyboard
} from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, withRepeat, withTiming, withSequence, useSharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { GradientBackground } from '../components/GradientBackground';
import { useTheme } from '../theme/ThemeContext';

const SUGGESTIONS = [
  "I feel anxious",
  "I can't sleep",
  "I feel lonely",
  "I need to vent"
];

// Enhanced Mock AI Logic
const MOCK_RESPONSES = [
  "I understand. It takes a lot of courage to talk about this.",
  "That sounds really challenging. How does that make you feel in your body?",
  "I'm here for you. We can take this one step at a time.",
  "It's completely normal to feel that way given the circumstances.",
  "Thank you for sharing that with me. What do you think would help you feel a bit more grounded right now?",
  "I hear you. Sometimes just acknowledging these feelings is an important first step.",
  "That makes a lot of sense. You've been carrying a lot.",
  "I'm listening. Please take your time.",
];

let responseIndex = 0;

const generateAIResponse = (text) => {
  const lower = text.toLowerCase();
  
  if (lower.includes('anxious') || lower.includes('anxiety') || lower.includes('panic')) {
    return "I hear you. Anxiety can be really overwhelming. Take a slow, deep breath with me. What is the main thing making you feel this way right now?";
  }
  if (lower.includes('sleep') || lower.includes('tired') || lower.includes('exhausted')) {
    return "It's so frustrating when you want to rest but your mind won't let you. Sometimes a quick body scan or focusing on your breathing can help. Would you like to try a short breathing exercise?";
  }
  if (lower.includes('lonely') || lower.includes('alone')) {
    return "I'm really glad you reached out. Feeling lonely is tough, but you are not alone right now. I'm here to listen. Do you want to talk about what's on your mind?";
  }
  if (lower.includes('yes') || lower.includes('yeah') || lower.includes('ok')) {
    return "Great. Let's take a deep breath together. Inhale slowly for 4 seconds... and exhale. How are you feeling now?";
  }
  if (lower.includes('morning') || lower.includes('night') || lower.includes('day')) {
    return "The time of day can definitely impact our mood and energy levels. How does this usually affect your routine?";
  }
  if (lower.match(/\b(years|months|weeks|days)\b/)) {
    return "That's a significant amount of time to be dealing with this. It shows how resilient you are. What has helped you cope during this time?";
  }

  // Cycle through varied general responses instead of repeating the same one
  const response = MOCK_RESPONSES[responseIndex % MOCK_RESPONSES.length];
  responseIndex++;
  return response;
};

const TypingIndicator = () => {
  const { theme } = useTheme();
  
  const Dot = ({ delay }) => {
    const opacity = useSharedValue(0.3);
    
    useEffect(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        true
      );
    }, []);

    const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return <Animated.View style={[styles.dot, { backgroundColor: theme.primary }, style]} />;
  };

  return (
    <View style={styles.typingContainer}>
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
};

export const ChatScreen = () => {
  const { theme, typography } = useTheme();
  const [messages, setMessages] = useState([
    { id: '1', text: "Hi there. I'm here to listen and support you. How are you feeling right now?", isAi: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newUserMsg = { id: Date.now().toString(), text, isAi: false };
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    Keyboard.dismiss();

    // Simulate AI thinking
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = { id: (Date.now() + 1).toString(), text: generateAIResponse(text), isAi: true };
      setMessages(prev => [...prev, aiResponse]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500 + Math.random() * 1000); // 1.5s - 2.5s delay
  };

  const renderMessage = ({ item }) => {
    const isAi = item.isAi;
    return (
      <Animated.View 
        entering={FadeInUp.duration(400)}
        style={[
          styles.messageBubble,
          isAi ? [styles.aiBubble, { backgroundColor: theme.surface, borderColor: theme.border }] 
               : [styles.userBubble, { backgroundColor: theme.primary }]
        ]}
      >
        <Text style={[typography.body, { color: isAi ? theme.text : '#FFF' }]}>{item.text}</Text>
      </Animated.View>
    );
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? (
            <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: theme.surface, borderColor: theme.border, width: 60 }]}>
              <TypingIndicator />
            </View>
          ) : null}
        />

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={SUGGESTIONS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => sendMessage(item)}
                >
                  <Text style={[typography.caption, { color: theme.primary }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="mic-outline" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, typography.body, { color: theme.text, backgroundColor: theme.background }]}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: inputText.trim() ? theme.primary : theme.border }]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color="#FFF" />
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
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    alignItems: 'flex-end',
    borderTopWidth: 1,
  },
  iconButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 100,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
