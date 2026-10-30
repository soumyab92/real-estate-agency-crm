import { store } from '../data/store.js';
import { STAGES, AGENTS, LEAD_KINDS, AREAS, TASK_TYPES, CONTACT_TYPES } from '../data/initialData.js';
import { formatCurrency, formatPropertyPrice, formatDate, getDateOffset, escapeHtml } from '../utils/formatters.js';
import { modal } from '../components/modal.js';
import { toast } from '../utils/toast.js';
import { openOfferSheetModal } from './offerSheetModal.js';

export function openClientModal(leadId) {
  const lead = store.getLeadById(leadId);
  if (!lead) return;

  const matchingProps = store.getMatchingProperties(lead, 4);
  const totalComm = store.getLeadCommission(lead);
  const totalPaid = store.getLeadPaid(lead);
  const totalDue = Math.max(0, totalComm - totalPaid);
  const tasks = store.getTasks().filter(t => t.leadId === lead.id && !t.completed);

  const bodyHtml = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Main Details Form -->
      <form id="edit-lead-form">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label" for="edit-name">Client Name</label>
            <input type="text" id="edit-name" class="form-input" value="${escapeHtml(lead.name)}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="edit-phone">Phone Number</label>
            <input type="text" id="edit-phone" class="form-input" value="${escapeHtml(lead.phone || '')}">
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label" for="edit-kind">Client Intent</label>
            <select id="edit-kind" class="form-select">
              ${LEAD_KINDS.map(k => `<option value="${k}" ${lead.kind === k ? 'selected' : ''}>${k}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-area">Preferred Locality</label>
            <input type="text" id="edit-area" class="form-input" list="edit-area-list" value="${escapeHtml(lead.area)}">
            <datalist id="edit-area-list">
              ${AREAS.map(a => `<option value="${a}">`).join('')}
            </datalist>
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-type">Requirement</label>
            <input type="text" id="edit-type" class="form-input" value="${escapeHtml(lead.type)}">
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label" for="edit-budget">Budget / Deal Value (₹)</label>
            <input type="number" id="edit-budget" class="form-input" value="${lead.budget}" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-rate">Brokerage Rate (%)</label>
            <input type="number" step="0.1" id="edit-rate" class="form-input" value="${lead.rate || 2}" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-target-date">Target Date</label>
            <input type="date" id="edit-target-date" class="form-input" value="${lead.targetDate || getDateOffset(30)}">
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label" for="edit-agent">Assigned Broker / Agent</label>
            <select id="edit-agent" class="form-select">
              ${AGENTS.map(a => `<option value="${a}" ${lead.agent === a ? 'selected' : ''}>${a}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-stage">Pipeline Stage</label>
            <select id="edit-stage" class="form-select">
              ${STAGES.map(s => `<option value="${s}" ${lead.stage === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="edit-note">Client Notes & Requirements</label>
          <textarea id="edit-note" class="form-textarea" rows="2">${escapeHtml(lead.note || '')}</textarea>
        </div>
      </form>

      <!-- Inventory Matching Section -->
      <div>
        <h4 class="contact-section-title">
          <span>Matching Available Properties</span>
          <span style="font-size: 0.8rem; font-weight: normal; color: var(--ink-secondary);">${matchingProps.length} matches</span>
        </h4>
        ${matchingProps.length === 0 ? `
          <p style="font-size: 0.85rem; color: var(--ink-tertiary);">
            ${lead.kind === 'Seller' ? 'Sellers do not require buyer property matching.' : 'No available properties match current budget and type.'}
          </p>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${matchingProps.map(prop => `
              <div class="list-item-row" style="background: var(--bg-subtle); padding: 10px 14px; border-radius: var(--radius-sm);">
                <div>
                  <strong>${escapeHtml(prop.title)}</strong>
                  <div style="font-size: 0.8rem; color: var(--ink-secondary);">
                    ${escapeHtml(prop.area)} • ${escapeHtml(prop.bhk)} • ${prop.sqft} sq.ft
                    ${prop.area === lead.area ? '<span class="badge badge-accent" style="margin-left: 6px;">Same Locality</span>' : ''}
                  </div>
                </div>
                <div style="text-align: right;">
                  <strong style="color: var(--brand-primary);">${formatPropertyPrice(prop)}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Brokerage & Payment Ledger Section -->
      <div>
        <h4 class="contact-section-title">
          <span>Commission & Payment Ledger</span>
          <span style="font-size: 0.85rem; color: var(--ink-secondary);">
            ${formatCurrency(totalPaid)} of ${formatCurrency(totalComm)} (${totalDue > 0 ? `Due: ${formatCurrency(totalDue)}` : 'Fully Paid'})
          </span>
        </h4>

        ${lead.payments && lead.payments.length > 0 ? `
          <div style="margin-bottom: 12px;">
            ${lead.payments.map(p => `
              <div class="list-item-row">
                <div>
                  <strong>${formatCurrency(p.amount)}</strong>
                  <div style="font-size: 0.8rem; color: var(--ink-tertiary);">${escapeHtml(p.note)}</div>
                </div>
                <span style="font-size: 0.85rem; color: var(--ink-secondary);">${formatDate(p.date)}</span>
              </div>
            `).join('')}
          </div>
        ` : '<p style="font-size: 0.85rem; color: var(--ink-tertiary); margin-bottom: 8px;">No payments recorded yet.</p>'}

        <div style="display: flex; gap: 8px; align-items: center; background: var(--bg-subtle); padding: 10px; border-radius: var(--radius-sm);">
          <input type="number" id="pay-amt-input" class="form-input" placeholder="Amount (₹)" min="1" style="max-width: 160px;">
          <input type="text" id="pay-note-input" class="form-input" placeholder="Note (e.g. Booking Token, Advance)" style="flex: 1;">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-record-payment">Record Receipt</button>
        </div>
      </div>

      <!-- Follow-up Tasks Section -->
      <div>
        <h4 class="contact-section-title">
          <span>Follow-up Reminders</span>
          <span style="font-size: 0.8rem; color: var(--ink-secondary);">${tasks.length} open</span>
        </h4>
        ${tasks.length > 0 ? `
          <div style="margin-bottom: 10px;">
            ${tasks.map(t => `
              <div class="list-item-row">
                <div>
                  <span class="badge badge-neutral">${escapeHtml(t.type)}</span>
                  <span style="margin-left: 6px;">${escapeHtml(t.title)}</span>
                </div>
                <span style="font-size: 0.85rem; color: var(--ink-secondary);">${formatDate(t.dueDate)}</span>
              </div>
            `).join('')}
          </div>
        ` : '<p style="font-size: 0.85rem; color: var(--ink-tertiary); margin-bottom: 8px;">No pending follow-ups for this client.</p>'}

        <div style="display: flex; gap: 8px; align-items: center; background: var(--bg-subtle); padding: 10px; border-radius: var(--radius-sm);">
          <select id="quick-task-type" class="form-select" style="max-width: 130px;">
            ${TASK_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
          <input type="text" id="quick-task-title" class="form-input" placeholder="Action description" style="flex: 1;">
          <input type="date" id="quick-task-due" class="form-input" value="${getDateOffset(2)}" style="max-width: 140px;">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-quick-add-task">Add Task</button>
        </div>
      </div>

      <!-- Communication Log -->
      <div>
        <h4 class="contact-section-title">Communication History</h4>
        ${lead.logs && lead.logs.length > 0 ? `
          <div style="margin-bottom: 10px;">
            ${lead.logs.slice(0, 5).map(log => `
              <div class="list-item-row">
                <div>
                  <span class="badge badge-accent">${escapeHtml(log.type)}</span>
                  <span style="margin-left: 6px;">${escapeHtml(log.text)}</span>
                </div>
                <span style="font-size: 0.8rem; color: var(--ink-tertiary);">${formatDate(log.date)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="display: flex; gap: 8px; align-items: center; background: var(--bg-subtle); padding: 10px; border-radius: var(--radius-sm);">
          <select id="quick-log-type" class="form-select" style="max-width: 120px;">
            ${CONTACT_TYPES.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
          <input type="text" id="quick-log-text" class="form-input" placeholder="Log call or meeting notes..." style="flex: 1;">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-quick-add-log">Log Touchpoint</button>
        </div>
      </div>
    </div>
  `;

  const footerHtml = `
    <button type="button" class="btn btn-danger btn-sm" id="btn-delete-lead" style="margin-right: auto;">
      Delete Client
    </button>
    <button type="button" class="btn btn-accent btn-sm" id="btn-offer-sheet">
      📄 Build Offer Sheet
    </button>
    <button type="button" class="btn btn-ghost" id="btn-close-lead-modal">
      Close
    </button>
    <button type="button" class="btn btn-primary" id="btn-save-lead">
      Save Changes
    </button>
  `;

  modal.open({
    title: `${lead.name} — Client 360°`,
    bodyHtml,
    footerHtml,
    onMount: (dialog) => {
      // Close modal
      dialog.querySelector('#btn-close-lead-modal').onclick = () => modal.close();

      // Delete Lead
      dialog.querySelector('#btn-delete-lead').onclick = () => {
        if (confirm(`Are you sure you want to permanently delete ${lead.name}?`)) {
          store.deleteLead(lead.id);
          modal.close();
          toast.info(`${lead.name} deleted`);
        }
      };

      // Open Offer Sheet
      dialog.querySelector('#btn-offer-sheet').onclick = () => {
        saveLeadChanges(dialog, lead.id);
        openOfferSheetModal(lead.id);
      };

      // Save Changes
      dialog.querySelector('#btn-save-lead').onclick = () => {
        saveLeadChanges(dialog, lead.id);
        modal.close();
        toast.success('Client details updated');
      };

      // Record Payment
      dialog.querySelector('#btn-record-payment').onclick = () => {
        const amt = Number(dialog.querySelector('#pay-amt-input').value);
        const note = dialog.querySelector('#pay-note-input').value.trim() || 'Payment received';
        if (!amt || amt <= 0) {
          toast.error('Please enter a valid payment amount');
          return;
        }
        store.addPayment(lead.id, { amount: amt, note });
        toast.success(`Payment of ${formatCurrency(amt)} recorded`);
        openClientModal(lead.id);
      };

      // Quick Add Task
      dialog.querySelector('#btn-quick-add-task').onclick = () => {
        const title = dialog.querySelector('#quick-task-title').value.trim();
        const type = dialog.querySelector('#quick-task-type').value;
        const dueDate = dialog.querySelector('#quick-task-due').value;
        if (!title) {
          toast.error('Please describe the follow-up task');
          return;
        }
        store.addTask({ leadId: lead.id, title, type, dueDate });
        toast.success('Follow-up scheduled');
        openClientModal(lead.id);
      };

      // Quick Add Log
      dialog.querySelector('#btn-quick-add-log').onclick = () => {
        const text = dialog.querySelector('#quick-log-text').value.trim();
        const type = dialog.querySelector('#quick-log-type').value;
        if (!text) {
          toast.error('Please enter interaction notes');
          return;
        }
        store.addLog(lead.id, { type, text });
        toast.success('Interaction logged');
        openClientModal(lead.id);
      };
    }
  });
}

function saveLeadChanges(dialog, leadId) {
  const updates = {
    name: dialog.querySelector('#edit-name').value.trim(),
    phone: dialog.querySelector('#edit-phone').value.trim(),
    kind: dialog.querySelector('#edit-kind').value,
    area: dialog.querySelector('#edit-area').value.trim(),
    type: dialog.querySelector('#edit-type').value.trim(),
    budget: Number(dialog.querySelector('#edit-budget').value) || 0,
    rate: Number(dialog.querySelector('#edit-rate').value) || 2,
    targetDate: dialog.querySelector('#edit-target-date').value,
    agent: dialog.querySelector('#edit-agent').value,
    stage: dialog.querySelector('#edit-stage').value,
    note: dialog.querySelector('#edit-note').value.trim()
  };
  store.updateLead(leadId, updates);
}

export function openNewLeadModal(defaultStage = 'New lead') {
  modal.open({
    title: 'Create New Client Lead',
    bodyHtml: `
      <form id="new-lead-form">
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label" for="new-name">Client Full Name</label>
            <input type="text" id="new-name" class="form-input" placeholder="e.g. Suman Sen" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="new-phone">Phone Number</label>
            <input type="text" id="new-phone" class="form-input" placeholder="+91 98300 00000" required>
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label" for="new-kind">Client Intent</label>
            <select id="new-kind" class="form-select">
              <option value="Buyer" selected>Buyer</option>
              <option value="Renter">Renter</option>
              <option value="Seller">Seller</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="new-area">Target Locality</label>
            <input type="text" id="new-area" class="form-input" list="new-area-list" placeholder="e.g. Salt Lake" required>
            <datalist id="new-area-list">
              ${AREAS.map(a => `<option value="${a}">`).join('')}
            </datalist>
          </div>

          <div class="form-group">
            <label class="form-label" for="new-type">Unit Specification</label>
            <input type="text" id="new-type" class="form-input" value="3 BHK" required>
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label" for="new-budget">Budget / Expected Deal (₹)</label>
            <input type="number" id="new-budget" class="form-input" min="1000" step="10000" value="9500000" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="new-rate">Brokerage Rate (%)</label>
            <input type="number" step="0.1" id="new-rate" class="form-input" value="2" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="new-agent">Assigned Broker</label>
            <select id="new-agent" class="form-select">
              ${AGENTS.map(a => `<option value="${a}">${a}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="new-note">Special Client Preferences / Notes</label>
          <textarea id="new-note" class="form-textarea" rows="2" placeholder="e.g. Prefers morning sunlight, Vastu compliant, parking essential"></textarea>
        </div>
      </form>
    `,
    footerHtml: `
      <button type="button" class="btn btn-ghost" id="btn-cancel-lead">Cancel</button>
      <button type="submit" form="new-lead-form" class="btn btn-primary" id="btn-submit-lead">Create Lead</button>
    `,
    onMount: (dialog) => {
      dialog.querySelector('#btn-cancel-lead').onclick = () => modal.close();
      const form = dialog.querySelector('#new-lead-form');
      form.onsubmit = (e) => {
        e.preventDefault();
        const name = dialog.querySelector('#new-name').value.trim();
        const phone = dialog.querySelector('#new-phone').value.trim();
        const kind = dialog.querySelector('#new-kind').value;
        const area = dialog.querySelector('#new-area').value.trim();
        const type = dialog.querySelector('#new-type').value.trim();
        const budget = Number(dialog.querySelector('#new-budget').value);
        const rate = Number(dialog.querySelector('#new-rate').value);
        const agent = dialog.querySelector('#new-agent').value;
        const note = dialog.querySelector('#new-note').value.trim();

        if (!name || !phone || !area || !budget) {
          toast.error('Please fill in all required fields');
          return;
        }

        const newLead = store.addLead({
          name,
          phone,
          kind,
          area,
          type,
          budget,
          rate,
          agent,
          stage: defaultStage,
          targetDate: getDateOffset(45),
          note
        });

        modal.close();
        toast.success(`Lead created for ${name}`);
        openClientModal(newLead.id);
      };
    }
  });
}
