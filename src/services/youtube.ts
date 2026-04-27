import { SafeApiClient } from './api-client';

export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

/**
 * Service to fetch official election education videos from YouTube.
 * Targets the Election Commission of India channel or relevant civic education playlists.
 */
export class ElectionYoutubeService {
  private readonly client: SafeApiClient;
  private readonly apiKey: string;
  private readonly channelId: string = 'UCOpI_A_A8XU6L_O4A_A_A'; // Example ECI Channel ID

  constructor() {
    this.apiKey = String(import.meta.env.VITE_GOOGLE_CLOUD_API_KEY || '');
    this.client = new SafeApiClient({
      baseUrl: 'https://www.googleapis.com/youtube/v3',
      timeoutMs: 15000,
    });
  }

  /**
   * Fetch recent voter education videos.
   */
  async fetchVoterEducationVideos(): Promise<YoutubeVideo[]> {
    if (!this.apiKey) return this.getMockVideos();

    const endpoint = `/search?key=${this.apiKey}&channelId=${this.channelId}&part=snippet,id&order=date&maxResults=6&q=voter education`;
    
    try {
      const response = await this.client.get<any>(endpoint);
      if (response.ok && response.data?.items) {
        return response.data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          publishedAt: item.snippet.publishedAt,
        }));
      }
    } catch (e) {
      console.error('YouTube fetch failed', e);
    }

    return this.getMockVideos();
  }

  private getMockVideos(): YoutubeVideo[] {
    return [
      {
        id: 'dQw4w9WgXcQ',
        title: 'How to use EVM and VVPAT — Official Guide',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        publishedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'dQw4w9WgXcQ',
        title: 'Step-by-Step Voter Registration Process',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        publishedAt: '2024-01-05T00:00:00Z',
      },
      {
        id: 'dQw4w9WgXcQ',
        title: 'Your Vote is Your Voice — ECI Message',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        publishedAt: '2024-02-10T00:00:00Z',
      }
    ];
  }
}
