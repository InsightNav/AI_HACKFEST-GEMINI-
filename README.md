# ⚖️ LexForge

**LexForge** is a privacy-first AI toolkit that analyzes legal contracts and fixes code using intelligent agents powered by Gemini.

Built for speed and clarity, it combines:

* 🔍 Contract risk analysis (Lawyer Agent)
* 🛠️ Automated code fixing (Coding Agent)
* 🛡️ Built-in PII redaction before AI processing

---

## 🚀 Features

### ⚖️ Lawyer Agent

* Upload `.pdf` or `.txt` contracts
* Automatically redacts sensitive data (names, emails, etc.)
* Generates:

  * Risk score
  * Flagged clauses
  * Suggested fixes

### 🛠️ Coding Agent

* Upload `.py`, `.js`, `.cpp`, `.java`, `.txt`
* AI analyzes and fixes code issues
* Saves fixed file locally
* Shows preview + explanation of changes

---

## 🧠 Tech Stack

* **Backend:** FastAPI
* **Frontend:** HTML, CSS, Vanilla JS
* **AI:** Gemini Flash Lite
* **PII Detection:** Presidio

---

## Parts made with help of AI (Claude , ChatGPT)
Backend agent logic (Gemini integration)

- Prompt design for contract analysis and code fixing
- JSON structured output handling for consistent API responses

Code Fixing Pipeline

- Automated repair logic for Python/JS/Java/C++ files
- Error recovery handling (fallback responses, retries, parsing fixes)

Legal Analysis Engine

- Risk classification logic (severity-based scoring system)
- Structured extraction of contract risks and fixes

Frontend UI Design (HTML/CSS/JS)

- Layout structure and responsive UI styling
Agent switching system (Lawyer ↔ Coding mode)
- Log simulation and UX animations
- Error Handling & Robustness
Retry logic for API failures (429/503 handling)
- Safe JSON parsing and fallback responses
---

## ⚖️ Important Note

AI tools were used as assistive development tools, not as autonomous system builders. All outputs were reviewed, modified, and integrated into a working production-style prototype.

---
## 📁 Project Structure

```
LexForge/
│
├── backend/
│   ├── main.py
│   ├── redactor.py
│   └── agents/
│       ├── lawyer.py
│       └── coder.py
│
├── frontend/
│   └── index.html
│
├── workspace/        # (optional, generated files)
├── requirements.txt
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd LexForge/backend
```

### 2. Create & activate virtual environment

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
```

### 3. Install dependencies

```bash
pip install -r ../requirements.txt
```

### 4. Add environment variables

Create a `.env` file inside `backend/`:

```
GEMINI_API_KEY=your_api_key_here
```

---

## ▶️ Running the App

### Start backend

```bash
uvicorn main:app --reload
```

### Open frontend

Simply open:

```
frontend/index.html
```

in your browser.

---

## 📂 Where files are saved

Fixed code files are stored in your system temp directory:

```
C:\Users\<your-user>\AppData\Local\Temp\workspace
```

The exact file path is also printed in the terminal after processing.

---

## ⚠️ Notes

* Designed for rapid prototyping (hackathon-friendly)
* Uses local redaction before sending data to AI
* Backend reload may occur during file save (expected in dev mode)

---

## 🛡️ Privacy First

All sensitive information is **redacted locally** using Presidio before being sent to the AI model.

---

## 💡 Future Improvements

* File download button from UI
* Diff view (before vs after)
* Streaming logs instead of simulated steps
* Deployment (Docker / cloud)

---

## 📜 License

MIT License

---

## ✨ Author

Built for hackathons(AI_HACKFEST) — fast, functional, and focused.

## Team

Saswat kumar sahoo @InsightNav

Ditesh Prasad sahoo @Ditesh123
