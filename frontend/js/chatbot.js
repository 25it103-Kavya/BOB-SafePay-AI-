/**
 * BOB SafePay AI — Chatbot Client Connected to Live Flask /api/chat Backend
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
    activeTxn = {
      id: 'TXN-884912',
      amount: '₹ 85,750.00',
      prevAvg: '₹ 12,000.00',
      location: 'Moscow, RU (Proxy Breach)',
      device: 'New Linux Chrome',
      time: 'Midnight (03:14 AM)',
      score: 96,
      riskLevel: 'HIGH RISK',
      factors: [
        'Spending Surge: 7.1x higher than baseline',
        'Hardware Alert: Brand-new unrecognized device fingerprint',
        'Geo-Anomaly: Initiated outside trusted geo-fence (Moscow, RU)',
        'Timestamp Anomaly: Attempted at 03:14 AM'
      ],
      recommendation: 'Automated 24h cooling-off hold placed.'
    };
    contextDetails.textContent = `${activeTxn.id} • ${activeTxn.amount} (${activeTxn.riskLevel} - ${activeTxn.score}%) • ${activeTxn.location}`;
  }

  // Clear Context Handler
  clearContextBtn.addEventListener('click', () => {
    activeTxn = null;
    contextBanner.style.display = 'none';
    appendBotMessage('Inspection context cleared. You can ask me general questions regarding digital payment security or RBI guidelines.');
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

    chatMessages.insertBefore(row, typingRow);
    scrollToBottom();
  }

  // 3. Helper to Append Bot Message
  function appendBotMessage(htmlContent, provider = '') {
    const row = document.createElement('div');
    row.className = 'chat-bubble-row';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    row.innerHTML = `
      <div class="chat-avatar chat-avatar-ai">🤖</div>
      <div>
        <div class="chat-bubble bubble-ai">${htmlContent}</div>
        <div class="chat-time">${time} ${provider ? `• <span style="color: var(--purple-bright);">${provider}</span>` : ''}</div>
      </div>
    `;

    chatMessages.insertBefore(row, typingRow);
    scrollToBottom();
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 4. Send Message to Flask Backend (/api/chat)
  async function sendToAI(userPrompt) {
    typingRow.style.display = 'flex';
    scrollToBottom();

    try {
      // Real HTTP fetch to Flask backend!
      const response = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          transaction_context: activeTxn,
          session_id: 'SESSION_' + (localStorage.getItem('safepay_session') ? 'AUTH_USER' : 'ANALYST')
        })
      });

      const data = await response.json();
      typingRow.style.display = 'none';

      if (data.status === 'success') {
        appendBotMessage(data.reply, data.provider);
      } else {
        appendBotMessage('I encountered a security protocol timeout. Please try again.');
      }

    } catch (err) {
      console.warn('Backend /api/chat offline, running client fallback:', err);
      typingRow.style.display = 'none';
      appendBotMessage(`
        <strong>Transaction ${activeTxn ? activeTxn.id : 'Telemetry'} Analysis:</strong>
        <br><br>
        Your payment of <strong>${activeTxn ? activeTxn.amount : '₹85,750'}</strong> was intercepted because it scored an AI risk index of <strong>${activeTxn ? activeTxn.score : '96'}% (HIGH RISK)</strong>.
        <br><br>
        Key flags: Spending deviation (7.1x average), brand-new hardware signature, and impossible travel proxy detected.
      `, 'SafePay Heuristic Fallback');
    }
  }

  // 5. Form Submission
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    appendUserMessage(message);
    chatInput.value = '';
    sendToAI(message);
  });

  // 6. Quick Chips
  document.querySelectorAll('[data-prompt]').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const promptText = e.target.getAttribute('data-prompt');
      appendUserMessage(promptText);
      sendToAI(promptText);
    });
  });

  // 7. Auto-detect Query Parameter (From result.html or dashboard.html)
  const urlParams = new URLSearchParams(window.location.search);
  const incomingQuery = urlParams.get('query');
  if (incomingQuery) {
    setTimeout(() => {
      appendUserMessage(incomingQuery);
      sendToAI(incomingQuery);
    }, 450);
  }

});