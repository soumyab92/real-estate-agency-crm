# Hearth CRM — Real Estate Agency Platform

A modern, production-grade, zero-build client relationship and deal pipeline management CRM tailored for real estate agencies, broker networks, and independent property consultants.

Built entirely with standard **Vanilla HTML5, Modern CSS, and ES Modules** — fast, zero runtime or build dependencies, fully accessible, and ready for instant deployment to GitHub Pages, Netlify, or any static host.

---

## 🌟 Architecture & Features

### 1. Executive Analytics & Dashboard
- **Real-Time Revenue Metrics**: Track active pipeline commission potential, realized gross revenue, collected cash in bank, and outstanding dues.
- **Agency Win Rate**: Dynamic lead-to-close conversion rate calculations.
- **Overdue Task Warnings**: Instant count and alerts for overdue follow-up milestones.
- **Visual Analytics**:
  - Monthly closed revenue trend.
  - Pipeline distribution by deal stage.
  - High-demand locality heat breakdown.
  - Broker leaderboard tracking individual earned revenue and deal volume.

### 2. Interactive Kanban Deal Pipeline
- **Drag & Drop Workflow**: Move lead cards between deal stages (`New lead`, `Site visit`, `Negotiation`, `Closed`) using native HTML5 Drag and Drop.
- **Stage Metrics**: Instant deal count and aggregate monetary volume per column.
- **Card Metadata**: Client intent tag (Buyer / Seller / Renter), unit requirement, preferred locality, budget, and handling broker.

### 3. Closed Deals & Commission Ledger
- Dedicated closed transaction ledger tracking deal value, expected brokerage, collected advance tokens, and pending client dues.
- Status badges indicating settled payouts or remaining balance receivable.

### 4. Client Directory & 360° Profile
- Full contact directory with instant search filtering across name, phone, area, and requirement.
- One-click **WhatsApp** integration and direct phone links.
- **Client 360° Drawer / Modal**:
  - Full client requirement and budget editor.
  - **Smart Property Matching**: Automatically scans inventory for available units matching buyer budget, specification, and locality.
  - **Payment Ledger**: Record client token deposits and milestone receipts.
  - **Task Scheduler**: Assign follow-up calls, site visits, and paperwork deadlines.
  - **Communication History**: Log touchpoints (Phone, WhatsApp, In-person meeting, Email).

### 5. Property Inventory Management
- Catalog of property listings for Sale and Rent.
- Filter by mode (Sale vs Rent), status (Available, Under offer, Sold), and locality.
- Live status updates directly from cards.
- Add new properties with super built-up area, BHK configuration, pricing, and highlights.

### 6. Formal Offer Sheet & Letter of Intent Generator
- Generate tailored, legally formatted offer proposals with token deposit % and brokerage calculations.
- **One-Click Copy**: Copy formatted Letter of Intent to clipboard for WhatsApp or Email.
- **Print & PDF Layout**: Clean print stylesheet for instant PDF export or client printouts.
- **Apply as Deal Value**: Automatically advances deal to Negotiation stage and synchronizes budget.

### 7. Data Safety, Backups & Export
- **CSV Export**: Export all client leads and deal stages for spreadsheet analysis in Excel or Google Sheets.
- **JSON Backup & Restore**: One-click full database export and restore functionality.
- **Seed Data Reset**: Reset anytime to realistic demonstration data.

---

## 📁 Project Structure

```text
├── index.html               # Semantic HTML5 application shell & landmarks
├── css/
│   ├── variables.css        # Design tokens, color system, dark & light theme variables
│   ├── base.css             # Typography, resets, focus states, custom scrollbars
│   ├── layout.css           # Responsive sidebar, sticky topbar, fluid container
│   ├── components.css       # Buttons, KPI cards, form controls, tables, modals, toasts
│   └── views.css            # Kanban boards, charts, property cards, offer sheets
├── js/
│   ├── app.js               # Application coordinator, hash routing & keyboard shortcuts
│   ├── data/
│   │   ├── initialData.js   # Demonstration properties, leads, and task seed records
│   │   └── store.js         # Reactive central store with localStorage sync & event emitters
│   ├── utils/
│   │   ├── formatters.js    # Indian currency (₹ Cr / ₹ L), dates, phone & XSS sanitization
│   │   └── toast.js         # Toast notification controller
│   ├── components/
│   │   └── modal.js         # Accessible native <dialog> controller
│   └── views/
│       ├── dashboard.js     # Executive dashboard view & analytics charts
│       ├── pipeline.js      # Interactive Kanban pipeline
│       ├── deals.js         # Closed deals and commission ledger
│       ├── clients.js       # Client directory with WhatsApp shortcuts
│       ├── tasks.js         # Follow-ups and task manager with overdue filters
│       ├── listings.js      # Property catalog and add listing dialog
│       ├── clientModal.js   # 360° client drawer & new lead modal
│       ├── offerSheetModal.js # Formal offer sheet generator & print layout
│       └── settings.js      # Data backup, CSV export, and database restore
└── README.md
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `N` | Open **New Lead** creation modal |
| `/` | Focus global search bar |
| `T` | Toggle **Dark / Light** theme mode |
| `Esc` | Close active modal dialog |

---

## 🚀 Running Locally

No npm dependencies or build commands are required:

1. Open `index.html` directly in any modern browser (Chrome, Edge, Safari, Firefox):
   - Double-click `index.html`, or
   - Use any simple static server:
     ```bash
     npx serve .
     ```
2. Ready for instant deployment on GitHub Pages, Netlify, or Vercel with zero configuration.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
