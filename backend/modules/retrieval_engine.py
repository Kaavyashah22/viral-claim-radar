import json
import logging
import os
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer
import faiss

logger = logging.getLogger(__name__)

class RetrievalEngine:
    def __init__(self, corpus_path: str = "data/corpus.json", model_name: str = 'all-MiniLM-L6-v2'):
        # Path gets resolved relative to main.py typically, defaulting carefully
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.corpus_path = os.path.join(base_dir, "data", "corpus.json")
        self.model = SentenceTransformer(model_name)
        self.corpus: List[Dict[str, Any]] = []
        self.index = None
        self._load_and_index_corpus()

    def _load_and_index_corpus(self):
        if not os.path.exists(self.corpus_path):
            logger.warning(f"Corpus file not found at {self.corpus_path}")
            return
            
        with open(self.corpus_path, "r") as f:
            self.corpus = json.load(f)
            
        if not self.corpus:
            return
            
        texts = [item["text"] for item in self.corpus]
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(embeddings)
        logger.info(f"Loaded {len(self.corpus)} facts into FAISS index.")

    def retrieve_evidence(self, claim: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.index or not self.corpus:
            return []
            
        from modules.gemini_service import GeminiService
        
        # If the claim contains non-Latin/non-English characters, translate it first
        search_query = claim
        if any(ord(c) > 127 for c in claim):
            result = GeminiService.detect_and_translate(claim)
            search_query = result.get("english_text", claim)
            
        query_embedding = self.model.encode([search_query], convert_to_numpy=True)
        distances, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.corpus) and idx != -1:
                result = self.corpus[idx].copy()
                result["distance"] = float(distances[0][i])
                results.append(result)
                
        return results
