"""
BOB SafePay AI — Machine Learning Training Pipeline
Trains an explainable Random Forest Classifier for digital payment fraud detection.
Saves model weights and feature importances for real-time inference.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

def train_safepay_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_path = os.path.join(base_dir, 'dataset', 'transactions.csv')
    model_output_path = os.path.join(base_dir, 'ml', 'model', 'safepay_rf_model.joblib')

    print(f"\n==================================================")
    print(f"🧠  BOB SafePay AI — Machine Learning Pipeline")
    print(f"==================================================")

    # 1. Load the Synthetic Dataset
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Run ml/generate_dataset.py first!")

    print(f"[1/5] Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f"  • Total records: {len(df)}")
    print(f"  • Fraud count: {df['is_fraud'].sum()} ({df['is_fraud'].mean()*100:.2f}%)")

    # 2. Select Features for Training
    # We focus on quantitative behavioral telemetry
    feature_cols = [
        'amount',
        'previous_average',
        'amount_ratio',
        'is_new_device',
        'is_unusual_location',
        'is_unusual_time',
        'is_rooted_emulator',
        'velocity_1h'
    ]

    X = df[feature_cols]
    y = df['is_fraud']

    # 3. Stratified Train / Test Split (80% Train, 20% Test)
    print(f"[2/5] Splitting data into 80% Training and 20% Testing sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"  • Training set size: {len(X_train)} samples")
    print(f"  • Testing set size: {len(X_test)} samples (Unseen validation)")

    # 4. Train Random Forest Classifier
    print(f"[3/5] Training Random Forest ensemble (100 Decision Trees)...")
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        class_weight='balanced',  # Automatically handles the 94%/6% class imbalance
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    print("  ✓ Training complete!")

    # 5. Evaluate Performance on Unseen Test Data
    print(f"[4/5] Evaluating performance on 1,200 unseen test transactions...")
    y_pred = rf_model.predict(X_test)
    y_proba = rf_model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    print("\n---------------- MODEL METRICS ----------------")
    print(f"  🎯 Accuracy  : {acc*100:.2f}%")
    print(f"  🔍 Precision : {prec*100:.2f}%  (When model alerts fraud, it's correct)")
    print(f"  🛡️ Recall    : {rec*100:.2f}%  (Percentage of actual fraud caught)")
    print(f"  ⚖️ F1-Score  : {f1:.4f}  (Harmonic balance)")
    print("-----------------------------------------------")

    print("\nConfusion Matrix:")
    print(f"  [True Negatives (Safe correctly cleared)  : {cm[0][0]}]   [False Positives (False alarms): {cm[0][1]}]")
    print(f"  [False Negatives (Missed fraud attacks)   : {cm[1][0]}]   [True Positives (Fraud caught) : {cm[1][1]}]")

    # Feature Importance Breakdown (Explainable AI - XAI)
    print("\nExplainable AI (XAI) Feature Importances:")
    importances = rf_model.feature_importances_
    feature_importance_dict = {}
    for col, imp in sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True):
        feature_importance_dict[col] = round(float(imp), 4)
        bar = "█" * int(imp * 30)
        print(f"  • {col:22s} : {imp*100:5.1f}%  {bar}")

    # 6. Save Model Artifact
    print(f"\n[5/5] Saving model artifact to: {model_output_path}")
    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    
    artifact = {
        'model': rf_model,
        'feature_cols': feature_cols,
        'metrics': {
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4)
        },
        'feature_importances': feature_importance_dict
    }

    joblib.dump(artifact, model_output_path)
    print(f"✓ Model successfully persisted! Ready for Flask API inference.")
    print(f"==================================================\n")

if __name__ == '__main__':
    train_safepay_model()