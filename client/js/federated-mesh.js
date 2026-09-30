/**
 * Federated Learning Mesh & State Coordination Visualizer
 */

class FederatedMesh {
  constructor() {
    this.isSyncing = false;
  }

  init() {
    window.appState.subscribe((event) => {
      if (event === 'FEDERATION_LOADED') {
        this.renderMesh();
      }
    });

    const syncBtn = document.getElementById('trigger-fed-sync-btn');
    if (syncBtn) {
      syncBtn.onclick = () => this.triggerSync();
    }
  }

  renderMesh() {
    const container = document.getElementById('federation-nodes-container');
    const modelStatsEl = document.getElementById('fed-global-stats');
    if (!container || !window.appState.federation) return;

    const { globalModel, regionalNodes, totalTelemetryPoints, activeNodesCount } = window.appState.federation;

    if (modelStatsEl) {
      modelStatsEl.innerHTML = `
        <div style="background: var(--bg-card); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 0.6rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: var(--accent-cyan); font-size: 1rem;">${globalModel.version}</strong>
            <span class="badge badge-satisfactory">Round #${globalModel.currentRound}</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; text-align: center; margin-top: 0.25rem;">
            <div>
              <div style="font-size: 1.15rem; font-weight: 700; color: #10b981;">${globalModel.globalAccuracy}%</div>
              <div style="font-size: 0.68rem; color: var(--text-muted);">Consensus Accuracy</div>
            </div>
            <div>
              <div style="font-size: 1.15rem; font-weight: 700; color: var(--accent-cyan);">${globalModel.globalLoss}</div>
              <div style="font-size: 0.68rem; color: var(--text-muted);">Global Loss</div>
            </div>
            <div>
              <div style="font-size: 1.15rem; font-weight: 700; color: #f59e0b;">${(totalTelemetryPoints / 1000).toFixed(0)}k</div>
              <div style="font-size: 0.68rem; color: var(--text-muted);">Protected Points</div>
            </div>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem;">
            🔒 <strong>Privacy Guarantee:</strong> Differential Privacy (${globalModel.differentialPrivacyBudget}) - No citizen raw photos cross state borders.
          </div>
        </div>
      `;
    }

    container.innerHTML = regionalNodes.map(node => `
      <div class="fed-node-card" id="node-card-${node.nodeId}">
        <div class="fed-node-header">
          <div class="fed-node-agency">🏛️ ${node.agency}</div>
          <span class="badge ${node.status === 'connected' ? 'badge-good' : 'badge-moderate'}">
            ${node.status}
          </span>
        </div>

        <div style="font-size: 0.75rem; color: var(--text-muted);">
          Specialized Task: <span style="color: #cbd5e1;">${node.specializedModel}</span>
        </div>

        <div class="fed-node-specs">
          <div>Local Samples: <span class="fed-node-spec-val">${node.localDataPoints.toLocaleString()}</span></div>
          <div>Accuracy: <span class="fed-node-spec-val" style="color: #10b981;">${node.localAccuracy}%</span></div>
          <div>Loss: <span class="fed-node-spec-val">${node.localLoss}</span></div>
          <div>Gradient Weight: <span class="fed-node-spec-val" style="color: var(--accent-cyan);">${Math.round(node.gradientWeight * 100)}%</span></div>
        </div>

        <div style="font-size: 0.7rem; color: var(--text-dim); display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem;">
          <span>Edge HW: ${node.hardware}</span>
          <span>ε: ${node.privacyBudgetEpsilon}</span>
        </div>
      </div>
    `).join('');
  }

  async triggerSync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const syncBtn = document.getElementById('trigger-fed-sync-btn');
    syncBtn.disabled = true;
    syncBtn.innerHTML = `⏳ Aggregating Gradients across DPCC, PPCB, HSPCB...`;

    // Highlight nodes with animation
    const cards = document.querySelectorAll('.fed-node-card');
    cards.forEach(card => card.style.borderColor = 'var(--accent-cyan)');

    try {
      const res = await fetch(`${CONFIG.API_BASE}/federation/sync`, { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        window.alertsManager.showToast(data.data.message, 'success');
        // Refresh federation state
        const meshRes = await fetch(`${CONFIG.API_BASE}/federation/mesh`);
        const meshData = await meshRes.json();
        window.appState.federation = meshData.data;
        this.renderMesh();
      }
    } catch (err) {
      window.alertsManager.showToast('Failed to trigger federated synchronization', 'danger');
      console.error(err);
    } finally {
      this.isSyncing = false;
      syncBtn.disabled = false;
      syncBtn.innerHTML = `🔄 Run Inter-State FedAvg Consensus Round`;
      cards.forEach(card => card.style.borderColor = '');
    }
  }
}

window.federatedMesh = new FederatedMesh();
