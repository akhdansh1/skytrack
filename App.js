import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { WeatherProvider } from './src/context/WeatherContext';
import AppNavigator from './src/navigation/AppNavigator';

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
      const { View, Text, ScrollView } = require('react-native');
      return (
        <View style={{ flex: 1, backgroundColor: '#0f0c29', padding: 24, justifyContent: 'center' }}>
          <Text style={{ color: '#e94560', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
            Terjadi Kesalahan
          </Text>
          <ScrollView>
            <Text style={{ color: '#fff', fontSize: 13 }}>
              {this.state.error?.toString()}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <WeatherProvider>
            <AppNavigator />
          </WeatherProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
