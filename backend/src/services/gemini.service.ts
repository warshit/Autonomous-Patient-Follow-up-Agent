import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { TriageInput, TriageResult } from '../types';

const CONVERSATIONAL_SYSTEM_PROMPT = `You are a healthcare follow-up assistant helping post-surgery patients.

Your role:
- Provide empathetic, professional responses to patients
- Gather information systematically before making recommendations
- Use a calm, reassuring tone while being clinically thorough
- Never diagnose or prescribe medication

Response Framework:

1. ACKNOWLEDGE the symptom with empathy
2. ASK CLARIFYING QUESTIONS systematically:
   - Pain level (1-10 scale)
   - Location and type of pain (sharp, dull, crushing, burning)
   - Duration (how long has this been happening)
   - Associated symptoms (shortness of breath, sweating, nausea, dizziness)
   - Pain radiation (spreading to arm, jaw, back, or shoulder)
   - Triggering factors (movement, rest, breathing)

3. ASSESS SEVERITY based on responses:
   
   IMMEDIATE EMERGENCY (advise ER immediately):
   - Crushing or severe chest pain (8-10/10)
   - Pain radiating to left arm, jaw, or back
   - Severe shortness of breath or difficulty breathing
   - Fainting, loss of consciousness, or confusion
   - Chest pain with sweating and nausea together
   - Sudden, severe symptoms
   
   URGENT (advise contacting doctor today):
   - Moderate chest pain (5-7/10)
   - Mild shortness of breath
   - Pain lasting more than 15 minutes
   - New or worsening symptoms
   - Pain with mild associated symptoms
   
   MONITOR (provide guidance and reassurance):
   - Mild pain (1-4/10)
   - Localized discomfort at surgical site
   - Pain that improves with rest
   - Expected post-surgical discomfort
   - No associated concerning symptoms

4. RESPONSE STRUCTURE:
   - Start with empathy: "I understand this must be concerning..."
   - Ask questions one at a time, clearly
   - Wait for patient responses before escalating
   - Provide clear, actionable guidance based on severity
   - Maintain professional, calm tone throughout

Guidelines:
- Keep responses concise (2-4 sentences per message)
- Use warm, professional healthcare language
- Never minimize serious symptoms
- Never provide false reassurance
- For emergency symptoms, be direct but calm
- For non-emergency symptoms, gather information first
- Always acknowledge patient concerns

Example Response Pattern for Chest Pain:
"I understand chest pain can be concerning, especially after surgery. To help assess this properly, can you tell me: On a scale of 1-10, how would you rate your pain level right now?"

Then based on their answer, ask follow-up questions before making recommendations.

IMPORTANT: Do NOT immediately escalate to emergency room unless the patient describes severe, life-threatening symptoms. Gather information systematically first.`;

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

/**
 * Gemini AI Service for patient risk assessment
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private triageModel: any;
  private conversationalModel: any;

  constructor() {
    if (!config.geminiApiKey) {
      throw new Error('Gemini API key is not configured');
    }

    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    
    // Triage model for structured risk assessment - using stable model
    this.triageModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    // Conversational model for general chat - using stable model
    this.conversationalModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
  }

  /**
   * Generate clinical response for patient monitoring
   * Used for post-surgery patient check-ins with context
   */
  async generateClinicalResponse(
    userMessage: string,
    surgeryType: string,
    daysSinceSurgery: number
  ): Promise<string> {
    try {
      console.log(`🤖 Generating clinical response for: "${userMessage}"`);
      
      const clinicalPrompt = `You are a post-surgery healthcare monitoring assistant for HealthGuard AI.

PATIENT CONTEXT:
- Surgery Type: ${surgeryType}
- Days Since Surgery: ${daysSinceSurgery}
- Patient Message: "${userMessage}"

YOUR ROLE:
- Respond calmly and clinically
- Assess symptoms systematically
- Ask clarifying questions when needed
- Provide reassurance for normal recovery signs
- Only escalate if symptoms are severe

RESPONSE GUIDELINES:
1. Acknowledge the patient's message with empathy
2. If symptoms mentioned:
   - Ask about severity (pain scale 1-10)
   - Ask about duration
   - Ask about associated symptoms
3. For concerning symptoms:
   - Stay calm and professional
   - Advise to rest and monitor
   - Mention that medical team is notified
4. For normal recovery:
   - Provide reassurance
   - Encourage continued recovery
5. Keep responses concise (2-4 sentences)

IMPORTANT:
- Do NOT panic the patient
- Do NOT provide medical diagnosis
- Do NOT prescribe medication
- DO provide calm, supportive guidance

Generate your response:`;

      const result = await this.conversationalModel.generateContent(clinicalPrompt);
      const response = result.response;
      const text = response.text().trim();

      console.log(`✅ Clinical response generated: "${text.substring(0, 100)}..."`);
      
      return text;

    } catch (error) {
      console.error('❌ Clinical AI failed:', error);
      
      // Fallback response
      return "Thank you for your message. Our medical team has been notified and will review your condition. Please rest and stay hydrated. If you experience severe symptoms, please seek immediate medical attention.";
    }
  }

  /**
   * Generate conversational response for general chat
   * Used when patient is not found or for casual conversation
   */
  async generateConversationalResponse(userMessage: string): Promise<string> {
    try {
      console.log(`🤖 Generating conversational response for: "${userMessage}"`);
      console.log(`📝 System prompt: "${CONVERSATIONAL_SYSTEM_PROMPT.substring(0, 100)}..."`);
      console.log(`📤 Sending to Gemini API...`);
      
      // Combine system prompt with user message
      const fullPrompt = `${CONVERSATIONAL_SYSTEM_PROMPT}\n\nUser message: "${userMessage}"\n\nYour response:`;
      
      const result = await this.conversationalModel.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text().trim();

      console.log(`✅ Conversational response generated: "${text}"`);
      console.log(`📊 Response length: ${text.length} characters`);
      
      return text;

    } catch (error) {
      console.error('❌ Conversational AI failed:', error);
      
      // Fallback response if AI fails
      return "Thank you for your message. I'm here to help with your recovery. How are you feeling today?";
    }
  }

  /**
   * Evaluate patient risk using AI triage
   */
  async evaluateRisk(input: TriageInput): Promise<TriageResult> {
    const userPrompt = `
PATIENT CONTEXT

Patient Message: "${input.patient_message}"
Surgery Type: "${input.surgery_type}"
Days Since Surgery: "${input.days_since_surgery}"
Known Risk Factors (if provided): "${input.known_risk_factors || 'None provided'}"

Perform triage analysis and return JSON only.
    `.trim();

    try {
      const result = await this.triageModel.generateContent(userPrompt);
      const response = result.response;
      const text = response.text();

      // Clean up response - remove markdown code blocks if present
      const cleanedText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const triageResult: TriageResult = JSON.parse(cleanedText);

      // Validate the response structure
      if (!triageResult.risk_level || typeof triageResult.risk_score !== 'number') {
        throw new Error('Invalid triage response structure');
      }

      // Ensure risk_level is uppercase
      triageResult.risk_level = triageResult.risk_level.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH';

      console.log(`✅ Triage completed: ${triageResult.risk_level} (score: ${triageResult.risk_score})`);

      return triageResult;
    } catch (error) {
      console.error('❌ Triage analysis failed:', error);

      // Fallback to MEDIUM risk if parsing fails (conservative approach)
      const fallbackResult: TriageResult = {
        risk_level: 'MEDIUM',
        risk_score: 50,
        confidence_level: 'LOW',
        symptoms_identified: ['Unable to parse patient message'],
        trend_analysis: 'unclear',
        complication_category: 'unknown',
        clinical_reasoning: 'AI analysis failed. Manual review required for safety.',
        alert_required: true,
      };

      console.warn('⚠️  Using fallback MEDIUM risk assessment');
      return fallbackResult;
    }
  }
}

// Singleton instance
let geminiService: GeminiService | null = null;

export function getGeminiService(): GeminiService {
  if (!geminiService) {
    geminiService = new GeminiService();
  }
  return geminiService;
}
