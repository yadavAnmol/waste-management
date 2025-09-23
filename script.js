// Year updater
document.querySelectorAll('#year, #year2, #year3, #year4').forEach(el => {
    if (el) el.textContent = new Date().getFullYear();
});

// Mobile Navigation Logic
const hamburgerBtn = document.getElementById('hamburger-btn');
const mainNav = document.getElementById('main-nav');

if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });
}

// Dashboard logic
if (location.pathname.includes('dashboard.html')) {
    const defaultData = {
        bins: { dry: 40, wet: 30, metal: 20, unknown: 10 },
        status: { dry: false, wet: false, metal: false, unknown: false, mc: true },
        weekly: [12, 10, 9, 11, 8, 7, 14],
        sensorReadings: [{ t: 'Mon', v: 20 }, { t: 'Tue', v: 30 }, { t: 'Wed', v: 25 }, { t: 'Thu', v: 28 }, { t: 'Fri', v: 22 }, { t: 'Sat', v: 18 }, { t: 'Sun', v: 35 }]
    };

    async function getData() {
        try {
            const res = await fetch('data.json');
            if (!res.ok) throw new Error();
            return await res.json();
        } catch {
            return defaultData;
        }
    }

    function updateStatusUI(status) {
        const map = { dry: 'dry-status', wet: 'wet-status', metal: 'metal-status', unknown: 'unknown-status', mc: 'mc-status' };
        Object.keys(map).forEach(k => {
            const el = document.getElementById(map[k]);
            if (!el) return;
            if (k === 'mc') {
                el.textContent = status[k] ? 'Online' : 'Offline';
                el.className = 'status-indicator ' + (status[k] ? 'ok' : 'warn');
            } else {
                el.textContent = status[k] ? 'Full' : 'Available';
                el.className = 'status-indicator ' + (status[k] ? 'full' : 'ok');
            }
        });
    }

    let charts = {};
    function createCharts(data) {
        const pieColors = ['#4caf50', '#ffc107', '#2196f3', '#9e9e9e'];
        charts.pie = new Chart(document.getElementById('pieChart'), {
            type: 'pie',
            data: {
                labels: ['Dry', 'Wet', 'Metal', 'Unknown'],
                datasets: [{
                    data: [data.bins.dry, data.bins.wet, data.bins.metal, data.bins.unknown],
                    backgroundColor: pieColors,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false,
                    }
                }
            }
        });

        charts.bar = new Chart(document.getElementById('barChart'), {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Weight (kg)',
                    data: data.weekly,
                    backgroundColor: '#2563eb',
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

        charts.line = new Chart(document.getElementById('lineChart'), {
            type: 'line',
            data: {
                labels: data.sensorReadings.map(s => s.t),
                datasets: [{
                    label: 'Sensor Readings',
                    data: data.sensorReadings.map(s => s.v),
                    borderColor: '#f59e0b',
                    tension: 0.3,
                    fill: false,
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
    }

    async function refresh() {
        const data = await getData();
        updateStatusUI(data.status);
        if (!charts.pie) {
            createCharts(data);
        } else {
            charts.pie.data.datasets[0].data = [data.bins.dry, data.bins.wet, data.bins.metal, data.bins.unknown];
            charts.pie.update();
            charts.bar.data.datasets[0].data = data.weekly;
            charts.bar.update();
            charts.line.data.labels = data.sensorReadings.map(s => s.t);
            charts.line.data.datasets[0].data = data.sensorReadings.map(s => s.v);
            charts.line.update();
        }
    }

    document.getElementById('refreshBtn').addEventListener('click', refresh);
    document.getElementById('toggleMC').addEventListener('click', () => {
        const el = document.getElementById('mc-status');
        if (el.textContent === 'Online') {
            el.textContent = 'Offline';
            el.className = 'status-indicator warn';
        } else {
            el.textContent = 'Online';
            el.className = 'status-indicator ok';
        }
    });

    refresh();
    setInterval(refresh, 10000);
}

// Contact form
if (document.getElementById('contactForm')) {
    document.getElementById('contactForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const status = document.getElementById('formStatus');
        status.textContent = 'Sending...';
        setTimeout(() => {
            status.textContent = `Thanks ${name}! Message received (simulated).`;
            document.getElementById('contactForm').reset();
        }, 800);
    });
}