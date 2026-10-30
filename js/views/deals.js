import { store } from '../data/store.js';
import { formatCurrency, escapeHtml, formatDate } from '../utils/formatters.js';
import { openClientModal } from './clientModal.js';

export function renderDeals(container, filterTerm = '', selectedAgent = '') {
  let leads = store.getLeads().filter(l => l.stage === 'Closed');
  if (selectedAgent) {
    leads = leads.filter(l => l.agent === selectedAgent);
  }
  if (filterTerm) {
    const term = filterTerm.toLowerCase();
    leads = leads.filter(l => (l.name + ' ' + l.area + ' ' + l.type).toLowerCase().includes(term));
  }

  if (leads.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
        </div>
        <h3 class="empty-state-title">No closed deals found</h3>
        <p class="empty-state-desc">Move leads to the 'Closed' stage in the Pipeline to record completed agency deals.</p>
        <a href="#pipeline" class="btn btn-primary">Go to Pipeline</a>
      </div>
    `;
    return;
  }

  const totalValue = leads.reduce((sum, l) => sum + (l.budget || 0), 0);
  const totalCommission = leads.reduce((sum, l) => sum + store.getLeadCommission(l), 0);
  const totalCollected = leads.reduce((sum, l) => sum + store.getLeadPaid(l), 0);
  const totalDue = Math.max(0, totalCommission - totalCollected);

  container.innerHTML = `
    <div class="kpi-grid" style="margin-bottom: 20px;">
      <div class="kpi-card">
        <div class="kpi-header"><span class="kpi-label">Closed Deal Volume</span></div>
        <div class="kpi-value">${formatCurrency(totalValue)}</div>
        <div class="kpi-sub">${leads.length} completed transactions</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-header"><span class="kpi-label">Gross Brokerage</span></div>
        <div class="kpi-value" style="color: var(--status-success);">${formatCurrency(totalCommission)}</div>
        <div class="kpi-sub">Total earned revenue</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-header"><span class="kpi-label">Collected In Bank</span></div>
        <div class="kpi-value">${formatCurrency(totalCollected)}</div>
        <div class="kpi-sub">Realized cash in bank</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-header"><span class="kpi-label">Uncollected Balance</span></div>
        <div class="kpi-value" style="color: ${totalDue > 0 ? 'var(--status-danger)' : 'inherit'};">${formatCurrency(totalDue)}</div>
        <div class="kpi-sub">Receivable from clients</div>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Type</th>
            <th>Area</th>
            <th>Deal Value</th>
            <th>Commission</th>
            <th>Collected</th>
            <th>Status</th>
            <th>Agent</th>
            <th>Closed Date</th>
          </tr>
        </thead>
        <tbody>
          ${leads.map(lead => {
            const comm = store.getLeadCommission(lead);
            const paid = store.getLeadPaid(lead);
            const due = Math.max(0, comm - paid);
            const isSettled = due <= 0;

            return `
              <tr data-id="${lead.id}">
                <td>
                  <strong>${escapeHtml(lead.name)}</strong>
                  <div style="font-size: 0.8rem; color: var(--ink-tertiary);">${escapeHtml(lead.phone || '-')}</div>
                </td>
                <td><span class="badge ${lead.kind === 'Buyer' ? 'badge-info' : 'badge-warning'}">${lead.kind}</span></td>
                <td>${escapeHtml(lead.area)}</td>
                <td><strong>${formatCurrency(lead.budget)}</strong></td>
                <td>${formatCurrency(comm)}</td>
                <td>${formatCurrency(paid)}</td>
                <td>
                  ${isSettled 
                    ? '<span class="badge badge-success">✓ Fully Settled</span>' 
                    : `<span class="badge badge-danger">Due ${formatCurrency(due)}</span>`
                  }
                </td>
                <td>${escapeHtml(lead.agent)}</td>
                <td>${formatDate(lead.targetDate)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll('tbody tr').forEach(row => {
    row.addEventListener('click', () => {
      openClientModal(Number(row.dataset.id));
    });
  });
}
