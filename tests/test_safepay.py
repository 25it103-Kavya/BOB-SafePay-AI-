"""
BOB SafePay AI — Automated Full-Stack Verification & Security Audit Suite
Executes 9 end-to-end tests across Database, Authentication, ML Model, APIs, and Git Security.
"""

import os
import sys
import unittest
import json
import sqlite3

# Ensure root folder is on Python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# Import backend modules
from backend.app import create_app
from backend.database import get_db_connection, DATABASE_PATH
from ml.predict import predict_transaction_risk
from chatbot.chatbot import get_safepay_ai_response
from werkzeug.security import check_password_hash

class TestBOBSafePayAI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Set up Flask test client and ensure database exists"""
        cls.app = create_app()
        cls.client = cls.app.test_client()
        cls.app.config['TESTING'] = True

    # -------------------------------------------------------------------------
    # TEST 1: Database Schema & Relational Integrity
    # -------------------------------------------------------------------------
    def test_01_database_tables_exist(self):
        """Verify that all 4 SQLite tables exist and are accessible"""
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        conn.close()

        required_tables = ['users', 'transactions', 'alerts', 'chat_history']
        for table in required_tables:
            self.assertIn(table, tables, f"Database table '{table}' is missing!")
        print("  ✓ [TEST 1/9 PASSED] SQLite Schema & 4 Core Tables Verified.")

    # -------------------------------------------------------------------------
    # TEST 2: Password Hashing & Salt Verification (Zero Plaintext)
    # -------------------------------------------------------------------------
    def test_02_password_hashing(self):
        """Confirm that passwords in the database are hashed with scrypt/pbkdf2"""
        conn = get_db_connection()
        user = conn.execute("SELECT * FROM users WHERE email = 'analyst@safepay.bob.in'").fetchone()
        conn.close()

        self.assertIsNotNone(user, "Default analyst user not found in database.")
        self.assertNotEqual(user['password_hash'], 'SafePay2026!', "SECURITY FLAW: Plaintext password found in DB!")
        self.assertTrue(check_password_hash(user['password_hash'], 'SafePay2026!'), "Password hash failed verification.")
        print("  ✓ [TEST 2/9 PASSED] Password Hashing & Salt Security Verified.")

    # -------------------------------------------------------------------------
    # TEST 3: Machine Learning Model Inference
    # -------------------------------------------------------------------------
    def test_03_ml_model_inference(self):
        """Verify that Random Forest model loads and predicts probability correctly"""
        sample_high_risk = {
            'amount': 85750,
            'previous_average': 12000,
            'is_new_device': 1,
            'is_unusual_location': 1,
            'is_unusual_time': 1,
            'is_rooted_emulator': 0,
            'velocity_1h': 4
        }
        res = predict_transaction_risk(sample_high_risk)
        self.assertGreaterEqual(res['risk_score'], 71, "High-risk vector did not score >= 71%")
        self.assertEqual(res['classification'], 'HIGH RISK')
        self.assertGreater(len(res['risk_factors']), 0, "No XAI risk factors generated.")
        print(f"  ✓ [TEST 3/9 PASSED] Random Forest ML Inference Verified (Score: {res['risk_score']}%).")

    # -------------------------------------------------------------------------
    # TEST 4: API Health Check Endpoint
    # -------------------------------------------------------------------------
    def test_04_api_health(self):
        """Verify GET /api/health returns HTTP 200 and healthy telemetry"""
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['database']['status'], 'connected')
        print("  ✓ [TEST 4/9 PASSED] API Gateway Health & Database Telemetry Verified.")

    # -------------------------------------------------------------------------
    # TEST 5: API Authentication (Success & Failure Cases)
    # -------------------------------------------------------------------------
    def test_05_api_login(self):
        """Test POST /api/login with valid and invalid credentials"""
        # Case A: Valid Login
        valid_payload = {"email": "analyst@safepay.bob.in", "password": "SafePay2026!"}
        res_valid = self.client.post('/api/login', json=valid_payload)
        self.assertEqual(res_valid.status_code, 200)
        self.assertEqual(json.loads(res_valid.data)['status'], 'success')

        # Case B: Invalid Password
        invalid_payload = {"email": "analyst@safepay.bob.in", "password": "WrongPassword999"}
        res_invalid = self.client.post('/api/login', json=invalid_payload)
        self.assertEqual(res_invalid.status_code, 401)
        print("  ✓ [TEST 5/9 PASSED] Authentication Endpoint & Rejection Logic Verified.")

    # -------------------------------------------------------------------------
    # TEST 6: Transaction Evaluation & Auto-Alert Generation
    # -------------------------------------------------------------------------
    def test_06_analyze_high_risk_transaction(self):
        """Test POST /api/analyze evaluates high-risk payment and persists an alert"""
        payload = {
            "amount": 95000,
            "previous_average": 10000,
            "location": "Moscow, RU (Proxy)",
            "device": "New Linux Chrome / Unbound SIM",
            "transaction_time": "Midnight (03:14 AM)",
            "transaction_type": "IMPS Wire",
            "merchant": "Foreign Crypto Node"
        }
        res = self.client.post('/api/analyze', json=payload)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['classification'], 'HIGH RISK')
        self.assertGreaterEqual(data['risk_score'], 71)

        # Verify that an alert was automatically recorded in SQLite
        conn = get_db_connection()
        alert = conn.execute("SELECT * FROM alerts WHERE txn_ref = ?", (data['transaction_id'],)).fetchone()
        conn.close()
        self.assertIsNotNone(alert, "High-risk transaction failed to generate an alert in SQLite!")
        print(f"  ✓ [TEST 6/9 PASSED] High-Risk Analysis & Automatic Alert Generation Verified.")

    # -------------------------------------------------------------------------
    # TEST 7: Safe Transaction Evaluation (Frictionless Approval)
    # -------------------------------------------------------------------------
    def test_07_analyze_safe_transaction(self):
        """Test POST /api/analyze frictionlessly clears normal payment"""
        payload = {
            "amount": 420,
            "previous_average": 500,
            "location": "Vadodara, GJ",
            "device": "Primary iPhone 14 Pro",
            "transaction_time": "Daytime",
            "transaction_type": "UPI P2M",
            "merchant": "Local Kirana Store"
        }
        res = self.client.post('/api/analyze', json=payload)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['classification'], 'SAFE')
        self.assertLessEqual(data['risk_score'], 30)
        print(f"  ✓ [TEST 7/9 PASSED] Safe Transaction Evaluation & Low-Friction Clearing Verified.")

    # -------------------------------------------------------------------------
    # TEST 8: Context-Aware Chatbot with Injected Transaction State
    # -------------------------------------------------------------------------
    def test_08_chatbot_context_injection(self):
        """Test POST /api/chat answers questions citing the active transaction context"""
        txn_context = {
            "id": "TXN-TEST-99",
            "amount": "₹ 85,750.00",
            "prevAvg": "₹ 12,000.00",
            "location": "Moscow, RU",
            "device": "New Linux Chrome",
            "score": 96,
            "riskLevel": "HIGH RISK",
            "factors": ["Spending Surge (7.1x)", "Moscow Proxy", "New Hardware Fingerprint"],
            "recommendation": "Automated 24h cooling-off hold placed."
        }
        chat_payload = {
            "message": "Why was this transaction flagged?",
            "transaction_context": txn_context,
            "session_id": "TEST_SESSION"
        }
        res = self.client.post('/api/chat', json=chat_payload)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'success')
        self.assertTrue(data['context_injected'], "Chatbot failed to inject transaction context!")
        self.assertIn("TXN-TEST-99", data['reply'], "Chatbot failed to cite the active transaction reference!")
        print("  ✓ [TEST 8/9 PASSED] SafePay AI Chatbot & Context Injection Verified.")

    # -------------------------------------------------------------------------
    # TEST 9: Cybersecurity & Git Repository Security Audit
    # -------------------------------------------------------------------------
    def test_09_security_gitignore_audit(self):
        """Verify .gitignore properly excludes secrets, databases, and virtualenvs"""
        gitignore_path = os.path.join(BASE_DIR, '.gitignore')
        self.assertTrue(os.path.exists(gitignore_path), ".gitignore file is missing!")

        with open(gitignore_path, 'r') as f:
            content = f.read()

        critical_ignores = ['.env', 'venv', '*.db', '__pycache__']
        for item in critical_ignores:
            self.assertIn(item, content, f"SECURITY VULNERABILITY: '{item}' is not ignored in .gitignore!")
        print("  ✓ [TEST 9/9 PASSED] Cybersecurity Repository Audit Verified (Zero Leaks).")

def run_tests():
    print("\n==================================================")
    print("🛡️  BOB SafePay AI — Full-Stack Verification Suite")
    print("==================================================")
    suite = unittest.TestLoader().loadTestsFromTestCase(TestBOBSafePayAI)
    runner = unittest.TextTestRunner(verbosity=0)
    result = runner.run(suite)

    print("==================================================")
    if result.wasSuccessful():
        print(f"🎉  ALL {result.testsRun} TESTS PASSED PERFECTLY! (100% HEALTH)")
        print("    System is fully operational and hackathon-submission ready.")
    else:
        print(f"❌  {len(result.failures)} Failures, {len(result.errors)} Errors detected.")
    print("==================================================\n")
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)