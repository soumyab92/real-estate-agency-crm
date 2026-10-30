import { store } from '../data/store.js';
import { TASK_TYPES } from '../data/initialData.js';
import { formatDate, getDateOffset, escapeHtml } from '../utils/formatters.js';
import { openClientModal } from './clientModal.js';
import { toast } from '../utils/toast.js';

let activeFilter = 'pending'; // 'all', 'pending', 'overdue', 'completed'

export function renderTasks(container, filterTerm = '', selectedAgent = '') {
  let tasks = store.getTasks();
  const leads = store.getLeads();
  const today = new Date().toISOString().slice(0, 10);

  // Filter tasks based on assigned agent (via client)
  if (selectedAgent) {
    tasks = tasks.filter(t => {
      const lead = store.getLeadById(t.leadId);
      return lead && lead.agent === selectedAgent;
    });
  }

  // Filter tasks by text query
  if (filterTerm) {
    const term = filterTerm.toLowerCase();
    tasks = tasks.filter(t => {
      const lead = store.getLeadById(t.leadId);
      const leadName = lead ? lead.name.toLowerCase() : '';
      return t.title.toLowerCase().includes(term) || t.type.toLowerCase().includes(term) || leadName.includes(term);
    });
  }

  // Filter by status tab
  let filteredTasks = [...tasks];
  if (activeFilter === 'pending') {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  } else if (activeFilter === 'overdue') {
    filteredTasks = filteredTasks.filter(t => !t.completed && t.dueDate < today);
  } else if (activeFilter === 'completed') {
    filteredTasks = filteredTasks.filter(t => t.completed);
  }

  // Sort: pending first, then by dueDate ascending
  filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  const overdueCount = tasks.filter(t => !t.completed && t.dueDate < today).length;
  const pendingCount = tasks.filter(t => !t.completed).length;

  container.innerHTML = `
    <!-- Quick Add Task Bar -->
    <div class="task-quick-add">
      <h3 style="margin-bottom: 12px; font-size: 1.05rem;">Schedule Follow-up</h3>
      <form id="task-add-form" class="task-add-grid">
        <div class="form-group task-span-full" style="margin-bottom: 0;">
          <label class="form-label" for="task-title-input">Follow-up Task</label>
          <input type="text" id="task-title-input" class="form-input" placeholder="e.g. Call to schedule 2nd site visit" required>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" for="task-type-select">Type</label>
          <select id="task-type-select" class="form-select">
            ${TASK_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" for="task-due-input">Due Date</label>
          <input type="date" id="task-due-input" class="form-input" value="${getDateOffset(1)}" required>
        </div>
        <div class="form-group task-span-full" style="margin-bottom: 0;">
          <label class="form-label" for="task-lead-select">Client / Lead</label>
          <select id="task-lead-select" class="form-select" required>
            ${leads.map(l => `<option value="${l.id}">${escapeHtml(l.name)} (${escapeHtml(l.area)})</option>`).join('')}
          </select>
        </div>
        <button type="submit" class="btn btn-primary task-span-full" style="height: 38px;">
          Add Task
        </button>
      </form>
    </div>

    <!-- Filter Tabs -->
    <div class="task-filters">
      <button type="button" class="btn ${activeFilter === 'pending' ? 'btn-primary' : 'btn-ghost'} btn-sm" data-tab="pending">
        Pending (${pendingCount})
      </button>
      <button type="button" class="btn ${activeFilter === 'overdue' ? 'btn-danger' : 'btn-ghost'} btn-sm" data-tab="overdue">
        Overdue (${overdueCount})
      </button>
      <button type="button" class="btn ${activeFilter === 'completed' ? 'btn-primary' : 'btn-ghost'} btn-sm" data-tab="completed">
        Completed
      </button>
      <button type="button" class="btn ${activeFilter === 'all' ? 'btn-primary' : 'btn-ghost'} btn-sm" data-tab="all">
        All Tasks (${tasks.length})
      </button>
    </div>

    <!-- Tasks Table -->
    ${filteredTasks.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        </div>
        <h3 class="empty-state-title">No follow-ups here</h3>
        <p class="empty-state-desc">You are all caught up! Use the quick form above to schedule reminders.</p>
      </div>
    ` : `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 50px;">Status</th>
              <th>Task Action</th>
              <th>Category</th>
              <th>Client</th>
              <th>Due Date</th>
              <th style="width: 80px; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTasks.map(task => {
              const lead = store.getLeadById(task.leadId);
              const isOverdue = !task.completed && task.dueDate < today;
              const isDueToday = !task.completed && task.dueDate === today;

              return `
                <tr data-id="${task.id}" style="${task.completed ? 'opacity: 0.6;' : ''}">
                  <td>
                    <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${task.completed ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                  </td>
                  <td>
                    <span style="${task.completed ? 'text-decoration: line-through;' : 'font-weight: 600;'}">
                      ${escapeHtml(task.title)}
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-neutral">${escapeHtml(task.type)}</span>
                  </td>
                  <td>
                    ${lead ? `
                      <a href="javascript:void(0)" class="lead-link" data-lead-id="${lead.id}" style="font-weight: 600;">
                        ${escapeHtml(lead.name)}
                      </a>
                      <div style="font-size: 0.8rem; color: var(--ink-tertiary);">${escapeHtml(lead.area)}</div>
                    ` : '<span style="color: var(--ink-tertiary);">Client removed</span>'}
                  </td>
                  <td>
                    <span style="font-weight: 500;">${formatDate(task.dueDate)}</span>
                    ${isOverdue ? '<span class="badge badge-danger" style="margin-left: 6px;">Overdue</span>' : ''}
                    ${isDueToday ? '<span class="badge badge-warning" style="margin-left: 6px;">Due Today</span>' : ''}
                  </td>
                  <td style="text-align: right;">
                    <button type="button" class="btn btn-ghost btn-sm btn-delete-task" data-task-id="${task.id}" title="Delete task">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `}
  `;

  // Attach tab switching events
  container.querySelectorAll('[data-tab]').forEach(btn => {
    btn.onclick = () => {
      activeFilter = btn.dataset.tab;
      renderTasks(container, filterTerm, selectedAgent);
    };
  });

  // Attach task creation form
  const form = container.querySelector('#task-add-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const title = container.querySelector('#task-title-input').value.trim();
      const type = container.querySelector('#task-type-select').value;
      const dueDate = container.querySelector('#task-due-input').value;
      const leadId = Number(container.querySelector('#task-lead-select').value);

      if (!title || !leadId) {
        toast.error('Please specify task details and client');
        return;
      }

      store.addTask({
        title,
        type,
        dueDate,
        leadId
      });

      toast.success('Follow-up task scheduled');
      renderTasks(container, filterTerm, selectedAgent);
    };
  }

  // Attach checkbox toggle
  container.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.onchange = () => {
      const taskId = Number(cb.dataset.taskId);
      store.toggleTaskCompleted(taskId);
      toast.info('Task status updated');
      renderTasks(container, filterTerm, selectedAgent);
    };
  });

  // Attach delete task
  container.querySelectorAll('.btn-delete-task').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const taskId = Number(btn.dataset.taskId);
      store.deleteTask(taskId);
      toast.info('Task deleted');
      renderTasks(container, filterTerm, selectedAgent);
    };
  });

  // Attach client modal link
  container.querySelectorAll('.lead-link').forEach(link => {
    link.onclick = (e) => {
      e.stopPropagation();
      openClientModal(Number(link.dataset.leadId));
    };
  });
}
