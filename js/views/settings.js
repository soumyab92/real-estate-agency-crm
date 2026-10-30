import { store } from '../data/store.js';
import { toast } from '../utils/toast.js';

export function renderSettings(container) {
  const leadsCount = store.getLeads().length;
  const propsCount = store.getProperties().length;
  const tasksCount = store.getTasks().length;

  container.innerHTML = `
    <div style="max-width: 800px; display: flex; flex-direction: column; gap: 24px;">
      <!-- Database & Data Operations -->
      <div class="chart-card">
        <h3 style="margin-bottom: 10px;">
          <span>Data Management & Backups</span>
          <span class="badge badge-neutral">Storage</span>
        </h3>
        <p style="margin-bottom: 18px; font-size: 0.9rem;">
          Your CRM data is automatically synchronized to local storage. Export full backups or CSV files for spreadsheet reporting.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 20px;">
          <div style="background: var(--bg-subtle); padding: 14px; border-radius: var(--radius-sm);">
            <div style="font-weight: 600; margin-bottom: 4px;">Leads & Deals CSV</div>
            <p style="font-size: 0.8rem; margin-bottom: 10px;">Export ${leadsCount} client contacts and deal stages.</p>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-export-csv-action">
              📥 Download CSV
            </button>
          </div>

          <div style="background: var(--bg-subtle); padding: 14px; border-radius: var(--radius-sm);">
            <div style="font-weight: 600; margin-bottom: 4px;">Full JSON Backup</div>
            <p style="font-size: 0.8rem; margin-bottom: 10px;">Export all properties (${propsCount}), leads, and tasks (${tasksCount}).</p>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-export-json-action">
              💾 Export JSON Backup
            </button>
          </div>
        </div>

        <div style="border-top: 1px solid var(--border-subtle); padding-top: 18px;">
          <h4 style="margin-bottom: 8px;">Restore from Backup</h4>
          <p style="font-size: 0.85rem; margin-bottom: 12px;">Upload a previously exported JSON backup file to restore all agency data.</p>
          <input type="file" id="import-json-file" accept=".json" style="display: none;">
          <button type="button" class="btn btn-ghost" id="btn-trigger-import">
            📂 Choose JSON Backup File
          </button>
        </div>
      </div>

      <!-- Reset & Factory Defaults -->
      <div class="chart-card" style="border-color: var(--status-danger-bg);">
        <h3 style="margin-bottom: 10px; color: var(--status-danger);">
          <span>Reset Agency Database</span>
          <span class="badge badge-danger">Danger Zone</span>
        </h3>
        <p style="margin-bottom: 16px; font-size: 0.9rem;">
          Reset all leads, tasks, and property listings back to the clean demonstration seed dataset.
        </p>
        <button type="button" class="btn btn-danger" id="btn-reset-defaults">
          ⚠️ Reset to Initial Demo Data
        </button>
      </div>

      <!-- Agency Profile & Defaults -->
      <div class="chart-card">
        <h3 style="margin-bottom: 10px;">Agency Information</h3>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Agency Brand Name</label>
            <input type="text" class="form-input" value="Hearth Realty & Advisory" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Default Currency</label>
            <input type="text" class="form-input" value="INR (₹) Lakhs & Crores" readonly>
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Primary City / Region</label>
            <input type="text" class="form-input" value="Kolkata Metro, West Bengal" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Standard Brokerage Standard</label>
            <input type="text" class="form-input" value="2% on Sale, 1 Month on Rent" readonly>
          </div>
        </div>
      </div>
    </div>
  `;

  // CSV Export
  container.querySelector('#btn-export-csv-action').onclick = () => {
    store.exportToCSV();
    toast.success('Leads CSV file generated');
  };

  // JSON Export
  container.querySelector('#btn-export-json-action').onclick = () => {
    store.exportToJSON();
    toast.success('JSON backup exported');
  };

  // JSON Import
  const fileInput = container.querySelector('#import-json-file');
  const triggerBtn = container.querySelector('#btn-trigger-import');
  triggerBtn.onclick = () => fileInput.click();

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const success = store.importFromJSON(evt.target.result);
      if (success) {
        toast.success('CRM database restored successfully!');
        renderSettings(container);
      } else {
        toast.error('Invalid backup JSON file structure');
      }
    };
    reader.readAsText(file);
  };

  // Reset demo
  container.querySelector('#btn-reset-defaults').onclick = () => {
    if (confirm('Are you sure you want to restore initial demo data? Current records will be replaced.')) {
      store.resetToDefaults();
      toast.info('Database reset to initial demo data');
      renderSettings(container);
    }
  };
}
