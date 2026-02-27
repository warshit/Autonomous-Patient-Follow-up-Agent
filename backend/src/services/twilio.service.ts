import twilio from 'twilio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Send WhatsApp message using Twilio
 * @param to - Recipient phone number (with or without whatsapp: prefix)
 * @param message - Message content to send
 * @returns Twilio message response
 */
export async function sendWhatsAppMessage(to: string, message: string) {
  try {
    // Validate environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !whatsappNumber) {
      throw new Error('Missing required Twilio environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER');
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Format recipient number with whatsapp: prefix if not present
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    // Send WhatsApp message
    const messageResponse = await client.messages.create({
      from: whatsappNumber,
      to: formattedTo,
      body: message,
    });

    console.log(`✅ WhatsApp message sent successfully to ${to}`);
    console.log(`📱 Message SID: ${messageResponse.sid}`);
    console.log(`📊 Status: ${messageResponse.status}`);

    return messageResponse;

  } catch (error) {
    console.error(`❌ Failed to send WhatsApp message to ${to}:`, error);
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Twilio WhatsApp Error: ${error.message}`);
    } else {
      throw new Error(`Unknown error occurred while sending WhatsApp message`);
    }
  }
}

/**
 * Twilio Service Class (Legacy - keeping for backward compatibility)
 */
export class TwilioService {
  private client: twilio.Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials are not configured');
    }

    this.client = twilio(accountSid, authToken);
  }

  /**
   * Send WhatsApp message to patient
   */
  async sendWhatsAppMessage(to: string, message: string): Promise<void> {
    try {
      const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
      
      if (!whatsappNumber) {
        throw new Error('TWILIO_WHATSAPP_NUMBER environment variable is not configured');
      }

      // Ensure phone number has whatsapp: prefix
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
      const result = await this.client.messages.create({
        from: whatsappNumber,
        to: formattedTo,
        body: message,
      });

      console.log(`✅ WhatsApp message sent to ${to}: ${result.sid}`);
    } catch (error) {
      console.error(`❌ Failed to send WhatsApp message to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Validate Twilio webhook signature
   */
  validateWebhookSignature(signature: string, url: string, params: Record<string, any>): boolean {
    const webhookValidation = process.env.TWILIO_WEBHOOK_VALIDATION === 'true';
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!webhookValidation) {
      console.warn('⚠️  Webhook validation is disabled');
      return true;
    }

    if (!authToken) {
      console.error('❌ TWILIO_AUTH_TOKEN not configured for webhook validation');
      return false;
    }

    try {
      return twilio.validateRequest(authToken, signature, url, params);
    } catch (error) {
      console.error('❌ Webhook signature validation failed:', error);
      return false;
    }
  }

  /**
   * Generate TwiML response
   */
  generateTwiMLResponse(message?: string): string {
    const twiml = new twilio.twiml.MessagingResponse();
    
    if (message) {
      twiml.message(message);
    }

    return twiml.toString();
  }
}

// Singleton instance
let twilioService: TwilioService | null = null;

export function getTwilioService(): TwilioService {
  if (!twilioService) {
    twilioService = new TwilioService();
  }
  return twilioService;
}
