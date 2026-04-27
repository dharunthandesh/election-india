/**
 * Service for Google Cloud Speech-to-Text and Text-to-Speech.
 * Provides voice interaction capabilities for the Election Coach.
 */
export class ElectionVoiceService {
  private recognition: any = null;

  constructor() {
    // Initialize Web Speech API as fallback/input source
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-IN';
    }
  }

  /**
   * Start listening for voice input.
   * @returns Promise resolving to the transcribed text.
   */
  async listen(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported in this browser.'));
        return;
      }

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event: any) => {
        reject(event.error);
      };

      this.recognition.start();
    });
  }

  /**
   * Speak text using Google Cloud Text-to-Speech or Web Speech Synthesis.
   * @param text - Text to speak.
   * @param lang - ISO language code.
   */
  async speak(text: string, lang: string = 'en-IN'): Promise<void> {
    // Fallback to Web Speech Synthesis for immediate response
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }
}
