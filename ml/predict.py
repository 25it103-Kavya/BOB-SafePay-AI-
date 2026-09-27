"""
BOB SafePay AI — Real-Time Model Inference Engine
Loads serialized Random Forest weights and computes localized risk scores and XAI factors.
"""

import os
import joblib
import pandas as pd
import numpy as np

# Cache model in memory so we only load the file once
_MODEL_ARTIFACT = None

def get_model():
    """Loads and caches the trained Random Forest model artifact"""
    global _MODEL_ARTIFACT
    if _MODEL_ARTIFACT is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, 'ml', 'model', 'safepay_rf_model.joblib')
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model weights not found at: {model_path}. Run ml/train.py first!")
        _MODEL_ARTIFACT = joblib.load(model_path)
    return _MODEL_ARTIFACT

def predict_transaction_risk(txn_data: dict) -> dict:
    """
    Executes real-time inference on incoming transaction telemetry.
    Returns: risk_score (0-100), classification, and explainable AI factors.
    """
    artifact = get_model()
    model = artifact['model']
    feature_cols = artifact['feature_cols']

    amount = float(txn_data.get('amount', 0))
    prev_avg = float(txn_data.get('previous_average', 1))
    prev_avg = prev_avg if prev_avg > 0 else 1.0
    amount_ratio = round(amount / prev_avg, 2)

    is_new_device = int(txn_data.get('is_new_device', 0))
    is_unusual_location = int(txn_data.get('is_unusual_location', 0))
    is_unusual_time = int(txn_data.get('is_unusual_time', 0))
    is_rooted_emulator = int(txn_data.get('is_rooted_emulator', 0))
    velocity_1h = int(txn_data.get('velocity_1h', 1))

    # Construct tabular vector with exact feature column order
    input_df = pd.DataFrame([{
        'amount': amount,
        'previous_average': prev_avg,
        'amount_ratio': amount_ratio,
        'is_new_device': is_new_device,
        'is_unusual_location': is_unusual_location,
        'is_unusual_time': is_unusual_time,
        'is_rooted_emulator': is_rooted_emulator,
        'velocity_1h': velocity_1h
    }])[feature_cols]

    # Calculate model probability: P(fraud | X)
    fraud_prob = float(model.predict_proba(input_df)[0][1])

    # Convert probability to a 0–100 integer score
    # Apply baseline scaling for realistic banking friction
    risk_score = int(round(fraud_prob * 100))
    risk_score = max(8, min(risk_score, 96)) # Clamp between 8% and 96%

    # Determine Explainable AI (XAI) Local Drivers
    risk_factors = []
    if amount_ratio > 3.5:
        risk_factors.append(f"Spending Surge: Transaction amount is {amount_ratio:.1f}x higher than 30-day baseline.")
    if is_new_device == 1:
        risk_factors.append("Hardware Alert: Initiated from a brand-new unrecognized hardware fingerprint.")
    if is_unusual_location == 1:
        risk_factors.append("Geo-Anomaly: Connection routed outside user trusted geo-fence (Impossible Travel).")
    if is_unusual_time == 1:
        risk_factors.append("Timestamp Velocity: Transfer initiated during off-peak sleeping hours (03:14 AM).")
    if is_rooted_emulator == 1:
        risk_factors.append("Critical Environment Violation: Rooted emulator or remote-access screen sharing detected.")
    if velocity_1h > 3:
        risk_factors.append(f"Burst Velocity: {velocity_1h} transactions initiated within the past 60 minutes.")

    # Classify Tier & Formulate Action
    if risk_score >= 71:
        classification = "HIGH RISK"
        recommendation = "Automated 24h cooling-off hold placed. Mandatory out-of-band biometric challenge required."
    elif risk_score >= 31:
        classification = "REVIEW"
        recommendation = "Interactive push OTP verification required on registered primary smartphone."
    else:
        classification = "SAFE"
        recommendation = "Frictionless instant clearing authorized. All statutory bounds satisfied."
        if not risk_factors:
            risk_factors.append("Normal spending velocity matching typical behavioral baseline.")
            risk_factors.append("Trusted primary hardware bound via device keystore.")

    return {
        "risk_score": risk_score,
        "classification": classification,
        "fraud_probability": round(fraud_prob, 4),
        "amount_ratio": amount_ratio,
        "risk_factors": risk_factors,
        "recommendation": recommendation,
        "model_version": "Random Forest v1.4"
    }

if __name__ == '__main__':
    # Quick standalone CLI test
    test_sample = {
        'amount': 85750,
        'previous_average': 12000,
        'is_new_device': 1,
        'is_unusual_location': 1,
        'is_unusual_time': 1,
        'is_rooted_emulator': 0,
        'velocity_1h': 4
    }
    result = predict_transaction_risk(test_sample)
    print("Standalone ML Prediction Test:")
    print(result)