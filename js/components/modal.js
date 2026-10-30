/**
 * Accessible Native Modal Dialog Controller
 */
class ModalController {
  constructor() {
    this.dialog = document.getElementById('app-modal');
    if (!this.dialog) {
      this.dialog = document.createElement('dialog');
      this.dialog.id = 'app-modal';
      this.dialog.className = 'modal';
      document.body.appendChild(this.dialog);

      // Close when clicking directly on backdrop
      this.dialog.addEventListener('click', (e) => {
        const rect = this.dialog.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          this.close();
        }
      });
    }
  }

  /**
   * Render and open the modal
   * @param {object} options
   * @param {string} options.title
   * @param {string} options.bodyHtml
   * @param {string} [options.footerHtml]
   * @param {function} [options.onMount]
   */
  open({ title, bodyHtml, footerHtml = '', onMount }) {
    this.dialog.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button type="button" class="btn-icon btn-ghost" id="modal-close-btn" aria-label="Close dialog">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        ${bodyHtml}
      </div>
      ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
    `;

    const closeBtn = this.dialog.querySelector('#modal-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => this.close();
    }

    if (!this.dialog.open) {
      this.dialog.showModal();
    }

    if (typeof onMount === 'function') {
      onMount(this.dialog);
    }
  }

  close() {
    if (this.dialog && this.dialog.open) {
      this.dialog.close();
      this.dialog.innerHTML = '';
    }
  }
}

export const modal = new ModalController();
