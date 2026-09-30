/**
 * Leaflet Map & Geospatial Layer Service
 */

class MapService {
  constructor() {
    this.map = null;
    this.layers = {
      hotspots: L.layerGroup(),
      sensors: L.layerGroup(),
      corridors: L.layerGroup(),
      satellite: L.layerGroup()
    };
  }

  init() {
    // Initialize Leaflet instance
    this.map = L.map('leaflet-map', {
      center: CONFIG.MAP_INITIAL.center,
      zoom: CONFIG.MAP_INITIAL.zoom,
      minZoom: CONFIG.MAP_INITIAL.minZoom,
      maxZoom: CONFIG.MAP_INITIAL.maxZoom,
      zoomControl: false
    });

    // Add zoom controls to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Add CartoDB Dark Matter tile layer (optimized for high-contrast pollution overlays)
    L.tileLayer(CONFIG.TILE_LAYERS.dark, {
      attribution: CONFIG.TILE_LAYERS.attribution,
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    // IMPROVEMENT / ROADMAP:
    // To scale to 10,000+ real-time citizen points across India:
    // 1. Swap default Leaflet DOM markers for Leaflet.Canvas-Markers or MapLibre GL for GPU rendering
    // 2. Overlay live NetCDF/GeoTIFF raster tiles from Sentinel-5P via leaflet-geotiff plugin

    // Add layer groups to map
    Object.values(this.layers).forEach(layer => layer.addTo(this.map));

    // Listen to state changes
    window.appState.subscribe((event, data) => {
      if (event === 'LAYER_TOGGLED') {
        this.handleLayerToggle(data.layerKey, data.active);
      }
    });
  }

  handleLayerToggle(layerKey, isActive) {
    const layer = this.layers[layerKey];
    if (!layer) return;

    if (isActive) {
      if (!this.map.hasLayer(layer)) {
        this.map.addLayer(layer);
      }
    } else {
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    }
  }

  renderSensors(sensors) {
    this.layers.sensors.clearLayers();

    sensors.forEach(sensor => {
      const aqi = sensor.aqiDetails ? sensor.aqiDetails.aqi : 200;
      const color = sensor.aqiDetails ? sensor.aqiDetails.colorCode : '#eab308';

      // Custom HTML circle marker with AQI display
      const markerHtml = `
        <div class="custom-sensor-marker" style="background-color: ${color}; width: 26px; height: 26px;">
          ${aqi}
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-sensor-icon',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker(sensor.coordinates, { icon });
      
      const popupHtml = `
        <div style="color: #070b14; font-family: sans-serif; min-width: 180px;">
          <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: bold;">${sensor.name}</h4>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${sensor.city}, ${sensor.state}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>AQI:</span>
            <strong style="color: ${color};">${aqi} (${sensor.aqiDetails.category})</strong>
          </div>
          <div style="font-size: 10px; color: #64748b;">
            PM2.5: ${sensor.pm25} µg/m³ | NO2: ${sensor.no2} µg/m³
          </div>
          ${sensor.anomalyFlag ? `<div style="margin-top: 6px; font-size: 10px; color: #dc2626; font-weight: bold;">⚠️ Anomaly: ${sensor.anomalyReason}</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml);
      this.layers.sensors.addLayer(marker);
    });
  }

  renderHotspots(hotspots) {
    this.layers.hotspots.clearLayers();

    hotspots.forEach(hotspot => {
      const icon = L.divIcon({
        html: `<div class="custom-hotspot-marker">🔥</div>`,
        className: 'custom-hotspot-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker(hotspot.coordinates, { icon });

      const popupHtml = `
        <div style="color: #070b14; font-family: sans-serif; min-width: 220px;">
          <div style="display: inline-block; padding: 2px 6px; background: #fee2e2; color: #b91c1c; border-radius: 4px; font-size: 9px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">
            ${hotspot.category.replace('_', ' ')}
          </div>
          <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: bold;">${hotspot.title}</h4>
          <p style="font-size: 11px; color: #334155; margin: 4px 0 8px; line-height: 1.3;">${hotspot.summary}</p>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">
            AI Confidence: <strong>${Math.round(hotspot.aiConfidence * 100)}%</strong> | AOD: ${hotspot.satelliteAOD}
          </div>
          <button onclick="window.appState.setSelectedHotspot(${JSON.stringify(hotspot).replace(/"/g, '&quot;')})" 
                  style="width: 100%; padding: 5px 8px; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;">
            Inspect & Dispatch Squad
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      this.layers.hotspots.addLayer(marker);
    });
  }

  renderCorridors(corridors) {
    this.layers.corridors.clearLayers();

    corridors.forEach(corridor => {
      const riskColor = corridor.riskLevel === 'severe' ? '#ef4444' : '#f97316';
      
      const polyline = L.polyline(corridor.waypoints, {
        color: riskColor,
        weight: 5,
        opacity: 0.8,
        dashArray: corridor.riskLevel === 'severe' ? '8, 6' : null
      });

      const popupHtml = `
        <div style="color: #070b14; font-family: sans-serif; min-width: 200px;">
          <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: bold;">${corridor.name}</h4>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">Length: ${corridor.lengthKm} km</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Current Avg AQI:</span>
            <strong>${corridor.currentAvgAqi}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>Predicted Spike:</span>
            <strong style="color: ${riskColor};">${corridor.predictedSpikeAqi} (Peak: ${corridor.peakRiskWindow})</strong>
          </div>
          <div style="font-size: 10px; color: #dc2626; font-weight: 600;">
            Bottleneck: ${corridor.activeBottleneck}
          </div>
        </div>
      `;

      polyline.bindPopup(popupHtml);
      this.layers.corridors.addLayer(polyline);
    });
  }

  renderSatelliteAnomalies(anomalies) {
    this.layers.satellite.clearLayers();

    anomalies.forEach(anomaly => {
      // Circle radiating satellite thermal detection
      const circle = L.circle(anomaly.coordinates, {
        radius: 12000, // 12 km dispersion halo
        color: '#f97316',
        fillColor: '#ea580c',
        fillOpacity: 0.25,
        weight: 1
      });

      const popupHtml = `
        <div style="color: #070b14; font-family: sans-serif; min-width: 180px;">
          <h4 style="margin: 0 0 4px; font-size: 12px; font-weight: bold;">🛰️ ${anomaly.satellite} Thermal Alert</h4>
          <div style="font-size: 10px; color: #475569; margin-bottom: 4px;">District: ${anomaly.district}, ${anomaly.state}</div>
          <div style="font-size: 11px; color: #c2410c; font-weight: bold; margin-bottom: 4px;">
            ${anomaly.plumeCategory}
          </div>
          <div style="font-size: 10px; color: #64748b;">
            ${anomaly.frpMegaWatts ? `FRP: ${anomaly.frpMegaWatts} MW` : `NO2 Column: ${anomaly.troposphericNO2_umol} µmol/m²`}
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);
      this.layers.satellite.addLayer(circle);
    });
  }

  flyToCoordinates(lat, lng, zoom = 12) {
    if (this.map) {
      this.map.flyTo([lat, lng], zoom, {
        duration: 1.2
      });
    }
  }
}

window.mapService = new MapService();
