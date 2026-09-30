/**
 * Lightweight Client State Manager
 */

class AppState {
  constructor() {
    this.activeTab = 'hotspots'; // 'hotspots' | 'corridors' | 'federation' | 'citizen' | 'alerts'
    this.activeLayers = {
      hotspots: true,
      sensors: true,
      corridors: true,
      satellite: true
    };
    this.hotspots = [];
    this.sensors = [];
    this.corridors = [];
    this.federation = null;
    this.alerts = [];
    this.citizenReports = [];
    this.selectedHotspot = null;
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify(event, data) {
    this.listeners.forEach(fn => fn(event, data));
  }

  setTab(tabName) {
    this.activeTab = tabName;
    this.notify('TAB_CHANGED', tabName);
  }

  toggleLayer(layerKey) {
    if (this.activeLayers.hasOwnProperty(layerKey)) {
      this.activeLayers[layerKey] = !this.activeLayers[layerKey];
      this.notify('LAYER_TOGGLED', { layerKey, active: this.activeLayers[layerKey] });
    }
  }

  setSelectedHotspot(hotspot) {
    this.selectedHotspot = hotspot;
    this.notify('HOTSPOT_SELECTED', hotspot);
  }
}

window.appState = new AppState();
