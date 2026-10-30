import { store } from '../data/store.js';
import { formatCurrency, formatPropertyPrice, escapeHtml } from '../utils/formatters.js';
import { modal } from '../components/modal.js';
import { toast } from '../utils/toast.js';
import { openClientModal } from './clientModal.js';

export function openOfferSheetModal(leadId) {
  const lead = store.getLeadById(leadId);
  if (!lead) return;

  const properties = store.getProperties();
  const matchingProps = store.getMatchingProperties(lead, 1);
  const defaultProp = matchingProps[0] || properties.find(p => p.area === lead.area) || properties[0];

  const bodyHtml = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="offer-prop-select">Select Property Listing</label>
          <select id="offer-prop-select" class="form-select">
            ${properties.map(p => `
              <option value="${p.id}" ${defaultProp && defaultProp.id === p.id ? 'selected' : ''}>
                ${escapeHtml(p.title)} • ${escapeHtml(p.area)} (${formatPropertyPrice(p)})
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="offer-price-input">Proposed Offer Price (₹)</label>
          <input type="number" id="offer-price-input" class="form-input" value="${defaultProp ? defaultProp.price : lead.budget}" min="1000" step="5000">
        </div>
      </div>

      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" for="offer-token-pct">Token Booking Deposit (%)</label>
          <input type="number" id="offer-token-pct" class="form-input" value="10" min="1" max="50">
        </div>

        <div class="form-group">
          <label class="form-label" for="offer-rate-pct">Agency Brokerage Rate (%)</label>
          <input type="number" step="0.1" id="offer-rate-pct" class="form-input" value="${lead.rate || 2}">
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
        <label class="form-label" style="margin-bottom: 0;">Generated Formal Letter of Intent / Offer Sheet</label>
        <button type="button" class="btn btn-ghost btn-sm" id="btn-copy-offer-text">
          📋 Copy Text
        </button>
      </div>

      <div class="offer-sheet-paper" id="offer-sheet-display"></div>
    </div>
  `;

  const footerHtml = `
    <button type="button" class="btn btn-ghost" id="btn-back-to-lead" style="margin-right: auto;">
      &larr; Back to Client
    </button>
    <button type="button" class="btn btn-secondary" id="btn-print-offer">
      🖨️ Print / Save PDF
    </button>
    <button type="button" class="btn btn-accent" id="btn-apply-deal-val">
      ✓ Apply as Deal Value & Advance Stage
    </button>
  `;

  modal.open({
    title: `Formal Offer Sheet — ${lead.name}`,
    bodyHtml,
    footerHtml,
    onMount: (dialog) => {
      const propSelect = dialog.querySelector('#offer-prop-select');
      const priceInput = dialog.querySelector('#offer-price-input');
      const tokenInput = dialog.querySelector('#offer-token-pct');
      const rateInput = dialog.querySelector('#offer-rate-pct');
      const display = dialog.querySelector('#offer-sheet-display');

      const updateSheet = () => {
        const propId = Number(propSelect.value);
        const prop = store.getPropertyById(propId);
        if (!prop) return;

        const offerPrice = Number(priceInput.value) || 0;
        const tokenPct = Number(tokenInput.value) || 0;
        const brokeragePct = Number(rateInput.value) || 0;

        const tokenAmount = (offerPrice * tokenPct) / 100;
        const brokerageAmount = (offerPrice * brokeragePct) / 100;

        const letterText = 
`============================================================
              HEARTH REALTY & PROPERTY PARTNERS
               OFFER SHEET & LETTER OF INTENT
============================================================
Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

1. PARTIES INVOLVED
   Client / Buyer:    ${lead.name}
   Contact Number:    ${lead.phone || 'On file'}
   Handling Broker:   ${lead.agent}

2. PROPERTY DETAILS
   Property:          ${prop.title}
   Location:          ${prop.area}
   Specification:     ${prop.bhk} (${prop.sqft} sq.ft)
   Listing Mode:      For ${prop.mode}
   Official List Price: ${formatPropertyPrice(prop)}

3. COMMERCIAL PROPOSAL
   Offered Deal Value:  ${formatCurrency(offerPrice)}${prop.mode === 'Rent' ? ' / month' : ''}
   Booking Token (${tokenPct}%):  ${formatCurrency(tokenAmount)} (upon offer acceptance)
   Agency Brokerage (${brokeragePct}%): ${formatCurrency(brokerageAmount)}

4. EXECUTION TIMELINE & NEXT MILESTONES
   Step 1: Seller / Landlord reviews and confirms offer within 48 hours.
   Step 2: Payment of initial booking token & drafting of Agreement for Sale.
   Step 3: Title clearance, bank loan verification, and final legal registration.

------------------------------------------------------------
Authorized Signature: _______________________
(Handling Agent: ${lead.agent})
============================================================`;

        display.textContent = letterText;
      };

      propSelect.onchange = () => {
        const prop = store.getPropertyById(Number(propSelect.value));
        if (prop) {
          priceInput.value = prop.price;
        }
        updateSheet();
      };

      priceInput.oninput = updateSheet;
      tokenInput.oninput = updateSheet;
      rateInput.oninput = updateSheet;
      updateSheet();

      // Copy text button
      dialog.querySelector('#btn-copy-offer-text').onclick = () => {
        navigator.clipboard.writeText(display.textContent).then(() => {
          toast.success('Offer Sheet copied to clipboard!');
        }).catch(() => {
          toast.info('Press Ctrl+C to copy text');
        });
      };

      // Print / PDF button
      dialog.querySelector('#btn-print-offer').onclick = () => {
        window.print();
      };

      // Back to Client
      dialog.querySelector('#btn-back-to-lead').onclick = () => {
        openClientModal(lead.id);
      };

      // Apply as Deal Value
      dialog.querySelector('#btn-apply-deal-val').onclick = () => {
        const offerPrice = Number(priceInput.value) || 0;
        lead.budget = offerPrice;
        if (lead.stage === 'New lead' || lead.stage === 'Site visit') {
          store.moveLeadStage(lead.id, 'Negotiation');
        }
        store.addLog(lead.id, {
          type: 'Email',
          text: `Formal Offer Sheet prepared at ${formatCurrency(offerPrice)}`
        });
        store.save();
        toast.success(`Deal value updated to ${formatCurrency(offerPrice)}`);
        openClientModal(lead.id);
      };
    }
  });
}
