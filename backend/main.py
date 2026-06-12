from fastapi import FastAPI, UploadFile, Form, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from modules.input_handler import InputHandler
from modules.retrieval_engine import RetrievalEngine
from modules.classification_engine import ClassificationEngine
from modules.response_formatter import ResponseFormatter
from modules.gemini_service import GeminiService

app = FastAPI(title="Viral Claim Radar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

input_handler = InputHandler()
retrieval_engine = RetrievalEngine()
classification_engine = ClassificationEngine()
response_formatter = ResponseFormatter()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze_claim(
    text: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    if image is not None:
        image_bytes = await image.read()
        input_data = input_handler.handle_image(image_bytes)
    elif text is not None and text.strip():
        input_data = input_handler.handle_text(text)
    else:
        raise HTTPException(status_code=400, detail="Must provide 'text' or 'image'.")
        
    claims = input_data["claims"]
    if not claims:
        # If no strict claims extracted, fallback to the original text
        claims = [input_data["original_text"]] if input_data["original_text"] else ["Unable to extract text."]
        
    core_claim = claims[0]
    original_lang = input_data["language"]
    
    evidence = retrieval_engine.retrieve_evidence(core_claim, top_k=3)
    classification = classification_engine.classify_claim(core_claim, evidence)
    
    english_claim = core_claim
    english_reasoning = classification.get("reasoning", "")

    if original_lang and original_lang != "en":
        translated = GeminiService.translate_response(
            classification.get("stance", "Uncertain"), 
            classification.get("reasoning", ""), 
            original_lang
        )
        classification["stance"] = translated.get("stance", classification["stance"])
        classification["reasoning"] = translated.get("reasoning", classification["reasoning"])
        
        display_claim = input_data["original_text"] if input_data["original_text"] else core_claim
        response = response_formatter.format_response(
            claim=display_claim, 
            classification_result=classification, 
            metadata_audit=input_data.get("metadata_audit"),
            english_claim=english_claim,
            english_reasoning=english_reasoning
        )
    else:
        display_claim = input_data["original_text"] if input_data["original_text"] else core_claim
        response = response_formatter.format_response(
            claim=display_claim, 
            classification_result=classification, 
            metadata_audit=input_data.get("metadata_audit")
        )
    
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
