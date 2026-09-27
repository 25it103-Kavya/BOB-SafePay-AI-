/**
 * BOB SafePay AI — Dashboard Logic & Chart Engine
 * Handles user session loading, Chart.js area curve, table rendering, and filtering.
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Session Retrieval (From Step 5 Login)
  const sessionData = localStorage.getItem('safepay_session');
  if (sessionData) {
    try {
      const user = JSON.parse(sessionData);
      const name = user.email.split('@')[0];
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      
      const welcomeHeading = document.getElementById('welcomeHeading');
      const sidebarUserName = document.getElementById('sidebarUserName');
      const sidebarUserRole = document.getElementById('sidebarUserRole');
      const sidebarAvatar = document.getElementById('sidebarAvatar');
      const topAvatar = document.getElementById('topAvatar');
      const topUserDisplay = document.getElementById('topUserDisplay');

      if (welcomeHeading) welcomeHeading.textContent = `Welcome back, ${displayName}`;
      if (sidebarUserName) sidebarUserName.textContent = displayName;
      if (sidebarUserRole) sidebarUserRole.textContent = user.role || 'Security Analyst';
      if (sidebarAvatar) sidebarAvatar.textContent = displayName.substring(0, 2).toUpperCase();
      if (topAvatar) topAvatar.textContent = displayName.substring(0, 2).toUpperCase();
      if (topUserDisplay) topUserDisplay.textContent = `${user.email} (Active)`;
    } catch (e) {
      console.warn('Session parse error:', e);
    }
  }

  // 2. Sign Out Handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('safepay_session');
      window.location.href = 'login.html';
    });
  }

  // 3. Mock Transaction Stream (Indian Banking Context)
  const transactions = [
    {
      id: 'TXN-9021',
      merchant: 'Luxury Electronics Store',
      location: 'Mumbai, MH • New Device (Linux Chrome)',
      icon: '💻',
      score: 87,
      riskLevel: 'high',
      amount: '₹ 85,750.00',
      status: 'FLAGGED',
      query: 'Why was the Luxury Electronics transfer of ₹85,750 flagged?'
    },
    {
      id: 'TXN-9022',
      merchant: 'Overseas Gaming Token',
      location: 'Las Vegas, NV (Proxy) • Midnight 03:14 AM',
      icon: '🎰',
      score: 92,
      riskLevel: 'high',
      amount: '₹ 42,500.00',
      status: 'FLAGGED',
      query: 'Explain the 92% risk score for Overseas Gaming Token'
    },
    {
      id: 'TXN-9023',
      merchant: 'Crypto P2P Settlement',
      location: 'Bengaluru, KA • 4.8x Historical Avg',
      icon: '🪙',
      score: 68,
      riskLevel: 'review',
      amount: '₹ 1,25,000.00',
      status: 'UNDER REVIEW',
      query: 'What triggered the review status for Crypto P2P Settlement?'
    },
    {
      id: 'TXN-9024',
      merchant: 'Baroda Supermarket Grocery',
      location: 'Vadodara, GJ • Trusted iPhone 14',
      icon: '🛒',
      score: 14,
      riskLevel: 'low',
      amount: '₹ 1,420.00',
      status: 'APPROVED',
      query: 'Why is Baroda Supermarket marked safe?'
    }
  ];

  // 4. Render Table Rows
  const tableBody = document.getElementById('transactionTableBody');
  
  function renderTable(filter = 'ALL') {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const filtered = transactions.filter(t => {
      if (filter === 'FLAGGED') return t.status === 'FLAGGED' || t.status === 'UNDER REVIEW';
      if (filter === 'APPROVED') return t.status === 'APPROVED';
      return true;
    });

    filtered.forEach(txn => {
      const tr = document.createElement('tr');

      let riskPillClass = 'risk-pill-high';
      let riskPrefix = '⚠️';
      if (txn.riskLevel === 'review') { riskPillClass = 'risk-pill-review'; riskPrefix = '⏳'; }
      if (txn.riskLevel === 'low') { riskPillClass = 'risk-pill-low'; riskPrefix = '✓'; }

      let statusClass = 'status-flagged';
      if (txn.status === 'APPROVED') statusClass = 'status-approved';
      if (txn.status === 'UNDER REVIEW') statusClass = 'status-review';

      tr.innerHTML = `
        <td>
          <div class="merchant-cell">
            <div class="merchant-icon">${txn.icon}</div>
            <div>
              <div class="merchant-name">${txn.merchant}</div>
              <div class="merchant-location">📍 ${txn.location}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="risk-pill ${riskPillClass}">${riskPrefix} ${txn.score}% ${txn.riskLevel.toUpperCase()}</span>
        </td>
        <td style="font-weight: 700; font-size: 1rem;">${txn.amount}</td>
        <td>
          <span class="status-badge ${statusClass}">${txn.status}</span>
        </td>
        <td>
          <a href="chatbot.html?query=${encodeURIComponent(txn.query)}" class="ai-chip" style="padding: 5px 12px; font-size: 0.78rem;">
            Ask AI 🤖
          </a>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  renderTable('ALL');

  // 5. Table Filter Buttons
  const filterAll = document.getElementById('filterAll');
  const filterFlagged = document.getElementById('filterFlagged');
  const filterApproved = document.getElementById('filterApproved');

  function setActiveTab(btn) {
    [filterAll, filterFlagged, filterApproved].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  if (filterAll) {
    filterAll.addEventListener('click', () => { setActiveTab(filterAll); renderTable('ALL'); });
  }
  if (filterFlagged) {
    filterFlagged.addEventListener('click', () => { setActiveTab(filterFlagged); renderTable('FLAGGED'); });
  }
  if (filterApproved) {
    filterApproved.addEventListener('click', () => { setActiveTab(filterApproved); renderTable('APPROVED'); });
  }

  // 6. Finora-Inspired Smooth Chart.js Spline Area Graph
  const canvas = document.getElementById('velocityChart');
  if (canvas) {
    const ctx = canvas.getContext('2d');

    // Create Purple Gradient Fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

    const chartData24H = {
      labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', 'Now'],
      data: [12, 45, 18, 85, 120, 95, 140, 110, 135]
    };

    const velocityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData24H.labels,
        datasets: [{
          label: 'Transaction Volume (₹ Lakhs)',
          data: chartData24H.data,
          borderColor: '#A855F7',
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.42, // Smooth bezier curve (Finora style)
          pointBackgroundColor: '#8B5CF6',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F0F14',
            titleColor: '#FFFFFF',
            bodyColor: '#A1A1AA',
            borderColor: 'rgba(139, 92, 246, 0.4)',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => `Volume: ₹ ${context.parsed.y} Lakhs`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#71717A', font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#71717A', font: { size: 11 } }
          }
        }
      }
    });

    // Time-tab switching (24H, 1W, 1M, 1Y)
    document.querySelectorAll('[data-range]').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('[data-range]').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');

        const range = e.target.getAttribute('data-range');
        if (range === '24H') {
          velocityChart.data.labels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', 'Now'];
          velocityChart.data.datasets[0].data = [12, 45, 18, 85, 120, 95, 140, 110, 135];
        } else if (range === '1W') {
          velocityChart.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          velocityChart.data.datasets[0].data = [420, 560, 680, 510, 890, 920, 780];
        } else if (range === '1M') {
          velocityChart.data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
          velocityChart.data.datasets[0].data = [2400, 3100, 2850, 4200];
        } else if (range === '1Y') {
          velocityChart.data.labels = ['Q1', 'Q2', 'Q3', 'Q4'];
          velocityChart.data.datasets[0].data = [12000, 15400, 18900, 24500];
        }
        velocityChart.update();
      });
    });
  }

});