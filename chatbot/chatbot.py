"""
BOB SafePay AI — Conversational Intelligence Engine
Orchestrates prompt engineering, transaction context injection, and AI API dispatch
(Supports Google Gemini REST API with local cybersecurity heuristic fallback).
"""

import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

AI_API_KEY = os.getenv('AI_API_KEY', '').strip()
AI_MODEL_NAME = os.getenv('AI_MODEL_NAME', 'gemini-1.5-flash')

SYSTEM_INSTRUCTION = """
You are "SafePay AI", an expert cybersecurity banking intelligence assistant for BOB SafePay AI 
(inspired by Bank of Baroda digital payment security controls and RBI Master Directions).

YOUR CORE RESPONSIBILITIES:
1. Explain transaction risk scores (0-100) and why specific payments were flagged (Safe, Review, High Risk).
2. Answer questions regarding suspicious payment behavior, unauthorized SIM-swaps, impossible travel, and device integrity.
3. Advise users on protective actions (e.g. Emergency UPI Freeze, dialing 1930 Cyber Fraud Helpline within the golden window).
4. ALWAYS cite specific numbers and parameters provided in the Active Transaction Context.
5. NEVER invent transaction facts. If context is missing, ask the user to analyze a transaction first.
6. Keep answers professional, concise, empathetic, and formatted in clear bullet points where helpful.
"""

def generate_context_prompt(user_message: str, txn_context: dict = None) -> str:
    """Builds a grounded prompt containing active transaction telemetry"""
    if not txn_context:
        return f"User Inquiry: {user_message}\n(Note: No active transaction context is currently selected)."

    context_str = f"""
[ACTIVE TRANSACTION SECURITY CONTEXT]
- Transaction Reference : {txn_context.get('id', 'N/A')}
- Amount                : {txn_context.get('amount', 'N/A')}
- 30-Day Historical Avg : {txn_context.get('prevAvg', 'N/A')}
- Initiating Geolocation: {txn_context.get('location', 'N/A')}
- Hardware Fingerprint  : {txn_context.get('device', 'N/A')}
- Timestamp             : {txn_context.get('time', 'N/A')}
- Evaluated Risk Score  : {txn_context.get('score', 'N/A')}% ({txn_context.get('riskLevel', 'N/A')})
- Detected Risk Factors : {', '.join(txn_context.get('factors', []))}
- Recommended Action    : {txn_context.get('recommendation', 'N/A')}
--------------------------------------------------
User Inquiry: {user_message}
"""
    return context_str

def call_gemini_api(prompt: str) -> str:
    """Dispatches request to Google Gemini REST API using server-side API key"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{AI_MODEL_NAME}:generateContent?key={AI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": f"{SYSTEM_INSTRUCTION}\n\n{prompt}"}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 450}
    }

    response = requests.post(url, headers=headers, json=payload, timeout=8)
    if response.status_code == 200:
        data = response.json()
        return data['candidates'][0]['content']['parts'][0]['text']
    else:
        raise Exception(f"Gemini API returned status {response.status_code}: {response.text}")

def get_fallback_expert_response(user_message: str, txn_context: dict = None) -> str:
    """
    Expert Cybersecurity Heuristic Engine.
    Ensures 100% reliable hackathon demonstrations even without an active AI API key!
    """
    msg = user_message.lower()

    # Scenario A: Asking why the transaction was flagged
    if any(k in msg for k in ['why', 'flag', 'score', 'risk', 'reason', 'blocked']):
        if txn_context:
            factors_list = "".join([f"<li><strong>{f}</strong></li>" for f in txn_context.get('factors', [])])
            return f"""
<strong>Transaction {txn_context.get('id')}</strong> was classified as <strong>{txn_context.get('riskLevel')}</strong> with an AI risk index of <strong>{txn_context.get('score')}%</strong> due to the following detected anomalies:
<ul style="margin: 8px 0 8px 18px; line-height: 1.6;">
  {factors_list}
</ul>
<strong>Regulatory Intervention:</strong> {txn_context.get('recommendation')}<br><br>
Under Reserve Bank of India (RBI) Digital Payment Controls, out-of-band biometric authentication or a cooling-off hold is required to safeguard your funds.
"""
        else:
            return "I currently do not have an active transaction context loaded. Please analyze a payment on the Risk Analyzer screen first, and I will diagnose its exact flags!"

    # Scenario B: What to do if transaction is unrecognized / fraud
    if any(k in msg for k in ['recognize', 'dont know', 'not mine', 'hack', 'freeze', 'help']):
        return f"""
If you do <strong>not</strong> recognize this transaction ({txn_context.get('id') if txn_context else 'payment'}), please follow this emergency protocol immediately:
<ol style="margin: 8px 0 8px 18px; line-height: 1.6;">
  <li><strong>Engage 1-Click Freeze:</strong> Use the <span style="color: var(--color-risk); font-weight:700;">Emergency Freeze UPI</span> button to instantly halt all outbound debits.</li>
  <li><strong>Dial Cyber Fraud Helpline (1930):</strong> Report the incident to the Citizen Financial Cyber Fraud Reporting System within the 24-hour golden window.</li>
  <li><strong>Device Quarantine:</strong> Check your device for unauthorized remote screen-sharing tools (AnyDesk, TeamViewer) and change your Bank of Baroda NetBanking PIN from a trusted terminal.</li>
</ol>
"""

    # Scenario C: Explaining the scoring calculation
    if any(k in msg for k in ['calculate', 'formula', 'how does', 'model', 'random forest']):
        return """
The <strong>0–100 SafePay Risk Score</strong> is calculated through our dual-layer security pipeline:
<ol style="margin: 8px 0 8px 18px; line-height: 1.6;">
  <li><strong>RBI Deterministic Rules:</strong> Immediate hard checks for SIM-swap flags within 48 hours, beneficiary cooling-off limits, and known mule VPA blacklists.</li>
  <li><strong>Random Forest ML Ensemble:</strong> Evaluates feature importance splits across historical spending deviation (38% weight), hardware fingerprint integrity (25% weight), geo-velocity distance (18% weight), and off-hours timestamps (8% weight).</li>
</ol>
Scores 0–30 are cleared instantly. Scores 31–70 require step-up OTP. Scores 71–100 are frozen automatically.
"""

    # Default fallback
    return f"""
I evaluated your inquiry regarding <strong>{txn_context.get('id') if txn_context else 'payment security'}</strong>. 
<br><br>
All security shields are actively monitoring this session. Feel free to ask:
<ul style="margin: 6px 0 0 18px;">
  <li><em>"Why was this transaction flagged?"</em></li>
  <li><em>"Explain the risk score calculation"</em></li>
  <li><em>"What should I do if I don't recognize this payment?"</em></li>
</ul>
"""

def get_safepay_ai_response(user_message: str, txn_context: dict = None) -> dict:
    """
    Main entrypoint: Dispatches to real Gemini API if key is present;
    otherwise falls back smoothly to expert heuristic parser.
    """
    prompt = generate_context_prompt(user_message, txn_context)

    # If user provided a real Gemini API Key in .env, call the live cloud model!
    if AI_API_KEY and AI_API_KEY != 'your_ai_api_key_here':
        try:
            ai_reply = call_gemini_api(prompt)
            # Format markdown newlines to HTML breaks for beautiful chat bubbles
            formatted_reply = ai_reply.replace('\n', '<br>')
            return {
                "reply": formatted_reply,
                "provider": "Google Gemini 1.5 Flash (Live AI)",
                "context_used": bool(txn_context)
            }
        except Exception as e:
            print(f"[SAFEPAY AI] Cloud API warning ({e}), engaging local expert fallback...")

    # Reliable local fallback
    fallback_reply = get_fallback_expert_response(user_message, txn_context)
    return {
        "reply": fallback_reply,
        "provider": "SafePay Expert Intelligence Engine (Local)",
        "context_used": bool(txn_context)
    }

if __name__ == '__main__':
    # Standalone CLI test
    sample_context = {
        'id': 'TXN-884912',
        'amount': '₹ 85,750.00',
        'prevAvg': '₹ 12,000.00',
        'location': 'Moscow, RU',
        'device': 'New Linux Chrome',
        'time': '03:14 AM',
        'score': 96,
        'riskLevel': 'HIGH RISK',
        'factors': ['Spending Surge (7.1x)', 'New Device Hardware', 'Impossible Travel to Moscow'],
        'recommendation': 'Automated 24h cooling-off hold placed.'
    }
    resp = get_safepay_ai_response("Why was this transaction flagged?", sample_context)
    print("\nChatbot Response Test:")
    print(resp['reply'])