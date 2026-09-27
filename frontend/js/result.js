/**
 * BOB SafePay AI — Risk Scoring Result Engine
 * Animates the SVG circular gauge, reads active transaction state, and bridges to AI Chatbot.
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Retrieve Active Transaction Data from Step 7
  let txnData = localStorage.getItem('safepay_active_txn');
  
  // Fallback data if user opens result.html directly
  if (!txnData) {
    txnData = {
      id: 'TXN-884912',
      amount: '₹ 85,750.00',
      prevAvg: '₹ 12,000.00',
      location: 'Moscow, RU (Proxy Breach)',
      device: '⚠️ New Linux Chrome (Unverified SIM)',
      time: 'Midnight (03:14 AM)',
      txnType: 'IMPS High-Value Wire Transfer',
      score: 87,
      riskLevel: 'HIGH RISK',
      factors: [
        'Spending Surge: Transaction is 7.1x higher than 30-day average.',
        'Hardware Alert: Brand-new unrecognized device fingerprint.',
        'Geo-Anomaly: Transaction initiated outside user trusted geo-fence.',
        'Time Velocity Anomaly: Transfer attempted during odd sleeping hours (03:14 AM).'
      ]
    };
  } else {
    txnData = JSON.parse(txnData);
  }

  // 2. Populate Header & Telemetry
  document.getElementById('txnSubtitle').textContent = `Reference ID: ${txnData.id} • Monitored via Bank of Baroda Gateway`;
  document.getElementById('summaryAmount').textContent = txnData.amount;
  document.getElementById('summaryPrevAvg').textContent = txnData.prevAvg;
  document.getElementById('summaryLocation').textContent = txnData.location;
  document.getElementById('summaryDevice').textContent = txnData.device;

  // 3. Configure Status Badges & Colors
  const verdictBadge = document.getElementById('verdictBadge');
  const verdictTitle = document.getElementById('verdictTitle');
  const verdictSummary = document.getElementById('verdictSummary');
  const gaugeCircle = document.getElementById('gaugeCircle');
  const gaugeScoreNum = document.getElementById('gaugeScoreNum');
  const recommendationTitle = document.getElementById('recommendationTitle');
  const recommendationText = document.getElementById('recommendationText');

  let strokeColor = '#10B981'; // Green for safe

  if (txnData.riskLevel === 'HIGH RISK') {
    strokeColor = '#EF4444'; // Red
    verdictBadge.className = 'badge badge-risk';
    verdictBadge.innerHTML = '● CRITICAL THREAT DETECTED';
    verdictTitle.textContent = 'High-Risk Payment Intercepted';
    verdictSummary.textContent = 'Multiple high-severity anomalies detected. Automated cooling-off hold placed on instant outbound funds.';
    recommendationTitle.textContent = 'Enforce Immediate Cooling-Off Hold';
    recommendationText.textContent = 'Mandatory out-of-band biometric challenge and SIM verification required under RBI guidelines.';
  } else if (txnData.riskLevel === 'REVIEW') {
    strokeColor = '#F59E0B'; // Amber
    verdictBadge.className = 'badge badge-review';
    verdictBadge.innerHTML = '● STEP-UP VERIFICATION REQUIRED';
    verdictTitle.textContent = 'Moderate Spending Anomaly';
    verdictSummary.textContent = 'Transaction exceeds typical volume. Secondary interactive challenge advised.';
    recommendationTitle.textContent = 'Trigger Step-Up OTP Challenge';
    recommendationText.textContent = 'Send interactive push notification with recipient details to primary trusted device.';
  } else {
    strokeColor = '#10B981'; // Green
    verdictBadge.className = 'badge badge-safe';
    verdictBadge.innerHTML = '✓ PAYMENT AUTHORIZED';
    verdictTitle.textContent = 'Transaction Cleared (Safe)';
    verdictSummary.textContent = 'Telemetry perfectly matches user behavioral profile and trusted hardware fingerprint.';
    recommendationTitle.textContent = 'Frictionless Instant Settlement';
    recommendationText.textContent = 'All statutory velocity and geo-fence parameters satisfied. Zero intervention needed.';
  }

  // 4. Animate Circular SVG Gauge & Score Counter
  gaugeCircle.style.stroke = strokeColor;
  
  // Circumference = 2 * PI * 65 ≈ 408.4
  const circumference = 408.4;
  const targetOffset = circumference - (circumference * (txnData.score / 100));

  setTimeout(() => {
    gaugeCircle.style.strokeDashoffset = targetOffset;
  }, 100);

  // Counter Number Animation
  let currentNum = 0;
  const duration = 1200;
  const increment = txnData.score / (duration / 25);
  const counterInterval = setInterval(() => {
    currentNum += increment;
    if (currentNum >= txnData.score) {
      gaugeScoreNum.textContent = txnData.score;
      clearInterval(counterInterval);
    } else {
      gaugeScoreNum.textContent = Math.floor(currentNum);
    }
  }, 25);

  // 5. Populate Explainable AI (XAI) Factors
  const factorContainer = document.getElementById('factorContainer');
  factorContainer.innerHTML = '';

  txnData.factors.forEach(factor => {
    const item = document.createElement('div');
    item.className = 'factor-item';

    const isDanger = txnData.riskLevel === 'HIGH RISK' || factor.includes('Alert') || factor.includes('Surge') || factor.includes('Anomaly');
    const icon = isDanger ? '⚠️' : '✓';
    const iconClass = isDanger ? 'factor-icon-danger' : 'factor-icon-safe';

    item.innerHTML = `
      <span class="${iconClass}">${icon}</span>
      <div>
        <div style="font-weight: 600; color: #FFFFFF;">${factor}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Evaluated by Random Forest Ensemble Feature Split</div>
      </div>
    `;
    factorContainer.appendChild(item);
  });

  // 6. Connect "Ask SafePay AI" Button to Chatbot (Step 9)
  const askAIBtn = document.getElementById('askAIBtn');
  const contextualQuery = `Why was transaction ${txnData.id} of ${txnData.amount} flagged as ${txnData.riskLevel}?`;
  askAIBtn.href = `chatbot.html?query=${encodeURIComponent(contextualQuery)}`;

  // 7. Emergency Freeze Button Simulation
  const freezeBtn = document.getElementById('freezeBtn');
  freezeBtn.addEventListener('click', () => {
    freezeBtn.disabled = true;
    freezeBtn.innerHTML = '🔒 FREEZING ACCOUNT...';
    setTimeout(() => {
      alert(`[EMERGENCY PROTOCOL ENGAGED]\n\nAccount linked to ${txnData.id} has been temporarily locked.\nCitizen Cyber Fraud Docket (1930 / NCRP) successfully registered.`);
      freezeBtn.innerHTML = '✓ ACCOUNT LOCKED (FREEZE ACTIVE)';
    }, 700);
  });

});