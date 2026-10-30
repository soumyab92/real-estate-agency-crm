import { getSeedData } from './initialData.js';

const STORAGE_KEY = 'hearth_crm_v2_store';

class Store {
  constructor() {
    this.subscribers = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.leads) && Array.isArray(parsed.properties)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved state from localStorage, loading initial seed data:', err);
    }
    const seed = getSeedData();
    this.saveDirect(seed);
    return seed;
  }

  saveDirect(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Error writing to localStorage:', err);
    }
  }

  save() {
    this.saveDirect(this.state);
    this.notify();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(fn => fn !== callback);
    };
  }

  notify() {
    this.subscribers.forEach(fn => {
      try {
        fn(this.state);
      } catch (err) {
        console.error('Error in store subscriber:', err);
      }
    });
  }

  // --- Leads Accessors & Mutations ---
  getLeads() {
    return this.state.leads;
  }

  getLeadById(id) {
    return this.state.leads.find(l => l.id === Number(id));
  }

  addLead(leadData) {
    const newLead = {
      id: this.state.nextId++,
      payments: [],
      logs: [{ type: 'Email', text: 'Lead created in CRM', date: new Date().toISOString().slice(0, 10) }],
      ...leadData
    };
    this.state.leads.unshift(newLead);
    this.save();
    return newLead;
  }

  updateLead(id, updates) {
    const lead = this.getLeadById(id);
    if (!lead) return null;
    Object.assign(lead, updates);
    this.save();
    return lead;
  }

  deleteLead(id) {
    const numId = Number(id);
    this.state.leads = this.state.leads.filter(l => l.id !== numId);
    this.state.tasks = this.state.tasks.filter(t => t.leadId !== numId);
    this.save();
  }

  moveLeadStage(id, newStage) {
    const lead = this.getLeadById(id);
    if (!lead || lead.stage === newStage) return false;
    lead.stage = newStage;
    lead.logs.unshift({
      type: 'Meeting',
      text: `Stage changed to ${newStage}`,
      date: new Date().toISOString().slice(0, 10)
    });
    this.save();
    return true;
  }

  // --- Financial Calculations ---
  getLeadCommission(lead) {
    if (!lead) return 0;
    if (lead.kind === 'Renter') {
      return (lead.budget * (lead.rate || 100)) / 100;
    }
    return (lead.budget * (lead.rate || 2)) / 100;
  }

  getLeadPaid(lead) {
    if (!lead || !Array.isArray(lead.payments)) return 0;
    return lead.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }

  getLeadOutstanding(lead) {
    return Math.max(0, this.getLeadCommission(lead) - this.getLeadPaid(lead));
  }

  // --- Properties Accessors & Mutations ---
  getProperties() {
    return this.state.properties;
  }

  getPropertyById(id) {
    return this.state.properties.find(p => p.id === Number(id));
  }

  addProperty(propertyData) {
    const newProp = {
      id: this.state.nextId++,
      status: 'Available',
      ...propertyData
    };
    this.state.properties.unshift(newProp);
    this.save();
    return newProp;
  }

  updatePropertyStatus(id, newStatus) {
    const prop = this.getPropertyById(id);
    if (!prop) return;
    prop.status = newStatus;
    this.save();
  }

  getMatchingProperties(lead, limit = 4) {
    if (!lead || lead.kind === 'Seller') return [];
    const mode = lead.kind === 'Renter' ? 'Rent' : 'Sale';
    return this.state.properties
      .filter(p => p.status === 'Available' && p.mode === mode && p.price <= lead.budget * 1.15)
      .sort((a, b) => {
        const aArea = a.area === lead.area ? 1 : 0;
        const bArea = b.area === lead.area ? 1 : 0;
        return bArea - aArea;
      })
      .slice(0, limit);
  }

  // --- Tasks Accessors & Mutations ---
  getTasks() {
    return this.state.tasks;
  }

  addTask(taskData) {
    const newTask = {
      id: this.state.nextId++,
      completed: false,
      ...taskData
    };
    this.state.tasks.push(newTask);
    this.save();
    return newTask;
  }

  toggleTaskCompleted(id) {
    const task = this.state.tasks.find(t => t.id === Number(id));
    if (!task) return;
    task.completed = !task.completed;
    this.save();
  }

  deleteTask(id) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== Number(id));
    this.save();
  }

  // --- Payments & Communication Logs ---
  addPayment(leadId, payment) {
    const lead = this.getLeadById(leadId);
    if (!lead) return;
    if (!lead.payments) lead.payments = [];
    lead.payments.push({
      id: Date.now(),
      amount: Number(payment.amount),
      date: payment.date || new Date().toISOString().slice(0, 10),
      note: payment.note || 'Payment received'
    });
    this.save();
  }

  addLog(leadId, log) {
    const lead = this.getLeadById(leadId);
    if (!lead) return;
    if (!lead.logs) lead.logs = [];
    lead.logs.unshift({
      type: log.type || 'Note',
      text: log.text || '',
      date: log.date || new Date().toISOString().slice(0, 10)
    });
    this.save();
  }

  // --- Export & Backup Functions ---
  exportToCSV() {
    const headers = [
      'Name', 'Phone', 'Email', 'Kind', 'Area', 'Type', 'Budget', 
      'Stage', 'Agent', 'Commission', 'Collected', 'Outstanding', 'Target Date'
    ];
    const rows = this.state.leads.map(l => [
      l.name,
      l.phone || '',
      l.email || '',
      l.kind,
      l.area,
      l.type,
      l.budget,
      l.stage,
      l.agent,
      this.getLeadCommission(l),
      this.getLeadPaid(l),
      this.getLeadOutstanding(l),
      l.targetDate || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hearth-crm-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportToJSON() {
    const jsonStr = JSON.stringify(this.state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hearth-crm-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.leads) && Array.isArray(data.properties)) {
        this.state = data;
        this.save();
        return true;
      }
    } catch (err) {
      console.error('Invalid JSON file format:', err);
    }
    return false;
  }

  resetToDefaults() {
    this.state = getSeedData();
    this.save();
  }
}

export const store = new Store();
