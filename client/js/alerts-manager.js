/**
 * Authority Alert Dispatch & Rapid Enforcement Manager
 */

class AlertsManager {
  constructor() {
    this.currentDispatchHotspotId = null;
  }

  init() {
    window.appState.subscribe((event) => {
      if (event === 'ALERTS_LOADED') {
        this.renderAlertsList();
      }
    });

    const form = document.getElementById('dispatch-squad-form');
    if (form) {
      form.onsubmit = (e) => this.handleDispatchSubmit(e);
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'danger' ? 'toast-danger' : type === 'success' ? 'toast-success' : ''}`;
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span>${type === 'danger' ? '🚨' : type === 'success' ? '✅' : 'ℹ️'}</span>
        <span>${message}</span>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  triggerDispatchModal(hotspotId) {
    this.currentDispatchHotspotId = hotspotId;
    const hotspot = window.appState.hotspots.find(h => h.id === hotspotId);
    if (!hotspot) return;

    const modal = document.getElementById('dispatch-modal');
    if (!modal) return;

    document.getElementById('dispatch-modal-hotspot-title').textContent = hotspot.title;
    document.getElementById('dispatch-modal-target').textContent = `${hotspot.state} Pollution Control Board / Municipal Flying Squad`;
    document.getElementById('dispatch-notes').value = hotspot.recommendedAction || '';

    modal.classList.add('active');
  }

  async handleDispatchSubmit(e) {
    e.preventDefault();
    if (!this.currentDispatchHotspotId) return;

    const notes = document.getElementById('dispatch-notes').value;
    const submitBtn = document.getElementById('confirm-dispatch-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mobilizing Flying Squad...';

    try {
      const res = await fetch(`${CONFIG.API_BASE}/alerts/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotspotId: this.currentDispatchHotspotId,
          notes
        })
      });

      const data = await res.json();
      if (data.success) {
        this.showToast(data.message, 'success');
        document.getElementById('dispatch-modal').classList.remove('active');
        window.app.loadAllData();
      } else {
        this.showToast(data.error || 'Failed to dispatch squad', 'danger');
      }
    } catch (err) {
      console.error(err);
      this.showToast('Network error dispatching squad', 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Rapid Dispatch';
    }
  }

  async updateTicketStatus(ticketId, status) {
    try {
      const res = await fetch(`${CONFIG.API_BASE}/alerts/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (data.success) {
        this.showToast(data.message, 'success');
        window.app.loadAllData();
      }
    } catch (err) {
      console.error(err);
      this.showToast('Failed to update ticket status', 'danger');
    }
  }

  renderAlertsList() {
    const container = document.getElementById('alerts-list-container');
    if (!container) return;

    const alerts = window.appState.alerts;

    if (alerts.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No active interventions.</div>`;
      return;
    }

    container.innerHTML = alerts.map(a => {
      const isResolved = a.status === 'resolved';
      const statusBadge = isResolved ? 'badge-good' : a.status === 'in_progress' ? 'badge-poor' : 'badge-critical';

      return `
        <div class="hotspot-card">
          <div class="hotspot-card-top">
            <span class="badge ${statusBadge}">${a.status.replace('_', ' ')}</span>
            <span style="font-size: 0.72rem; color: var(--text-dim); font-family: var(--font-mono);">${a.ticketId}</span>
          </div>

          <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-main);">
            🛡️ ${a.targetAuthority}
          </div>

          <div style="font-size: 0.75rem; color: var(--text-muted);">
            📍 ${a.location}
          </div>

          <div style="font-size: 0.75rem; color: #cbd5e1; background: rgba(0,0,0,0.25); padding: 0.5rem; border-radius: var(--radius-sm);">
            <strong>Action:</strong> ${a.actionTaken}
          </div>

          <div class="hotspot-actions">
            <span style="font-size: 0.72rem; color: var(--accent-cyan);">
              Unit: <strong>${a.dispatchedUnit}</strong>
            </span>
            ${!isResolved ? `
              <button class="btn btn-sm btn-outline" onclick="window.alertsManager.updateTicketStatus('${a.ticketId}', 'resolved')">
                ✓ Mark Resolved
              </button>
            ` : `
              <span style="font-size: 0.72rem; color: var(--accent-emerald);">Abatement Complete</span>
            `}
          </div>
        </div>
      `;
    }).join('');
  }
}

window.alertsManager = new AlertsManager();
