from .ocr_module import OCRModule
from .claim_extractor import ClaimExtractor
from .gemini_service import GeminiService

class InputHandler:
    def __init__(self):
        self.ocr_module = OCRModule()
        self.claim_extractor = ClaimExtractor()

    def handle_text(self, text: str) -> dict:
        lang_info = GeminiService.detect_and_translate(text)
        claims = self.claim_extractor.extract_claims(lang_info["english_text"])
        return {
            "claims": claims,
            "language": lang_info["language"],
            "metadata_audit": None,
            "original_text": text
        }

    def handle_image(self, image_bytes: bytes) -> dict:
        text, metadata_audit = self.ocr_module.extract_text_from_image(image_bytes)
        lang_info = GeminiService.detect_and_translate(text)
        claims = self.claim_extractor.extract_claims(lang_info["english_text"])
        return {
            "claims": claims,
            "language": lang_info["language"],
            "metadata_audit": metadata_audit,
            "original_text": text
        }
