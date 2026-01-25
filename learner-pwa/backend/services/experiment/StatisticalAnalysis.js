/**
 * Statistical Analysis Service
 * Provides statistical calculations for research validation
 * Includes t-tests, effect sizes, confidence intervals, and ANOVA
 */

const logger = require('../../utils/logger');

class StatisticalAnalysis {
    /**
     * Calculate mean of an array
     * @param {Array} data - Numeric array
     */
    mean(data) {
        if (!data || data.length === 0) return 0;
        return data.reduce((sum, val) => sum + val, 0) / data.length;
    }

    /**
     * Calculate variance of an array
     * @param {Array} data - Numeric array
     * @param {boolean} sample - Use sample variance (n-1) if true
     */
    variance(data, sample = true) {
        if (!data || data.length < 2) return 0;
        const avg = this.mean(data);
        const squaredDiffs = data.map(val => Math.pow(val - avg, 2));
        const divisor = sample ? data.length - 1 : data.length;
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / divisor;
    }

    /**
     * Calculate standard deviation
     * @param {Array} data - Numeric array
     * @param {boolean} sample - Use sample SD if true
     */
    standardDeviation(data, sample = true) {
        return Math.sqrt(this.variance(data, sample));
    }

    /**
     * Calculate pooled standard deviation for two groups
     * @param {Array} group1 - First group data
     * @param {Array} group2 - Second group data
     */
    pooledStandardDeviation(group1, group2) {
        const n1 = group1.length;
        const n2 = group2.length;
        const var1 = this.variance(group1);
        const var2 = this.variance(group2);

        const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
        return Math.sqrt(pooledVar);
    }

    /**
     * Calculate standard error of the mean
     * @param {Array} data - Numeric array
     */
    standardError(data) {
        return this.standardDeviation(data) / Math.sqrt(data.length);
    }

    /**
     * Perform independent samples t-test
     * @param {Array} group1 - Control group data
     * @param {Array} group2 - Treatment group data
     */
    tTest(group1, group2) {
        const n1 = group1.length;
        const n2 = group2.length;

        if (n1 < 2 || n2 < 2) {
            return {
                error: 'Insufficient sample size',
                tStatistic: null,
                pValue: null,
                degreesOfFreedom: null
            };
        }

        const mean1 = this.mean(group1);
        const mean2 = this.mean(group2);
        const var1 = this.variance(group1);
        const var2 = this.variance(group2);

        // Welch's t-test (unequal variances)
        const se = Math.sqrt(var1 / n1 + var2 / n2);
        const tStatistic = (mean1 - mean2) / se;

        // Welch-Satterthwaite degrees of freedom
        const df = Math.pow(var1 / n1 + var2 / n2, 2) / (
            Math.pow(var1 / n1, 2) / (n1 - 1) +
            Math.pow(var2 / n2, 2) / (n2 - 1)
        );

        // Calculate p-value using t-distribution approximation
        const pValue = this.tDistributionPValue(Math.abs(tStatistic), df);

        return {
            tStatistic,
            pValue,
            degreesOfFreedom: df,
            mean1,
            mean2,
            meanDifference: mean2 - mean1,
            standardError: se,
            significant: pValue < 0.05
        };
    }

    /**
     * Approximate p-value from t-distribution
     * Uses approximation formula for two-tailed test
     * @param {number} t - t-statistic (absolute value)
     * @param {number} df - degrees of freedom
     */
    tDistributionPValue(t, df) {
        // Approximation using normal distribution for large df
        if (df > 100) {
            return 2 * (1 - this.normalCDF(t));
        }

        // Beta function approximation for smaller df
        const x = df / (df + t * t);
        const a = df / 2;
        const b = 0.5;

        // Incomplete beta function approximation
        const betaInc = this.incompleteBeta(x, a, b);
        return betaInc;
    }

    /**
     * Standard normal CDF approximation
     * @param {number} x - z-score
     */
    normalCDF(x) {
        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;

        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x) / Math.sqrt(2);

        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return 0.5 * (1.0 + sign * y);
    }

    /**
     * Incomplete beta function approximation
     * @param {number} x - value
     * @param {number} a - alpha parameter
     * @param {number} b - beta parameter
     */
    incompleteBeta(x, a, b) {
        // Simple approximation using continued fraction
        if (x === 0) return 0;
        if (x === 1) return 1;

        // Use series expansion for small x
        let sum = 0;
        let term = 1;
        for (let n = 0; n < 100; n++) {
            term *= (a + n) * x / (a + b + n);
            sum += term / (a + n + 1);
            if (Math.abs(term) < 1e-10) break;
        }

        return Math.pow(x, a) * sum * this.gamma(a + b) / (this.gamma(a) * this.gamma(b));
    }

    /**
     * Gamma function approximation (Stirling's approximation)
     * @param {number} n - input value
     */
    gamma(n) {
        if (n <= 0) return Infinity;
        if (n < 0.5) {
            return Math.PI / (Math.sin(Math.PI * n) * this.gamma(1 - n));
        }
        n -= 1;
        const g = 7;
        const c = [
            0.99999999999980993,
            676.5203681218851,
            -1259.1392167224028,
            771.32342877765313,
            -176.61502916214059,
            12.507343278686905,
            -0.13857109526572012,
            9.9843695780195716e-6,
            1.5056327351493116e-7
        ];
        let x = c[0];
        for (let i = 1; i < g + 2; i++) {
            x += c[i] / (n + i);
        }
        const t = n + g + 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
    }

    /**
     * Calculate Cohen's d effect size
     * @param {Array} group1 - Control group data
     * @param {Array} group2 - Treatment group data
     */
    effectSize(group1, group2) {
        const mean1 = this.mean(group1);
        const mean2 = this.mean(group2);
        const pooledSD = this.pooledStandardDeviation(group1, group2);

        if (pooledSD === 0) return 0;

        const d = (mean2 - mean1) / pooledSD;

        // Interpret effect size
        let interpretation;
        const absD = Math.abs(d);
        if (absD < 0.2) interpretation = 'negligible';
        else if (absD < 0.5) interpretation = 'small';
        else if (absD < 0.8) interpretation = 'medium';
        else interpretation = 'large';

        return {
            cohensD: d,
            interpretation,
            pooledSD
        };
    }

    /**
     * Calculate confidence interval for mean difference
     * @param {Array} group1 - Control group data
     * @param {Array} group2 - Treatment group data
     * @param {number} confidence - Confidence level (default 0.95)
     */
    confidenceInterval(group1, group2, confidence = 0.95) {
        const mean1 = this.mean(group1);
        const mean2 = this.mean(group2);
        const meanDiff = mean2 - mean1;

        const n1 = group1.length;
        const n2 = group2.length;
        const var1 = this.variance(group1);
        const var2 = this.variance(group2);

        const se = Math.sqrt(var1 / n1 + var2 / n2);

        // t-critical value approximation for 95% CI
        const df = n1 + n2 - 2;
        const tCritical = this.tCriticalValue(confidence, df);

        const marginOfError = tCritical * se;

        return {
            meanDifference: meanDiff,
            lower: meanDiff - marginOfError,
            upper: meanDiff + marginOfError,
            confidence,
            marginOfError,
            standardError: se
        };
    }

    /**
     * Approximate t-critical value
     * @param {number} confidence - Confidence level
     * @param {number} df - Degrees of freedom
     */
    tCriticalValue(confidence, df) {
        // Approximation for common confidence levels
        const alpha = 1 - confidence;

        // For large df, use z-values
        if (df > 100) {
            if (confidence === 0.95) return 1.96;
            if (confidence === 0.99) return 2.576;
            if (confidence === 0.90) return 1.645;
        }

        // Approximation formula
        const a = 1 - alpha / 2;
        const z = this.inverseNormalCDF(a);

        // Cornish-Fisher expansion
        const g1 = (z * z * z + z) / 4;
        const g2 = (5 * Math.pow(z, 5) + 16 * z * z * z + 3 * z) / 96;

        return z + g1 / df + g2 / (df * df);
    }

    /**
     * Inverse normal CDF approximation
     * @param {number} p - probability
     */
    inverseNormalCDF(p) {
        // Rational approximation
        const a = [
            -3.969683028665376e+01,
            2.209460984245205e+02,
            -2.759285104469687e+02,
            1.383577518672690e+02,
            -3.066479806614716e+01,
            2.506628277459239e+00
        ];
        const b = [
            -5.447609879822406e+01,
            1.615858368580409e+02,
            -1.556989798598866e+02,
            6.680131188771972e+01,
            -1.328068155288572e+01
        ];
        const c = [
            -7.784894002430293e-03,
            -3.223964580411365e-01,
            -2.400758277161838e+00,
            -2.549732539343734e+00,
            4.374664141464968e+00,
            2.938163982698783e+00
        ];
        const d = [
            7.784695709041462e-03,
            3.224671290700398e-01,
            2.445134137142996e+00,
            3.754408661907416e+00
        ];

        const pLow = 0.02425;
        const pHigh = 1 - pLow;

        let q, r;

        if (p < pLow) {
            q = Math.sqrt(-2 * Math.log(p));
            return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
                ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
        } else if (p <= pHigh) {
            q = p - 0.5;
            r = q * q;
            return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
                (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
        } else {
            q = Math.sqrt(-2 * Math.log(1 - p));
            return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
                ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
        }
    }

    /**
     * One-way ANOVA for multiple groups
     * @param {Array} groups - Array of group data arrays
     */
    anova(groups) {
        if (groups.length < 2) {
            return { error: 'ANOVA requires at least 2 groups' };
        }

        const k = groups.length; // Number of groups
        const N = groups.reduce((sum, g) => sum + g.length, 0); // Total sample size
        const grandMean = this.mean(groups.flat());

        // Between-group sum of squares (SSB)
        let ssb = 0;
        groups.forEach(group => {
            const groupMean = this.mean(group);
            ssb += group.length * Math.pow(groupMean - grandMean, 2);
        });

        // Within-group sum of squares (SSW)
        let ssw = 0;
        groups.forEach(group => {
            const groupMean = this.mean(group);
            group.forEach(val => {
                ssw += Math.pow(val - groupMean, 2);
            });
        });

        // Degrees of freedom
        const dfBetween = k - 1;
        const dfWithin = N - k;

        // Mean squares
        const msb = ssb / dfBetween;
        const msw = ssw / dfWithin;

        // F-statistic
        const fStatistic = msb / msw;

        // Approximate p-value using F-distribution
        const pValue = this.fDistributionPValue(fStatistic, dfBetween, dfWithin);

        return {
            fStatistic,
            pValue,
            dfBetween,
            dfWithin,
            ssBetween: ssb,
            ssWithin: ssw,
            msBetween: msb,
            msWithin: msw,
            significant: pValue < 0.05,
            groupMeans: groups.map(g => this.mean(g)),
            grandMean
        };
    }

    /**
     * Approximate F-distribution p-value
     * @param {number} f - F-statistic
     * @param {number} df1 - Numerator degrees of freedom
     * @param {number} df2 - Denominator degrees of freedom
     */
    fDistributionPValue(f, df1, df2) {
        // Use beta distribution relationship
        const x = df2 / (df2 + df1 * f);
        return this.incompleteBeta(x, df2 / 2, df1 / 2);
    }

    /**
     * Perform complete analysis for experiment
     * @param {Array} controlData - Control group data
     * @param {Array} treatmentData - Treatment group data
     */
    analyzeExperiment(controlData, treatmentData) {
        const tTestResult = this.tTest(controlData, treatmentData);
        const effectSizeResult = this.effectSize(controlData, treatmentData);
        const ciResult = this.confidenceInterval(controlData, treatmentData);

        return {
            sampleSize: {
                control: controlData.length,
                treatment: treatmentData.length,
                total: controlData.length + treatmentData.length
            },
            descriptive: {
                controlMean: this.mean(controlData),
                controlSD: this.standardDeviation(controlData),
                treatmentMean: this.mean(treatmentData),
                treatmentSD: this.standardDeviation(treatmentData)
            },
            tTest: tTestResult,
            effectSize: effectSizeResult,
            confidenceInterval: ciResult,
            conclusion: this.generateConclusion(tTestResult, effectSizeResult)
        };
    }

    /**
     * Generate human-readable conclusion
     * @param {Object} tTest - t-test results
     * @param {Object} effectSize - Effect size results
     */
    generateConclusion(tTest, effectSize) {
        if (tTest.error) {
            return 'Insufficient data for statistical analysis.';
        }

        const significant = tTest.significant;
        const direction = tTest.meanDifference > 0 ? 'higher' : 'lower';
        const effect = effectSize.interpretation;

        if (significant) {
            return `The treatment group showed statistically significant ${direction} scores ` +
                `(t = ${tTest.tStatistic.toFixed(2)}, p = ${tTest.pValue.toFixed(4)}) ` +
                `with a ${effect} effect size (d = ${effectSize.cohensD.toFixed(2)}).`;
        } else {
            return `No statistically significant difference was found between groups ` +
                `(t = ${tTest.tStatistic.toFixed(2)}, p = ${tTest.pValue.toFixed(4)}).`;
        }
    }
}

module.exports = new StatisticalAnalysis();
