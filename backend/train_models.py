import os
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler

# Set working directory using dynamic path resolution (works locally and in containers)
backend_dir = os.path.dirname(os.path.abspath(__file__))
if os.path.exists(os.path.join(backend_dir, "exoplanet_biosignature_survey.csv")):
    workspace_dir = backend_dir
else:
    workspace_dir = os.path.dirname(backend_dir)
os.makedirs(backend_dir, exist_ok=True)

print("Starting Regularized Model Training Script...")

# -------------------------------------------------------------------------
# 1. TRAIN BIOSIGNATURE CONFIDENCE REGRESSOR
# -------------------------------------------------------------------------
print("\n[1/2] Training Regularized Exoplanet Biosignature Confidence Regressor...")
df_exo = pd.read_csv(os.path.join(workspace_dir, "exoplanet_biosignature_survey.csv"))

# Features and target
target_col_exo = "biosignature_confidence_score"
cat_cols_exo = ["atmospheric_composition", "water_vapor_detected", "habitable_zone_position"]
num_cols_exo = ["planet_radius_earth", "orbital_period_days", "surface_temperature_K", 
                "oxygen_percentage", "methane_ppm", "biofluorescence_signal"]

# Encode categorical columns
encoders_exo = {}
for col in cat_cols_exo:
    le = LabelEncoder()
    df_exo[col] = le.fit_transform(df_exo[col].astype(str))
    encoders_exo[col] = le

# Prepare features
X_exo = df_exo[num_cols_exo + cat_cols_exo]
y_exo = df_exo[target_col_exo]

# Split data (80/20 train/test split)
X_train_exo, X_test_exo, y_train_exo, y_test_exo = train_test_split(X_exo, y_exo, test_size=0.2, random_state=42)

# Scale features
scaler_exo = StandardScaler()
X_train_exo_scaled = scaler_exo.fit_transform(X_train_exo)
X_test_exo_scaled = scaler_exo.transform(X_test_exo)

# Train Regularized Random Forest Regressor (preventing overfitting)
# We set max_depth=4 and min_samples_leaf=5 to keep the model general
model_exo = RandomForestRegressor(
    n_estimators=150, 
    max_depth=4, 
    min_samples_split=8, 
    min_samples_leaf=5, 
    random_state=42
)
model_exo.fit(X_train_exo_scaled, y_train_exo)

# Cross Validation on Training Set (5-Fold)
kf = KFold(n_splits=5, shuffle=True, random_state=42)
cv_scores_exo = cross_val_score(model_exo, X_train_exo_scaled, y_train_exo, cv=kf, scoring='r2')

# Evaluation
train_score = model_exo.score(X_train_exo_scaled, y_train_exo)
test_score = model_exo.score(X_test_exo_scaled, y_test_exo)

print(f"Exoplanet Regressor Train R^2: {train_score:.4f}")
print(f"Exoplanet Regressor Test R^2:  {test_score:.4f}")
print(f"5-Fold Cross-Validation R^2:   {np.mean(cv_scores_exo):.4f} (+/- {np.std(cv_scores_exo):.4f})")

# Save Exo artifacts
exo_model_pkg = {
    "model": model_exo,
    "scaler": scaler_exo,
    "encoders": encoders_exo,
    "num_cols": num_cols_exo,
    "cat_cols": cat_cols_exo
}
with open(os.path.join(backend_dir, "biosignature_model.pkl"), "wb") as f:
    pickle.dump(exo_model_pkg, f)
print("Saved biosignature_model.pkl")


# -------------------------------------------------------------------------
# 2. TRAIN WHALE CODA CLASSIFIER
# -------------------------------------------------------------------------
print("\n[2/2] Training Regularized Sperm Whale Coda Behavioral Classifier...")
df_whale = pd.read_csv(os.path.join(workspace_dir, "sperm_whale_communication.csv"))

# Features and target
target_col_whale = "behavioral_context"
num_cols_whale = ["click_count", "inter_click_interval_ms", "frequency_hz", "duration_seconds"]

# Preprocess matriarch_present
df_whale["matriarch_present"] = df_whale["matriarch_present"].map({"Yes": 1, "No": 0}).fillna(0)

# Encode target
le_whale = LabelEncoder()
y_whale = le_whale.fit_transform(df_whale[target_col_whale].astype(str))

# Prepare features
X_whale = df_whale[num_cols_whale + ["matriarch_present"]]

# Split data
X_train_whale, X_test_whale, y_train_whale, y_test_whale = train_test_split(X_whale, y_whale, test_size=0.2, random_state=42)

# Scale
scaler_whale = StandardScaler()
X_train_whale_scaled = scaler_whale.fit_transform(X_train_whale)
X_test_whale_scaled = scaler_whale.transform(X_test_whale)

# Train Regularized Random Forest Classifier (preventing overfitting)
# We set max_depth=4 and min_samples_leaf=6 to generalize better
model_whale = RandomForestClassifier(
    n_estimators=150, 
    max_depth=4, 
    min_samples_split=10, 
    min_samples_leaf=6, 
    random_state=42
)
model_whale.fit(X_train_whale_scaled, y_train_whale)

# Cross Validation on Training Set (5-Fold)
cv_scores_whale = cross_val_score(model_whale, X_train_whale_scaled, y_train_whale, cv=kf, scoring='accuracy')

# Evaluation
train_acc = model_whale.score(X_train_whale_scaled, y_train_whale)
test_acc = model_whale.score(X_test_whale_scaled, y_test_whale)

print(f"Whale Coda Classifier Train Accuracy: {train_acc:.4f}")
print(f"Whale Coda Classifier Test Accuracy:  {test_acc:.4f}")
print(f"5-Fold Cross-Validation Accuracy:    {np.mean(cv_scores_whale):.4f} (+/- {np.std(cv_scores_whale):.4f})")

# Save Whale artifacts
whale_model_pkg = {
    "model": model_whale,
    "scaler": scaler_whale,
    "encoder": le_whale,
    "num_cols": num_cols_whale,
    "classes": list(le_whale.classes_)
}
with open(os.path.join(backend_dir, "whale_coda_model.pkl"), "wb") as f:
    pickle.dump(whale_model_pkg, f)
print("Saved whale_coda_model.pkl")

print("\nRegularized model training completed successfully!")
