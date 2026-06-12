from pydantic import BaseModel
from typing import List, Optional

class EvidenceOutput(BaseModel):
    id: str
    text: str
    source: str
    distance: float

class AnalysisResponse(BaseModel):
    claim: str
    stance: str
    confidence: float
    reasoning: str
    evidence: List[EvidenceOutput] = []
    metadata_audit: Optional[str] = None
    english_claim: Optional[str] = None
    english_reasoning: Optional[str] = None
    
class ResponseFormatter:
    @staticmethod
    def format_response(claim: str, classification_result: dict, metadata_audit: Optional[str] = None, english_claim: Optional[str] = None, english_reasoning: Optional[str] = None) -> dict:
        stance = classification_result.get("stance", "Uncertain")
        confidence = classification_result.get("confidence", 0.0)
        reasoning = classification_result.get("reasoning", "")
        evidence_list = classification_result.get("evidence", [])
        
        formatted_evidence = []
        for e in evidence_list:
            formatted_evidence.append({
                "id": str(e.get("id", "")),
                "text": e.get("text", ""),
                "source": e.get("source", ""),
                "distance": e.get("distance", 0.0)
            })
            
        response = AnalysisResponse(
            claim=claim,
            stance=stance,
            confidence=confidence,
            reasoning=reasoning,
            evidence=formatted_evidence,
            metadata_audit=metadata_audit,
            english_claim=english_claim,
            english_reasoning=english_reasoning
        )
        return response.model_dump()
