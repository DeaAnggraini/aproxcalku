// ========================================
// DISCRETE LEAST SQUARES CALCULATIONS
// ========================================

// ============ HELPER FUNCTIONS ============

// Faktorial
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Gaussian Elimination untuk sistem linear
function gaussianElimination(A, b) {
    const n = A.length;
    const augmented = A.map((row, i) => [...row, b[i]]);
    
    // Forward elimination dengan partial pivoting
    for (let i = 0; i < n; i++) {
        // Cari baris dengan elemen terbesar
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                maxRow = k;
            }
        }
        
        // Tukar baris
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
        
        // Eliminasi
        for (let k = i + 1; k < n; k++) {
            const factor = augmented[k][i] / augmented[i][i];
            for (let j = i; j <= n; j++) {
                augmented[k][j] -= factor * augmented[i][j];
            }
        }
    }
    
    // Back substitution
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = augmented[i][n];
        for (let j = i + 1; j < n; j++) {
            x[i] -= augmented[i][j] * x[j];
        }
        x[i] /= augmented[i][i];
    }
    
    return x;
}

// ============ LINEAR LEAST SQUARES ============

function calculateLinear(dataPoints) {
    const n = dataPoints.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    dataPoints.forEach(p => {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumX2 += p.x * p.x;
    });
    
    const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - a * sumX) / n;
    
    return {
        coeffs: [b, a],
        equation: `y = ${a.toFixed(4)}x ${b >= 0 ? '+' : ''} ${b.toFixed(4)}`,
        predict: (x) => a * x + b,
        type: 'Linear'
    };
}

// ============ POLYNOMIAL LEAST SQUARES ============

function calculatePolynomial(dataPoints, degree) {
    const n = dataPoints.length;
    const A = [];
    const b = [];
    
    // Build matrix A dan vector b
    for (let i = 0; i <= degree; i++) {
        const row = [];
        for (let j = 0; j <= degree; j++) {
            let sum = 0;
            dataPoints.forEach(p => {
                sum += Math.pow(p.x, i + j);
            });
            row.push(sum);
        }
        A.push(row);
        
        let sumY = 0;
        dataPoints.forEach(p => {
            sumY += p.y * Math.pow(p.x, i);
        });
        b.push(sumY);
    }
    
    const coeffs = gaussianElimination(A, b);
    
    // Build equation string
    let equation = 'y = ';
    coeffs.forEach((c, i) => {
        if (i === 0) {
            equation += c.toFixed(4);
        } else {
            const sign = c >= 0 ? ' + ' : ' - ';
            const absC = Math.abs(c).toFixed(4);
            if (i === 1) {
                equation += `${sign}${absC}x`;
            } else {
                equation += `${sign}${absC}x^${i}`;
            }
        }
    });
    
    const typeName = degree === 2 ? 'Quadratic' : 
                     degree === 3 ? 'Cubic' : 
                     `Polynomial deg-${degree}`;
    
    return {
        coeffs,
        equation,
        predict: (x) => {
            let result = 0;
            coeffs.forEach((c, i) => {
                result += c * Math.pow(x, i);
            });
            return result;
        },
        type: typeName
    };
}

// ============ CHEBYSHEV POLYNOMIAL ============

function chebyshevT(n, x) {
    if (n === 0) return 1;
    if (n === 1) return x;
    return 2 * x * chebyshevT(n - 1, x) - chebyshevT(n - 2, x);
}

function calculateChebyshev(dataPoints, degree) {
    const xMin = Math.min(...dataPoints.map(p => p.x));
    const xMax = Math.max(...dataPoints.map(p => p.x));
    
    // Transform ke [-1, 1]
    const transform = (x) => 2 * (x - xMin) / (xMax - xMin) - 1;
    
    const transformedData = dataPoints.map(p => ({
        x: transform(p.x),
        y: p.y
    }));
    
    // Hitung koefisien Chebyshev
    const coeffs = [];
    for (let k = 0; k <= degree; k++) {
        let sum = 0;
        transformedData.forEach(p => {
            sum += p.y * chebyshevT(k, p.x);
        });
        coeffs.push((2 / transformedData.length) * sum);
    }
    coeffs[0] /= 2;
    
    // Build equation
    let equation = 'y = ';
    coeffs.forEach((c, i) => {
        if (i === 0) {
            equation += c.toFixed(4);
        } else {
            const sign = c >= 0 ? ' + ' : ' - ';
            equation += `${sign}${Math.abs(c).toFixed(4)}T${i}(x)`;
        }
    });
    
    return {
        coeffs,
        equation,
        predict: (x) => {
            const t = transform(x);
            let result = 0;
            coeffs.forEach((c, i) => {
                result += c * chebyshevT(i, t);
            });
            return result;
        },
        type: 'Chebyshev'
    };
}

// ============ FOURIER APPROXIMATION ============

function calculateFourier(dataPoints, nTerms) {
    const n = dataPoints.length;
    
    const xMin = Math.min(...dataPoints.map(p => p.x));
    const xMax = Math.max(...dataPoints.map(p => p.x));
    const period = xMax - xMin;
    
    // Transform ke [0, 2π]
    const transform = (x) => 2 * Math.PI * (x - xMin) / period;
    
    const transformedData = dataPoints.map(p => ({
        x: transform(p.x),
        y: p.y
    }));
    
    // Hitung koefisien Fourier
    const a = [0];
    const b = [0];
    
    // a0
    transformedData.forEach(p => {
        a[0] += p.y;
    });
    a[0] *= (2 / n);
    
    // an, bn
    for (let k = 1; k <= nTerms; k++) {
        let ak = 0, bk = 0;
        transformedData.forEach(p => {
            ak += p.y * Math.cos(k * p.x);
            bk += p.y * Math.sin(k * p.x);
        });
        a.push((2 / n) * ak);
        b.push((2 / n) * bk);
    }
    
    // Build equation
    let equation = `y = ${(a[0]/2).toFixed(3)}`;
    for (let k = 1; k <= nTerms; k++) {
        if (Math.abs(a[k]) > 0.001) {
            equation += ` ${a[k] >= 0 ? '+' : ''}${a[k].toFixed(3)}cos(${k}x)`;
        }
        if (Math.abs(b[k]) > 0.001) {
            equation += ` ${b[k] >= 0 ? '+' : ''}${b[k].toFixed(3)}sin(${k}x)`;
        }
    }
    
    return {
        coeffs: { a, b },
        equation,
        predict: (x) => {
            const t = transform(x);
            let result = a[0] / 2;
            for (let k = 1; k <= nTerms; k++) {
                result += a[k] * Math.cos(k * t) + b[k] * Math.sin(k * t);
            }
            return result;
        },
        type: 'Fourier'
    };
}

// ============ ERROR METRICS ============

function calculateMetrics(dataPoints, predictFunc) {
    let sse = 0;
    let sst = 0;
    const meanY = dataPoints.reduce((sum, p) => sum + p.y, 0) / dataPoints.length;
    let maxError = 0;
    
    dataPoints.forEach(p => {
        const predicted = predictFunc(p.x);
        const error = p.y - predicted;
        sse += error * error;
        sst += (p.y - meanY) * (p.y - meanY);
        maxError = Math.max(maxError, Math.abs(error));
    });
    
    const r2 = 1 - (sse / sst);
    const rmse = Math.sqrt(sse / dataPoints.length);
    
    return { sse, r2, rmse, maxError };
}