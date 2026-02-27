import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { Patient } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * GET /patients
 * Get all patients
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    
    const patients = db.prepare(`
      SELECT 
        p.*,
        d.name as doctor_name
      FROM patients p
      LEFT JOIN doctors d ON p.assigned_doctor_id = d.id
      ORDER BY p.created_at DESC
    `).all();

    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

/**
 * GET /patients/:id
 * Get patient by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const patient = db.prepare(`
      SELECT 
        p.*,
        d.name as doctor_name,
        d.id as doctor_id
      FROM patients p
      LEFT JOIN doctors d ON p.assigned_doctor_id = d.id
      WHERE p.id = ?
    `).get(id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get patient's alerts
    const alerts = db.prepare(`
      SELECT 
        a.*,
        d.name as assigned_doctor_name
      FROM alerts a
      LEFT JOIN doctors d ON a.assigned_doctor_id = d.id
      WHERE a.patient_id = ?
      ORDER BY a.created_at DESC
    `).all(id);

    res.json({
      ...patient,
      alerts,
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

/**
 * POST /patients
 * Create new patient and send WhatsApp check-in message
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone, surgery_type, surgery_date, assigned_doctor_id, known_risk_factors } = req.body;

    // Validation
    if (!name || !phone || !surgery_type || !surgery_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDatabase();

    // Check if phone already exists
    const existing = db.prepare('SELECT id FROM patients WHERE phone = ?').get(phone);
    if (existing) {
      return res.status(409).json({ error: 'Patient with this phone number already exists' });
    }

    // Calculate days since surgery
    const surgeryDateObj = new Date(surgery_date);
    const today = new Date();
    const daysSinceSurgery = Math.floor((today.getTime() - surgeryDateObj.getTime()) / (1000 * 60 * 60 * 24));

    const patientId = `P-${uuidv4().substring(0, 8)}`;

    // Insert patient into database
    db.prepare(`
      INSERT INTO patients (
        id, name, phone, surgery_type, surgery_date, days_since_surgery, 
        recovery_score, risk_status, assigned_doctor_id, known_risk_factors
      )
      VALUES (?, ?, ?, ?, ?, ?, 100, 'LOW', ?, ?)
    `).run(
      patientId,
      name,
      phone,
      surgery_type,
      surgery_date,
      daysSinceSurgery,
      assigned_doctor_id || null,
      known_risk_factors || null
    );

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);

    console.log(`✅ Patient created: ${name} (${patientId})`);

    // Send WhatsApp check-in message (non-blocking)
    // Format phone number with whatsapp: prefix
    const formattedPhone = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
    
    const welcomeMessage = `Hello ${name}, this is HealthGuard AI.\n\nHow are you feeling today after your ${surgery_type}?\n\nPlease reply with any symptoms or concerns you may have. We're here to monitor your recovery.`;

    // Send message asynchronously without blocking response
    (async () => {
      try {
        const { sendWhatsAppMessage } = await import('../services/twilio.service');
        await sendWhatsAppMessage(formattedPhone, welcomeMessage);
        console.log(`📱 WhatsApp check-in sent to ${name} (${phone})`);
      } catch (twilioError) {
        console.error(`⚠️  Failed to send WhatsApp to ${name}:`, twilioError);
        // Don't fail the API request if WhatsApp fails
      }
    })();

    // Return success immediately (don't wait for WhatsApp)
    res.status(201).json({
      ...patient,
      message: 'Patient created successfully. WhatsApp check-in message sent.'
    });

  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

/**
 * PATCH /patients/:id
 * Update patient
 */
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const db = getDatabase();

    // Check if patient exists
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Build dynamic update query
    const allowedFields = [
      'name', 'phone', 'surgery_type', 'surgery_date', 'days_since_surgery',
      'recovery_score', 'risk_status', 'assigned_doctor_id', 'known_risk_factors'
    ];

    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);

    db.prepare(`UPDATE patients SET ${setClause} WHERE id = ?`).run(...values, id);

    const updatedPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);

    console.log(`✅ Patient updated: ${id}`);
    res.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

/**
 * DELETE /patients/:id
 * Delete patient
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    db.prepare('DELETE FROM patients WHERE id = ?').run(id);

    console.log(`✅ Patient deleted: ${id}`);
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

/**
 * POST /patients/:id/send-message
 * Send manual WhatsApp message to patient
 */
router.post('/:id/send-message', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Validation
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const db = getDatabase();

    // Fetch patient by ID
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id) as any;

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    console.log(`📱 Sending manual WhatsApp message to ${patient.name} (${patient.phone})`);

    // Format phone number with whatsapp: prefix
    const formattedPhone = patient.phone.startsWith('whatsapp:') 
      ? patient.phone 
      : `whatsapp:${patient.phone}`;

    // Send WhatsApp message asynchronously (non-blocking)
    (async () => {
      try {
        const { sendWhatsAppMessage } = await import('../services/twilio.service');
        await sendWhatsAppMessage(formattedPhone, message);
        console.log(`✅ Manual WhatsApp message sent to ${patient.name}`);
      } catch (twilioError) {
        console.error(`❌ Failed to send WhatsApp to ${patient.name}:`, twilioError);
        // Don't fail the API request if WhatsApp fails
      }
    })();

    // Return success immediately (don't wait for WhatsApp)
    res.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      patient: {
        id: patient.id,
        name: patient.name,
        phone: patient.phone
      }
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ error: 'Failed to send WhatsApp message' });
  }
});

export default router;
