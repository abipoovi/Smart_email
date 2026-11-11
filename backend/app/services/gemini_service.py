import os
import json
import re
from typing import Dict, Any, List
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.client = None
        # Default model for standard fast generation
        self.model = "gemini-2.5-flash"
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            self.client = genai.Client(api_key=self.api_key)

    def _ensure_client(self):
        if not self.client:
            # Re-read in case .env was updated at runtime
            self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
            if self.api_key and self.api_key != "your_gemini_api_key_here":
                self.client = genai.Client(api_key=self.api_key)
            else:
                raise ValueError(
                    "Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env"
                )

    def _clean_json_response(self, text: str) -> str:
        """Strip markdown fences if Gemini outputs code blocks."""
        text = text.strip()
        pattern = r"^```(?:json)?\s*([\s\S]*?)\s*```$"
        match = re.search(pattern, text, re.MULTILINE)
        if match:
            return match.group(1).strip()
        return text

    async def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """Calls Gemini API and ensures valid JSON response."""
        self._ensure_client()
        try:
            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=0.7,
            )
            response = self.client.models.generate_content(
                model=self.model,
                contents=user_prompt,
                config=config,
            )
            
            raw_text = response.text or "{}"
            cleaned = self._clean_json_response(raw_text)
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI output into JSON: {str(e)}")
        except Exception as e:
            # Sanitize and bubble up
            error_msg = str(e)
            if "API_KEY_INVALID" in error_msg or "API key not valid" in error_msg:
                raise ValueError("Invalid Gemini API Key provided. Please verify your GEMINI_API_KEY.")
            raise RuntimeError(f"Gemini API generation error: {error_msg}")

gemini_service = GeminiService()

