/**
 * VayuDrishti - National Air Quality Index (NAQI) Calculation Engine
 * Based on the Indian Central Pollution Control Board (CPCB) official standard methodology.
 * 
 * AQI = max(sub-index_i) across monitored pollutants (PM2.5, PM10, NO2, SO2, CO)
 * Linear interpolation formula:
 *   I = I_low + [ (I_high - I_low) / (B_high - B_low) ] * (Concentration - B_low)
 */

// CPCB breakpoints table
// [B_low, B_high, I_low, I_high]
const BREAKPOINTS = {
  pm25: [
    [0, 30, 0, 50],
    [31, 60, 51, 100],
    [61, 90, 101, 200],
    [91, 120, 201, 300],
    [121, 250, 301, 400],
    [250, 500, 401, 500]
  ],
  pm10: [
    [0, 50, 0, 50],
    [51, 100, 51, 100],
    [101, 250, 101, 200],
    [251, 350, 201, 300],
    [351, 430, 301, 400],
    [430, 600, 401, 500]
  ],
  no2: [
    [0, 40, 0, 50],
    [41, 80, 51, 100],
    [81, 180, 101, 200],
    [181, 280, 201, 300],
    [281, 400, 301, 400],
    [400, 600, 401, 500]
  ],
  so2: [
    [0, 40, 0, 50],
    [41, 80, 51, 100],
    [81, 380, 101, 200],
    [381, 800, 201, 300],
    [801, 1600, 301, 400],
    [1600, 2000, 401, 500]
  ],
  co: [
    [0, 1.0, 0, 50],
    [1.1, 2.0, 51, 100],
    [2.1, 10.0, 101, 200],
    [10.1, 17.0, 201, 300],
    [17.1, 34.0, 301, 400],
    [34.0, 50.0, 401, 500]
  ]
};

/**
 * Calculates the individual pollutant sub-index
 */
function calculateSubIndex(pollutant, concentration) {
  if (concentration === null || concentration === undefined || concentration < 0) {
    return 0;
  }

  const table = BREAKPOINTS[pollutant];
  if (!table) return 0;

  for (const [bLow, bHigh, iLow, iHigh] of table) {
    if (concentration >= bLow && concentration <= bHigh) {
      const subIndex = ((iHigh - iLow) / (bHigh - bLow)) * (concentration - bLow) + iLow;
      return Math.round(subIndex);
    }
  }

  // If concentration surpasses maximum defined breakpoint bracket
  const lastBracket = table[table.length - 1];
  if (concentration > lastBracket[1]) {
    return 500;
  }

  return 0;
}

/**
 * Computes overall AQI from multi-pollutant readings
 */
function computeCompositeAQI(readings) {
  const subIndices = {};
  let maxSubIndex = 0;
  let dominantPollutant = 'PM2.5';

  const pollutants = ['pm25', 'pm10', 'no2', 'so2', 'co'];
  for (const pol of pollutants) {
    if (readings[pol] !== undefined) {
      const val = calculateSubIndex(pol, readings[pol]);
      subIndices[pol] = val;
      if (val > maxSubIndex) {
        maxSubIndex = val;
        dominantPollutant = pol.toUpperCase();
      }
    }
  }

  const category = getAqiCategory(maxSubIndex);

  return {
    aqi: maxSubIndex,
    dominantPollutant,
    category: category.label,
    colorCode: category.color,
    healthImpact: category.healthImpact,
    subIndices
  };
}

/**
 * Categorizes AQI number into official CPCB 6-tier classification
 */
function getAqiCategory(aqi) {
  if (aqi <= 50) {
    return {
      label: 'Good',
      color: '#10b981',
      badgeClass: 'badge-good',
      healthImpact: 'Minimal air quality impact. Safe for outdoor activities.'
    };
  }
  if (aqi <= 100) {
    return {
      label: 'Satisfactory',
      color: '#84cc16',
      badgeClass: 'badge-satisfactory',
      healthImpact: 'Minor breathing discomfort to sensitive individuals.'
    };
  }
  if (aqi <= 200) {
    return {
      label: 'Moderate',
      color: '#eab308',
      badgeClass: 'badge-moderate',
      healthImpact: 'Breathing discomfort to people with lungs, asthma and heart diseases.'
    };
  }
  if (aqi <= 300) {
    return {
      label: 'Poor',
      color: '#f97316',
      badgeClass: 'badge-poor',
      healthImpact: 'Breathing discomfort to most people on prolonged exposure.'
    };
  }
  if (aqi <= 400) {
    return {
      label: 'Very Poor',
      color: '#ef4444',
      badgeClass: 'badge-very-poor',
      healthImpact: 'Respiratory illness on prolonged exposure. Pronounced effect on children & elderly.'
    };
  }
  return {
    label: 'Severe',
    color: '#7f1d1d',
    badgeClass: 'badge-severe',
    healthImpact: 'Healthy people affected; serious health impacts on those with existing diseases. Emergency measures active.'
  };
}

module.exports = {
  calculateSubIndex,
  computeCompositeAQI,
  getAqiCategory
};
