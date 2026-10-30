/**
 * Format currency in Indian numbering system (₹ Cr, ₹ L, ₹)
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const num = Number(amount);
  if (num >= 1e7) {
    return `₹${(num / 1e7).toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (num >= 1e5) {
    return `₹${(num / 1e5).toFixed(1).replace(/\.0$/, '')} L`;
  }
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
}

/**
 * Format a full price with unit for rental properties
 * @param {object} property
 * @returns {string}
 */
export function formatPropertyPrice(property) {
  const base = formatCurrency(property.price);
  return property.mode === 'Rent' ? `${base}/mo` : base;
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[match]));
}

/**
 * Format a date string into readable Indian standard format (e.g. "24 Oct 2026")
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatDate(dateVal) {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Get date offset by N days formatted as YYYY-MM-DD
 * @param {number} offsetDays
 * @returns {string}
 */
export function getDateOffset(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toISOString().slice(0, 10);
}

/**
 * Clean phone number for tel: or wa.me links
 * @param {string} phone
 * @returns {string}
 */
export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}
