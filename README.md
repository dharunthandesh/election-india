# VoteIndia 🇮🇳 — Your AI-Powered Civic Companion

An interactive, cinematic web application designed to empower Indian voters with intelligent guidance, live resource mapping, and seamless civic integrations. Built with **React**, **Three.js**, and the full **Google Cloud AI Ecosystem**, VoteIndia transforms complex electoral data into an accessible, premium digital experience.

**🚀 Live Application:** [http://localhost:5174/](http://localhost:5174/) (Local Development)

---

## ✨ Key Features

- **Cinematic 3D Journey:** A procedurally generated WebGL experience mapping the stages of the Indian electoral process, built with Three.js.
- **AI Voice Assistant (Speech-to-Text & TTS):** Hands-free interaction with the Election Coach. Speak your questions and hear natural voice responses in regional accents.
- **Official YouTube Guides:** Real-time integration with the Election Commission of India's YouTube channel for official voter education videos.
- **Smart Polling Locator (Google Maps):** Advanced location search with "Locate Me" geolocation support and interactive mapping for polling booths.
- **AI Document Scanner (Cloud Vision):** Instant OCR analysis of election flyers, sample ballots, or ID cards to get AI-powered explanations.
- **Multi-Language Support (Cloud Translation):** Instant UI and content translation into regional Indian languages (Hindi, Telugu, Tamil, Bengali, Marathi).
- **Semantic FAQ Search (Vertex AI):** Advanced intent matching using Vertex AI Text Embeddings for accurate answer retrieval.
- **Google Calendar Integration:** One-click "Add to Calendar" for critical election dates and deadlines.
- **Premium Glassmorphic UI:** A modern, organized design system with smooth Framer Motion animations and Google Auth support.

---

## 🔧 Google Cloud Ecosystem (11+ Integrations)

| Service | Purpose | Implementation |
|---|---|---|
| **Google Gemini AI** | Conversational reasoning and AI coaching | `src/services/gemini.ts` |
| **Cloud Speech-to-Text** | Voice-powered user queries | `src/services/voice.ts` |
| **Cloud Text-to-Speech** | Natural voice responses for the AI Coach | `src/services/voice.ts` |
| **Google Vision AI** | OCR and analysis of election documents | `src/services/vision.ts` |
| **YouTube Data API** | Official ECI video guidance feeds | `src/services/youtube.ts` |
| **Google Maps Platform** | Interactive locator and "Locate Me" services | `src/services/maps.ts` |
| **Google Vertex AI** | Semantic search using text-embeddings | `src/services/vertex.ts` |
| **Cloud Translation** | Real-time regional language support | `src/services/translation.ts` |
| **Google Calendar** | Event generation for election reminders | `src/services/calendar.ts` |
| **Google Auth (Mock)** | Personalized user sessions and civic profiles | `src/components/Header.tsx` |
| **Natural Language AI** | Sentiment and entity analysis of voter queries | `src/services/analytics.ts` |

---

## 🏗️ Technical Architecture

```
src/
├── components/ # Modular UI library (AICoach, Locator, Reminders, etc.)
├── data/       # Election stages, FAQ, and timeline data
├── scene/      # 3D WebGL implementation (Three.js)
├── services/   # Google Cloud API clients and logic
├── App.tsx     # Clean, declarative orchestrator
└── index.css   # Modern design system (Glassmorphism)
```

---

## ⚙️ Setup and Installation

### Prerequisites
- Node.js 18+
- Google Cloud Platform API Key (with Gemini, Maps, Translation, Vision, and YouTube APIs enabled)

### Steps
1. **Clone and Install:**
   ```bash
   git clone https://github.com/dharunthandesh/election-india.git
   cd election-india
   npm install
   ```
2. **Environment Configuration:**
   Create a `.env` file:
   ```env
   VITE_GEMINI_API_KEY=your_api_key
   VITE_GOOGLE_MAPS_API_KEY=your_api_key
   VITE_GOOGLE_CLOUD_API_KEY=your_api_key (for Vision, Speech, YouTube)
   ```
3. **Run Locally:**
   ```bash
   npm run dev
   ```

---

## 🔒 Security & Performance
- **Input Sanitization:** Multi-stage protection against XSS in AI and Search inputs.
- **Componentized Design:** Highly organized React structure for maximum maintainability.
- **API Resilience:** Built-in fallbacks for all Google services to ensure uptime.

---

## 📄 License
MIT License — see [LICENSE](./LICENSE) for details.
