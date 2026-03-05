# 🏥 HealthGuard AI - Autonomous Patient Follow-up Agent

An intelligent post-surgery patient monitoring system powered by AI that automatically detects high-risk symptoms and alerts medical staff in real-time via WhatsApp.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

## 🌟 Features

### 🤖 AI-Powered Monitoring
- **Gemini AI Integration**: Advanced symptom analysis using Google's Gemini 2.5 Flash
- **Automatic Risk Scoring**: Real-time risk assessment (LOW/MEDIUM/HIGH)
- **Intelligent Triage**: Keyword-based analysis with clinical reasoning
- **Conversational AI**: Natural language interaction with patients

### 📱 WhatsApp Integration
- **Automated Check-ins**: Automatic WhatsApp messages on patient registration
- **Two-way Communication**: Patients can report symptoms via WhatsApp
- **Instant Notifications**: Doctors and admins receive real-time alerts
- **Manual Messaging**: Admins can send custom messages to patients

### 🎯 Smart Alert System
- **Automatic Alert Creation**: HIGH risk symptoms trigger immediate alerts
- **Doctor Auto-Routing**: Alerts automatically assigned to available doctors
- **Priority-based Escalation**: Critical cases escalated when no doctors available
- **Complete Audit Trail**: Full routing history and triage data

### 📊 Dual Dashboard System
- **Admin Dashboard**: Patient management, alert monitoring, doctor assignment
- **Doctor Dashboard**: View assigned patients, manage alerts, track recovery
- **Real-time Updates**: Live data synchronization across all dashboards
- **Analytics & Insights**: Comprehensive reporting and trend analysis

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Twilio account with WhatsApp sandbox
- Google Gemini API key
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/warshit/Autonomous-Patient-Follow-up-Agent.git
cd Autonomous-Patient-Follow-up-Agent
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. **Configure environment variables**

Create `backend/.env`:
```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Admin Notifications (optional)
ADMIN_PHONE=whatsapp:+1234567890

# Server Configuration
NODE_ENV=development
PORT=5000
DATABASE_PATH=./data/healthguard.db
```

Create `.env.local` (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Initialize database**
```bash
cd backend
npm run db:init
```

5. **Start the application**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Admin Dashboard: http://localhost:3000/admin
- Doctor Dashboard: http://localhost:3000/dashboard

## 📖 Usage

### For Admins

1. **Add a Patient**
   - Navigate to Admin Dashboard → Patients
   - Click "Register New Patient"
   - Fill in patient details (name, phone, surgery type, date)
   - Patient automatically receives WhatsApp check-in message

2. **Send Manual WhatsApp Message**
   - Go to Patients page
   - Click actions menu (⋮) for any patient
   - Select "Send WhatsApp"
   - Type custom message and send

3. **Monitor Alerts**
   - Navigate to Alerts page
   - View all HIGH/MEDIUM/LOW risk alerts
   - Click alert for detailed triage data
   - Resolve, escalate, or reassign alerts

4. **Manage Doctors**
   - Go to Doctors page
   - Add/edit doctor profiles
   - Set availability status
   - View assigned patients

### For Patients

1. **Receive Check-in Message**
   - Get WhatsApp message after registration
   - Reply with symptoms or concerns

2. **Report Symptoms**
   - Send WhatsApp message: "I have severe chest pain"
   - AI analyzes message and calculates risk score
   - Receive calm, clinical guidance from AI

3. **Get Help**
   - HIGH risk symptoms trigger immediate doctor notification
   - Doctor contacts patient directly
   - Continuous monitoring throughout recovery

### For Doctors

1. **View Assigned Patients**
   - Login to Doctor Dashboard
   - See all assigned patients
   - Monitor recovery progress

2. **Manage Alerts**
   - Receive WhatsApp notifications for HIGH risk alerts
   - View alert details and triage data
   - Mark alerts as resolved

3. **Track Patient History**
   - View complete patient timeline
   - See all symptoms reported
   - Access AI analysis and risk scores

## 🏗️ Architecture

### Tech Stack

**Frontend**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- React Router for navigation

**Backend**
- Node.js with Express
- TypeScript for type safety
- SQLite with better-sqlite3
- Twilio SDK for WhatsApp
- Google Generative AI (Gemini)

**AI & Integration**
- Google Gemini 2.5 Flash for symptom analysis
- Twilio WhatsApp Business API
- Real-time webhook processing

### Project Structure

```
Autonomous-Patient-Follow-up-Agent/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── db/              # Database setup and initialization
│   │   ├── routes/          # API routes
│   │   │   ├── patients.routes.ts
│   │   │   ├── alerts.routes.ts
│   │   │   ├── doctors.routes.ts
│   │   │   ├── webhook.routes.ts
│   │   │   └── triage.routes.ts
│   │   ├── services/        # Business logic
│   │   │   ├── gemini.service.ts
│   │   │   ├── triage.service.ts
│   │   │   ├── routing.service.ts
│   │   │   └── twilio.service.ts
│   │   ├── types/           # TypeScript types
│   │   └── server.ts        # Express server
│   ├── data/                # SQLite database (gitignored)
│   └── package.json
├── src/
│   ├── components/          # React components
│   │   └── ui/              # shadcn/ui components
│   ├── context/             # React context
│   ├── layouts/             # Layout components
│   ├── lib/                 # Utilities and API client
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin dashboard pages
│   │   └── ...              # Doctor dashboard pages
│   └── main.tsx             # App entry point
├── .gitignore
├── package.json
└── README.md
```

## 🔄 Complete Demo Flow

```
1. Admin adds patient
   ↓
2. Patient receives WhatsApp check-in
   ↓
3. Patient replies: "I have severe chest pain"
   ↓
4. AI analyzes message (Gemini)
   ↓
5. Risk score calculated: 85 (HIGH)
   ↓
6. Alert created in database
   ↓
7. Doctor auto-assigned
   ↓
8. WhatsApp notifications sent:
   - Doctor receives alert
   - Admin receives alert
   ↓
9. Patient receives calm AI guidance
   ↓
10. Admin dashboard updates in real-time
```

**Total time**: < 5 seconds from symptom report to doctor notification

## 🎯 Risk Scoring System

### HIGH Risk (Score: 85)
**Triggers immediate alert**

Keywords:
- chest pain
- severe pain
- can't breathe / difficulty breathing
- bleeding heavily
- fainting / unconscious
- crushing pain
- heart attack / stroke
- seizure

### MEDIUM Risk (Score: 60)
**Updates patient status, no alert**

Keywords:
- pain
- dizzy / dizziness
- fever
- swelling
- infection / pus
- nausea / vomiting
- shortness of breath

### LOW Risk (Score: 30)
**Normal recovery**

General conversation without concerning symptoms

## 🔧 API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PATCH /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `POST /api/patients/:id/send-message` - Send WhatsApp message

### Alerts
- `GET /api/alerts` - Get all alerts (with filters)
- `GET /api/alerts/:id` - Get alert by ID
- `PATCH /api/alerts/:id` - Update alert (resolve/escalate/reassign)
- `DELETE /api/alerts/:id` - Delete alert

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create new doctor
- `PATCH /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Webhook
- `POST /api/webhook/whatsapp` - Twilio WhatsApp webhook

### Triage
- `POST /api/triage/analyze` - Analyze patient message
- `POST /api/triage/batch` - Batch triage analysis

## 🔐 Security

- Environment variables for sensitive data
- Twilio webhook signature validation
- SQL injection prevention (parameterized queries)
- Input validation on all endpoints
- CORS configuration
- Rate limiting (recommended for production)



## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📈 Roadmap

- [ ] Add real-time chat interface
- [ ] Implement message templates
- [ ] Add bulk messaging feature
- [ ] Support for multiple languages
- [ ] Mobile app for doctors
- [ ] Integration with EHR systems
- [ ] Advanced analytics dashboard
- [ ] Machine learning for better risk prediction
- [ ] Video consultation integration
- [ ] Medication reminder system

---

**Built with ❤️ for better healthcare**

⭐ Star this repo if you find it helpful!
---
-By varshith
