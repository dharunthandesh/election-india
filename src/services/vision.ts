import { SafeApiClient } from './api-client';

/**
 * Service for Google Cloud Vision API integration.
 * Enables OCR and image analysis for election-related documents.
 */
export class ElectionVisionService {
  private readonly client: SafeApiClient;
  private readonly apiKey: string;

  constructor() {
    this.apiKey = String(import.meta.env.VITE_GOOGLE_CLOUD_API_KEY || '');
    this.client = new SafeApiClient({
      baseUrl: 'https://vision.googleapis.com',
      timeoutMs: 30000,
    });
  }

  /**
   * Perform OCR on an image to extract election-related text.
   * @param base64Image - The image data in base64 format.
   * @returns Extracted text or summary.
   */
  async analyzeDocument(base64Image: string): Promise<string> {
    if (!this.apiKey) return "Cloud Vision API key missing. (Mock: 'Detected Voter ID Card - Form 6 Registration') ";

    const endpoint = `/v1/images:annotate?key=${this.apiKey}`;
    const body = {
      requests: [
        {
          image: { content: base64Image.split(',')[1] || base64Image },
          features: [{ type: 'TEXT_DETECTION' }],
        },
      ],
    };

    try {
      const response = await this.client.post<any>(endpoint, body);
      if (response.ok && response.data?.responses?.[0]?.fullTextAnnotation) {
        return response.data.responses[0].fullTextAnnotation.text;
      }
    } catch (e) {
      console.error('Vision API analysis failed', e);
    }

    return "Document analysis failed. Please ensure the image is clear.";
  }
}
