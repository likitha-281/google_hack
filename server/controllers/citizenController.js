/**
 * Citizen Crowdsourcing & Ground Intelligence Controller
 * Enables citizens across Indian cities to report hyper-local pollution
 * with geo-tagged photos and local micro-sensor observations.
 */

const { analyzeCitizenEvidence } = require('../services/citizenVisionMock');
const { verifyWithSatellite } = require('../services/satelliteService');
let hotspotsData = require('../data/hotspots.json');

// In-memory store for citizen crowdsourced submissions
let citizenReports = [
  {
    id: "REP-2026-901",
    citizenAlias: "Priya_NCR_Breathe",
    category: "industrial_emission",
    description: "Thick yellow acrid smoke releasing continuously from unmonitored chimney behind metal plating lane.",
    city: "Delhi",
    state: "Delhi",
    coordinates: [28.6975, 77.1640],
    photoUrl: "/uploads/sample_wazirpur_smoke.jpg",
    aiVisionAnalysis: {
      verified: true,
      plumeColor: "Dark Grey / Black",
      opacityPercentage: 88,
      toxicityIndex: "High (SO2, Metallic Slag Aerosols)",
      confidenceScore: 0.94,
      estimatedMicroSpikePm25: "+140 µg/m³ within 500m radius"
    },
    satelliteCorroborated: true,
    status: "verified",
    submittedAt: "2026-09-30T18:30:00Z"
  },
  {
    id: "REP-2026-902",
    citizenAlias: "Harpreet_Sangrur",
    category: "agricultural_burning",
    description: "Large scale evening burning in adjacent 40-acre farm plot; smoke blowing towards state highway.",
    city: "Sangrur",
    state: "Punjab",
    coordinates: [30.2435, 75.8390],
    photoUrl: "/uploads/sample_stubble_burn.jpg",
    aiVisionAnalysis: {
      verified: true,
      plumeColor: "Dense Yellowish-White / Straw Haze",
      opacityPercentage: 85,
      toxicityIndex: "Moderate (High VOC / CO)",
      confidenceScore: 0.96,
      estimatedMicroSpikePm25: "+175 µg/m³ within 500m radius"
    },
    satelliteCorroborated: true,
    status: "verified",
    submittedAt: "2026-09-30T17:10:00Z"
  },
  {
    id: "REP-2026-903",
    citizenAlias: "Amit_Mundka_Resident",
    category: "waste_burning",
    description: "Illegal plastic wire casing burn in open plot near industrial drain.",
    city: "Delhi",
    state: "Delhi",
    coordinates: [28.6845, 77.0305],
    photoUrl: "/uploads/sample_plastic_smoke.jpg",
    aiVisionAnalysis: {
      verified: true,
      plumeColor: "Pitch Black / Acrid Rubber Smoke",
      opacityPercentage: 92,
      toxicityIndex: "Critical (Dioxins & Furans / Heavy Carbon)",
      confidenceScore: 0.95,
      estimatedMicroSpikePm25: "+210 µg/m³ within 500m radius"
    },
    satelliteCorroborated: false,
    status: "verified",
    submittedAt: "2026-09-30T19:15:00Z"
  }
];

/**
 * GET /api/citizen/reports
 * Lists all crowdsourced pollution reports
 */
function getReports(req, res) {
  res.json({
    success: true,
    count: citizenReports.length,
    data: citizenReports
  });
}

/**
 * POST /api/citizen/report
 * Submits citizen report with photo evidence and GPS location
 */
function submitReport(req, res) {
  try {
    const { citizenAlias, category, description, city, state, latitude, longitude } = req.body;

    const lat = parseFloat(latitude) || 28.6139;
    const lng = parseFloat(longitude) || 77.2090;

    // AI Computer Vision heuristic evaluation
    const visionResult = analyzeCitizenEvidence(req.file, category);

    // Cross-check with orbital satellite data
    const satelliteCheck = verifyWithSatellite(lat, lng);

    const reportId = `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : "/uploads/sample_placeholder.jpg";

    const newReport = {
      id: reportId,
      citizenAlias: citizenAlias || "Anonymous Eco-Warrior",
      category: category || "industrial_emission",
      description: description || "Citizen reported air pollution hotspot",
      city: city || "Delhi-NCR",
      state: state || "Delhi",
      coordinates: [lat, lng],
      photoUrl,
      aiVisionAnalysis: visionResult,
      satelliteCorroborated: satelliteCheck.isCorroborated,
      satelliteDetail: satelliteCheck.closestOrbitalAnomaly,
      status: "verified",
      submittedAt: new Date().toISOString()
    };

    citizenReports.unshift(newReport);

    // If severe, automatically register as a new candidate hotspot
    if (visionResult.requiresImmediateDispatch) {
      const candidateHotspot = {
        id: `HSP-2026-NEW-${Math.floor(100 + Math.random() * 900)}`,
        title: `Crowdsourced Alert: ${category.replace('_', ' ').toUpperCase()}`,
        locationName: `${city || 'NCR'} Cluster near [${lat.toFixed(3)}, ${lng.toFixed(3)}]`,
        city: city || "Delhi",
        state: state || "Delhi",
        coordinates: [lat, lng],
        category: category || "industrial_emission",
        severity: "critical",
        aiConfidence: visionResult.confidenceScore,
        detectedVia: ["citizen_photo", "ai_vision_model"],
        summary: description || "Immediate intervention triggered via high opacity citizen report.",
        citizenReportsCount: 1,
        satelliteAOD: 0.85,
        estimatedEmissionsKgHr: 45.0,
        status: "pending_action",
        dispatchedSquad: null,
        recommendedAction: "Dispatch nearest municipal flying squad and issue inspection challan",
        createdAt: new Date().toISOString()
      };
      hotspotsData.unshift(candidateHotspot);
    }

    res.status(201).json({
      success: true,
      message: "Citizen report verified and logged into climate resilience grid.",
      data: newReport
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getReports,
  submitReport
};
