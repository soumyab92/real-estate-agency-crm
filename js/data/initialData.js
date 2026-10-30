import { getDateOffset } from '../utils/formatters.js';

export const STAGES = ['New lead', 'Site visit', 'Negotiation', 'Closed'];
export const AGENTS = ['Ananya Roy', 'Rohit Sen', 'Meera Patel', 'Vikram Das'];
export const CONTACT_TYPES = ['Call', 'Email', 'WhatsApp', 'Meeting', 'Site Visit'];
export const LEAD_KINDS = ['Buyer', 'Renter', 'Seller'];
export const TASK_TYPES = ['Call', 'Site visit', 'Paperwork', 'Follow-up', 'Payment Collection'];
export const AREAS = ['Salt Lake', 'New Town', 'Ballygunge', 'Behala', 'Garia', 'Rajarhat', 'Alipore'];

export function getSeedData() {
  return {
    nextId: 100,
    properties: [
      {
        id: 1,
        title: 'Skyline Residency, Sector V',
        area: 'Salt Lake',
        bhk: '3 BHK',
        mode: 'Sale',
        price: 13500000,
        sqft: 1480,
        status: 'Available',
        description: 'Prime location facing wetland views, 2 covered parking slots.'
      },
      {
        id: 2,
        title: 'Lakeview Smart Apartments',
        area: 'New Town',
        bhk: '2 BHK',
        mode: 'Sale',
        price: 8200000,
        sqft: 1050,
        status: 'Available',
        description: 'Gated community with club, gym, and 24/7 power backup.'
      },
      {
        id: 3,
        title: 'Eco Park Heights',
        area: 'New Town',
        bhk: '3 BHK',
        mode: 'Sale',
        price: 12000000,
        sqft: 1380,
        status: 'Available',
        description: 'High floor corner apartment with 3 balconies.'
      },
      {
        id: 4,
        title: 'Gariahat Luxury Court',
        area: 'Ballygunge',
        bhk: '4 BHK',
        mode: 'Sale',
        price: 31000000,
        sqft: 2400,
        status: 'Available',
        description: 'Heritage residential pocket with servant quarters.'
      },
      {
        id: 5,
        title: 'Ho Chi Minh Sarani Flat',
        area: 'Ballygunge',
        bhk: '2 BHK',
        mode: 'Rent',
        price: 38000,
        sqft: 1100,
        status: 'Available',
        description: 'Fully furnished, Italian marble flooring.'
      },
      {
        id: 6,
        title: 'Sarsuna Garden Homes',
        area: 'Behala',
        bhk: '3 BHK',
        mode: 'Sale',
        price: 9200000,
        sqft: 1320,
        status: 'Under offer',
        description: 'Independent floor in modern standalone building.'
      },
      {
        id: 7,
        title: 'Rajarhat Greens Enclave',
        area: 'Rajarhat',
        bhk: '3 BHK',
        mode: 'Sale',
        price: 10800000,
        sqft: 1290,
        status: 'Sold',
        description: 'South facing, near upcoming metro corridor.'
      },
      {
        id: 8,
        title: 'Garia Station Studio Suites',
        area: 'Garia',
        bhk: '1 BHK',
        mode: 'Rent',
        price: 14000,
        sqft: 520,
        status: 'Available',
        description: 'Walking distance to metro, modular kitchenette.'
      },
      {
        id: 9,
        title: 'Sector III Corner Penthouse',
        area: 'Salt Lake',
        bhk: '2 BHK',
        mode: 'Rent',
        price: 32000,
        sqft: 980,
        status: 'Available',
        description: 'Air conditioned, terrace access, reserved parking.'
      }
    ],
    leads: [
      {
        id: 1,
        name: 'Ritika Sen',
        phone: '+91 98300 11122',
        email: 'ritika.sen@example.com',
        kind: 'Buyer',
        area: 'Salt Lake',
        type: '3 BHK',
        budget: 14000000,
        rate: 2, // 2% brokerage
        stage: 'New lead',
        agent: 'Ananya Roy',
        targetDate: getDateOffset(45),
        note: 'Looking for property near DPS Megacity with reserved parking.',
        payments: [],
        logs: [
          { type: 'Email', text: 'Initial enquiry submitted via agency website', date: getDateOffset(-2) }
        ]
      },
      {
        id: 2,
        name: 'Arjun Mehta',
        phone: '+91 98300 33344',
        email: 'arjun.m@example.com',
        kind: 'Buyer',
        area: 'New Town',
        type: '2 BHK',
        budget: 8500000,
        rate: 2,
        stage: 'New lead',
        agent: 'Rohit Sen',
        targetDate: getDateOffset(60),
        note: 'First home buyer. HDFC pre-approved home loan in place.',
        payments: [],
        logs: [
          { type: 'Call', text: 'Phone briefing conducted; sent brochure for Lakeview', date: getDateOffset(-1) }
        ]
      },
      {
        id: 3,
        name: 'Sharmila Das',
        phone: '+91 98300 55566',
        email: 'sharmila.d@example.com',
        kind: 'Renter',
        area: 'Ballygunge',
        type: '2 BHK',
        budget: 40000,
        rate: 100, // 1 month rent
        stage: 'Site visit',
        agent: 'Meera Patel',
        targetDate: getDateOffset(20),
        note: 'Corporate relocation; needs to occupy by end of current month.',
        payments: [],
        logs: [
          { type: 'WhatsApp', text: 'Confirmed Saturday 11am appointment', date: getDateOffset(-3) }
        ]
      },
      {
        id: 4,
        name: 'Kabir Nanda',
        phone: '+91 98300 77788',
        email: 'knanda@example.com',
        kind: 'Buyer',
        area: 'Ballygunge',
        type: '4 BHK',
        budget: 32000000,
        rate: 1.5,
        stage: 'Site visit',
        agent: 'Ananya Roy',
        targetDate: getDateOffset(40),
        note: 'Interested in older heritage luxury complexes.',
        payments: [],
        logs: [
          { type: 'Meeting', text: 'Met at agency office; shortlisted 2 luxury properties', date: getDateOffset(-4) }
        ]
      },
      {
        id: 5,
        name: 'Ishita Roy',
        phone: '+91 98300 99900',
        email: 'ishita.roy@example.com',
        kind: 'Seller',
        area: 'Behala',
        type: '3 BHK',
        budget: 9500000,
        rate: 1,
        stage: 'Negotiation',
        agent: 'Rohit Sen',
        targetDate: getDateOffset(25),
        note: 'Counter-offer round: buyer offered ₹90L, Ishita holding firm on ₹94L.',
        payments: [],
        logs: [
          { type: 'Call', text: 'Shared buyer revised offer terms', date: getDateOffset(-1) }
        ]
      },
      {
        id: 6,
        name: 'Dev Malhotra',
        phone: '+91 98311 22233',
        email: 'dev.m@example.com',
        kind: 'Buyer',
        area: 'Rajarhat',
        type: '3 BHK',
        budget: 10800000,
        rate: 2,
        stage: 'Closed',
        agent: 'Meera Patel',
        targetDate: getDateOffset(-20),
        note: 'Sale registration deed completed successfully.',
        payments: [
          { id: 1, amount: 216000, date: getDateOffset(-18), note: 'Full commission payment received via NEFT' }
        ],
        logs: [
          { type: 'Email', text: 'Dispatched receipt & final congratulatory deed', date: getDateOffset(-18) }
        ]
      },
      {
        id: 7,
        name: 'Neha Kapoor',
        phone: '+91 98311 44455',
        email: 'neha.k@example.com',
        kind: 'Buyer',
        area: 'New Town',
        type: '2 BHK',
        budget: 7800000,
        rate: 1.5,
        stage: 'Closed',
        agent: 'Ananya Roy',
        targetDate: getDateOffset(-8),
        note: 'Agreement executed, balance commission due on registration.',
        payments: [
          { id: 2, amount: 60000, date: getDateOffset(-7), note: 'Advance booking brokerage token' }
        ],
        logs: [
          { type: 'WhatsApp', text: 'Token receipt confirmed', date: getDateOffset(-9) }
        ]
      }
    ],
    tasks: [
      {
        id: 1,
        leadId: 1,
        type: 'Call',
        title: 'Send Salt Lake 3 BHK shortlist brochure',
        dueDate: getDateOffset(1),
        completed: false
      },
      {
        id: 2,
        leadId: 7,
        type: 'Paperwork',
        title: 'Collect pending balance commission ₹57,000',
        dueDate: getDateOffset(10),
        completed: false
      },
      {
        id: 3,
        leadId: 5,
        type: 'Call',
        title: 'Revert to seller with buyer final ₹92.5L offer',
        dueDate: getDateOffset(-1),
        completed: false
      },
      {
        id: 4,
        leadId: 3,
        type: 'Site visit',
        title: 'Accompany to Ho Chi Minh Sarani flat',
        dueDate: getDateOffset(2),
        completed: false
      }
    ]
  };
}
