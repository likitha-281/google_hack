/**
 * VayuDrishti - Main Client Application Coordinator
 */

class App {
  constructor() {
    this.refreshInterval = null;
  }

  async init() {
    console.log('[VayuDrishti] Initializing Climate Action Client...');

    // Initialize services
    window.mapService.init();
    window.hotspotAnalytics.init();
    window.citizenReporting.init();
    window.federatedMesh.init();
    window.alertsManager.init();

    // Bind navigation tabs
    this.bindNavigation();

    // Bind modal dismiss buttons
    this.bindModals();

    // Load initial data
    await this.loadAllData();

    // Setup periodic polling every 30 seconds
    // IMPROVEMENT: Swap this 30s interval for native WebSockets (ws://) or Server-Sent Events (SSE)
    // to stream sub-second telemetry spikes when live IoT hardware nodes publish.
    this.refreshInterval = setInterval(() => {
      this.loadAllData(true);
    }, 30000);

    // TODO (Field Squad PWA):
    // Register Service Worker here for offline cache when field squads operate in low-connectivity zones:
    // if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');

    console.log('[VayuDrishti] Ready and connected to climate resilience mesh.');
  }

  bindNavigation() {
    const tabs = document.querySelectorAll('.nav-tab-btn');
    tabs.forEach(btn => {
      btn.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        const tabKey = btn.dataset.tab;
        window.appState.setTab(tabKey);

        // Update sidebar section visibility
        document.querySelectorAll('.sidebar-tab-pane').forEach(pane => {
          pane.style.display = 'none';
        });

        const activePane = document.getElementById(`tab-pane-${tabKey}`);
        if (activePane) {
          activePane.style.display = 'flex';
          activePane.style.flexDirection = 'column';
          activePane.style.gap = '1rem';
        }

        // Update sidebar header title
        const titles = {
          hotspots: '🔥 Detected Hyper-Local Hotspots',
          corridors: '🛣️ Economic Corridors & Spike Forecast',
          federation: '🌐 Inter-State Federated Learning Mesh',
          citizen: '📸 Citizen Crowdsourced Feeds',
          alerts: '🚨 Authority Rapid Enforcement'
        };
        const titleEl = document.getElementById('sidebar-active-title');
        if (titleEl) {
          titleEl.textContent = titles[tabKey] || 'Intelligence Sidebar';
        }
      };
    });

    // Layer toggle buttons
    const layerBtns = document.querySelectorAll('.layer-toggle-btn');
    layerBtns.forEach(btn => {
      btn.onclick = () => {
        const layerKey = btn.dataset.layer;
        btn.classList.toggle('active');
        window.appState.toggleLayer(layerKey);
      };
    });
  }

  bindModals() {
    // Inspection modal close
    const inspectClose = document.getElementById('close-inspect-modal');
    if (inspectClose) {
      inspectClose.onclick = () => {
        document.getElementById('inspection-modal').classList.remove('active');
      };
    }

    // Citizen report modal open & close
    const openCitizenModalBtn = document.getElementById('open-citizen-report-btn');
    const citizenModal = document.getElementById('citizen-modal');
    const closeCitizenModalBtn = document.getElementById('close-citizen-modal');

    if (openCitizenModalBtn && citizenModal) {
      openCitizenModalBtn.onclick = () => citizenModal.classList.add('active');
    }

    if (closeCitizenModalBtn && citizenModal) {
      closeCitizenModalBtn.onclick = () => citizenModal.classList.remove('active');
    }

    // Dispatch modal close
    const closeDispatchModalBtn = document.getElementById('close-dispatch-modal');
    const dispatchModal = document.getElementById('dispatch-modal');
    if (closeDispatchModalBtn && dispatchModal) {
      closeDispatchModalBtn.onclick = () => dispatchModal.classList.remove('active');
    }
  }

  async loadAllData(silent = false) {
    try {
      const [
        hotspotsRes,
        sensorsRes,
        corridorsRes,
        thermalRes,
        federationRes,
        alertsRes,
        citizenRes
      ] = await Promise.all([
        fetch(`${CONFIG.API_BASE}/hotspots`),
        fetch(`${CONFIG.API_BASE}/sensors`),
        fetch(`${CONFIG.API_BASE}/corridors`),
        fetch(`${CONFIG.API_BASE}/satellite/thermal`),
        fetch(`${CONFIG.API_BASE}/federation/mesh`),
        fetch(`${CONFIG.API_BASE}/alerts`),
        fetch(`${CONFIG.API_BASE}/citizen/reports`)
      ]);

      const [
        hotspotsData,
        sensorsData,
        corridorsData,
        thermalData,
        federationData,
        alertsData,
        citizenData
      ] = await Promise.all([
        hotspotsRes.json(),
        sensorsRes.json(),
        corridorsRes.json(),
        thermalRes.json(),
        federationRes.json(),
        alertsRes.json(),
        citizenRes.json()
      ]);

      // Update state
      window.appState.hotspots = hotspotsData.data || [];
      window.appState.sensors = sensorsData.data || [];
      window.appState.corridors = corridorsData.data || [];
      window.appState.federation = federationData.data || null;
      window.appState.alerts = alertsData.data || [];
      window.appState.citizenReports = citizenData.data || [];

      // Render map layers
      window.mapService.renderHotspots(window.appState.hotspots);
      window.mapService.renderSensors(window.appState.sensors);
      window.mapService.renderCorridors(window.appState.corridors);
      window.mapService.renderSatelliteAnomalies(thermalData.data || []);

      // Notify state subscribers
      window.appState.notify('HOTSPOTS_LOADED');
      window.appState.notify('CORRIDORS_LOADED');
      window.appState.notify('FEDERATION_LOADED');
      window.appState.notify('ALERTS_LOADED');
      window.appState.notify('CITIZEN_REPORTS_LOADED');

      // Update Top Metrics Banner
      this.updateMetricsBanner();

      if (!silent) {
        console.log('[VayuDrishti] All data feeds synchronized.');
      }
    } catch (err) {
      console.error('[VayuDrishti] Error synchronizing telemetry feeds:', err);
    }
  }

  updateMetricsBanner() {
    const totalHotspotsEl = document.getElementById('stat-total-hotspots');
    const maxSpikeEl = document.getElementById('stat-max-spike');
    const stateNodesEl = document.getElementById('stat-state-nodes');
    const activeSquadsEl = document.getElementById('stat-active-squads');

    if (totalHotspotsEl) {
      totalHotspotsEl.textContent = window.appState.hotspots.length;
    }

    if (maxSpikeEl) {
      const maxSpike = Math.max(...window.appState.hotspots.map(h => {
        const s = window.appState.sensors.find(sns => sns.id === h.nearestSensorId);
        return s ? s.pm25 : 350;
      }), 412);
      maxSpikeEl.textContent = `${maxSpike} µg/m³`;
    }

    if (stateNodesEl) {
      stateNodesEl.textContent = window.appState.federation 
        ? `${window.appState.federation.activeNodesCount} States` 
        : '5 States';
    }

    if (activeSquadsEl) {
      const activeCount = window.appState.alerts.filter(a => a.status !== 'resolved').length;
      activeSquadsEl.textContent = activeCount;
    }
  }
}

window.app = new App();

document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
