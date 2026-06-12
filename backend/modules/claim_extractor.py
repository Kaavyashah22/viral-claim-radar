import re

class ClaimExtractor:
    @staticmethod
    def extract_claims(raw_text: str) -> list[str]:
        """
        Extracts core searchable claims from raw text.
        For a production system, this could use an LLM or dependency parsing.
        For now, it roughly splits by sentence to treat each sentence as a potential claim.
        """
        if not raw_text:
            return []
            
        # Basic sentence splitting as a proxy for claim extraction
        sentences = re.split(r'(?<=[.!?]) +', raw_text.strip())
        claims = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        # If no sentences > 10 chars, just return the whole text if it has some content
        if not claims and len(raw_text.strip()) > 3:
            return [raw_text.strip()]
            
        return claims
