/**
 * Hotspot & Sensor Telemetry Controller
 * Manages hyper-local pollution anomalies, micro-sensor streams, and economic corridors.
 */

let hotspotsData = require('../data/hotspots.json');
const sensorStations = require('../data/sensorStations.json');
const corridorsData = require('../data/corridors.json');
const { computeCompositeAQI } = require('../services/aqiEngine');
const { getActiveThermalAnomalies } = require('../services/satelliteService');
const { getAllCorridorForecasts } = require('../services/corridorForecaster');

// Cache sensor readings with computed AQI
function getEnrichedSensors() {
  return sensorStations.map(sensor => {
    const aqiDetails = computeCompositeAQI({
      pm25: sensor.pm25,
      pm10: sensor.pm10,
      no2: sensor.no2,
      so2: sensor.so2,
      co: sensor.co
    });

    return {
      ...sensor,
      aqiDetails
    };
  });
}

/**
 * GET /api/hotspots
 * Lists detected pollution hotspots with optional query filtering
 */
function getHotspots(req, res) {
  try {
    const { severity, state, category } = req.query;
    let results = [...hotspotsData];

    if (severity) {
      results = results.filter(h => h.severity.toLowerCase() === severity.toLowerCase());
    }
    if (state) {
      results = results.filter(h => h.state.toLowerCase() === state.toLowerCase());
    }
    if (category) {
      results = results.filter(h => h.category.toLowerCase() === category.toLowerCase());
    }

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/hotspots/:id
 * Detailed profile of a specific hotspot including associated sensor & satellite confirmation
 */
function getHotspotById(req, res) {
  try {
    const hotspot = hotspotsData.find(h => h.id === req.params.id);
    if (!hotspot) {
      return res.status(404).json({ success: false, message: "Hotspot not found" });
    }

    const nearestSensor = sensorStations.find(s => s.id === hotspot.nearestSensorId);

    res.json({
      success: true,
      data: {
        ...hotspot,
        nearestSensor: nearestSensor ? {
          id: nearestSensor.id,
          name: nearestSensor.name,
          pm25: nearestSensor.pm25,
          aqi: computeCompositeAQI(nearestSensor).aqi
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/sensors
 * Real-time low-cost IoT sensor stations with computed CPCB NAQI
 */
function getSensors(req, res) {
  try {
    const enriched = getEnrichedSensors();
    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/corridors
 * Major economic corridors with 24-hr spike forecasts and risk classifications
 */
function getCorridors(req, res) {
  try {
    const forecasts = getAllCorridorForecasts();
    res.json({
      success: true,
      count: forecasts.length,
      data: forecasts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/satellite/thermal
 * Satellite thermal anomalies (VIIRS/MODIS fire alerts)
 */
function getThermalAnomalies(req, res) {
  try {
    const anomalies = getActiveThermalAnomalies();
    res.json({
      success: true,
      count: anomalies.length,
      data: anomalies
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getHotspots,
  getHotspotById,
  getSensors,
  getCorridors,
  getThermalAnomalies
};
