import os
import json
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss

# Dynamic Path Resolution (Works locally and in Docker container)
backend_dir = os.path.dirname(os.path.abspath(__file__))
if os.path.exists(os.path.join(backend_dir, "exoplanet_biosignature_survey.csv")):
    workspace_dir = backend_dir
else:
    workspace_dir = os.path.dirname(backend_dir)
os.makedirs(backend_dir, exist_ok=True)

print("Starting Semantic RAG Indexer (FAISS + Sentence-Transformers)...")

# Load datasets
df_microbe = pd.read_csv(os.path.join(workspace_dir, "extremophile_microbe_db.csv"))
df_sim = pd.read_csv(os.path.join(workspace_dir, "astrobiology_simulation_experiments.csv"))

documents = []

# Process Microbes
print("Processing extremophile microbe database...")
for _, row in df_microbe.iterrows():
    doc = {
        "id": row["sample_id"],
        "source": "Extremophile Microbe Database",
        "title": f"Microbe Profile: {row['organism_name']}",
        "content": (
            f"The extremophile microbe '{row['organism_name']}' (sample ID: {row['sample_id']}) was discovered in the year {row['discovery_year']} "
            f"in the geographic location '{row['location']}' under a '{row['environment_type']}' environment. "
            f"Physical parameters of its natural habitat are: temperature of {row['temperature_celsius']}°C, pH level of {row['pH_level']}, "
            f"salinity of {row['salinity_ppt']} ppt, and atmospheric pressure of {row['pressure_atm']} atm. "
            f"This organism exhibits an extreme radiation tolerance of {row['radiation_tolerance_Gy']} Gy, and can survive for an estimated "
            f"{row['survival_duration_years']} years under these conditions with a metabolic rate of {row['metabolic_rate_nmol_per_hr']} nmol/hr. "
            f"Its dormancy capability is rated as '{row['dormancy_capable']}'. "
            f"It serves as a biological analog for target planet '{row['analog_planet']}', leaving a biosignature of type '{row['biosignature_type']}'."
        )
    }
    documents.append(doc)

# Process Simulation Experiments
print("Processing astrobiology simulation experiments...")
for _, row in df_sim.iterrows():
    doc = {
        "id": row["experiment_id"],
        "source": "Astrobiology Simulation Experiments",
        "title": f"Simulation Experiment: {row['experiment_id']}",
        "content": (
            f"Astrobiology simulation experiment '{row['experiment_id']}' simulated the '{row['simulated_environment']}' environment "
            f"for the target celestial body '{row['target_planet']}'. The experiment tested the organism '{row['organism_tested']}' "
            f"under the following conditions: temperature of {row['temperature_celsius']}°C, pressure of {row['pressure_atm']} atm, "
            f"radiation dose of {row['radiation_dose_Gy']} Gy, oxygen level of {row['oxygen_level_ppm']} ppm, humidity of {row['humidity_percentage']}%, "
            f"and a substrate of '{row['substrate_type']}'. The simulation lasted for {row['simulation_duration_hours']} hours. "
            f"The tested organism had a survival rate of {row['survival_rate_pct']}%, and produced the metabolite '{row['metabolite_produced']}'. "
            f"The biosignature detectability was evaluated as '{row['biosignature_detectable']}', and the overall outcome of the experiment was "
            f"classified as '{row['experiment_outcome']}'."
        )
    }
    documents.append(doc)

# Save documents metadata
kb_path = os.path.join(backend_dir, "kb_documents.json")
with open(kb_path, "w", encoding="utf-8") as f:
    json.dump(documents, f, indent=2)
print(f"Saved {len(documents)} knowledge base documents to {kb_path}")

# Load embedding model
print("Loading SentenceTransformer ('all-MiniLM-L6-v2')...")
model = SentenceTransformer('all-MiniLM-L6-v2')

# Generate embeddings
print("Computing embeddings for documents (this may take a few seconds)...")
corpus = [doc["content"] for doc in documents]
embeddings = model.encode(corpus, show_progress_bar=True)

# Build FAISS Index
print("Building FAISS Index...")
dimension = embeddings.shape[1] # 384 for all-MiniLM-L6-v2
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings).astype('float32'))

# Save FAISS Index
faiss_path = os.path.join(backend_dir, "faiss_index.index")
faiss.write_index(index, faiss_path)
print(f"FAISS index successfully built and saved to {faiss_path}")

print("Semantic RAG Indexing complete!")
