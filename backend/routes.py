"""
BOB SafePay AI — Complete REST API Gateway
Integrates SQLite Database, Random Forest ML, and SafePay AI Context-Aware Chatbot.
"""

import sys
import os
from flask import Blueprint, request, jsonify
from datetime import datetime
import json
import random
from werkzeug.security import check_password_hash
from database import get_db_connection

# Add root folder to sys.path so we can import from ml and chatbot packages
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from ml.predict import predict_transaction_risk
from chatbot.chatbot import get_safepay_ai_response

api_bp = Blueprint('api', __name__, url_prefix='/api')

# -----------------------------------------------------------------------------
# 1. Health Check
# -----------------------------------------------------------------------------
@api_bp.route('/health', methods=['GET'])
def health_check():
    db_status = "connected"
    try:
        conn = get_db_connection()
        conn.execute('SELECT 1')
        conn.close()
    except Exception as e:
        db_status = f"error: {str(e)}"

    return jsonify({
        "status": "healthy",
        "service": "BOB SafePay AI Security Gateway",
        "version": "1.0.0",
        "database": {"engine": "SQLite3", "status": db_status},
        "ml_engine": {"model": "Random Forest v1.4", "status": "active"},
        "chatbot_engine": {"service": "SafePay AI Intelligence", "status": "online"},
        "timestamp": datetime.utcnow().isoformat()
    }), 200

# -----------------------------------------------------------------------------
# 2. Authentication (POST /api/login)
# -----------------------------------------------------------------------------
@api_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({"status": "error", "message": "Email and passcode required."}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({"status": "error", "message": "Invalid email or security passcode."}), 401

    return jsonify({
        "status": "success",
        "message": f"Welcome back, {user['role']}.",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "role": user['role'],
            "token": f"SAFEPAY_JWT_{random.randint(100000, 999999)}"
        }
    }), 200

# -----------------------------------------------------------------------------
# 3. Live ML Transaction Analysis (POST /api/analyze)
# -----------------------------------------------------------------------------
@api_bp.route('/analyze', methods=['POST'])
def analyze_transaction():
    data = request.get_json() or {}

    try:
        amount = float(data.get('amount', 0))
        prev_avg = float(data.get('previous_average', 1))
        location = str(data.get('location', 'Mumbai, IN'))
        device = str(data.get('device', 'Primary Device'))
        time_of_day = str(data.get('transaction_time', 'Daytime'))
        txn_type = str(data.get('transaction_type', 'UPI P2P'))
        merchant = str(data.get('merchant', 'Online Merchant'))
    except (ValueError, TypeError):
        return jsonify({"status": "error", "message": "Invalid numeric format."}), 400

    is_new_device = 1 if ("New" in device or "Linux" in device) else 0
    is_unusual_location = 1 if ("Moscow" in location or "Vegas" in location or "Proxy" in location) else 0
    is_unusual_time = 1 if ("Midnight" in time_of_day or "03:" in time_of_day) else 0
    is_rooted_emulator = 1 if ("Rooted" in device or "Emulator" in device) else 0
    velocity_1h = 4 if is_new_device or is_unusual_location else 1

    # Call Random Forest ML Inference
    ml_result = predict_transaction_risk({
        'amount': amount,
        'previous_average': prev_avg,
        'is_new_device': is_new_device,
        'is_unusual_location': is_unusual_location,
        'is_unusual_time': is_unusual_time,
        'is_rooted_emulator': is_rooted_emulator,
        'velocity_1h': velocity_1h
    })

    score = ml_result['risk_score']
    risk_level = ml_result['classification']
    risk_factors = ml_result['risk_factors']
    recommendation = ml_result['recommendation']
    txn_ref = f"TXN-{random.randint(100000, 999999)}"
    status = "FLAGGED" if risk_level == "HIGH RISK" else ("UNDER REVIEW" if risk_level == "REVIEW" else "APPROVED")

    # Persist in SQLite
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO transactions (
            txn_ref, merchant, amount, prev_avg, location, device,
            time_of_day, txn_type, risk_score, risk_level, risk_factors,
            recommendation, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        txn_ref, merchant, amount, prev_avg, location, device,
        time_of_day, txn_type, score, risk_level, json.dumps(risk_factors),
        recommendation, status
    ))

    if score >= 71:
        alert_ref = f"INC-{random.randint(1000, 9999)}"
        cursor.execute('''
            INSERT INTO alerts (
                alert_ref, severity, title, description, txn_ref, amount, merchant, resolved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            alert_ref, "CRITICAL", f"ML Alert: {risk_factors[0] if risk_factors else 'High Risk Pattern'}",
            f"Random Forest model evaluated risk index {score}%. Mandatory step-up enforced.",
            txn_ref, f"₹ {amount:,.2f}", merchant, 0
        ))

    conn.commit()
    conn.close()

    return jsonify({
        "status": "success",
        "transaction_id": txn_ref,
        "risk_score": score,
        "classification": risk_level,
        "amount": f"₹ {amount:,.2f}",
        "previous_average": f"₹ {prev_avg:,.2f}",
        "location": location,
        "device": device,
        "time": time_of_day,
        "txn_type": txn_type,
        "risk_factors": risk_factors,
        "recommendation": recommendation,
        "model_version": ml_result['model_version']
    }), 200

# -----------------------------------------------------------------------------
# 4. Context-Aware AI Chatbot (POST /api/chat)
# -----------------------------------------------------------------------------
@api_bp.route('/chat', methods=['POST'])
def chat():
    """Answers user inquiries with injected transaction context and logs conversation"""
    data = request.get_json() or {}
    user_message = data.get('message', '').strip()
    txn_context = data.get('transaction_context', None)
    session_id = data.get('session_id', 'DEFAULT_SESSION')

    if not user_message:
        return jsonify({"status": "error", "message": "Message content cannot be empty."}), 400

    # Call AI Engine with injected context
    ai_result = get_safepay_ai_response(user_message, txn_context)

    # Persist conversation in SQLite chat_history table
    try:
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO chat_history (session_id, sender, message, txn_context)
            VALUES (?, ?, ?, ?)
        ''', (session_id, 'USER', user_message, json.dumps(txn_context) if txn_context else None))
        
        conn.execute('''
            INSERT INTO chat_history (session_id, sender, message, txn_context)
            VALUES (?, ?, ?, ?)
        ''', (session_id, 'SAFEPAY_AI', ai_result['reply'], json.dumps(txn_context) if txn_context else None))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[DATABASE] Chat history log warning: {e}")

    return jsonify({
        "status": "success",
        "reply": ai_result['reply'],
        "provider": ai_result['provider'],
        "context_injected": ai_result['context_used'],
        "timestamp": datetime.utcnow().isoformat()
    }), 200

# -----------------------------------------------------------------------------
# 5. Transactions Feed (GET /api/transactions)
# -----------------------------------------------------------------------------
@api_bp.route('/transactions', methods=['GET'])
def get_transactions():
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM transactions ORDER BY id DESC').fetchall()
    conn.close()

    txns = []
    for r in rows:
        txns.append({
            "id": r['txn_ref'],
            "merchant": r['merchant'],
            "amount": r['amount'],
            "location": r['location'],
            "device": r['device'],
            "risk_score": r['risk_score'],
            "risk_level": r['risk_level'],
            "status": r['status'],
            "created_at": r['created_at']
        })

    return jsonify({"status": "success", "count": len(txns), "transactions": txns}), 200

# -----------------------------------------------------------------------------
# 6. Security Alerts (GET/POST /api/alerts)
# -----------------------------------------------------------------------------
@api_bp.route('/alerts', methods=['GET'])
def get_alerts():
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM alerts WHERE resolved = 0 ORDER BY id DESC').fetchall()
    conn.close()

    alerts = []
    for r in rows:
        alerts.append({
            "id": r['alert_ref'],
            "severity": r['severity'],
            "title": r['title'],
            "description": r['description'],
            "txn_id": r['txn_ref'],
            "amount": r['amount'],
            "merchant": r['merchant']
        })

    return jsonify({"status": "success", "active_count": len(alerts), "alerts": alerts}), 200

@api_bp.route('/alerts/<alert_ref>/resolve', methods=['POST'])
def resolve_alert(alert_ref):
    conn = get_db_connection()
    conn.execute('UPDATE alerts SET resolved = 1 WHERE alert_ref = ?', (alert_ref,))
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "message": f"Alert {alert_ref} resolved."}), 200