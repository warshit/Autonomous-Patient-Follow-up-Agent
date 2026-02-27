import { Router, Request, Response } from 'express';
import { processTriage } from '../services/triage.service';
import { getTwilioService } from '../services/twilio.service';
import { getGeminiService } from '../services/gemini.service';

const router = Router();

/**
 * Generate safe fallback TwiML response
 */
function generateFallbackTwiML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thank you for your message. Our system is reviewing your condition.</Message>
</Response>`;
}

/**
 * Generate error TwiML response
 */
function generateErrorTwiML(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${message}</Message>
</Response>`;
}

/**
 * GET /webhook/test
 * Test endpoint to verify webhook is accessible
 */
router.get('/test', (req: Request, res: Response) => {
  res.json({ 
    status: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    message: 'POST to /api/webhook/whatsapp to receive WhatsApp messages'
  });
});

/**
 * POST /webhook/whatsapp
 * Twilio WhatsApp webhook handler
 * ALWAYS returns HTTP 200 with valid TwiML XML
 * Complete demo flow: Receive → Analyze → Create Alert → Notify → Respond
 */
router.post('/whatsapp', async (req: Request, res: Response) => {
  // Set Content-Type immediately to ensure proper response format
  res.type('text/xml');

  try {
    console.log('🔔 Webhook received');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

    // Extract required fields from Twilio webhook
    const { From, Body, MessageSid } = req.body;

    console.log(`📱 Extracted From: "${From}"`);
    console.log(`📱 Extracted Body: "${Body}"`);
    console.log(`📱 Extracted MessageSid: "${MessageSid}"`);

    // Validate required fields
    if (!From || !Body) {
      console.error('❌ Missing required fields: From or Body');
      const errorTwiML = generateErrorTwiML('Invalid message format. Please try again.');
      return res.status(200).send(errorTwiML);
    }

    console.log(`📱 Received WhatsApp message from ${From}: "${Body}"`);

    // Validate Twilio signature (skip in development mode)
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Development mode: Skipping Twilio signature validation');
    } else {
      try {
        const twilioService = getTwilioService();
        const signature = req.headers['x-twilio-signature'] as string;
        const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        
        if (!signature) {
          console.error('❌ Missing Twilio signature header');
          const errorTwiML = generateErrorTwiML('Authentication failed. Please contact support.');
          return res.status(200).send(errorTwiML);
        }
        
        if (!twilioService.validateWebhookSignature(signature, url, req.body)) {
          console.error('❌ Invalid Twilio signature');
          const errorTwiML = generateErrorTwiML('Authentication failed. Please contact support.');
          return res.status(200).send(errorTwiML);
        }
        
        console.log('✅ Twilio signature validated successfully');
      } catch (signatureError) {
        console.error('❌ Signature validation error:', signatureError);
        console.warn('⚠️  Continuing despite signature validation error');
      }
    }

    // Process the message through triage service
    let responseMessage: string;

    try {
      // Import triage service
      const { processWhatsAppMessage } = await import('../services/triage.service');
      
      // Process message: AI analysis + risk scoring + alert creation + notifications
      const result = await processWhatsAppMessage(From, Body);
      
      responseMessage = result.aiResponse;
      
      console.log(`✅ Message processed successfully`);
      console.log(`🤖 Risk Level: ${result.riskLevel}`);
      console.log(`📊 Risk Score: ${result.riskScore}`);
      console.log(`🚨 Alert Created: ${result.alertCreated}`);
      
      if (result.alertId) {
        console.log(`🆔 Alert ID: ${result.alertId}`);
      }

    } catch (processingError: any) {
      console.error('❌ Message processing failed:', processingError);
      
      // Fallback response if processing fails
      responseMessage = "Thank you for your message. Our healthcare team has been notified and will review your condition shortly. If you're experiencing a medical emergency, please call emergency services immediately.";
    }

    // Generate TwiML XML response
    try {
      const twilioService = getTwilioService();
      const twiml = twilioService.generateTwiMLResponse(responseMessage);

      console.log(`✅ Webhook processed successfully`);
      console.log(`📤 Sending response: "${responseMessage}"`);
      
      // Return HTTP 200 with TwiML
      return res.status(200).send(twiml);

    } catch (responseError) {
      console.error('❌ Error generating TwiML response:', responseError);
      const fallbackTwiML = generateFallbackTwiML();
      return res.status(200).send(fallbackTwiML);
    }

  } catch (error: any) {
    // Catch-all error handler - ensures we ALWAYS return HTTP 200 with valid TwiML
    console.error('❌ Critical webhook error:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // Return safe fallback TwiML with HTTP 200
    const fallbackTwiML = generateFallbackTwiML();
    return res.status(200).send(fallbackTwiML);
  }
});

/**
 * Error handler for unhandled promise rejections in this router
 */
router.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('❌ Unhandled error in webhook router:', err);
  
  // Ensure Content-Type is set
  res.type('text/xml');
  
  // Return safe fallback TwiML with HTTP 200
  const fallbackTwiML = generateFallbackTwiML();
  return res.status(200).send(fallbackTwiML);
});

export default router;
