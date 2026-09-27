/**
 * BOB SafePay AI — Conversational Assistant Engine
 * Manages chat bubbles, typing indicator, URL query auto-detection, and contextual answers.
 */

document.addEventListener('DOMContentLoaded', () => {

  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const typingRow = document.getElementById('typingRow');
  const contextDetails = document.getElementById('contextDetails');
  const clearContextBtn = document.getElementById('clearContextBtn');
  const contextBanner = document.getElementById('contextBanner');

  // 1. Retrieve Active Transaction Context (From Step 7 & 8)
  let activeTxn = null;
  const storedTxn = localStorage.getItem('safepay_active_txn');
  
  if (storedTxn) {
    try {
      activeTxn = JSON.parse(storedTxn);
      contextDetails.textContent = `${activeTxn.id} • ${activeTxn.amount} (${activeTxn.riskLevel} - ${activeTxn.score}%) • ${activeTxn.location}`;
    } catch (e) {
      console.warn('Context parse error:', e);
    }
  } else {
    // Default context if directly navigated
    activeTxn = {
      id: 'TXN-884912',
      amount: '₹ 85,750.00',
      prevAvg: '₹ 12,000.00',
      location: 'Moscow, RU (Proxy Breach)',
      device: 'New Linux Chrome',
      time: 'Midnight (03:14 AM)',
      score: 87,
      riskLevel: 'HIGH RISK',
      factors: [
        'Spending Surge: 7.1x higher than 30-day average.',
        'Hardware Alert: Brand-new unrecognized device fingerprint.',
        'Geo-Anomaly: Initiated outside user trusted geo-fence (Moscow, RU).',
        'Time Anomaly: Attempted at 03:14 AM.'
      ]
    };
    contextDetails.textContent = `${activeTxn.id} • ${activeTxn.amount} (${activeTxn.riskLevel} - ${activeTxn.score}%) • ${activeTxn.location}`;
  }

  // Clear Context Handler
  clearContextBtn.addEventListener('click', () => {
    activeTxn = null;
    contextBanner.style.display = 'none';
    appendBotMessage('Inspection context cleared. You can ask me general questions regarding payment security or RBI guidelines.');
  });

  // 2. Helper to Append User Message
  function appendUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'chat-bubble-row user-row';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    row.innerHTML = `
      <div class="chat-avatar chat-avatar-user">ME</div>
      <div>
        <div class="chat-bubble bubble-user">${text}</div>
        <div class="chat-time" style="text-align: right;">${time}</div>
      </div>
    `;

    // Insert before typing indicator
    chatMessages.insertBefore(row, typingRow);
    scrollToBottom();
  }

  // 3. Helper to Append Bot Message
  function appendBotMessage(htmlContent) {
    const row = document.createElement('div');
    row.className = 'chat-bubble-row';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    row.innerHTML = `
      <div class="chat-avatar chat-avatar-ai">🤖</div>
      <div>
        <div class="chat-bubble bubble-ai">${htmlContent}</div>
        <div class="chat-time">${time}</div>
      </div>
    `;

    chatMessages.insertBefore(row, typingRow);
    scrollToBottom();
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 4. Context-Aware AI Response Engine
  function generateAIResponse(userPrompt) {
    const lower = userPrompt.toLowerCase();

    // Show Typing Indicator
    typingRow.style.display = 'flex';
    scrollToBottom();

    setTimeout(() => {
      typingRow.style.display = 'none';

      // SCENARIO 1: "Why was this flagged?"
      if (lower.includes('why') && (lower.includes('flag') || lower.includes('score') || lower.includes('risk') || lower.includes('luxury') || lower.includes('block'))) {
        if (activeTxn) {
          appendBotMessage(`
            <strong>Transaction ${activeTxn.id}</strong> received a <strong>${activeTxn.score}% (${activeTxn.riskLevel})</strong> risk score due to four combined anomaly vectors:
            <ul style="margin: 8px 0 8px 18px; line-height: 1.6;">
              <li><strong>Spending Deviation:</strong> The amount (<strong>${activeTxn.amount}</strong>) is significantly higher than your 30-day baseline (<strong>${activeTxn.prevAvg}</strong>).</li>
              <li><strong>Hardware Mismatch:</strong> Initiated from <em>${activeTxn.device}</em> rather than your registered primary smartphone.</li>
              <li><strong>Geolocation Breach:</strong> IP location routed through <em>${activeTxn.location}</em>, triggering an impossible travel violation.</li>
              <li><strong>Timestamp Velocity:</strong> Attempted during off-peak hours (<em>${activeTxn.time}</em>).</li>
            </ul>
            <strong>Recommended Action:</strong> An automated hold has been placed. You must complete out-of-band biometric authentication to authorize this transfer.
          `);
        } else {
          appendBotMessage('I currently have no active transaction context loaded. Please analyze a transaction in the Risk Analyzer first, and I will diagnose its exact flags!');
        }
        return;
      }

      // SCENARIO 2: "Explain the calculation"
      if (lower.includes('calculate') || lower.includes('how does') || lower.includes('model') || lower.includes('formula')) {
        appendBotMessage(`
          The <strong>0–100 SafePay Risk Score</strong> is calculated using a dual-engine architecture:
          <ol style="margin: 8px 0 8px 18px; line-height: 1.6;">
            <li><strong>RBI Statutory Rules:</strong> Fast-path checks for mandatory cooling-off limits, SIM-swap signatures, and known fraudulent VPA handles.</li>
            <li><strong>Random Forest ML Model:</strong> Evaluates feature importance splits across historical spending ratios (35% weight), hardware integrity (30% weight), geo-velocity distance (25% weight), and time velocity (10% weight).</li>
          </ol>
          Scores <strong>0–30</strong> are cleared frictionlessly. Scores <strong>31–70</strong> require step-up OTP. Scores <strong>71–100</strong> are automatically frozen.
        `);
        return;
      }

      // SCENARIO 3: "What should I do if I don't recognize it?"
      if (lower.includes('recognize') || lower.includes('dont know') || lower.includes('hack') || lower.includes('fraud') || lower.includes('freeze')) {
        appendBotMessage(`
          If you do <strong>not</strong> recognize transaction ${activeTxn ? activeTxn.id : 'a payment'}, take these immediate steps:
          <ol style="margin: 8px 0 8px 18px; line-height: 1.6;">
            <li><strong>Freeze UPI Channels:</strong> Click the <span style="color: var(--color-risk); font-weight: 700;">Emergency Freeze</span> button to lock instant outbound debits.</li>
            <li><strong>Report to Cyber Fraud (1930):</strong> Dial the Citizen Financial Cyber Fraud Helpline (<strong>1930</strong>) or report via <em>cybercrime.gov.in</em> within the 24-hour golden window.</li>
            <li><strong>Reset Credentials:</strong> Disconnect any active screen-sharing software (AnyDesk, TeamViewer) and reset your Bank of Baroda NetBanking password from a verified device.</li>
          </ol>
        `);
        return;
      }

      // DEFAULT FALLBACK
      appendBotMessage(`
        I analyzed your inquiry: <em>"${userPrompt}"</em>. 
        <br><br>
        For transaction <strong>${activeTxn ? activeTxn.id : 'monitoring'}</strong>, all security shields remain operational. You can ask me:
        <ul style="margin: 6px 0 0 18px;">
          <li><em>"Why was this transaction flagged?"</em></li>
          <li><em>"Explain the risk score calculation"</em></li>
          <li><em>"What should I do if I don't recognize this payment?"</em></li>
        </ul>
      `);

    }, 800);
  }

  // 5. Handle Form Submission
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    appendUserMessage(message);
    chatInput.value = '';
    generateAIResponse(message);
  });

  // 6. Handle Suggested Quick Chips
  document.querySelectorAll('[data-prompt]').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const promptText = e.target.getAttribute('data-prompt');
      appendUserMessage(promptText);
      generateAIResponse(promptText);
    });
  });

  // 7. Auto-detect Query Parameter from Step 6 or 8 (e.g. ?query=...)
  const urlParams = new URLSearchParams(window.location.search);
  const incomingQuery = urlParams.get('query');
  if (incomingQuery) {
    setTimeout(() => {
      appendUserMessage(incomingQuery);
      generateAIResponse(incomingQuery);
    }, 400);
  }

});