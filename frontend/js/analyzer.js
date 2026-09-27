/**
 * BOB SafePay AI — Transaction Analyzer Engine
 * Handles scenario presets, radar scanning telemetry, and transaction context persistence.
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

  // 1. Scenario Presets (Fast-Track for Hackathon Demos)
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

  // 2. Submission & Telemetry Radar Animation
  analyzerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = parseFloat(amountInput.value);
    const prevAvg = parseFloat(prevAvgInput.value);
    const location = locationSelect.value;
    const device = deviceSelect.value;
    const time = timeSelect.value;
    const txnType = txnTypeSelect.value;

    // Show Radar Scanning Overlay
    scanOverlay.style.display = 'flex';

    // Simulated Telemetry Pipeline Steps
    const steps = [
      { text: '> [1/4] Verifying SIM-device binding & TEE integrity...', progress: '25%' },
      { text: '> [2/4] Calculating Haversine geo-velocity between hops...', progress: '50%' },
      { text: '> [3/4] Computing spending ratio against 30-day baseline...', progress: '75%' },
      { text: '> [4/4] Executing Random Forest fraud classification...', progress: '100%' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        scanStepText.textContent = steps[currentStep].text;
        scanProgressFill.style.width = steps[currentStep].progress;
        currentStep++;
      } else {
        clearInterval(interval);

        // Calculate Risk Logic (Pre-ML rule simulation)
        let score = 12;
        let riskLevel = 'SAFE';
        let factors = [];

        const ratio = amount / (prevAvg || 1);
        if (ratio > 4) {
          score += 35;
          factors.push(`Spending Surge: Transaction is ${ratio.toFixed(1)}x higher than 30-day average.`);
        }
        if (device.includes('New') || device.includes('Rooted')) {
          score += 30;
          factors.push('Hardware Alert: Brand-new unrecognized device fingerprint.');
        }
        if (location.includes('Moscow') || location.includes('Las Vegas')) {
          score += 25;
          factors.push('Geo-Anomaly: Transaction initiated outside user trusted geo-fence.');
        }
        if (time.includes('Midnight')) {
          score += 15;
          factors.push('Time Velocity Anomaly: Transfer attempted during odd sleeping hours (03:14 AM).');
        }

        // Clamp score between 0 and 99
        score = Math.min(score, 96);
        if (score >= 71) riskLevel = 'HIGH RISK';
        else if (score >= 31) riskLevel = 'REVIEW';
        else riskLevel = 'SAFE';

        if (factors.length === 0) {
          factors.push('Normal spending pattern matching typical user behavior.');
          factors.push('Trusted primary device authenticated via biometric SIM binding.');
        }

        // Save analyzed transaction to localStorage for Step 8 Result Card & Step 9 AI Chatbot!
        const analyzedTxn = {
          id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
          amount: '₹ ' + amount.toLocaleString('en-IN'),
          prevAvg: '₹ ' + prevAvg.toLocaleString('en-IN'),
          location: location,
          device: device,
          time: time,
          txnType: txnType,
          score: score,
          riskLevel: riskLevel,
          factors: factors,
          timestamp: new Date().toLocaleTimeString()
        };

        localStorage.setItem('safepay_active_txn', JSON.stringify(analyzedTxn));

        // Wait 400ms then transition to the Result Card (Step 8)
        setTimeout(() => {
          scanOverlay.style.display = 'none';
          window.location.href = 'result.html';
        }, 400);
      }
    }, 450);

  });

});