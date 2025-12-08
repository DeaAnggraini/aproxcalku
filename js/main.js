// ========================================
// MAIN APPLICATION LOGIC
// Dea Anggraini & Qatrunnada Athirah
// ========================================

let dataPoints = [];
let chart = null;

// ============ DOM ELEMENTS ============

const elements = {
    inputX: document.getElementById('inputX'),
    inputY: document.getElementById('inputY'),
    btnAdd: document.getElementById('btnAdd'),
    btnLoadExample: document.getElementById('btnLoadExample'),
    btnClear: document.getElementById('btnClear'),
    btnCalculate: document.getElementById('btnCalculate'),
    tableBody: document.getElementById('tableBody'),
    fittingType: document.getElementById('fittingType'),
    resultsSection: document.getElementById('resultsSection'),
    equationDisplay: document.getElementById('equationDisplay'),
    sseValue: document.getElementById('sseValue'),
    r2Value: document.getElementById('r2Value'),
    rmseValue: document.getElementById('rmseValue'),
    maxErrorValue: document.getElementById('maxErrorValue')
};

// ============ EVENT LISTENERS ============

elements.btnAdd.addEventListener('click', addDataPoint);
elements.btnLoadExample.addEventListener('click', loadExampleData);
elements.btnClear.addEventListener('click', clearAllData);
elements.btnCalculate.addEventListener('click', calculateFitting);

elements.inputX.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') elements.inputY.focus();
});

elements.inputY.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addDataPoint();
});

// ============ DATA MANAGEMENT ============

function addDataPoint() {
    const x = parseFloat(elements.inputX.value);
    const y = parseFloat(elements.inputY.value);
    
    if (isNaN(x) || isNaN(y)) {
        alert('⚠️ Masukkan nilai X dan Y yang valid!');
        return;
    }
    
    dataPoints.push({ x, y });
    updateTable();
    updateChart();
    
    elements.inputX.value = '';
    elements.inputY.value = '';
    elements.inputX.focus();
}

function deleteDataPoint(index) {
    dataPoints.splice(index, 1);
    updateTable();
    updateChart();
}

function clearAllData() {
    if (dataPoints.length === 0) return;
    
    if (confirm('🗑️ Hapus semua data?')) {
        dataPoints = [];
        updateTable();
        updateChart();
        elements.resultsSection.style.display = 'none';
    }
}

function loadExampleData() {
    dataPoints = [
        { x: 1, y: 2.1 },
        { x: 2, y: 3.9 },
        { x: 3, y: 6.0 },
        { x: 4, y: 8.1 },
        { x: 5, y: 9.9 },
        { x: 6, y: 12.0 }
    ];
    
    updateTable();
    updateChart();
    alert('✅ Data contoh berhasil dimuat!');
}

// ============ TABLE UPDATE ============

function updateTable() {
    if (dataPoints.length === 0) {
        elements.tableBody.innerHTML = '<tr><td colspan="3" class="no-data">Belum ada data</td></tr>';
        return;
    }
    
    elements.tableBody.innerHTML = dataPoints.map((p, i) => `
        <tr>
            <td>${p.x.toFixed(2)}</td>
            <td>${p.y.toFixed(2)}</td>
            <td>
                <button class="delete-btn" onclick="deleteDataPoint(${i})">❌</button>
            </td>
        </tr>
    `).join('');
}

// ============ CHART VISUALIZATION ============

function updateChart() {
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }
    
    if (dataPoints.length === 0) {
        chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Data Points',
                    data: [],
                    backgroundColor: 'rgba(102, 126, 234, 0.5)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    pointRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: 'X' }
                    },
                    y: {
                        title: { display: true, text: 'Y' }
                    }
                },
                plugins: {
                    legend: { display: true },
                    title: {
                        display: true,
                        text: 'Belum ada data - Tambahkan data untuk memulai'
                    }
                }
            }
        });
        return;
    }
    
    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Data Points',
                data: dataPoints,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                pointRadius: 8,
                pointHoverRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: 'X', font: { size: 14, weight: 'bold' } }
                },
                y: {
                    title: { display: true, text: 'Y', font: { size: 14, weight: 'bold' } }
                }
            },
            plugins: {
                legend: { display: true, position: 'top' },
                title: {
                    display: true,
                    text: 'Data Visualization',
                    font: { size: 16 }
                }
            }
        }
    });
}

// ============ FITTING CALCULATION ============

function calculateFitting() {
    if (dataPoints.length < 2) {
        alert('⚠️ Minimal 2 data points untuk fitting!');
        return;
    }
    
    const type = elements.fittingType.value;
    let result;
    
    try {
        switch(type) {
            case 'linear':
                result = calculateLinear(dataPoints);
                break;
            case 'quadratic':
                result = calculatePolynomial(dataPoints, 2);
                break;
            case 'cubic':
                result = calculatePolynomial(dataPoints, 3);
                break;
            case 'poly4':
                result = calculatePolynomial(dataPoints, 4);
                break;
            case 'chebyshev':
                result = calculateChebyshev(dataPoints, 3);
                break;
            case 'fourier':
                result = calculateFourier(dataPoints, 3);
                break;
        }
        
        const metrics = calculateMetrics(dataPoints, result.predict);
        
        displayResults(result, metrics);
        updateChartWithFitting(result);
        
    } catch (error) {
        alert('❌ Error dalam perhitungan: ' + error.message);
        console.error(error);
    }
}

// ============ DISPLAY RESULTS ============

function displayResults(result, metrics) {
    elements.resultsSection.style.display = 'block';
    elements.equationDisplay.textContent = result.equation;
    elements.sseValue.textContent = metrics.sse.toFixed(4);
    elements.r2Value.textContent = metrics.r2.toFixed(4);
    elements.rmseValue.textContent = metrics.rmse.toFixed(4);
    elements.maxErrorValue.textContent = metrics.maxError.toFixed(4);
    
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============ UPDATE CHART WITH FITTING ============

function updateChartWithFitting(result) {
    const xMin = Math.min(...dataPoints.map(p => p.x));
    const xMax = Math.max(...dataPoints.map(p => p.x));
    const xRange = xMax - xMin;
    
    const fittingPoints = [];
    for (let x = xMin - xRange * 0.1; x <= xMax + xRange * 0.1; x += (xMax - xMin) / 100) {
        fittingPoints.push({
            x: x,
            y: result.predict(x)
        });
    }
    
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Data Points',
                    data: dataPoints,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    type: 'scatter'
                },
                {
                    label: `${result.type} Fitting`,
                    data: fittingPoints,
                    backgroundColor: 'rgba(239, 68, 68, 0)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 3,
                    pointRadius: 0,
                    type: 'line',
                    showLine: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: 'X', font: { size: 14, weight: 'bold' } }
                },
                y: {
                    title: { display: true, text: 'Y', font: { size: 14, weight: 'bold' } }
                }
            },
            plugins: {
                legend: { display: true, position: 'top' },
                title: {
                    display: true,
                    text: `Curve Fitting: ${result.type}`,
                    font: { size: 16, weight: 'bold' }
                }
            }
        }
    });
}

// ============ INITIALIZATION ============

window.addEventListener('DOMContentLoaded', () => {
    updateChart();
    console.log('🚀 AproxCalKu initialized successfully!');
});