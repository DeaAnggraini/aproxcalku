// ========================================
// MAIN APPLICATION LOGIC WITH NAVIGATION
// Dea Anggraini & Qatrunnada Athirah
// ========================================

let dataPoints = [];
let chart = null;

// ============ PAGE NAVIGATION ============

window.addEventListener('DOMContentLoaded', () => {
    // Show landing page on load
    showLandingPage();
    
    // Navigation buttons
    document.getElementById('btnStartCalculator').addEventListener('click', showCalculatorApp);
    document.getElementById('btnLearnMaterial').addEventListener('click', showMaterialPage);
    document.getElementById('btnBackFromCalc').addEventListener('click', showLandingPage);
    document.getElementById('btnBackFromMaterial').addEventListener('click', showLandingPage);
    
    // Calculator functionality
    elements.btnAdd.addEventListener('click', addDataPoint);
    elements.btnLoadExample.addEventListener('click', loadExampleData);
    elements.btnClear.addEventListener('click', clearAllData);
    elements.btnCalculate.addEventListener('click', calculateFitting);
    document.getElementById('btnResetZoom').addEventListener('click', resetChartZoom);
    
    elements.inputX.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') elements.inputY.focus();
    });
    
    elements.inputY.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addDataPoint();
    });
    
    console.log('🚀 AproxCalKu initialized successfully!');
});

function showLandingPage() {
    document.getElementById('landingPage').style.display = 'flex';
    document.getElementById('materialPage').style.display = 'none';
    document.getElementById('calculatorApp').style.display = 'none';
}

function showMaterialPage() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('materialPage').style.display = 'block';
    document.getElementById('calculatorApp').style.display = 'none';
    window.scrollTo(0, 0);
}

function showCalculatorApp() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('materialPage').style.display = 'none';
    document.getElementById('calculatorApp').style.display = 'block';
    window.scrollTo(0, 0);
    
    setTimeout(() => {
        updateChart();
    }, 100);
}

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
    resultsSection: document.getElementById('resultsSection')
};

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
    const ctx = document.getElementById('mainChart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    
    if (chart) {
        chart.destroy();
    }
    
    if (dataPoints.length === 0) {
        chart = new Chart(context, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Data Points',
                    data: [],
                    backgroundColor: 'rgba(44, 62, 80, 0.6)',
                    borderColor: 'rgba(44, 62, 80, 1)',
                    pointRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        title: { 
                            display: true, 
                            text: 'X',
                            font: { size: 14, weight: 'bold' }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        title: { 
                            display: true, 
                            text: 'Y',
                            font: { size: 14, weight: 'bold' }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: { display: true, position: 'top' },
                    title: {
                        display: true,
                        text: 'Belum ada data - Tambahkan data untuk memulai',
                        font: { size: 16 }
                    },
                    zoom: {
                        zoom: {
                            wheel: { enabled: true },
                            pinch: { enabled: true },
                            mode: 'xy'
                        },
                        pan: {
                            enabled: true,
                            mode: 'xy'
                        }
                    }
                }
            }
        });
        return;
    }
    
    const xValues = dataPoints.map(p => p.x);
    const yValues = dataPoints.map(p => p.y);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const xPadding = (xMax - xMin) * 0.2 || 1;
    const yPadding = (yMax - yMin) * 0.2 || 1;
    
    chart = new Chart(context, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Data Points',
                data: dataPoints,
                backgroundColor: 'rgba(44, 62, 80, 0.8)',
                borderColor: 'rgba(44, 62, 80, 1)',
                pointRadius: 8,
                pointHoverRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'X', font: { size: 14, weight: 'bold' } },
                    min: xMin - xPadding,
                    max: xMax + xPadding,
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                },
                y: {
                    title: { display: true, text: 'Y', font: { size: 14, weight: 'bold' } },
                    min: yMin - yPadding,
                    max: yMax + yPadding,
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                }
            },
            plugins: {
                legend: { display: true, position: 'top' },
                title: { display: true, text: 'Visualisasi Data Points', font: { size: 16 } },
                zoom: {
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'xy'
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy'
                    }
                }
            }
        }
    });
}

function resetChartZoom() {
    if (chart) {
        chart.resetZoom();
    }
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
            case 'trigonometric':
                result = calculateTrigonometric(dataPoints, 3);
                break;
            case 'fourier':
                result = calculateFourier(dataPoints, 3);
                break;
            default:
                throw new Error('Metode tidak dikenali');
        }
        
        const metrics = calculateMetrics(dataPoints, result.predict);
        
        displayResults(result, metrics);
        updateChartWithFitting(result);
        
    } catch (error) {
        alert('❌ Error dalam perhitungan: ' + error.message);
        console.error(error);
    }
}

// ============ DISPLAY RESULTS WITH STEPS ============

function displayResults(result, metrics) {
    elements.resultsSection.style.display = 'block';
    
    const equationCard = `
        <div class="result-card" onclick="toggleSteps('equationSteps')">
            <div class="result-header">
                <div class="result-title">Persamaan Fitting (Klik untuk lihat langkah)</div>
                <div class="toggle-icon">▼</div>
            </div>
            <div class="equation">${result.equation}</div>
            <div class="steps-container" id="equationSteps">
                ${generateEquationSteps(result, dataPoints)}
            </div>
        </div>
    `;
    
    elements.resultsSection.innerHTML = `
        <h3>📊 Hasil Analisis</h3>
        ${equationCard}
        <div class="metrics-grid">
            ${generateMetricCard('SSE', metrics.sse.toFixed(4), 'Sum of Squared Errors', 'sseSteps', generateSSESteps(dataPoints, result.predict))}
            ${generateMetricCard('R²', metrics.r2.toFixed(4), 'Goodness of Fit', 'r2Steps', generateR2Steps(metrics, dataPoints))}
            ${generateMetricCard('RMSE', metrics.rmse.toFixed(4), 'Root Mean Square Error', 'rmseSteps', generateRMSESteps(metrics, dataPoints))}
            ${generateMetricCard('Max Error', metrics.maxError.toFixed(4), 'Maximum Absolute Error', 'maxErrorSteps', generateMaxErrorSteps(dataPoints, result.predict))}
        </div>
    `;
    
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function generateMetricCard(label, value, desc, stepsId, stepsHTML) {
    return `
        <div class="metric-card" onclick="toggleSteps('${stepsId}')">
            <div class="result-header">
                <div class="metric-label">${label}</div>
                <div class="toggle-icon">▼</div>
            </div>
            <div class="metric-value">${value}</div>
            <div class="metric-desc">${desc}</div>
            <div class="steps-container" id="${stepsId}">
                ${stepsHTML}
            </div>
        </div>
    `;
}

function toggleSteps(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.toggle('show');
        const card = element.closest('.result-card, .metric-card');
        const icon = card.querySelector('.toggle-icon');
        if (icon) {
            icon.textContent = element.classList.contains('show') ? '▲' : '▼';
        }
    }
}

// ============ GENERATE CALCULATION STEPS FOR ALL METHODS (FIXED) ============

// ============ GENERATE CALCULATION STEPS FOR ALL METHODS (COMPLETE FIXED) ============

function generateEquationSteps(result, data) {
    const n = data.length;
    
    // ===== LINEAR =====
    if (result.type === 'Linear') {
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        data.forEach(p => {
            sumX += p.x;
            sumY += p.y;
            sumXY += p.x * p.y;
            sumX2 += p.x * p.x;
        });
        
        return `
            <div class="step-item">
                <div class="step-label">Langkah 1: Hitung Sigma</div>
                <div class="step-formula">n = ${n}</div>
                <div class="step-formula">ΣX = ${sumX.toFixed(2)}</div>
                <div class="step-formula">ΣY = ${sumY.toFixed(2)}</div>
                <div class="step-formula">ΣXY = ${sumXY.toFixed(2)}</div>
                <div class="step-formula">ΣX² = ${sumX2.toFixed(2)}</div>
            </div>
            <div class="step-item">
                <div class="step-label">Langkah 2: Hitung Koefisien a (Slope)</div>
                <div class="step-formula">a = (n·ΣXY - ΣX·ΣY) / (n·ΣX² - (ΣX)²)</div>
                <div class="step-formula">a = (${n}×${sumXY.toFixed(2)} - ${sumX.toFixed(2)}×${sumY.toFixed(2)}) / (${n}×${sumX2.toFixed(2)} - ${sumX.toFixed(2)}²)</div>
                <div class="step-formula">a = ${result.coeffs[1].toFixed(4)}</div>
            </div>
            <div class="step-item">
                <div class="step-label">Langkah 3: Hitung Koefisien b (Intercept)</div>
                <div class="step-formula">b = (ΣY - a·ΣX) / n</div>
                <div class="step-formula">b = (${sumY.toFixed(2)} - ${result.coeffs[1].toFixed(4)}×${sumX.toFixed(2)}) / ${n}</div>
                <div class="step-formula">b = ${result.coeffs[0].toFixed(4)}</div>
            </div>
            <div class="step-item">
                <div class="step-label">Langkah 4: Persamaan Akhir</div>
                <div class="step-formula">${result.equation}</div>
            </div>
        `;
    }
    
    // ===== QUADRATIC / CUBIC / POLYNOMIAL DEGREE 4 =====
    else if (result.type.includes('Quadratic') || result.type === 'Cubic' || result.type === 'Polynomial Degree 4') {
        const degree = result.type.includes('Quadratic') ? 2 : 
                       result.type === 'Cubic' ? 3 : 4;
        
        // Calculate sums for matrix
        let sums = {};
        for (let i = 0; i <= degree * 2; i++) {
            sums[`X${i}`] = data.reduce((sum, p) => sum + Math.pow(p.x, i), 0);
        }
        
        let sumXY = {};
        for (let i = 0; i <= degree; i++) {
            sumXY[`X${i}Y`] = data.reduce((sum, p) => sum + Math.pow(p.x, i) * p.y, 0);
        }
        
        let matrixHTML = '<div class="step-item"><div class="step-label">Langkah 1: Bentuk Sistem Persamaan Normal</div>';
        matrixHTML += '<div class="step-formula">Untuk polinomial derajat ' + degree + ', kita perlu sistem ' + (degree + 1) + ' persamaan:</div>';
        
        // Show normal equations
        for (let i = 0; i <= degree; i++) {
            let eq = '';
            for (let j = 0; j <= degree; j++) {
                const power = i + j;
                if (j > 0) eq += ' + ';
                eq += `a${j}·ΣX^${power}`;
            }
            eq += ` = ΣX^${i}Y`;
            matrixHTML += `<div class="step-formula">${eq}</div>`;
        }
        matrixHTML += '</div>';
        
        // Show matrix form
        let matrixFormHTML = '<div class="step-item"><div class="step-label">Langkah 2: Bentuk Matriks (Least Squares)</div>';
        matrixFormHTML += '<div class="step-formula">Dalam bentuk matriks Ax = b:</div>';
        matrixFormHTML += '<table style="margin: 10px auto; border-collapse: collapse;">';
        
        for (let i = 0; i <= degree; i++) {
            matrixFormHTML += '<tr>';
            matrixFormHTML += '<td style="padding: 5px;">[</td>';
            for (let j = 0; j <= degree; j++) {
                const power = i + j;
                matrixFormHTML += `<td style="padding: 5px; text-align: right;">${sums[`X${power}`].toFixed(2)}</td>`;
            }
            matrixFormHTML += '<td style="padding: 5px;">]</td>';
            matrixFormHTML += `<td style="padding: 5px;">= ${sumXY[`X${i}Y`].toFixed(2)}</td>`;
            matrixFormHTML += '</tr>';
        }
        matrixFormHTML += '</table></div>';
        
        // Show Gaussian Elimination hint
        let gaussHTML = '<div class="step-item">';
        gaussHTML += '<div class="step-label">Langkah 3: Selesaikan dengan Gaussian Elimination</div>';
        gaussHTML += '<div class="step-formula">Menggunakan eliminasi Gauss untuk mendapatkan koefisien</div>';
        gaussHTML += '<div class="step-formula">Proses: Eliminasi maju → Substitusi mundur</div>';
        gaussHTML += '</div>';
        
        // Show coefficients
        let coeffHTML = '<div class="step-item">';
        coeffHTML += '<div class="step-label">Langkah 4: Hasil Koefisien</div>';
        for (let i = 0; i <= degree; i++) {
            coeffHTML += `<div class="step-formula">a${i} = ${result.coeffs[i].toFixed(6)}</div>`;
        }
        coeffHTML += '</div>';
        
        // Show final equation
        let finalHTML = '<div class="step-item">';
        finalHTML += '<div class="step-label">Langkah 5: Persamaan Akhir</div>';
        finalHTML += `<div class="step-formula">${result.equation}</div>`;
        finalHTML += '</div>';
        
        return matrixHTML + matrixFormHTML + gaussHTML + coeffHTML + finalHTML;
    }
    
    // ===== CHEBYSHEV =====
    else if (result.type === 'Chebyshev') {
        let steps = '<div class="step-item">';
        steps += '<div class="step-label">Langkah 1: Normalisasi Domain</div>';
        steps += '<div class="step-formula">Transformasi X ke interval [-1, 1]</div>';
        
        const xMin = Math.min(...data.map(p => p.x));
        const xMax = Math.max(...data.map(p => p.x));
        
        steps += `<div class="step-formula">X_min = ${xMin.toFixed(2)}, X_max = ${xMax.toFixed(2)}</div>`;
        steps += `<div class="step-formula">t = 2(x - ${xMin.toFixed(2)})/(${xMax.toFixed(2)} - ${xMin.toFixed(2)}) - 1</div>`;
        steps += '</div>';
        
        steps += '<div class="step-item">';
        steps += '<div class="step-label">Langkah 2: Polinomial Chebyshev</div>';
        steps += '<div class="step-formula">T₀(t) = 1</div>';
        steps += '<div class="step-formula">T₁(t) = t</div>';
        steps += '<div class="step-formula">T₂(t) = 2t² - 1</div>';
        steps += '<div class="step-formula">T₃(t) = 4t³ - 3t</div>';
        steps += '<div class="step-formula">Rekursi: Tₙ(t) = 2t·Tₙ₋₁(t) - Tₙ₋₂(t)</div>';
        steps += '</div>';
        
        steps += '<div class="step-item">';
        steps += '<div class="step-label">Langkah 3: Least Squares Fitting</div>';
        steps += '<div class="step-formula">Cari koefisien c₀, c₁, c₂, c₃ yang meminimalkan error</div>';
        steps += '<div class="step-formula">y ≈ c₀T₀(t) + c₁T₁(t) + c₂T₂(t) + c₃T₃(t)</div>';
        steps += '</div>';
        
        steps += '<div class="step-item">';
        steps += '<div class="step-label">Langkah 4: Hasil Koefisien</div>';
        
        if (Array.isArray(result.coeffs)) {
            result.coeffs.forEach((c, i) => {
                steps += `<div class="step-formula">c${i} = ${c.toFixed(6)}</div>`;
            });
        } else {
            steps += `<div class="step-formula">Koefisien: ${JSON.stringify(result.coeffs)}</div>`;
        }
        steps += '</div>';
        
        steps += '<div class="step-item">';
        steps += '<div class="step-label">Langkah 5: Persamaan Akhir</div>';
        steps += `<div class="step-formula">${result.equation}</div>`;
        steps += '</div>';
        
        return steps;
    }
    
    // ===== TRIGONOMETRIC POLYNOMIAL =====
    else if (result.type === 'Trigonometric Polynomial') {
        let steps = '<div class="step-item">';
        steps += '<div class="step-label">Langkah 1: Normalisasi Periode</div>';
        
        const xMin = Math.min(...data.map(p => p.x));
        const xMax = Math.max(...data.map(p => p.x));
        const period = xMax - xMin;
        
        steps += `<div class="step-formula">X_min = ${xMin.toFixed(2)}, X_max = ${xMax.toFixed(2)}</div>`;
        steps += `<div class="step-formula">Periode = ${period.toFixed(2)}</div>`;
        steps += `<div class="step-formula">ω = 2π / Periode = ${(2 * Math.PI / period).toFixed(4)}</div>`;
        steps += '</div>';
        
        steps += '<div class="step-item">';
        steps += '<div class="step-label">Langkah 2: Basis Fungsi Trigonometri</div>';
        steps += '<div class="step-formula">y = a₀ + a₁cos(ωx) + b₁sin(ωx) + a₂cos(2ωx) + b₂sin(2ωx) + ...</div>';
        steps += '<div class="step-formula">Untuk orde 3, ada 7 basis fungsi:</div>';
        steps += '<div class="step-formula">1, cos(ωx), sin(ωx), cos(2ωx), sin(2ωx), cos(3ωx), sin(3ωx)</div>';
        steps += '</div>';
        
        steps += '<div class="step-item">';
        steps += '<div class="step-label">Langkah 3: Least Squares Fitting</div>';
        steps += '<div class="step-formula">Bentuk matriks A (data × basis) dan vektor b (output)</div>';
        steps += '<div class="step-formula">Selesaikan: AᵀAx = Aᵀb</div>';
        steps += '<div class="step-formula">Koefisien: x = (AᵀA)⁻¹Aᵀb</div>';
        steps += '</div>';
        
        steps += '<div class="step-item">';
        steps += '<div class="step-label">Langkah 4: Hasil Koefisien</div>';
        
        if (Array.isArray(result.coeffs)) {
            steps += `<div class="step-formula">a₀ = ${result.coeffs[0].toFixed(6)}</div>`;
            const numHarmonics = Math.floor((result.coeffs.length - 1) / 2);
            for (let i = 1; i <= numHarmonics; i++) {
                const cosIdx = 2 * i - 1;
                const sinIdx = 2 * i;
                steps += `<div class="step-formula">a${i} = ${result.coeffs[cosIdx].toFixed(6)}, b${i} = ${result.coeffs[sinIdx].toFixed(6)}</div>`;
            }
        } else {
            steps += `<div class="step-formula">Koefisien: ${JSON.stringify(result.coeffs)}</div>`;
        }
        steps += '</div>';
        
        steps += '<div class="step-item">';
        steps += '<div class="step-label">Langkah 5: Persamaan Akhir</div>';
        steps += `<div class="step-formula">${result.equation}</div>`;
        steps += '</div>';
        
        return steps;
    }
    
    // ===== FOURIER SERIES =====
    else if (result.type === 'Fourier Series') {
        let steps = '<div class="step-item">';
        steps += '<div class="step-label">Langkah 1: Analisis Periode</div>';
        
        const xMin = Math.min(...data.map(p => p.x));
        const xMax = Math.max(...data.map(p => p.x));
        const period = xMax - xMin;
        
        steps += `<div class="step-formula">Periode T = ${period.toFixed(2)}</div>`;
        steps += `<div class="step-formula">Frekuensi fundamental: ω₀ = 2π/T = ${(2 * Math.PI / period).toFixed(4)}</div>`;
        steps += '</div>';
        
        steps += '<div class="step-item">';
        steps += '<div class="step-label">Langkah 2: Deret Fourier</div>';
        steps += '<div class="step-formula">f(x) = a₀/2 + Σ[aₙcos(nω₀x) + bₙsin(nω₀x)]</div>';
        steps += '<div class="step-formula">Untuk harmonik ke-n:</div>';
        steps += '<div class="step-formula">aₙ = (2/T) ∫ f(x)cos(nω₀x) dx</div>';
        steps += '<div class="step-formula">bₙ = (2/T) ∫ f(x)sin(nω₀x) dx</div>';
        steps += '</div>';
        
        steps += '<div class="step-item">';
        steps += '<div class="step-label">Langkah 3: Integral Diskrit (Trapezoidal Rule)</div>';
        steps += '<div class="step-formula">Karena data diskrit, gunakan aproksimasi integral:</div>';
        steps += '<div class="step-formula">aₙ ≈ (2/N) Σ yᵢ·cos(nω₀xᵢ)</div>';
        steps += '<div class="step-formula">bₙ ≈ (2/N) Σ yᵢ·sin(nω₀xᵢ)</div>';
        steps += '</div>';
        
        steps += '<div class="step-item">';
        steps += '<div class="step-label">Langkah 4: Koefisien Fourier</div>';
        
        // Handle both object and array format
        if (result.coeffs && typeof result.coeffs === 'object') {
            if (result.coeffs.a && result.coeffs.b) {
                // Object format: {a: [...], b: [...]}
                const aCoeffs = result.coeffs.a;
                const bCoeffs = result.coeffs.b;
                
                if (Array.isArray(aCoeffs) && Array.isArray(bCoeffs)) {
                    steps += `<div class="step-formula">a₀ = ${aCoeffs[0].toFixed(6)}</div>`;
                    for (let i = 1; i < aCoeffs.length; i++) {
                        steps += `<div class="step-formula">a${i} = ${aCoeffs[i].toFixed(6)}, b${i} = ${bCoeffs[i].toFixed(6)}</div>`;
                    }
                } else {
                    steps += `<div class="step-formula">Koefisien a: ${JSON.stringify(aCoeffs)}</div>`;
                    steps += `<div class="step-formula">Koefisien b: ${JSON.stringify(bCoeffs)}</div>`;
                }
            } else {
                steps += `<div class="step-formula">Koefisien: ${JSON.stringify(result.coeffs)}</div>`;
            }
        } else if (Array.isArray(result.coeffs)) {
            // Array format
            steps += `<div class="step-formula">a₀ = ${result.coeffs[0].toFixed(6)}</div>`;
            const numHarmonics = Math.floor(result.coeffs.length / 2);
            for (let i = 1; i <= numHarmonics; i++) {
                steps += `<div class="step-formula">a${i} = ${result.coeffs[i].toFixed(6)}, b${i} = ${result.coeffs[numHarmonics + i].toFixed(6)}</div>`;
            }
        } else {
            steps += `<div class="step-formula">Koefisien: ${JSON.stringify(result.coeffs)}</div>`;
        }
        steps += '</div>';
        
        steps += '<div class="step-item">';
        steps += '<div class="step-label">Langkah 5: Persamaan Akhir</div>';
        steps += `<div class="step-formula">${result.equation}</div>`;
        steps += '</div>';
        
        return steps;
    }
    
    // ===== FALLBACK (OTHER METHODS) =====
    else {
        let steps = '<div class="step-item">';
        steps += `<div class="step-label">Metode: ${result.type}</div>`;
        steps += '<div class="step-formula">Menggunakan sistem persamaan normal dan Gaussian Elimination</div>';
        
        if (result.coeffs && Array.isArray(result.coeffs)) {
            steps += `<div class="step-formula">Koefisien: [${result.coeffs.map(c => c.toFixed(4)).join(', ')}]</div>`;
        } else {
            steps += `<div class="step-formula">Koefisien: ${JSON.stringify(result.coeffs)}</div>`;
        }
        steps += '</div>';
        
        return steps;
    }
}

function generateSSESteps(data, predictFunc) {
    let steps = '<div class="step-item"><div class="step-label">Langkah 1: Hitung Error Setiap Titik</div>';
    let sse = 0;
    
    data.slice(0, 3).forEach((p, i) => {
        const pred = predictFunc(p.x);
        const error = p.y - pred;
        const errorSq = error * error;
        sse += errorSq;
        
        steps += `<div class="step-formula">e${i+1} = y${i+1} - ŷ${i+1} = ${p.y.toFixed(2)} - ${pred.toFixed(2)} = ${error.toFixed(4)}</div>`;
        steps += `<div class="step-formula">e${i+1}² = ${errorSq.toFixed(4)}</div>`;
    });
    
    if (data.length > 3) {
        steps += `<div class="step-formula">... (${data.length - 3} data lainnya)</div>`;
    }
    
    steps += '</div>';
    steps += `
        <div class="step-item">
            <div class="step-label">Langkah 2: Jumlahkan Kuadrat Error</div>
            <div class="step-formula">SSE = Σ(yᵢ - ŷᵢ)²</div>
            <div class="step-formula">SSE = e₁² + e₂² + ... + eₙ²</div>
        </div>
    `;
    
    return steps;
}

function generateR2Steps(metrics, data) {
    const meanY = data.reduce((sum, p) => sum + p.y, 0) / data.length;
    const sst = data.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
    
    return `
        <div class="step-item">
            <div class="step-label">Langkah 1: Hitung Rata-rata Y</div>
            <div class="step-formula">ȳ = ΣY / n = ${meanY.toFixed(4)}</div>
        </div>
        <div class="step-item">
            <div class="step-label">Langkah 2: Hitung SST (Total Sum of Squares)</div>
            <div class="step-formula">SST = Σ(yᵢ - ȳ)²</div>
            <div class="step-formula">SST = ${sst.toFixed(4)}</div>
        </div>
        <div class="step-item">
            <div class="step-label">Langkah 3: Hitung R²</div>
            <div class="step-formula">R² = 1 - (SSE / SST)</div>
            <div class="step-formula">R² = 1 - (${metrics.sse.toFixed(4)} / ${sst.toFixed(4)})</div>
            <div class="step-formula">R² = ${metrics.r2.toFixed(4)}</div>
        </div>
        <div class="step-item">
            <div class="step-label">Interpretasi</div>
            <div class="step-formula">${metrics.r2 > 0.9 ? 'Sangat Baik (>0.9)' : metrics.r2 > 0.7 ? 'Baik (0.7-0.9)' : 'Cukup (<0.7)'}</div>
        </div>
    `;
}

function generateRMSESteps(metrics, data) {
    return `
        <div class="step-item">
            <div class="step-label">Langkah 1: Gunakan SSE</div>
            <div class="step-formula">SSE = ${metrics.sse.toFixed(4)}</div>
        </div>
        <div class="step-item">
            <div class="step-label">Langkah 2: Hitung RMSE</div>
            <div class="step-formula">RMSE = √(SSE / n)</div>
            <div class="step-formula">RMSE = √(${metrics.sse.toFixed(4)} / ${data.length})</div>
            <div class="step-formula">RMSE = ${metrics.rmse.toFixed(4)}</div>
        </div>
        <div class="step-item">
            <div class="step-label">Arti</div>
            <div class="step-formula">Rata-rata error dalam satuan Y</div>
        </div>
    `;
}

function generateMaxErrorSteps(data, predictFunc) {
    let maxErr = 0;
    let maxPoint = null;
    
    data.forEach(p => {
        const pred = predictFunc(p.x);
        const err = Math.abs(p.y - pred);
        if (err > maxErr) {
            maxErr = err;
            maxPoint = p;
        }
    });
    
    const pred = predictFunc(maxPoint.x);
    
    return `
        <div class="step-item">
            <div class="step-label">Langkah 1: Cari Error Terbesar</div>
            <div class="step-formula">Periksa setiap titik data</div>
        </div>
        <div class="step-item">
            <div class="step-label">Langkah 2: Titik dengan Error Maksimum</div>
            <div class="step-formula">X = ${maxPoint.x.toFixed(2)}, Y_aktual = ${maxPoint.y.toFixed(2)}</div>
            <div class="step-formula">Y_prediksi = ${pred.toFixed(2)}</div>
            <div class="step-formula">Error = |${maxPoint.y.toFixed(2)} - ${pred.toFixed(2)}| = ${maxErr.toFixed(4)}</div>
        </div>
    `;
}

// ============ UPDATE CHART WITH FITTING ============

function updateChartWithFitting(result) {
    const xValues = dataPoints.map(p => p.x);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const xRange = xMax - xMin;
    
    const fittingPoints = [];
    const numPoints = 200;
    for (let i = 0; i <= numPoints; i++) {
        const x = xMin - xRange * 0.1 + (xRange * 1.2 * i / numPoints);
        fittingPoints.push({ x: x, y: result.predict(x) });
    }
    
    const yValues = dataPoints.map(p => p.y);
    const yMin = Math.min(...yValues, ...fittingPoints.map(p => p.y));
    const yMax = Math.max(...yValues, ...fittingPoints.map(p => p.y));
    const yPadding = (yMax - yMin) * 0.2 || 1;
    const xPadding = xRange * 0.2 || 1;
    
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
                    backgroundColor: 'rgba(44, 62, 80, 0.8)',
                    borderColor: 'rgba(44, 62, 80, 1)',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    type: 'scatter'
                },
                {
                    label: `${result.type} Fitting`,
                    data: fittingPoints,
                    backgroundColor: 'rgba(192, 57, 43, 0)',
                    borderColor: 'rgba(192, 57, 43, 1)',
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
                    type: 'linear',
                    title: { display: true, text: 'X', font: { size: 14, weight: 'bold' } },
                    min: xMin - xPadding,
                    max: xMax + xPadding,
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                },
                y: {
                    title: { display: true, text: 'Y', font: { size: 14, weight: 'bold' } },
                    min: yMin - yPadding,
                    max: yMax + yPadding,
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                }
            },
            plugins: {
                legend: { display: true, position: 'top' },
                title: { display: true, text: `Curve Fitting: ${result.type}`, font: { size: 16, weight: 'bold' } },
                zoom: {
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'xy'
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy'
                    }
                }
            }
        }
    });
}