/**
 * Rapid Intervention & Enforcement Alert Controller
 */

const { getActiveInterventions, dispatchIntervention, updateInterventionStatus } = require('../services/alertDispatcher');
let hotspotsData = require('../data/hotspots.json');

/**
 * GET /api/alerts
 * Lists active authority interventions
 */
function getAlerts(req, res) {
  try {
    const alerts = getActiveInterventions();
    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/alerts/dispatch
 * Dispatches a flying squad or statutory enforcement action for a hotspot
 */
function createDispatch(req, res) {
  try {
    const { hotspotId, notes } = req.body;
    const hotspot = hotspotsData.find(h => h.id === hotspotId);

    if (!hotspot) {
      return res.status(404).json({ success: false, message: "Hotspot not found" });
    }

    const ticket = dispatchIntervention(hotspot, notes);
    hotspot.status = "alert_dispatched";
    hotspot.dispatchedSquad = ticket.dispatchedUnit;

    res.status(201).json({
      success: true,
      message: `Rapid intervention dispatched to ${ticket.targetAuthority}. Squad unit: ${ticket.dispatchedUnit}`,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * PATCH /api/alerts/:ticketId/status
 * Updates resolution lifecycle status of an intervention ticket
 */
function changeStatus(req, res) {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const updated = updateInterventionStatus(ticketId, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Intervention ticket not found" });
    }

    res.json({
      success: true,
      message: `Ticket ${ticketId} status updated to ${status}`,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getAlerts,
  createDispatch,
  changeStatus
};
