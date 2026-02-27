// Database Types
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  email?: string;
  phone?: string;
  created_at: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  surgery_type: string;
  surgery_date: string;
  days_since_surgery: number;
  recovery_score: number;
  risk_status: 'LOW' | 'MEDIUM' | 'HIGH';
  assigned_doctor_id: string | null;
  known_risk_factors?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  patient_id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'RESOLVED' | 'ESCALATED';
  assigned_doctor_id: string | null;
  reason: string;
  routing_history: RoutingHistoryItem[];
  triage_data?: TriageResult;
  created_at: string;
  resolved_at?: string;
}

export interface RoutingHistoryItem {
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  from_doctor_id?: string;
  to_doctor_id?: string;
}

export interface SystemConfig {
  ai_low_threshold: number;
  ai_medium_threshold: number;
  auto_escalation_minutes: number;
  message_templates: MessageTemplate[];
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

// AI Triage Types
export interface TriageInput {
  patient_message: string;
  surgery_type: string;
  days_since_surgery: number;
  known_risk_factors?: string;
}

export interface TriageResult {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_score: number;
  confidence_level: 'LOW' | 'MEDIUM' | 'HIGH';
  symptoms_identified: string[];
  trend_analysis: 'improving' | 'stable' | 'worsening' | 'unclear';
  complication_category: 'infection' | 'bleeding' | 'cardiovascular' | 'respiratory' | 'neurological' | 'general_recovery' | 'unknown';
  clinical_reasoning: string;
  alert_required: boolean;
}

// Analytics Types
export interface AnalyticsSummary {
  total_patients: number;
  active_alerts: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  average_recovery_score: number;
  alerts_by_severity: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
  alerts_by_status: {
    PENDING: number;
    RESOLVED: number;
    ESCALATED: number;
  };
  doctors_available: number;
  doctors_busy: number;
  doctors_offline: number;
}

// Twilio Types
export interface TwilioWebhookPayload {
  From: string;
  Body: string;
  MessageSid: string;
  AccountSid: string;
}
