"""
BOB SafePay AI — Relational SQLite Database Engine
Handles database initialization, schema migration, password hashing, and seed records.
"""

import sqlite3
import os
import json
from werkzeug.security import generate_password_hash, check_password_hash

# Path to the SQLite database file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'safepay.db')

def get_db_connection():
    """Returns an active SQLite database connection with row access by column name"""
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Enables dict-like access: row['email']
    return conn

def init_db():
    """Initializes the database schema and seeds initial accounts and transactions"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table (Password hashing enabled)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'Security Analyst',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 2. Transactions Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            txn_ref TEXT UNIQUE NOT NULL,
            merchant TEXT NOT NULL,
            amount REAL NOT NULL,
            prev_avg REAL NOT NULL,
            location TEXT NOT NULL,
            device TEXT NOT NULL,
            time_of_day TEXT NOT NULL,
            txn_type TEXT NOT NULL,
            risk_score INTEGER NOT NULL,
            risk_level TEXT NOT NULL,
            risk_factors TEXT NOT NULL, -- Stored as JSON string
            recommendation TEXT,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 3. Security Alerts Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_ref TEXT UNIQUE NOT NULL,
            severity TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            txn_ref TEXT,
            amount TEXT,
            merchant TEXT,
            resolved INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 4. Chatbot History Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            txn_context TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()

    # -------------------------------------------------------------------------
    # Seed Initial User Accounts (If table is empty)
    # -------------------------------------------------------------------------
    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] == 0:
        print("[DATABASE] Seeding initial authorized accounts with hashed passwords...")
        
        # User 1: Security Analyst
        analyst_hash = generate_password_hash('SafePay2026!')
        cursor.execute(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            ('analyst@safepay.bob.in', analyst_hash, 'Security Analyst')
        )

        # User 2: Administrator
        admin_hash = generate_password_hash('AdminSecure#99')
        cursor.execute(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            ('admin@safepay.bob.in', admin_hash, 'Administrator')
        )
        conn.commit()
        print("✓ Created: analyst@safepay.bob.in (Passcode: SafePay2026!)")
        print("✓ Created: admin@safepay.bob.in (Passcode: AdminSecure#99)")

    # -------------------------------------------------------------------------
    # Seed Initial Transactions
    # -------------------------------------------------------------------------
    cursor.execute('SELECT COUNT(*) FROM transactions')
    if cursor.fetchone()[0] == 0:
        print("[DATABASE] Seeding initial audit transactions...")
        seed_txns = [
            (
                'TXN-9021', 'Luxury Electronics Store', 85750.00, 12000.00,
                'Mumbai, MH (Proxy: Moscow RU)', 'New Linux Chrome / Unbound SIM',
                'Midnight (03:14 AM)', 'IMPS High-Value Wire', 87, 'HIGH RISK',
                json.dumps(['Spending Surge: 7.1x higher than baseline', 'Hardware Alert: New unrecognized Linux device', 'Geo-Anomaly: Initiated outside trusted perimeter']),
                'Automated 24h cooling-off hold placed.', 'FLAGGED'
            ),
            (
                'TXN-9022', 'Overseas Gaming Token', 42500.00, 8000.00,
                'Las Vegas, NV (Proxy)', 'Rooted Android Emulator',
                'Midnight (03:14 AM)', 'Crypto Gateway', 92, 'HIGH RISK',
                json.dumps(['Rooted Emulator Detected', 'Impossible Travel Hop', 'Off-Hours Velocity']),
                'Outbound immediate freeze active.', 'FLAGGED'
            ),
            (
                'TXN-9023', 'Crypto P2P Settlement', 125000.00, 25000.00,
                'Bengaluru, KA', 'Trusted MacBook Pro',
                'Evening (07:15 PM)', 'UPI P2P', 68, 'REVIEW',
                json.dumps(['Spending Spike: 5.0x higher than typical']),
                'Interactive biometric step-up challenge dispatched.', 'UNDER REVIEW'
            ),
            (
                'TXN-9024', 'Baroda Supermarket Grocery', 1420.00, 1200.00,
                'Vadodara, GJ', 'Primary iPhone 14 Pro',
                'Daytime (02:30 PM)', 'UPI P2M', 14, 'SAFE',
                json.dumps(['Normal spending pattern', 'Trusted hardware']),
                'Instant frictionless clearing authorized.', 'APPROVED'
            )
        ]

        cursor.executemany('''
            INSERT INTO transactions (
                txn_ref, merchant, amount, prev_avg, location, device,
                time_of_day, txn_type, risk_score, risk_level, risk_factors,
                recommendation, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', seed_txns)
        conn.commit()
        print(f"✓ Seeded {len(seed_txns)} forensic transactions.")

    # -------------------------------------------------------------------------
    # Seed Initial Security Alerts
    # -------------------------------------------------------------------------
    cursor.execute('SELECT COUNT(*) FROM alerts')
    if cursor.fetchone()[0] == 0:
        print("[DATABASE] Seeding initial security alerts...")
        seed_alerts = [
            ('INC-8812', 'CRITICAL', 'Impossible Travel & Unauthorized Linux Device',
             'Transaction initiated from Moscow, RU on an unrecognized Linux browser within 18 minutes of Mumbai.',
             'TXN-9021', '₹ 85,750.00', 'Luxury Electronics Store', 0),
            ('INC-8813', 'CRITICAL', 'Midnight Casino Token Cash-Out Attempt',
             'High-value wire attempted at 03:14 AM via a rooted Android emulator with AnyDesk overlay signature.',
             'TXN-9022', '₹ 42,500.00', 'Overseas Gaming Token', 0),
            ('INC-8814', 'REVIEW', 'Sudden Volume Spike on Crypto Gateway',
             'Transfer amount is 4.8x higher than 30-day historical mean. Cooling-off period enforced.',
             'TXN-9023', '₹ 1,25,000.00', 'Crypto P2P Settlement', 0),
            ('INC-8809', 'RESOLVED', 'Legitimate Flight Ticket Booking Cleared',
             'High-value domestic flight purchase cleared after customer successfully completed in-app biometric verification.',
             'TXN-8790', '₹ 28,400.00', 'Air India Online', 1)
        ]

        cursor.executemany('''
            INSERT INTO alerts (
                alert_ref, severity, title, description, txn_ref, amount, merchant, resolved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', seed_alerts)
        conn.commit()
        print(f"✓ Seeded {len(seed_alerts)} security alerts.")

    conn.close()
    print("==================================================")
    print("✓ SQLite Database Successfully Initialized & Seeded!")
    print(f"📁 Location: {DATABASE_PATH}")
    print("==================================================\n")

if __name__ == '__main__':
    init_db()