// Inisialisasi Chart
const ctx = document.getElementById('waterLevelChart').getContext('2d');
const waterLevelChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Ketinggian Air (cm)',
      data: [],
      borderColor: '#2196F3',
      fill: false,
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// Variabel Global
let activityLogElement = document.getElementById('activityLog');
let currentHeightElement = document.getElementById('currentHeight');
let statusTextElement = document.getElementById('statusText');
let ledIndicatorElement = document.getElementById('ledIndicator');

// Fungsi untuk memperbarui data
function fetchData() {
  fetch('/data')
    .then(response => response.json())
    .then(data => {
      if (!data) return;

      // Update status dan LED
      const status = data.status;
      const height = data.ketinggian;
      currentHeightElement.textContent = `${height} cm`;
      statusTextElement.textContent = status;
      ledIndicatorElement.className = `led-indicator status-${status.toLowerCase()}`;

      // Tambahkan log aktivitas
      if (status === "Bahaya") {
        const logEntry = `<li>[${new Date().toLocaleTimeString()}] ${status}: Ketinggian air ${height} cm</li>`;
        activityLogElement.innerHTML = logEntry + activityLogElement.innerHTML;
      }

      // Update grafik
      if (waterLevelChart.data.labels.length > 10) {
        waterLevelChart.data.labels.shift();
        waterLevelChart.data.datasets[0].data.shift();
      }
      waterLevelChart.data.labels.push(new Date().toLocaleTimeString());
      waterLevelChart.data.datasets[0].data.push(height);
      waterLevelChart.update();
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Polling data setiap 5 detik
setInterval(fetchData, 5000);

// Initial fetch
fetchData();