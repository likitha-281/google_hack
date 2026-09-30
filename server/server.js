/**
 * VayuDrishti (वायु दृष्टि) - Core Application Server
 * AI-Powered Federated Climate Action & Hyper-Local Air Quality Platform
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
// NOTE: CORS is wide-open for local hackathon demo; lock down origin in prod:
// app.use(cors({ origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000' }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO (Security): Add helmet() and express-rate-limit before exposing to public IP
// const helmet = require('helmet');
// app.use(helmet());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client')));

// Serve uploaded citizen evidence photos
// REPLACEMENT: In production AWS/GCP deployment, swap local disk storage for S3 / Google Cloud Storage bucket
app.use('/uploads', express.static(uploadsDir));

// API router
// IMPROVEMENT: Can split into /api/v1 prefix once breaking changes are planned
app.use('/api', apiRoutes);

// System healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'VayuDrishti Climate Resilience Grid',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    features: [
      'Hyper-local IoT anomaly detection',
      'Satellite Tropospheric NO2 / AOD ingestion',
      'Economic corridor diurnal spike forecasting',
      'Federated Learning cross-state consensus (FedAvg)',
      'Automated flying squad dispatch'
    ]
  });
});

// Fallback for SPA routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    return res.sendFile(path.join(__dirname, '../client/index.html'));
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[VayuDrishti Error]:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log('===========================================================');
  console.log('  🌿 VAYU DRISHTI (वायु दृष्टि) - CLIMATE ACTION PLATFORM');
  console.log('  Federated Hyper-Local Air Quality Resilience Grid');
  console.log('===========================================================');
  console.log(`  -> Server running locally at:  http://localhost:${PORT}`);
  console.log(`  -> Live Dashboard:            http://localhost:${PORT}`);
  console.log(`  -> REST API base:             http://localhost:${PORT}/api`);
  console.log(`  -> Multi-State Federated Hub: Active [DPCC, PPCB, HSPCB, UPPCB, MPCB]`);
  console.log('===========================================================');
});
