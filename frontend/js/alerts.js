/**
 * BOB SafePay AI — Security Alerts & Incident Dispatch Engine
 * Manages incident triage, resolution toggling, filtering, and SafePay AI consultation links.
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Initial Incidents Dataset (Indian Banking & FinTech Context)
  let incidents = [
    {
      id: 'INC-8812',
      severity: 'CRITICAL',
      title: 'Impossible Travel & Unauthorized Linux Device',
      description: 'Transaction initiated from Moscow, RU on an unrecognized Linux browser within 18 minutes of a Mumbai authentication. Violates maximum physical velocity limits (Haversine breach: 4,500 km/h).',
      txnId: 'TXN-9021',
      amount: '₹ 85,750.00',
      merchant: 'Luxury Electronics Store',
      time: '4 mins ago',
      resolved: false
    },
    {
      id: 'INC-8813',
      severity: 'CRITICAL',
      title: 'Midnight Casino Token Cash-Out Attempt',
      description: 'High-value international wire attempted at 03:14 AM via a rooted Android emulator with AnyDesk overlay detected. Potential remote-access account takeover.',
      txnId: 'TXN-9022',
      amount: '₹ 42,500.00',
      merchant: 'Overseas Gaming Token',
      time: '28 mins ago',
      resolved: false
    },
    {
      id: 'INC-8814',
      severity: 'REVIEW',
      title: 'Sudden Volume Spike on Crypto Gateway',
      description: 'Transfer amount is 4.8x higher than the account 30-day historical mean. Cooling-off period enforced. Mandatory interactive OTP challenge dispatched.',
      txnId: 'TXN-9023',
      amount: '₹ 1,25,000.00',
      merchant: 'Crypto P2P Settlement',
      time: '2 hours ago',
      resolved: false
    },
    {
      id: 'INC-8815',
      severity: 'CRITICAL',
      title: 'Anonymous Offshore VPA Mule Pattern',
      description: 'High-velocity outflow directed to a newly created virtual payment address with no prior history. Blacklist signature matched.',
      txnId: 'TXN-9026',
      amount: '₹ 95,000.00',
      merchant: 'Anonymous Offshore VPA Wire',
      time: '4 hours ago',
      resolved: false
    },
    {
      id: 'INC-8809',
      severity: 'RESOLVED',
      title: 'Legitimate Flight Ticket Booking Cleared',
      description: 'High-value domestic flight purchase cleared after customer successfully completed in-app biometric face match.',
      txnId: 'TXN-8790',
      amount: '₹ 28,400.00',
      merchant: 'Air India Online',
      time: 'Yesterday',
      resolved: true
    }
  ];

  const container = document.getElementById('incidentContainer');
  const sidebarAlertCount = document.getElementById('sidebarAlertCount');
  const kpiActiveAlarms = document.getElementById('kpiActiveAlarms');
  const kpiCriticalAlarms = document.getElementById('kpiCriticalAlarms');
  const kpiReviewAlarms = document.getElementById('kpiReviewAlarms');
  const kpiResolvedAlarms = document.getElementById('kpiResolvedAlarms');
  const markAllResolvedBtn = document.getElementById('markAllResolvedBtn');

  let activeFilter = 'ACTIVE';

  // 2. Update KPI Counters
  function updateKPIs() {
    const active = incidents.filter(i => !i.resolved);
    const critical = active.filter(i => i.severity === 'CRITICAL');
    const review = active.filter(i => i.severity === 'REVIEW');
    const resolved = incidents.filter(i => i.resolved);

    if (sidebarAlertCount) sidebarAlertCount.textContent = active.length;
    if (kpiActiveAlarms) kpiActiveAlarms.textContent = active.length;
    if (kpiCriticalAlarms) kpiCriticalAlarms.textContent = critical.length;
    if (kpiReviewAlarms) kpiReviewAlarms.textContent = review.length;
    if (kpiResolvedAlarms) kpiResolvedAlarms.textContent = resolved.length + 17; // offset demo base
  }

  // 3. Render Incidents Feed
  function renderIncidents() {
    container.innerHTML = '';

    const filtered = incidents.filter(i => {
      if (activeFilter === 'ACTIVE') return !i.resolved;
      if (activeFilter === 'CRITICAL') return !i.resolved && i.severity === 'CRITICAL';
      if (activeFilter === 'REVIEW') return !i.resolved && i.severity === 'REVIEW';
      if (activeFilter === 'RESOLVED') return i.resolved;
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <div style="font-size: 2.2rem; margin-bottom: 10px;">🛡️</div>
          <div style="font-weight: 700; color: #FFFFFF; font-size: 1.1rem; margin-bottom: 6px;">All Clear! No Active Alarms</div>
          <div>All threat vectors have been investigated and resolved according to RBI protocols.</div>
        </div>
      `;
      return;
    }

    filtered.forEach(inc => {
      const card = document.createElement('div');
      
      let borderClass = 'incident-critical';
      let badgeTag = '<span class="badge badge-risk">● CRITICAL SEVERITY</span>';
      if (inc.severity === 'REVIEW') {
        borderClass = 'incident-review';
        badgeTag = '<span class="badge badge-review">● STEP-UP REVIEW</span>';
      }
      if (inc.resolved) {
        borderClass = 'incident-resolved';
        badgeTag = '<span class="badge badge-safe">✓ RESOLVED</span>';
      }

      card.className = `incident-card ${borderClass}`;
      card.innerHTML = `
        <div class="incident-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${badgeTag}
            <span style="font-family: monospace; font-size: 0.8rem; color: var(--purple-bright);">${inc.id}</span>
          </div>
          <div class="incident-time">🕒 ${inc.time}</div>
        </div>

        <div class="incident-title">${inc.title}</div>
        <div class="incident-body">${inc.description}</div>

        <div class="incident-meta-box">
          <div><span style="color: var(--text-dim);">TXN REF:</span> <strong>${inc.txnId}</strong></div>
          <div><span style="color: var(--text-dim);">AMOUNT:</span> <strong style="color: #FFFFFF;">${inc.amount}</strong></div>
          <div><span style="color: var(--text-dim);">MERCHANT:</span> <strong>${inc.merchant}</strong></div>
        </div>

        <div class="incident-actions">
          ${!inc.resolved ? `
            <button class="btn btn-primary resolve-btn" data-id="${inc.id}" style="padding: 7px 14px; font-size: 0.82rem;">
              ✓ Mark Resolved
            </button>
            <button class="btn btn-danger lock-btn" data-txn="${inc.txnId}" style="padding: 7px 14px; font-size: 0.82rem;">
              🔒 Freeze Account
            </button>
          ` : `
            <span style="color: var(--color-safe); font-size: 0.82rem; font-weight: 600;">✓ Audited & Cleared by SOC</span>
          `}
          <a href="chatbot.html?query=${encodeURIComponent(`Explain security alert ${inc.id} regarding ${inc.title} on transaction ${inc.txnId}`)}" class="ai-chip" style="padding: 6px 14px; font-size: 0.8rem;">
            Consult SafePay AI 🤖
          </a>
        </div>
      `;

      container.appendChild(card);
    });

    // Wire Resolve Buttons
    document.querySelectorAll('.resolve-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const target = incidents.find(i => i.id === id);
        if (target) {
          target.resolved = true;
          updateKPIs();
          renderIncidents();
        }
      });
    });

    // Wire Lock Account Buttons
    document.querySelectorAll('.lock-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const txn = e.target.getAttribute('data-txn');
        alert(`[EMERGENCY PROTOCOL ENGAGED]\n\nAccount linked to ${txn} locked immediately.\nNational Cybercrime Reporting Portal (NCRP / 1930) dispatch confirmed.`);
        btn.textContent = '✓ FREEZE ACTIVE';
        btn.disabled = true;
      });
    });
  }

  // 4. Tab Switching
  const tabs = [
    { el: document.getElementById('tabAll'), filter: 'ACTIVE' },
    { el: document.getElementById('tabCritical'), filter: 'CRITICAL' },
    { el: document.getElementById('tabReview'), filter: 'REVIEW' },
    { el: document.getElementById('tabResolved'), filter: 'RESOLVED' }
  ];

  tabs.forEach(tab => {
    if (tab.el) {
      tab.el.addEventListener('click', () => {
        tabs.forEach(t => t.el.classList.remove('active'));
        tab.el.classList.add('active');
        activeFilter = tab.filter;
        renderIncidents();
      });
    }
  });

  // 5. Resolve All Active
  markAllResolvedBtn.addEventListener('click', () => {
    incidents.forEach(i => i.resolved = true);
    updateKPIs();
    renderIncidents();
  });

  // Initial Boot
  updateKPIs();
  renderIncidents();

});