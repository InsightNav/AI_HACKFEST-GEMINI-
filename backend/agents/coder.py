from google import genai
import os
import json
import time
import tempfile
from dotenv import load_dotenv


load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Temporary workspace to avoid reload conflicts
WORKSPACE = os.path.join(tempfile.gettempdir(), "workspace")


# ─────────────────────────────
# File Writer
# ─────────────────────────────
def write_to_disk(filename: str, content: str, explanation: str = ""):
    os.makedirs(WORKSPACE, exist_ok=True)

    safe_name = os.path.basename(filename)

    if safe_name in {"main.py", "app.py"}:
        safe_name = f"fixed_{safe_name}"

    path = os.path.join(WORKSPACE, safe_name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Saving to:", path)
    return {
        "status": "saved",
        "file": path,
        "preview": content[:800],
        "explanation": explanation,
    }


# ─────────────────────────────
# Model Call
# ─────────────────────────────
def call_model(prompt: str):
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-flash-lite-latest",
                contents=prompt,
                config={"temperature": 0.2, "max_output_tokens": 800},
            )
            return response.text

        except Exception as e:
            if "429" in str(e):
                time.sleep(2 ** attempt)
                continue
            raise

    return None


# ─────────────────────────────
# JSON Cleanup
# ─────────────────────────────
def clean_json(raw: str):
    raw = raw.strip()

    if "```" in raw:
        parts = raw.split("```")
        if len(parts) >= 2:
            raw = parts[1]

    return raw.strip()


# ─────────────────────────────
# Code Fixing
# ─────────────────────────────
def fix_code(code: str, filename: str = "fixed_file.py"):
    prompt = f"""
You are a software engineer.

Fix the code with minimal necessary changes.

Return strictly valid JSON:
{{
  "action": "write" | "none",
  "filename": "{filename}",
  "content": "...",
  "explanation": "short bullet points describing the fixes"
}}

CODE:
{code}
"""

    raw = call_model(prompt)

    if not raw:
        return {"status": "error", "message": "Model unavailable"}

    cleaned = clean_json(raw)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        return {"status": "parse_error", "raw": cleaned}

    if data.get("action") != "write":
        return {"status": "no_changes"}

    return write_to_disk(
        data.get("filename", filename),
        data.get("content", ""),
        data.get("explanation", ""),
    )