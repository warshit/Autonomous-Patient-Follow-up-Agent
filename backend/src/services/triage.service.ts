import { GoogleGenerativeAI } from '@google/genai';

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

const TRIAGE_SYSTEM_PROMPT = `You are HealthGuard AI — an automated post-operative patient monitoring triage system used in hospitals.

IMPORTANT:
You are NOT diagnosing.
You are NOT prescribing treatment.
You are ONLY performing risk stratification to prioritize medical attention.

Your output directly triggers doctor alerts and escalation workflows.
Be precise, structured, and conservative in safety judgments.

------------------------------------------------------------
TRIAGE OBJECTIVE
Classify recovery risk into:
LOW
MEDIUM
HIGH

You must evaluate:
1. Symptom severity
2. Symptom progression (improving, stable, worsening)
3. Urgency indicators
4. Surgery-type relevance
5. Timing relevance (early vs late complication window)
6. Potential infection indicators
7. Potential hemorrhage indicators
8. Cardiovascular or respiratory danger signals
9. Neurological red flags
10. Combination of multiple moderate symptoms

------------------------------------------------------------
RISK CLASSIFICATION FRAMEWORK

LOW RISK (0–39 score):
- Mild expected pain (1–4/10)
- Localized soreness
- Mild swelling
- Stable condition
- No fever
- No bleeding
- No worsening trend
- Typical healing timeline
- No systemic symptoms

MEDIUM RISK (40–69 score):
- Pain 5–7/10
- Gradual worsening pain
- Mild fever (<38.3°C / 101°F)
- Expanding redness or swelling
- Mild discharge without strong infection signs
- Dizziness without fainting
- Persistent nausea
- Symptoms lasting longer than expected
- Patient expresses concern about worsening

HIGH RISK (70–100 score):
- Severe pain (8–10/10)
- Heavy or persistent bleeding
- High fever (≥38.3°C / 101°F)
- Pus or clear infection signs
- Chest pain
- Difficulty breathing
- Sudden swelling or pressure
- Fainting or confusion
- Rapidly worsening symptoms
- Severe vomiting
- Signs of internal complication
- Multiple moderate symptoms combined
- Any life-threatening language

------------------------------------------------------------
ESCALATION PRINCIPLES

If uncertain between:
LOW vs MEDIUM → choose MEDIUM.
MEDIUM vs HIGH → choose HIGH.

If life-threatening indicators exist → HIGH regardless of other signals.
If multiple moderate symptoms appear together → escalate to HIGH.
If symptoms are vague but concerning → MEDIUM.

------------------------------------------------------------
SCORING MODEL

Generate a numeric risk_score between 0 and 100.

Score Ranges:
0–39 → LOW
40–69 → MEDIUM
70–100 → HIGH

The score should reflect:
- Severity weight
- Combination effect
- Urgency multiplier
- Timing relevance

------------------------------------------------------------
ALERT RULES

alert_required:
- true if HIGH
- true if MEDIUM and worsening trend
- false if LOW and stable

------------------------------------------------------------
OUTPUT FORMAT (STRICT JSON ONLY)

Return ONLY valid JSON.
No markdown.
No explanation outside JSON.
No commentary.
No formatting text.
No trailing characters.

{
  "risk_level": "LOW/MEDIUM/HIGH",
  "risk_score": number_0_to_100,
  "confidence_level": "LOW/MEDIUM/HIGH",
  "symptoms_identified": ["symptom_1", "symptom_2"],
  "trend_analysis": "improving/stable/worsening/unclear",
  "complication_category": "infection/bleeding/cardiovascular/respiratory/neurological/general_recovery/unknown",
  "clinical_reasoning": "Concise 1-2 sentence triage reasoning without medical advice.",
  "alert_required": true_or_false
}

------------------------------------------------------------
CRITICAL SAFETY RULES

- Never provide treatment instructions.
- Never provide reassurance.
- Never suggest medication.
- Never say 'consult a doctor'.
- Never include disclaimers.
- Never output text outside JSON.
- Never leave fields blank.
- Always produce syntactically valid JSON.`;

class TriageService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: TRIAGE_SYSTEM_PROMPT
    });
  }

  async analyzePatientMessage(input: TriageInput): Promise<TriageResult> {
    const userPrompt = `
PATIENT CONTEXT

Patient Message: "${input.patient_message}"
Surgery Type: "${input.surgery_type}"
Days Since Surgery: "${input.days_since_surgery}"
Known Risk Factors (if provided): "${input.known_risk_factors || 'None provided'}"

Perform triage analysis and return JSON only.
    `.trim();

    try {
      const result = await this.model.generateContent(userPrompt);
      const response = result.response;
      const text = response.text();
      
      // Clean up response - remove markdown code blocks if present
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const triageResult: TriageResult = JSON.parse(cleanedText);
      
      // Validate the response structure
      if (!triageResult.risk_level || triageResult.risk_score === undefined) {
        throw new Error('Invalid triage response structure');
      }
      
      return triageResult;
    } catch (error) {
      console.error('Triage analysis failed:', error);
      throw new Error(`Failed to perform triage analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  shouldCreateAlert(result: TriageResult): boolean {
    return result.alert_required;
  }

  mapRiskToSeverity(risk_level: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    return risk_level.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH';
  }
}

/**
 * Normalize phone number for database lookup
 * Handles various formats:
 * - "whatsapp:+918639764379" -> "+918639764379"
 * - "+918639764379" -> "+918639764379"
 * - "918639764379" -> "+918639764379"
 * - "+1-555-1001" -> "+15551001"
 * @param phone - Raw phone number from Twilio or other source
 * @returns Normalized phone number
 */
function normalizePhoneNumber(phone: string): string {
  // Remove "whatsapp:" prefix if present
  let normalized = phone.replace(/^whatsapp:/i, '').trim();
  
  // Remove all non-digit characters except leading +
  const hasPlus = normalized.startsWith('+');
  normalized = normalized.replace(/[^\d]/g, '');
  
  // Add + prefix if it was present originally
  if (hasPlus && !normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  
  return normalized;
}

/**
 * Find patient by phone number with flexible matching
 * Tries multiple phone number formats to find a match
 * @param db - Database instance
 * @param rawPhone - Raw phone number from webhook
 * @returns Patient record or null
 */
function findPatientByPhone(db: any, rawPhone: string): any {
  // Normalize the incoming phone number
  const normalizedPhone = normalizePhoneNumber(rawPhone);
  
  console.log(`🔍 Looking up patient with phone: ${rawPhone}`);
  console.log(`📱 Normalized to: ${normalizedPhone}`);
  
  // Try exact match first
  let patient = db.prepare('SELECT * FROM patients WHERE phone = ?').get(normalizedPhone);
  
  if (patient) {
    console.log(`✅ Found patient by exact match: ${normalizedPhone}`);
    return patient;
  }
  
  // Try without + prefix
  const withoutPlus = normalizedPhone.replace(/^\+/, '');
  patient = db.prepare('SELECT * FROM patients WHERE phone = ? OR phone = ?').get(
    withoutPlus,
    '+' + withoutPlus
  );
  
  if (patient) {
    console.log(`✅ Found patient by alternate format: ${patient.phone}`);
    return patient;
  }
  
  // Try with dashes (common format: +1-555-1001)
  const digitsOnly = normalizedPhone.replace(/[^\d]/g, '');
  patient = db.prepare(`
    SELECT * FROM patients 
    WHERE REPLACE(REPLACE(phone, '-', ''), '+', '') = ?
  `).get(digitsOnly);
  
  if (patient) {
    console.log(`✅ Found patient by digits-only match: ${patient.phone}`);
    return patient;
  }
  
  console.warn(`⚠️  No patient found for phone: ${rawPhone} (normalized: ${normalizedPhone})`);
  return null;
}

/**
 * Process triage for incoming WhatsApp message
 * @param from - Phone number of sender (may include "whatsapp:" prefix)
 * @param body - Message content
 * @returns Triage result with patient information
 */
export async function processTriage(from: string, body: string): Promise<{
  patient: any;
  triageResult: TriageResult;
  alertCreated: boolean;
}> {
  const { getDatabase } = await import('../db/database');
  const { getRoutingService } = await import('./routing.service');
  const { v4: uuidv4 } = await import('uuid');

  // Get database instance
  const db = getDatabase();
  
  // Find patient with flexible phone number matching
  const patient = findPatientByPhone(db, from);

  if (!patient) {
    const normalizedPhone = normalizePhoneNumber(from);
    throw new Error(`Patient not found for phone: ${normalizedPhone}. Please ensure the patient is registered in the system.`);
  }

  console.log(`✅ Patient identified: ${patient.name} (${patient.id})`);
  console.log(`📞 Patient phone in DB: ${patient.phone}`);

  // Perform AI triage
  const triageService = getTriageService();
  const triageResult = await triageService.analyzePatientMessage({
    patient_message: body,
    surgery_type: patient.surgery_type,
    days_since_surgery: patient.days_since_surgery,
    known_risk_factors: patient.known_risk_factors,
  });

  console.log(`🤖 Triage result: ${triageResult.risk_level} (${triageResult.risk_score})`);

  // Update patient risk status and recovery score
  db.prepare(`
    UPDATE patients 
    SET risk_status = ?, recovery_score = ?
    WHERE id = ?
  `).run(triageResult.risk_level, 100 - triageResult.risk_score, patient.id);

  // Create alert if required
  let alertCreated = false;
  if (triageResult.alert_required) {
    const alertId = `A-${uuidv4().substring(0, 8)}`;
    
    // Insert alert
    db.prepare(`
      INSERT INTO alerts (id, patient_id, severity, status, reason, triage_data, routing_history)
      VALUES (?, ?, ?, 'PENDING', ?, ?, '[]')
    `).run(
      alertId,
      patient.id,
      triageResult.risk_level,
      triageResult.clinical_reasoning,
      JSON.stringify(triageResult)
    );

    console.log(`🚨 Alert created: ${alertId}`);

    // Auto-route the alert
    const routingService = getRoutingService();
    const assignedDoctorId = routingService.autoRouteAlert(alertId, patient.id, triageResult.risk_level);

    if (assignedDoctorId) {
      const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(assignedDoctorId);
      console.log(`✅ Alert routed to: ${doctor.name}`);
    } else {
      console.warn(`⚠️  Alert escalated - no available doctors`);
    }

    alertCreated = true;
  }

  return {
    patient,
    triageResult,
    alertCreated
  };
}

/**
 * Analyze conversational message for risk and create alert if needed
 * Used for patients not in database - analyzes message content for risk keywords
 * @param from - Phone number of sender
 * @param message - User message content
 * @param aiResponse - Gemini AI response
 * @returns Alert information
 */
export async function analyzeConversationalRisk(
  from: string,
  message: string,
  aiResponse: string
): Promise<{
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  alertCreated: boolean;
  alertId?: string;
}> {
  const { getDatabase } = await import('../db/database');
  const { getRoutingService } = await import('./routing.service');
  const { v4: uuidv4 } = await import('uuid');

  // Analyze message for risk keywords
  const messageLower = message.toLowerCase();
  
  // HIGH RISK keywords
  const highRiskKeywords = [
    'chest pain', 'can\'t breathe', 'difficulty breathing', 'severe pain',
    'bleeding heavily', 'fainting', 'fainted', 'unconscious', 'crushing pain',
    'heart attack', 'stroke', 'severe bleeding', 'high fever', 'confusion',
    'severe headache', 'can\'t move', 'paralyzed', 'seizure'
  ];
  
  // MEDIUM RISK keywords
  const mediumRiskKeywords = [
    'pain', 'swelling', 'fever', 'dizzy', 'nausea', 'vomiting',
    'infection', 'pus', 'redness', 'discharge', 'shortness of breath',
    'weak', 'tired', 'headache', 'cough'
  ];

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let riskScore = 20;

  // Check for HIGH risk
  for (const keyword of highRiskKeywords) {
    if (messageLower.includes(keyword)) {
      riskLevel = 'HIGH';
      riskScore = 85;
      break;
    }
  }

  // Check for MEDIUM risk if not HIGH
  if (riskLevel === 'LOW') {
    for (const keyword of mediumRiskKeywords) {
      if (messageLower.includes(keyword)) {
        riskLevel = 'MEDIUM';
        riskScore = 55;
        break;
      }
    }
  }

  console.log(`🔍 Risk analysis: ${riskLevel} (score: ${riskScore}) for message: "${message}"`);

  // Create alert for HIGH or MEDIUM risk
  let alertCreated = false;
  let alertId: string | undefined;

  if (riskLevel === 'HIGH' || riskLevel === 'MEDIUM') {
    const db = getDatabase();
    
    // Try to find patient
    const patient = findPatientByPhone(db, from);
    
    if (patient) {
      alertId = `A-${uuidv4().substring(0, 8)}`;
      
      // Create alert
      db.prepare(`
        INSERT INTO alerts (id, patient_id, severity, status, reason, triage_data, routing_history)
        VALUES (?, ?, ?, 'PENDING', ?, ?, '[]')
      `).run(
        alertId,
        patient.id,
        riskLevel,
        `Patient reported: ${message.substring(0, 100)}`,
        JSON.stringify({
          risk_level: riskLevel,
          risk_score: riskScore,
          patient_message: message,
          ai_response: aiResponse,
          source: 'conversational_analysis'
        })
      );

      console.log(`🚨 Alert created: ${alertId} for ${patient.name}`);

      // Update patient risk status
      db.prepare(`
        UPDATE patients 
        SET risk_status = ?, recovery_score = ?
        WHERE id = ?
      `).run(riskLevel, 100 - riskScore, patient.id);

      // Auto-route the alert
      const routingService = getRoutingService();
      const assignedDoctorId = routingService.autoRouteAlert(alertId, patient.id, riskLevel);

      if (assignedDoctorId) {
        const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(assignedDoctorId);
        console.log(`✅ Alert routed to: ${doctor.name}`);
      }

      alertCreated = true;
    } else {
      console.log(`⚠️  High/Medium risk detected but patient not in database: ${from}`);
    }
  }

  return {
    riskLevel,
    riskScore,
    alertCreated,
    alertId
  };
}

// Singleton instance
let triageServiceInstance: TriageService | null = null;

export function getTriageService(): TriageService {
  if (!triageServiceInstance) {
    triageServiceInstance = new TriageService();
  }
  return triageServiceInstance;
}

export { TriageService };


/**
 * MAIN WEBHOOK PROCESSING FUNCTION
 * Complete demo flow: Receive → AI Analysis → Risk Scoring → Alert Creation → Notifications
 * @param from - Phone number with whatsapp: prefix
 * @param userMessage - Patient's message
 * @returns AI response and processing results
 */
export async function processWhatsAppMessage(
  from: string,
  userMessage: string
): Promise<{
  aiResponse: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  alertCreated: boolean;
  alertId?: string;
  patientName?: string;
}> {
  const { getDatabase } = await import('../db/database');
  const { getGeminiService } = await import('./gemini.service');
  const { getRoutingService } = await import('./routing.service');
  const { sendWhatsAppMessage } = await import('./twilio.service');
  const { v4: uuidv4 } = await import('uuid');

  const db = getDatabase();

  // Remove whatsapp: prefix and normalize phone
  const normalizedPhone = normalizePhoneNumber(from);
  
  console.log(`🔍 Processing message from: ${normalizedPhone}`);
  console.log(`💬 Message: "${userMessage}"`);

  // Find patient in database
  const patient = findPatientByPhone(db, from);

  if (!patient) {
    console.warn(`⚠️  Patient not found for phone: ${normalizedPhone}`);
    
    // Generate AI response for unknown patient
    const geminiService = getGeminiService();
    const aiResponse = await geminiService.generateConversationalResponse(userMessage);
    
    return {
      aiResponse,
      riskLevel: 'LOW',
      riskScore: 20,
      alertCreated: false
    };
  }

  console.log(`✅ Patient found: ${patient.name} (${patient.id})`);

  // STEP 1: Generate AI response using Gemini
  const geminiService = getGeminiService();
  const aiResponse = await geminiService.generateClinicalResponse(
    userMessage,
    patient.surgery_type,
    patient.days_since_surgery
  );

  console.log(`🤖 AI Response generated: "${aiResponse.substring(0, 100)}..."`);

  // STEP 2: Analyze message for risk keywords and calculate risk score
  const { riskLevel, riskScore, keywords } = analyzeRiskKeywords(userMessage);

  console.log(`📊 Risk Analysis:`);
  console.log(`   Level: ${riskLevel}`);
  console.log(`   Score: ${riskScore}`);
  console.log(`   Keywords: ${keywords.join(', ') || 'none'}`);

  // STEP 3: Update patient risk status
  db.prepare(`
    UPDATE patients 
    SET risk_status = ?, recovery_score = ?
    WHERE id = ?
  `).run(riskLevel, 100 - riskScore, patient.id);

  console.log(`✅ Patient risk status updated: ${riskLevel}`);

  let alertCreated = false;
  let alertId: string | undefined;

  // STEP 4: Create alert if risk is HIGH (score >= 70)
  if (riskScore >= 70) {
    alertId = `A-${uuidv4().substring(0, 8)}`;
    
    const triageData = {
      risk_level: riskLevel,
      risk_score: riskScore,
      keywords_detected: keywords,
      patient_message: userMessage,
      ai_response: aiResponse,
      analysis_timestamp: new Date().toISOString()
    };

    // Insert alert into database
    db.prepare(`
      INSERT INTO alerts (
        id, 
        patient_id, 
        severity, 
        status, 
        reason, 
        triage_data, 
        routing_history
      )
      VALUES (?, ?, ?, 'PENDING', ?, ?, '[]')
    `).run(
      alertId,
      patient.id,
      riskLevel,
      `Patient reported: ${userMessage.substring(0, 100)}`,
      JSON.stringify(triageData)
    );

    console.log(`🚨 HIGH RISK ALERT CREATED: ${alertId}`);
    alertCreated = true;

    // STEP 5: Auto-route alert to doctor
    const routingService = getRoutingService();
    const assignedDoctorId = routingService.autoRouteAlert(alertId, patient.id, riskLevel);

    if (assignedDoctorId) {
      const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(assignedDoctorId) as any;
      console.log(`✅ Alert routed to doctor: ${doctor.name}`);

      // STEP 6: Send WhatsApp notification to doctor (non-blocking)
      if (doctor.phone) {
        (async () => {
          try {
            const doctorMessage = `🚨 HIGH RISK ALERT\n\nPatient: ${patient.name}\nSurgery: ${patient.surgery_type}\nDays Post-Op: ${patient.days_since_surgery}\n\nSymptom: ${userMessage}\n\nRisk Score: ${riskScore}\n\nImmediate attention required.\n\nAlert ID: ${alertId}`;
            
            await sendWhatsAppMessage(doctor.phone, doctorMessage);
            console.log(`📱 Doctor notification sent to ${doctor.name}`);
          } catch (error) {
            console.error(`⚠️  Failed to send doctor notification:`, error);
          }
        })();
      }
    } else {
      console.warn(`⚠️  Alert escalated - no available doctors`);
    }

    // STEP 7: Send notification to admin (non-blocking)
    const adminPhone = process.env.ADMIN_PHONE;
    if (adminPhone) {
      (async () => {
        try {
          const adminMessage = `🚨 HIGH RISK ALERT\n\nPatient: ${patient.name}\nPhone: ${patient.phone}\nSurgery: ${patient.surgery_type}\n\nSymptom: ${userMessage}\n\nRisk Score: ${riskScore}\nAlert ID: ${alertId}\n\nCheck dashboard for details.`;
          
          await sendWhatsAppMessage(adminPhone, adminMessage);
          console.log(`📱 Admin notification sent`);
        } catch (error) {
          console.error(`⚠️  Failed to send admin notification:`, error);
        }
      })();
    }
  } else {
    console.log(`ℹ️  Risk level ${riskLevel} (${riskScore}) - No alert created`);
  }

  return {
    aiResponse,
    riskLevel,
    riskScore,
    alertCreated,
    alertId,
    patientName: patient.name
  };
}

/**
 * Analyze message for risk keywords and calculate risk score
 * @param message - Patient's message
 * @returns Risk level, score, and detected keywords
 */
function analyzeRiskKeywords(message: string): {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  keywords: string[];
} {
  const messageLower = message.toLowerCase();
  const detectedKeywords: string[] = [];

  // HIGH RISK keywords (score: 85)
  const highRiskKeywords = [
    'chest pain',
    'severe pain',
    'can\'t breathe',
    'difficulty breathing',
    'breathlessness',
    'fainting',
    'fainted',
    'unconscious',
    'bleeding heavily',
    'severe bleeding',
    'crushing pain',
    'heart attack',
    'stroke',
    'seizure',
    'can\'t move',
    'paralyzed'
  ];

  // MEDIUM RISK keywords (score: 60)
  const mediumRiskKeywords = [
    'pain',
    'dizzy',
    'dizziness',
    'fever',
    'high fever',
    'bleeding',
    'swelling',
    'infection',
    'pus',
    'discharge',
    'nausea',
    'vomiting',
    'shortness of breath',
    'weak',
    'tired',
    'headache',
    'confusion'
  ];

  // Check for HIGH risk
  for (const keyword of highRiskKeywords) {
    if (messageLower.includes(keyword)) {
      detectedKeywords.push(keyword);
    }
  }

  if (detectedKeywords.length > 0) {
    return {
      riskLevel: 'HIGH',
      riskScore: 85,
      keywords: detectedKeywords
    };
  }

  // Check for MEDIUM risk
  for (const keyword of mediumRiskKeywords) {
    if (messageLower.includes(keyword)) {
      detectedKeywords.push(keyword);
    }
  }

  if (detectedKeywords.length > 0) {
    return {
      riskLevel: 'MEDIUM',
      riskScore: 60,
      keywords: detectedKeywords
    };
  }

  // Default to LOW risk
  return {
    riskLevel: 'LOW',
    riskScore: 30,
    keywords: []
  };
}
