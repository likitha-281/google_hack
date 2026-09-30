/**
 * Hotspot Intelligence & Economic Corridor Analytics
 */

class HotspotAnalytics {
  constructor() {
    this.activeFilter = 'all';
    this.charts = {};
  }

  init() {
    window.appState.subscribe((event, data) => {
      if (event === 'HOTSPOTS_LOADED' || event === 'FILTER_CHANGED') {
        this.renderHotspotsList();
      }
      if (event === 'CORRIDORS_LOADED') {
        this.renderCorridors();
      }
      if (event === 'HOTSPOT_SELECTED') {
        this.openHotspotInspection(data);
      }
    });
  }

  setFilter(filter) {
    this.activeFilter = filter;
    this.renderHotspotsList();
  }

  renderHotspotsList() {
    const container = document.getElementById('hotspots-list-container');
    if (!container) return;

    let items = [...window.appState.hotspots];

    if (this.activeFilter === 'critical') {
      items = items.filter(h => h.severity === 'critical');
    } else if (this.activeFilter === 'industrial') {
      items = items.filter(h => h.category === 'industrial_emission');
    } else if (this.activeFilter === 'agricultural') {
      items = items.filter(h => h.category === 'agricultural_burning');
    } else if (this.activeFilter === 'waste') {
      items = items.filter(h => h.category === 'waste_burning');
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No hotspots matching the selected filter.
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(h => {
      const severityBadgeClass = h.severity === 'critical' ? 'badge-critical' : 'badge-poor';
      const aiConfPercent = Math.round(h.aiConfidence * 100);

      return `
        <div class="hotspot-card" onclick="window.mapService.flyToCoordinates(${h.coordinates[0]}, ${h.coordinates[1]}); window.appState.setSelectedHotspot(${JSON.stringify(h).replace(/"/g, '&quot;')})">
          <div class="hotspot-card-top">
            <span class="badge ${severityBadgeClass}">${h.severity}</span>
            <span style="font-size: 0.72rem; color: var(--accent-cyan); font-weight: 600;">
              AI Conf: ${aiConfPercent}%
            </span>
          </div>

          <h4 class="hotspot-title">${h.title}</h4>

          <div class="hotspot-meta-row">
            <span>📍 ${h.locationName}</span>
            <span>👥 ${h.citizenReportsCount} Citizen Reports</span>
          </div>

          <p class="hotspot-summary">${h.summary}</p>

          <div class="hotspot-actions">
            <span style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">
              ${h.category.replace('_', ' ')}
            </span>
            <button class="btn btn-sm ${h.status === 'alert_dispatched' ? 'btn-secondary' : 'btn-danger'}" 
                    onclick="event.stopPropagation(); window.alertsManager.triggerDispatchModal('${h.id}')">
              ${h.status === 'alert_dispatched' ? '✓ Squad Deployed' : '🚨 Dispatch Squad'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderCorridors() {
    const container = document.getElementById('corridors-list-container');
    if (!container) return;

    const corridors = window.appState.corridors;

    container.innerHTML = corridors.map(c => `
      <div class="corridor-card">
        <div class="corridor-header">
          <div>
            <h4 class="corridor-name">${c.name}</h4>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
              Jurisdictions: ${c.jurisdictions.join(' • ')}
            </div>
          </div>
          <span class="badge ${c.maxPredictedSpike > 400 ? 'badge-severe' : 'badge-very-poor'}">
            Peak: ${c.peakRiskHour}
          </span>
        </div>

        <div class="corridor-metrics">
          <div>
            <div class="corridor-metric-val" style="color: var(--accent-cyan);">${c.currentAqi}</div>
            <div class="corridor-metric-lbl">Current AQI</div>
          </div>
          <div>
            <div class="corridor-metric-val" style="color: #ef4444;">${c.maxPredictedSpike}</div>
            <div class="corridor-metric-lbl">Predicted Spike</div>
          </div>
          <div>
            <div class="corridor-metric-val" style="color: #f59e0b;">${c.hourlyForecast.length} hrs</div>
            <div class="corridor-metric-lbl">Forecast Window</div>
          </div>
        </div>

        <div style="font-size: 0.76rem; color: #cbd5e1; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-cyan);">
          <strong>Inter-State Action:</strong> ${c.mitigationStrategy}
        </div>

        <div class="corridor-chart-container">
          <canvas id="chart-${c.corridorId}"></canvas>
        </div>
      </div>
    `).join('');

    // Render Chart.js line charts
    setTimeout(() => {
      corridors.forEach(c => {
        this.renderCorridorChart(c);
      });
    }, 100);
  }

  renderCorridorChart(corridor) {
    const canvasId = `chart-${corridor.corridorId}`;
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    const labels = corridor.hourlyForecast.map(h => h.time);
    const dataPoints = corridor.hourlyForecast.map(h => h.predictedAqi);

    this.charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Predicted AQI Spike',
          data: dataPoints,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: '#06b6d4'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { size: 10 } },
            suggestedMin: 150,
            suggestedMax: 500
          }
        }
      }
    });
  }

  openHotspotInspection(hotspot) {
    const modal = document.getElementById('inspection-modal');
    if (!modal) return;

    document.getElementById('inspect-title').textContent = hotspot.title;
    document.getElementById('inspect-location').textContent = `${hotspot.locationName}, ${hotspot.city} (${hotspot.state})`;
    document.getElementById('inspect-category').textContent = hotspot.category.replace('_', ' ').toUpperCase();
    document.getElementById('inspect-confidence').textContent = `${Math.round(hotspot.aiConfidence * 100)}%`;
    document.getElementById('inspect-aod').textContent = hotspot.satelliteAOD || '0.78 (Sentinel-5P)';
    document.getElementById('inspect-summary').textContent = hotspot.summary;
    document.getElementById('inspect-action').textContent = hotspot.recommendedAction || 'Immediate flying squad dispatch';

    const dispatchBtn = document.getElementById('inspect-dispatch-btn');
    if (dispatchBtn) {
      dispatchBtn.onclick = () => {
        window.alertsManager.triggerDispatchModal(hotspot.id);
        modal.classList.remove('active');
      };
    }

    modal.classList.add('active');
  }
}

window.hotspotAnalytics = new HotspotAnalytics();
