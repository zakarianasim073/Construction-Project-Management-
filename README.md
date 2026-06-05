
🏗️ Construction Project Management — AI
An AI-powered, all-in-one construction project management platform — from site execution to financial analytics, built to handle the full lifecycle of a construction project.

🔗 Live Demo (Vercel): new-project-management-cyan.vercel.app
🔗 Live Demo (Render): new-project-management.onrender.com
📦 Repository: github.com/zakarianasim073/new-project-management-

📖 About
Construction Project Management AI is a full-featured web platform that brings intelligent automation to every stage of a construction project. It covers master planning, on-site execution, financial oversight, procurement, labour management, quality control, and client communication — all in a single, unified workspace.

The built-in AI assistant (accessible via the ✦ button) allows project managers to interact with their project data using natural language, generate reports, surface risks, and get instant answers without navigating menus.

🗂️ Modules
The platform is organized into purpose-built modules accessible from the sidebar:

📊 Dashboard
High-level overview of all active projects
Real-time KPIs: budget status, task completion rate, upcoming milestones
Alerts for overdue tasks, safety issues, and procurement delays
Quick-access shortcuts to recent activity
📋 Master Control
Central command for project scope, objectives, and phases
Define project hierarchy: Project → Phase → Work Package → Task
Set overall timelines, budgets, and deliverables
Configure project-level settings and access permissions
🦺 Site Execution
Track daily on-site activities and progress logs
Record site diary entries with notes, weather, and workforce attendance
Monitor work completion against planned schedule
Flag site issues, incidents, and blockers in real time
💵 Financial Control
Budget creation and allocation across cost centres
Track actual costs vs. planned budget at any level
Manage payment certificates, invoices, and variations
Set budget alerts and cost thresholds
📈 Financial Analytics
Visual breakdowns of spend by category, phase, and contractor
Earned Value Management (EVM) metrics: CPI, SPI, EAC
Cash flow forecasting and burn rate charts
Export financial reports for clients or auditors
🛒 Procurement
Manage purchase orders, supplier quotes, and material requests
Track order status from request → approval → delivery
Maintain a vendor/supplier directory with performance ratings
Link procurement to tasks and budget line items
🚜 Equipment
Log and track all plant and equipment on site
Assign equipment to tasks and monitor utilisation
Schedule maintenance and track downtime
Record hire agreements and associated costs
👷 Labor & Attendance
Daily attendance tracking for direct labour and subcontractors
Record hours worked per task or work package
Monitor labour productivity and output vs. plan
Generate weekly timesheets and payroll summaries
🤝 Sub-contractors
Manage subcontractor contracts, scopes, and rates
Track subcontractor progress and milestone payments
Store insurance certificates, compliance documents, and contacts
Evaluate subcontractor performance per project
🛡️ QC & Safety
Create and manage quality inspection checklists
Log non-conformance reports (NCRs) and corrective actions
Record safety incidents, near misses, and toolbox talks
Track permit-to-work (PTW) issuance and closures
✅ Tasks
Create, assign, and prioritise tasks across the project
Set dependencies, due dates, and completion criteria
Filter by assignee, priority, status, or phase
Get AI-generated task summaries and workload insights
📅 Timeline
Gantt-style project timeline with phase and milestone markers
Drag-and-drop rescheduling with dependency enforcement
Critical path highlighting for high-risk sequences
Baseline vs. actual progress comparison
🧊 BIM Viewer
View Building Information Modelling (BIM) files directly in-browser
Navigate 3D models linked to tasks and site elements
Annotate models with issues or inspection notes
Supports IFC and standard BIM formats
📸 Photo Logs
Upload and organise site photos by date, location, and category
Tag photos to specific tasks, issues, or inspections
Create a visual record of project progress over time
Share photo reports with clients or stakeholders
📑 Reports
Generate PDF/CSV reports for any module (financial, progress, safety, etc.)
Scheduled automated reports delivered by email
AI-generated executive summaries from project data
Custom report builder with configurable sections
🌐 Client Portal
Dedicated read-only view for clients and stakeholders
Share project progress, photos, timelines, and financials
Clients can raise queries or approve documents without system access
Branded portal with project-specific access controls
👥 Team
Add team members and assign roles and permissions
View team workload and availability across projects
Manage role-based access: Admin, Manager, Engineer, Viewer
Directory of all users with contact details and assignments
📁 Documents
Centralised storage for all project documents
Version control with change history and approval workflows
Categories: Drawings, Contracts, Permits, Reports, RFIs
Share documents with controlled external access
🤖 AI Assistant
The floating ✦ AI button provides an intelligent assistant embedded throughout the platform:

Natural language queries — "What tasks are overdue this week?" or "Summarise today's site activity"
Plan generation — Create a full project plan from a brief description
Risk analysis — Identify scheduling or budget risks based on current data
Report drafting — Auto-generate progress reports and client updates
Smart suggestions — Recommended next actions based on project status
🖥️ Tech Stack
Layer	Technology
Frontend	React.js + Tailwind CSS
Backend	Node.js + Express
AI Engine	Claude API (Anthropic)
Database	PostgreSQL / Supabase
Auth	JWT-based Authentication
File Storage	Cloudinary / AWS S3
Hosting	Vercel (frontend) + Render (server)
🚀 Getting Started
Prerequisites
Node.js v18+
npm or yarn
PostgreSQL or Supabase project
Anthropic API key
1. Clone the Repository
bash
git clone https://github.com/zakarianasim073/new-project-management-.git
cd new-project-management-
2. Install Dependencies
bash
npm install
# or
cd client && npm install && cd ../server && npm install
3. Configure Environment Variables
Create a .env file:

env
# App
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/construction_pm

# Auth
JWT_SECRET=your_jwt_secret_here

# AI
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Storage (optional)
CLOUDINARY_URL=your_cloudinary_url_here
4. Run the Development Server
bash
npm run dev
Frontend → http://localhost:3000
Backend API → http://localhost:5000

📁 Project Structure
new-project-management-/
├── client/                     # React frontend
│   └── src/
│       ├── components/         # Shared UI components
│       ├── pages/              # Dashboard, Tasks, Timeline, BIM...
│       ├── modules/            # Feature modules (Finance, QC, etc.)
│       └── App.jsx
│
├── server/                     # Node.js API
│   ├── routes/                 # REST API routes per module
│   ├── controllers/            # Business logic
│   ├── models/                 # DB models
│   └── index.js
│
├── .env.example
├── package.json
└── README.md
🛣️ Roadmap
 Offline mode for remote/low-connectivity sites
 Mobile app (React Native) for site operatives
 IoT sensor integration for equipment monitoring
 Weather API integration for outdoor scheduling
 WhatsApp / SMS alerts for critical milestones
 AI cost estimation from project scope descriptions
 Multi-language support (Arabic, French, Urdu)
 Integration with accounting software (Xero, QuickBooks)
⚠️ Known Limitations
Initial load on Render's free tier may take 30–60 seconds (cold start)
BIM Viewer currently supports limited file formats
File uploads capped at 10MB per file in the current version
🤝 Contributing
Fork the repo
Create a branch: git checkout -b feature/your-feature
Commit your changes: git commit -m 'feat: describe your change'
Push and open a Pull Request against main
Please follow Conventional Commits for commit messages.

📄 License
Licensed under the MIT License — see LICENSE for details.

👤 Author
Zakaria Nasim
🔗 github.com/zakarianasim073

Built to bring intelligence to every corner of a construction project — from the boardroom to the building site.

