/**
 * BOB SafePay AI — Real-Time Threat Analytics Engine
 * Manages 3 Chart.js visualizations: Multi-line trend, Doughnut risk split, and Bar drivers.
 */

document.addEventListener('DOMContentLoaded', () => {

  // -------------------------------------------------------------------------
  // 1. Chart 1: 30-Day Velocity & Anomaly Trends (Multi-Line Chart)
  // -------------------------------------------------------------------------
  const trendCtx = document.getElementById('trendChart')?.getContext('2d');
  let trendChart;

  if (trendCtx) {
    const purpleGrad = trendCtx.createLinearGradient(0, 0, 0, 270);
    purpleGrad.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
    purpleGrad.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

    trendChart = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
        datasets: [
          {
            label: 'Total Monitored Payments (₹ Lakhs)',
            data: [120, 160, 210, 185, 290, 310, 482],
            borderColor: '#A855F7',
            borderWidth: 2.5,
            backgroundColor: purpleGrad,
            fill: true,
            tension: 0.4,
            pointRadius: 3
          },
          {
            label: 'Flagged Threats (₹ Lakhs)',
            data: [4, 8, 14, 6, 18, 12, 24],
            borderColor: '#EF4444',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: '#EF4444'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#A1A1AA', font: { size: 11 }, boxWidth: 12 }
          },
          tooltip: {
            backgroundColor: '#0F0F14',
            borderColor: 'rgba(139, 92, 246, 0.4)',
            borderWidth: 1,
            titleColor: '#FFFFFF',
            bodyColor: '#A1A1AA'
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#71717A', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#71717A', font: { size: 10 } }
          }
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // 2. Chart 2: Risk Tier Distribution (Doughnut Chart)
  // -------------------------------------------------------------------------
  const doughnutCtx = document.getElementById('doughnutChart')?.getContext('2d');
  if (doughnutCtx) {
    new Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Safe (Cleared)', 'Review (OTP)', 'High Risk (Blocked)'],
        datasets: [{
          data: [84, 11, 5],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
          borderColor: '#0F0F14',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F0F14',
            borderColor: 'rgba(139, 92, 246, 0.4)',
            borderWidth: 1,
            titleColor: '#FFFFFF',
            bodyColor: '#A1A1AA',
            callbacks: {
              label: (context) => ` ${context.label}: ${context.raw}%`
            }
          }
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // 3. Chart 3: Primary Anomaly Drivers (Bar Chart)
  // -------------------------------------------------------------------------
  const driversCtx = document.getElementById('driversChart')?.getContext('2d');
  if (driversCtx) {
    new Chart(driversCtx, {
      type: 'bar',
      data: {
        labels: ['Device Spoofing', 'Geo Breach', 'Amount Surge', 'Off-Hours', 'VPA Blacklist'],
        datasets: [{
          label: 'Interception Count',
          data: [42, 38, 29, 18, 11],
          backgroundColor: [
            'rgba(139, 92, 246, 0.75)',
            'rgba(168, 85, 247, 0.65)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(109, 40, 217, 0.6)'
          ],
          borderRadius: 6,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F0F14',
            borderColor: 'rgba(139, 92, 246, 0.4)',
            borderWidth: 1,
            titleColor: '#FFFFFF',
            bodyColor: '#A1A1AA'
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#71717A', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#71717A', font: { size: 10 } }
          }
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // 4. Period Filter Switching (7D, 30D, 90D)
  // -------------------------------------------------------------------------
  document.querySelectorAll('[data-period]').forEach(button => {
    button.addEventListener('click', (e) => {
      document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      const period = e.target.getAttribute('data-period');
      if (trendChart) {
        if (period === '7D') {
          trendChart.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          trendChart.data.datasets[0].data = [45, 62, 58, 89, 110, 95, 125];
          trendChart.data.datasets[1].data = [2, 4, 3, 6, 9, 5, 8];
        } else if (period === '30D') {
          trendChart.data.labels = ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'];
          trendChart.data.datasets[0].data = [120, 160, 210, 185, 290, 310, 482];
          trendChart.data.datasets[1].data = [4, 8, 14, 6, 18, 12, 24];
        } else if (period === '90D') {
          trendChart.data.labels = ['Month 1', 'Month 2', 'Month 3'];
          trendChart.data.datasets[0].data = [1250, 1680, 2450];
          trendChart.data.datasets[1].data = [65, 88, 115];
        }
        trendChart.update();
      }
    });
  });

});