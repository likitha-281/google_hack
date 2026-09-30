/**
 * Client Configuration & Constants
 */

const CONFIG = {
  API_BASE: '/api',
  MAP_INITIAL: {
    center: [28.6139, 77.2090], // Centered over Delhi-NCR / Indo-Gangetic core
    zoom: 7,
    minZoom: 4,
    maxZoom: 18
  },
  TILE_LAYERS: {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  AQI_COLORS: {
    good: '#10b981',
    satisfactory: '#84cc16',
    moderate: '#eab308',
    poor: '#f97316',
    very_poor: '#ef4444',
    severe: '#881337'
  }
};

window.CONFIG = CONFIG;
