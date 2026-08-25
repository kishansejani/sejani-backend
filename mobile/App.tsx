import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // 1. Inject Preconnect Links
      if (!document.getElementById('google-fonts-preconnect')) {
        const link1 = document.createElement('link');
        link1.id = 'google-fonts-preconnect';
        link1.rel = 'preconnect';
        link1.href = 'https://fonts.googleapis.com';
        document.head.appendChild(link1);

        const link2 = document.createElement('link');
        link2.id = 'google-fonts-preconnect-gstatic';
        link2.rel = 'preconnect';
        link2.href = 'https://fonts.gstatic.com';
        link2.crossOrigin = 'anonymous';
        document.head.appendChild(link2);
      }

      // 2. Inject Google Font Rasa Stylesheet
      if (!document.getElementById('rasa-font-link')) {
        const fontLink = document.createElement('link');
        fontLink.id = 'rasa-font-link';
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Rasa:ital,wght@0,300..700;1,300..700&display=swap';
        document.head.appendChild(fontLink);
      }

      // 3. Inject Global CSS rule for Rasa font on all text & inputs
      if (!document.getElementById('rasa-global-style')) {
        const style = document.createElement('style');
        style.id = 'rasa-global-style';
        style.textContent = `
          * {
            font-family: 'Rasa', serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          }
          body, html, #root {
            font-family: 'Rasa', serif !important;
            letter-spacing: 0.2px;
          }
          input, textarea, select, button {
            font-family: 'Rasa', serif !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
