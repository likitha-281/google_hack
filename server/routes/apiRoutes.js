/**
 * Primary API Route Definitions for VayuDrishti
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

// Controllers
const hotspotController = require('../controllers/hotspotController');
const citizenController = require('../controllers/citizenController');
const federationController = require('../controllers/federationController');
const alertController = require('../controllers/alertController');

// Multer storage configuration for citizen-uploaded evidence photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'evidence-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max upload size
  // IMPROVEMENT: Add fileFilter to strictly enforce image mimetypes in production:
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype) || !file.mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are permitted as photo evidence'), false);
    }
  }
});

// --- Hotspots & Macro Sensors ---
router.get('/hotspots', hotspotController.getHotspots);
router.get('/hotspots/:id', hotspotController.getHotspotById);
router.get('/sensors', hotspotController.getSensors);
router.get('/corridors', hotspotController.getCorridors);
router.get('/satellite/thermal', hotspotController.getThermalAnomalies);

// --- Citizen Crowdsourcing ---
router.get('/citizen/reports', citizenController.getReports);
router.post('/citizen/report', upload.single('photo'), citizenController.submitReport);

// --- Federated Learning Mesh ---
router.get('/federation/mesh', federationController.getMesh);
router.post('/federation/sync', federationController.runSync);

// --- Rapid Authority Interventions ---
router.get('/alerts', alertController.getAlerts);
router.post('/alerts/dispatch', alertController.createDispatch);
router.patch('/alerts/:ticketId/status', alertController.changeStatus);

module.exports = router;
