# CLIENTPULSE AI · Client Intelligence Platform

An AI-powered client intelligence platform and long-term memory engine for small businesses and digital marketing agencies.

## Architecture

CLIENTPULSE AI cleanly decouples the persistent memory engine from the user presentation layer:

```
┌────────────────────────────────────────────────────────┐
│                   User Interfaces                      │
│   • Streamlit Web App (app.py)                         │
│   • Modern React Web Dashboard (Vite + Tailwind v4)    │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                 ClientMemoryService                    │
│   (backend/memory_service.py)                          │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
┌──────────────▼──────────┐    ┌──────────▼──────────────┐
│  Hindsight Memory Engine│    │      Gemini AI API      │
│ (backend/hindsight_engine.py)│    (backend/ai_service.py)   │
│                         │    │                         │
│ • World Facts           │    │ • Memory Extraction     │
│ • Raw Experiences       │    │ • Q&A Synthesis         │
│ • Observations          │    │ • Sales Recommendations │
│ • Mental Models         │    │ • Reinforcement Loops   │
│                         │    │                         │
│ • retain(), recall(),   │    │ (gemini-3.8-flash, no   │
│   reflect()             │    │  hardcoded responses)   │
└─────────────────────────┘    └─────────────────────────┘
```

## The Four Hindsight Memory Types

1. **World Facts**: Objective, verifiable facts about the client (e.g. CAC targets, contractual renewal dates, tech stack, key decision makers).
2. **Experiences**: Raw, chronological interaction logs (emails, call transcripts, WhatsApp messages, meeting notes).
3. **Observations**: Consolidated beliefs synthesized across multiple past memories over time (e.g. "Values rapid ROI metrics over creative flourishes", "Hesitant about 12-month lock-in").
4. **Mental Models**: High-level synthesized understanding of client psychology, risk appetite, and strategic priorities.

## Three Core Operations

- **`retain`**: Ingests new interactions, extracts facts, and consolidates behavioral observations into the client's memory bank.
- **`recall`**: Retrieves matching memories across facts, experiences, and observations using hybrid keyword and semantic retrieval.
- **`reflect`**: Performs multi-hop synthesis over client memories to answer strategic agency questions.

## Running the Application

### Option A: Interactive Full-Stack Web App (Default Dev Server)
The live interactive web dashboard runs on port 3000:
```bash
npm run dev
```

### Option B: Running the Streamlit App Directly
```bash
pip install -r requirements.txt
export GEMINI_API_KEY="your-gemini-api-key"
streamlit run app.py --server.port 8501
```
