import { store } from '../data/store.js';
import { formatCurrency, escapeHtml, formatDate } from '../utils/formatters.js';

export function renderDashboard(container, filterTerm = '', selectedAgent = '') {
  let leads = store.getLeads();
  if (selectedAgent) {
    leads = leads.filter(l => l.agent === selectedAgent);
  }
  if (filterTerm) {
    const term = filterTerm.toLowerCase();
    leads = leads.filter(l => (l.name + ' ' + l.area + ' ' + l.type).toLowerCase().includes(term));
  }

  const closedLeads = leads.filter(l => l.stage === 'Closed');
  const activeLeads = leads.filter(l => l.stage !== 'Closed');

  const expectedCommission = activeLeads.reduce((sum, l) => sum + store.getLeadCommission(l), 0);
  const earnedCommission = closedLeads.reduce((sum, l) => sum + store.getLeadCommission(l), 0);
  const collectedCommission = closedLeads.reduce((sum, l) => sum + store.getLeadPaid(l), 0);
  const outstandingCommission = Math.max(0, earnedCommission - collectedCommission);
  const closeRate = leads.length > 0 ? Math.round((closedLeads.length / leads.length) * 100) : 0;

  const today = new Date().toISOString().slice(0, 10);
  const overdueTasks = store.getTasks().filter(t => !t.completed && t.dueDate < today).length;

  // Monthly breakdown of closed deals
  const monthlyMap = {};
  closedLeads.forEach(l => {
    const dateStr = l.targetDate || today;
    const monthKey = new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + store.getLeadCommission(l);
  });

  // Commission by stage
  const stageMap = { 'New lead': 0, 'Site visit': 0, 'Negotiation': 0, 'Closed': 0 };
  leads.forEach(l => {
    if (stageMap[l.stage] !== undefined) {
      stageMap[l.stage] += store.getLeadCommission(l);
    }
  });

  // Leads by locality
  const localityMap = {};
  leads.forEach(l => {
    localityMap[l.area] = (localityMap[l.area] || 0) + 1;
  });

  // Agent performance
  const agentMap = {};
  leads.forEach(l => {
    if (!agentMap[l.agent]) {
      agentMap[l.agent] = { earned: 0, count: 0 };
    }
    agentMap[l.agent].count += 1;
    if (l.stage === 'Closed') {
      agentMap[l.agent].earned += store.getLeadCommission(l);
    }
  });

  container.innerHTML = `
    <!-- Top KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Pipeline Expected</span>
          <div class="kpi-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
        </div>
        <div class="kpi-value">${formatCurrency(expectedCommission)}</div>
        <div class="kpi-sub">${activeLeads.length} active opportunities</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Earned Commission</span>
          <div class="kpi-icon" style="color: var(--status-success); background: var(--status-success-bg);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
        </div>
        <div class="kpi-value" style="color: var(--status-success);">${formatCurrency(earnedCommission)}</div>
        <div class="kpi-sub">${closedLeads.length} closed deals</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Collected</span>
          <div class="kpi-icon" style="color: var(--brand-accent);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
          </div>
        </div>
        <div class="kpi-value">${formatCurrency(collectedCommission)}</div>
        <div class="kpi-sub">${Math.round(earnedCommission > 0 ? (collectedCommission / earnedCommission) * 100 : 0)}% realization rate</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Outstanding Dues</span>
          <div class="kpi-icon" style="color: var(--status-danger); background: var(--status-danger-bg);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
        </div>
        <div class="kpi-value" style="color: ${outstandingCommission > 0 ? 'var(--status-danger)' : 'inherit'};">${formatCurrency(outstandingCommission)}</div>
        <div class="kpi-sub">Pending client payouts</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Win Rate</span>
          <div class="kpi-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
        </div>
        <div class="kpi-value">${closeRate}%</div>
        <div class="kpi-sub">Total ${leads.length} leads</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">Overdue Tasks</span>
          <div class="kpi-icon" style="color: ${overdueTasks > 0 ? 'var(--status-danger)' : 'var(--ink-secondary)'};">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
        </div>
        <div class="kpi-value" style="color: ${overdueTasks > 0 ? 'var(--status-danger)' : 'inherit'};">${overdueTasks}</div>
        <div class="kpi-sub"><a href="#tasks">View follow-ups &rarr;</a></div>
      </div>
    </div>

    <!-- Analytics Charts Grid -->
    <div class="dashboard-grid">
      <div class="chart-card">
        <h3>
          <span>Commission by Stage</span>
          <span class="badge badge-neutral">Pipeline</span>
        </h3>
        <div class="metric-bar-list">
          ${renderMetricBars(stageMap, formatCurrency)}
        </div>
      </div>

      <div class="chart-card">
        <h3>
          <span>Monthly Revenue Trend</span>
          <span class="badge badge-success">Closed</span>
        </h3>
        <div class="metric-bar-list">
          ${renderMetricBars(monthlyMap, formatCurrency)}
        </div>
      </div>

      <div class="chart-card">
        <h3>
          <span>Top Localities</span>
          <span class="badge badge-info">Demand</span>
        </h3>
        <div class="metric-bar-list">
          ${renderMetricBars(localityMap, v => `${v} leads`)}
        </div>
      </div>

      <div class="chart-card">
        <h3>
          <span>Agent Leaderboard</span>
          <span class="badge badge-accent">Performance</span>
        </h3>
        <div class="metric-bar-list">
          ${renderAgentLeaderboard(agentMap)}
        </div>
      </div>
    </div>
  `;
}

function renderMetricBars(dataMap, formatFn) {
  const entries = Object.entries(dataMap);
  if (entries.length === 0) {
    return `<div class="empty-state" style="padding: 24px;"><p>No records recorded yet</p></div>`;
  }
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return entries.map(([key, val]) => {
    const pct = Math.max(8, Math.round((val / max) * 100));
    return `
      <div class="metric-bar-row">
        <span class="metric-bar-name" title="${escapeHtml(key)}">${escapeHtml(key)}</span>
        <div class="metric-bar-track">
          <div class="metric-bar-fill" style="width: ${pct}%;"></div>
        </div>
        <span class="metric-bar-val">${formatFn(val)}</span>
      </div>
    `;
  }).join('');
}

function renderAgentLeaderboard(agentMap) {
  const entries = Object.entries(agentMap).sort((a, b) => b[1].earned - a[1].earned);
  if (entries.length === 0) {
    return `<div class="empty-state" style="padding: 24px;"><p>No agent activity yet</p></div>`;
  }
  const maxEarned = Math.max(1, ...entries.map(([, v]) => v.earned));
  return entries.map(([agent, stats]) => {
    const pct = Math.max(8, Math.round((stats.earned / maxEarned) * 100));
    return `
      <div class="metric-bar-row">
        <span class="metric-bar-name" title="${escapeHtml(agent)}">${escapeHtml(agent)}</span>
        <div class="metric-bar-track">
          <div class="metric-bar-fill" style="width: ${pct}%;"></div>
        </div>
        <span class="metric-bar-val">${formatCurrency(stats.earned)}</span>
      </div>
    `;
  }).join('');
}
