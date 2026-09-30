/**
 * Citizen Crowdsourcing & Edge AI Vision Upload Service
 */

class CitizenReporting {
  constructor() {
    this.selectedFile = null;
  }

  init() {
    this.bindEvents();
    window.appState.subscribe((event) => {
      if (event === 'CITIZEN_REPORTS_LOADED') {
        this.renderReportsTimeline();
      }
    });
  }

  bindEvents() {
    const fileInput = document.getElementById('citizen-photo-input');
    const dropzone = document.getElementById('citizen-upload-dropzone');
    const previewContainer = document.getElementById('photo-preview-container');
    const previewImg = document.getElementById('photo-preview-img');
    const form = document.getElementById('citizen-report-form');

    if (dropzone && fileInput) {
      dropzone.onclick = () => fileInput.click();

      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileSelected(e.target.files[0]);
        }
      };

      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--accent-cyan)';
      };

      dropzone.ondragleave = () => {
        dropzone.style.borderColor = '';
      };

      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFileSelected(e.dataTransfer.files[0]);
        }
      };
    }

    if (form) {
      form.onsubmit = (e) => this.handleSubmit(e);
    }
  }

  handleFileSelected(file) {
    this.selectedFile = file;
    const previewContainer = document.getElementById('photo-preview-container');
    const previewImg = document.getElementById('photo-preview-img');

    if (previewContainer && previewImg) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewContainer.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  }

  quickFillLocation(city, state, lat, lng) {
    document.getElementById('report-city').value = city;
    document.getElementById('report-state').value = state;
    document.getElementById('report-lat').value = lat;
    document.getElementById('report-lng').value = lng;
    window.alertsManager.showToast(`Auto-filled coordinates for ${city}`, 'info');
  }

  async handleSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-report-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Analyzing Image via AI Vision...';

    const formData = new FormData();
    formData.append('citizenAlias', document.getElementById('report-alias').value || 'Anonymous Citizen');
    formData.append('category', document.getElementById('report-category').value);
    formData.append('description', document.getElementById('report-desc').value);
    formData.append('city', document.getElementById('report-city').value || 'Delhi');
    formData.append('state', document.getElementById('report-state').value || 'Delhi');
    formData.append('latitude', document.getElementById('report-lat').value || '28.6975');
    formData.append('longitude', document.getElementById('report-lng').value || '77.1640');

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    try {
      const res = await fetch(`${CONFIG.API_BASE}/citizen/report`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        window.alertsManager.showToast('Report verified & submitted to Climate Action Grid!', 'success');
        
        // Show Vision result in modal
        const vision = data.data.aiVisionAnalysis;
        alert(`AI Vision Verification Result:\n• Plume Type: ${vision.detectedCategory}\n• Smoke Opacity: ${vision.opacityPercentage}%\n• Confidence: ${Math.round(vision.confidenceScore * 100)}%\n• Local Micro-Spike: ${vision.estimatedMicroSpikePm25}`);

        // Reset and close
        document.getElementById('citizen-modal').classList.remove('active');
        document.getElementById('citizen-report-form').reset();
        document.getElementById('photo-preview-container').style.display = 'none';
        this.selectedFile = null;

        // Reload data
        window.app.loadAllData();
      } else {
        window.alertsManager.showToast(`Submission error: ${data.error}`, 'danger');
      }
    } catch (err) {
      window.alertsManager.showToast('Network error submitting report', 'danger');
      console.error(err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Verified Report';
    }
  }

  renderReportsTimeline() {
    const container = document.getElementById('citizen-reports-container');
    if (!container) return;

    const reports = window.appState.citizenReports;

    if (reports.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No citizen reports logged yet.</div>`;
      return;
    }

    container.innerHTML = reports.map(r => `
      <div class="hotspot-card" onclick="window.mapService.flyToCoordinates(${r.coordinates[0]}, ${r.coordinates[1]})">
        <div class="hotspot-card-top">
          <span class="badge badge-good">Verified Citizen Feed</span>
          <span style="font-size: 0.72rem; color: var(--text-dim);">${new Date(r.submittedAt).toLocaleTimeString()}</span>
        </div>
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">
          👤 ${r.citizenAlias} (${r.city})
        </div>
        <p class="hotspot-summary">${r.description}</p>
        <div style="background: rgba(6, 182, 212, 0.08); padding: 0.5rem; border-radius: var(--radius-sm); font-size: 0.74rem;">
          <div><strong>AI Vision:</strong> ${r.aiVisionAnalysis.plumeColor} (${r.aiVisionAnalysis.opacityPercentage}% opacity)</div>
          <div style="color: var(--accent-cyan); margin-top: 2px;">Micro-Spike: ${r.aiVisionAnalysis.estimatedMicroSpikePm25}</div>
        </div>
      </div>
    `).join('');
  }
}

window.citizenReporting = new CitizenReporting();
