/**
 * BOB SafePay AI — Admin SOC Portal Logic
 * Handles threshold sliders, compliance policy updates, and staff access suspension.
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Threshold Sliders
  const highRiskSlider = document.getElementById('highRiskSlider');
  const highRiskVal = document.getElementById('highRiskVal');
  const reviewSlider = document.getElementById('reviewSlider');
  const reviewVal = document.getElementById('reviewVal');

  if (highRiskSlider && highRiskVal) {
    highRiskSlider.addEventListener('input', (e) => {
      highRiskVal.textContent = e.target.value;
    });
  }

  if (reviewSlider && reviewVal) {
    reviewSlider.addEventListener('input', (e) => {
      reviewVal.textContent = e.target.value;
    });
  }

  // 2. Save Configuration Button
  const saveConfigBtn = document.getElementById('saveConfigBtn');
  if (saveConfigBtn) {
    saveConfigBtn.addEventListener('click', () => {
      saveConfigBtn.disabled = true;
      saveConfigBtn.innerHTML = '💾 Committing Policies...';

      setTimeout(() => {
        alert(`[SOC POLICY COMMITTED]\n\n• High-Risk Block Threshold: ${highRiskSlider.value}%\n• Step-Up Review Threshold: ${reviewSlider.value}%\n• RBI Cooling-Off Period: Active\n\nPolicy deployed to all gateway nodes.`);
        saveConfigBtn.disabled = false;
        saveConfigBtn.innerHTML = '✓ Policy Active';
        setTimeout(() => { saveConfigBtn.innerHTML = '💾 Save SOC Policy'; }, 2000);
      }, 500);
    });
  }

  // 3. Emergency Lockdown Button
  const emergencyLockdownBtn = document.getElementById('emergencyLockdownBtn');
  if (emergencyLockdownBtn) {
    emergencyLockdownBtn.addEventListener('click', () => {
      const confirmed = confirm('WARNING: Engaging Emergency Lockdown will reject all outbound payments and enforce 100% biometric challenges across the gateway. Proceed?');
      if (confirmed) {
        alert('🛑 [EMERGENCY LOCKDOWN ENGAGED]\n\nAll transactional outflow throttled. Bank of Baroda Security Incident Desk notified.');
        emergencyLockdownBtn.textContent = '🛑 LOCKDOWN ACTIVE';
      }
    });
  }

  // 4. Staff & Analyst Directory
  const analysts = [
    {
      name: 'Sarah Rahman',
      email: 'analyst@safepay.bob.in',
      role: 'Senior Fraud Analyst',
      device: 'HW_MAC_9824X (Primary MacBook)',
      lastActive: 'Active Now',
      status: 'ACTIVE'
    },
    {
      name: 'Vikram Joshi',
      email: 'v.joshi@safepay.bob.in',
      role: 'Triage Specialist',
      device: 'HW_DELL_4411B (Office Terminal)',
      lastActive: '14 mins ago',
      status: 'ACTIVE'
    },
    {
      name: 'Rohan Mehra',
      email: 'r.mehra@safepay.bob.in',
      role: 'Junior Investigator',
      device: 'HW_UNKNOWN_772A (Unverified IP)',
      lastActive: '2 days ago',
      status: 'ACTIVE'
    }
  ];

  const tableBody = document.getElementById('analystTableBody');

  function renderAnalysts() {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    analysts.forEach((analyst, index) => {
      const tr = document.createElement('tr');
      const isSuspended = analyst.status === 'SUSPENDED';

      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: #FFFFFF;">${analyst.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${analyst.email}</div>
        </td>
        <td style="font-size: 0.88rem; color: #FFFFFF;">${analyst.role}</td>
        <td style="font-size: 0.82rem; font-family: monospace; color: var(--purple-bright);">${analyst.device}</td>
        <td style="font-size: 0.84rem; color: var(--text-dim);">${analyst.lastActive}</td>
        <td>
          <span class="status-badge ${isSuspended ? 'status-flagged' : 'status-approved'}">
            ${analyst.status}
          </span>
        </td>
        <td>
          <button class="btn btn-danger suspend-btn" data-index="${index}" style="padding: 5px 12px; font-size: 0.78rem;">
            ${isSuspended ? 'Reinstate Access ↩' : 'Suspend Access ✕'}
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    document.querySelectorAll('.suspend-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        analysts[idx].status = analysts[idx].status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        renderAnalysts();
      });
    });
  }

  renderAnalysts();

});