import { describe, it, expect, vi } from 'vitest';
import { ElectionVoiceService } from '../../src/services/voice';
import { ElectionYoutubeService } from '../../src/services/youtube';
import { ElectionVisionService } from '../../src/services/vision';

describe('New Election Services', () => {
  describe('ElectionVoiceService', () => {
    it('should initialize with fallback if Web Speech is missing', () => {
      const service = new ElectionVoiceService();
      expect(service).toBeDefined();
    });

    it('should speak text using speechSynthesis fallback', () => {
      // Mock speechSynthesis
      const mockSpeak = vi.fn();
      vi.stubGlobal('speechSynthesis', {
        speak: mockSpeak,
        getVoices: () => [],
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
      });
      vi.stubGlobal('SpeechSynthesisUtterance', class {
        lang: string = '';
        constructor(public text: string) {}
      });
      
      const service = new ElectionVoiceService();
      service.speak('Hello Test');
      expect(mockSpeak).toHaveBeenCalled();
    });
  });

  describe('ElectionYoutubeService', () => {
    it('should return mock videos when API key is missing', async () => {
      const service = new ElectionYoutubeService();
      const videos = await service.fetchVoterEducationVideos();
      expect(videos.length).toBeGreaterThan(0);
      expect(videos[0]).toHaveProperty('thumbnail');
    });
  });

  describe('ElectionVisionService', () => {
    it('should return fallback message when API key is missing', async () => {
      const service = new ElectionVisionService();
      const result = await service.analyzeDocument('sample-base64');
      expect(result).toContain('missing');
    });
  });
});
