# HealthGuard AI Backend

Backend API for the HealthGuard AI post-operative patient monitoring system.

## Features

- **AI-Powered Triage**: Gemini AI integration for risk assessment
- **Smart Alert Routing**: Automatic doctor assignment based on availability
- **Patient Management**: CRUD operations for patient records
- **Doctor Management**: Track doctor availability and workload
- **Analytics**: Comprehensive system metrics and insights
- **Webhook Support**: Twilio integration for WhatsApp/SMS

## Tech Stack

- Node.js + Express
- TypeScript
- Better-sqlite3 (Database)
- Google Gemini AI
- Twilio (Messaging)

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```env
PORT=5000
DATABASE_PATH=./data/healthguard.db
GEMINI_API_KEY=your_gemini_api_key_here
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 3. Initialize Database

```bash
npm run db:init
```

### 4. Start Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Triage
- `POST /api/triage/analyze` - Analyze patient message
- `POST /api/triage/batch` - Batch triage analysis
- `GET /api/triage/test` - Test endpoint

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient details
- `POST /api/patients` - Create patient
- `PATCH /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Alerts
- `GET /api/alerts` - List alerts (with filters)
- `GET /api/alerts/:id` - Get alert details
- `PATCH /api/alerts/:id` - Update alert (resolve/escalate/reassign)
- `DELETE /api/alerts/:id` - Delete alert

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/:id` - Get doctor details
- `POST /api/doctors` - Create doctor
- `PATCH /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Analytics
- `GET /api/analytics/summary` - Get system analytics

### Webhooks
- `POST /api/webhook/twilio` - Twilio message webhook

## Triage API Usage

### Analyze Single Patient

```bash
POST /api/triage/analyze
Content-Type: application/json

{
  "patient_id": "P-1001",
  "patient_message": "I'm feeling severe pain (8/10) and have a fever of 39°C",
  "create_alert": true
}
```

Response:
```json
{
  "triage": {
    "risk_level": "HIGH",
    "risk_score": 85,
    "confidence_level": "HIGH",
    "symptoms_identified": ["severe pain", "high fever"],
    "trend_analysis": "worsening",
    "complication_category": "infection",
    "clinical_reasoning": "High fever combined with severe pain indicates potential post-operative infection requiring immediate medical attention.",
    "alert_required": true
  },
  "alert": {
    "id": "A-12345",
    "status": "PENDING",
    "assigned_doctor_name": "Dr. Sarah Mitchell"
  },
  "patient_updated": {
    "risk_status": "HIGH",
    "recovery_score": 15
  }
}
```

### Batch Analysis

```bash
POST /api/triage/batch
Content-Type: application/json

{
  "analyses": [
    {
      "patient_id": "P-1001",
      "patient_message": "Feeling good, pain is minimal"
    },
    {
      "patient_id": "P-1002",
      "patient_message": "Severe pain and swelling"
    }
  ]
}
```

## Database Schema

### Patients Table
- id, name, phone, surgery_type, surgery_date
- days_since_surgery, recovery_score, risk_status
- assigned_doctor_id, known_risk_factors
- last_check_in, created_at, updated_at

### Alerts Table
- id, patient_id, reason, severity, status
- assigned_doctor_id, triage_data, routing_history
- created_at, resolved_at, resolved_by

### Doctors Table
- id, name, specialization, status
- phone, email, working_hours
- patients_count, alerts_handled
- created_at, updated_at

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── db/            # Database setup and migrations
│   ├── routes/        # API route handlers
│   ├── services/      # Business logic (triage, routing, etc.)
│   ├── types/         # TypeScript type definitions
│   └── server.ts      # Main server file
├── data/              # SQLite database files
└── package.json
```

### Adding New Routes

1. Create route file in `src/routes/`
2. Import and register in `src/server.ts`
3. Add corresponding service in `src/services/` if needed

### Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test triage endpoint
curl -X POST http://localhost:5000/api/triage/test
```

## Deployment

1. Build the project: `npm run build`
2. Set production environment variables
3. Run: `npm start`
4. Ensure database directory is writable
5. Configure reverse proxy (nginx/Apache) if needed

## Security Notes

- Always use HTTPS in production
- Validate Twilio webhook signatures
- Implement rate limiting for API endpoints
- Secure GEMINI_API_KEY and Twilio credentials
- Use environment variables for all secrets

## License

MIT
