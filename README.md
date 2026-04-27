# VoteIndia 🇮🇳 — Your AI-Powered Civic Companion

An interactive, cinematic web application designed to empower Indian voters with intelligent guidance, live resource mapping, and seamless civic integrations. Built with **React**, **Three.js**, and **Google Cloud AI**, VoteIndia transforms complex electoral data into an accessible, premium digital experience.

**🚀 Live Application:** [http://localhost:5174/](http://localhost:5174/) (Local Development)

---

## ✨ Key Features

- **Cinematic 3D Journey:** A procedurally generated WebGL experience mapping the stages of the Indian electoral process, built with Three.js.
- **Official Election Helpdesk (Gemini AI):** A conversational assistant powered by **Google Gemini** that handles voter eligibility checks, registration guidance, and general election queries.
- **Smart Locator (Google Maps):** Real-time search for polling booths, district election offices, and registration centers using the **Google Places API**.
- **Multi-Language Support (Cloud Translation):** Instant UI and content translation into regional Indian languages (Hindi, Telugu, Tamil, Bengali, Marathi) via **Google Cloud Translation API**.
- **Semantic FAQ Search (Vertex AI):** Advanced FAQ matching using **Vertex AI Text Embeddings** to understand the semantic intent of voter questions.
- **Election Reminders (Google Calendar):** One-click integration to add critical election dates and deadlines to your personal calendar via Google Calendar deep-links.
- **Premium Glassmorphic UI:** A modern, responsive design system utilizing vibrant saffron and green themes with smooth Framer Motion animations.

---

## 🔧 Google Cloud Integrations

| Service | Purpose | Integration |
|---|---|---|
| **Google Gemini AI** | Conversational reasoning and function calling for election coaching | `src/services/gemini.ts` |
| **Google Vertex AI** | Semantic intent matching for FAQ retrieval using text-embeddings | `src/services/vertex.ts` |
| **Cloud Translation** | Real-time translation of civic guidance into Indian regional languages | `src/services/translation.ts` |
| **Google Maps Platform** | Dynamic location search and interactive mapping for polling booths | `src/services/maps.ts` |
| **Google Calendar** | Direct-to-calendar event generation for election reminders | `src/services/calendar.ts` |
| **Cloud Natural Language** | Sentiment and entity analysis of voter queries for civic insights | `src/services/analytics.ts` |

---

## 🏗️ Technology Stack

- **Frontend:** React 18, Vite, Framer Motion, Lucide React
- **Graphics:** Three.js (Procedural geometries & WebGL)
- **Styling:** Vanilla CSS3 (Custom Design System / Glassmorphism)
- **AI/Cloud:** Google Cloud Ecosystem (Gemini, Vertex, Maps, Translation, Analytics)
- **Testing:** Vitest (Unit & Integration tests)

---

## ⚙️ Setup and Installation

### Prerequisites
- Node.js 18+
- Google Cloud Platform API Key (with Gemini, Maps, Translation, and Natural Language APIs enabled)

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/dharunthandesh/election-india.git
   cd election-india
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   VITE_GOOGLE_TRANSLATION_API_KEY=your_api_key_here
   ```
4. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

## 🏛️ Project Architecture

```
src/
├── data/       # Election stages, FAQ, and timeline data
├── scene/      # 3D WebGL implementation (Three.js)
├── services/   # Google Cloud API clients and service logic
├── utils/      # Security sanitization, caching, and validation
├── App.tsx     # Main application shell and UI composition
└── index.css   # Core design system and global styles
```

---

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Generates the production-ready bundle.
- `npm run test`: Executes the Vitest test suite.
- `npm run lint`: Checks the codebase for linting issues.

---

## 🔒 Security & Resilience
- **Input Sanitization:** All user inputs are processed through a multi-stage sanitizer to prevent XSS.
- **Fail-Safe Fallbacks:** Every Google service has a built-in fallback (e.g., static responses for Gemini, keyword matching for FAQ) to ensure the app remains functional even if API limits are reached.
- **Performance:** Implemented TTL-based caching for all expensive API calls.

---

## 📄 License
MIT License — see [LICENSE](./LICENSE) for details.
