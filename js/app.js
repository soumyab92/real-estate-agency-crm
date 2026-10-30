import { store } from './data/store.js';
import { AGENTS } from './data/initialData.js';
import { renderDashboard } from './views/dashboard.js';
import { renderPipeline } from './views/pipeline.js';
import { renderDeals } from './views/deals.js';
import { renderClients } from './views/clients.js';
import { renderTasks } from './views/tasks.js';
import { renderListings } from './views/listings.js';
import { renderSettings } from './views/settings.js';
import { openNewLeadModal, openClientModal } from './views/clientModal.js';
import { toast } from './utils/toast.js';

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.searchQuery = '';
    this.selectedAgent = '';

    this.container = document.getElementById('view-container');
    this.titleEl = document.getElementById('view-title');
    this.searchInput = document.getElementById('global-search');
    this.agentSelect = document.getElementById('agent-filter');
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.sidebar = document.getElementById('sidebar');
    this.sidebarBackdrop = document.getElementById('sidebar-backdrop');
    this.menuToggle = document.getElementById('menu-toggle');
    this.newLeadBtn = document.getElementById('btn-new-lead-main');

    this.views = {
      dashboard: { title: 'Executive Dashboard', render: renderDashboard },
      pipeline: { title: 'Deal Pipeline', render: renderPipeline },
      deals: { title: 'Closed Transactions', render: renderDeals },
      clients: { title: 'Contacts & Directory', render: renderClients },
      tasks: { title: 'Follow-ups & Tasks', render: renderTasks },
      listings: { title: 'Property Inventory', render: renderListings },
      settings: { title: 'Settings & Backups', render: renderSettings }
    };
  }

  init() {
    this.initTheme();
    this.initAgentFilter();
    this.initEvents();
    this.handleRoute();

    // Auto re-render on data store mutations
    store.subscribe(() => {
      this.render();
      this.updateBadges();
    });

    this.updateBadges();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('hearth_theme') || (
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('hearth_theme', next);
    toast.info(`Switched to ${next} theme`);
  }

  initAgentFilter() {
    if (!this.agentSelect) return;
    this.agentSelect.innerHTML = '<option value="">All Brokers</option>' + 
      AGENTS.map(agent => `<option value="${agent}">${agent}</option>`).join('');
  }

  initEvents() {
    // Hash change router
    window.addEventListener('hashchange', () => this.handleRoute());

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.render();
      });
    }

    // Agent selector filter
    if (this.agentSelect) {
      this.agentSelect.addEventListener('change', (e) => {
        this.selectedAgent = e.target.value;
        this.render();
      });
    }

    // Theme toggle
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    // New lead button
    if (this.newLeadBtn) {
      this.newLeadBtn.addEventListener('click', () => openNewLeadModal());
    }

    // Mobile sidebar toggle
    if (this.menuToggle && this.sidebar && this.sidebarBackdrop) {
      this.menuToggle.addEventListener('click', () => {
        this.sidebar.classList.toggle('open');
        this.sidebarBackdrop.classList.toggle('open');
      });

      this.sidebarBackdrop.addEventListener('click', () => {
        this.sidebar.classList.remove('open');
        this.sidebarBackdrop.classList.remove('open');
      });
    }

    // Custom event to open client modal from anywhere
    document.addEventListener('open-client-modal', (e) => {
      if (e.detail && e.detail.id) {
        openClientModal(e.detail.id);
      }
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in form field
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openNewLeadModal();
      } else if (e.key === '/') {
        e.preventDefault();
        if (this.searchInput) this.searchInput.focus();
      } else if (e.key === 't' || e.key === 'T') {
        this.toggleTheme();
      }
    });
  }

  handleRoute() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    this.currentView = this.views[hash] ? hash : 'dashboard';

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkView = link.getAttribute('data-view');
      link.classList.toggle('active', linkView === this.currentView);
    });

    // Close mobile sidebar on navigation
    if (this.sidebar && this.sidebarBackdrop) {
      this.sidebar.classList.remove('open');
      this.sidebarBackdrop.classList.remove('open');
    }

    this.render();
  }

  render() {
    const viewConfig = this.views[this.currentView];
    if (!viewConfig || !this.container) return;

    if (this.titleEl) {
      this.titleEl.textContent = viewConfig.title;
    }

    viewConfig.render(this.container, this.searchQuery, this.selectedAgent);
  }

  updateBadges() {
    const today = new Date().toISOString().slice(0, 10);
    const overdueCount = store.getTasks().filter(t => !t.completed && t.dueDate < today).length;
    const activeLeadsCount = store.getLeads().filter(l => l.stage !== 'Closed').length;

    const taskBadge = document.getElementById('badge-tasks-count');
    if (taskBadge) {
      taskBadge.textContent = overdueCount > 0 ? `${overdueCount} late` : '';
      taskBadge.style.display = overdueCount > 0 ? 'inline-block' : 'none';
      taskBadge.style.color = 'var(--status-danger)';
    }

    const pipelineBadge = document.getElementById('badge-pipeline-count');
    if (pipelineBadge) {
      pipelineBadge.textContent = activeLeadsCount > 0 ? activeLeadsCount : '';
      pipelineBadge.style.display = activeLeadsCount > 0 ? 'inline-block' : 'none';
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
