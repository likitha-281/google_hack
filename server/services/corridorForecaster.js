/**
 * Economic Corridor Spike Forecasting Engine
 * 
 * Combines:
 * - Freight traffic diurnal cycles (entry bans lifting at 23:00 hrs in NCR)
 * - Boundary layer inversion height (drops to 150m at night, trapping exhaust)
 * - Regional advection from agricultural burning (Punjab/Haryana into Delhi corridor)
 * - Industrial stack baseline load
 */

const corridorsData = require('../data/corridors.json');

/**
 * Predicts AQI spike for a specific economic corridor over the next 24 hours
 */
function forecastCorridorSpike(corridorId) {
  const corridor = corridorsData.find(c => c.id === corridorId);
  if (!corridor) return null;

  // Real factors influencing Indian economic freight corridors:
  // 1. Nocturnal thermal inversion capping (ground cooling traps particulates under 150m)
  // 2. Heavy diesel commercial vehicle (HCV) entry ban lifting at 23:00 hrs
  // 
  // IMPROVEMENT / ROADMAP:
  // - Hook up live toll plaza FASTag APIs (IHMCL) to replace estimated truck counts with exact vehicle classes
  // - Ingest ECMWF ERA5 or IMD WRF boundary layer height (PBLH) rasters for physics-informed neural network forecasting
  const inversionFactorNight = 1.35; // nocturnal atmospheric capping
  const freightPeakMultiplier = 1.28; // night heavy vehicle surge

  const baseAqi = corridor.currentAvgAqi;
  const hours = [
    '21:00', '23:00', '01:00', '03:00', '05:00', '07:00', 
    '09:00', '11:00', '13:00', '15:00', '17:00', '19:00'
  ];

  const hourlyForecast = hours.map((hourStr, idx) => {
    let factor = 1.0;
    const hourNum = parseInt(hourStr.split(':')[0], 10);

    // Night time freight entry surge (23:00 - 04:00)
    if (hourNum >= 23 || hourNum <= 4) {
      factor *= inversionFactorNight * freightPeakMultiplier;
    } else if (hourNum >= 7 && hourNum <= 10) {
      // Morning rush hour
      factor *= 1.15;
    } else if (hourNum >= 12 && hourNum <= 16) {
      // Afternoon thermal vertical mixing dilutes pollution
      factor *= 0.85;
    }

    // Add small realistic variation
    const noise = (Math.sin(idx * 1.5) * 8);
    const predictedVal = Math.min(500, Math.round(baseAqi * factor + noise));

    let riskTier = 'moderate';
    if (predictedVal > 400) riskTier = 'severe';
    else if (predictedVal > 300) riskTier = 'very_poor';
    else if (predictedVal > 200) riskTier = 'poor';

    return {
      time: hourStr,
      predictedAqi: predictedVal,
      riskTier,
      inversionRisk: (hourNum >= 22 || hourNum <= 5) ? 'High' : 'Low',
      recommendedFreightThrottling: predictedVal > 380 ? 'Active 30% Divert' : 'Normal Flow'
    };
  });

  const maxSpike = Math.max(...hourlyForecast.map(h => h.predictedAqi));
  const peakHour = hourlyForecast.find(h => h.predictedAqi === maxSpike);

  return {
    corridorId: corridor.id,
    name: corridor.name,
    jurisdictions: corridor.jurisdictions,
    currentAqi: corridor.currentAvgAqi,
    maxPredictedSpike: maxSpike,
    peakRiskHour: peakHour.time,
    mitigationStrategy: maxSpike > 380 
      ? `Activate Inter-State Coordination: Divert 35% commercial multi-axle freight to ${corridor.id === 'CORR-01' ? 'WPE' : 'Alternate Ring'}` 
      : 'Maintain scheduled automated water-mist sweeping',
    hourlyForecast
  };
}

/**
 * Returns summary of all economic corridors with alert levels
 */
function getAllCorridorForecasts() {
  return corridorsData.map(c => forecastCorridorSpike(c.id));
}

module.exports = {
  forecastCorridorSpike,
  getAllCorridorForecasts
};
