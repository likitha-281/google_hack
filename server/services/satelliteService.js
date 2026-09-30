/**
 * Satellite Ingestion & Geospatial Dispersion Engine
 * Simulates Sentinel-5P (TROPOMI) tropospheric column NO2/SO2 and INSAT-3DR / VIIRS thermal alerts.
 * Integrates real-time meteorological wind fields to model downwind smoke transport.
 */

// Bounding box for North & West India economic core [latMin, lngMin, latMax, lngMax]
const MONITORED_BBOX = {
  latMin: 18.0,
  lngMin: 72.0,
  latMax: 32.5,
  lngMax: 82.0
};

/**
 * REPLACEMENT / INTEGRATION NOTE:
 * In a production deployment:
 * - Replace mock VIIRS/MODIS fire detections with NASA FIRMS API (https://firms.modaps.eosdis.nasa.gov/api)
 * - Ingest 15-minute INSAT-3DR AOD rasters from ISRO MOSDAC / Bhuvan portal
 * - For European Space Agency Sentinel-5P L2 data, use Copernicus Data Space Ecosystem API (OData)
 * 
 * For this hackathon solution, we serve calibrated spatiotemporal anomalies over the Punjab-Haryana-NCR belt.
 */

/**
 * Returns active satellite thermal anomalies (crop fires, flaring, major industrial boilers)
 */
function getActiveThermalAnomalies() {
  return [
    {
      satellite: "VIIRS-SNPP",
      acquisitionTime: "2026-09-30T14:20:00Z",
      coordinates: [30.2435, 75.8390],
      district: "Sangrur",
      state: "Punjab",
      confidence: "high",
      frpMegaWatts: 48.2, // Fire Radiative Power
      plumeCategory: "Agricultural Stubble",
      aodIndex: 1.15
    },
    {
      satellite: "MODIS-Aqua",
      acquisitionTime: "2026-09-30T13:45:00Z",
      coordinates: [30.1200, 75.5400],
      district: "Bathinda",
      state: "Punjab",
      confidence: "nominal",
      frpMegaWatts: 34.0,
      plumeCategory: "Agricultural Stubble",
      aodIndex: 0.98
    },
    {
      satellite: "Sentinel-5P",
      acquisitionTime: "2026-09-30T15:10:00Z",
      coordinates: [28.6975, 77.1640],
      district: "North-West Delhi",
      state: "Delhi",
      confidence: "high",
      troposphericNO2_umol: 182.4,
      plumeCategory: "Industrial Pyrolysis / Smelting",
      aodIndex: 0.82
    },
    {
      satellite: "Sentinel-5P",
      acquisitionTime: "2026-09-30T15:10:00Z",
      coordinates: [29.3909, 76.9635],
      district: "Panipat",
      state: "Haryana",
      confidence: "high",
      troposphericNO2_umol: 145.0,
      plumeCategory: "Refinery & Synthetic Dye Corridor",
      aodIndex: 0.74
    }
  ];
}

/**
 * Computes plume drift trajectory given emission point, wind speed, and direction
 * Used to predict which residential areas or highways will be suffocated next.
 */
function predictDownwindImpact(sourceLat, sourceLng, windSpeedKmh, windDirectionDegree, hours = 12) {
  // Convert meteorological wind direction (direction wind is coming from) to drift direction (where it blows to)
  const driftRadian = ((windDirectionDegree + 180) % 360) * (Math.PI / 180);
  
  // Approximate conversion: 1 degree latitude ~ 111 km
  const kmPerLat = 111.0;
  const kmPerLng = 111.0 * Math.cos(sourceLat * (Math.PI / 180));

  const path = [];
  const distanceKm = windSpeedKmh * hours;

  for (let t = 1; t <= 4; t++) {
    const fraction = t / 4;
    const currentDist = distanceKm * fraction;
    
    // Simple Gaussian dispersion displacement
    const deltaLat = (currentDist * Math.cos(driftRadian)) / kmPerLat;
    const deltaLng = (currentDist * Math.sin(driftRadian)) / kmPerLng;

    path.push({
      afterHours: t * (hours / 4),
      coordinates: [
        parseFloat((sourceLat + deltaLat).toFixed(4)),
        parseFloat((sourceLng + deltaLng).toFixed(4))
      ],
      estimatedDispersionRadiusKm: Math.round(3.5 + currentDist * 0.18),
      attenuationFactor: parseFloat((1 / (1 + currentDist * 0.04)).toFixed(2))
    });
  }

  return path;
}

/**
 * Evaluates whether an on-ground citizen report correlates with orbital satellite observations
 */
function verifyWithSatellite(lat, lng) {
  const anomalies = getActiveThermalAnomalies();
  let bestMatch = null;
  let minDistanceKm = 9999;

  for (const anomaly of anomalies) {
    const [aLat, aLng] = anomaly.coordinates;
    // Haversine approximation
    const dLat = (aLat - lat) * 111;
    const dLng = (aLng - lng) * 111 * Math.cos(lat * (Math.PI / 180));
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);

    if (dist < minDistanceKm) {
      minDistanceKm = dist;
      bestMatch = anomaly;
    }
  }

  const isCorroborated = minDistanceKm <= 25.0; // Within 25 km orbital sensor resolution
  return {
    isCorroborated,
    closestOrbitalAnomaly: bestMatch,
    distanceKm: parseFloat(minDistanceKm.toFixed(1)),
    confidenceScore: isCorroborated ? Math.max(0.75, 1 - (minDistanceKm / 40)) : 0.45
  };
}

module.exports = {
  MONITORED_BBOX,
  getActiveThermalAnomalies,
  predictDownwindImpact,
  verifyWithSatellite
};
