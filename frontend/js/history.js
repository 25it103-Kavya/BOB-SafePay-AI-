/**
 * BOB SafePay AI — Transaction History & Forensic Ledger Engine
 * Handles searching, multi-vector sorting, filtering, CSV export, and audit modal popups.
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Forensic Dataset (Indian Banking & FinTech Context)
  const masterTransactions = [
    {
      id: 'TXN-9021',
      date: '2026-09-27 03:14 AM',
      merchant: 'Luxury Electronics Store',
      location: 'Mumbai, MH (Proxy: Moscow RU)',
      device: 'New Linux Chrome / Unbound SIM',
      amountNum: 85750,
      amountStr: '₹ 85,750.00',
      score: 87,
      riskLevel: 'high',
      status: 'FLAGGED',
      rbiAction: 'Automated 24h Cooling-Off Hold'
    },
    {
      id: 'TXN-9022',
      date: '2026-09-26 11:42 PM',
      merchant: 'Overseas Gaming Token',
      location: 'Las Vegas, NV (Proxy)',
      device: 'Rooted Android Emulator',
      amountNum: 42500,
      amountStr: '₹ 42,500.00',
      score: 92,
      riskLevel: 'high',
      status: 'FLAGGED',
      rbiAction: 'Outbound Immediate Freeze'
    },
    {
      id: 'TXN-9023',
      date: '2026-09-26 07:15 PM',
      merchant: 'Crypto P2P Settlement',
      location: 'Bengaluru, KA',
      device: 'Trusted MacBook Pro (Chrome)',
      amountNum: 125000,
      amountStr: '₹ 1,25,000.00',
      score: 68,
      riskLevel: 'review',
      status: 'UNDER REVIEW',
      rbiAction: 'Interactive Biometric Step-Up'
    },
    {
      id: 'TXN-9024',
      date: '2026-09-26 02:30 PM',
      merchant: 'Baroda Supermarket Grocery',
      location: 'Vadodara, GJ',
      device: 'Primary iPhone 14 Pro',
      amountNum: 1420,
      amountStr: '₹ 1,420.00',
      score: 14,
      riskLevel: 'low',
      status: 'APPROVED',
      rbiAction: 'Instant Frictionless Clearing'
    },
    {
      id: 'TXN-9025',
      date: '2026-09-25 04:10 PM',
      merchant: 'Tata Power Electricity Bill',
      location: 'Mumbai, MH',
      device: 'Primary iPhone 14 Pro',
      amountNum: 3840,
      amountStr: '₹ 3,840.00',
      score: 11,
      riskLevel: 'low',
      status: 'APPROVED',
      rbiAction: 'Instant Frictionless Clearing'
    },
    {
      id: 'TXN-9026',
      date: '2026-09-25 01:05 AM',
      merchant: 'Anonymous Offshore VPA Wire',
      location: 'Bucharest, RO (Foreign Hop)',
      device: 'Virtual Machine (QEMU)',
      amountNum: 95000,
      amountStr: '₹ 95,000.00',
      score: 96,
      riskLevel: 'high',
      status: 'FLAGGED',
      rbiAction: 'Emergency 1930 Cyber Fraud Alert'
    }
  ];

  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const sortOrder = document.getElementById('sortOrder');
  const tableBody = document.getElementById('historyTableBody');
  const emptyMessage = document.getElementById('emptyMessage');
  const exportBtn = document.getElementById('exportBtn');

  // Modal Elements
  const auditModal = document.getElementById('auditModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalTxnId = document.getElementById('modalTxnId');
  const modalMerchant = document.getElementById('modalMerchant');
  const modalAmount = document.getElementById('modalAmount');
  const modalLocation = document.getElementById('modalLocation');
  const modalDevice = document.getElementById('modalDevice');
  const modalScore = document.getElementById('modalScore');
  const modalAction = document.getElementById('modalAction');
  const modalAskAIBtn = document.getElementById('modalAskAIBtn');

  // 2. Render Table with Active Filters & Sorting
  function renderLedger() {
    const query = searchInput.value.toLowerCase().trim();
    const filter = statusFilter.value;
    const sort = sortOrder.value;

    // Filter
    let filtered = masterTransactions.filter(item => {
      const matchesSearch = item.id.toLowerCase().includes(query) ||
                            item.merchant.toLowerCase().includes(query) ||
                            item.location.toLowerCase().includes(query) ||
                            item.amountStr.toLowerCase().includes(query);
      
      const matchesStatus = (filter === 'ALL') || (item.status === filter);
      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sort === 'RISK_DESC') return b.score - a.score;
      if (sort === 'AMOUNT_DESC') return b.amountNum - a.amountNum;
      if (sort === 'AMOUNT_ASC') return a.amountNum - b.amountNum;
      if (sort === 'DATE_DESC') return new Date(b.date) - new Date(a.date);
      return 0;
    });

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      emptyMessage.style.display = 'block';
      return;
    } else {
      emptyMessage.style.display = 'none';
    }

    filtered.forEach(txn => {
      const tr = document.createElement('tr');

      let riskClass = 'risk-pill-high';
      let riskPrefix = '⚠️';
      if (txn.riskLevel === 'review') { riskClass = 'risk-pill-review'; riskPrefix = '⏳'; }
      if (txn.riskLevel === 'low') { riskClass = 'risk-pill-low'; riskPrefix = '✓'; }

      let statusClass = 'status-flagged';
      if (txn.status === 'APPROVED') statusClass = 'status-approved';
      if (txn.status === 'UNDER REVIEW') statusClass = 'status-review';

      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: #FFFFFF;">${txn.merchant}</div>
          <div style="font-size: 0.76rem; color: var(--purple-bright); font-family: monospace;">${txn.id}</div>
        </td>
        <td style="font-size: 0.84rem; color: var(--text-muted);">${txn.date}</td>
        <td>
          <div style="font-size: 0.85rem; color: #FFFFFF;">${txn.device}</div>
          <div style="font-size: 0.76rem; color: var(--text-dim);">📍 ${txn.location}</div>
        </td>
        <td style="font-weight: 700; font-size: 1rem;">${txn.amountStr}</td>
        <td>
          <span class="risk-pill ${riskClass}">${riskPrefix} ${txn.score}%</span>
        </td>
        <td>
          <span class="status-badge ${statusClass}">${txn.status}</span>
        </td>
        <td>
          <button class="ai-chip audit-trigger" data-id="${txn.id}" style="padding: 5px 12px; font-size: 0.78rem;">
            Inspect 📋
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Wire Modal Triggers
    document.querySelectorAll('.audit-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const found = masterTransactions.find(t => t.id === id);
        if (found) openAuditModal(found);
      });
    });
  }

  // 3. Open Modal Handler
  function openAuditModal(txn) {
    modalTxnId.textContent = txn.id;
    modalMerchant.textContent = txn.merchant;
    modalAmount.textContent = txn.amountStr;
    modalLocation.textContent = txn.location;
    modalDevice.textContent = txn.device;
    modalScore.textContent = `${txn.score}% (${txn.riskLevel.toUpperCase()})`;
    modalAction.textContent = txn.rbiAction;

    modalAskAIBtn.href = `chatbot.html?query=${encodeURIComponent(`Why was transaction ${txn.id} for ${txn.amountStr} flagged as ${txn.riskLevel.toUpperCase()}?`)}`;

    auditModal.style.display = 'flex';
  }

  closeModalBtn.addEventListener('click', () => { auditModal.style.display = 'none'; });
  auditModal.addEventListener('click', (e) => { if (e.target === auditModal) auditModal.style.display = 'none'; });

  // 4. Listeners for Search, Filter, and Sort
  searchInput.addEventListener('input', renderLedger);
  statusFilter.addEventListener('change', renderLedger);
  sortOrder.addEventListener('change', renderLedger);

  // 5. CSV Export Engine
  exportBtn.addEventListener('click', () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Transaction_ID,Date,Merchant,Location,Device,Amount_INR,Risk_Score,Status,RBI_Action\n';

    masterTransactions.forEach(t => {
      const row = [
        t.id,
        `"${t.date}"`,
        `"${t.merchant}"`,
        `"${t.location}"`,
        `"${t.device}"`,
        t.amountNum,
        t.score,
        t.status,
        `"${t.rbiAction}"`
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `safepay_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Initial Render
  renderLedger();

});