/**
 * Rapid Intervention & Authority Alert Dispatcher
 * Escalates hyper-local pollution hotspots to relevant state enforcement authorities:
 * - Central Pollution Control Board (CPCB)
 * - State Pollution Control Boards (DPCC, PPCB, HSPCB, UPPCB, MPCB)
 * - Municipal Flying Squads & District Magistrates
 */

let activeInterventions = [
  {
    ticketId: "INT-2026-DEL-102",
    hotspotId: "HSP-2026-081",
    targetAuthority: "Delhi Pollution Control Committee (DPCC)",
    location: "Wazirpur Industrial Area, Group 4, Delhi",
    tier: "Level 3 - Statutory Enforcement",
    actionTaken: "Power feeder disconnection notice dispatched; Joint raid squad mobilized with Delhi Police",
    dispatchedUnit: "DPCC Flying Squad Unit 3",
    status: "dispatched",
    issuedAt: "2026-09-30T19:10:00Z",
    evidenceDossierId: "DOS-DEL-892"
  },
  {
    ticketId: "INT-2026-PUN-048",
    hotspotId: "HSP-2026-082",
    targetAuthority: "Punjab Pollution Control Board (PPCB)",
    location: "Sangrur-Barnala Agri Belt, Field Cluster 12",
    tier: "Level 2 - Rapid Mitigation",
    actionTaken: "Sub-Divisional Magistrate (SDM) alert sent; CRM baler unit allocated to prevent fire spread",
    dispatchedUnit: "PPCB Stubble Taskforce Delta",
    status: "in_progress",
    issuedAt: "2026-09-30T17:45:00Z",
    evidenceDossierId: "DOS-PUN-104"
  },
  {
    ticketId: "INT-2026-HAR-071",
    hotspotId: "HSP-2026-086",
    targetAuthority: "Gurugram Metropolitan Development Authority (GMDA)",
    location: "Dwarka Expressway Corridor, Sector 109",
    tier: "Level 1 - Municipal Abatement",
    actionTaken: "Water sprinkler cannons activated; Contractor served show-cause notice for dust control default",
    dispatchedUnit: "GMDA Anti-Smog Vehicle #12",
    status: "resolved",
    issuedAt: "2026-09-30T18:20:00Z",
    evidenceDossierId: "DOS-HAR-554"
  }
];

/**
 * Returns all active interventions
 */
function getActiveInterventions() {
  return activeInterventions;
}

/**
 * Dispatches a new rapid intervention for a detected hotspot
 */
function dispatchIntervention(hotspot, customNotes) {
  const newTicket = {
    ticketId: `INT-2026-${hotspot.state.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    hotspotId: hotspot.id,
    targetAuthority: `${hotspot.state} Pollution Control Board`,
    location: `${hotspot.locationName}, ${hotspot.city}`,
    tier: hotspot.severity === 'critical' ? 'Level 3 - Statutory Enforcement' : 'Level 2 - Rapid Mitigation',
    actionTaken: customNotes || hotspot.recommendedAction || "Flying squad dispatched for on-site inspection",
    dispatchedUnit: `${hotspot.state.substring(0, 3).toUpperCase()} Rapid Action Unit ${Math.floor(1 + Math.random() * 5)}`,
    status: "dispatched",
    issuedAt: new Date().toISOString(),
    evidenceDossierId: `DOS-${Math.floor(1000 + Math.random() * 9000)}`
  };

  activeInterventions.unshift(newTicket);
  return newTicket;
}

/**
 * Updates status of an intervention ticket (e.g. from dispatched to in_progress to resolved)
 */
function updateInterventionStatus(ticketId, status) {
  const ticket = activeInterventions.find(t => t.ticketId === ticketId);
  if (!ticket) return null;
  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
  return ticket;
}

module.exports = {
  getActiveInterventions,
  dispatchIntervention,
  updateInterventionStatus
};
