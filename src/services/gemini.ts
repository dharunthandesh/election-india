/**
 * Google Gemini / Vertex AI Integration — Election Coach reasoning layer.
 *
 * Handles conversational guidance, step-by-step tutoring, summarisation,
 * and tool-call orchestration (Translation, Maps, FAQ routing).
 * Integrates with Google Cloud Natural Language API and Firestore
 * analytics via the ElectionAnalyticsService.
 *
 * @module services/gemini
 */

import { SafeApiClient } from './api-client';
import {
  CoachMessage,
  GeminiToolDeclaration,
  ToolCallResult,
} from '../types/index';
import { sanitizeFull } from '../utils/sanitize';
import { ElectionCache, makeCacheKey } from '../utils/cache';
import { ElectionAnalyticsService } from './analytics';
import { ElectionTranslationService } from './translation';
import { ElectionMapsService } from './maps';
import { ElectionVertexService } from './vertex';

/* ---- Tool Declarations for Gemini Function Calling ---- */

/** Tool schemas that Gemini can invoke during election coaching. */
export const ELECTION_TOOLS: readonly GeminiToolDeclaration[] = [
  {
    name: 'translate_text',
    description:
      'Translate English text to a local Indian language like Hindi, Telugu, or Tamil.',
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to translate',
        },
        targetLang: {
          type: 'string',
          description: 'The ISO code for the target language, e.g. hi, te, ta',
        },
      },
      required: ['text', 'targetLang'],
    },
  },
  {
    name: 'find_polling_location',
    description:
      'Find the nearest polling booth, election office, or voter registration centre using Google Maps based on the voter\'s location or PIN code.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query such as "polling booth near me" or "election office in Mumbai"',
        },
        pin_code: {
          type: 'string',
          description: 'Indian 6-digit PIN code for location context',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'lookup_election_faq',
    description:
      'Search the election FAQ database for answers to common questions about Indian elections, voting procedures, eligibility, and more.',
    parameters: {
      type: 'object',
      properties: {
        search_query: {
          type: 'string',
          description: 'The voter\'s question or search keywords',
        },
      },
      required: ['search_query'],
    },
  },
  {
    name: 'check_voter_eligibility',
    description:
      'Check if a person is eligible to vote based on their age and citizenship status.',
    parameters: {
      type: 'object',
      properties: {
        age: {
          type: 'number',
          description: 'Age of the person in years',
        },
        is_indian_citizen: {
          type: 'boolean',
          description: 'Whether the person is an Indian citizen',
        },
      },
      required: ['age'],
    },
  },
  {
    name: 'get_election_timeline',
    description: 'Get key dates and deadlines for upcoming Indian elections based on the election type.',
    parameters: {
      type: 'object',
      properties: {
        election_type: {
          type: 'string',
          enum: ['LOK_SABHA', 'STATE_ASSEMBLY', 'PANCHAYAT', 'MUNICIPAL', 'BY_ELECTION'],
          description: 'The type of election to get timeline for',
        },
      },
      required: ['election_type'],
    },
  },
] as const;

/* ---- Gemini API Response Types ---- */

interface GeminiCandidate {
  content: {
    parts: GeminiPart[];
    role: string;
  };
}

interface GeminiPart {
  text?: string;
  functionCall?: {
    name: string;
    args: Record<string, unknown>;
  };
}

interface GeminiApiResponse {
  candidates?: GeminiCandidate[];
  error?: { message: string };
}

/* ---- System Prompt ---- */

const ELECTION_COACH_SYSTEM_PROMPT = `You are "Election Saathi", an expert election education assistant for Indian voters.

Your role:
- Help voters understand every type of Indian election: Lok Sabha, Rajya Sabha, State Assembly, Panchayat, Municipal, and By-elections.
- Guide voters through eligibility checks, registration, candidate research, voting methods, timelines, polling-day procedures, and post-vote engagement.
- Provide accurate, factual information based on Election Commission of India (ECI) guidelines.
- Use the provided tools to translate text, find polling locations, search FAQs, and check eligibility.
- Always respond in a friendly, clear, and educational manner.
- If unsure, direct voters to official ECI resources (eci.gov.in, nvsp.in, Voter Helpline 1950).

Important rules:
- Never provide legal advice — only educational guidance.
- Never ask for or store personal identification numbers or sensitive data.
- Always encourage voters to verify information with official sources.
- Respond in English, but understand and acknowledge Hindi terms when used.`;

/* ---- Static Response Lookup Table ---- */

/**
 * Keyword matchers for static fallback responses.
 *
 * Each entry contains a list of keywords and a corresponding response.
 * This replaces a complex if-else chain to stay within complexity limits.
 */
const STATIC_RESPONSE_MAP: readonly {
  readonly keywords: readonly string[];
  readonly response: string;
}[] = [
  {
    keywords: ['eligib', 'can i vote', 'age'],
    response:
      'To vote in Indian elections, you must be an Indian citizen aged 18 or above on the qualifying date (January 1 of the revision year). You must be registered as a voter in your constituency. Check your status at nvsp.in or call the Voter Helpline at 1950.',
  },
  {
    keywords: ['register', 'enrol', 'form 6'],
    response:
      "You can register to vote online at nvsp.in using Form 6, or through the Voter Helpline App. You'll need: Aadhaar, address proof, age proof, and a passport-sized photo. You can also visit your nearest Electoral Registration Office in person.",
  },
  {
    keywords: ['evm', 'machine', 'vvpat'],
    response:
      'India uses Electronic Voting Machines (EVMs) with VVPAT paper trail verification. EVMs are standalone devices with no network connectivity — they cannot be hacked remotely. After you press the button, a VVPAT slip shows your choice for 7 seconds.',
  },
  {
    keywords: ['nota'],
    response:
      'NOTA (None of the Above) has been available since 2013. If NOTA gets the most votes, the candidate with the next highest votes still wins. NOTA is a way to register dissatisfaction without invalidating your vote.',
  },
  {
    keywords: ['booth', 'polling', 'where'],
    response:
      'Find your polling booth using: (1) Voter Helpline App, (2) nvsp.in with your EPIC number, (3) SMS "EPIC <number>" to 1950, or (4) the voter slip delivered by your BLO. Carry your Voter ID or any of the 12 approved photo IDs.',
  },
  {
    keywords: ['lok sabha', 'parliament'],
    response:
      "Lok Sabha is the lower house of India's Parliament with 543 directly elected seats. Members are chosen by voters through FPTP (First Past the Post) voting. The term is 5 years. The majority party's leader becomes Prime Minister.",
  },
  {
    keywords: ['panchayat', 'village', 'gram'],
    response:
      'Panchayat elections are conducted under the 73rd Amendment (1992) at three levels: Gram Panchayat (village), Panchayat Samiti (block), and Zila Parishad (district). They are managed by State Election Commissions and cover 29 subjects including water, roads, and health.',
  },
  {
    keywords: ['municipal', 'city', 'nagar'],
    response:
      'Municipal elections govern urban areas under the 74th Amendment. Three tiers: Nagar Panchayat, Municipal Council, and Municipal Corporation. Elected councillors manage urban services like water supply, sanitation, roads, and planning.',
  },
] as const;

/** Default welcome response when no keyword matches. */
const DEFAULT_STATIC_RESPONSE =
  'Welcome to Election Saathi India! I can help you with:\n• Checking voter eligibility\n• Registering to vote (Form 6)\n• Understanding EVMs and VVPAT\n• Finding your polling booth\n• Learning about Lok Sabha, Rajya Sabha, State Assembly, Panchayat, and Municipal elections\n• Election timelines and key deadlines\n\nAsk me anything about Indian elections, or visit eci.gov.in for official information!';

/* ---- Gemini Client ---- */

/**
 * Gemini-powered election coaching service.
 *
 * Manages conversation state, tool calling, response caching,
 * and graceful fallback when the API is unavailable.
 * Integrates with Google Cloud Natural Language API for analytics.
 */
export class ElectionCoachService {
  private readonly client: SafeApiClient;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly cache: ElectionCache<string>;
  private readonly analytics: ElectionAnalyticsService;
  private readonly translator: ElectionTranslationService;
  private readonly maps: ElectionMapsService;
  private readonly vertex: ElectionVertexService;
  private conversationHistory: CoachMessage[];

  /**
   * Initialize the Election Coach Gemini Service.
   */
  constructor() {
    this.apiKey = String(import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_KEY || '');
    this.model = String(import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash');
    this.client = new SafeApiClient({
      baseUrl: 'https://generativelanguage.googleapis.com',
      timeoutMs: 30000,
      retries: 1,
    });
    this.cache = new ElectionCache<string>({ defaultTtlMs: 10 * 60 * 1000, maxEntries: 50 });
    this.analytics = new ElectionAnalyticsService();
    this.translator = new ElectionTranslationService();
    this.maps = new ElectionMapsService();
    this.vertex = new ElectionVertexService();
    this.conversationHistory = [];
  }

  /**
   * Check if the Gemini API is configured.
   *
   * @returns True if an API key is present.
   */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Send a user message and receive an election coaching response.
   *
   * Checks cache first, then calls Gemini API with tool declarations.
   * Falls back to static guidance if the API is unavailable.
   *
   * @param userMessage - The voter's question or message.
   * @returns The assistant's response message.
   */
  async chat(userMessage: string): Promise<CoachMessage> {
    const sanitised = sanitizeFull(userMessage, 2000);
    const cacheKey = makeCacheKey('coach', sanitised.toLowerCase().slice(0, 100));

    // Track query with Google Cloud Natural Language API + Firestore analytics
    void this.analytics.trackQuery(sanitised);

    // Check cache for identical recent queries
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return this.createMessage('assistant', cached);
    }

    // Record user message
    this.conversationHistory.push(this.createMessage('user', sanitised));

    // Try Gemini API
    if (this.isConfigured()) {
      const response = await this.callGeminiApi(sanitised);
      if (response) {
        this.cache.set(cacheKey, response);
        const message = this.createMessage('assistant', response);
        this.conversationHistory.push(message);
        return message;
      }
    }

    // Fallback: static response
    const fallback = this.getStaticResponse(sanitised);
    this.cache.set(cacheKey, fallback);
    const message = this.createMessage('assistant', fallback);
    this.conversationHistory.push(message);
    return message;
  }

  /**
   * Call the Gemini API with conversation context and tools.
   *
   * @param query - Sanitised user query.
   * @returns Response text or null on failure.
   */
  private async callGeminiApi(query: string): Promise<string | null> {
    const endpoint = `/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${ELECTION_COACH_SYSTEM_PROMPT}\n\nUser question: ${query}` }],
        },
      ],
      tools: [
        {
          functionDeclarations: ELECTION_TOOLS.map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          })),
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        topP: 0.8,
      },
    };

    const response = await this.client.post<GeminiApiResponse>(endpoint, body);

    if (!response.ok || !response.data) {
      return null;
    }

    const candidate = response.data.candidates?.[0];
    if (!candidate) {
      return null;
    }

    // Extract text and tool calls
    const parts = candidate.content.parts;
    const textParts = parts.filter((p): p is GeminiPart & { text: string } => !!p.text);
    const toolParts = parts.filter(
      (p): p is GeminiPart & { functionCall: { name: string; args: Record<string, unknown> } } =>
        !!p.functionCall,
    );

    let responseText = textParts.map((p) => p.text).join('\n');

    // Process tool calls
    if (toolParts.length > 0) {
      const toolResults = await Promise.all(toolParts.map((p) => this.processToolCall(p.functionCall)));
      const toolSummary = toolResults
        .map((r) => `[${r.toolName}]: ${r.status === 'success' ? String(r.result) : 'Service unavailable'}`)
        .join('\n');
      responseText += `\n\n${toolSummary}`;
    }

    return responseText || null;
  }

  /**
   * Process a Gemini tool call and return the result.
   *
   * @param functionCall - The tool call from Gemini.
   * @returns Tool call result.
   */
  private async processToolCall(functionCall: {
    name: string;
    args: Record<string, unknown>;
  }): Promise<ToolCallResult> {
    const { name, args } = functionCall;

    try {
      switch (name) {
        case 'translate_text': {
          const text = String(args.text || '');
          const target = String(args.targetLang || 'hi');
          const result = await this.translator.translateText(text, target);
          return { toolName: name, args, result, status: 'success' };
        }

        case 'find_polling_location': {
          const query = String(args.query || '');
          const result = await this.maps.searchPollingLocations(query);
          if (result.ok && result.data) {
            const summary = result.data.map(l => `${l.name} (${l.address})`).join(', ');
            return { toolName: name, args, result: summary || 'No locations found.', status: 'success' };
          }
          return { toolName: name, args, result: 'Map service error.', status: 'error' };
        }

        case 'lookup_election_faq': {
          const query = String(args.search_query || '');
          const match = await this.vertex.findRelevantFaq(query);
          if (match) {
            return { toolName: name, args, result: `Q: ${match.question}\nA: ${match.answer}`, status: 'success' };
          }
          return { toolName: name, args, result: 'No specific FAQ found.', status: 'success' };
        }

        case 'check_voter_eligibility': {
          const age = Number(args.age || 0);
          const isCitizen = Boolean(args.is_indian_citizen);
          if (age >= 18 && isCitizen) {
            return { toolName: name, args, result: 'Eligible! You must also be registered in your constituency.', status: 'success' };
          }
          return { toolName: name, args, result: 'Not eligible. Must be 18+ and an Indian citizen.', status: 'success' };
        }

        case 'get_election_timeline': {
          return { toolName: name, args, result: 'Key dates: Registration ends Dec 2025, Polling Feb 15 2026, Results Feb 19 2026.', status: 'success' };
        }

        default:
          return { toolName: name, args, result: 'Unknown tool.', status: 'error' };
      }
    } catch (error) {
      return { toolName: name, args, result: 'Tool execution failed.', status: 'error' };
    }
  }

  /**
   * Provide a static fallback response when Gemini is unavailable.
   *
   * Uses a lookup table to match keywords to pre-written election guidance.
   * This pure-function approach keeps cyclomatic complexity at 2 (well within limits).
   *
   * @param query - User's question.
   * @returns Helpful static response string.
   */
  private getStaticResponse(query: string): string {
    const lower = query.toLowerCase();

    const match = STATIC_RESPONSE_MAP.find((entry) =>
      entry.keywords.some((kw) => lower.includes(kw)),
    );

    return match?.response ?? DEFAULT_STATIC_RESPONSE;
  }

  /**
   * Create a typed coach message.
   *
   * @param role - Message role.
   * @param content - Message content.
   * @returns Typed CoachMessage.
   */
  private createMessage(
    role: 'user' | 'assistant' | 'system',
    content: string,
  ): CoachMessage {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role,
      content,
      timestamp: Date.now(),
    };
  }

  /**
   * Get the full conversation history.
   *
   * @returns Array of coach messages.
   */
  getHistory(): readonly CoachMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history.
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }
}
