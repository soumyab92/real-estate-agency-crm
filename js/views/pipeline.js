import { store } from '../data/store.js';
import { STAGES } from '../data/initialData.js';
import { formatCurrency, escapeHtml } from '../utils/formatters.js';
import { openClientModal } from './clientModal.js';
import { toast } from '../utils/toast.js';

export function renderPipeline(container, filterTerm = '', selectedAgent = '') {
  let leads = store.getLeads();
  if (selectedAgent) {
    leads = leads.filter(l => l.agent === selectedAgent);
  }
  if (filterTerm) {
    const term = filterTerm.toLowerCase();
    leads = leads.filter(l => (l.name + ' ' + l.area + ' ' + l.type).toLowerCase().includes(term));
  }

  const columnsHtml = STAGES.map(stage => {
    const stageLeads = leads.filter(l => l.stage === stage);
    const stageTotalValue = stageLeads.reduce((sum, l) => sum + (l.budget || 0), 0);

    const cardsHtml = stageLeads.map(lead => {
      const isRent = lead.kind === 'Renter';
      return `
        <div class="lead-card" draggable="true" data-id="${lead.id}">
          <div class="card-top">
            <span class="lead-name">${escapeHtml(lead.name)}</span>
            <span class="badge ${lead.kind === 'Buyer' ? 'badge-info' : lead.kind === 'Seller' ? 'badge-warning' : 'badge-neutral'}">${lead.kind}</span>
          </div>
          <div class="lead-meta">
            ${escapeHtml(lead.type)} · ${escapeHtml(lead.area)}
          </div>
          <div class="card-bottom">
            <span class="lead-budget">${formatCurrency(lead.budget)}${isRent ? '/mo' : ''}</span>
            <span class="lead-agent">${escapeHtml(lead.agent)}</span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="kanban-column" data-stage="${stage}">
        <div class="kanban-column-header">
          <div class="column-title-group">
            <span class="column-title">${stage}</span>
            <span class="column-count">${stageLeads.length}</span>
          </div>
          <span class="column-sum">${formatCurrency(stageTotalValue)}</span>
        </div>
        <div class="kanban-cards">
          ${cardsHtml || '<div class="empty-state" style="padding: 20px;"><p style="font-size:0.85rem">No leads</p></div>'}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="pipeline-board">
      ${columnsHtml}
    </div>
    <p style="margin-top: 14px; font-size: 0.85rem; color: var(--ink-tertiary);">
      💡 Tip: Drag and drop cards between stages, or click any card to inspect contacts, matching properties, and commission.
    </p>
  `;

  // Attach card click & drag events
  container.querySelectorAll('.lead-card').forEach(card => {
    const id = Number(card.dataset.id);
    card.addEventListener('click', () => {
      openClientModal(id);
    });

    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', String(id));
      e.dataTransfer.effectAllowed = 'move';
      card.style.opacity = '0.5';
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
    });
  });

  // Attach column drop events
  container.querySelectorAll('.kanban-column').forEach(col => {
    const stage = col.dataset.stage;

    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const leadId = Number(e.dataTransfer.getData('text/plain'));
      if (leadId) {
        const lead = store.getLeadById(leadId);
        if (lead && lead.stage !== stage) {
          store.moveLeadStage(leadId, stage);
          toast.success(`${lead.name} moved to ${stage}`);
        }
      }
    });
  });
}
