import { Platform, Alert } from 'react-native';

export interface VoiceRecognitionResult {
  startListening: (onResult: (text: string) => void, onError?: (err: any) => void) => void;
  stopListening: () => void;
  isSupported: boolean;
}

export const createVoiceRecognition = (): VoiceRecognitionResult => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      let recognition: any = null;

      return {
        isSupported: true,
        startListening: (onResult, onError) => {
          try {
            recognition = new SpeechRecognition();
            recognition.lang = 'gu-IN'; // Gujarati Language Speech Recognition
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              if (transcript) {
                onResult(transcript);
              }
            };

            recognition.onerror = (event: any) => {
              console.warn('Speech recognition error:', event.error);
              if (onError) onError(event.error);
            };

            recognition.start();
          } catch (e) {
            console.warn('Speech recognition failed to start:', e);
            if (onError) onError(e);
          }
        },
        stopListening: () => {
          if (recognition) {
            try {
              recognition.stop();
            } catch (e) {}
          }
        },
      };
    }
  }

  // Mobile / Fallback Mode (Graceful Voice Input)
  return {
    isSupported: true,
    startListening: (onResult) => {
      // In native environments without webkitSpeech, provide friendly prompt or default voice simulation
      if (Platform.OS !== 'web') {
        Alert.prompt
          ? Alert.prompt(
              '🎤 બોલો અથવા લખો',
              'દા.ત. ખાતર ૨ ગુણી, દવા સ્પ્રે, ડીઝલ ૫૦ લિટર',
              [
                { text: 'રદ કરો', style: 'cancel' },
                {
                  text: 'ઉમેરો',
                  onPress: (text?: string) => {
                    if (text && text.trim()) onResult(text.trim());
                  },
                },
              ]
            )
          : Alert.alert(
              '🎤 સ્પીચ ઇનપુટ',
              'કીબોર્ડના માઇક્રોફોન (Mic 🎤) બટન પર ટેપ કરીને બોલો.',
              [{ text: 'ઠીક છે' }]
            );
      }
    },
    stopListening: () => {},
  };
};
