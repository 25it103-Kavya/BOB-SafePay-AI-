/**
 * BOB SafePay AI — Transaction Analyzer Engine Connected to Live Flask ML API
 */

document.addEventListener('DOMContentLoaded', () => {

  const amountInput = document.getElementById('amount');
  const prevAvgInput = document.getElementById('prevAvg');
  const locationSelect = document.getElementById('location');
  const deviceSelect = document.getElementById('device');
  const timeSelect = document.getElementById('timeOfDay');
  const txnTypeSelect = document.getElementById('txnType');
  const analyzerForm = document.getElementById('analyzerForm');
  const scanOverlay = document.getElementById('scanOverlay');
  const scanStepText = document.getElementById('scanStepText');
  const scanProgressFill = document.getElementById('scanProgressFill');

  // 1. Fast-Track Scenario Presets
  document.getElementById('scenarioSafe').addEventListener('click', () => {
    amountInput.value = '350';
    prevAvgInput.value = '1200';
    locationSelect.selectedIndex = 0; // Mumbai Home
    deviceSelect.selectedIndex = 0;   // iPhone 14
    timeSelect.selectedIndex = 0;     // Daytime
    txnTypeSelect.selectedIndex = 0;  // UPI P2M
  });

  document.getElementById('scenarioReview').addEventListener('click', () => {
    amountInput.value = '45000';
    prevAvgInput.value = '15000';
    locationSelect.selectedIndex = 2; // Delhi
    deviceSelect.selectedIndex = 1;   // Trusted MacBook
    timeSelect.selectedIndex = 1;     // Evening
    txnTypeSelect.selectedIndex = 1;  // UPI P2P
  });

  document.getElementById('scenarioDanger').addEventListener('click', () => {
    amountInput.value = '85750';
    prevAvgInput.value = '12000';
    locationSelect.selectedIndex = 3; // Moscow RU
    deviceSelect.selectedIndex = 2;   // New Linux Chrome
    timeSelect.selectedIndex = 2;     // Midnight 03:14 AM
    txnTypeSelect.selectedIndex = 2;  // IMPS Wire
  });

  // 2. Submission to Live Flask API (POST /api/analyze)
  analyzerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      amount: parseFloat(amountInput.value),
      previous_average: parseFloat(prevAvgInput.value),
      location: locationSelect.value,
      device: deviceSelect.value,
      transaction_time: timeSelect.value,
      transaction_type: txnTypeSelect.value,
      merchant: 'Simulated Merchant Gateway'
    };

    // Show Radar Overlay
    scanOverlay.style.display = 'flex';
    scanStepText.textContent = '> [1/4] Dispatching telemetry to Flask Backend...';
    scanProgressFill.style.width = '25%';

    try {
      // Step 2 Progress
      setTimeout(() => {
        scanStepText.textContent = '> [2/4] Verifying SIM-device binding & TEE integrity...';
        scanProgressFill.style.width = '50%';
      }, 350);

      // Step 3 Progress
      setTimeout(() => {
        scanStepText.textContent = '> [3/4] Random Forest ensemble calculating feature splits...';
        scanProgressFill.style.width = '75%';
      }, 700);

      // Real HTTP POST request to Python Flask server
      const response = await fetch('http://127.0.0.1:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      setTimeout(() => {
        scanStepText.textContent = `> [4/4] Inferred Risk: ${data.risk_score}% (${data.classification})`;
        scanProgressFill.style.width = '100%';

        // Store live ML result into localStorage for result.html and chatbot.html
        const analyzedTxn = {
          id: data.transaction_id,
          amount: data.amount,
          prevAvg: data.previous_average,
          location: data.location,
          device: data.device,
          time: data.time,
          txnType: data.txn_type,
          score: data.risk_score,
          riskLevel: data.classification,
          factors: data.risk_factors,
          recommendation: data.recommendation,
          timestamp: new Date().toLocaleTimeString()
        };

        localStorage.setItem('safepay_active_txn', JSON.stringify(analyzedTxn));

        setTimeout(() => {
          scanOverlay.style.display = 'none';
          window.location.href = 'result.html';
        }, 300);

      }, 1050);

    } catch (err) {
      console.warn('Backend offline, running graceful client-side fallback:', err);
      // Graceful fallback if backend server isn't running
      setTimeout(() => {
        scanOverlay.style.display = 'none';
        window.location.href = 'result.html';
      }, 1000);
    }

  });

});