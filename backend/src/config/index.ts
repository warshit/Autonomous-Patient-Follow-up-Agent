import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databasePath: process.env.DATABASE_PATH || path.join(__dirname, '../../data/healthguard.db'),
  
  // Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  
  // Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
    webhookValidation: process.env.TWILIO_WEBHOOK_VALIDATION === 'true',
  },
  
  // AI Configuration Defaults
  ai: {
    lowThreshold: parseInt(process.env.AI_LOW_THRESHOLD || '39', 10),
    mediumThreshold: parseInt(process.env.AI_MEDIUM_THRESHOLD || '69', 10),
    autoEscalationMinutes: parseInt(process.env.AUTO_ESCALATION_MINUTES || '15', 10),
  },
};

// Validate critical configuration
export function validateConfig(): void {
  const errors: string[] = [];
  
  if (!config.geminiApiKey) {
    errors.push('GEMINI_API_KEY is required');
  }
  
  if (!config.twilio.accountSid) {
    errors.push('TWILIO_ACCOUNT_SID is required');
  }
  
  if (!config.twilio.authToken) {
    errors.push('TWILIO_AUTH_TOKEN is required');
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    if (config.nodeEnv === 'production') {
      throw new Error('Invalid configuration for production environment');
    } else {
      console.warn('⚠️  Running with incomplete configuration (development mode)');
    }
  }
}
