import { Router, Request, Response } from 'express';
import { getTriageService } from '../services/triage.service';
import { getRoutingService } from '../services/routing.service';
import { getDatabase } from '../db/database';

const router = Router();

/**
 * POST /triage/analyze
 * Perform AI triage analysis on patient message
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { patient_id, patient_message, create_alert } = req.body;

    // Validation
    if (!patient_id || !patient_message) {
      return res.status(400).json({ error: 'patient_id and patient_message are required' });
    }

    const db = getDatabase();

    // Get patient details
    const patient = db.prepare(`
      SELECT 
        id, name, phone, surgery_type, surgery_date, 
        days_since_surgery, known_risk_factors, assigned_doctor_id
      FROM patients 
      WHERE id = ?
    `).get(patient_id) as any;

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Perform triage analysis
    const triageService = getTriageService();
    const triageResult = await triageService.analyzePatientMessage({
      patient_message,
      surgery_type: patient.surgery_type,
      days_since_surgery: patient.days_since_surgery,
      known_risk_factors: patient.known_risk_factors || undefined,
    });

    // Update patient risk status and recovery score
    const newRecoveryScore = 100 - triageResult.risk_score;
    db.prepare(`
      UPDATE patients 
      SET risk_status = ?, recovery_score = ?, last_check_in = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(triageResult.risk_level, newRecoveryScore, patient_id);

    // Create alert if required and requested
    let alert = null;
    if (triageResult.alert_required && create_alert !== false) {
      const routingService = getRoutingService();
      
      alert = routingService.createAlert({
        patient_id: patient.id,
        patient_name: patient.name,
        patient_phone: patient.phone,
        reason: triageResult.clinical_reasoning,
        severity: triageResult.risk_level,
        triage_data: triageResult,
        assigned_doctor_id: patient.assigned_doctor_id,
      });

      console.log(`🚨 Alert created: ${alert.id} for patient ${patient.name} (${triageResult.risk_level} risk)`);
    }

    res.json({
      triage: triageResult,
      alert: alert,
      patient_updated: {
        risk_status: triageResult.risk_level,
        recovery_score: newRecoveryScore,
      },
    });
  } catch (error) {
    console.error('Error performing triage:', error);
    res.status(500).json({ 
      error: 'Failed to perform triage analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /triage/batch
 * Perform triage on multiple patients (for daily check-ins)
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { analyses } = req.body;

    if (!Array.isArray(analyses) || analyses.length === 0) {
      return res.status(400).json({ error: 'analyses array is required' });
    }

    const triageService = getTriageService();
    const results = [];

    for (const item of analyses) {
      try {
        const { patient_id, patient_message } = item;
        
        if (!patient_id || !patient_message) {
          results.push({
            patient_id,
            success: false,
            error: 'Missing patient_id or patient_message',
          });
          continue;
        }

        const db = getDatabase();
        const patient = db.prepare(`
          SELECT 
            id, name, phone, surgery_type, surgery_date, 
            days_since_surgery, known_risk_factors, assigned_doctor_id
          FROM patients 
          WHERE id = ?
        `).get(patient_id) as any;

        if (!patient) {
          results.push({
            patient_id,
            success: false,
            error: 'Patient not found',
          });
          continue;
        }

        const triageResult = await triageService.analyzePatientMessage({
          patient_message,
          surgery_type: patient.surgery_type,
          days_since_surgery: patient.days_since_surgery,
          known_risk_factors: patient.known_risk_factors || undefined,
        });

        const newRecoveryScore = 100 - triageResult.risk_score;
        db.prepare(`
          UPDATE patients 
          SET risk_status = ?, recovery_score = ?, last_check_in = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(triageResult.risk_level, newRecoveryScore, patient_id);

        let alert = null;
        if (triageResult.alert_required) {
          const routingService = getRoutingService();
          alert = routingService.createAlert({
            patient_id: patient.id,
            patient_name: patient.name,
            patient_phone: patient.phone,
            reason: triageResult.clinical_reasoning,
            severity: triageResult.risk_level,
            triage_data: triageResult,
            assigned_doctor_id: patient.assigned_doctor_id,
          });
        }

        results.push({
          patient_id,
          success: true,
          triage: triageResult,
          alert_created: !!alert,
          alert_id: alert?.id,
        });
      } catch (error) {
        results.push({
          patient_id: item.patient_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const alertCount = results.filter(r => r.success && r.alert_created).length;

    res.json({
      total: analyses.length,
      successful: successCount,
      failed: analyses.length - successCount,
      alerts_created: alertCount,
      results,
    });
  } catch (error) {
    console.error('Error performing batch triage:', error);
    res.status(500).json({ error: 'Failed to perform batch triage' });
  }
});

/**
 * GET /triage/test
 * Test endpoint for triage system
 */
router.get('/test', (req: Request, res: Response) => {
  res.json({
    message: 'Triage API is operational',
    endpoints: {
      analyze: 'POST /api/triage/analyze',
      batch: 'POST /api/triage/batch',
    },
  });
});

export default router;
