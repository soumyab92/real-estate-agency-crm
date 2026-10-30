import { store } from '../data/store.js';
import { AREAS } from '../data/initialData.js';
import { formatPropertyPrice, escapeHtml } from '../utils/formatters.js';
import { modal } from '../components/modal.js';
import { toast } from '../utils/toast.js';

let activeModeFilter = 'All'; // 'All', 'Sale', 'Rent'
let activeStatusFilter = 'All'; // 'All', 'Available', 'Under offer', 'Sold'

export function renderListings(container, filterTerm = '', selectedAgent = '') {
  let properties = store.getProperties();

  if (activeModeFilter !== 'All') {
    properties = properties.filter(p => p.mode === activeModeFilter);
  }
  if (activeStatusFilter !== 'All') {
    properties = properties.filter(p => p.status === activeStatusFilter);
  }
  if (filterTerm) {
    const term = filterTerm.toLowerCase();
    properties = properties.filter(p => (p.title + ' ' + p.area + ' ' + p.bhk + ' ' + (p.description || '')).toLowerCase().includes(term));
  }

  container.innerHTML = `
    <!-- Top Action & Filter Bar -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button type="button" class="btn ${activeModeFilter === 'All' ? 'btn-primary' : 'btn-ghost'} btn-sm" data-mode="All">All Modes</button>
        <button type="button" class="btn ${activeModeFilter === 'Sale' ? 'btn-primary' : 'btn-ghost'} btn-sm" data-mode="Sale">For Sale</button>
        <button type="button" class="btn ${activeModeFilter === 'Rent' ? 'btn-primary' : 'btn-ghost'} btn-sm" data-mode="Rent">For Rent</button>
        <span style="border-right: 1px solid var(--border-subtle); margin: 0 4px;"></span>
        <button type="button" class="btn ${activeStatusFilter === 'All' ? 'btn-secondary' : 'btn-ghost'} btn-sm" data-status="All">All Statuses</button>
        <button type="button" class="btn ${activeStatusFilter === 'Available' ? 'btn-secondary' : 'btn-ghost'} btn-sm" data-status="Available">Available</button>
        <button type="button" class="btn ${activeStatusFilter === 'Under offer' ? 'btn-secondary' : 'btn-ghost'} btn-sm" data-status="Under offer">Under offer</button>
      </div>

      <button type="button" class="btn btn-accent" id="btn-add-property">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Property
      </button>
    </div>

    <!-- Properties Grid -->
    ${properties.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </div>
        <h3 class="empty-state-title">No listings match your filter</h3>
        <p class="empty-state-desc">Try resetting your filters or list a new apartment/commercial property.</p>
      </div>
    ` : `
      <div class="listings-grid">
        ${properties.map(prop => {
          return `
            <div class="property-card" data-prop-id="${prop.id}">
              <div class="property-header">
                <div>
                  <h4 class="property-title">${escapeHtml(prop.title)}</h4>
                  <div class="property-location">${escapeHtml(prop.area)}</div>
                </div>
                <span class="badge ${prop.mode === 'Sale' ? 'badge-info' : 'badge-neutral'}">
                  ${prop.mode}
                </span>
              </div>
              <div class="property-body">
                <div class="property-specs">
                  <span>📐 ${escapeHtml(prop.bhk)}</span>
                  <span>•</span>
                  <span>${prop.sqft} sq.ft</span>
                </div>
                <div class="property-price">${formatPropertyPrice(prop)}</div>
                ${prop.description ? `
                  <p style="font-size: 0.82rem; margin-top: 8px; color: var(--ink-secondary); line-height: 1.4;">
                    ${escapeHtml(prop.description)}
                  </p>
                ` : ''}
              </div>
              <div class="property-footer">
                <label style="font-size: 0.8rem; font-weight: 600; color: var(--ink-secondary);">Status</label>
                <select class="form-select property-status-select" data-prop-id="${prop.id}" style="width: auto; padding: 4px 8px; font-size: 0.85rem;">
                  <option value="Available" ${prop.status === 'Available' ? 'selected' : ''}>Available</option>
                  <option value="Under offer" ${prop.status === 'Under offer' ? 'selected' : ''}>Under offer</option>
                  <option value="Sold" ${prop.status === 'Sold' ? 'selected' : ''}>Sold</option>
                </select>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;

  // Attach filter buttons
  container.querySelectorAll('[data-mode]').forEach(btn => {
    btn.onclick = () => {
      activeModeFilter = btn.dataset.mode;
      renderListings(container, filterTerm, selectedAgent);
    };
  });

  container.querySelectorAll('[data-status]').forEach(btn => {
    btn.onclick = () => {
      activeStatusFilter = btn.dataset.status;
      renderListings(container, filterTerm, selectedAgent);
    };
  });

  // Attach status change listener
  container.querySelectorAll('.property-status-select').forEach(sel => {
    sel.onchange = () => {
      const propId = Number(sel.dataset.propId);
      store.updatePropertyStatus(propId, sel.value);
      toast.success('Listing status updated');
    };
  });

  // Attach Add Property modal
  const addBtn = container.querySelector('#btn-add-property');
  if (addBtn) {
    addBtn.onclick = () => openAddPropertyModal(() => renderListings(container, filterTerm, selectedAgent));
  }
}

export function openAddPropertyModal(onSuccess) {
  modal.open({
    title: 'Add New Property Listing',
    bodyHtml: `
      <form id="add-property-form">
        <div class="form-group">
          <label class="form-label" for="prop-title">Building / Project Name</label>
          <input type="text" id="prop-title" class="form-input" placeholder="e.g. South City Enclave, Tower B" required>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label" for="prop-area">Locality</label>
            <input type="text" id="prop-area" class="form-input" list="area-datalist" placeholder="Select or type area" required>
            <datalist id="area-datalist">
              ${AREAS.map(a => `<option value="${a}">`).join('')}
            </datalist>
          </div>

          <div class="form-group">
            <label class="form-label" for="prop-bhk">Configuration</label>
            <select id="prop-bhk" class="form-select">
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK" selected>2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Commercial Space">Commercial Space</option>
            </select>
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label" for="prop-mode">Listing Type</label>
            <select id="prop-mode" class="form-select">
              <option value="Sale">For Sale</option>
              <option value="Rent">For Rent</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="prop-price">Price (₹)</label>
            <input type="number" id="prop-price" class="form-input" min="1000" step="5000" placeholder="8500000" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="prop-sqft">Super Built-up (sq.ft)</label>
            <input type="number" id="prop-sqft" class="form-input" min="100" placeholder="1250" required>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="prop-desc">Key Highlights / Amenities</label>
          <textarea id="prop-desc" class="form-textarea" rows="2" placeholder="e.g. 2 covered car parking, clubhouse access, 100% vaastu compliant"></textarea>
        </div>
      </form>
    `,
    footerHtml: `
      <button type="button" class="btn btn-ghost" id="btn-cancel-prop">Cancel</button>
      <button type="submit" form="add-property-form" class="btn btn-primary" id="btn-submit-prop">Save Listing</button>
    `,
    onMount: (dialog) => {
      dialog.querySelector('#btn-cancel-prop').onclick = () => modal.close();
      const form = dialog.querySelector('#add-property-form');
      form.onsubmit = (e) => {
        e.preventDefault();
        const title = dialog.querySelector('#prop-title').value.trim();
        const area = dialog.querySelector('#prop-area').value.trim();
        const bhk = dialog.querySelector('#prop-bhk').value;
        const mode = dialog.querySelector('#prop-mode').value;
        const price = Number(dialog.querySelector('#prop-price').value);
        const sqft = Number(dialog.querySelector('#prop-sqft').value);
        const description = dialog.querySelector('#prop-desc').value.trim();

        if (!title || !area || !price) {
          toast.error('Please fill in title, area, and price');
          return;
        }

        store.addProperty({
          title,
          area,
          bhk,
          mode,
          price,
          sqft,
          description
        });

        modal.close();
        toast.success(`Property "${title}" listed successfully`);
        if (typeof onSuccess === 'function') onSuccess();
      };
    }
  });
}
