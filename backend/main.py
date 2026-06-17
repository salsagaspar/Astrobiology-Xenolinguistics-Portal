import os
import json
import pickle
import requests
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from sklearn.preprocessing import LabelEncoder
from sklearn.decomposition import PCA
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import faiss

# Load environment variables
load_dotenv()

app = FastAPI(
    title="XenoDecipher & CosmoBio API",
    description="Backend Semantic AI inference and RAG server for Astrobiology and Xenolinguistics data",
    version="2.0.0"
)

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dynamic Path Resolution (Works locally and in Docker container)
backend_dir = os.path.dirname(os.path.abspath(__file__))
if os.path.exists(os.path.join(backend_dir, "exoplanet_biosignature_survey.csv")):
    workspace_dir = backend_dir
else:
    workspace_dir = os.path.dirname(backend_dir)

print(f"Dynamic Path Resolution: backend_dir={backend_dir}, workspace_dir={workspace_dir}")

# Global variables for models and data
biosignature_pkg = None
whale_coda_pkg = None
kb_documents = []
embedding_model = None
faiss_index = None

# On startup, load models and index RAG
@app.on_event("startup")
def startup_event():
    global biosignature_pkg, whale_coda_pkg, kb_documents, embedding_model, faiss_index
    
    # 1. Load Biosignature Model
    bio_path = os.path.join(backend_dir, "biosignature_model.pkl")
    if os.path.exists(bio_path):
        with open(bio_path, "rb") as f:
            biosignature_pkg = pickle.load(f)
        print("Loaded biosignature_model.pkl successfully.")
    else:
        print("WARNING: biosignature_model.pkl not found. Run model training first.")
        
    # 2. Load Whale Coda Model
    whale_path = os.path.join(backend_dir, "whale_coda_model.pkl")
    if os.path.exists(whale_path):
        with open(whale_path, "rb") as f:
            whale_coda_pkg = pickle.load(f)
        print("Loaded whale_coda_model.pkl successfully.")
    else:
        print("WARNING: whale_coda_model.pkl not found. Run model training first.")

    # 3. Load RAG Documents Metadata
    kb_path = os.path.join(backend_dir, "kb_documents.json")
    if os.path.exists(kb_path):
        with open(kb_path, "r", encoding="utf-8") as f:
            kb_documents = json.load(f)
        print(f"Loaded {len(kb_documents)} RAG documents.")
    else:
        print("WARNING: kb_documents.json not found. Run RAG indexer first.")

    # 4. Load SentenceTransformer and FAISS index
    faiss_path = os.path.join(backend_dir, "faiss_index.index")
    if os.path.exists(faiss_path):
        print("Loading SentenceTransformer ('all-MiniLM-L6-v2')...")
        embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Loading FAISS Index...")
        faiss_index = faiss.read_index(faiss_path)
        print("Semantic Search components loaded successfully.")
    else:
        print("WARNING: faiss_index.index not found. Run RAG indexer first.")


# RAG Retrieval Helper (Semantic Search)
def retrieve_contexts(query: str, k: int = 3) -> List[Dict[str, Any]]:
    global kb_documents, embedding_model, faiss_index
    if not kb_documents or embedding_model is None or faiss_index is None:
        return []
    
    # Generate query embedding
    query_vec = embedding_model.encode([query]).astype('float32')
    
    # Search index (returns L2 distances and indices)
    distances, indices = faiss_index.search(query_vec, k)
    
    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx != -1:
            # Convert L2 distance to similarity score
            score = float(1 / (1 + dist))
            results.append({
                "score": round(score, 4),
                "title": kb_documents[idx]["title"],
                "source": kb_documents[idx]["source"],
                "content": kb_documents[idx]["content"]
            })
    return results


# Request/Response Schemas
class BiosignatureInput(BaseModel):
    planet_radius_earth: float
    orbital_period_days: float
    surface_temperature_K: float
    atmospheric_composition: str
    oxygen_percentage: float
    methane_ppm: float
    water_vapor_detected: str
    biofluorescence_signal: float
    habitable_zone_position: str

class CodaInput(BaseModel):
    click_count: int
    inter_click_interval_ms: float
    frequency_hz: float
    duration_seconds: float
    matriarch_present: str  # "Yes" or "No"

class ChatInput(BaseModel):
    query: str
    api_key: Optional[str] = None


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": {
            "biosignature": biosignature_pkg is not None,
            "whale_coda": whale_coda_pkg is not None
        },
        "semantic_rag_loaded": faiss_index is not None,
        "kb_size": len(kb_documents)
    }


@app.post("/api/predict-biosignature")
def predict_biosignature(data: BiosignatureInput):
    global biosignature_pkg
    if biosignature_pkg is None:
        raise HTTPException(status_code=503, detail="Biosignature prediction model is not loaded.")
        
    try:
        # Prepare categorical features using loaded LabelEncoders
        encoded_cats = {}
        for col in biosignature_pkg["cat_cols"]:
            le = biosignature_pkg["encoders"][col]
            val = getattr(data, col)
            # Handle unseen categories gracefully by mapping to first class
            if val not in le.classes_:
                encoded_cats[col] = 0
            else:
                encoded_cats[col] = int(le.transform([val])[0])
                
        # Construct input vector in correct column order: [numerical + categorical]
        num_vals = [getattr(data, col) for col in biosignature_pkg["num_cols"]]
        cat_vals = [encoded_cats[col] for col in biosignature_pkg["cat_cols"]]
        features = np.array([num_vals + cat_vals])
        
        # Scale features
        features_scaled = biosignature_pkg["scaler"].transform(features)
        
        # Predict continuous confidence score
        confidence = float(biosignature_pkg["model"].predict(features_scaled)[0])
        
        # Generate classification label based on confidence threshold
        if confidence > 75:
            classification = "High probability of active biology"
        elif confidence > 45:
            classification = "Probable biosignature / Marginal signs of life"
        else:
            classification = "No active biological indicators detected"
            
        return {
            "biosignature_confidence_score": round(confidence, 2),
            "outcome_classification": classification
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/api/translate-coda")
def translate_coda(data: CodaInput):
    global whale_coda_pkg
    if whale_coda_pkg is None:
        raise HTTPException(status_code=503, detail="Whale coda classification model is not loaded.")
        
    try:
        # Preprocess features
        matriarch_val = 1 if data.matriarch_present.lower() == "yes" else 0
        num_vals = [data.click_count, data.inter_click_interval_ms, data.frequency_hz, data.duration_seconds]
        
        features = np.array([num_vals + [matriarch_val]])
        
        # Scale
        features_scaled = whale_coda_pkg["scaler"].transform(features)
        
        # Predict probabilities and label
        model = whale_coda_pkg["model"]
        pred_idx = int(model.predict(features_scaled)[0])
        probs = model.predict_proba(features_scaled)[0]
        
        predicted_context = whale_coda_pkg["encoder"].inverse_transform([pred_idx])[0]
        
        # Format confidence distribution
        distribution = {
            whale_coda_pkg["classes"][i]: round(float(probs[i]) * 100, 2)
            for i in range(len(probs))
        }
        
        return {
            "predicted_context": predicted_context,
            "prediction_confidence_pct": round(float(probs[pred_idx]) * 100, 2),
            "confidence_distribution": distribution
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification error: {str(e)}")


@app.post("/api/cosmo-chat")
def cosmo_chat(data: ChatInput):
    # Hardened API Key Handling: Exclusively read backend .env if not supplied by developer tool
    api_key = data.api_key or os.getenv("GROQ_API_KEY")
    if api_key == "gsk_your_key_here":
        # Handle default mock config
        api_key = None
        
    # Retrieve relevant context from KB documents via FAISS Semantic Search
    contexts = retrieve_contexts(data.query, k=3)
    context_str = "\n\n".join([f"Source: {c['source']} ({c['title']})\nContent: {c['content']}" for c in contexts])
    
    # System prompt
    system_prompt = (
        "You are the CosmoBio RAG Assistant, an expert astrobiologist and xenolinguist. "
        "Your task is to answer user queries using the provided science database contexts. "
        "Respond in a premium, scientifically accurate, and clear manner. "
        "Include reference tags (e.g. [Microbe Profile: Name] or [Simulation: ID]) when quoting specific data points.\n\n"
        f"--- SEMANTIC SCIENCE CONTEXTS (FAISS RETRIEVAL) ---\n{context_str}\n"
    )
    
    # If no API key, return RAG contexts and an offline summary
    if not api_key:
        return {
            "answer": (
                "**[OFFLINE/MOCK RESPONSE: Groq API Key Not Configured]**\n\n"
                "I performed a semantic FAISS database lookup. Here are the most relevant scientific contexts found:\n\n"
                + "\n\n".join([f"- **{c['title']}** (Similarity: {c['score']}): {c['content']}" for c in contexts]) + 
                "\n\n*Configure a valid GROQ_API_KEY in the backend `.env` file or in the settings panel to enable dynamic LLM completions.*"
            ),
            "contexts": contexts
        }
        
    # Call Groq API
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": data.query}
            ],
            "temperature": 0.3,
            "max_tokens": 800
        }
        
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers, timeout=15)
        
        if response.status_code == 200:
            result = response.json()
            answer = result["choices"][0]["message"]["content"]
            return {
                "answer": answer,
                "contexts": contexts
            }
        else:
            return {
                "answer": (
                    f"**[Error calling Groq API (HTTP {response.status_code})]**\n\n"
                    "Semantic Fallback Contexts:\n"
                    + "\n\n".join([f"- **{c['title']}** (Similarity: {c['score']}): {c['content']}" for c in contexts])
                ),
                "contexts": contexts
            }
    except Exception as e:
        return {
            "answer": f"Connection error: {str(e)}",
            "contexts": contexts
        }


@app.get("/api/dataset-stats")
def get_dataset_stats():
    try:
        # Load exoplanet data
        df_exo = pd.read_csv(os.path.join(workspace_dir, "exoplanet_biosignature_survey.csv"))
        
        # 1. HZ Distribution
        hz_counts = df_exo["habitable_zone_position"].value_counts().to_dict()
        
        # 2. Avg Metrics
        avg_temp = float(df_exo["surface_temperature_K"].mean())
        avg_confidence = float(df_exo["biosignature_confidence_score"].mean())
        avg_oxygen = float(df_exo["oxygen_percentage"].mean())
        
        # 3. Fit a simple 2D PCA on numerical features for the exoplanet distribution scatterplot
        num_cols = ["planet_radius_earth", "orbital_period_days", "surface_temperature_K", 
                    "oxygen_percentage", "methane_ppm", "biofluorescence_signal"]
        
        # Handle nan just in case
        X_num = df_exo[num_cols].fillna(df_exo[num_cols].mean())
        # Scale for PCA
        from sklearn.preprocessing import StandardScaler
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_num)
        
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X_scaled)
        
        # Build exoplanets coordinates list
        scatterplot_data = []
        for i in range(len(df_exo)):
            scatterplot_data.append({
                "id": df_exo.iloc[i]["planet_id"],
                "star": df_exo.iloc[i]["star_name"],
                "x": float(X_pca[i, 0]),
                "y": float(X_pca[i, 1]),
                "hz": df_exo.iloc[i]["habitable_zone_position"],
                "confidence": float(df_exo.iloc[i]["biosignature_confidence_score"])
            })
            
        # 4. Load whale data for stats
        df_whale = pd.read_csv(os.path.join(workspace_dir, "sperm_whale_communication.csv"))
        coda_counts = df_whale["coda_type"].value_counts().to_dict()
        context_counts = df_whale["behavioral_context"].value_counts().to_dict()
        avg_complexity = float(df_whale["vocalization_complexity_score"].mean())
        
        # Whales records for lists
        whales_sample = df_whale.head(10).to_dict(orient="records")
        
        return {
            "exoplanets": {
                "total": len(df_exo),
                "avg_temp_K": round(avg_temp, 2),
                "avg_confidence": round(avg_confidence, 2),
                "avg_oxygen_pct": round(avg_oxygen, 2),
                "hz_distribution": hz_counts,
                "scatterplot": scatterplot_data
            },
            "whales": {
                "total": len(df_whale),
                "avg_complexity": round(avg_complexity, 2),
                "coda_distribution": coda_counts,
                "context_distribution": context_counts,
                "sample": whales_sample
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing stats: {str(e)}")
