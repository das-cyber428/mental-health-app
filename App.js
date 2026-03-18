import 'react-native-reanimated';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

// Ensure global is defined on web if some library needs it
if (Platform.OS === 'web') {
  if (typeof global === 'undefined') {
    window.global = window;
  }
}

// Simple ErrorBoundary for diagnosing web crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, height: '100vh', justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f9fafb' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>App Initialization Error</Text>
          <Text style={{ color: '#ef4444', marginTop: 15, fontSize: 16, textAlign: 'center' }}>{this.state.error?.toString()}</Text>
          <Text style={{ marginTop: 20, color: '#6b7280', textAlign: 'center' }}>Please check the browser console (F12) for detailed logs.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <SafeAreaProvider style={styles.container}>
          <ThemeProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </ThemeProvider>
        </SafeAreaProvider>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    ...(Platform.OS === 'web' ? { 
      minHeight: '100vh', 
      width: '100vw',
      overflow: 'hidden'
    } : {}),
  },
});



