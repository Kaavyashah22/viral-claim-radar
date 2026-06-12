# 🔴 Viral Claim Radar ✨

<div align="center">
  <h3>An advanced, high-speed fact-checking copilot designed to combat misinformation across social media.</h3>
</div>

---

## 🚀 Innovation & Startup-Ready Features

### 🌍 Multilingual Translation Layer (Powered by Gemini)
- Accurately detects global languages natively (e.g., Hindi, Spanish) before processing.
- Translates inputs dynamically specifically for the English-native Vector Index search.
- Flawlessly returns AI reasoning back in the user's native language with a seamless UI toggle.

### 🕵️‍♂️ Multimodal Visual Forensics (Powered by Gemini Vision)
- Scans uploaded images and screenshots for suspicious metadata utilizing OCR.
- Rapidly flags *'Forwarded many times'* WhatsApp labels or fake *'Verified'* UI elements to alert the user immediately.

### 📱 Social Feed Simulator Copilot
- Seamlessly injects an **'Engage Radar'** smart button directly onto social media posts.
- A beautiful Pop-over Analysis modal verifies claims without users ever leaving their feed.

### 🎨 Premium UI & Interactions
- **Rich Data Vis:** Fluid, SVG-driven circular confidence meters.
- **Micro-interactions:** Spring-based, staggered sequence animations utilizing Framer Motion. 
- **Dark Mode First:** Deep, sophisticated color palettes offering maximum readability and visual impact.
- **Rewarding UX:** Features custom celebrations like confetti fireworks for high-confidence "Supported" claims, and skeleton loaders for smooth async states.

---

## 🛠 Tech Stack

### Frontend Architecture
- **Framework:** React 19 (TypeScript, Vite)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion, Canvas Confetti
- **Icons:** Lucide React

### Backend Infrastructure
- **API Framework:** Python, FastAPI
- **Retrieval Engine:** Context-RAG with FAISS (Facebook AI Similarity Search)
- **Embedding Models:** Sentence-Transformers (`all-MiniLM-L6-v2`)
- **AI Models:** Google Gemini 2.5 Flash (Translation, Reasoning, and Visual Metadata)

---

## 🏃‍♂️ How to Run

### 1. Start the Backend API (FastAPI)
Navigate to the backend directory and fire up the python server.
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
> *(Requires a `GEMINI_API_KEY` environment variable. Falls back to highly-effective mock heuristics safely if absent).*

### 2. Start the Frontend (Vite)
Navigate to the frontend directory to run the React application.
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Quick Test Data (Live Simulator)
Open the **Live Feed Simulator** Tab to safely test mock network claims in real-time:
- **Hindi Claim**: *"नमक के पानी से गरारे करने से कोरोना ठीक हो जाता है"* -> Translates instantly and flags as **Refuted**.
- **Mars Claim**: *"NASA just found a city on Mars!"* -> Flags as **Refuted** + Highlights alarming Visual Metadata.
- **TechCorp Sustainability**: *"TechCorp releases its latest sustainability report..."* -> Flags as **Supported** triggering the Success Confetti Animation 🎉.

<br />

> **Note:** The API falls back gracefully if rates are exceeded or API keys are unavailable, providing a consistent UI and logic flow for demonstrations and stress testing.
