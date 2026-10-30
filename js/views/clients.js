import { store } from '../data/store.js';
import { formatCurrency, escapeHtml, formatDate, cleanPhoneNumber } from '../utils/formatters.js';
import { openClientModal, openNewLeadModal } from './clientModal.js';

export function renderClients(container, filterTerm = '', selectedAgent = '') {
  let leads = store.getLeads();
  if (selectedAgent) {
    leads = leads.filter(l => l.agent === selectedAgent);
  }
  if (filterTerm) {
    const term = filterTerm.toLowerCase();
    leads = leads.filter(l => (l.name + ' ' + l.area + ' ' + l.type + ' ' + (l.phone || '')).toLowerCase().includes(term));
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
      <div style="color: var(--ink-secondary); font-size: 0.95rem;">
        Showing <strong>${leads.length}</strong> active client relationships
      </div>
      <button type="button" class="btn btn-primary" id="btn-add-client-top">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        New Client / Lead
      </button>
    </div>

    ${leads.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <h3 class="empty-state-title">No matching contacts</h3>
        <p class="empty-state-desc">Try clearing the search query or agent filter, or add a new lead to get started.</p>
      </div>
    ` : `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name & Contact</th>
              <th>Intent & Type</th>
              <th>Preferred Locality</th>
              <th>Budget / Target</th>
              <th>Pipeline Stage</th>
              <th>Assigned Agent</th>
              <th>Last Touchpoint</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${leads.map(lead => {
              const lastLog = lead.logs && lead.logs.length > 0 ? lead.logs[0] : null;
              const cleanPhone = cleanPhoneNumber(lead.phone);
              const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}` : '';

              return `
                <tr data-id="${lead.id}">
                  <td>
                    <strong>${escapeHtml(lead.name)}</strong>
                    <div style="font-size: 0.8rem; color: var(--ink-secondary);">
                      ${escapeHtml(lead.phone || '-')}
                    </div>
                  </td>
                  <td>
                    <span class="badge ${lead.kind === 'Buyer' ? 'badge-info' : lead.kind === 'Seller' ? 'badge-warning' : 'badge-neutral'}">${lead.kind}</span>
                    <span style="font-size: 0.85rem; margin-left: 4px;">${escapeHtml(lead.type)}</span>
                  </td>
                  <td>${escapeHtml(lead.area)}</td>
                  <td>
                    <strong>${formatCurrency(lead.budget)}${lead.kind === 'Renter' ? '/mo' : ''}</strong>
                  </td>
                  <td>
                    <span class="badge badge-accent">${escapeHtml(lead.stage)}</span>
                  </td>
                  <td>${escapeHtml(lead.agent)}</td>
                  <td>
                    <div style="font-size: 0.85rem;">${lastLog ? `${escapeHtml(lastLog.type)} · ${formatDate(lastLog.date)}` : 'None'}</div>
                    <div style="font-size: 0.75rem; color: var(--ink-tertiary); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      ${lastLog ? escapeHtml(lastLog.text) : ''}
                    </div>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;" class="no-propagate">
                      ${waUrl ? `
                        <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm" title="Chat on WhatsApp" onclick="event.stopPropagation()">
                          WA
                        </a>
                      ` : ''}
                      <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); document.dispatchEvent(new CustomEvent('open-client-modal', { detail: { id: ${lead.id} } }));">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `}
  `;

  const addBtn = container.querySelector('#btn-add-client-top');
  if (addBtn) {
    addBtn.onclick = () => openNewLeadModal();
  }

  container.querySelectorAll('tbody tr').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.no-propagate') || e.target.closest('a')) return;
      openClientModal(Number(row.dataset.id));
    });
  });
}
