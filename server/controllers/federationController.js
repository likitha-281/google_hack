/**
 * Federated Learning & Inter-State Coordination Controller
 * Coordinates edge model synchronization across state pollution control boards.
 */

const { getFederationMeshStatus, triggerFederatedSync } = require('../services/federatedAggregator');

/**
 * GET /api/federation/mesh
 * Inspects all state edge nodes and global model convergence
 */
function getMesh(req, res) {
  try {
    const status = getFederationMeshStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/federation/sync
 * Triggers a federated averaging synchronization round
 */
function runSync(req, res) {
  try {
    const result = triggerFederatedSync();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getMesh,
  runSync
};
