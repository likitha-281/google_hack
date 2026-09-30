# 🌿 VayuDrishti (वायु दृष्टि)
### AI-Powered Federated Climate Action & Hyper-Local Air Quality Resilience Grid
> **Theme:** Sustainability & Climate Resilience | **Target:** Indian Economic Corridors & Megacities

---

## 💡 The Problem We're Solving

If you live in Delhi-NCR, the Indo-Gangetic Plains, or near any major Indian industrial corridor, you already know the grim reality: **macro-level monitoring is blind to hyper-local pollution.**

Today, official CPCB (Central Pollution Control Board) and SPCB reference stations are spaced **15 to 25 kilometers apart**. While they tell us that a city's average AQI is "340 (Very Poor)", they consistently miss:
1. **Unauthorized Night-Time Industrial Discharges:** Small smelting, electroplating, and dyeing units in clusters like Wazirpur, Bawana, and Mayapuri turning off scrubbers after 10 PM.
2. **Hyper-Local Biomass & Waste Burning:** Plastic wire stripping in vacant lots, municipal trash dumps, and localized crop residue fires.
3. **Severe Freight Bottlenecks:** Thousands of diesel trucks idling at inter-state border tolls (e.g., Kundli, Kapashera) when entry bans lift at night.
4. **Inter-State Boundary Blame Games:** Pollution doesn't stop at state borders. When stubble burns in Punjab or Haryana, smoke drifts downwind into Delhi and UP within 12–18 hours, yet states lack a unified, privacy-safe predictive network to coordinate resources.

---

## 🚀 The Solution: VayuDrishti

**VayuDrishti** is a federated climate intelligence and rapid-intervention platform designed specifically for the Indian context. It bridges ground-level citizen reports, dense low-cost IoT sensor grids, and orbital satellite telemetry into an actionable command system:

- 📸 **Citizen Crowdsourced Evidence:** Citizens snap geo-tagged photos of illegal emissions. An edge AI vision heuristic estimates plume opacity, smoke color signature, and immediate micro-PM2.5 spike.
- 📡 **Hyper-Local Micro-Sensor Mesh:** Low-cost sensor nodes placed every 500m detect rapid localized spikes in SO2, CO, and PM2.5 that macro stations miss.
- 🛰️ **Satellite & Meteorological Ingestion:** Synthesizes Sentinel-5P (Tropospheric NO2/SO2) and VIIRS/MODIS thermal fire anomalies with wind vectors to model downwind smoke trajectories.
- 🛣️ **Economic Corridor Spike Forecasting:** 24-hour predictive models for high-freight arteries (Eastern & Western Peripheral Expressways, GT Road NH-44, Mumbai-Pune corridor), factoring in nocturnal boundary layer inversion traps.
- 🌐 **Inter-State Federated Learning (FedAvg):** Enables State Pollution Control Boards (DPCC Delhi, PPCB Punjab, HSPCB Haryana, UPPCB, MPCB) to train a shared predictive AI model collaboratively **without sensitive citizen surveillance data or PII ever leaving the state's boundary.**
- 🚨 **Rapid Authority Dispatch:** Automatically escalates verified hotspots into actionable flying squad inspection tickets and mist-cannon deployments.

---

## 📁 Project Architecture & Folder Structure

We designed the codebase to be clean, modular, and human-readable, with a clear separation of concerns:

```text
vayu-drishti/
├── client/                     # Lightweight, high-performance web dashboard
│   ├── css/                    # Clean modular stylesheets
│   │   ├── variables.css       # Design tokens, atmospheric color palette, CPCB NAQI colors
│   │   ├── base.css            # Typography, resets, header layout
│   │   ├── components.css      # Reusable buttons, badges, modals, forms, toast alerts
│   │   ├── dashboard.css       # Map viewport, telemetry sidebar, corridor cards, radar pins
│   │   └── responsive.css      # Mobile, tablet, and widescreen breakpoints
│   ├── js/                     # Client-side JavaScript modules
│   │   ├── config.js           # API routes, map bounds, CPCB color scales
│   │   ├── state.js            # Reactive application state & event bus
│   │   ├── map.js              # Leaflet.js engine with custom dark tiles & pulsing markers
│   │   ├── hotspot-analytics.js# Hotspot feed filters & Chart.js corridor spike forecasts
│   │   ├── citizen-report.js   # Drag-and-drop photo upload & AI vision opacity preview
│   │   ├── federated-mesh.js   # State-level edge node visualizer & FedAvg consensus trigger
│   │   ├── alerts-manager.js   # Rapid flying squad dispatch tickets & status tracker
│   │   └── app.js              # App lifecycle, tab switching & periodic background polling
│   └── index.html              # Semantic HTML5 dashboard shell
├── server/                     # Node.js / Express backend
│   ├── data/                   # Realistic Indian datasets
│   │   ├── sensorStations.json # 28+ hyper-local sensor nodes (Delhi, Punjab, Mumbai, etc.)
│   │   ├── hotspots.json       # Detected nocturnal smelting, crop fires, and illegal pyrolysis
│   │   ├── corridors.json      # Freight arteries (EPE, WPE, GT Road, Mumbai-Pune)
│   │   └── regionalNodes.json  # Federated SPCB state edge nodes (DPCC, PPCB, HSPCB, etc.)
│   ├── services/               # Core domain algorithms
│   │   ├── aqiEngine.js        # Official CPCB 6-tier NAQI mathematical calculation
│   │   ├── satelliteService.js # Sentinel-5P AOD ingestion & wind drift dispersion modeling
│   │   ├── corridorForecaster.js# 24-hr diurnal traffic & thermal inversion spike forecasting
│   │   ├── federatedAggregator.js# Federated Averaging (FedAvg) cross-state consensus engine
│   │   ├── citizenVisionMock.js# Computer vision plume opacity & toxic signature classifier
│   │   └── alertDispatcher.js  # Multi-tier escalation tickets (Advisory, Squad, Statutory)
│   ├── controllers/            # Request handlers
│   │   ├── hotspotController.js# Hotspot, sensor, corridor, and satellite query endpoints
│   │   ├── citizenController.js# Crowdsourced photo upload, AI vision check & verification
│   │   ├── federationController.js# Model weights aggregation & edge node health endpoints
│   │   └── alertController.js  # Rapid intervention dispatch & status update endpoints
│   ├── routes/
│   │   └── apiRoutes.js        # REST API routing with Multer file storage
│   └── server.js               # Express application entrypoint
├── uploads/                    # Local storage destination for citizen evidence photos
├── .env.example                # Sample environment variables
├── .gitignore                  # Git exclusions
└── package.json                # Project dependencies and npm scripts
```

---

## ⚡ Getting Started (Run in 60 Seconds)

### 1. Prerequisites
- **Node.js** (v18 or higher recommended; verified on Node v20/v24)
- **npm** (comes bundled with Node)

### 2. Installation & Launch
Open your terminal in the `vayu-drishti` folder (or in the project root):

```bash
# Navigate to the project directory
cd vayu-drishti

# Install dependencies (only express, cors, and multer needed!)
npm install

# Start the application
npm start
```

Now open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## 🛠️ Tech Stack & Implementation Choices

| Layer | Technology | Why We Chose It |
|---|---|---|
| **Backend** | Node.js + Express | Fast, asynchronous, lightweight I/O handling for sensor telemetry and citizen photo uploads. |
| **API Architecture** | RESTful JSON Endpoints | Decoupled and standards-compliant, easy to interface with future IoT hardware (ESP32/Raspberry Pi). |
| **Frontend** | Vanilla ES6+ & Modern CSS | Zero build step friction. Blazing fast load times, instant hot development, and zero webpack/vite bundle breakage. |
| **Geospatial Mapping** | Leaflet.js + CartoDB Dark Matter | High-contrast dark satellite aesthetic, custom animated SVG radar markers, and dynamic corridor polylines. |
| **Data Visualization** | Chart.js | Smooth interactive line charts depicting 24-hour diurnal air quality spikes and inversion traps. |
| **Evidence Processing** | Multer + Custom AI Vision Heuristic | Extracts image features, computes plume opacity %, and estimates micro-particulate spikes. |
| **Federated AI** | FedAvg (Federated Averaging) | Mathematical weighted average aggregation simulating state nodes training under Differential Privacy. |

---

## 🔬 Core Capabilities Walkthrough

### 1. Official CPCB NAQI Calculation Engine
Unlike naive air quality apps that guess numbers, `server/services/aqiEngine.js` implements the **official Indian Central Pollution Control Board (CPCB) NAQI mathematical standard**:
$$I = I_{low} + \frac{I_{high} - I_{low}}{B_{high} - B_{low}} \times (C - B_{low})$$
Computes sub-indices for $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, and $\text{CO}$, taking the maximum sub-index as the definitive AQI.

### 2. Inter-State Federated Learning (Cross-Border Resilience)
- **The Problem:** Punjab farmers' crop burning affects Delhi, but Punjab PPCB and Delhi DPCC operate under separate administrative jurisdictions with strict data privacy concerns.
- **The VayuDrishti Solution:** Click the **"🌐 Federated Mesh"** tab and click **"Run Inter-State FedAvg Consensus Round"**.
- Watch the platform coordinate across:
  - **DPCC (Delhi):** Urban nocturnal inversion & small-scale smelting model
  - **PPCB (Punjab):** Agricultural biomass combustion & drift trajectory model
  - **HSPCB (Haryana):** Freight corridor emissions & brick kiln dispersion model
  - **UPPCB (Uttar Pradesh):** River basin topography & tannery aerosol model
  - **MPCB (Maharashtra):** Coastal humidity trapping & port logistics flaring model
- Only mathematical model weights are exchanged. Local citizen photos and PII never leave the host state.

### 3. Economic Corridor Spike Forecasting
Click **"🛣️ Corridors"** to view 24-hour forecasts along:
- **Eastern Peripheral Expressway (EPE)**
- **Western Peripheral Expressway (WPE / KMP)**
- **GT Road NH-44 (Agri-Industrial corridor)**
- **Mumbai-Pune Expressway (JNPT port freight spine)**

Each corridor displays predicted peak risk windows (e.g. 23:00 - 04:00 hrs when truck entry bans lift and nocturnal boundary layers compress) alongside automated diversion recommendations.

### 4. Citizen Crowdsourcing with AI Vision Analysis
1. Click the top-right **"📷 Report Pollution"** button.
2. Select or drag-and-drop a photo of visible smoke.
3. Choose a preset hotspot (e.g., *Wazirpur Industrial*, *Sangrur Agri Belt*, or *Mundka Outer*) or enter custom GPS coordinates.
4. Click **"Submit Verified Report"**.
5. The edge AI vision heuristic analyzes plume opacity, identifies the chemical/particulate signature, calculates the local micro-spike (e.g., `+140 µg/m³ within 500m`), and logs it into the live grid!

### 5. Rapid Authority Enforcement
In the **"🔥 Hotspots"** or **"🚨 Rapid Interventions"** tab:
- Officials can inspect full multi-modal evidence dossiers (Citizen photo count + Low-cost sensor anomaly + Sentinel-5P AOD score).
- Click **"🚨 Dispatch Squad"** to mobilize a flying squad unit (e.g., *DPCC Flying Squad Unit 3*, *PPCB Stubble Taskforce Delta*).
- Track squad progress and mark tickets resolved when anti-smog mist guns or statutory notices have been deployed.

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service uptime and active capability checklist |
| `GET` | `/api/hotspots` | List detected hotspots (supports `?severity=critical`, `?category=industrial_emission`) |
| `GET` | `/api/hotspots/:id` | Detailed dossier of a hotspot with nearest sensor cross-reference |
| `GET` | `/api/sensors` | Real-time readings from 28+ IoT micro-sensors with calculated CPCB AQI |
| `GET` | `/api/corridors` | Economic corridor freight volume, risk classification & 24-hr forecast |
| `GET` | `/api/satellite/thermal` | Active VIIRS/MODIS thermal anomalies and Sentinel-5P NO2 columns |
| `GET` | `/api/citizen/reports` | List crowdsourced citizen observations and vision scores |
| `POST` | `/api/citizen/report` | Submit citizen photo evidence with multipart/form-data upload |
| `GET` | `/api/federation/mesh` | Get status of 5 state SPCB edge nodes, global model loss, and accuracy |
| `POST` | `/api/federation/sync` | Trigger an interactive multi-state FedAvg weight synchronization round |
| `GET` | `/api/alerts` | List active flying squad enforcement tickets |
| `POST` | `/api/alerts/dispatch` | Mobilize flying squad or statutory inspection for a hotspot |
| `PATCH` | `/api/alerts/:id/status`| Update status of an intervention ticket (`in_progress`, `resolved`) |

---

## 🗺️ What We'd Build Next (Future Roadmap)

1. **Direct ISRO Bhuvan & MOSDAC API Integration:** Ingest live 15-minute INSAT-3DR AOD rasters directly from Indian Space Research Organisation ground stations.
2. **LoRaWAN Mesh Network for Slum & Industrial Clusters:** Deploy ₹1,500 battery-powered solar LoRaWAN particulate sensors in high-density informal industrial pockets without reliable 4G cellular coverage.
3. **Automated FIR & Environmental Compensation (EC) Drafter:** Auto-populate Section 15 Environment Protection Act notices for repeated industrial night-time violators with cryptographic timestamped satellite & citizen evidence.

---

## 👥 Authors & Acknowledgements
Crafted with passion for India's clean air and climate resilience. Dedicated to every citizen who deserves to breathe clean, unpolluted air.
