"""
BOB SafePay AI — Synthetic Banking Dataset Generator
Generates realistic Indian digital payment telemetry (UPI, IMPS, Geolocation, Device Fingerprints)
for training the Random Forest fraud-detection model.
"""

import os
import random
import numpy as np
import pandas as pd

# Set deterministic random seeds for reproducible hackathon results
random.seed(42)
np.random.seed(42)

TOTAL_RECORDS = 6000
FRAUD_RATIO = 0.06  # 6% fraud (realistic banking class imbalance)

def generate_synthetic_transactions():
    """Generates synthetic Indian digital payment records with explainable risk features"""
    records = []

    num_fraud = int(TOTAL_RECORDS * FRAUD_RATIO)
    num_legit = TOTAL_RECORDS - num_fraud

    print(f"[DATASET GENERATOR] Synthesizing {TOTAL_RECORDS} transaction records...")
    print(f"  • Normal/Safe Payments: {num_legit} (94.0%)")
    print(f"  • Anomalous/Fraud Attacks: {num_fraud} (6.0%)")

    # -------------------------------------------------------------------------
    # 1. Synthesize Legitimate Transactions (94%)
    # -------------------------------------------------------------------------
    for i in range(num_legit):
        txn_id = f"TXN_{i+1:06d}"

        # Typical Indian user baseline spending (₹500 to ₹15,000)
        prev_avg = round(float(np.random.exponential(scale=3500) + 400), 2)
        prev_avg = min(prev_avg, 35000.0)

        # Legitimate transactions stay close to historical average (0.3x to 2.2x)
        amount_ratio = round(float(np.random.uniform(0.3, 2.2)), 2)
        amount = round(prev_avg * amount_ratio, 2)

        # Legitimate features: mostly trusted devices, home locations, daytime hours
        is_new_device = 1 if random.random() < 0.08 else 0       # 8% legitimate device changes
        is_unusual_location = 1 if random.random() < 0.05 else 0 # 5% legitimate travel
        is_unusual_time = 1 if random.random() < 0.06 else 0     # 6% late night grocery/cab
        is_rooted_emulator = 0                                    # Legitimate users don't run emulators
        velocity_1h = random.choices([1, 2, 3, 4], weights=[0.70, 0.20, 0.08, 0.02])[0]

        txn_type = random.choices(
            ['UPI_P2M', 'UPI_P2P', 'BILL_PAY', 'IMPS_WIRE'],
            weights=[0.55, 0.30, 0.12, 0.03]
        )[0]

        records.append({
            'transaction_id': txn_id,
            'amount': amount,
            'previous_average': prev_avg,
            'amount_ratio': amount_ratio,
            'is_new_device': is_new_device,
            'is_unusual_location': is_unusual_location,
            'is_unusual_time': is_unusual_time,
            'is_rooted_emulator': is_rooted_emulator,
            'velocity_1h': velocity_1h,
            'transaction_type': txn_type,
            'is_fraud': 0  # TARGET: Legitimate
        })

    # -------------------------------------------------------------------------
    # 2. Synthesize Fraudulent / Account-Takeover Attacks (6%)
    # -------------------------------------------------------------------------
    for i in range(num_fraud):
        txn_id = f"TXN_{num_legit + i + 1:06d}"

        prev_avg = round(float(np.random.exponential(scale=3000) + 500), 2)

        # Fraud attacks frequently attempt high-value fund draining (4x to 15x normal)
        amount_ratio = round(float(np.random.uniform(4.2, 14.5)), 2)
        amount = round(prev_avg * amount_ratio, 2)

        # High-risk anomaly indicators
        is_new_device = 1 if random.random() < 0.88 else 0       # 88% fraud involves new hardware
        is_unusual_location = 1 if random.random() < 0.82 else 0 # 82% proxy / impossible travel
        is_unusual_time = 1 if random.random() < 0.65 else 0     # 65% midnight / off-hours cash-outs
        is_rooted_emulator = 1 if random.random() < 0.35 else 0  # 35% automated bot/emulator attacks
        velocity_1h = random.choices([4, 6, 8, 12], weights=[0.40, 0.30, 0.20, 0.10])[0]

        txn_type = random.choices(
            ['IMPS_WIRE', 'CRYPTO_ONRAMP', 'UPI_P2P'],
            weights=[0.45, 0.35, 0.20]
        )[0]

        records.append({
            'transaction_id': txn_id,
            'amount': amount,
            'previous_average': prev_avg,
            'amount_ratio': amount_ratio,
            'is_new_device': is_new_device,
            'is_unusual_location': is_unusual_location,
            'is_unusual_time': is_unusual_time,
            'is_rooted_emulator': is_rooted_emulator,
            'velocity_1h': velocity_1h,
            'transaction_type': txn_type,
            'is_fraud': 1  # TARGET: Fraud / Attack
        })

    # Shuffle the dataset so fraud and safe records are randomly mixed
    random.shuffle(records)
    df = pd.DataFrame(records)

    # Save to dataset/transactions.csv
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_path = os.path.join(base_dir, 'dataset', 'transactions.csv')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)

    print(f"\n==================================================")
    print(f"✓ Synthetic Dataset Successfully Created!")
    print(f"📁 Output File: {output_path}")
    print(f"📊 Total Rows: {len(df)}")
    print(f"📈 Class Distribution:")
    print(df['is_fraud'].value_counts(normalize=True).map(lambda n: f"{n*100:.1f}%"))
    print(f"==================================================\n")

    # Display preview of first 3 rows
    print("Dataset Preview (First 3 Records):")
    print(df[['transaction_id', 'amount', 'previous_average', 'amount_ratio', 'is_new_device', 'is_fraud']].head(3))

if __name__ == '__main__':
    generate_synthetic_transactions()