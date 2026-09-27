"""
BOB SafePay AI — REST API Endpoints Router
Defines endpoints for authentication, transaction risk analysis, alerts, and analytics.
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import random

api_bp = Blueprint('api', __name__, url_prefix='/api')

# -----------------------------------------------------------------------------
# 1. Health Check Endpoint
# -----------------------------------------------------------------------------
@api_bp.route('/health', methods=['GET'])
def health_check():
    """Returns gateway status and active security telemetry"""
    return jsonify({
        "status": "healthy",
        "service": "BOB SafePay AI Security Gateway",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "compliance": "RBI Digital Payment Security Controls (Master Direction)",
        "models": {
            "fraud_classifier": "Random Forest v1.4 (Online)",
            "context_ai": "SafePay AI Assistant Engine (Ready)"
        }
    }), 200

# -----------------------------------------------------------------------------
# 2. Authentication Endpoint (POST /api/login)
# -----------------------------------------------------------------------------
@api_bp.route('/login', methods=['POST'])
def login():
    """Simulates student-project session authentication"""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Both authorized email and passcode are required."
        }), 400

    # Accept demo credentials or standard email format
    role = "Administrator" if "admin" in email else "Security Analyst"
    
    return jsonify({
        "status": "success",
        "message": "Session authenticated successfully.",
        "user": {
            "email": email,
            "role": role,
            "token": f"SAFEPAY_JWT_{random.randint(100000, 999999)}",
            "session_expiry": "8 hours"
        }
    }), 200

# -----------------------------------------------------------------------------
# 3. Transaction Risk Analysis Endpoint (POST /api/analyze)
# -----------------------------------------------------------------------------
@api_bp.route('/analyze', methods=['POST'])
def analyze_transaction():
    """Evaluates multi-vector transaction risk telemetry"""
    data = request.get_json() or {}

    try:
        amount = float(data.get('amount', 0))
        prev_avg = float(data.get('previous_average', 1))
        location = str(data.get('location', 'Mumbai, IN'))
        device = str(data.get('device', 'Unknown Hardware'))
        time_of_day = str(data.get('transaction_time', 'Daytime'))
        txn_type = str(data.get('transaction_type', 'UPI P2P'))
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Invalid numeric formats for amount or previous_average."
        }), 400

    # Algorithmic Risk Scoring Logic (Simulating ML pipeline)
    score = 12
    risk_factors = []

    # Vector 1: Spending surge ratio
    ratio = amount / (prev_avg if prev_avg > 0 else 1)
    if ratio > 4.0:
        score += 35
        risk_factors.append(f"Spending Surge: Transfer is {ratio:.1f}x higher than 30-day baseline.")

    # Vector 2: Hardware Fingerprint / SIM integrity
    if "New" in device or "Rooted" in device or "Linux" in device:
        score += 30
        risk_factors.append("Hardware Alert: Unrecognized hardware signature / unverified SIM.")

    # Vector 3: Impossible Travel / Foreign Proxy
    if "Moscow" in location or "Vegas" in location or "Bucharest" in location:
        score += 25
        risk_factors.append("Geo-Anomaly: Initiated outside trusted geographic perimeter (Impossible Travel).")

    # Vector 4: Off-hours timestamp
    if "Midnight" in time_of_day or "03:" in time_of_day:
        score += 15
        risk_factors.append("Time Velocity Anomaly: Transaction attempted during sleeping hours (03:14 AM).")

    # Clamp score
    score = min(score, 96)

    # Classify Tier
    if score >= 71:
        status = "HIGH RISK"
        recommendation = "Automated 24h cooling-off hold placed. Mandatory out-of-band biometric challenge required."
    elif score >= 31:
        status = "REVIEW"
        recommendation = "Interactive push OTP verification required on registered smartphone."
    else:
        status = "SAFE"
        recommendation = "Frictionless instant clearing authorized. All statutory bounds satisfied."
        if not risk_factors:
            risk_factors.append("Normal spending velocity matching established user profile.")
            risk_factors.append("Trusted primary hardware bound via device keystore.")

    return jsonify({
        "status": "success",
        "transaction_id": f"TXN-{random.randint(100000, 999999)}",
        "risk_score": score,
        "classification": status,
        "amount": amount,
        "risk_factors": risk_factors,
        "recommendation": recommendation,
        "evaluated_at": datetime.utcnow().isoformat()
    }), 200

# -----------------------------------------------------------------------------
# 4. Streamed Transactions Feed (GET /api/transactions)
# -----------------------------------------------------------------------------
@api_bp.route('/transactions', methods=['GET'])
def get_transactions():
    """Returns recent evaluated transaction stream"""
    mock_txns = [
        {
            "id": "TXN-9021",
            "merchant": "Luxury Electronics Store",
            "location": "Mumbai, MH (Proxy: Moscow RU)",
            "device": "New Linux Chrome / Unbound SIM",
            "amount": 85750.00,
            "risk_score": 87,
            "status": "FLAGGED"
        },
        {
            "id": "TXN-9022",
            "merchant": "Overseas Gaming Token",
            "location": "Las Vegas, NV (Proxy)",
            "device": "Rooted Android Emulator",
            "amount": 42500.00,
            "risk_score": 92,
            "status": "FLAGGED"
        },
        {
            "id": "TXN-9023",
            "merchant": "Crypto P2P Settlement",
            "location": "Bengaluru, KA",
            "device": "Trusted MacBook Pro",
            "amount": 125000.00,
            "risk_score": 68,
            "status": "UNDER REVIEW"
        },
        {
            "id": "TXN-9024",
            "merchant": "Baroda Supermarket Grocery",
            "location": "Vadodara, GJ",
            "device": "Primary iPhone 14 Pro",
            "amount": 1420.00,
            "risk_score": 14,
            "status": "APPROVED"
        }
    ]
    return jsonify({
        "status": "success",
        "count": len(mock_txns),
        "transactions": mock_txns
    }), 200

# -----------------------------------------------------------------------------
# 5. Active Security Alerts (GET /api/alerts)
# -----------------------------------------------------------------------------
@api_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """Returns active security alarms"""
    alerts = [
        {
            "id": "INC-8812",
            "severity": "CRITICAL",
            "title": "Impossible Travel & Unauthorized Linux Device",
            "txn_id": "TXN-9021",
            "amount": "₹ 85,750.00",
            "active": True
        },
        {
            "id": "INC-8813",
            "severity": "CRITICAL",
            "title": "Midnight Casino Token Cash-Out Attempt",
            "txn_id": "TXN-9022",
            "amount": "₹ 42,500.00",
            "active": True
        }
    ]
    return jsonify({
        "status": "success",
        "active_count": len(alerts),
        "alerts": alerts
    }), 200

# -----------------------------------------------------------------------------
# 6. Executive Analytics Metrics (GET /api/analytics)
# -----------------------------------------------------------------------------
@api_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Returns macro-level threat statistics"""
    return jsonify({
        "status": "success",
        "metrics": {
            "protected_volume_cr": 4.82,
            "intercepted_fraud_lakhs": 24.85,
            "model_precision": 0.986,
            "mean_latency_ms": 38,
            "distribution": {
                "safe_pct": 84,
                "review_pct": 11,
                "high_risk_pct": 5
            }
        }
    }), 200