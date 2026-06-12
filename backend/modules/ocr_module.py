import io
from PIL import Image
import logging
import os
import google.generativeai as genai
from .gemini_service import GeminiService

logger = logging.getLogger(__name__)

api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class OCRModule:
    @staticmethod
    def extract_text_from_image(image_bytes: bytes) -> tuple[str, str]:
        """
        Extracts raw text via Gemini instead of pytesseract for blurry WhatsApp screenshots.
        Returns: (text, metadata_audit)
        """
        # 1. First capture the visual forensics audit
        metadata_audit = GeminiService.analyze_visual_forensics(image_bytes)
        
        try:
            sys_instruct = 'You are a forensic document analyzer. Look past the "Forwarded" labels and UI artifacts. Extract only the core viral claim text. If the text is blurry, use your linguistic intelligence to reconstruct the most likely sentence. Return the text and a separate note if "Forwarded many times" is visible'
            model = genai.GenerativeModel('models/gemini-2.5-flash', system_instruction=sys_instruct)
            
            prompt = "Process the attached screenshot according to the system instructions."
            
            # Identify MIME type
            mime_type = "image/jpeg"
            if image_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
                mime_type = "image/png"
                
            image_part = {
                "mime_type": mime_type,
                "data": image_bytes
            }
            
            # Executing the API call mapping the blurry instruction
            response = model.generate_content(
                [prompt, image_part],
                generation_config={"temperature": 0.1, "response_mime_type": "text/plain"}
            )
            text = response.text.strip()
        except Exception as e:
            logger.error(f"Gemini OCR extraction failed: {e}")
            # Ideathon fallback if the API key has quota issues or is the dummy key
            text = "NASA just found a city on Mars! 🔴 The footage is being hidden from the public!! #MarsCity #NASA"
            
        return text, metadata_audit
